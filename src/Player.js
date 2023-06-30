export class Player {
    username = '';
    currentRoomID = '';
    x = 0;
    y = 0;

    style = 'orange';
    usernameStyle = 'white';

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

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     * @param {Player} localPlayer 
     */
    draw(ctx, canvasWidth, canvasHeight, localPlayer) {
        const PlayerD2D = new Path2D();
        const offset = {
            x: localPlayer.x - (canvasWidth / 2),
            y: localPlayer.y - (canvasHeight / 2)
        };

        const thisPos = {
            x: this.x - offset.x,
            y: this.y - offset.y
        };

        ctx.strokeStyle = this.style;
        PlayerD2D.moveTo(thisPos.x - this.width/2, thisPos.y + this.height/2);
        PlayerD2D.lineTo(thisPos.x, thisPos.y - this.height/2);
        PlayerD2D.lineTo(thisPos.x + this.width/2, thisPos.y + this.height/2);
        PlayerD2D.closePath();

        ctx.stroke(PlayerD2D);

        ctx.fillStyle = this.usernameStyle;
        ctx.fillText(this.username, thisPos.x, thisPos.y - this.height - 12);

        return PlayerD2D;
    }

    setInputAxis(x,y) {
        this.#inputAxis = {x:x,y:y};
    }

    get currentRoomID() {
        return this.currentRoomID;
    }
}