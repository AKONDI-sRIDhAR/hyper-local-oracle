import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import WeatherBackground from "@/components/WeatherBackground";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import WeatherChart from "@/components/WeatherChart";
import StickmanCharacter from "@/components/StickmanCharacter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any>(null);
  const [timezone, setTimezone] = useState<string>("");
  const [weatherCondition, setWeatherCondition] = useState<"clear" | "cloudy" | "rainy" | "stormy">("clear");
  const [isNight, setIsNight] = useState(false);
  const [stickmanMessage, setStickmanMessage] = useState<string>("");
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

      console.log("Weather search response:", data);

      if (data.success && data.weather && data.weather.location) {
        const current = data.weather.current;
        const condition = getWeatherCondition(current.weather_code);
        
        // Determine if it's night (simple check based on current hour)
        const currentHour = new Date().getHours();
        const nightTime = currentHour < 6 || currentHour >= 19;
        setIsNight(nightTime);
        
        setWeatherCondition(condition);
        setWeatherData({
          location: `${data.weather.location.name}, ${data.weather.location.country}`,
          temperature: current.temperature_2m,
          condition: getWeatherDescription(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          feelsLike: current.apparent_temperature,
        });
        
        // Store hourly data for chart
        if (data.weather.hourly) {
          setHourlyData(data.weather.hourly);
          setTimezone(data.weather.timezone || data.weather.location.timezone || "");
        }

        // Set personality message for stickman
        if (data.personalityMessage) {
          setStickmanMessage(data.personalityMessage);
        }

        toast({
          title: "Weather updated",
          description: `Showing weather for ${data.weather.location.name}`,
        });
      } else {
        throw new Error(data.parsed?.location 
          ? `Could not find weather data for "${data.parsed.location}"` 
          : "Could not understand your location query. Try 'weather in Tokyo' or 'Delhi weather'");
      }
    } catch (error: any) {
      console.error("Weather search error:", error);
      toast({
        title: "Search failed",
        description: error.message || "Please try again with a different location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = () => {
    setSearchQuery("");
    setWeatherData(null);
    setHourlyData(null);
    toast({
      title: "Change location",
      description: "Enter a new location to search",
    });
  };

  return (
    <div className="min-h-screen relative">
      <WeatherBackground condition={weatherCondition} isNight={isNight} />
      <StickmanCharacter 
        condition={weatherCondition} 
        isNight={isNight}
        temperature={weatherData?.temperature}
        message={stickmanMessage}
      />
      
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
        <div className="mb-12 relative">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            loading={loading}
          />
          {weatherData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-16 right-0"
            >
              <Button
                onClick={handleLocationClick}
                size="icon"
                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/20 text-white"
              >
                <MapPin className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Weather display */}
        {weatherData && (
          <div className="max-w-2xl mx-auto space-y-6">
            <WeatherCard {...weatherData} />
            {hourlyData && <WeatherChart hourlyData={hourlyData} timezone={timezone} />}
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
