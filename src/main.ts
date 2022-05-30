import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const raycaster = new THREE.Raycaster(); // create once
const clickMouse = new THREE.Vector2(); // create once
const moveMouse = new THREE.Vector2(); // create once
let draggable: THREE.Object3D;

const POVdata: Array<{ x: number; y: number }> = [];

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("app") as HTMLCanvasElement,
  antialias: true,
});
const width = window.innerWidth;
const height = window.innerHeight;
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 10000);
camera.position.y = 16;
camera.position.z = 40;
camera.lookAt(new THREE.Vector3(0, 0, 0));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);
const controls = new OrbitControls(camera, renderer.domElement);

scene.add(camera);
const gridXZ = new THREE.GridHelper(100, 10);
scene.add(gridXZ);
const geometryBox = new THREE.BoxGeometry(10, 10, 10);
const materialBox = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometryBox, materialBox);
cube.position.x = 2;
cube.position.y = 5;
cube.position.z = -21;
scene.add(cube);

//line is defined by p0-p1
const p0 = new THREE.Vector3(-1, 10, 1);
const p1 = new THREE.Vector3(2, 10, -1);

const material2 = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

//draw the line for visual reference
const geometryPoints = [];
geometryPoints.push(p0, p1);
const geometry = new THREE.BufferGeometry().setFromPoints(geometryPoints);
const line = new THREE.Line(geometry, material2);
scene.add(line);
const lengthZone = p1.distanceTo(p0);
// Plane
const planeGeom = new THREE.PlaneGeometry(lengthZone, 3);
const plane2 = new THREE.Mesh(
  planeGeom,
  new THREE.MeshBasicMaterial({
    color: "pink",
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  })
);

plane2.position.x = (p1.x + p0.x) / 2;
plane2.position.y = (p1.y + p0.y) / 2;
plane2.position.z = (p1.z + p0.z) / 2;
const roataion = new THREE.Vector3(0, 1, 0);

plane2.lookAt(p0);
plane2.rotateOnAxis(roataion, 1.5708);
plane2.position.y = 2;
scene.add(plane2);
plane2.userData.ground = true;

const geometryPlane = new THREE.PlaneGeometry(1, 1);
const materialPlane = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.position.y = -1;
plane2.add(plane);

plane.userData.draggable = true;
plane.userData.name = "Fenster";

const canvas = <HTMLCanvasElement>document.getElementById("myChart");
// canvas.style.display = "none";

function RayCheck(
  RayPosition: THREE.Vector3,
  startDirection: THREE.Vector3,
  upDirection: THREE.Vector3
) {
  const direction = startDirection.clone();
  const resolutionAngle = 1;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= 90; i += resolutionAngle) {
    for (let i2 = 0; i2 <= 180; i2 += resolutionAngle) {
      direction.applyAxisAngle(upDirection, THREE.MathUtils.degToRad(-i2));
      direction.applyAxisAngle(startDirection, THREE.MathUtils.degToRad(-i));
      raycaster.set(RayPosition, direction);
      const intersects = raycaster.intersectObjects([cube]);
      /*       
        const arrowHelper = new THREE.ArrowHelper(
        direction,
        RayPosition,
        10,
        0xff0000
      );
      scene.add(arrowHelper);
       */
      if (intersects.length !== 0) {
        //console.log(intersects[0].point);
        POVdata.push({ x: i2 - 90, y: i });
        points.push(RayPosition);
        points.push(intersects[0].point);
      }
      direction.copy(startDirection);
    }
  }
  const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
  });
  const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
  const LineSegments = new THREE.LineSegments(geometryLine, material);
  scene.add(LineSegments);
}
let chart: Chart;
function createChart() {
  // Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
  const plugin = {
    id: "custom_canvas_background_color",
    beforeDraw: (chart: Chart) => {
      let ctx: CanvasRenderingContext2D | null;
      if (!(ctx = canvas.getContext("2d"))) {
        throw new Error(
          `2d context not supported or canvas already initialized`
        );
      }
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "grey";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  chart = new Chart(canvas, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "POV Links",
          data: POVdata,
          backgroundColor: "rgb(255, 99, 132)",
        },
      ],
    },
    plugins: [plugin],
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          min: -90,
          max: 90,
          ticks: {
            stepSize: 10,
          },
        },
        y: {
          min: 0,
          max: 90,
          ticks: {
            stepSize: 10,
          },
        },
      },
    },
  });
}

function getDownVertexPosition() {
  const position = new THREE.Vector3();
  const positionAttribute = plane.geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  const worldRoatation = new THREE.Quaternion();
  const directionLeft = new THREE.Vector3();
  plane.getWorldPosition(position);
  plane.getWorldQuaternion(worldRoatation);
  plane.getWorldDirection(directionLeft);
  const up = new THREE.Vector3();
  up.copy(plane.up).normalize();
  const left = new THREE.Vector3();
  left.crossVectors(new THREE.Vector3(0, 0, 1), up).normalize();

  directionLeft.applyAxisAngle(plane.up, -1.5708);

  for (let vertexIndex = 2; vertexIndex < 4; vertexIndex++) {
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    vertex.applyQuaternion(worldRoatation);
    vertex.add(position);
    if (vertexIndex == 2) {
      // console.log(vertex);
      RayCheck(vertex, directionLeft, plane.up);
    }
  }
  chart.update();

  POVdata.splice(0, POVdata.length);
}
/* 
function get3dPointZAxis(event) {
  const vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );
  projector.unprojectVector(vector, camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  return pos;
}

function stopDraw(event) {
  if (lastPoint) {
    const pos = get3dPointZAxis(event);
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });
    const geometry = new THREE.Geometry();
    if (
      Math.abs(lastPoint.x - pos.x) < 2000 &&
      Math.abs(lastPoint.y - pos.y) < 2000 &&
      Math.abs(lastPoint.z - pos.z) < 2000
    ) {
      geometry.vertices.push(lastPoint);
      geometry.vertices.push(pos);

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lastPoint = pos;
    } else {
      console.debug(
        lastPoint.x.toString() +
          ":" +
          lastPoint.y.toString() +
          ":" +
          lastPoint.z.toString() +
          ":" +
          pos.x.toString() +
          ":" +
          pos.y.toString() +
          ":" +
          pos.z.toString()
      );
    }
  }
}
 */

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
        const target = plane2.worldToLocal(found[i].point);
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

export function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "k") {
    getDownVertexPosition();
  }
});
window.addEventListener("resize", onWindowResize);
window.addEventListener("mousemove", (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener("click", (event) => {
  event.preventDefault();

  if (draggable != null) {
    console.log(`dropping draggable ${draggable.userData.name}`);
    draggable = null as unknown as THREE.Object3D;
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
        console.log(`found draggable ${draggable.userData.name}`);
      }
    }
  }
});

animate();
createChart();
controls.update();
