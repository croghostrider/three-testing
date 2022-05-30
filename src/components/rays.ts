import {
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  MathUtils,
  LineSegments,
  Mesh,
  Quaternion,
  Raycaster,
  Object3D,
  Scene,
} from 'three';

function RayCheck(
  RayPosition: Vector3,
  startDirection: Vector3,
  upDirection: Vector3,
  raycaster: Raycaster,
  detectObject: Object3D,
  POVdata: Array<{ x: number; y: number }>,
  scene: Scene,
) {
  const direction = startDirection.clone();
  const resolutionAngle = 1;
  const points: Vector3[] = [];

  for (let i = 0; i <= 90; i += resolutionAngle) {
    for (let i2 = 0; i2 <= 180; i2 += resolutionAngle) {
      direction.applyAxisAngle(upDirection, MathUtils.degToRad(-i2));
      direction.applyAxisAngle(startDirection, MathUtils.degToRad(-i));
      raycaster.set(RayPosition, direction);
      const intersects = raycaster.intersectObjects([detectObject]);
      /*       
          const arrowHelper = new ArrowHelper(
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
  const material = new LineBasicMaterial({
    color: 0xff0000,
  });
  const geometryLine = new BufferGeometry().setFromPoints(points);
  const POVLineSegments = new LineSegments(geometryLine, material);
  POVLineSegments.userData.isRay = true;
  scene.add(POVLineSegments);
}

function createRays(
  windowSector: Mesh,
  POVdata: Array<{ x: number; y: number }>,
  raycaster: Raycaster,
  detectObject: Object3D,
  scene: Scene,
) {
  const position = new Vector3();
  const positionAttribute = windowSector.geometry.getAttribute('position');
  const vertex = new Vector3();
  const worldRoatation = new Quaternion();
  const directionLeft = new Vector3();
  windowSector.getWorldPosition(position);
  windowSector.getWorldQuaternion(worldRoatation);
  windowSector.getWorldDirection(directionLeft);
  const up = new Vector3();
  up.copy(windowSector.up).normalize();
  const left = new Vector3();
  left.crossVectors(new Vector3(0, 0, 1), up).normalize();
  directionLeft.applyAxisAngle(windowSector.up, -1.5708);
  POVdata.splice(0, POVdata.length);
  for (let vertexIndex = 2; vertexIndex < 4; vertexIndex++) {
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    vertex.applyQuaternion(worldRoatation);
    vertex.add(position);
    if (vertexIndex == 2) {
      // console.log(vertex);
      RayCheck(vertex, directionLeft, windowSector.up, raycaster, detectObject, POVdata, scene);
    }
  }
}

export { createRays };
