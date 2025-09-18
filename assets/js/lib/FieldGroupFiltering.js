// assets/js/lib/FieldGroupFiltering.js
// Field group filtering module for pump stations and field groups

export class FieldGroupFiltering {
  constructor() {
    this.fieldGroups = null;
    this.folders = null;
    this.fieldData = null;
    this.selectedFieldGroup = 'all';
    this.cache = new Map(); // Add caching to prevent repeated calculations
  }

  /**
   * Load field groups and folders data
   */
  async loadFieldData() {
    try {
      const [fieldGroupsResponse, foldersResponse, dataResponse] = await Promise.all([
        fetch('./gfields.json'),
        fetch('./gfolders.json'),
        fetch('./data.json')
      ]);

      if (!fieldGroupsResponse.ok || !foldersResponse.ok || !dataResponse.ok) {
        throw new Error('Failed to load field data');
      }

      this.fieldGroups = await fieldGroupsResponse.json();
      this.folders = await foldersResponse.json();
      this.fieldData = await dataResponse.json();

      return {
        fieldGroups: this.fieldGroups,
        folders: this.folders,
        fieldData: this.fieldData
      };
    } catch (error) {
      console.error('Error loading field data:', error);
      return null;
    }
  }

  /**
   * Get field groups for a specific location
   */
  getFieldGroupsForLocation(location) {
    if (!this.fieldGroups || !this.folders) return [];

    // Map location names to folder IDs
    const locationMap = {
      'toshka': 435,        // Toshka project
      'eastowinat': 438,    // East Oweinat Project
      'salheya': 439        // Salheya Project
    };

    const folderId = locationMap[location];
    if (!folderId) return [];

    // Get all field groups for this location
    const fieldGroups = this.fieldGroups.data.filter(field => 
      field.group_folder_id === folderId
    );

    return fieldGroups.map(field => ({
      id: field.id,
      name: field.name,
      description: field.description
    }));
  }

  /**
   * Get data filtered by field group
   */
  getDataByFieldGroup(fieldGroupId, location) {
    if (!this.fieldData || fieldGroupId === 'all') {
      return this.fieldData;
    }

    // Filter data by field group ID (using field_group_id, not group_folder_id)
    const filteredData = this.fieldData.filter(item => 
      item.field_group_id === parseInt(fieldGroupId)
    );

    return filteredData;
  }

  /**
   * Get production data for a specific field group
   */
  getProductionDataForFieldGroup(fieldGroupId, location) {
    // Check cache first
    const cacheKey = `${fieldGroupId}-${location}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const filteredData = this.getDataByFieldGroup(fieldGroupId, location);
    
    if (!filteredData || !Array.isArray(filteredData)) {
      return null;
    }

    // Group by crop and calculate totals
    const cropData = {};
    
    filteredData.forEach(item => {
      const cropName = item.crop_name;
      if (!cropData[cropName]) {
        cropData[cropName] = {
          totalProduction: 0,
          totalYield: 0,
          count: 0
        };
      }
      
      // Use harvested_weight for production and productivity for yield
      cropData[cropName].totalProduction += parseFloat(item.harvested_weight || 0);
      cropData[cropName].totalYield += parseFloat(item.productivity || 0);
      cropData[cropName].count += 1;
    });

    // Calculate averages
    Object.keys(cropData).forEach(crop => {
      if (cropData[crop].count > 0) {
        cropData[crop].avgYield = cropData[crop].totalYield / cropData[crop].count;
      }
    });

    // Cache the result
    this.cache.set(cacheKey, cropData);
    return cropData;
  }

  /**
   * Get monthly production data for field group
   */
  getMonthlyProductionForFieldGroup(fieldGroupId, location) {
    const filteredData = this.getDataByFieldGroup(fieldGroupId, location);
    
    if (!filteredData || !Array.isArray(filteredData)) return null;

    // Group by month and crop
    const monthlyData = {};
    
    filteredData.forEach(item => {
      const date = new Date(item.harvesting_date);
      const month = date.getMonth(); // 0-11
      const cropName = item.crop_name;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }
      
      if (!monthlyData[month][cropName]) {
        monthlyData[month][cropName] = 0;
      }
      
      monthlyData[month][cropName] += parseFloat(item.harvested_weight || 0);
    });

    return monthlyData;
  }

  /**
   * Create field group selector HTML
   */
  createFieldGroupSelector(location) {
    const fieldGroups = this.getFieldGroupsForLocation(location);
    
    if (fieldGroups.length === 0) {
      return '';
    }

    let html = `
      <select id="fieldGroupSelector" class="modern-select field-group-select">
        <option value="all">🏭 All Pump Stations</option>
    `;

    fieldGroups.forEach(group => {
      html += `<option value="${group.id}">🏭 ${group.name}</option>`;
    });

    html += `
      </select>
    `;

    return html;
  }

  /**
   * Set selected field group
   */
  setSelectedFieldGroup(fieldGroupId) {
    this.selectedFieldGroup = fieldGroupId;
    // Clear cache when field group changes
    this.cache.clear();
  }

  /**
   * Get selected field group
   */
  getSelectedFieldGroup() {
    return this.selectedFieldGroup;
  }

  /**
   * Get field group name by ID
   */
  getFieldGroupName(fieldGroupId) {
    if (!this.fieldGroups || fieldGroupId === 'all') return 'All Field Groups';
    
    const fieldGroup = this.fieldGroups.data.find(fg => fg.id === fieldGroupId);
    return fieldGroup ? fieldGroup.name : 'Unknown Field Group';
  }

  /**
   * Get varieties data for a specific field group and crop
   */
  getVarietiesDataForFieldGroup(fieldGroupId, location, cropName) {
    const filteredData = this.getDataByFieldGroup(fieldGroupId, location);
    
    if (!filteredData || !Array.isArray(filteredData)) {
      return [];
    }

    // Filter by crop name and group by variety
    const cropData = filteredData.filter(item => item.crop_name === cropName);
    const varietiesMap = {};
    
    cropData.forEach(item => {
      const varietyName = item.variety || 'Unknown Variety';
      
      if (!varietiesMap[varietyName]) {
        varietiesMap[varietyName] = {
          name: varietyName,
          totalProduction: 0,
          totalYield: 0,
          locationCount: 0,
          coordinates: [],
          fields: []
        };
      }
      
      // Aggregate data
      varietiesMap[varietyName].totalProduction += parseFloat(item.harvested_weight || 0);
      varietiesMap[varietyName].totalYield += parseFloat(item.productivity || 0);
      varietiesMap[varietyName].locationCount += 1;
      
      // Add coordinates if available
      if (item.lat && item.long) {
        varietiesMap[varietyName].coordinates.push({
          lat: parseFloat(item.lat),
          long: parseFloat(item.long),
          fieldName: item.field_name || varietyName,
          production: parseFloat(item.harvested_weight || 0),
          groupName: item.group_field_name || 'Field Group',
          avgYield: parseFloat(item.productivity || 0),
          source: 'Field Group Data'
        });
      }
      
      varietiesMap[varietyName].fields.push(item);
    });

    // Calculate averages and convert to array
    const result = Object.values(varietiesMap).map(variety => ({
      ...variety,
      avgYield: variety.locationCount > 0 ? variety.totalYield / variety.locationCount : 0
    }));

    // Sort by production descending
    return result.sort((a, b) => b.totalProduction - a.totalProduction);
  }
}

// Create singleton instance
export const fieldGroupFiltering = new FieldGroupFiltering();
