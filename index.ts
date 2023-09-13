import { createHash } from "node:crypto";
import { Player } from './src/Player';
import { Response, BAD_REQUEST, OK, UNAUTHORIZED } from './src/Response';
import Room from './src/Room';

import express from 'express';
import { Vector3 } from "@babylonjs/core";

const ALLOW_ACCESS_ORIGINS = ['http://localhost:5173', 'https://gdsc0301.github.io'];

const app = express();

export const PORT = parseInt(process.env.PORT || '8080');
export const BasicHeaders = {
    "Content-Type": "application/json",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": ["POST", "GET"],
    "Access-Control-Allow-Credentials": "true"
};

const rooms: {[ID: string]: Room} = {};
const players: {[username: string]: Player} = {};

const assign_room_for = (playerUsername: string): Room | false => {
    if(Object.keys(rooms).length === 0) { // If ther's no room, create a new one;
        const new_room = new Room(createHash('sha256').update(Date.now().toString()).digest('hex'));
        players[playerUsername].setRoomID(new_room.ID);

        new_room.add_player(players[playerUsername]);

        rooms[new_room.ID] = new_room;
        return rooms[new_room.ID];
    }

    // If there are rooms, check for an available one.
    for(const room_id in rooms) {
        if(rooms[room_id].is_full) continue;

        rooms[room_id].add_player(players[playerUsername]);

        players[playerUsername].setRoomID(room_id);
        return rooms[room_id];
    }

    // In last case, it just creates a new room.
    const new_room = new Room(createHash('sha256').update(Date.now().toString()).digest('hex'));
    players[playerUsername].setRoomID(new_room.ID);
    new_room.add_player(players[playerUsername]);

    rooms[new_room.ID] = new_room;
    return rooms[new_room.ID];
}

const room_exist = (room_id: string): boolean => {
    return Object.keys(rooms).indexOf(room_id) !== -1;
}

const get_headers = (origin: string) => {
    if(ALLOW_ACCESS_ORIGINS.indexOf(origin) === -1) {
        return BasicHeaders;
    }else {
        return {
            ...BasicHeaders,
            ...{"Access-Control-Allow-Origin": origin}
        };
    }
}

app.use((req, res, next) => {
    if(req.query['room_id'] && !room_exist(req.query['room_id'].toString())) {
        res.set(get_headers(req.headers.origin || ''));
        res.status(BAD_REQUEST).json((new Response({}, BAD_REQUEST, 'Invalid room ID')));
        return;
    }
    next();
});

app.use(express.text());

app.get('/', (req, res) => {
    res.set(get_headers(req.headers.origin || ''));
    res.end('This is the BMGP server');
});

app.get('/login', (req, res) => {
    const player_email = req.query['player_email']+'';
    players[player_email] = new Player(player_email);

    const new_player_room = assign_room_for(player_email);

    const body = new Response(new_player_room);    
    res.set(get_headers(req.headers.origin || ''));
    res.status(OK).json(body);

    console.log('New player: ', players[player_email], new_player_room);
    return;
});

app.get('/room', (req, res) => {
    const origin = req.headers.origin || '';
    const player_email = req.query['player_email'] + '';

    const response = new Response();
    if(!players[player_email]) {
        console.error('Player not logged in.');

        response.error = "Player not logged in.";
        response.status = BAD_REQUEST;
        res.set(get_headers(origin));
        res.status(BAD_REQUEST).json(response);
        return;
    }
    
    response.data = rooms[players[player_email].currentRoomID];

    res.set(get_headers(origin));
    res.status(OK).json(response);
    
    return;
});

app.post('/player_update', (req, res) => {
    const origin = req.headers.origin || '';
    const player_email = req.query['player_email']+'';
    
    if(!players[player_email]) {
        console.error('Player not logged in.');

        res.set(get_headers(origin));
        res.status(BAD_REQUEST).json((new Response({}, BAD_REQUEST, 'Player not logged in.')));
        return;
    }

    let response = new Response();

    const body = JSON.parse(req.body);
    const updateData = body.params;
    if(!updateData) {
        response = new Response({}, BAD_REQUEST, 'Invalid player data');
        res.set(get_headers(origin));
        res.status(BAD_REQUEST).json(response);
        return;
    }
    
    const newPos = new Vector3(updateData.position._x, updateData.position._y, 0);
    const newRot = new Vector3(updateData.rotation._x, updateData.rotation._y, updateData.rotation._z);
    players[player_email].update(newPos, newRot);
    
    res.set(get_headers(origin));
    res.status(OK).json(response);
    return;
});

app.get('/logout', (req, res) => {
    const origin = req.headers.origin || '';
    const player_email = req.query['player_email']+'';

    if(!players[player_email]) {
        console.error('Player not logged in.');

        res.set(get_headers(origin));
        res.status(BAD_REQUEST).json((new Response({}, BAD_REQUEST, 'Player not logged in.')));
        return;
    }

    const room_id = players[player_email].currentRoomID;
    rooms[room_id].remove_player(player_email);
    delete players[player_email];

    res.set(get_headers(origin));
    res.end();
    return;
});

app.listen(PORT, () => console.log('Listening at: http://localhost:' + PORT));