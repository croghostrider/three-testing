import { WebGLRenderer } from 'three';

function createRenderer() {
  const renderer = new WebGLRenderer({
    canvas: document.getElementById('app') as HTMLCanvasElement,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}

export { createRenderer };
