import * as THREE from 'three';

function createWindow(facade: THREE.Mesh) {
  const geometryPlane = new THREE.PlaneGeometry(1, 1);
  const materialPlane = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.y = -1;
  plane.userData.draggable = true;
  plane.userData.name = 'window';
  facade.add(plane);
  return plane;
}

export { createWindow };
