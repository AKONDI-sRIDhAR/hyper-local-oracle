// src/data/locationDatabase.ts
import airportsCSV from './raw/airports.csv?raw';
import railwaysCSV from './raw/indian-railways.csv?raw';

interface Location {
  code: string;
  name: string;
  lat: number;
  lon: number;
  type: 'airport' | 'railway';
}

const parseAirportData = (csv: string): Location[] => {
  const lines = csv.split('\n');
  const results: Location[] = [];
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length > 9 && parts[8] === 'IN' && parts[13]) {
      results.push({
        code: parts[13],
        name: parts[3].replace(/"/g, ''),
        lat: parseFloat(parts[4]),
        lon: parseFloat(parts[5]),
        type: 'airport',
      });
    }
  }
  return results;
};

const parseRailwayData = (csv: string): Location[] => {
  const lines = csv.split('\n');
  const results: Location[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length > 6 && parts[0]) {
      results.push({
        code: parts[0],
        name: parts[1],
        lat: parseFloat(parts[5]),
        lon: parseFloat(parts[6]),
        type: 'railway',
      });
    }
  }
  return results;
};

export const allLocationData: Location[] = [
  ...parseAirportData(airportsCSV),
  ...parseRailwayData(railwaysCSV),
];

export const locationCodes: Record<string, Location> = allLocationData.reduce(
  (acc, loc) => {
    acc[loc.code] = loc;
    return acc;
  },
  {} as Record<string, Location>
);
