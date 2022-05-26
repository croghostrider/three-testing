import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Chart from "chart.js/auto";

let POVdata: Array<{ x: number; y: number }> = [];

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
const geometryPlane = new THREE.PlaneGeometry(1, 1);
const materialPlane = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.position.y = 5;
scene.add(plane);

const canvas = <HTMLCanvasElement>document.getElementById("myChart");
// canvas.style.display = "none";

function getDownVertexPosition() {
  const positionAttribute = plane.geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  for (let vertexIndex = 2; vertexIndex < 4; vertexIndex++) {
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    vertex.add(plane.position);
    if (vertexIndex == 2) {
      // console.log(vertex);
      RayCheck(vertex);
    }
  }
  drawPOVchart();
}

function RayCheck(RayPosition: THREE.Vector3) {
  const direction = new THREE.Vector3(-1, 0, 0);
  const verticalAxis = new THREE.Vector3(1, 0, 0);
  const horizontalAxis = new THREE.Vector3(0, -1, 0);
  const resolutionAngle = 1;
  const raycaster = new THREE.Raycaster();

  for (
    let verticalAngle = 0;
    verticalAngle <= 90;
    verticalAngle += resolutionAngle
  ) {
    for (
      let horizontalAngle = 0;
      horizontalAngle <= 180;
      horizontalAngle += resolutionAngle
    ) {
      direction.applyAxisAngle(
        horizontalAxis,
        THREE.MathUtils.degToRad(horizontalAngle)
      );
      direction.applyAxisAngle(
        verticalAxis,
        THREE.MathUtils.degToRad(verticalAngle)
      );
      raycaster.set(RayPosition, direction);
      const intersects = raycaster.intersectObjects([cube]);
      if (intersects.length !== 0) {
        // console.log(intersects);
        POVdata.push({ x: horizontalAngle - 90, y: verticalAngle });
        /*         scene.add(
          new THREE.ArrowHelper(
            direction,
            RayPosition,
            intersects[0].distance,
            0xff0000
            //Math.random() * 0xffffff
          )
        ); */
      }
      direction.set(-1, 0, 0);
    }
  }
}

function drawPOVchart() {
  // Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
  const plugin = {
    id: "custom_canvas_background_color",
    beforeDraw: (chart: Chart) => {
      const ctx: CanvasRenderingContext2D = chart.canvas.getContext("2d")!;
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "grey";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  const chart: Chart = new Chart(canvas, {
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
            // forces step size to be 50 units
            stepSize: 10,
          },
        },
        y: {
          min: 0,
          max: 90,
          ticks: {
            // forces step size to be 50 units
            stepSize: 10,
          },
        },
      },
    },
  });
  chart.update();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
getDownVertexPosition();
controls.update();
