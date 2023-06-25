import { IncomingMessage, createServer } from "node:http";

const PORT = process.env.PORT || 5000;
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
            username: this.#username
        };
    }

    move(x,y) {
        this.#x += x;
        this.#y += y;
    }
}

class Response {
    #json;
    #status;
    #error;

    constructor(json, status = 200, error = '') {
        this.#json = json;
        this.#status = status;
        this.#error = error;
    }

    get json() {
        return JSON.stringify({
            status: this.#status,
            error: this.#error,
            response: this.#json
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
                req.on("data", (chunk) => {
                    body += chunk.toString();
                });
        
                // Listen for end event
                req.on("end", () => {
                    body = JSON.parse(body);
                });
            } catch (error) {
                console.log(error);
            }

            return callback(params, body);
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

        res.write(new Response(newPlayer.preJSON).json);
        res.end('', (e) => console.log('New login', username));
        return;
    }, req);

    route('player', (params) => {
        res.end(new Response(players[params.get('email')].preJSON).json);
        return;
    }, req);

    route('move', (params, body) => {
        console.log(body);
        if(body?.action === 'move') {
            players[params.get('email')].x = 1*body.params.x;
            players[params.get('email')].y = 1*body.params.y;
        }
        res.end();
        return;
    }, req, 'POST');
});
server.listen(PORT);