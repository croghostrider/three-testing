import { createBuildings } from './components/buildings';
import { createChart } from './components/chart';
import { createFacade, drawFacade } from './components/facade';
import { createGird } from './components/gird';
import { createRays } from './components/rays';
import { createScene } from './components/scene';
import { createWindow } from './components/window';
import { createCamera } from './systems/camera';
import { createControls } from './systems/controls';
import { createRenderer } from './systems/renderer';
import * as THREE from 'three';

const camera = createCamera();
const scene = createScene();
const renderer = createRenderer();
const gird = createGird();
const buildings = createBuildings();
const alignment = createFacade();
const facade = drawFacade();
const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2(); // create once
const moveMouse = new THREE.Vector2(); // create once
const POVdata: Array<{ x: number; y: number }> = [];
const chart = createChart(POVdata);
let draggable: THREE.Object3D;

document.body.append(renderer.domElement);
createControls(camera, renderer.domElement);
scene.add(gird);
scene.add(camera);
scene.add(buildings);
scene.add(alignment);
scene.add(facade);

const windowSector = createWindow(facade);
createRays(windowSector, POVdata, raycaster, buildings, scene);

export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('mousemove', (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'k') {
    createRays(windowSector, POVdata, raycaster, buildings, scene);
  }
});
window.addEventListener('click', (event) => {
  event.preventDefault();

  if (draggable != null) {
    console.log('dropping draggable', draggable.userData.name);
    draggable = null as unknown as THREE.Object3D;
    createRays(windowSector, POVdata, raycaster, buildings, scene);
    return;
  }
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(clickMouse, camera);
  const found = raycaster.intersectObjects(scene.children);
  if (found.length > 0) {
    for (let i = 0; i < found.length; i++) {
      if (found[i].object.userData.draggable) {
        draggable = found[i].object;
        console.log('found draggable', draggable.userData.name);
        for (let i2 = 0, l = scene.children.length; i2 < l; i2++) {
          if (!scene.children[i2].userData.isRay) continue;
          scene.children[i2].removeFromParent();
          console.log('ray removed');
          chart.update();
        }
      }
    }
  }
});

function intersect(pos: THREE.Vector2) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(scene.children);
}

function dragObject() {
  if (draggable != null) {
    const found = intersect(moveMouse);
    if (found.length > 0) {
      for (let i = 0; i < found.length; i++) {
        if (!found[i].object.userData.ground) continue;
        const target = facade.worldToLocal(found[i].point);
        draggable.position.x = target.x;
        draggable.position.y = target.y;
      }
    }
  }
}

export function animate() {
  dragObject();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
