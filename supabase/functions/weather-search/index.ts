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

    // Use Google Gemini for semantic understanding
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract location and weather intent from: "${query}". 
              Return JSON with: {
                "location": "corrected location name",
                "intent": "current/forecast/details",
                "timeframe": "now/today/tomorrow/week",
                "original": "${query}"
              }
              Handle typos and informal language. If location unclear, return null for location.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
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
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`
        );
        weatherData = await weatherResponse.json();
        weatherData.location = { name, country, latitude, longitude };
      }
    }

    return new Response(
      JSON.stringify({
        parsed: parsedQuery,
        weather: weatherData,
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
