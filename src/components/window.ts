import { PlaneGeometry, Mesh, MeshBasicMaterial, DoubleSide } from 'three';

function createWindow(facade: Mesh) {
  const geometryPlane = new PlaneGeometry(1, 1);
  const materialPlane = new MeshBasicMaterial({
    color: 0xffff00,
    side: DoubleSide,
  });
  const plane = new Mesh(geometryPlane, materialPlane);
  plane.position.y = -1;
  plane.userData.draggable = true;
  plane.userData.name = 'window';
  facade.add(plane);
  return plane;
}

export { createWindow };
