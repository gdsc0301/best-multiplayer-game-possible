import { Mesh, MeshBuilder, StandardMaterial, Vector3, Scene, RawTexture, Texture, Vector4, Color4, Color3 } from "@babylonjs/core";
import { Player } from "./Player";

export default class Room {
    private _ID: string;
    width: number;
    height: number;
    players: { [key: string]: Player } = {};
    max_players_amount = 128;
    private _start_timestamp: number;

    private roomMesh!: Mesh;
    private roomMaterial!: StandardMaterial;

    constructor(ID: string, width = 1000, height = 1000, scene?: Scene) {
        this._start_timestamp = Date.now();
        this._ID = ID;

        this.width = width;
        this.height = height;

        if(scene) {
            this.roomMesh = MeshBuilder.CreatePlane('roomMesh',
                {
                    width: this.width,
                    height: this.height,
                    frontUVs: new Vector4(0,0,750,750),
                    sideOrientation: Mesh.DOUBLESIDE
                },
                scene
            );
    
            const gridTexture = new Texture('/bg/grid.png');
            this.roomMaterial = new StandardMaterial('roomMaterial', scene);

            this.roomMaterial.diffuseTexture = gridTexture;
            this.roomMaterial.diffuseTexture.hasAlpha = true;
    
            this.roomMesh.position = new Vector3(0, 0, 1);
            this.roomMesh.material = this.roomMaterial;
        }
    }

    get ID() {
        return this._ID;
    }
    get start_timestamp() {
        return this._start_timestamp;
    }

    get players_amount() {
        return Object.keys(this.players).length;
    }

    get is_full() {
        return this.max_players_amount <= this.players_amount;
    }

    get_free_room_position(): Vector3 {
        return new Vector3();
    }

    add_player(player: Player) {
        if (!this.player_is_here(player.username)) {
            const newPosition = this.get_free_room_position();
            player.setPosition(newPosition);

            this.players[player.username] = player;
            return true;
        }

        return false;
    }

    remove_player(player_username: string) {
        if (this.player_is_here(player_username))
            delete this.players[player_username];
    }

    player_is_here(playerUsername) {
        return !(Object.keys(this.players).indexOf(playerUsername) === -1);
    }

    get_player(player_username: string): Player | false {
        return this.player_is_here(player_username) && this.players[player_username];
    }
}