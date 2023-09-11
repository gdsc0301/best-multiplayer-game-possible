import { HemisphericLight, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Vector4 } from "@babylonjs/core";

export class Player {
    username = '';
    currentRoomID = '';
    x = 0;
    y = 0;

    #mesh;
    /** @type {StandardMaterial} */
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
        this.#meshMaterial = new StandardMaterial("playerMaterial", scene);
        // this.#meshMaterial.diffuseTexture = new Texture("/ship.png");
        this.#meshMaterial.diffuseColor = new Vector3(1, 0, 0);

        this.#mesh = MeshBuilder.CreatePlane(this.username, 
            {
                size: 8, sideOrientation: Mesh.FRONTSIDE, 
                frontUVs: new Vector4(0,1,0,1)
            }, 
            scene
        );
        this.#mesh.material = this.#meshMaterial;
        this.#mesh.position = new Vector3(this.x, this.y, 0);
    }

    setNicknameMesh(TextMesh) {
        this.#nicknameMesh = TextMesh;
    }

    setInputAxis(x,y) {
        this.#inputAxis = {x:x,y:y};
    }

    get currentRoomID() {
        return this.currentRoomID;
    }
}