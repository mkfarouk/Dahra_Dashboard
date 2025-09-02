// assets/js/models/DataSource.js
import { agriculturalData, locationData, weatherQuarterData } from '../mock/mockData.js';

export const DataSource = {
  getAgri() { return agriculturalData; },
  getLocations() { return locationData; },
  getWeatherQuarters() { return weatherQuarterData; }
};
