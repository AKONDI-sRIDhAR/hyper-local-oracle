import { useQuery } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

export const useWeather = (city: string) => {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Location not found');
      }
      
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: data.main.feels_like,
        location: `${data.name}, ${data.sys.country}`,
      };
    },
    enabled: !!city && city.length > 0,
    retry: 1,
  });
};
