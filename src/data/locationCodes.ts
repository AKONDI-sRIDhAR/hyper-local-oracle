// src/data/locationCodes.ts
import { allLocationData } from './locationDatabase';
import Fuse from 'fuse.js';

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

// Initialize Fuse.js for advanced fuzzy search
const fuse = new Fuse(allLocationData, {
  keys: ['name', 'code'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
});


// Get location suggestions for autocomplete
export async function getLocationSuggestions(query: string): Promise<Array<{ label: string; value: string; type: string }>> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const upperQuery = query.toUpperCase();
  const suggestions: Array<{ label: string; value: string; type: string; score: number }> = [];

  // Priority 1: Exact airport/railway code matches
  for (const location of allLocationData) {
    if (location.code === upperQuery) {
      suggestions.push({
        label: `${location.name} (${location.code})`,
        value: location.name,
        type: location.type,
        score: 0
      });
    }
  }

  // Priority 2: Code prefix matches
  for (const location of allLocationData) {
    if (location.code.startsWith(upperQuery) && location.code !== upperQuery) {
      suggestions.push({
        label: `${location.name} (${location.code})`,
        value: location.name,
        type: location.type,
        score: 0.5
      });
    }
  }

  // Priority 3: Typo corrections
  for (const [typo, correct] of Object.entries(typoMap)) {
    if (typo.startsWith(normalizedQuery)) {
      const location = allLocationData.find(l => l.name === correct);
      if (location) {
        suggestions.push({
          label: `${correct} (corrected)`,
          value: correct,
          type: location.type,
          score: 1
        });
      }
    }
  }

  // Priority 4: Fuse.js fuzzy name matching
  const fuseResults = fuse.search(query);
  for (const result of fuseResults.slice(0, 10)) {
    const location = result.item;
    suggestions.push({
      label: `${location.name}${location.code ? ` (${location.code})` : ''}`,
      value: location.name,
      type: location.type,
      score: (result.score || 0) + 2
    });
  }

  // Sort by score and return top 5 unique suggestions
  const uniqueSuggestions = suggestions.reduce((acc, curr) => {
    if (!acc.find(s => s.value === curr.value)) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof suggestions);

  return uniqueSuggestions
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(({ label, value, type }) => ({ label, value, type }));
}
