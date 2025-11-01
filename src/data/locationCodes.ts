// Airport codes (IATA) and railway station codes database
export const locationCodes: Record<string, { name: string; country: string; type: string }> = {
  // Major Indian cities - Airport codes
  "DEL": { name: "Delhi", country: "India", type: "airport" },
  "BOM": { name: "Mumbai", country: "India", type: "airport" },
  "MAA": { name: "Chennai", country: "India", type: "airport" },
  "CCU": { name: "Kolkata", country: "India", type: "airport" },
  "BLR": { name: "Bangalore", country: "India", type: "airport" },
  "HYD": { name: "Hyderabad", country: "India", type: "airport" },
  "AMD": { name: "Ahmedabad", country: "India", type: "airport" },
  "PNQ": { name: "Pune", country: "India", type: "airport" },
  "GOI": { name: "Goa", country: "India", type: "airport" },
  "COK": { name: "Kochi", country: "India", type: "airport" },
  "VTZ": { name: "Visakhapatnam", country: "India", type: "airport" },
  "VSKP": { name: "Visakhapatnam", country: "India", type: "railway" },
  
  // Indian Railway stations
  "NDLS": { name: "New Delhi", country: "India", type: "railway" },
  "BCT": { name: "Mumbai Central", country: "India", type: "railway" },
  "MAS": { name: "Chennai Central", country: "India", type: "railway" },
  "HWH": { name: "Howrah", country: "India", type: "railway" },
  "SBC": { name: "Bangalore City", country: "India", type: "railway" },
  
  // Major US cities
  "NYC": { name: "New York", country: "USA", type: "airport" },
  "LAX": { name: "Los Angeles", country: "USA", type: "airport" },
  "ORD": { name: "Chicago", country: "USA", type: "airport" },
  "DFW": { name: "Dallas", country: "USA", type: "airport" },
  "ATL": { name: "Atlanta", country: "USA", type: "airport" },
  "MIA": { name: "Miami", country: "USA", type: "airport" },
  "SEA": { name: "Seattle", country: "USA", type: "airport" },
  "SFO": { name: "San Francisco", country: "USA", type: "airport" },
  "BOS": { name: "Boston", country: "USA", type: "airport" },
  "LAS": { name: "Las Vegas", country: "USA", type: "airport" },
  
  // Major European cities
  "LHR": { name: "London", country: "UK", type: "airport" },
  "CDG": { name: "Paris", country: "France", type: "airport" },
  "FRA": { name: "Frankfurt", country: "Germany", type: "airport" },
  "AMS": { name: "Amsterdam", country: "Netherlands", type: "airport" },
  "MAD": { name: "Madrid", country: "Spain", type: "airport" },
  "FCO": { name: "Rome", country: "Italy", type: "airport" },
  
  // Major Asian cities
  "HKG": { name: "Hong Kong", country: "Hong Kong", type: "airport" },
  "SIN": { name: "Singapore", country: "Singapore", type: "airport" },
  "NRT": { name: "Tokyo", country: "Japan", type: "airport" },
  "ICN": { name: "Seoul", country: "South Korea", type: "airport" },
  "BKK": { name: "Bangkok", country: "Thailand", type: "airport" },
  "DXB": { name: "Dubai", country: "UAE", type: "airport" },
};

// Common typos and alternate spellings
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

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Get location suggestions for autocomplete
export function getLocationSuggestions(query: string): Array<{ label: string; value: string; type: string }> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: Array<{ label: string; value: string; type: string; score: number }> = [];

  // Check airport/railway codes first
  const upperQuery = query.toUpperCase();
  for (const [code, location] of Object.entries(locationCodes)) {
    if (code.startsWith(upperQuery)) {
      suggestions.push({
        label: `${location.name}, ${location.country} (${code})`,
        value: location.name,
        type: location.type,
        score: 0
      });
    }
  }

  // Check typo map
  for (const [typo, correct] of Object.entries(typoMap)) {
    if (typo.startsWith(normalizedQuery)) {
      suggestions.push({
        label: correct,
        value: correct,
        type: "city",
        score: 1
      });
    }
  }

  // Check location names with fuzzy matching
  for (const location of Object.values(locationCodes)) {
    const locationName = location.name.toLowerCase();
    if (locationName.includes(normalizedQuery)) {
      const distance = levenshteinDistance(normalizedQuery, locationName.substring(0, normalizedQuery.length));
      suggestions.push({
        label: `${location.name}, ${location.country}`,
        value: location.name,
        type: location.type,
        score: distance + 2
      });
    }
  }

  // Sort by score and return top 5
  return suggestions
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(({ label, value, type }) => ({ label, value, type }));
}
