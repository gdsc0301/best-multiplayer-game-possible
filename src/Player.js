import { Mesh, MeshBuilder, Scene, StandardMaterial, Texture } from "@babylonjs/core";

export class Player {
    username = '';
    currentRoomID = '';
    x = 0;
    y = 0;

    #mesh;
    #meshMaterial;

    #nicknameMesh;

    width = 20;
    height = 20;

    speed = 10;

    direction = 0;

    #inputAxis = {
        x: 0,
        y: 0
    }

    constructor(username) {
        this.username = username;
    }

    /**
     * @param {string} key The key to check
     * @param {boolean} pressing Is pressing or releasing that key?
     */
    #defineAxis(key, pressing) {
        switch (key) {
            case 'ArrowUp':
                this.#inputAxis.y = pressing ? -1 : 0;
                break;
        
            case 'ArrowDown':
                this.#inputAxis.y = pressing ? 1 : 0;
                break;
        
            case 'ArrowLeft':
                this.#inputAxis.x = pressing ? -1 : 0;
                break;
        
            case 'ArrowRight':
                this.#inputAxis.x = pressing ? 1 : 0;
                break;
            
            default:
            break;
        }
    }

    initInputEvents() {
        document.addEventListener('keydown', e => {
            this.#defineAxis(e.key, true);
          }
        );

        document.addEventListener('keyup', e => {
            this.#defineAxis(e.key, false);
          }
        );
    }

    setRoomID(roomID) {
        if(this.currentRoomID === '') {
        this.currentRoomID = roomID;
        return true;
        }

        return false;
    }

    move() {
        this.x += this.#inputAxis.x * this.speed;
        this.y += this.#inputAxis.y * this.speed;
    }

    setPosition(x,y) {
        this.x = x;
        this.y = y;
    }

    /** @param {Scene} scene */
    async draw(scene) {
        const fontData = await (await fetch("/fonts/Montserrat_Bold.json")).json();
        this.#meshMaterial = new StandardMaterial("playerMaterial", scene);
        this.#meshMaterial.diffuseTexture =  new Texture("/ship.png");

        this.#mesh = MeshBuilder.CreatePlane(username, {size: 1, sideOrientation: Mesh.FRONTSIDE}, scene);
        this.#mesh.material = this.#meshMaterial;
        this.#mesh.position = new Vector3(this.x, this.y, 2);

        this.#nicknameMesh = MeshBuilder.CreateText(`${this.username}Title`, this.username, fontData, {size: 24, resolution: 64, depth: 10}, scene);
    }

    setInputAxis(x,y) {
        this.#inputAxis = {x:x,y:y};
    }

    get currentRoomID() {
        return this.currentRoomID;
    }
}