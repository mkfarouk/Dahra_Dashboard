// assets/js/models/DataSource.js
import { agriculturalData, locationData } from '../mock/mockData.js';

export const DataSource = {
  getAgri() { return agriculturalData; },
  getLocations() { return locationData; }
};
