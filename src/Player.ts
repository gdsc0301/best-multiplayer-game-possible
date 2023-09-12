import { Mesh, MeshBuilder, StandardMaterial, Texture, Vector3, Scene, ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";

export class Player {
    username = '';
    currentRoomID = '';

    #_mesh!: Mesh;
    #_meshMaterial!: StandardMaterial;

    position: Vector3;
    rotation: Vector3;

    width = 20;
    height = 20;

    speed = .5;
    angularSpeed = 3;

    velocity: Vector3;

    private inputAxis = {
        x: 0,
        y: 0
    }

    constructor(username: string, scene?: Scene, local: boolean = false) {
        this.username = username;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.velocity = new Vector3();

        if(scene) {
            this.#_mesh = MeshBuilder.CreatePlane(this.username, 
                {
                    size: 1, sideOrientation: Mesh.FRONTSIDE
                }, 
                scene
            );
            this.#_mesh.position = new Vector3();
            this.position = this.#_mesh.position;

            const ship = new Texture("/ship.png");
            this.#_meshMaterial = new StandardMaterial("playerMaterial", scene);
            this.#_meshMaterial.diffuseTexture = ship;
            this.#_meshMaterial.diffuseTexture.hasAlpha = true;

            this.#_mesh.material = this.#_meshMaterial;
            this.#_mesh.rotation.set(0,0,0);

            if(local) {
                this.initInputEvents(scene);
            }
        }
    }

    private defineAxis(key: string, pressing: boolean) {
        switch (key) {
            case 'ArrowUp':
                this.inputAxis.y = pressing ? 1 : 0;
                break;
        
            case 'ArrowDown':
                this.inputAxis.y = pressing ? -1 : 0;
                break;
        
            case 'ArrowLeft':
                this.inputAxis.x = pressing ? -1 : 0;
                break;
        
            case 'ArrowRight':
                this.inputAxis.x = pressing ? 1 : 0;
                break;
            
            default:
            break;
        }
    }

    private initInputEvents(scene: Scene) {
        scene.actionManager = new ActionManager(scene);
    
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, e => {
            this.defineAxis(e.sourceEvent.key, true);
        }));
    
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, e => {
            this.defineAxis(e.sourceEvent.key, false);
        }));
    
        scene.onBeforeRenderObservable.add(() => this.move());
    }

    setRoomID(roomID: string) {
        if(this.currentRoomID === '') {
            this.currentRoomID = roomID;
            return true;
        }

        return false;
    }

    move() {
        const newVelocity = new Vector3(this.velocity._x, this.velocity._y, 0);
        
        this.velocity = newVelocity.multiplyByFloats(
            .99, // x
            .99, // y
            0
        );
        const angle = Scalar.NormalizeRadians(this.#_mesh.rotation.z);
        
        const dt = this.#_mesh.getEngine().getDeltaTime() / 1000;

        const force = this.speed * this.inputAxis.y;
        this.velocity.addInPlaceFromFloats(
            -Math.sin(angle) * force, // x
            Math.cos(angle) * force, // y
            0
        );

        this.#_mesh.position.addInPlace(new Vector3(this.velocity.x * dt, this.velocity.y * dt, 0));
        this.#_mesh.rotation.z -= (this.inputAxis.x * this.angularSpeed) * dt;
        this.updatePublicTransform();
    }

    setPosition(newPosition: Vector3) {
        if(this.#_mesh){
            this.#_mesh.position = newPosition;
            this.updatePublicTransform();
            return;
        }
        
        this.position = newPosition;
    }

    update(position: Vector3, rotation: Vector3) {
        if(this.#_mesh){
            this.#_mesh.position = position;
            this.#_mesh.rotation = rotation;

            this.updatePublicTransform();
        }else {
            this.position = position;
            this.rotation = rotation;
        }
    }

    updatePublicTransform() {
        if(this.#_mesh){
            this.position = this.#_mesh.position;
            this.rotation = this.#_mesh.rotation;
        }
    }

    get mesh() {
        return this.#_mesh;
    }
    get meshMaterial() {
        return this.#_meshMaterial;
    }
}