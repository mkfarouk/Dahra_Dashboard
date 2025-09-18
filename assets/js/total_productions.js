// assets/js/processed_data/total_productions.js
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

  // 1) Top-level arrays per crop (if present)
  Object.keys(projectObj).forEach((cropName) => {
    const key = normalizeCropKey(cropName);
    if (!key) return;
    const arr = Array.isArray(projectObj[cropName]) ? projectObj[cropName] : [];
    if (arr.length) {
      const total = arr.reduce((s, v) => s + (Number(v.total_production) || 0), 0);
      totals[key] = (totals[key] || 0) + total;
    }
  });

  // 2) Nested group_fields → pump stations → crops → total_production
  const groupFields = projectObj.group_fields;
  if (groupFields && typeof groupFields === 'object') {
    Object.values(groupFields).forEach((ps) => {
      const crops = ps && ps.crops;
      if (!crops || typeof crops !== 'object') return;
      Object.keys(crops).forEach((cropName) => {
        const key = normalizeCropKey(cropName);
        if (!key) return;
        const cropEntry = crops[cropName];
        const totalFromCrop = Number(cropEntry?.total_production) || 0;

        // If varieties exist but total_production is missing, sum varieties
        let totalFromVarieties = 0;
        if (Array.isArray(cropEntry?.varieties)) {
          totalFromVarieties = cropEntry.varieties.reduce((s, v) => s + (Number(v.total_production) || 0), 0);
        }

        const add = totalFromCrop || totalFromVarieties;
        if (add > 0) {
          totals[key] = (totals[key] || 0) + add;
        }
      });
    });
  }

  return totals;
}

// Compose the locations object expected by MapsView from real totals
export async function computeLocationTotals() {
  try {
    const [toshkaRes, eastRes, summaryRes] = await Promise.all([
      fetch('./project_Toshka_project.json'),
      fetch('./project_East_Oweinat_Project.json'),
      // Used to augment totals for crops present only in summary (e.g., Bean)
      fetch('./assets/js/processed_data/projects_summary.json')
    ]);

    const [toshkaJson, eastJson, summaryJson] = await Promise.all([
      toshkaRes.ok ? toshkaRes.json() : Promise.resolve(null),
      eastRes.ok ? eastRes.json() : Promise.resolve(null),
      summaryRes.ok ? summaryRes.json() : Promise.resolve(null)
    ]);

    const toshkaTotals = sumTotalsByCrop(toshkaJson);
    const eastTotals = sumTotalsByCrop(eastJson);

    // Augment with projects_summary.json if available (handles crops like Bean in Toshka)
    const augmentFromSummary = (projectKey, totalsTarget) => {
      const project = summaryJson && summaryJson[projectKey];
      const groupFields = project && project.group_fields;
      if (!groupFields) return;

      // First, build a complete sum per crop across all pump stations from the summary
      const summarySums = {};
      Object.values(groupFields).forEach((ps) => {
        const crops = ps && ps.crops;
        if (!crops) return;
        Object.keys(crops).forEach((cropName) => {
          const key = normalizeCropKey(cropName);
          if (!key) return;
          const crop = crops[cropName];
          const top = Number(crop?.total_production) || 0;
          const fromVarieties = Array.isArray(crop?.varieties)
            ? crop.varieties.reduce((s, v) => s + (Number(v.total_production) || 0), 0)
            : 0;
          const add = top || fromVarieties;
          if (add > 0) {
            summarySums[key] = (summarySums[key] || 0) + add;
          }
        });
      });

      // Then, for crops missing in project totals, fill from the summary sums
      Object.keys(summarySums).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(totalsTarget, key) || totalsTarget[key] === 0) {
          totalsTarget[key] = summarySums[key];
        }
      });
    };

    augmentFromSummary('Toshka project', toshkaTotals);
    augmentFromSummary('East Oweinat Project', eastTotals);

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

