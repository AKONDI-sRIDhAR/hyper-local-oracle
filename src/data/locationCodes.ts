// src/data/locationCodes.ts
import { allLocationData } from './locationDatabase';
import { getWeatherByCoords } from '@/integrations/openWeatherMap';

export const typoMap: Record<string, string> = {
  "dilli": "Delhi",
  "delhhi": "Delhi",
  "dehli": "Delhi",
  "mumbai": "Mumbai",
  "bombay": "Mumbai",
  "vizag": "Visakhapatnam",
  "banglore": "Bangalore",
  "bengaluru": "Bangalore",
  "kolkatta": "Kolkata",
  "calcutta": "Kolkata",
  "madras": "Chennai",
  "newyork": "New York",
  "losangeles": "Los Angeles",
};

// Simple fuzzy search
const fuzzyMatch = (query: string, target: string) => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  let score = 0;
  let i = 0;
  let j = 0;
  while (i < queryLower.length && j < targetLower.length) {
    if (queryLower[i] === targetLower[j]) {
      score++;
      i++;
    }
    j++;
  }
  return score / queryLower.length;
};


// Get location suggestions for autocomplete
export async function getLocationSuggestions(query: string): Promise<Array<{ label: string; value: string; type: string }>> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: Array<{ label: string; value: string; type: string; score: number }> = [];

  // Check airport/railway codes first
  const upperQuery = query.toUpperCase();
  for (const location of allLocationData) {
    if (location.code.startsWith(upperQuery)) {
      suggestions.push({
        label: `${location.name} (${location.code})`,
        value: location.name,
        type: location.type,
        score: 0
      });
    }
  }

  // Check typo map
  for (const [typo, correct] of Object.entries(typoMap)) {
    if (typo.startsWith(normalizedQuery)) {
      const location = allLocationData.find(l => l.name === correct);
      if (location) {
        suggestions.push({
          label: correct,
          value: correct,
          type: location.type,
          score: 1
        });
      }
    }
  }

  // Check location names with fuzzy matching
  for (const location of allLocationData) {
    const matchScore = fuzzyMatch(normalizedQuery, location.name);
    if (matchScore > 0.5) {
      suggestions.push({
        label: `${location.name}`,
        value: location.name,
        type: location.type,
        score: 1 - matchScore + 2
      });
    }
  }

  // If no suggestions, use coordinate-based fallback
  if (suggestions.length === 0) {
    try {
      const [lat, lon] = normalizedQuery.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lon)) {
        const weather = await getWeatherByCoords(lat, lon);
        suggestions.push({
          label: `Weather at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          value: weather.location,
          type: 'coords',
          score: 0
        });
      }
    } catch (error) {
      // Not a coordinate pair, ignore
    }
  }

  // Sort by score and return top 5
  return suggestions
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(({ label, value, type }) => ({ label, value, type }));
}
