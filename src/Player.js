export class Player {
    username = '';
    currentRoomID = '';
    x = 0;
    y = 0;

    width = 20;
    height = 20;

    speed = 10;

    direction = 0;
    inputAxis = {
        x: 0,
        y: 0
    }

    commandsBuffer = [];

    constructor(username) {
        this.username = username;
    }

    /**
     * @param {Player} serverUpdatedPlayer 
     */
    update(serverUpdatedPlayer) {
        this.username = serverUpdatedPlayer.username;
        this.currentRoomID = serverUpdatedPlayer.currentRoomID;
        this.x = serverUpdatedPlayer.x;
        this.y = serverUpdatedPlayer.y;

        this.width = serverUpdatedPlayer.width;
        this.height = serverUpdatedPlayer.height;

        this.speed = serverUpdatedPlayer.speed;

        this.direction = serverUpdatedPlayer.direction;
    }

    setRoomID(roomID) {
        if(this.currentRoomID === '') {
        this.currentRoomID = roomID;
        return true;
        }

        return false;
    }

    move(axis_x,axis_y) {
        this.x += axis_x * this.speed;
        this.y += axis_y * this.speed;
    }

    setPosition(x,y) {
        this.x = x;
        this.y = y;
    }
    
    draw() {
        const PlayerD2D = new Path2D();
        PlayerD2D.moveTo(this.x - this.width/2, this.y + this.height/2);
        PlayerD2D.lineTo(this.x, this.y - this.height/2);
        PlayerD2D.lineTo(this.x + this.width/2, this.y + this.height/2);
        PlayerD2D.closePath();
        return PlayerD2D;
    }

    setInputAxis(x,y) {
        this.inputAxis = {x:x,y:y};
    }

    get currentRoomID() {
        return this.currentRoomID;
    }
}