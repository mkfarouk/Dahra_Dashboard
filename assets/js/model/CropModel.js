import { DataSource } from './DataSource.js';
import { sliceByPeriod } from '../controller/Helpers.js';

export const CropModel = (() => {
  const state = {
    selectedCrop: 'all',
    selectedLocation: 'all',
    comparisonLocation: 'both',
    period: '6m', // '6m' | '1y' | '2y'
    dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') }
  };

  function set(key, value) { state[key] = value; }
  function get() { return state; }

  function getProductionSeries() {
    const agri = DataSource.getAgri();

    if (state.selectedCrop === 'all') {
      // Average production line + total amount column (same as your inline code)
      const avgData = Object.values(agri).map(c =>
        c.productionData.reduce((s, v) => s + v, 0) / c.productionData.length
      );
      const amountData = Object.values(agri).map(c =>
        c.amountData.reduce((s, v) => s + v, 0)
      );
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { name: 'Average Production', type: 'line', data: sliceByPeriod(avgData, state.period) },
          { name: 'Total Amount', type: 'column', data: sliceByPeriod(amountData, state.period), yAxisIndex: 1 }
        ]
      };
    }

    const crop = agri[state.selectedCrop];
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        { name: 'Production', type: 'line', data: sliceByPeriod(crop.productionData, state.period) },
        { name: 'Amount', type: 'column', data: sliceByPeriod(crop.amountData, state.period), yAxisIndex: 1 }
      ]
    };
  }

  function getComparisonDataset() {
    const loc = DataSource.getLocations();

    const labels = ['Barley', 'Bean', 'Corn', 'Potatoes', 'Soybean', 'Sugar Beet', 'Wheat', 'Alfalfa'];

    const makeSet = (location) => ({
      label: `${loc[location].name} - Production (tons)`,
      data: Object.values(loc[location].crops).map(c => c.production),
      borderColor: location === 'toshka' ? '#66bb6a' : '#81c784',
      backgroundColor: location === 'toshka' ? 'rgba(102,187,106,0.1)' : 'rgba(129,199,132,0.1)',
      fill: false,
      tension: 0.3
    });

    let datasets = [];
    if (state.comparisonLocation === 'both') {
      datasets = [makeSet('toshka'), makeSet('eastowinat')];
    } else {
      datasets = [makeSet(state.comparisonLocation)];
    }
    return { labels, datasets };
  }

  function getMetrics() {
    const agri = DataSource.getAgri();

    if (state.selectedCrop === 'all') {
      const avgEfficiency = Math.round(Object.values(agri)
        .reduce((s, c) => s + c.avgEfficiency, 0) / Object.keys(agri).length);

      const totalCurrent = Object.values(agri).reduce((s, c) => s + c.currentProduction, 0);
      const totalLast = Object.values(agri).reduce((s, c) => s + c.lastYearProduction, 0);

      return [
        { icon: 'fas fa-cogs', value: `${avgEfficiency}%`, label: 'Avg Efficiency', color: 'text-success', current: avgEfficiency, previous: avgEfficiency - 2 },
        { icon: 'fas fa-warehouse', value: totalCurrent, label: 'Current Production', color: 'text-warning', current: totalCurrent, previous: totalLast },
        { icon: 'fas fa-chart-line', value: totalLast, label: 'Last Year Production', color: 'text-info', current: totalLast, previous: Math.round(totalLast * 0.9) }
      ];
    }

    const c = agri[state.selectedCrop];
    return [
      { icon: 'fas fa-cogs', value: `${c.avgEfficiency}%`, label: 'Avg Efficiency', color: 'text-success', current: c.avgEfficiency, previous: c.avgEfficiency - 2 },
      { icon: 'fas fa-warehouse', value: c.currentProduction, label: 'Current Production', color: 'text-warning', current: c.currentProduction, previous: c.lastYearProduction },
      { icon: 'fas fa-chart-line', value: c.lastYearProduction, label: 'Last Year Production', color: 'text-info', current: c.lastYearProduction, previous: Math.round(c.lastYearProduction * 0.9) }
    ];
  }

  async function getWeather() {
    const apiKey = '2063af61c85641aa8fb120249250909';
    let location = 'Egypt';
    if (state.selectedLocation === 'toshka') {
      location = '22.6137,31.2889,Toshka';
    } else if (state.selectedLocation === 'eastowinat') {
      location = '22.2257,28.7374,Sharq El Owainat';
    }
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no`);
      const data = await response.json();
      // Current weather
      document.getElementById('sidebarTemp').textContent = `${data.current.temp_c}°C`;
      document.getElementById('sidebarCondition').textContent = data.current.condition.text;
      document.getElementById('sidebarWind').textContent = `${data.current.wind_kph} km/h`;
      document.getElementById('sidebarHumidity').textContent = `${data.current.humidity}%`;
      document.getElementById('sidebarPressure').textContent = `${data.current.pressure_mb} hPa`;
      document.getElementById('sidebarVisibility').textContent = `${data.current.vis_km} km`;
      // Forecast
      const forecastDiv = document.getElementById('weatherForecast');
      forecastDiv.innerHTML = '';
      if (data.forecast && data.forecast.forecastday) {
        data.forecast.forecastday.slice(1).forEach((day, idx) => {
          const forecastItem = document.createElement('div');
          forecastItem.className = 'forecast-item';
          let label = '';
          if (idx === 0) label = 'Tomorrow';
          else if (idx === 1) label = 'Day After';
          else label = `${idx + 1} Days`;
          forecastItem.innerHTML = `<span class="forecast-day">${label}</span><span class="forecast-temp">${day.day.maxtemp_c}°C</span>`;
          forecastDiv.appendChild(forecastItem);
        });
      }
    } catch (error) {
      console.error('Weather API error:', error);
    }
  }

  return { set, get, getProductionSeries, getComparisonDataset, getMetrics, getWeather };
})();
