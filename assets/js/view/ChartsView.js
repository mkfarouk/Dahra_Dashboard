// assets/js/view/ChartsView.js
import { CropModel } from '../model/CropModel.js';
import { DataSource } from '../model/DataSource.js';

let productionChart = null;
let comparisonChart = null;

export const ChartsView = {
  initProduction() {
    const data = CropModel.getProductionSeries();
    const colors = this._getProductionColors();

    const options = {
      series: data.series,
      chart: {
        height: 400,
        type: 'line',
        toolbar: { show: true, tools: { download: true, selection: false, zoom: true, zoomin: true, zoomout: true, pan: false, reset: true } },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      colors,
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: [3, 0] },
      markers: { size: 5, colors, strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
      xaxis: { categories: data.labels },
      yaxis: [{ tickAmount: 8 }, { opposite: true, tickAmount: 8 }],
      legend: { position: 'top' },
      grid: { borderColor: '#66bb6a', row: { colors: ['#e8f5e8', 'transparent'], opacity: 0.3 } },
      tooltip: { shared: true, intersect: false }
    };

    productionChart = new window.ApexCharts(document.querySelector('#productionChart'), options);
    productionChart.render();
  },

  updateProduction() {
    if (!productionChart) return;
    const data = CropModel.getProductionSeries();
    const colors = this._getProductionColors();
    productionChart.updateSeries(data.series);
    productionChart.updateOptions({ colors, xaxis: { categories: data.labels } });
  },

  initComparison() {
    const { labels, datasets } = CropModel.getComparisonDataset();
    const ctx = document.createElement('canvas');
    ctx.id = 'comparisonChartCanvas';
    document.getElementById('comparisonChart').appendChild(ctx);

    const config = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' }
        },
        scales: { x: { grid: { color: 'rgba(102,187,106,0.1)', drawBorder: false } }, y: { grid: { color: 'rgba(102,187,106,0.1)', drawBorder: false } } }
      }
    };

    comparisonChart = new window.Chart(ctx, config);
  },

  updateComparison() {
    if (!comparisonChart) return;
    const { labels, datasets } = CropModel.getComparisonDataset();
    comparisonChart.data.labels = labels;
    comparisonChart.data.datasets = datasets;
    comparisonChart.update();
  },

  _getProductionColors() {
    const state = CropModel.get();
    if (state.selectedCrop === 'all') return ['#6FAB4D', '#92A35B'];
    const agri = DataSource.getAgri();
    const color = agri[state.selectedCrop].color;
    return [color, `${color}80`];
  }
};
