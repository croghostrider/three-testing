import { GridHelper } from 'three';

function createGird() {
  // create a geometry
  const gridXZ = new GridHelper(100, 10);

  return gridXZ;
}

export { createGird };
