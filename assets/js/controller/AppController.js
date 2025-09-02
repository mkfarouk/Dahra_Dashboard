import { $, $$, setActive } from './Helpers.js';
import { DataSource } from '../model/DataSource.js';
import { CropModel } from '../model/CropModel.js';
import { CropCardsView } from '../view/CropCardsView.js';
import { SidebarView } from '../view/SidebarView.js';
import { MapsView } from '../view/MapsView.js';
import { ChartsView } from '../view/ChartsView.js';
import { WeatherAnalysisView } from '../view/WeatherAnalysisView.js';

export const AppController = {
  init() {
    this.showLoading();

    // Controls
    this.initDatePicker();
    this.initButtons();

    // UI pieces (init heavy components first, then cards to avoid any flicker)
    ChartsView.initProduction();
    ChartsView.initComparison();
    MapsView.renderCrops();
    WeatherAnalysisView.init();

    CropCardsView.render(document.getElementById('cropCards'), (key) => {
      CropModel.set('selectedCrop', key);
      CropCardsView.highlight(key);
      this.renderVarietiesOrHide(key);
      this.refresh();
    });
    SidebarView.updateWeather(CropModel.getWeather());
    SidebarView.updateMetrics(CropModel.getMetrics());

    this.hideLoading();
  },

  refresh() {
    SidebarView.updateWeather(CropModel.getWeather());
    SidebarView.updateMetrics(CropModel.getMetrics());
    ChartsView.updateProduction();
    ChartsView.updateComparison();
  },

  renderVarietiesOrHide(key) {
    if (key === 'all') {
      document.getElementById('cropVarieties').classList.remove('active');
      return;
    }
    const crop = DataSource.getAgri()[key];
    document.getElementById('selectedCropName').textContent = crop.name;
    const list = document.getElementById('varietiesGrid');
    list.innerHTML = crop.varieties.map(v => `
      <div class="variety-card">
        <div class="variety-name"><div class="variety-color-dot" style="background:${v.color}"></div>${v.name}</div>
        <div class="variety-stats">
          <div class="variety-stat"><div class="variety-stat-value">${v.total}</div><div class="variety-stat-label">Total</div></div>
          <div class="variety-stat"><div class="variety-stat-value">${v.avg}</div><div class="variety-stat-label">Avg</div></div>
        </div>
      </div>
    `).join('');
    MapsView.renderVarieties(crop);
    document.getElementById('cropVarieties').classList.add('active');
  },

  initDatePicker() {
    if (typeof window.flatpickr !== 'function') return;
    window.flatpickr('#datePicker', {
      mode: 'range',
      dateFormat: 'Y-m-d',
      defaultDate: ['2025-01-01', '2025-12-31'],
      onChange: (dates) => {
        if (dates.length === 2) {
          CropModel.set('dateRange', { start: dates[0], end: dates[1] });
        }
      }
    });
  },

  initButtons() {
    // Theme
    $('#darkModeToggle').addEventListener('click', ()=>{
      const body = document.body;
      const icon = $('#darkModeToggle i');
      const dark = body.getAttribute('data-theme') === 'dark';
      if (dark) { body.removeAttribute('data-theme'); icon.className='fas fa-moon'; }
      else      { body.setAttribute('data-theme','dark'); icon.className='fas fa-sun'; }
    });

    // Crop selector (dropdown)
    $('#cropSelector').addEventListener('change', e=>{
      CropModel.set('selectedCrop', e.target.value);
      CropCardsView.highlight(e.target.value);
      this.renderVarietiesOrHide(e.target.value);
      this.refresh();
    });

    // Location selector (weather + metrics same as before)
    $('#locationSelector').addEventListener('change', e=>{
      CropModel.set('selectedLocation', e.target.value);
      this.refresh();
    });

    // Period buttons
    $$('.chart-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        setActive(e.currentTarget, '.chart-btn');
        CropModel.set('period', e.currentTarget.dataset.period);
        ChartsView.updateProduction();
      });
    });

    // Comparison tabs
    $$('.location-tab').forEach(tab=>{
      tab.addEventListener('click', e=>{
        setActive(e.currentTarget, '.location-tab');
        CropModel.set('comparisonLocation', e.currentTarget.dataset.location);
        ChartsView.updateComparison();
      });
    });
  },

  showLoading(){ document.getElementById('loadingOverlay').classList.add('active'); },
  hideLoading(){ document.getElementById('loadingOverlay').classList.remove('active'); }
};
