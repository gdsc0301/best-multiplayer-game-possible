import { Player } from './Player';
import Room from './Room';
import { Environment } from './stage/Environment';

import './style.scss';

import { Mesh, FreeCamera, Engine, Scene, Vector3 } from '@babylonjs/core';
import { Inspector } from "@babylonjs/inspector";

const server = {
  /** @type {String} */
  ipAddress: undefined,
  get URL() {
    if (!this.ipAddress) return false;

    return this.ipAddress;
  }
};

const BasicHeaders = {
  "Content-Type": "text/plain",
};

class App {
  loggedIn = false;
  currentRoom!: Room;
  // gameplayLoop: any;

  localPlayer: Player;
  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene;
  camera: FreeCamera;

  environment: Environment;
  skybox!: Mesh;

  // Login Form
  loginForm: HTMLFormElement;
  emailErrorField: HTMLElement;
  welcomeMessage: HTMLElement;

  username: string;

  constructor() {
    this.loginForm = document.getElementById('loginForm') as HTMLFormElement;

    this.canvas = document.getElementById('app') as HTMLCanvasElement;
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);

    this.environment = new Environment(this.scene, undefined, 500, 500);

    this.camera = new FreeCamera('mainCamera', new Vector3(0, 0, -20), this.scene);

    window.addEventListener("keydown", (e) => {
      if (e.key === 'F1') {
        if (Inspector.IsVisible) {
          Inspector.Hide();
        } else {
          Inspector.Show(this.scene,{});
        }
      }
    });

    window.addEventListener('resize', () => this.engine.resize());

    this.localPlayer = new Player('LocalPlayer', this.scene, true);
    this.localPlayer.setPosition(Vector3.Zero());

    this.scene.onBeforeRenderObservable.add(() => this.camera.position.set(this.localPlayer.mesh.position.x, this.localPlayer.mesh.position.y, this.camera.position.z));

    this.emailErrorField = this.loginForm.querySelector('.error')!;
    this.welcomeMessage = document.querySelector('.welcomeMessage')!;
    this.welcomeMessage.innerHTML = 'Insert the IP address and your Username to start';

    this.username = 'Guest';

    this.loginForm.addEventListener('submit', e => {
      e.preventDefault();

      server.ipAddress = e.target!['elements'][0].value;
      this.username = e.target!['elements'][1].value;

      if (server.URL && this.username) {
        fetch(`${server.URL}/login?player_email=${encodeURIComponent(this.username)}`).then(res => {
          res.json().then(body => {
            if (body?.status === 200) {
              Object.keys(e.target!['elements']).forEach(elm => {
                e.target!['elements'][elm].setAttribute('disabled', '');
              });

              this.canvas.focus({ preventScroll: true });
              this.emailErrorField.classList.remove('active');

              this.currentRoom = Object.assign((new Room(body.data.ID, 1000, 1000, this.scene)), structuredClone(body.data));
              
              this.localPlayer.mesh.dispose();
              this.localPlayer = Object.assign(new Player(this.username, this.scene, true), structuredClone(this.currentRoom.players[this.username]));
              this.parseRoomPlayers(body.data as Room);

              document.addEventListener('keydown', e => {
                if (e.key === 'Escape') { // On press esc, stop game
                  Object.keys(this.loginForm.elements).forEach(elm => {
                    this.loginForm.elements[elm].removeAttribute('disabled', '');
                  });

                  this.welcomeMessage.innerHTML = 'Insert the IP address and username to start';
                  this.engine.stopRenderLoop();
                  return;
                }
              }
              );

              window.addEventListener('beforeunload', () => {
                fetch(this.getReqURL('logout'));

                this.engine.stopRenderLoop();
                return;
              });

              this.welcomeMessage.innerHTML = 'Welcome, ' + this.username;
              this.loggedIn = true;
            } else {
              this.emailErrorField.innerHTML = 'Login failed, try again later';
              this.emailErrorField.classList.add('active');

              this.engine.stopRenderLoop();

              console.error(body);
            }
          })
        });
      } else {
        this.emailErrorField.innerHTML = 'Invalid IP address or Username';
        this.emailErrorField.classList.add('active');
      }
    });

    this.engine.runRenderLoop(()=> this.update());
  }

  getReqURL(path: string) {
    return `${server.URL}/${path}?player_email=${this.localPlayer.username}&room_id=${this.localPlayer.currentRoomID}`;
  }

  getRoomData() {
    fetch(this.getReqURL('room')).then(res => {
      res.json().then(body => {
        if (body?.status === 200) {
          this.emailErrorField.classList.remove('active');
          this.parseRoomPlayers(body.data as Room);
        } else {
          this.emailErrorField.classList.add('active');
          this.emailErrorField.innerHTML = body.error;
          
          this.engine.stopRenderLoop();
        }
      })
    });
  }

  parseRoomPlayers(newRoomData: Room) {
    for (const player_id in newRoomData.players) {
      if(player_id === this.localPlayer.username) {
        continue;
      }

      const newPos = new Vector3(newRoomData.players[player_id].position._x, newRoomData.players[player_id].position._y, 0);
      const newRot = new Vector3(newRoomData.players[player_id].rotation._x, newRoomData.players[player_id].rotation._y, newRoomData.players[player_id].rotation._z);

      // Player already exists
      if(this.currentRoom.players[player_id] && this.currentRoom.players[player_id] instanceof Player) {
        this.currentRoom.players[player_id].update(newPos, newRot);
        return;
      }

      const newPlayer = Object.assign(new Player(player_id, this.scene, false), this.currentRoom.players[player_id]);
      newPlayer.update(newPos, newRot);

      this.currentRoom.players[player_id] = newPlayer;
    }

    for (const player_id in this.currentRoom.players) {
      if(!newRoomData.players[player_id]) {
        this.currentRoom.players[player_id].mesh.dispose();
        delete this.currentRoom.players[player_id];
      }
    }
  }

  sendPlayerToServer() {
    const req = new Request(this.getReqURL('player_update'), {
      method: 'POST',
      headers: BasicHeaders,
      body: JSON.stringify({
        action: 'player_update',
        params: this.localPlayer
      })
    });

    fetch(req);
  }

  update() {
    if (this.loggedIn)
      this.getRoomData();

    this.localPlayer.move();

    if (this.loggedIn)
      this.sendPlayerToServer();
    
    this.scene.render();
  }
}

new App();