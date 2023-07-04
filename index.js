import { createHash } from "node:crypto";
import { Player } from './src/Player.js';
import { Response, BAD_REQUEST, OK, UNAUTHORIZED } from './src/Response.js';
import Room from './src/Room.js';

import express from 'express';

const ALLOW_ACCESS_ORIGINS = ['http://localhost:5173', 'https://gdsc0301.github.io/best-multiplayer-game-possible'];

const app = express();

const PORT = parseInt(process.env.PORT) || 8080;
const BasicHeaders = {
    "Content-Type": "application/json",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": ["POST", "GET"],
    "Access-Control-Allow-Credentials": "true"
};

/** @type {Object.<string, Room>} */
const rooms = {};

/**
 * @param {Player} player 
 * @returns {Room} The room with the player
 */
const assign_room_for = player => {
    if(Object.keys(rooms).length === 0) { // If ther's no room, create a new one;
        const new_room = new Room(createHash('sha256').update(Date.now().toString()).digest('hex'));
        player.setRoomID(new_room.ID);

        new_room.add_player(player) ? undefined : console.error('Invalid player', player);

        rooms[new_room.ID] = new_room;
        return rooms[new_room.ID];
    }

    // If there are rooms, check for an available one.
    for(const room_id in rooms) {
        if(rooms[room_id].is_full) continue;

        if(rooms[room_id].add_player(player)){
            player.setRoomID(room_id);
            return rooms[room_id];
        }
    }

    // In last case, it just creates a new room.
    const new_room = new Room(createHash('sha256').update(Date.now().toString()).digest('hex'));
    player.setRoomID(new_room.ID);
    new_room.add_player(player);

    rooms[new_room.ID] = new_room;
    return rooms[new_room.ID];
}

/**
 * @param {String} room_id Room ID to check it out.
 * @returns {boolean}
 */
const room_exist = (room_id) => {
    return !(Object.keys(rooms).indexOf === room_id);
}

const get_headers = (origin) => {
    console.log(origin, ALLOW_ACCESS_ORIGINS.indexOf(origin));
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
    if(req.query['room_id'] && !room_exist(req.query['room_id'])) {
        res.set(get_headers(req.headers.origin));
        res.status(BAD_REQUEST).json((new Response({}, BAD_REQUEST, 'Invalid room ID')));
        return;
    }
    next();
});

app.use(express.text());

app.get('/', (req, res) => {
    res.set(get_headers(req.headers.origin));
    res.end('This is the BMGP server');
});

app.get('/login', (req, res) => {
    const player_email = req.query['player_email'];

    const new_player = new Player(player_email);
    const new_player_room = assign_room_for(new_player);

    res.set(get_headers(req.headers.origin));
    res.status(OK).json((new Response(new_player_room)));
    return;
});

app.get('/room', (req, res) => {
    const player_email = req.query['player_email'];
    const room_id = req.query['room_id'];

    const response = new Response();
    const player_is_here = rooms[room_id].player_is_here(player_email);
    
    if(player_is_here) {
        response.data = rooms[room_id];
    }else {
        response.error = "Not logged in or internal error.";
        response.status = UNAUTHORIZED;
    }

    res.set(get_headers(req.headers.origin));
    res.status(OK).json(response);
    return;
});

app.post('/player_update', (req, res) => {
    const player_email = req.query['player_email'];
    const room_id = req.query['room_id'];

    let response = undefined;
    const body = JSON.parse(req.body);
    if(!body) {
        response = new Response(req.body, BAD_REQUEST, 'Invalid player data')
        res.set(get_headers(req.headers.origin));
        res.status(BAD_REQUEST).json(response);
        return;
    }else {
        res.set(get_headers(req.headers.origin));
    }

    const targetPlayer = rooms[room_id].get_player(player_email);
    if(targetPlayer)
        targetPlayer.setPosition(body.params.x, body.params.y);
    else
        response = (new Response({}, BAD_REQUEST, 'Invalid player email'));
    
    res.status(OK).json(response);
    return;
});

app.get('/logout', (req, res) => {
    const player_email = req.query['player_email'];
    const room_id = req.query['room_id'];

    rooms[room_id]?.remove_player(player_email);

    res.set(get_headers(req.headers.origin));
    res.end();
    return;
});

app.listen(PORT, () => console.log('Listening at: http://localhost:' + PORT));