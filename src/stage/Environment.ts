import { Scene, Color3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture, Vector3, Vector4 } from "@babylonjs/core";

class Environment {
  scene: Scene;
  light: HemisphericLight;
  skybox: Mesh;

  constructor(scene: Scene, skyboxMaterial?: StandardMaterial, width = 500, height = 500) {
    this.scene = scene;
    
    this.light = new HemisphericLight('mainLight', Vector3.Down(), this.scene);

    const uv = new Vector4(
      0, // left      ->|
      0, // bottom    -^
      10, // -right   |->
      10 // -top       -v
    );
    this.skybox = MeshBuilder.CreatePlane('background', {
      width: width, height: height, frontUVs: uv, backUVs: uv, sideOrientation: Mesh.DOUBLESIDE
    }, this.scene);

    this.skybox.position.set(0, 0, 20);

    if(!skyboxMaterial){
      const texture = new Texture("/bg/pn-2.png", this.scene);
      skyboxMaterial = new StandardMaterial("skybox", this.scene);
      
      skyboxMaterial.diffuseTexture = texture;
      skyboxMaterial.emissiveColor = new Color3(1,1,1);
      skyboxMaterial.emissiveTexture = texture;
    }

    this.skybox.material = skyboxMaterial;
  }
}

export {Environment};