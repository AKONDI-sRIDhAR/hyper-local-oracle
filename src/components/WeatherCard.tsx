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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/20"
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {/* Location */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-medium text-white mb-6"
        >
          {location}
        </motion.h2>

        {/* Main temperature display */}
        <div className="flex items-start justify-between mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="text-7xl font-light text-white">
              {Math.round(temperature)}°
            </div>
            <div className="text-xl text-white/80 mt-2">{condition}</div>
          </motion.div>

          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/90"
          >
            {getWeatherIcon()}
          </motion.div>
        </div>

        {/* Weather details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20"
        >
          <div className="text-center">
            <div className="text-white/60 text-sm mb-1">Feels like</div>
            <div className="text-white text-lg font-medium">{Math.round(feelsLike)}°</div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-sm mb-1">Humidity</div>
            <div className="text-white text-lg font-medium">{humidity}%</div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-sm mb-1 flex items-center justify-center gap-1">
              <Wind className="w-3 h-3" />
              Wind
            </div>
            <div className="text-white text-lg font-medium">{Math.round(windSpeed)} km/h</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
