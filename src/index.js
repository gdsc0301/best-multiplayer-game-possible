import { Player } from './Player';
import Command from './Command';
import Room from '../src/Room';

import './style.scss';

const server = {
  /** @type {String} */
  ipAddress: undefined,
  get URL() {
    if(!this.ipAddress) return false;

    return `http://${this.ipAddress}`;
  }
};

const loginForm = document.getElementById('loginForm');
const emailErrorField = loginForm.querySelector('.error');
const welcomeMessage = document.querySelector('.welcomeMessage');

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

/** @type {Player} */
let LocalPlayer;

/** @type {Room} */
let currentRoom;

let gameplayLoop;
function init() {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    server.ipAddress = e.target.elements[0].value;
    const username = e.target.elements[1].value;

    console.log(server, username);
    if(server.URL && username) {
      fetch(`${server.URL}/login?player_email=${encodeURIComponent(username)}`).then(res => {
        res.json().then(body => {
          if(body?.status === 200) {
            canvas.focus({preventScroll: true});
            emailErrorField.classList.remove('active');

            currentRoom = Object.assign((new Room(body.data.ID)), structuredClone(body.data));
            LocalPlayer = Object.assign((new Player(username)), structuredClone(currentRoom.players[username]));
            parseRoomPlayers();

            LocalPlayer.initInputEvents();

            document.addEventListener('keydown', e => {
                if(e.key === 'Escape') { // On press esc, stop game
                  clearInterval(gameplayLoop);
                  return;
                }
              }
            );

            window.addEventListener('beforeunload', () => {
              if(gameplayLoop){
                fetch(getReqURL('logout'));
                clearInterval(gameplayLoop);
              }
              return;
            });

            welcomeMessage.innerHTML = 'Welcome, ' + username;
            gameplayLoop = setInterval(update, 1000/60);
          }else {
            emailErrorField.innerHTML = 'Login failed, try again later';
            emailErrorField.classList.add('active');
            clearInterval(gameplayLoop);
            console.error(body);
          }
        })
      });
    }else {
      emailErrorField.innerHTML = 'Invalid IP address or Username';
      emailErrorField.classList.add('active');
    }
  });
}

function getReqURL(path) {
  return `${server.URL}/${path}?player_email=${LocalPlayer.username}&room_id=${LocalPlayer.currentRoomID}`;
}

function getRoomData() {
  fetch(getReqURL('room')).then(res => {
    res.json().then(body => {
      if(body?.status === 200) {
        emailErrorField.classList.remove('active');
        currentRoom = Object.assign(currentRoom, body.data);
        parseRoomPlayers();
      }else {
        emailErrorField.classList.add('active');
        emailErrorField.innerHTML = body.error;
        clearInterval(gameplayLoop);
      }
    })
  });
}

function parseRoomPlayers() {
  for(const player_id in currentRoom.players) {
    const playerInst = new Player(player_id);
    
    currentRoom.players[player_id] = Object.assign(playerInst, currentRoom.players[player_id]);
  }
}

function sendPlayerToServer() {
  const req = new Request(getReqURL('player_update'), {
    method: 'POST',
    body: JSON.stringify({
      action: 'player_update',
      params: LocalPlayer
    })
  });

  fetch(req);
}

function update() {
  getRoomData();
  
  LocalPlayer.move();

  sendPlayerToServer();
  draw();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  LocalPlayer.draw(ctx, canvas.width, canvas.height, LocalPlayer);
  for(const player_id in currentRoom.players) {
    if(player_id === LocalPlayer.username) continue;

    currentRoom.players[player_id].draw(
      ctx, canvas.width, canvas.height, LocalPlayer
    )
  }

  ctx.strokeStyle = 'white';
  ctx.strokeRect(-LocalPlayer.x, -LocalPlayer.y, currentRoom.width, currentRoom.height);
}

init();