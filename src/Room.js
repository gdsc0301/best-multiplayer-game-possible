import { Player } from "./Player.js";

export default class Room {
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
    constructor(ID, width = 1000, height = 1000) {
        this.start_timestamp = Date.now();
        this.ID = ID;
        
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
        return this.max_players_amount <= this.players_amount;
    }

    get_free_room_position() {
        return {x: this.width/2, y: this.height/2};
    }

    /**
     * @param {Player} player Player object to be inserted at the room.
     */
    add_player(player) {
        if(!this.player_is_here(player.username)){
            const newPosition = this.get_free_room_position();
            player.setPosition(newPosition.x, newPosition.y);

            this.players[player.username] = player;
            return true;
        }

        return false;
    }

    /**
     * @param {string} player_username 
     */
    remove_player(player_username) {
        if(this.player_is_here(player_username))
            delete this.players[player_username];
    }

    player_is_here(playerUsername) {
        return !(Object.keys(this.players).indexOf(playerUsername) === -1);
    }

    /**
     * @param {string} player_username Username of the player to return
     * @returns {Player|false}
     */
    get_player(player_username) {
        return this.player_is_here(player_username) && this.players[player_username];
    }
}