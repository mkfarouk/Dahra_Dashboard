import { formatNumber } from '../controller/Helpers.js';

export const SidebarView = {
  updateWeather(w) {
    document.getElementById('sidebarTemp').textContent = `${w.temp}°C`;
    document.getElementById('sidebarCondition').textContent = w.condition;
    document.getElementById('sidebarWind').textContent = `${w.wind} km/h`;
    document.getElementById('sidebarHumidity').textContent = `${w.humidity}%`;
    document.getElementById('sidebarPressure').textContent = `${w.pressure} hPa`;
    document.getElementById('sidebarVisibility').textContent = `${w.visibility} km`;
  },
  updateMetrics(metrics) {
    const box = document.getElementById('metricsGrid');
    box.innerHTML = '';
    metrics.forEach(m => {
      const el = document.createElement('div');
      el.className = 'metric-card';
      el.innerHTML = `
        <div class="metric-icon ${m.color}"><i class="${m.icon}"></i></div>
        <div class="metric-value">${typeof m.value === 'number' ? formatNumber(m.value) : m.value}</div>
        <div class="metric-label">${m.label}</div>
        </div>`;
      box.appendChild(el);
    });
  }
};
