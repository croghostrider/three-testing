import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function createControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
  const controls = new OrbitControls(camera, domElement);
  return controls;
}

export { createControls };
