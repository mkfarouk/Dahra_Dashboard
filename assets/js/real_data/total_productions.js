// assets/js/real_data/total_productions.js
// Build location-level crop totals from real project JSON files.

// Normalize various crop labels to internal keys used across the app
const normalizeCropKey = (name) => {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  switch (n) {
    case 'sugar beet':
    case 'sugarbeet':
      return 'sugarbeet';
    case 'wheat':
      return 'wheat';
    case 'alfalfa':
    case 'alfaalfa':
    case 'alfa alfa':
      return 'alfalfa';
    case 'barley':
      return 'barley';
    case 'bean':
    case 'beans':
      return 'bean';
    case 'corn':
    case 'maize':
      return 'corn';
    case 'potatoes':
    case 'potato':
      return 'potatoes';
    case 'soybean':
    case 'soya':
      return 'soybean';
    default:
      // leave unknown crops out
      return null;
  }
};

// Sum total_production per crop from a project JSON object
function sumTotalsByCrop(projectObj) {
  const totals = {};
  if (!projectObj || typeof projectObj !== 'object') return totals;
  Object.keys(projectObj).forEach((cropName) => {
    const key = normalizeCropKey(cropName);
    if (!key) return;
    const arr = Array.isArray(projectObj[cropName]) ? projectObj[cropName] : [];
    const total = arr.reduce((s, v) => s + (Number(v.total_production) || 0), 0);
    totals[key] = total;
  });
  return totals;
}

// Compose the locations object expected by MapsView from real totals
export async function computeLocationTotals() {
  try {
    const [toshkaRes, eastRes] = await Promise.all([
      fetch('./project_Toshka_project.json'),
      fetch('./project_East_Oweinat_Project.json')
    ]);

    const [toshkaJson, eastJson] = await Promise.all([
      toshkaRes.ok ? toshkaRes.json() : Promise.resolve(null),
      eastRes.ok ? eastRes.json() : Promise.resolve(null)
    ]);

    const toshkaTotals = sumTotalsByCrop(toshkaJson);
    const eastTotals = sumTotalsByCrop(eastJson);

    const buildCrops = (totals) => {
      const out = {};
      Object.keys(totals).forEach((k) => {
        out[k] = { production: totals[k] };
      });
      return out;
    };

    // Coordinates taken from existing usage in the app (Toshka / East Oweinat)
    return {
      toshka: {
        name: 'Toshka',
        coordinates: [22.6137, 31.2889],
        crops: buildCrops(toshkaTotals)
      },
      eastowinat: {
        name: 'East Oweinat',
        coordinates: [22.2257, 28.7374],
        crops: buildCrops(eastTotals)
      }
    };
  } catch (err) {
    console.error('Error computing location totals from real data:', err);
    return null;
  }
}

