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
  getData
};
