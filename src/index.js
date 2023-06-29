import { Player } from './Player';
import Command from './Command';
import Room from '../src/Room';

import './style.scss';

const serverURL = 'http://localhost:6600';

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
    canvas.focus();

    const username = e.target.elements[0].value;

    fetch(`${serverURL}/login?player_email=${encodeURIComponent(username)}`).then(res => {
      res.json().then(body => {
        if(body?.status === 200) {
          welcomeMessage.innerHTML = 'Welcome, '+username;
          currentRoom = body.data;
          parseRoomPlayers();
          LocalPlayer = currentRoom.players[username];
          
          gameplayLoop = setInterval(update, 1000/60);

          document.addEventListener('keydown', e => {
              LocalPlayer.commandsBuffer.push((new Command('down', e.key)).obj);
            }
          );

          document.addEventListener('keyup', e => {
              LocalPlayer.commandsBuffer.push(
                (new Command('up', e.key)).obj
              );
            }
          );

          document.addEventListener('keydown', e => {
            return e.key === 'Escape' ? clearInterval(gameplayLoop) : undefined;
          });

          window.addEventListener('beforeunload', () => {
            clearInterval(gameplayLoop);
            return fetch(getReqURL('logout')).then(() => {return true;});
          });
        }else {
          welcomeMessage.innerHTML = 'Login failed, try again later';
          console.error(body);
        }
      })
    });
  });
}

function parseRoomPlayers() {
  for(const player_id in currentRoom.players) {
    const playerInst = new Player(player_id);
    
    currentRoom.players[player_id] = Object.assign(playerInst, currentRoom.players[player_id]);
  }
}

function getReqURL(path) {
  return `${serverURL}/${path}?player_email=${LocalPlayer.username}&room_id=${LocalPlayer.currentRoomID}`;
}

function getRoomData() {
  fetch(getReqURL('room')).then(res => {
    res.json().then(body => {
      if(body?.status === 200) {
        const updated_room = body.data;
        currentRoom = Object.assign(currentRoom, updated_room);
        parseRoomPlayers();
        LocalPlayer.update(currentRoom.players[LocalPlayer.username]);
      }else {
        emailErrorField.classList.add('active');
        emailErrorField.innerHTML = body.error;
        clearInterval(gameplayLoop);
      }
    })
  });
}

function movePlayer(x,y) {
  const req = new Request(getReqURL('move'), {
    method: 'POST',
    body: JSON.stringify({
      action: 'move',
      params: {
        x: x,
        y: y
      }
    })
  });

  fetch(req);
}

function update() {
  getRoomData();
  
  // Get keys
  for(let i=0;i < LocalPlayer.commandsBuffer.length; i++){
    const movement = LocalPlayer.commandsBuffer.pop();
    const pressing = movement.action === 'down';

    switch (movement.key) {
      case 'ArrowUp':
        LocalPlayer.inputAxis.y = pressing ? -1 : 0;
        break;
    
      case 'ArrowDown':
        LocalPlayer.inputAxis.y = pressing ? 1 : 0;
        break;

      case 'ArrowLeft':
        LocalPlayer.inputAxis.x = pressing ? -1 : 0;
        break;

      case 'ArrowRight':
        LocalPlayer.inputAxis.x = pressing ? 1 : 0;
        break;
      default:
        break;
    }
  }

  if(LocalPlayer.inputAxis.x !== 0 || LocalPlayer.inputAxis.y !== 0)
    movePlayer(LocalPlayer.inputAxis.x, LocalPlayer.inputAxis.y);

  draw();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'orange';

  for(const player_id in currentRoom.players) {
    ctx.stroke(currentRoom.players[player_id].draw(ctx, canvas.width, canvas.height, LocalPlayer));
  }

  ctx.strokeStyle = 'white';
  ctx.strokeRect(-LocalPlayer.x, -LocalPlayer.y, currentRoom.width, currentRoom.height);
}

init();