import { DataSource } from '../model/DataSource.js';

export const CropCardsView = {
  render(container, onSelect) {
    const agri = DataSource.getAgri();
    container.innerHTML = '';
    Object.keys(agri).forEach(key => {
      const crop = agri[key];
      const card = document.createElement('div');
      card.className = `crop-card ${key}`;
      card.dataset.crop = key;
      card.innerHTML = `
        <div class="crop-header">
          <h3 class="crop-name">${crop.name}</h3>
          <span class="crop-icon">${crop.icon}</span>
        </div>
        <div class="crop-stats">
          <div class="stat-item"><div class="stat-value">${crop.avgEfficiency}</div><div class="stat-label">Avg</div></div>
          <div class="stat-item"><div class="stat-value">${crop.productionPerTon}</div><div class="stat-label">Prod/Ton</div></div>
        </div>
      `;
      card.addEventListener('click', ()=> onSelect(key));
      container.appendChild(card);
    });
  },
  highlight(key) {
    document.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
    if (key !== 'all') document.querySelector(`[data-crop="${key}"]`)?.classList.add('selected');
  }
};
