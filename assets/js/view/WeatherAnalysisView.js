import { DataSource } from '../model/DataSource.js';

let chart = null;

export const WeatherAnalysisView = {
  init(containerId = 'weatherAnalysisChart') {
    const el = document.getElementById(containerId);
    if (!el || !window.ApexCharts) return;

    const wq = DataSource.getWeatherQuarters();
    const options = {
      series: [
        { name: 'Temperature (°C)', type: 'line',   data: wq.temperature },
        { name: 'Wind Speed (km/h)', type: 'column', data: wq.wind }
      ],
      chart: { height: 210, type: 'line', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
      colors: ['#ff6b6b', '#4ecdc4'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: [3, 0] },
      markers: { size: 5, colors: ['#ff6b6b'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
      xaxis: { categories: wq.quarters },
      yaxis: [{ title: { text: 'Temperature (°C)' } }, { opposite: true, title: { text: 'Wind Speed (km/h)' } }],
      tooltip: { shared: true, intersect: false },
      legend: { position: 'top' },
      grid: { borderColor: 'rgba(102, 187, 106, 0.1)', strokeDashArray: 3 }
    };

    chart = new window.ApexCharts(el, options);
    chart.render();
  },

  show() {
    document.querySelector('.weather-analysis-section')?.classList.add('show');
  },

  hide() {
    document.querySelector('.weather-analysis-section')?.classList.remove('show');
  }
};


