import { createHash } from "node:crypto";
import { Player } from '../src/Player.js';
import { Response, BAD_REQUEST, OK, UNAUTHORIZED } from './src/Response.js';
import Room from '../src/Room.js';

import express from 'express';

const app = express();

const PORT = parseInt(process.env.PORT) || 6600;
const BasicHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": '*'
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

const get_headers = (content_type) => {
    return {
        ...BasicHeaders,
        ...{"Content-Type": content_type}
    };
}

app.use((req, res, next) => {
    console.log(req.params);
    if(!room_exist(req.params['room_id'])) {
        res.writeHead(OK, BasicHeaders);
        res.end((new Response({}, BAD_REQUEST, 'Invalid room ID')));
        return;
    }
    next();
});

app.get('/', (req, res) => {
    res.writeHead(OK, BasicHeaders);
    res.end('This is the BMGP server');
});

app.get('/login', (req, res) => {
    const player_email = req.params['player_email'];

    const new_player = new Player(player_email);
    const new_player_room = assign_room_for(new_player);

    res.writeHead(OK, BasicHeaders);
    res.end((new Response(new_player_room)).toString);
    return;
});

app.get('/room', (req, res) => {
    const player_email = req.params['player_email'];
    const room_id = req.params['room_id'];

    const response = new Response();
    const player_is_here = rooms[room_id].player_is_here(player_email);
    
    if(player_is_here) {
        response.data = rooms[room_id];
    }else {
        response.error = "Not logged in or internal error.";
        response.status = UNAUTHORIZED;
    }

    res.writeHead(OK, BasicHeaders);
    res.end(response.toString);
    return;
});

app.post('/player_update', (req, res) => {
    const player_email = req.params['player_email'];
    const room_id = req.params['room_id'];

    const body = req.body;
    if(!body) return;
    let response = undefined;

    const targetPlayer = rooms[room_id].get_player(player_email);
    if(targetPlayer)
        targetPlayer.setPosition(body.params.x, body.params.y);
    else
        response = (new Response({}, BAD_REQUEST, 'Invalid player email')).toString;
    
    res.writeHead(OK, BasicHeaders);
    res.end(response);
    return;
});

app.get('/logout', (req, res) => {
    const player_email = req.params['player_email'];
    const room_id = req.params['room_id'];

    rooms[room_id].remove_player(player_email);

    res.writeHead(OK, BasicHeaders);
    res.end();
    return;
});

app.listen(PORT, () => console.log('Listening at: http://localhost:' + PORT));