import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    console.log('Processing weather query:', query);

    // Check for airport/railway codes
    const locationCodes: Record<string, string> = {
      'DEL': 'Delhi', 'BOM': 'Mumbai', 'MAA': 'Chennai', 'CCU': 'Kolkata',
      'BLR': 'Bangalore', 'HYD': 'Hyderabad', 'VTZ': 'Visakhapatnam',
      'VSKP': 'Visakhapatnam', 'NDLS': 'New Delhi', 'NYC': 'New York',
      'LAX': 'Los Angeles', 'LHR': 'London', 'CDG': 'Paris', 'GOI': 'Goa'
    };

    // Check for common typos
    const typoMap: Record<string, string> = {
      'dilli': 'Delhi', 'delhhi': 'Delhi', 'dehli': 'Delhi',
      'vizag': 'Visakhapatnam', 'bombay': 'Mumbai',
      'banglore': 'Bangalore', 'bengaluru': 'Bangalore',
      'kolkatta': 'Kolkata', 'calcutta': 'Kolkata'
    };

    let processedQuery = query;
    const upperQuery = query.toUpperCase().trim();
    
    // Check if it's an airport/station code
    if (locationCodes[upperQuery]) {
      processedQuery = locationCodes[upperQuery];
    } else {
      // Check for typos
      const lowerQuery = query.toLowerCase().trim();
      for (const [typo, correct] of Object.entries(typoMap)) {
        if (lowerQuery.includes(typo)) {
          processedQuery = processedQuery.replace(new RegExp(typo, 'gi'), correct);
          break;
        }
      }
    }

    // Use Google Gemini for semantic understanding and personality
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a friendly weather assistant with personality. Analyze: "${processedQuery}"
              
              Return JSON with:
              {
                "location": "corrected location name (be specific, e.g., 'Buffalo, New York' not just 'Buffalo')",
                "intent": "current/forecast/details",
                "timeframe": "now/today/tomorrow/week",
                "personality_message": "a short, witty, contextual comment about the weather (max 15 words)",
                "original": "${query}"
              }
              
              Handle semantic understanding:
              - "beach near goa" → "Goa beaches"
              - "north delhi university area" → "North Delhi"
              - Disambiguate: "Buffalo" likely means Buffalo, New York (most populous)
              
              Make personality_message engaging based on conditions, like:
              - Sunny: "Perfect day for sunglasses! ☀️"
              - Rainy: "Grab your umbrella, it's shower time! 🌧️"
              - Cold: "Brr! Time for hot cocoa ☕"
              - Stormy: "Whoa, stay safe inside! ⛈️"`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const aiData = await aiResponse.json();
    console.log('AI response:', aiData);
    
    let parsedQuery;
    try {
      const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       responseText.match(/(\{[\s\S]*\})/);
      parsedQuery = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      parsedQuery = {
        location: query,
        intent: 'current',
        timeframe: 'now',
        original: query
      };
    }

    // Fetch weather data using Open-Meteo (free, no API key needed)
    let weatherData = null;
    if (parsedQuery.location) {
      // Geocode the location first
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(parsedQuery.location)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name, country } = geoData.results[0];
        
        // Fetch weather for the location
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=2`
        );
        weatherData = await weatherResponse.json();
        weatherData.location = { name, country, latitude, longitude, timezone: weatherData.timezone };
      }
    }

    return new Response(
      JSON.stringify({
        parsed: parsedQuery,
        weather: weatherData,
        personalityMessage: parsedQuery.personality_message || null,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Weather search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
