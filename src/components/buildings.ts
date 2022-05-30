import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

function createBuildings() {
  const geometryBox = new BoxGeometry(10, 10, 10);
  const materialBox = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometryBox, materialBox);
  cube.position.x = 2;
  cube.position.y = 5;
  cube.position.z = -21;
  return cube;
}

export { createBuildings };
