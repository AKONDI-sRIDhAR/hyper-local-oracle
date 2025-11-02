import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import WeatherBackground from "@/components/WeatherBackground";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import WeatherChart from "@/components/WeatherChart";
import StickmanCharacter from "@/components/StickmanCharacter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const { data: weatherData, isLoading, error } = useWeather(city);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a location",
        variant: "destructive",
      });
      return;
    }
    setCity(searchQuery);
  };

  if (error) {
    toast({
      title: "Error fetching weather",
      description: error.message || "Unable to fetch weather data. Please try again.",
      variant: "destructive",
    });
  }

  const handleLocationClick = () => {
    setSearchQuery("");
    setCity("");
  };

  const weatherCondition = weatherData?.condition.toLowerCase().includes("rain")
    ? "rainy"
    : weatherData?.condition.toLowerCase().includes("cloud")
    ? "cloudy"
    : "clear";

  return (
    <div className="min-h-screen relative">
      <WeatherBackground condition={weatherCondition} isNight={false} />
      <StickmanCharacter 
        condition={weatherCondition} 
        isNight={false}
        temperature={weatherData?.temperature}
        message={weatherData?.personalityMessage || ""}
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
            loading={isLoading}
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
            <WeatherChart 
              hourlyData={weatherData.hourlyData || { time: [], temperature_2m: [], weather_code: [] }} 
              timezone={weatherData.timezone || ""} 
            />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/60 mt-20"
          >
            <p className="text-lg">
              {error.message}
            </p>
          </motion.div>
        )}

        {/* Initial state */}
        {!weatherData && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/60 mt-20"
          >
            <p className="text-lg">
              Search for any location to see detailed weather information
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
