// assets/js/lib/TrendAnalysis.js
// Trend analysis module for handling real production data from monthly_crops.json

export class TrendAnalysis {
  constructor() {
    this.monthlyData = null;
    this.monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  /**
   * Load and process monthly crops data
   */
  async loadMonthlyData() {
    try {
      const response = await fetch('./monthly_crops.json');
      if (!response.ok) {
        throw new Error(`Failed to load monthly_crops.json (${response.status})`);
      }
      const data = await response.json();
      this.monthlyData = this.processMonthlyData(data);
      return this.monthlyData;
    } catch (error) {
      console.error('Error loading monthly data:', error);
      return null;
    }
  }

  /**
   * Process raw monthly data into a structured format
   */
  processMonthlyData(rawData) {
    const processedData = {
      allCrops: {},
      individualCrops: {}
    };

    // Initialize monthly arrays for all crops
    const monthlyTotals = Array(12).fill(0);
    const monthlyCounts = Array(12).fill(0);

    // Process each project
    Object.values(rawData).forEach(project => {
      if (typeof project !== 'object' || !project) return;

      Object.values(project).forEach(pumpStation => {
        if (typeof pumpStation !== 'object' || !pumpStation) return;

        Object.entries(pumpStation).forEach(([cropName, cropData]) => {
          if (cropName === 'All' || typeof cropData !== 'object') return;

          // Initialize crop data if not exists
          if (!processedData.individualCrops[cropName]) {
            processedData.individualCrops[cropName] = {
              monthlyProduction: Array(12).fill(0),
              monthlyEfficiency: Array(12).fill(0),
              monthlyCounts: Array(12).fill(0)
            };
          }

          // Process each month's data
          Object.entries(cropData).forEach(([monthName, monthData]) => {
            if (monthName === 'null' || !monthData) return;

            const monthIndex = this.getMonthIndex(monthName);
            if (monthIndex === -1) return;

            const production = parseFloat(monthData.production) || 0;
            const efficiency = parseFloat(monthData.avg_efficiency) || 0;

            // Add to individual crop data
            processedData.individualCrops[cropName].monthlyProduction[monthIndex] += production;
            if (efficiency > 0) {
              processedData.individualCrops[cropName].monthlyEfficiency[monthIndex] += efficiency;
              processedData.individualCrops[cropName].monthlyCounts[monthIndex] += 1;
            }

            // Add to total data
            monthlyTotals[monthIndex] += production;
            if (efficiency > 0) {
              monthlyCounts[monthIndex] += 1;
            }
          });
        });
      });
    });

    // Calculate average efficiency for all crops
    processedData.allCrops = {
      monthlyProduction: monthlyTotals,
      monthlyEfficiency: monthlyTotals.map((total, index) => 
        monthlyCounts[index] > 0 ? total / monthlyCounts[index] : 0
      )
    };

    // Calculate average efficiency for individual crops
    Object.keys(processedData.individualCrops).forEach(cropName => {
      const crop = processedData.individualCrops[cropName];
      crop.monthlyEfficiency = crop.monthlyEfficiency.map((sum, index) => 
        crop.monthlyCounts[index] > 0 ? sum / crop.monthlyCounts[index] : 0
      );
    });

    return processedData;
  }

  /**
   * Get month index from month name
   */
  getMonthIndex(monthName) {
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return monthMap[monthName] !== undefined ? monthMap[monthName] : -1;
  }

  /**
   * Get trend data for a specific crop or all crops
   */
  getTrendData(cropName = 'all', period = '1y') {
    if (!this.monthlyData) {
      console.warn('Monthly data not loaded');
      return this.getEmptyTrendData();
    }

    let data;
    if (cropName === 'all' || cropName === 'All Crops') {
      data = this.monthlyData.allCrops;
    } else {
      // Normalize crop name to match data keys
      const normalizedCropName = this.normalizeCropName(cropName);
      data = this.monthlyData.individualCrops[normalizedCropName];
      
      if (!data) {
        console.warn(`Crop data not found for: ${cropName}`);
        return this.getEmptyTrendData();
      }
    }

    // Apply period filtering
    const filteredData = this.applyPeriodFilter(data, period);

    return {
      labels: this.getFilteredMonthLabels(period),
      series: [
        {
          name: 'Average Production',
          type: 'line',
          data: filteredData.monthlyEfficiency
        },
        {
          name: 'Total Amount',
          type: 'column',
          data: filteredData.monthlyProduction,
          yAxisIndex: 1
        }
      ]
    };
  }

  /**
   * Normalize crop name to match data keys
   */
  normalizeCropName(cropName) {
    const nameMap = {
      'alfalfa': 'AlfaAlfa',
      'alfaalfa': 'AlfaAlfa',
      'wheat': 'Wheat',
      'sugar beet': 'Sugar Beet',
      'sugarbeet': 'Sugar Beet',
      'bean': 'Bean',
      'alffalfa': 'AlfaAlfa',
      'sugar_beet': 'Sugar Beet',
      'sugarbeet': 'Sugar Beet'
    };
    
    const normalized = cropName.toLowerCase().replace(/\s+/g, ' ').trim();
    return nameMap[normalized] || cropName;
  }

  /**
   * Apply period filter to data
   */
  applyPeriodFilter(data, period) {
    const monthlyProduction = [...data.monthlyProduction];
    const monthlyEfficiency = [...data.monthlyEfficiency];

    switch (period) {
      case '6m':
        return {
          monthlyProduction: monthlyProduction.slice(-6),
          monthlyEfficiency: monthlyEfficiency.slice(-6)
        };
      case '2y':
        // For 2 years, we'll show all 12 months (assuming data represents 1 year)
        return {
          monthlyProduction,
          monthlyEfficiency
        };
      case '1y':
      default:
        return {
          monthlyProduction,
          monthlyEfficiency
        };
    }
  }

  /**
   * Get filtered month labels based on period
   */
  getFilteredMonthLabels(period) {
    switch (period) {
      case '6m':
        return this.monthLabels.slice(-6);
      case '2y':
      case '1y':
      default:
        return [...this.monthLabels];
    }
  }

  /**
   * Get empty trend data structure
   */
  getEmptyTrendData() {
    return {
      labels: this.monthLabels,
      series: [
        {
          name: 'Average Production',
          type: 'line',
          data: Array(12).fill(0)
        },
        {
          name: 'Total Amount',
          type: 'column',
          data: Array(12).fill(0),
          yAxisIndex: 1
        }
      ]
    };
  }

  /**
   * Get available crops list
   */
  getAvailableCrops() {
    if (!this.monthlyData) return [];
    return Object.keys(this.monthlyData.individualCrops);
  }

  /**
   * Get total production for a specific crop
   */
  getTotalProduction(cropName = 'all') {
    if (!this.monthlyData) return 0;

    if (cropName === 'all' || cropName === 'All Crops') {
      return this.monthlyData.allCrops.monthlyProduction.reduce((sum, val) => sum + val, 0);
    }

    const normalizedCropName = this.normalizeCropName(cropName);
    const cropData = this.monthlyData.individualCrops[normalizedCropName];
    return cropData ? cropData.monthlyProduction.reduce((sum, val) => sum + val, 0) : 0;
  }

  /**
   * Get average efficiency for a specific crop
   */
  getAverageEfficiency(cropName = 'all') {
    if (!this.monthlyData) return 0;

    if (cropName === 'all' || cropName === 'All Crops') {
      const efficiencies = this.monthlyData.allCrops.monthlyEfficiency.filter(e => e > 0);
      return efficiencies.length > 0 ? efficiencies.reduce((sum, val) => sum + val, 0) / efficiencies.length : 0;
    }

    const normalizedCropName = this.normalizeCropName(cropName);
    const cropData = this.monthlyData.individualCrops[normalizedCropName];
    if (!cropData) return 0;

    const efficiencies = cropData.monthlyEfficiency.filter(e => e > 0);
    return efficiencies.length > 0 ? efficiencies.reduce((sum, val) => sum + val, 0) / efficiencies.length : 0;
  }
}

// Export singleton instance
export const trendAnalysis = new TrendAnalysis();
