import { createBuildings } from './components/buildings';
import { createBuildings2 } from './components/test';
import { createChart } from './components/chart';
import { createFacade, drawFacade } from './components/facade';
import { createGird } from './components/gird';
import { createRays } from './components/rays';
import { createScene } from './components/scene';
import { createWindow } from './components/window';
import { createCamera } from './systems/camera';
import { createControls } from './systems/controls';
import { createRenderer } from './systems/renderer';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import * as THREE from 'three';

const camera = createCamera();
const scene = createScene();
const renderer = createRenderer();
const gird = createGird();
const buildings = createBuildings();
createBuildings2(scene);
const alignment = createFacade();
const facade = drawFacade();
const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2(); // create once
const moveMouse = new THREE.Vector2(); // create once
const POVdata: Array<{ x: number; y: number }> = [];
const chart = createChart(POVdata);
const controls = createControls(camera, renderer.domElement);
let draggable: THREE.Object3D;
let line: THREE.Line;
let lineId = 0;
let ctrlDown = false;
let drawingLine = false;
const measurementLabels: { [key: number]: CSS2DObject } = {};
let intersects: THREE.Intersection[];

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

document.body.append(renderer.domElement);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);

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
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('mousemove', (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (drawingLine) {
    raycaster.setFromCamera(moveMouse, camera);
    intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {
      const positions = line.geometry.attributes.position.array as Array<number>;
      const v0 = new THREE.Vector3(positions[0], positions[1], positions[2]);
      const v1 = new THREE.Vector3(
        intersects[0].point.x,
        intersects[0].point.y,
        intersects[0].point.z,
      );
      positions[3] = intersects[0].point.x;
      positions[4] = intersects[0].point.y;
      positions[5] = intersects[0].point.z;
      line.geometry.attributes.position.needsUpdate = true;
      const distance = v0.distanceTo(v1);
      measurementLabels[lineId].element.innerText = distance.toFixed(2) + 'm';
      measurementLabels[lineId].position.lerpVectors(v0, v1, 0.5);
    }
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'k') {
    createRays(windowSector, POVdata, raycaster, buildings, scene);
  }
  if (event.key === 'Control') {
    ctrlDown = true;
    controls.enabled = false;
    renderer.domElement.style.cursor = 'crosshair';
  }
});

window.addEventListener('keyup', function (event) {
  if (event.key === 'Control') {
    ctrlDown = false;
    controls.enabled = true;
    renderer.domElement.style.cursor = 'pointer';
    if (drawingLine) {
      //delete the last line because it wasn't committed
      scene.remove(line);
      scene.remove(measurementLabels[lineId]);
      drawingLine = false;
    }
  }
});

function drawLine() {
  if (ctrlDown) {
    raycaster.setFromCamera(clickMouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      if (!drawingLine) {
        //start the line
        const points = [];
        points.push(intersects[0].point);
        points.push(intersects[0].point.clone());
        console.log(points);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        line = new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.75,
            // depthTest: false,
            // depthWrite: false
          }),
        );
        line.frustumCulled = false;
        scene.add(line);

        const measurementDiv = document.createElement('div');
        measurementDiv.className = 'measurementLabel';
        measurementDiv.innerText = '0.0m';
        const measurementLabel = new CSS2DObject(measurementDiv);
        measurementLabel.position.copy(intersects[0].point);
        measurementLabels[lineId] = measurementLabel;
        scene.add(measurementLabels[lineId]);
        drawingLine = true;
      } else {
        //finish the line
        const positions = line.geometry.attributes.position.array as Array<number>;
        positions[1] = 10;
        positions[3] = intersects[0].point.x;
        positions[4] = 10; // TODO: remove
        positions[5] = intersects[0].point.z;
        console.log(positions);
        line.geometry.attributes.position.needsUpdate = true;
        lineId++;
        drawingLine = false;
      }
    }
  }
}
window.addEventListener('click', (event) => {
  event.preventDefault();

  if (draggable != null) {
    console.log('dropping draggable', draggable.userData.name);
    draggable = null as unknown as THREE.Object3D;
    createRays(windowSector, POVdata, raycaster, buildings, scene);
    chart.update();
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
  drawLine();
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

function render() {
  labelRenderer.render(scene, camera);
  renderer.render(scene, camera);
}

export function animate() {
  dragObject();
  requestAnimationFrame(animate);
  render();
}

animate();
