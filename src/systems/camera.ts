import { PerspectiveCamera, Vector3 } from 'three';

function createCamera() {
  const camera = new PerspectiveCamera(
    60, // fov = Field Of View
    window.innerWidth / window.innerHeight, // aspect ratio
    0.01, // near clipping plane
    10000, // far clipping plane
  );

  camera.position.y = 16;
  camera.position.z = 40;
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

export { createCamera };
