import { DataSource, MONTH_LABELS } from './DataSource.js';
import { sliceByPeriod } from '../controller/Helpers.js';
import { fieldGroupFiltering } from '../lib/FieldGroupFiltering.js';

export const CropModel = (() => {
  const state = {
    selectedCrop: 'all',
    selectedLocation: 'all',
    comparisonLocation: 'both',
    period: '1y', // fixed to 1y; use chart zoom for shorter views
    dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') }
  };

  function set(key, value) { state[key] = value; }
  function get() { return state; }

  function getProductionSeries() {
    const monthly = DataSource.getMonthlyCrops();
    const labels = MONTH_LABELS;

    const normalizeKey = (key) => {
      if (!key || key === 'all') return 'all';
      return String(key).toLowerCase().replace(/\s+/g, '_');
    };

    if (monthly) {
      const targetKey = normalizeKey(state.selectedCrop);

      if (targetKey === 'all') {
        const totals = Array(labels.length).fill(0);
        const counts = Array(labels.length).fill(0);

        Object.entries(monthly).forEach(([key, entry]) => {
          if (key === 'all') return;
          entry.monthlyProduction.forEach((value, idx) => {
            const safeValue = Number(value) || 0;
            totals[idx] += safeValue;
            if (safeValue > 0) counts[idx] += 1;
          });
        });

        const averages = totals.map((sum, idx) => (counts[idx] ? sum / counts[idx] : 0));

        return {
          labels,
          series: [
            { name: 'Average Production', type: 'line', data: sliceByPeriod(averages, state.period) },
            { name: 'Total Amount', type: 'column', data: sliceByPeriod(totals, state.period), yAxisIndex: 1 }
          ]
        };
      }

      const cropEntry = monthly[targetKey];
      if (cropEntry) {
        const monthlyProduction = cropEntry.monthlyProduction.slice(0, labels.length);
        const cumulative = monthlyProduction.reduce((acc, value, idx) => {
          const safeValue = Number(value) || 0;
          acc[idx] = safeValue + (idx ? acc[idx - 1] : 0);
          return acc;
        }, Array(labels.length).fill(0));

        return {
          labels,
          series: [
            { name: 'Production', type: 'line', data: sliceByPeriod(monthlyProduction, state.period) },
            { name: 'Total Amount', type: 'column', data: sliceByPeriod(cumulative, state.period), yAxisIndex: 1 }
          ]
        };
      }
    }

    const agri = DataSource.getAgri();
    const fallbackLabels = labels.length ? labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (state.selectedCrop === 'all') {
      const sums = Array(fallbackLabels.length).fill(0);
      const counts = Array(fallbackLabels.length).fill(0);

      Object.values(agri).forEach(crop => {
        (crop.productionData || []).forEach((value, idx) => {
          const safeValue = Number(value) || 0;
          sums[idx] += safeValue;
          if (safeValue > 0) counts[idx] += 1;
        });
      });

      const averages = sums.map((sum, idx) => (counts[idx] ? sum / counts[idx] : 0));

      return {
        labels: fallbackLabels,
        series: [
          { name: 'Average Production', type: 'line', data: sliceByPeriod(averages, state.period) },
          { name: 'Total Amount', type: 'column', data: sliceByPeriod(sums, state.period), yAxisIndex: 1 }
        ]
      };
    }

    const crop = agri[state.selectedCrop];
    if (!crop) {
      const zeros = Array(fallbackLabels.length).fill(0);
      return {
        labels: fallbackLabels,
        series: [
          { name: 'Production', type: 'line', data: sliceByPeriod(zeros, state.period) },
          { name: 'Amount', type: 'column', data: sliceByPeriod(zeros, state.period), yAxisIndex: 1 }
        ]
      };
    }

    return {
      labels: fallbackLabels,
      series: [
        { name: 'Production', type: 'line', data: sliceByPeriod(crop.productionData, state.period) },
        { name: 'Amount', type: 'column', data: sliceByPeriod(crop.amountData, state.period), yAxisIndex: 1 }
      ]
    };
  }

  function getComparisonDataset() {
    const loc = DataSource.getLocations();

    // Return a promise to handle async data loading
    return new Promise(async (resolve) => {
      try {
        // Try to get both project data from JSON files
        const toshkaProjectData = await DataSource.getToshkaProjectDataForComparison();
        const eastOweinatProjectData = await DataSource.getEastOweinatProjectDataForComparison();

        if (state.comparisonLocation === 'toshka' && toshkaProjectData) {
          // When showing Toshka only: show only crops that are actually grown there
          const labels = ['Sugar Beet', 'Wheat', 'Alfalfa'];
          const data = [
            toshkaProjectData.sugarbeet,               // Sugar Beet from JSON
            toshkaProjectData.wheat,                   // Wheat from JSON
            toshkaProjectData.alfalfa                  // Alfalfa from JSON
          ];
          
          const datasets = [{
            label: `${loc.toshka.name} - Production (tons)`,
            data: data,
            borderColor: '#66bb6a',
            backgroundColor: 'rgba(102,187,106,0.1)',
            fill: false,
            tension: 0.3
          }];
          
          resolve({ labels, datasets });
          
        } else if (state.comparisonLocation === 'eastowinat' && eastOweinatProjectData) {
          // When showing East Oweinat only: show only crops that are actually grown there
          const labels = ['Sugar Beet', 'Wheat'];  // Only Sugar Beet and Wheat in East Oweinat
          const data = [
            eastOweinatProjectData.sugarbeet,          // Sugar Beet from JSON
            eastOweinatProjectData.wheat               // Wheat from JSON
          ];
          
          const datasets = [{
            label: `${loc.eastowinat.name} - Production (tons)`,
            data: data,
            borderColor: '#81c784',
            backgroundColor: 'rgba(129,199,132,0.1)',
            fill: false,
            tension: 0.3
          }];
          
          resolve({ labels, datasets });
          
        } else if (state.comparisonLocation === 'both') {
          // When showing both: show all crops available in either location
          const labels = ['Sugar Beet', 'Wheat', 'Alfalfa'];
          
          // Toshka data: use JSON for available crops
          const toshkaData = [
            toshkaProjectData ? toshkaProjectData.sugarbeet : loc.toshka.crops.sugarbeet.production, // Sugar Beet from JSON
            toshkaProjectData ? toshkaProjectData.wheat : loc.toshka.crops.wheat.production,         // Wheat from JSON
            toshkaProjectData ? toshkaProjectData.alfalfa : loc.toshka.crops.alfalfa.production      // Alfalfa from JSON
          ];
          
          // East Oweinat data: use JSON for available crops, 0 for unavailable ones
          const eastowinatData = [
            eastOweinatProjectData ? eastOweinatProjectData.sugarbeet : loc.eastowinat.crops.sugarbeet.production, // Sugar Beet from JSON
            eastOweinatProjectData ? eastOweinatProjectData.wheat : loc.eastowinat.crops.wheat.production,         // Wheat from JSON
            0  // No Alfalfa in East Oweinat
          ];
          
          const datasets = [
            {
              label: `${loc.toshka.name} - Production (tons)`,
              data: toshkaData,
              borderColor: '#66bb6a',
              backgroundColor: 'rgba(102,187,106,0.1)',
              fill: false,
              tension: 0.3
            },
            {
              label: `${loc.eastowinat.name} - Production (tons)`,
              data: eastowinatData,
              borderColor: '#81c784',
              backgroundColor: 'rgba(129,199,132,0.1)',
              fill: false,
              tension: 0.3
            }
          ];
          
          resolve({ labels, datasets });
          
        } else {
          // Fallback for any other case
          const labels = ['Barley', 'Bean', 'Corn', 'Potatoes', 'Soybean', 'Sugar Beet', 'Wheat', 'Alfalfa'];
          const datasets = [{
            label: `${loc[state.comparisonLocation].name} - Production (tons)`,
            data: Object.values(loc[state.comparisonLocation].crops).map(c => c.production),
            borderColor: state.comparisonLocation === 'toshka' ? '#66bb6a' : '#81c784',
            backgroundColor: state.comparisonLocation === 'toshka' ? 'rgba(102,187,106,0.1)' : 'rgba(129,199,132,0.1)',
            fill: false,
            tension: 0.3
          }];
          
          resolve({ labels, datasets });
        }
        
      } catch (error) {
        console.error('Error loading comparison data:', error);
        // Fallback to default data
        const labels = ['Barley', 'Bean', 'Corn', 'Potatoes', 'Soybean', 'Sugar Beet', 'Wheat', 'Alfalfa'];
        const makeDefaultSet = (location) => ({
          label: `${loc[location].name} - Production (tons)`,
          data: Object.values(loc[location].crops).map(c => c.production),
          borderColor: location === 'toshka' ? '#66bb6a' : '#81c784',
          backgroundColor: location === 'toshka' ? 'rgba(102,187,106,0.1)' : 'rgba(129,199,132,0.1)',
          fill: false,
          tension: 0.3
        });

        let datasets = [];
        if (state.comparisonLocation === 'both') {
          datasets = [makeDefaultSet('toshka'), makeDefaultSet('eastowinat')];
        } else {
          datasets = [makeDefaultSet(state.comparisonLocation)];
        }
        
        resolve({ labels, datasets });
      }
    });
  }

  async function getMetrics() {
    try {
      // Check if field group filtering is active
      const selectedFieldGroup = fieldGroupFiltering.getSelectedFieldGroup();
      const selectedLocation = state.selectedLocation;
      
      if (selectedFieldGroup !== 'all' && selectedLocation !== 'all') {
        // Get field group specific data
        const fieldGroupData = fieldGroupFiltering.getProductionDataForFieldGroup(selectedFieldGroup, selectedLocation);
        
        if (fieldGroupData) {
          // Calculate metrics from field group data
          const totalProduction = Object.values(fieldGroupData).reduce((sum, crop) => sum + crop.totalProduction, 0);
          const avgEfficiency = Object.values(fieldGroupData).reduce((sum, crop) => sum + crop.avgYield, 0) / Object.keys(fieldGroupData).length;
          const lastYearProduction = Math.round(totalProduction * 0.9);
          
          return [
            { 
              icon: 'fas fa-cogs', 
              value: `${Math.round(avgEfficiency * 100) / 100}%`, 
              label: 'AVG Efficiency', 
              color: 'text-success', 
              current: avgEfficiency, 
              previous: Math.max(0, avgEfficiency - 2) 
            },
            { 
              icon: 'fas fa-warehouse', 
              value: `${Math.round(totalProduction).toLocaleString()}`, 
              label: 'Current Production', 
              color: 'text-warning', 
              current: totalProduction, 
              previous: lastYearProduction 
            },
            { 
              icon: 'fas fa-chart-line', 
              value: `${lastYearProduction.toLocaleString()}`, 
              label: 'Last Year', 
              color: 'text-info', 
              current: lastYearProduction, 
              previous: Math.round(lastYearProduction * 0.9) 
            }
          ];
        }
      }

      // Fallback to original logic for all locations or when field group is 'all'
      const response = await fetch('./assets/js/real_data/projects_summary.json');
      const projectsData = await response.json();
      
      // Determine which location data to use based on selectedLocation
      let locationData;
      let locationName = 'All Locations';
      
      if (state.selectedLocation === 'toshka') {
        locationData = projectsData['Toshka project'];
        locationName = 'Toshka';
      } else if (state.selectedLocation === 'eastowinat') {
        locationData = projectsData['East Oweinat Project'];
        locationName = 'East Oweinat';
      } else {
        // For 'all' locations, combine data from both locations
        const toshkaData = projectsData['Toshka project'] || { avg_efficiency: 0, production: 0 };
        const oweinatData = projectsData['East Oweinat Project'] || { avg_efficiency: 0, production: 0 };
        
        locationData = {
          avg_efficiency: (toshkaData.avg_efficiency + oweinatData.avg_efficiency) / 2,
          production: toshkaData.production + oweinatData.production
        };
      }
      
      // Calculate metrics from real data
      const avgEfficiency = Math.round((locationData && locationData.avg_efficiency) || 0);
      const currentProduction = Math.round((locationData && locationData.production) || 0);
      // Simulate last year production as 90% of current (since we don't have historical data)
      const lastYearProduction = Math.round(currentProduction * 0.9);
      
      return [
        { 
          icon: 'fas fa-cogs', 
          value: `${avgEfficiency}%`, 
          label: 'AVG Efficiency', 
          color: 'text-success', 
          current: avgEfficiency, 
          previous: Math.max(0, avgEfficiency - 2) 
        },
        { 
          icon: 'fas fa-warehouse', 
          value: `${currentProduction.toLocaleString()}`, 
          label: 'Current Production', 
          color: 'text-warning', 
          current: currentProduction, 
          previous: lastYearProduction 
        },
        { 
          icon: 'fas fa-chart-line', 
          value: `${lastYearProduction.toLocaleString()}`, 
          label: 'Last Year', 
          color: 'text-info', 
          current: lastYearProduction, 
          previous: Math.round(lastYearProduction * 0.9) 
        }
      ];
      
    } catch (error) {
      console.error('Error loading metrics data:', error);
      
      // Fallback to mock data if real data fails to load
      const agri = DataSource.getAgri();

      if (state.selectedCrop === 'all') {
        const avgEfficiency = Math.round(Object.values(agri)
          .reduce((s, c) => s + c.avgEfficiency, 0) / Object.keys(agri).length);

        const totalCurrent = Object.values(agri).reduce((s, c) => s + c.currentProduction, 0);
        const totalLast = Object.values(agri).reduce((s, c) => s + c.lastYearProduction, 0);

        return [
          { icon: 'fas fa-cogs', value: `${avgEfficiency}%`, label: 'AVG Efficiency', color: 'text-success', current: avgEfficiency, previous: avgEfficiency - 2 },
          { icon: 'fas fa-warehouse', value: totalCurrent, label: 'Current Production', color: 'text-warning', current: totalCurrent, previous: totalLast },
          { icon: 'fas fa-chart-line', value: totalLast, label: 'Last Year', color: 'text-info', current: totalLast, previous: Math.round(totalLast * 0.9) }
        ];
      }

      const c = agri[state.selectedCrop];
      return [
        { icon: 'fas fa-cogs', value: `${c.avgEfficiency}%`, label: 'AVG Efficiency', color: 'text-success', current: c.avgEfficiency, previous: c.avgEfficiency - 2 },
        { icon: 'fas fa-warehouse', value: c.currentProduction, label: 'Current Production', color: 'text-warning', current: c.currentProduction, previous: c.lastYearProduction },
        { icon: 'fas fa-chart-line', value: c.lastYearProduction, label: 'Last Year', color: 'text-info', current: c.lastYearProduction, previous: Math.round(c.lastYearProduction * 0.9) }
      ];
    }
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

