import { useState } from "react";
import { motion } from "framer-motion";
import WeatherBackground from "@/components/WeatherBackground";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherCondition, setWeatherCondition] = useState<"clear" | "cloudy" | "rainy" | "stormy">("clear");
  const { toast } = useToast();

  const getWeatherCondition = (code: number): "clear" | "cloudy" | "rainy" | "stormy" => {
    if (code === 0) return "clear";
    if (code <= 3) return "cloudy";
    if (code >= 95) return "stormy";
    if (code >= 51) return "rainy";
    return "cloudy";
  };

  const getWeatherDescription = (code: number): string => {
    const descriptions: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return descriptions[code] || "Unknown";
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a location",
        description: "Try something like 'weather in Tokyo' or 'Mumbai tomorrow'",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather-search", {
        body: { query: searchQuery },
      });

      if (error) throw error;

      if (data.success && data.weather) {
        const current = data.weather.current;
        const condition = getWeatherCondition(current.weather_code);
        setWeatherCondition(condition);
        setWeatherData({
          location: `${data.weather.location.name}, ${data.weather.location.country}`,
          temperature: current.temperature_2m,
          condition: getWeatherDescription(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          feelsLike: current.apparent_temperature,
        });

        toast({
          title: "Weather updated",
          description: `Showing weather for ${data.weather.location.name}`,
        });
      } else {
        throw new Error("Could not find weather data for this location");
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Please try again with a different location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <WeatherBackground condition={weatherCondition} />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-light text-white mb-4 drop-shadow-lg">
            Weather
          </h1>
          <p className="text-xl text-white/80 font-light">
            AI-powered hyper-local forecasting
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-12">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {/* Weather display */}
        {weatherData && (
          <div className="max-w-2xl mx-auto">
            <WeatherCard {...weatherData} />
          </div>
        )}

        {/* Initial state */}
        {!weatherData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/60 mt-20"
          >
            <p className="text-lg">
              Search for any location to see detailed weather information
            </p>
            <p className="text-sm mt-2">
              Try: "weather in New York" or "is it raining in London?"
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
