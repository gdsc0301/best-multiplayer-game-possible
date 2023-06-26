import { IncomingMessage, createServer } from "node:http";
import { Player } from '../src/Player';
import Response, { BAD_REQUEST, OK, UNAUTHORIZED } from './src/Response';
import Room from '../src/Room';

const PORT = process.env.PORT || 6600;
const BasicHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Vary": "Origin"
};

/** @type {Object.<string, Room}} */
const rooms = {};

/**
 * @param {Player} player 
 * @returns {String} The room ID
 */
const get_free_room_for = player => {
    if(!Object.keys(rooms.length)) { // If ther's no room, create a new one;
        const new_room = new Room();
        new_room.add_player(player) ? undefined : console.error('Invalid player', player);

        rooms[new_room.ID] = new_room;
        return rooms[new_room.ID];
    }

    // If there are rooms, check for an available one.
    for(const room of rooms) {
        if(room.is_full) continue;
        return room;
    }

    // In last case, it just creates a new room.
    const new_room = new Room();
    new_room.add_player(player);

    rooms[new_room.ID] = new_room;
    return new_room;
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
const route = (path, callback, req, method = 'GET') => {
    const currURL = req.url.split('?')[0];
    const params = new URLSearchParams(req.url.split('?')[1]);

    if(currURL === `/${path.replace('/')}` && req.method === method) {
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
                    callback(params, body);
                });
            } catch (error) {
                console.error('ERROR:', error);
            }
        }

        return callback(params);
    }
}

const server = createServer(async (req, res) => {
    res.writeHead(OK, BasicHeaders);
    const player_email = params.get('player_email');
    const room_id = params.get('room_id');

    if(!room_exist(room_id)) {
        res.end((new Response({}, BAD_REQUEST, 'Invalid room ID')));
        return;
    }

    route('login', (params) => {
        const new_player = new Player(player_email);
        const new_player_room = get_free_room_for(new_player);

        res.end((new Response({room: new_player_room})).toString);
        return;
    }, req);

    route('room', (params) => {
        const response = new Response();
        if(room_id) {
            if(rooms[room_id].player_is_here(player_email)) {
                response.data = rooms[room_id];
            }else {
                response.error = "Not logged in or internal error.";
                response.status = UNAUTHORIZED;
            }
        }else {
            response.status = BAD_REQUEST;
            response.error = "No room ID found."
        }
        res.end(response.toString);
        return;
    }, req);

    route('move', (params, body) => {
        if(!body) return;
        let response = undefined;

        const targetPlayer = rooms[room_id].get_player(player_email);
        if(targetPlayer)
            targetPlayer.move(body.params.x, body.params.y);
        else
            response = (new Response({}, BAD_REQUEST, 'Invalid player email')).toString;
        
        res.end(response);
        return;
    }, req, 'POST');
});
server.on('listening', () => console.log('Listening at: localhost:' + PORT));
server.listen(PORT);