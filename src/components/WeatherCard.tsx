import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

interface WeatherCardProps {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

const WeatherCard = ({
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  feelsLike,
}: WeatherCardProps) => {
  const getWeatherIcon = () => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain")) return <CloudRain className="w-16 h-16" />;
    if (conditionLower.includes("cloud")) return <Cloud className="w-16 h-16" />;
    return <Sun className="w-16 h-16" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
    >
      {/* Location */}
      <h2 className="text-lg font-medium text-white/80 mb-4">
        {location}
      </h2>

      {/* Temperature */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-6xl font-light text-white">
            {Math.round(temperature)}°
          </div>
          <div className="text-white/70 mt-1">{condition}</div>
        </div>
        <div className="text-white/80">
          {getWeatherIcon()}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-white/50 text-xs mb-1">Feels</div>
          <div className="text-white text-sm font-medium">{Math.round(feelsLike)}°</div>
        </div>
        <div className="text-center">
          <div className="text-white/50 text-xs mb-1">Humidity</div>
          <div className="text-white text-sm font-medium">{humidity}%</div>
        </div>
        <div className="text-center">
          <div className="text-white/50 text-xs mb-1">Wind</div>
          <div className="text-white text-sm font-medium">{Math.round(windSpeed)} km/h</div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
