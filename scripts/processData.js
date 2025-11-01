// scripts/processData.js
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processAirports = () => {
  const results = [];
  fs.createReadStream(path.join(__dirname, '../src/data/raw/airports.csv'))
    .pipe(csv())
    .on('data', (data) => {
      if (data.iso_country === 'IN' && data.iata_code && data.iata_code.length > 0) {
        results.push({
          code: data.iata_code,
          name: data.name,
          lat: parseFloat(data.latitude_deg),
          lon: parseFloat(data.longitude_deg),
          type: 'airport',
        });
      }
    })
    .on('end', () => {
      fs.writeFileSync(
        path.join(__dirname, '../src/data/airports.json'),
        JSON.stringify(results, null, 2)
      );
      console.log('Airports processed successfully.');
    });
};

const processRailways = () => {
  const results = [];
  fs.createReadStream(path.join(__dirname, '../src/data/raw/indian-railways.csv'))
    .pipe(csv())
    .on('data', (data) => {
      if (data.station_code && data.station_code.length > 0) {
        results.push({
          code: data.station_code,
          name: data.station_name,
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          type: 'railway',
        });
      }
    })
    .on('end', () => {
      fs.writeFileSync(
        path.join(__dirname, '../src/data/railways.json'),
        JSON.stringify(results, null, 2)
      );
      console.log('Railways processed successfully.');
    });
};

processAirports();
processRailways();
