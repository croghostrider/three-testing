import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function createControls(camera: PerspectiveCamera, domElement: HTMLElement) {
  const controls = new OrbitControls(camera, domElement);
  return controls;
}

export { createControls };
