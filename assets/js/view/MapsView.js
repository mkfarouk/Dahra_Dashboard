// assets/js/view/MapsView.js
import { DataSource } from '../model/DataSource.js';

let varietiesMap = null;
let cropsMap = null;

function ensureLeaflet() {
  if (!window.L) { console.error('Leaflet not available'); return false; }
  return true;
}

export const MapsView = {
  async renderCrops() {
    if (!ensureLeaflet()) return;
    const containerId = 'cropsMapContainer';
    const el = document.getElementById(containerId);
    if (!el) return;
    if (cropsMap) { try { cropsMap.remove(); } catch(_){} cropsMap = null; }

    cropsMap = window.L.map(containerId).setView([23.5, 30.5], 6);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(cropsMap);

    const locations = await DataSource.getLocationsRealTotals();
    const agri = DataSource.getAgri();
    const markers = [];
    Object.keys(locations).forEach(key => {
      const loc = locations[key];
      const m = window.L.circleMarker(loc.coordinates, { radius:12, fillColor: key==='toshka'?'#66bb6a':'#81c784', color:'#ffffff', weight:3, opacity:1, fillOpacity:0.8 }).addTo(cropsMap);
      const items = Object.keys(loc.crops).map(cropKey => {
        const crop = loc.crops[cropKey];
        const meta = agri[cropKey] || {};
        const color = meta.color || '#66bb6a';
        const icon = meta.icon || '';
        const name = meta.name || cropKey;
        return `<div style="background:#f0f0f0;padding:4px;border-radius:4px;border-left:3px solid ${color};"><div style="font-weight:bold;">${icon} ${crop.production>1000?(crop.production/1000).toFixed(1)+'K':crop.production}</div><div style="color:#666;font-size:.7rem;">${name}</div></div>`;
      }).join('');
      m.bindPopup(`<div style="text-align:center;font-family:Inter, sans-serif;"><h4 style="margin:0 0 10px 0;color:#2e7d32;">${loc.name}</h4><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">${items}</div></div>`);
      markers.push(m);
    });
    if (markers.length) {
      const group = new window.L.featureGroup(markers);
      try { cropsMap.fitBounds(group.getBounds().pad(0.1)); } catch(_){}
      setTimeout(()=>{ try{ cropsMap.invalidateSize(); }catch(_){} }, 100);
    }
  },

  renderVarieties(crop) {
    if (!ensureLeaflet()) return;
    const containerId = 'varietiesMapContainer';
    const el = document.getElementById(containerId);
    if (!el) return;
    if (varietiesMap) { try { varietiesMap.remove(); } catch(_){} varietiesMap = null; }

    varietiesMap = window.L.map(containerId).setView([24.0889, 32.8998], 8);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(varietiesMap);

    const markers = [];
    (crop.varieties || []).forEach(v => {
      if (!Array.isArray(v.location) || v.location.length !== 2) return;
      const m = window.L.circleMarker(v.location, { radius:8, fillColor:v.color, color:'#ffffff', weight:2, opacity:1, fillOpacity:0.8 }).addTo(varietiesMap);
      m.bindPopup(`
        <div style="text-align:center; font-family: Inter, sans-serif;">
          <h4 style="margin:0 0 8px 0; color:${v.color}; display:flex; align-items:center; justify-content:center; gap:5px;">
            <div style="width:10px; height:10px; border-radius:50%; background-color:${v.color};"></div>
            ${v.name}
          </h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
            <div style="background:#f0f0f0;padding:4px;border-radius:4px;"><div style="font-weight:bold;color:#2e7d32;">${v.total}</div><div style="font-size:.7rem;color:#666;">Total</div></div>
            <div style="background:#f0f0f0;padding:4px;border-radius:4px;"><div style="font-weight:bold;color:#2e7d32;">${v.avg}</div><div style="font-size:.7rem;color:#666;">Avg</div></div>
          </div>
        </div>
      `);
      markers.push(m);
    });
    if (markers.length) {
      const group = new window.L.featureGroup(markers);
      try { varietiesMap.fitBounds(group.getBounds().pad(0.1)); } catch(_){}
      setTimeout(()=>{ try{ varietiesMap.invalidateSize(); }catch(_){} }, 100);
    }
  },

  async renderCropsMap(mapContainerId) {
    const response = await fetch('./assets/js/real_data/data.json');
    const data = await response.json();
    const crops = data.filter(crop => crop.lat && crop.long);
    const mapDiv = document.getElementById(mapContainerId);
    mapDiv.innerHTML = '';
    if (!window.L) return;
    const map = L.map(mapDiv).setView([crops[0].lat, crops[0].long], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    crops.forEach(crop => {
      const marker = L.marker([crop.lat, crop.long]).addTo(map);
      marker.bindPopup(`<strong>${crop.crop_name}</strong>`);
    });
    // Fit map to all markers
    const bounds = L.latLngBounds(crops.map(crop => [crop.lat, crop.long]));
    map.fitBounds(bounds.pad(0.1));
  }
};
