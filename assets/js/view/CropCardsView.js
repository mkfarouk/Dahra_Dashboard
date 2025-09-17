export const CropCardsView = {
  async getVarietiesData(cropName, locationKey) {
    try {
      // Fetch only agricultural data
      const agriculturalModule = await import('../real_data/agriculturalData.js');
      const agriculturalData = agriculturalModule.agriculturalData;
      
      // Function to normalize variety names (remove tabs, trim, case-insensitive)
      const normalizeVarietyName = (name) => {
        return name.replace(/\t/g, '').trim().toLowerCase();
      };
      
      const varietiesMap = {};
      
      // Get varieties from agriculturalData.js only and aggregate by normalized name
      if (agriculturalData[cropName] && agriculturalData[cropName].varieties) {
        agriculturalData[cropName].varieties.forEach(variety => {
          const originalVariety = variety.name;
          const normalizedVariety = normalizeVarietyName(originalVariety);
          
          // Validate coordinates
          if (!variety.location || variety.location.length !== 2 || 
              !Number.isFinite(variety.location[0]) || !Number.isFinite(variety.location[1])) {
            console.warn(`Invalid coordinates for variety ${originalVariety}:`, variety.location);
            return;
          }
          
          const lat = parseFloat(variety.location[0]);
          const lng = parseFloat(variety.location[1]);
          
          // Basic coordinate validation (rough bounds for Egypt)
          if (lat < 20 || lat > 32 || lng < 24 || lng > 37) {
            console.warn(`Coordinates outside Egypt bounds for variety ${originalVariety}:`, [lat, lng]);
            return;
          }
          
          // If variety doesn't exist in map, create it
          if (!varietiesMap[normalizedVariety]) {
            varietiesMap[normalizedVariety] = {
              name: originalVariety.replace(/\t/g, '').trim(),
              totalProduction: 0,
              totalYield: 0,
              locationCount: 0,
              coordinates: [],
              fields: []
            };
          }
          
          // Aggregate data
          varietiesMap[normalizedVariety].totalProduction += parseFloat(variety.total || 0);
          varietiesMap[normalizedVariety].totalYield += parseFloat(variety.avg || 0);
          varietiesMap[normalizedVariety].locationCount += 1;
          
          varietiesMap[normalizedVariety].coordinates.push({
            lat: lat,
            long: lng,
            fieldName: originalVariety.replace(/\t/g, '').trim(),
            production: parseFloat(variety.total || 0),
            groupName: 'Agricultural Data',
            avgYield: parseFloat(variety.avg || 0),
            source: 'agriculturalData.js'
          });
          
          varietiesMap[normalizedVariety].fields.push(variety);
        });
      }
      
      // Convert to array and calculate averages
      const result = Object.values(varietiesMap).map(variety => ({
        ...variety,
        avgYield: variety.locationCount > 0 ? variety.totalYield / variety.locationCount : 0
      }));
      
      // Sort by production descending
      return result.sort((a, b) => b.totalProduction - a.totalProduction);
      
    } catch (error) {
      console.error('Error fetching varieties data:', error);
      return [];
    }
  },

  async render(container) {
    // Fetch crop_lists.json
    const cropListsResponse = await fetch('./assets/js/real_data/crop_lists.json');
    const cropLists = await cropListsResponse.json();
    container.innerHTML = '';

    // Get selected location from selector
    const locationSelector = document.getElementById('locationSelector');
    let selectedLocation = locationSelector ? locationSelector.value : 'all';

    // Add event listener to location selector to clear crop details when changed or same location selected
    if (locationSelector) {
      // Store current value to detect same selection
      const currentValue = locationSelector.value;
      
      // Remove existing event listeners to avoid duplicates
      locationSelector.removeEventListener('change', this.handleLocationChange);
      locationSelector.removeEventListener('click', this.handleLocationClick);
      
      // Add new event listeners
      locationSelector.addEventListener('change', this.handleLocationChange.bind(this));
      locationSelector.addEventListener('click', this.handleLocationClick.bind(this));
      
      // Store the current value for comparison
      locationSelector.dataset.previousValue = currentValue;
    }

    // Map location values to crop_lists keys
    let locationKey = 'All';
    if (selectedLocation === 'toshka') {
      locationKey = 'Toshka';
    } else if (selectedLocation === 'eastowinat') {
      locationKey = 'Oweinat';
    }

    // Get crops for the selected location
    const locationCrops = cropLists[locationKey] || [];

    const cardsFragment = document.createDocumentFragment();
    locationCrops.forEach((cropObj, idx) => {
      // Each crop object has one key (crop name) with production data
      const cropName = Object.keys(cropObj)[0];
      const cropData = cropObj[cropName];
      const cropIcon = this.getCropIcon(cropName);
      
      const key = `crop-${idx}`;
      const card = document.createElement('div');
      card.className = `crop-card ${key}`;
      card.dataset.crop = key;
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="crop-header">
          <h3 class="crop-name">${cropName}</h3>
          <span class="crop-icon">${cropIcon}</span>
        </div>
        <div class="crop-stats">
          <div class="stat-item"><div class="stat-value">${cropData.total_production.toFixed(1)} tons</div><div class="stat-label">Production</div></div>
          <div class="stat-item"><div class="stat-value">${cropData.avg_efficiency.toFixed(2)}</div><div class="stat-label">Yield t/f</div></div>
        </div>
      `;
      card.addEventListener('click', async () => {
        // Remove highlight from all cards
        container.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Get varieties data for this crop
        const varietiesData = await this.getVarietiesData(cropName, locationKey);
        
        // Show details below all cards
        const detailsSection = document.getElementById('crop-details-section');
        if (detailsSection) {
          // Take first 3 varieties for the first column, first row
          const firstRowVarieties = varietiesData.slice(0, 3);
          const remainingVarieties = varietiesData.slice(3);
          
          // Calculate grid positions for remaining varieties
          const remainingVarietiesWithPositions = remainingVarieties.map((variety, index) => {
            let gridColumn, gridRow;
            
            // Start from row 2 for remaining varieties
            if (index % 2 === 0) {
              // Even indices go to column 1
              gridColumn = 1;
              gridRow = 2 + Math.floor(index / 2);
            } else {
              // Odd indices go to column 2
              gridColumn = 2;
              gridRow = 2 + Math.floor(index / 2);
            }
            
            return { ...variety, gridColumn, gridRow };
          });

          const renderVarietyCard = (variety, isMapCard = false, isCompact = false) => `
            <div style="
              background:#fff;
              border-radius:16px;
              padding:${isCompact ? '12px 16px' : '0px 20px 5px'};
              box-shadow:0 2px 8px rgba(76,175,80,0.07);
              border:1px solid #e0f2e9;
              min-width:${isCompact ? '180px' : '220px'};
              ${isMapCard ? 'grid-column: 2; grid-row: 1;' : ''}
              height: fit-content;
              margin-bottom: ${isCompact ? '8px' : 'auto'};
              ${isMapCard ? 'display:flex;flex-direction:column;align-items:center;justify-content:center;' : ''}
            ">
              ${isMapCard ? `<div id="varietiesMap-${key}" style="height:415px;width:100%;max-width:400px;border-radius:18px;box-shadow:0 2px 8px rgba(76,175,80,0.10);background:#f0f8f0;"></div>` : 
              `<div style="font-weight:600;font-size:${isCompact ? '1rem' : '1.1rem'};color:#388E3C;margin-bottom:${isCompact ? '6px' : '8px'};">${variety.name}</div>
              <div style="font-size:${isCompact ? '0.9rem' : '1.02rem'};margin-bottom:2px;"><span style='color:#888;'>Avg Production/Ton:</span> <span style='color:#388E3C;font-weight:600;'>${variety.totalProduction.toFixed(2)}</span></div>
              <div style="font-size:${isCompact ? '0.9rem' : '1.02rem'};margin-bottom:2px;"><span style='color:#888;'>Avg Yield:</span> <span style='color:#388E3C;font-weight:600;'>${variety.avgYield.toFixed(2)}</span></div>
              <div style="font-size:${isCompact ? '0.9rem' : '1.02rem'};"><span style='color:#888;'>Locations:</span> <span style='color:#388E3C;font-weight:600;'>${variety.locationCount}</span></div>`}
            </div>
          `;

          // Create the first column content with 3 varieties
          const firstColumnContent = `
            <div style="grid-column: 1; grid-row: 1; display: flex; flex-direction: column; gap: 8px;">
              ${firstRowVarieties.map(variety => renderVarietyCard(variety, false, true)).join('')}
            </div>
          `;

          // Create map card that takes up column 2, row 1
          const mapCardHtml = renderVarietyCard({}, true);

          // Generate remaining variety cards HTML with grid positions
          const remainingVarietiesHtml = remainingVarietiesWithPositions.map(variety => `
            <div style="grid-column: ${variety.gridColumn}; grid-row: ${variety.gridRow};">
              ${renderVarietyCard(variety)}
            </div>
          `).join('');

          // Calculate the number of rows needed
          const maxRow = Math.max(...remainingVarietiesWithPositions.map(v => v.gridRow), 1);

          detailsSection.innerHTML = `
            <div style="background:#f6fff6;border-radius:24px;padding:32px 40px;box-shadow:0 4px 24px rgba(76,175,80,0.10);margin-top:24px;min-height:400px;">
              <div style="font-size:2rem;font-weight:700;color:#388E3C;margin-bottom:8px;">${cropName} Details</div>
              <div style="font-size:1.15rem;margin-bottom:8px;"><b>Overall AVG Efficiency:</b> <span style='color:#388E3C;'>${cropData.avg_efficiency.toFixed(2)}</span></div>
              <div style="font-size:1.15rem;margin-bottom:18px;"><b>Overall Production/Ton:</b> <span style='color:#388E3C;'>${cropData.total_production.toFixed(2)}</span></div>
              <div style="font-size:1.25rem;font-weight:600;margin-bottom:12px;">Varieties</div>
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: repeat(${maxRow}, auto);
                gap: 16px;
                width: 100%;
              ">
                ${firstColumnContent}
                ${mapCardHtml}
                ${remainingVarietiesHtml}
              </div>
            </div>
          `;

          // Initialize the map for varieties
          this.initializeVarietiesMap(`varietiesMap-${key}`, varietiesData, cropName);
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

  initializeVarietiesMap(mapId, varietiesData, cropName) {
    // Wait for the DOM element to be available
    setTimeout(() => {
      const mapContainer = document.getElementById(mapId);
      if (!mapContainer) return;
      
      // Clear any existing map
      mapContainer.innerHTML = '';
      
      // Get all coordinates for centering
      const allCoords = [];
      varietiesData.forEach(variety => {
        variety.coordinates.forEach(coord => {
          // Validate coordinates before adding
          if (Number.isFinite(coord.lat) && Number.isFinite(coord.long) &&
              coord.lat >= 20 && coord.lat <= 32 && coord.long >= 24 && coord.long <= 37) {
            allCoords.push([coord.lat, coord.long]);
          }
        });
      });
      
      if (allCoords.length === 0) {
        mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:14px;">No valid location data available</div>';
        return;
      }
      
      // Calculate map center
      const centerLat = allCoords.reduce((sum, coord) => sum + coord[0], 0) / allCoords.length;
      const centerLng = allCoords.reduce((sum, coord) => sum + coord[1], 0) / allCoords.length;
      
      // Initialize Leaflet map
      const map = L.map(mapId, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], 10);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);
      
      // Generate distinct colors for each variety using HSL color space
      const generateDistinctColors = (count) => {
        const colors = [];
        const goldenAngle = 137.508; // Golden angle in degrees
        
        for (let i = 0; i < count; i++) {
          const hue = (i * goldenAngle) % 360;
          const saturation = 65 + (i % 3) * 15; // Vary saturation slightly
          const lightness = 45 + (i % 2) * 10;  // Vary lightness slightly
          colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
      };
      
      const colors = generateDistinctColors(varietiesData.length);
      
      // Add markers for each variety
      varietiesData.forEach((variety, varietyIndex) => {
        const color = colors[varietyIndex];
        
        variety.coordinates.forEach(coord => {
          // Skip invalid coordinates
          if (!Number.isFinite(coord.lat) || !Number.isFinite(coord.long) ||
              coord.lat < 20 || coord.lat > 32 || coord.long < 24 || coord.long > 37) {
            return;
          }
          
          const marker = L.circleMarker([coord.lat, coord.long], {
            radius: Math.min(8, Math.max(4, coord.production / 10)), // Size based on production
            fillColor: color,
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });
          
          // Create enhanced popup content
          const popupContent = `
            <div style="font-size:12px;min-width:200px;">
              <div style="font-weight:bold;color:${color};margin-bottom:6px;font-size:13px;">${variety.name}</div>
              <div style="margin-bottom:3px;"><strong>Field:</strong> ${coord.fieldName}</div>
              <div style="margin-bottom:3px;"><strong>Group:</strong> ${coord.groupName}</div>
              <div style="margin-bottom:3px;"><strong>Production:</strong> ${coord.production} tons</div>
              ${coord.avgYield ? `<div style="margin-bottom:3px;"><strong>Avg Yield:</strong> ${coord.avgYield.toFixed(2)}</div>` : ''}
              <div style="font-size:10px;color:#666;margin-top:4px;">Source: ${coord.source}</div>
              <div style="font-size:10px;color:#666;">Lat: ${coord.lat.toFixed(6)}, Lng: ${coord.long.toFixed(6)}</div>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          marker.addTo(map);
        });
      });
      
      // Add enhanced legend
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        div.style.cssText = 'background:white;padding:8px 10px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-size:11px;line-height:18px;max-height:200px;overflow-y:auto;z-index:999;';
        
        let legendHtml = '<div style="font-weight:bold;margin-bottom:6px;font-size:12px;">Varieties</div>';
        varietiesData.forEach((variety, index) => {
          const color = colors[index];
          const validCoords = variety.coordinates.filter(coord => 
            Number.isFinite(coord.lat) && Number.isFinite(coord.long) &&
            coord.lat >= 20 && coord.lat <= 32 && coord.long >= 24 && coord.long <= 37
          );
          
          legendHtml += `
            <div style="display:flex;align-items:center;margin-bottom:2px;">
              <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:6px;border:1px solid white;"></span>
              <span style="flex:1;">${variety.name}</span>
              <span style="font-size:10px;color:#666;margin-left:4px;">(${validCoords.length})</span>
            </div>
          `;
        });
        
        div.innerHTML = legendHtml;
        return div;
      };
      legend.addTo(map);
      
      // Set z-index for the legend container after it's added to the map
      setTimeout(() => {
        const legendContainer = document.querySelector(`#${mapId} .leaflet-bottom.leaflet-right`);
        if (legendContainer) {
          legendContainer.style.zIndex = '999';
        }
      }, 200);
      
      // Fit map to show all valid markers
      if (allCoords.length > 1) {
        const group = new L.featureGroup();
        allCoords.forEach(coord => {
          group.addLayer(L.marker(coord));
        });
        map.fitBounds(group.getBounds().pad(0.1));
      }
      
    }, 100);
  },

  clearCropDetails() {
    // Clear crop details section when location changes
    const detailsSection = document.getElementById('crop-details-section');
    if (detailsSection) {
      detailsSection.innerHTML = '';
    }
    
    // Remove selected class from all crop cards
    const cropCards = document.querySelectorAll('.crop-card');
    cropCards.forEach(card => card.classList.remove('selected'));
  },

  handleLocationChange(event) {
    // Always clear crop details on change
    this.clearCropDetails();
    // Update the previous value
    event.target.dataset.previousValue = event.target.value;
  },

  handleLocationClick(event) {
    // Clear crop details if clicking on the same value
    const currentValue = event.target.value;
    const previousValue = event.target.dataset.previousValue;
    
    if (currentValue === previousValue) {
      this.clearCropDetails();
    }
  },

  getCropIcon(cropName) {
    const icons = {
      'AlfaAlfa': '🌱',
      'Wheat': '🌱',
      'Sugar Beet': '🌱',
      'Bean': '🌱 '
    };
    return icons[cropName] || '🌱';
  }
};

