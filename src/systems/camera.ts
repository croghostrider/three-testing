import * as THREE from 'three';

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60, // fov = Field Of View
    window.innerWidth / window.innerHeight, // aspect ratio
    0.01, // near clipping plane
    10000, // far clipping plane
  );

  camera.position.y = 16;
  camera.position.z = 40;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  return camera;
}

export { createCamera };
