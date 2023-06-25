import { IncomingMessage, createServer } from "node:http";

const PORT = process.env.PORT || 6600;
const BasicHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Vary": "Origin"
};

class Player {
    #username;
    #x;
    #y;
    #width = 5;
    #height = 5;
    #direction = 0;

    constructor(username) {
        this.#username = username;
        this.#x = 0;
        this.#y = 0;
    }

    get preJSON() {
        return {
            x: this.#x,
            y: this.#y,
            direction: this.#direction,
            username: this.#username
        };
    }

    move(x,y) {
        this.#x += x * 10;
        this.#y += y * 10;
    }
}

class Response {
    json;
    status;
    error;

    constructor(json = {}, status = 200, error = '') {
        this.json = json;
        this.status = status;
        this.error = error;
    }

    get toString() {
        return JSON.stringify({
            status: this.status,
            error: this.error,
            response: this.json
        });
    }
}

const players = {};

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
    res.writeHead(200, BasicHeaders);
    route('login', (params) => {
        const username = params.get('email');
        const newPlayer = new Player(username);

        players[username] = newPlayer;

        const response = new Response(newPlayer.preJSON);
        res.end(response.toString);
        return;
    }, req);

    route('player', (params) => {
        const response = new Response();
        if(players[params.get('email')]) {
            response.json = players[params.get('email')]?.preJSON;
        }else{
            console.error('undefined player', players);
            response.error = 'undefined email';
            response.status = 400;
        }
        res.end(response.toString);
        return;
    }, req);

    route('move', (params, body) => {
        if(!body) return;
        if(body.action === 'move') {
            players[params.get('email')].move(body.params.x, body.params.y);
        }
        
        res.end();
        return;
    }, req, 'POST');
});
server.on('listening', () => console.log('Listening at: localhost:' + PORT));
server.listen(PORT);