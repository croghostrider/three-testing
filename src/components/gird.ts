import * as THREE from 'three';

function createGird() {
  // create a geometry
  const gridXZ = new THREE.GridHelper(100, 10);

  return gridXZ;
}

export { createGird };
