import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function createBuildings2(scene: THREE.Scene) {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    'assets/prime2.glb',
    function (gltf) {
      gltf.scene.scale.set(100, 100, 100);
      scene.add(gltf.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100, '% loaded');
    },
    (error) => {
      console.log(error);
    },
  );
}

export { createBuildings2 };
