import { IncomingMessage, createServer } from "node:http";
import { createHash } from "node:crypto";
import { Player } from '../src/Player.js';
import { Response, BAD_REQUEST, OK, UNAUTHORIZED, INTERNAL_ERROR, NOT_FOUND } from './src/Response.js';
import Room from '../src/Room.js';

import * as fs from 'node:fs';
import * as path from 'node:path';
import { URL } from "node:url";

const base_dir = path.resolve('../dist');
const PORT = parseInt(process.env.PORT) || 6600;
const BasicHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Vary": "Origin"
};

/** @type {Object.<string, Room>} */
const rooms = {};

/**
 * @param {Player} player 
 * @returns {String} The room ID
 */
const get_free_room_for = player => {
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

/**
 * @param {String} path 
 * @param {CallableFunction} callback 
 * @param {IncomingMessage} req 
 * @param {'GET'|'POST'} method
 */
const route = (target_path, callback, req, method = 'GET') => {
    const req_url = new URL(`http://${req.headers.host}${req.url}`);

    if(req_url.pathname === target_path && req.method === method) {
        if(method === 'POST') {
            let body = "";
            try {
                // Listen for data event
                req.on("readable", () => {
                    const newValue = req.read() ?? '';
                    body += newValue;
                });
        
                // Listen for end event
                req.on("end", () => {
                    body = JSON.parse(body);
                    callback(req_url.searchParams, body);
                });
            } catch (error) {
                console.error('ERROR:', error);
            }
        }

        return callback(req_url.searchParams);
    }
}

const get_headers = (content_type) => {
    return {
        ...BasicHeaders,
        ...{"Content-Type": content_type}
    };
}

const server = createServer(async (req, res) => {
    console.log(req.headers);
    const req_url = new URL(`http://${req.headers.host}${req.url}`);

    const player_email = req_url.searchParams.get('player_email');
    const room_id = req_url.searchParams.get('room_id');

    if(!room_exist(room_id)) {
        res.writeHead(OK, BasicHeaders);
        res.end((new Response({}, BAD_REQUEST, 'Invalid room ID')));
        return;
    }

    route('/', () => {
        const filename = req_url.pathname === '/' ? '/index.html' : req_url.pathname;

        try {
            const fs_path = base_dir + path.normalize(filename);
            
            const file_stream = fs.createReadStream(fs_path);
            file_stream.pipe(res);
            file_stream.on('open', () => {
                res.writeHead(OK, get_headers('text/html'));
            });
            file_stream.on('error', err => {
                res.writeHead(NOT_FOUND, get_headers('text/html'));
                res.write(err.message);
                res.end();
            });
        } catch(err) {
            console.error(err);
            res.writeHead(NOT_FOUND, get_headers('text/html'));
            res.write(err.message);
            res.end();
        }
    }, req);

    route('/login', () => {
        const new_player = new Player(player_email);
        const new_player_room = get_free_room_for(new_player);

        res.writeHead(OK, BasicHeaders);
        res.end((new Response(new_player_room)).toString);
        return;
    }, req);

    route('/room', () => {
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
    }, req);

    route('/move', (params, body) => {
        if(!body) return;
        let response = undefined;

        const targetPlayer = rooms[room_id].get_player(player_email);
        if(targetPlayer)
            targetPlayer.move(body.params.x, body.params.y);
        else
            response = (new Response({}, BAD_REQUEST, 'Invalid player email')).toString;
        
        res.writeHead(OK, BasicHeaders);
        res.end(response);
        return;
    }, req, 'POST');

    route('/logout', () => {
        rooms[room_id].remove_player(player_email);

        res.writeHead(OK, BasicHeaders);
        res.end();
        return;
    }, req);
});
server.on('listening', () => console.log('Listening at: http://localhost:' + PORT));
server.listen(PORT);