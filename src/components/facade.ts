import * as THREE from 'three';

const p0 = new THREE.Vector3(-1, 10, 1);
const p1 = new THREE.Vector3(2, 10, -1);

function createFacade() {
  const material2 = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });

  //draw the line for visual reference
  const geometryPoints = [];
  geometryPoints.push(p0, p1);
  const geometry = new THREE.BufferGeometry().setFromPoints(geometryPoints);
  const line = new THREE.Line(geometry, material2);

  return line;
}
function drawFacade() {
  const lengthZone = p1.distanceTo(p0);
  // Plane
  const planeGeom = new THREE.PlaneGeometry(lengthZone, 3);
  const plane = new THREE.Mesh(
    planeGeom,
    new THREE.MeshBasicMaterial({
      color: 'pink',
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    }),
  );

  plane.position.x = (p1.x + p0.x) / 2;
  plane.position.y = (p1.y + p0.y) / 2;
  plane.position.z = (p1.z + p0.z) / 2;
  const roataion = new THREE.Vector3(0, 1, 0);
  plane.lookAt(p0);
  plane.rotateOnAxis(roataion, 1.5708);
  plane.position.y = 2;
  plane.userData.ground = true;

  return plane;
}

export { createFacade, drawFacade };
