// assets/js/models/DataSource.js
import { agriculturalData, locationData, weatherQuarterData } from '../mock/mockData.js';

function getData() {
  const data = fetch('./assets/js/model/new_data.json')
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(error => console.error('Error:', error));
  return data
}

export const DataSource = {
  getAgri() { return agriculturalData; },
  getLocations() { return locationData; },
  getWeatherQuarters() { return weatherQuarterData; },
  getData,
  
  // Function to load and process Toshka project data specifically for comparison chart
  async getToshkaProjectDataForComparison() {
    try {
      const response = await fetch('./project_Toshka_project.json');
      const data = await response.json();
      
      // Calculate totals for comparison chart format
      const processedData = {
        alfalfa: data.AlfaAlfa?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        wheat: data.Wheat?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        sugarbeet: data['Sugar Beet']?.reduce((sum, variety) => sum + variety.total_production, 0) || 0
      };
      
      return processedData;
    } catch (error) {
      console.error('Error loading Toshka project data:', error);
      return null;
    }
  },

  // Function to load and process East Oweinat project data specifically for comparison chart
  async getEastOweinatProjectDataForComparison() {
    try {
      const response = await fetch('./project_East_Oweinat_Project.json');
      const data = await response.json();
      
      // Calculate totals for comparison chart format
      const processedData = {
        wheat: data.Wheat?.reduce((sum, variety) => sum + variety.total_production, 0) || 0,
        sugarbeet: data['Sugar Beet']?.reduce((sum, variety) => sum + variety.total_production, 0) || 0
        // Note: No AlfaAlfa in East Oweinat data
      };
      
      return processedData;
    } catch (error) {
      console.error('Error loading East Oweinat project data:', error);
      return null;
    }
  }
};
