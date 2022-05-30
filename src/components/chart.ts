import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function createChart(POVdata: Array<{ x: number; y: number }>) {
  const canvas = <HTMLCanvasElement>document.getElementById('myChart');
  // canvas.style.display = "none";
  const plugin = {
    id: 'custom_canvas_background_color',
    beforeDraw: (chart: Chart) => {
      let ctx: CanvasRenderingContext2D | null;
      if (!(ctx = canvas.getContext('2d'))) {
        throw new Error('2d context not supported or canvas already initialized');
      }
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  const chart = new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'POV Links',
          data: POVdata,
          backgroundColor: 'rgb(255, 99, 132)',
        },
      ],
    },
    plugins: [plugin],
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
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
  return chart;
}

export { createChart };
