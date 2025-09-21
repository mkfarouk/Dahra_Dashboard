import { $, $$, setActive } from './Helpers.js';
import { DataSource } from '../model/DataSource.js';
import { CropModel } from '../model/CropModel.js';
import { CropCardsView } from '../view/CropCardsView.js';
import { SidebarView } from '../view/SidebarView.js';
import { MapsView } from '../view/MapsView.js';
import { ChartsView } from '../view/ChartsView.js';
import { WeatherAnalysisView } from '../view/WeatherAnalysisView.js';
import { fieldGroupFiltering } from '../lib/FieldGroupFiltering.js';

export const AppController = {
  isRefreshing: false, // Add flag to prevent infinite loops
  
  async init() {
    this.showLoading();

    try {
      await DataSource.loadMonthlyCrops();
    } catch (error) {
      console.warn('Monthly crops data unavailable, falling back to mock series.', error);
    }

    try {
      await fieldGroupFiltering.loadFieldData();
    } catch (error) {
      console.warn('Field group data unavailable:', error);
    }

    try {
      this.initDatePicker();
      this.initButtons();

      await ChartsView.initProduction();
      ChartsView.initComparison();
      MapsView.renderCrops();
      WeatherAnalysisView.init();

      CropCardsView.render(document.getElementById('cropCards'), async (key) => {
        CropModel.set('selectedCrop', key);
        CropCardsView.highlight(key);
        this.renderVarietiesOrHide(key);
        await this.refresh();
      });

      SidebarView.updateWeather(CropModel.getWeather());
      const metrics = await CropModel.getMetrics();
      SidebarView.updateMetrics(metrics);
    } catch (error) {
      console.error('App init failed:', error);
    } finally {
      this.hideLoading();
    }
  },

  async refresh() {
    if (this.isRefreshing) {
      return; // Prevent infinite loops
    }
    
    this.isRefreshing = true;
    
    try {
      SidebarView.updateWeather(CropModel.getWeather());
      
      // Await the async getMetrics function
      const metrics = await CropModel.getMetrics();
      SidebarView.updateMetrics(metrics);
      
      await ChartsView.updateProduction();
      ChartsView.updateComparison();
    } finally {
      this.isRefreshing = false;
    }
  },

  renderVarietiesOrHide(key) {
    if (key === 'all') {
      document.getElementById('cropVarieties').classList.remove('active');
      return;
    }
    const crop = DataSource.getAgri()[key];
    if (!crop) {
      console.warn(`Crop not found: ${key}`);
      return;
    }
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


    // Location selector (weather + metrics same as before)
    $('#locationSelector').addEventListener('change', async e=>{
      const selectedLocation = e.target.value;
      CropModel.set('selectedLocation', selectedLocation);
      
      // Show/hide field group filter based on location
      this.updateFieldGroupFilter(selectedLocation);
      
      await this.refresh();
    });

    // Period buttons - optimized
    $$('.chart-btn').forEach(btn=>{
      btn.addEventListener('click', async e=>{
        setActive(e.currentTarget, '.chart-btn');
        CropModel.set('period', e.currentTarget.dataset.period);
        
        // Debounce the chart update
        clearTimeout(this.chartUpdateTimeout);
        this.chartUpdateTimeout = setTimeout(async () => {
          await ChartsView.updateProduction();
        }, 50);
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

  updateFieldGroupFilter(location) {
    const fieldGroupContainer = document.getElementById('fieldGroupContainer');
    
    if (location === 'all') {
      // Hide field group filter for 'all' locations
      if (fieldGroupContainer) {
        fieldGroupContainer.style.display = 'none';
      }
      fieldGroupFiltering.setSelectedFieldGroup('all');
    } else {
      // Show field group filter for specific locations
      if (!fieldGroupContainer) {
        this.createFieldGroupContainer(location);
      }
      
      const fieldGroupSelector = document.getElementById('fieldGroupSelector');
      if (fieldGroupSelector) {
        // Update options based on location
        const fieldGroups = fieldGroupFiltering.getFieldGroupsForLocation(location);
        fieldGroupSelector.innerHTML = '<option value="all">All Field Groups</option>';
        
        fieldGroups.forEach(group => {
          const option = document.createElement('option');
          option.value = group.id;
          option.textContent = group.name;
          fieldGroupSelector.appendChild(option);
        });
        
        // Reset to 'all' when location changes
        fieldGroupSelector.value = 'all';
        fieldGroupFiltering.setSelectedFieldGroup('all');
      }
      
      // Ensure container is visible after first creation/update
      const containerEl = document.getElementById('fieldGroupContainer');
      if (containerEl) containerEl.style.display = 'block';
    }
  },

  createFieldGroupContainer(location = 'toshka') {
    const controlButtons = document.querySelector('.control-buttons');
    const fieldGroupContainer = document.createElement('div');
    fieldGroupContainer.id = 'fieldGroupContainer';
    fieldGroupContainer.style.display = 'none';
    fieldGroupContainer.innerHTML = fieldGroupFiltering.createFieldGroupSelector(location);
    
    // Insert after the dark mode toggle but before the location selector
    const darkModeToggle = controlButtons.querySelector('.dark-mode-toggle');
    const locationSelector = controlButtons.querySelector('#locationSelector');
    
    if (darkModeToggle && locationSelector) {
      controlButtons.insertBefore(fieldGroupContainer, locationSelector);
    } else {
      // Fallback: insert at the beginning of control buttons
      controlButtons.insertBefore(fieldGroupContainer, controlButtons.firstChild);
    }
    
    // Add event listener for field group selector
    const fieldGroupSelector = document.getElementById('fieldGroupSelector');
    if (fieldGroupSelector) {
      fieldGroupSelector.addEventListener('change', async (e) => {
        fieldGroupFiltering.setSelectedFieldGroup(e.target.value);
        
        // Re-render crop cards with new field group data
        const { CropCardsView } = await import('../view/CropCardsView.js');
        await CropCardsView.render(document.getElementById('cropCards'));
        
        // Only refresh metrics and charts, not the full refresh
        const metrics = await CropModel.getMetrics();
        SidebarView.updateMetrics(metrics);
        await ChartsView.updateProduction();
      });
    }
  },

  showLoading(){ document.getElementById('loadingOverlay').classList.add('active'); },
  hideLoading(){ document.getElementById('loadingOverlay').classList.remove('active'); }
};
