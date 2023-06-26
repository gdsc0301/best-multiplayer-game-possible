import { Player } from "./Player";

class Room {
    ID;
    width;
    height;
    players = {};
    max_players_amount = 2;
    start_timestamp;

    /**
     * @param {String} ID Room ID;
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(width = 1000, height = 1000) {
        this.ID = crypto.randomUUID();
        this.start_timestamp = Date.now();
        
        this.width = width;
        this.height = height;
    }

    get ID() {
        return this.ID;
    }
    get start_timestamp() {
        return this.start_timestamp;
    }

    get players_amount() {
        return Object.keys(this.players).length;
    }

    get is_full() {
        return this.max_players_amount >= this.players_amount;
    }

    get_free_room_position() {
        return {x: this.width/2, y: this.y/2};
    }

    /**
     * @param {Player} player Player object to be inserted at the room.
     */
    add_player(player) {
        if(Object.keys(this.players).indexOf(player.username) === -1){
            player.setPosition(this.get_free_room_position());
            this.players[player.username] = player;
            return true;
        }

        return false;
    }

    player_is_here(playerUsername) {
        return (Object.keys(this.players).indexOf(playerUsername) === -1);
    }

    /**
     * 
     * @param {string} player_username Username of the player to return
     * @returns {Player|false}
     */
    get_player(player_username) {
        return this.player_is_here(player_username) && this.players[player_username];
    }
}

export default Room;