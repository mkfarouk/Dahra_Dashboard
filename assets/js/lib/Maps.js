// assets/js/lib/Maps.js
// Small, framework-agnostic helpers for Leaflet maps & popups

/**
 * Number pretty printer: 1234 -> "1.2K", 2000000 -> "2.0M"
 */
export function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

/**
 * After adding markers, fit bounds and then invalidate size (for flex containers)
 */
export function fitAndInvalidate(map, markers) {
  if (!map || !markers.length) return;
  const group = new window.L.featureGroup(markers);
  try {
    map.fitBounds(group.getBounds().pad(0.1));
  } catch (_) { /* ignore */ }

  // give the container a tick to lay out
  setTimeout(() => {
    try { map.invalidateSize(); } catch (_) {}
  }, 100);
}

/**
 * Create a circle marker with a common style
 */
export function circleMarker(map, latlng, fillColor, radius = 10, weight = 2) {
  return window.L.circleMarker(latlng, {
    radius,
    fillColor,
    color: '#ffffff',
    weight,
    opacity: 1,
    fillOpacity: 0.85
  }).addTo(map);
}

/**
 * Build popup HTML for a LOCATION bubble (sidebar map)
 */
export function buildLocationPopup(location, agri) {
  // location.crops is an object keyed by cropKey
  const items = Object.keys(location.crops).map((cropKey) => {
    const crop = location.crops[cropKey];
    const meta = agri[cropKey];
    if (!meta) return '';
    return `
      <div style="
        background:#f0f0f0;
        padding:6px;
        border-radius:6px;
        border-left:3px solid ${meta.color};
        display:flex;justify-content:space-between;align-items:center;
      ">
        <div style="font-weight:600">${meta.icon} ${meta.name}</div>
        <div style="color:#2e7d32;font-weight:700">${fmt(crop.production)}</div>
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: Inter, sans-serif; min-width:200px;">
      <h4 style="margin:0 0 10px 0; color:#2e7d32; font-weight:700;">
        ${location.name}
      </h4>
      <div style="display:grid; gap:6px; grid-template-columns:1fr;">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Build popup HTML for a VARIETY bubble (center map in Varieties section)
 */
export function buildVarietyPopup(variety) {
  return `
    <div style="text-align:center; font-family: Inter, sans-serif;">
      <h4 style="
        margin:0 0 8px 0;
        color:${variety.color};
        display:flex;align-items:center;justify-content:center;gap:6px;
        font-weight:700;
      ">
        <span style="
          width:10px;height:10px;border-radius:50%;
          background:${variety.color};display:inline-block;
        "></span>
        ${variety.name}
      </h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:#f0f0f0;padding:6px;border-radius:6px;">
          <div style="font-weight:800;color:#2e7d32;">${fmt(variety.total)}</div>
          <div style="font-size:.75rem;color:#666;">Total</div>
        </div>
        <div style="background:#f0f0f0;padding:6px;border-radius:6px;">
          <div style="font-weight:800;color:#2e7d32;">${variety.avg}</div>
          <div style="font-size:.75rem;color:#666;">Avg</div>
        </div>
      </div>
    </div>
  `;
}
