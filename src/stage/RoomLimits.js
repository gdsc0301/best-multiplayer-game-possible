import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial } from "@babylonjs/core";

/** @param {Scene} scene */
function RoomLimits(scene) {
  const width = 1000;
  const height = 1000;

  /** @type {Mesh} */
  const roomLimits = new MeshBuilder.CreatePlane(
    "roomLimits",
    { width: width, height: height},
    scene
  );
  roomLimits.scaling = new Vector2(width, height);
  roomLimits.position = new Vector2(width / 2, height / 2);

  const roomLimitsMaterial = new StandardMaterial("roomLimitsMaterial", scene);
  roomLimitsMaterial.diffuseColor = new Color3(0, 0, .5);
  roomLimits.material = roomLimitsMaterial;

  return roomLimits;
}