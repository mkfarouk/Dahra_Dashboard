// assets/js/view/ChartsView.js
import { CropModel } from '../model/CropModel.js';
import { DataSource } from '../model/DataSource.js';
import { trendAnalysis } from '../lib/TrendAnalysis.js';

let productionChart = null;
let comparisonChart = null;

export const ChartsView = {
  async initProduction() {
    // Load monthly data first
    await trendAnalysis.loadMonthlyData();
    
    const state = CropModel.get();
    const data = await this.getProductionSeriesData(state.selectedCrop, state.period);
    const colors = this._getProductionColors();

  const options = {
      series: data.series,
      chart: {
        height: 400,
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: false,
            reset: true
          }
        },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      colors,
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: [3, 0] },
      markers: {
        size: 5,
        colors,
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 7 }
      },
      xaxis: {
        categories: data.labels,
        title: {
          text: 'Month',
          style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
        },
        labels: { style: { colors: '#1b5e20', fontSize: '10px' } }
      },
      yaxis: [
        {
          title: {
            text: 'Production (tons)',
            style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
          },
          labels: {
            style: { colors: '#1b5e20', fontSize: '10px' },
            formatter: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(0);
            }
          },
          tickAmount: 8
        },
        {
          opposite: true,
          title: {
            text: 'Amount',
            style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
          },
          labels: {
            style: { colors: '#1b5e20', fontSize: '10px' },
            formatter: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(0);
            }
          },
          tickAmount: 8
        }
      ],
      legend: {
        position: 'top',
        labels: { colors: '#1b5e20', useSeriesColors: false }
      },
      grid: {
        borderColor: '#66bb6a',
        row: { colors: ['#e8f5e8', 'transparent'], opacity: 0.3 },
        xaxis: { lines: { show: true, color: '#e8f5e8', opacity: 0.5 } },
        yaxis: { lines: { show: true, color: '#e8f5e8', opacity: 0.5 } },
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      tooltip: {
        theme: 'light',
        style: { fontSize: '11px' },
        x: { show: true, format: 'MMM yyyy' },
        y: {
          formatter: function (value) {
            if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M tons';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K tons';
            return value.toFixed(0) + ' tons';
          }
        },
        marker: { show: true },
        shared: true,
        intersect: false
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: '60%'
        }
      }
    };

    productionChart = new window.ApexCharts(document.querySelector('#productionChart'), options);
    productionChart.render();
  },

  async updateProduction() {
    if (!productionChart) return;
    
    const state = CropModel.get();
    const data = await this.getProductionSeriesData(state.selectedCrop, state.period);
    const colors = this._getProductionColors();
    productionChart.updateSeries(data.series);
  productionChart.updateOptions({
      colors,
      xaxis: {
        categories: data.labels,
        title: { text: 'Month', style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' } },
        labels: { style: { colors: '#1b5e20', fontSize: '10px' } }
      },
      yaxis: [
        {
          title: { text: 'Production (tons)', style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' } },
          labels: {
            style: { colors: '#1b5e20', fontSize: '10px' },
            formatter: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(0);
            }
          },
          tickAmount: 8
        },
        {
          opposite: true,
          title: { text: 'Amount', style: { color: '#1b5e20', fontSize: '12px', fontFamily: 'Inter, sans-serif' } },
          labels: {
            style: { colors: '#1b5e20', fontSize: '10px' },
            formatter: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(0);
            }
          },
          tickAmount: 8
        }
      ],
      legend: { position: 'top', labels: { colors: '#1b5e20', useSeriesColors: false } },
      grid: {
        borderColor: '#66bb6a',
        row: { colors: ['#e8f5e8', 'transparent'], opacity: 0.3 },
        xaxis: { lines: { show: true, color: '#e8f5e8', opacity: 0.5 } },
        yaxis: { lines: { show: true, color: '#e8f5e8', opacity: 0.5 } },
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      tooltip: {
        theme: 'light',
        style: { fontSize: '11px' },
        x: { show: true, format: 'MMM yyyy' },
        y: {
          formatter: function (value) {
            if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M tons';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K tons';
            return value.toFixed(0) + ' tons';
          }
        },
        marker: { show: true },
        shared: true,
        intersect: false
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: '60%'
        }
      }
    });
  },

  initComparison() {
    // Initialize with empty data first
    const ctx = document.createElement('canvas');
    ctx.id = 'comparisonChartCanvas';
    document.getElementById('comparisonChart').appendChild(ctx);

    const config = {
      type: 'bar',
      data: { labels: [], datasets: [] },
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
    
    // Load data asynchronously after chart is created
    this.updateComparison();
  },

  updateComparison() {
    if (!comparisonChart) return;
    
    // Load data asynchronously and update chart
    CropModel.getComparisonDataset().then(({ labels, datasets }) => {
      // Set custom colors and borderRadius for curved bars
      const updatedDatasets = datasets.map(ds => {
        let backgroundColor = ds.backgroundColor;
        if (ds.label && ds.label.toLowerCase().includes('toshka')) {
          backgroundColor = '#BD9B60';
        } else if (ds.label && ds.label.toLowerCase().includes('east oweinat')) {
          backgroundColor = '#998542';
        }
        return { ...ds, backgroundColor, borderRadius: 10 };
      });
      comparisonChart.data.labels = labels;
      comparisonChart.data.datasets = updatedDatasets;
      comparisonChart.update();
    }).catch(error => {
      console.error('Error updating comparison chart:', error);
    });
  },

  async getProductionSeriesData(selectedCrop, period) {
    try {
      // Ensure monthly data is loaded
      if (!trendAnalysis.monthlyData) {
        await trendAnalysis.loadMonthlyData();
      }
      
      // Get trend data from TrendAnalysis
      const data = trendAnalysis.getTrendData(selectedCrop, period);
      
      return data;
    } catch (error) {
      console.error('Error getting production series data:', error);
      // Fallback to empty data
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          { name: 'Average Production', type: 'line', data: Array(12).fill(0) },
          { name: 'Total Amount', type: 'column', data: Array(12).fill(0), yAxisIndex: 1 }
        ]
      };
    }
  },

  _getProductionColors() {
    const state = CropModel.get();
    if (state.selectedCrop === 'all') return ['#BD9B60', '#998542'];
    const agri = DataSource.getAgri();
    const key = state.selectedCrop || '';
    const direct = agri[key];
    const fallback = key ? agri[key.replace(/_/g, '')] : undefined;
    const cropColor = (direct || fallback)?.color || '#BD9B60';
    return [cropColor, `${cropColor}80`];
  }
};
