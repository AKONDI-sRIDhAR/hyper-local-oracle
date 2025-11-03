import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import WeatherBackground from "@/components/WeatherBackground";
import WeatherCard from "@/components/WeatherCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWeather } from "@/hooks/useWeather";

const Index = () => {
  const [city, setCity] = useState("");
  const [inputValue, setInputValue] = useState("");
  const { data: weatherData, isLoading, error } = useWeather(city);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCity(inputValue.trim());
    }
  };

  const weatherCondition = weatherData?.condition.toLowerCase().includes("rain")
    ? "rainy"
    : weatherData?.condition.toLowerCase().includes("cloud")
    ? "cloudy"
    : "clear";

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <WeatherBackground condition={weatherCondition} isNight={false} />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-light text-white mb-2">Weather</h1>
            <p className="text-white/60 text-sm">Simple, clean, minimal</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/50 h-12 px-4 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xl border-0"
              >
                <Search className="w-4 h-4 text-white" />
              </Button>
            </div>
          </form>

          {/* Weather Card */}
          {weatherData && !error && (
            <WeatherCard {...weatherData} />
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/80 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
            >
              <p className="text-sm">{error.message}</p>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/80"
            >
              <p className="text-sm">Loading...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
