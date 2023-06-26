import { FrontEndPlayer } from './Player';
import Command from './Command';
import Room from '../src/Room';

import './style.scss';

const serverURL = 'http://localhost:6600';

const loginForm = document.getElementById('loginForm');
const emailErrorField = loginForm.querySelector('.error');

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

/** @type {FrontEndPlayer} */
let NewPlayer;

/** @type {Room} */
let currentRoom;

let gameplayLoop;

function init() {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    NewPlayer = new FrontEndPlayer(e.target.elements[0].value);

    canvas.focus();

    fetch(`${serverURL}/login?email=${encodeURIComponent(e.target.elements[0].value)}`).then(res => {
      res.json().then(body => {
        if(body?.status === 200) {
          currentRoom = body.data.room;
          NewPlayer.setRoomID(currentRoom.ID);
          
          gameplayLoop = setInterval(update, 1000/60);

          document.addEventListener('keydown', e => {
              NewPlayer.commandsBuffer.push((new Command('down', e.key)).obj);
            }
          );

          document.addEventListener('keyup', e => {
              NewPlayer.commandsBuffer.push(
                (new Command('up', e.key)).obj
              );
            }
          );

          document.addEventListener('keydown', e => {
            return e.key === 'Escape' ? clearInterval(gameplayLoop) : undefined;
          });
        }else {
          console.error(body);
        }
      })
    });
  });
}

function getReqURL(path) {
  return `${serverURL}/${path}?email=${NewPlayer.username}&room_id=${NewPlayer.currentRoomID}`;
}

function getRoomData() {
  fetch(getReqURL('room')).then(res => {
    res.json().then(body => {
      if(body?.status === 200) {
        currentRoom = Object()
        NewPlayer.update(body.response.x,body.response.y,body.response.direction);
      }else {
        emailErrorField.classList.add('active');
        emailErrorField.innerHTML = body.error;
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
  

  for(let i=0;i < NewPlayer.commandsBuffer.length; i++){
    const movement = NewPlayer.commandsBuffer.pop();
    const pressing = movement.action === 'down';

    switch (movement.key) {
      case 'ArrowUp':
        NewPlayer.inputAxis.y = pressing ? -1 : 0;
        break;
    
      case 'ArrowDown':
        NewPlayer.inputAxis.y = pressing ? 1 : 0;
        break;

      case 'ArrowLeft':
        NewPlayer.inputAxis.x = pressing ? -1 : 0;
        break;

      case 'ArrowRight':
        NewPlayer.inputAxis.x = pressing ? 1 : 0;
        break;
      default:
        break;
    }
  }

  if(NewPlayer.inputAxis.x !== 0 || NewPlayer.inputAxis.y !== 0)
    movePlayer(NewPlayer.inputAxis.x, NewPlayer.inputAxis.y);

  draw();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'orange';
  ctx.stroke(NewPlayer.draw());
}

init();