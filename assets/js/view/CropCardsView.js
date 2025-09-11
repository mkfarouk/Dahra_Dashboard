export const CropCardsView = {
  async render(container) {
    // Fetch real_data/data.json
    const response = await fetch('./assets/js/real_data/data.json');
    const data = await response.json();
    container.innerHTML = '';
  // Only crops with crop_name and harvested_weight
  const crops = data.filter(crop => crop.crop_name && crop.harvested_weight != null);
    const cardsFragment = document.createDocumentFragment();
    crops.forEach((crop, idx) => {
      const key = crop.crop_id || `crop-${idx}`;
      const card = document.createElement('div');
      card.className = `crop-card ${key}`;
      card.dataset.crop = key;
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="crop-header">
          <h3 class="crop-name">${crop.crop_name}</h3>
          <span class="crop-icon">🌱</span>
        </div>
        <div class="crop-stats">
          <div class="stat-item"><div class="stat-value">${crop.harvested_weight ?? '-'}</div><div class="stat-label">Weight</div></div>
          <div class="stat-item"><div class="stat-value">${crop.harvesting_date ?? '-'}</div><div class="stat-label">Date</div></div>
        </div>
      `;
      card.addEventListener('click', () => {
        // Remove highlight from all cards
        container.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        // Show details below all cards
        const detailsSection = document.getElementById('crop-details-section');
        if (detailsSection) {
          detailsSection.innerHTML = `
            <div class="crop-details-box" style="background:#f6fff6;border-radius:32px;padding:32px 40px;box-shadow:0 4px 24px rgba(76,175,80,0.10);margin-top:24px;display:flex;flex-direction:row;gap:48px;align-items:center;min-height:300px;">
              <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:18px;">
                <h2 style="color:#388E3C;margin-bottom:18px;font-size:1.6rem;font-weight:600;">${crop.crop_name} Details</h2>
                <div style="font-size:1.1rem;"><strong>Variety:</strong> <span style="color:#388E3C;">${crop.variety ?? '-'}</span></div>
                <div style="font-size:1.1rem;"><strong>Till Area:</strong> <span style="color:#388E3C;">${crop.till_area ?? '-'}</span></div>
                <div style="font-size:1.1rem;"><strong>Field Name:</strong> <span style="color:#388E3C;">${crop.field_name ?? '-'}</span></div>
              </div>
              <div style="flex:1;display:flex;justify-content:center;align-items:center;">
                <div id="crop-map" style="height:240px;width:100%;max-width:340px;border-radius:18px;box-shadow:0 2px 8px rgba(76,175,80,0.10);"></div>
              </div>
            </div>
          `;
          // Show map if lat/long available
          if (crop.lat && crop.long && window.L) {
            setTimeout(() => {
              const mapDiv = document.getElementById('crop-map');
              mapDiv.innerHTML = '';
              const map = L.map(mapDiv).setView([crop.lat, crop.long], 14);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(map);
              L.marker([crop.lat, crop.long]).addTo(map)
                .bindPopup(`${crop.crop_name} Field`).openPopup();
            }, 100);
          }
        }
      });
      cardsFragment.appendChild(card);
    });
  container.appendChild(cardsFragment);
  // Details section always below all cards, visually separated and filling blank
  const detailsSection = document.createElement('div');
  detailsSection.id = 'crop-details-section';
  detailsSection.style.marginTop = '40px';
  detailsSection.style.width = '100%';
  detailsSection.style.maxWidth = '1200px';
  detailsSection.style.marginLeft = 'auto';
  detailsSection.style.marginRight = 'auto';
  detailsSection.style.display = 'block';
  detailsSection.style.position = 'relative';
  container.parentElement.appendChild(detailsSection);
  },
    // highlight removed, handled inline
  }

