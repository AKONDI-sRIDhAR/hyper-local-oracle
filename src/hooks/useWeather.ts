// src/hooks/useWeather.ts
import { useQuery } from '@tanstack/react-query';
import { getWeatherByCity } from '@/integrations/openWeatherMap';

export const useWeather = (city: string) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => getWeatherByCity(city),
    enabled: !!city, // Only run the query if the city is not empty
  });
};
