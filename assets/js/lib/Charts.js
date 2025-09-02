// assets/js/lib/charts.js
import { DataSource } from '../model/DataSource.js';
import { CropModel } from '../model/CropModel.js';

export function getFilteredProductionData() {
  const agri = DataSource.getAgri();
  const state = CropModel.get();

  if (state.selectedCrop === 'all') {
    const avgData = Object.values(agri).map(crop =>
      crop.productionData.reduce((s, v) => s + v, 0) / crop.productionData.length
    );
    const amountData = Object.values(agri).map(crop =>
      crop.amountData.reduce((s, v) => s + v, 0)
    );
    return [
      { name: 'Average Production', type: 'line', data: avgData },
      { name: 'Total Amount', type: 'column', data: amountData, yAxisIndex: 1 }
    ];
  }

  const crop = agri[state.selectedCrop];
  return [
    { name: 'Production', type: 'line', data: crop.productionData },
    { name: 'Amount', type: 'column', data: crop.amountData, yAxisIndex: 1 }
  ];
}

// 👇 NOW SYNC — no await, no dynamic import
export function getProductionChartColors() {
  const state = CropModel.get();
  if (state.selectedCrop === 'all') return ['#6FAB4D', '#92A35B'];
  const agri = DataSource.getAgri();
  const color = agri[state.selectedCrop].color;
  return [color, `${color}80`];
}
