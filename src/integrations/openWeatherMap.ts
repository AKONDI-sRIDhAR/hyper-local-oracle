// src/integrations/openWeatherMap.ts

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  location: string;
}

// Function to fetch weather by city name
export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
  if (!response.ok) {
    throw new Error("Weather data not found");
  }
  const data = await response.json();

  return {
    temperature: data.main.temp,
    condition: data.weather[0].main,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    feelsLike: data.main.feels_like,
    location: data.name,
  };
};

// Function to fetch weather by coordinates
export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
  if (!response.ok) {
    throw new Error("Weather data not found");
  }
  const data = await response.json();

  return {
    temperature: data.main.temp,
    condition: data.weather[0].main,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    feelsLike: data.main.feels_like,
    location: data.name,
  };
};
