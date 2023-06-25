import './style.scss';

const loginForm = document.getElementById('loginForm');

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

class Command {
  constructor(action, key) {
    this.action = action;
    this.key = key;
  }

  get obj() {
    return {
      action: this.action,
      key: this.key
    };
  }
}

class Player {
  username = ''
  commandsBuffer = [];
  x = 0;
  y = 0;

  width = 20;
  height = 20;

  direction = 0;
  inputAxis = {
    x: 0,
    y: 0
  }

  constructor(username) {
    this.username = username;
  }

  update(x,y,direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  setInputAxis(x,y) {
    this.inputAxis = {x:x,y:y};
  }

  draw() {
    const PlayerD2D = new Path2D();
    PlayerD2D.moveTo(this.x, this.y - this.height/2);
    PlayerD2D.lineTo(this.x + this.width/2, this.y);
    PlayerD2D.lineTo(this.x + -this.width, this.y);
    PlayerD2D.lineTo(this.x, this.y - this.height/2);
    PlayerD2D.closePath();
    return PlayerD2D;
  }
};

/** @type {Player} */
let NewPlayer;

let gameplayLoop;

function init() {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    NewPlayer = new Player(e.target.elements[0].value);

    canvas.focus();

    fetch(getReqURL('login')).then(res => {
      res.json().then(body => {
        if(body?.status === 200) {
          NewPlayer.update(body.x,body.y,body.direction);
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

          document.addEventListener('keydown', e => e.key === 'Escape' ? clearInterval(gameplayLoop) : undefined);
        }else {
          console.error(body);
        }
      })
    });
  });
}

function getReqURL(path) {
  return `http://localhost:6600/${path}?email=${NewPlayer.username}`;
}

function getPlayerData() {
  fetch(getReqURL('player')).then(res => {
    res.json().then(body => {
      if(body?.status === 200) {
        NewPlayer.update(body.response.x,body.response.y,body.response.direction);
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

  getPlayerData();
  draw();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'orange';
  ctx.stroke(NewPlayer.draw());
}

init();