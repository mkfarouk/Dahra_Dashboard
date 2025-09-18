// assets/js/models/DataSource.js
import { agriculturalData, locationData, weatherQuarterData } from '../mock/mockData.js';
import { computeLocationTotals } from '../total_productions.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX = MONTH_LABELS.reduce((acc, month, idx) => {
  acc[month] = idx;
  return acc;
}, {});

let monthlySeriesCache = null;
let monthlyLoadPromise = null;

function normalizeCropKey(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === 'all') return 'all';
  return trimmed.toLowerCase().replace(/\s+/g, '_');
}

function aggregateMonthlyCrops(raw) {
  const perCrop = new Map();

  Object.values(raw || {}).forEach((project) => {
    Object.values(project || {}).forEach((group) => {
      Object.entries(group || {}).forEach(([cropName, months]) => {
        const key = normalizeCropKey(cropName);
        if (!key) return;

        if (!perCrop.has(key)) {
          perCrop.set(key, {
            name: cropName === 'All' ? 'All Crops' : cropName,
            monthlyProduction: Array(MONTH_LABELS.length).fill(0),
            avgSum: Array(MONTH_LABELS.length).fill(0),
            avgCount: Array(MONTH_LABELS.length).fill(0)
          });
        }

        const entry = perCrop.get(key);
        Object.entries(months || {}).forEach(([monthName, metrics]) => {
          const idx = MONTH_INDEX[monthName];
          if (idx === undefined) return; // Skip unknown / null months

          const production = Number(metrics?.production) || 0;
          const avgEff = Number(metrics?.avg_efficiency);

          entry.monthlyProduction[idx] += production;
          if (!Number.isNaN(avgEff) && avgEff > 0) {
            entry.avgSum[idx] += avgEff;
            entry.avgCount[idx] += 1;
          }
        });
      });
    });
  });

  const result = {};
  perCrop.forEach((entry, key) => {
    const monthlyAvgEfficiency = entry.avgSum.map((sum, idx) => {
      const count = entry.avgCount[idx];
      return count ? sum / count : 0;
    });

    result[key] = {
      name: entry.name,
      monthlyProduction: entry.monthlyProduction,
      monthlyAvgEfficiency
    };
  });

  if (!result.all) {
    const totals = Array(MONTH_LABELS.length).fill(0);
    Object.entries(result).forEach(([key, value]) => {
      if (key === 'all') return;
      value.monthlyProduction.forEach((prod, idx) => {
        totals[idx] += prod;
      });
    });
    result.all = {
      name: 'All Crops',
      monthlyProduction: totals,
      monthlyAvgEfficiency: Array(MONTH_LABELS.length).fill(0)
    };
  } else {
    result.all.name = 'All Crops';
    if (!Array.isArray(result.all.monthlyAvgEfficiency)) {
      result.all.monthlyAvgEfficiency = Array(MONTH_LABELS.length).fill(0);
    }
  }

  return result;
}

async function loadMonthlyCropsInternal() {
  const response = await fetch('./monthly_crops.json');
  if (!response.ok) {
    throw new Error(`Failed to load monthly_crops.json (${response.status})`);
  }
  const json = await response.json();
  monthlySeriesCache = aggregateMonthlyCrops(json);
  return monthlySeriesCache;
}

async function ensureMonthlyCrops() {
  if (monthlySeriesCache) return monthlySeriesCache;
  if (!monthlyLoadPromise) {
    monthlyLoadPromise = loadMonthlyCropsInternal().catch((err) => {
      monthlyLoadPromise = null;
      throw err;
    });
  }
  return monthlyLoadPromise;
}

function getData() {
  const data = fetch('./assets/js/model/new_data.json')
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(error => console.error('Error:', error));
  return data;
}

export const DataSource = {
  getAgri() { return agriculturalData; },
  getLocations() { return locationData; },
  getWeatherQuarters() { return weatherQuarterData; },
  getData,
  async loadMonthlyCrops() {
    try {
      return await ensureMonthlyCrops();
    } catch (error) {
      console.error('Error loading monthly crops data:', error);
      return null;
    }
  },
  hasMonthlyCrops() { return Boolean(monthlySeriesCache); },
  getMonthlyCrops() { return monthlySeriesCache; },
  getMonthLabels() { return MONTH_LABELS.slice(); },

  // Real totals per location built from project JSONs
  async getLocationsRealTotals() {
    const real = await computeLocationTotals();
    if (real && typeof real === 'object') return real;
    // Fallback to mock when real aggregation fails
    return locationData;
  },

  // Function to load and process Toshka project data specifically for comparison chart
  async getToshkaProjectDataForComparison() {
    try {
      const response = await fetch('./project_Toshka_project.json');
      const data = await response.json();

      // Calculate totals for comparison chart format
      const processedData = {
        alfalfa: data.AlfaAlfa?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        wheat: data.Wheat?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        sugarbeet: data['Sugar Beet']?.reduce((sum, variety) => sum + variety.total_production, 0) || 0
      };

      return processedData;
    } catch (error) {
      console.error('Error loading Toshka project data:', error);
      return null;
    }
  },

  // Function to load and process East Oweinat project data specifically for comparison chart
  async getEastOweinatProjectDataForComparison() {
    try {
      const response = await fetch('./project_East_Oweinat_Project.json');
      const data = await response.json();

      // Calculate totals for comparison chart format
      const processedData = {
        wheat: data.Wheat?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        sugarbeet: data['Sugar Beet']?.reduce((sum, variety) => sum + variety.total_production, 0) || 0
        // Note: No AlfaAlfa in East Oweinat data
      };

      return processedData;
    } catch (error) {
      console.error('Error loading East Oweinat project data:', error);
      return null;
    }
  }
};

export { MONTH_LABELS };
