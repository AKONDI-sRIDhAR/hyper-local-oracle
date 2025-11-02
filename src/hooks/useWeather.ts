// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WeatherResponse {
  parsed: {
    location: string;
    intent: string;
    timeframe: string;
    personality_message?: string;
  };
  weather: {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    hourly: {
      time: string[];
      temperature_2m: number[];
      weather_code: number[];
      relative_humidity_2m: number[];
    };
    location: {
      name: string;
      country: string;
      timezone: string;
    };
  };
  personalityMessage: string | null;
}

const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 67 || code === 80 || code === 81) return 'Rain';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
};

export const useWeather = (city: string) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('weather-search', {
        body: { query: city }
      });

      if (error) throw error;
      if (!data?.weather) throw new Error('Weather data not found');

      const response = data as WeatherResponse;
      
      return {
        temperature: response.weather.current.temperature_2m,
        condition: getWeatherCondition(response.weather.current.weather_code),
        humidity: response.weather.current.relative_humidity_2m,
        windSpeed: response.weather.current.wind_speed_10m,
        feelsLike: response.weather.current.apparent_temperature,
        location: `${response.weather.location.name}, ${response.weather.location.country}`,
        personalityMessage: response.personalityMessage,
        hourlyData: response.weather.hourly,
        timezone: response.weather.location.timezone,
      };
    },
    enabled: !!city,
  });
};
