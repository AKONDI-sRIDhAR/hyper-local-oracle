import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WeatherBackgroundProps {
  condition: "clear" | "cloudy" | "rainy" | "stormy";
}

const WeatherBackground = ({ condition }: WeatherBackgroundProps) => {
  const [raindrops, setRaindrops] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (condition === "rainy" || condition === "stormy") {
      const drops = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setRaindrops(drops);
    }
  }, [condition]);

  const getGradient = () => {
    switch (condition) {
      case "clear":
        return "bg-gradient-to-b from-[hsl(210,100%,50%)] to-[hsl(200,100%,70%)]";
      case "cloudy":
        return "bg-gradient-to-b from-[hsl(215,30%,60%)] to-[hsl(210,40%,75%)]";
      case "rainy":
        return "bg-gradient-to-b from-[hsl(220,40%,40%)] to-[hsl(215,35%,55%)]";
      case "stormy":
        return "bg-gradient-to-b from-[hsl(230,30%,20%)] to-[hsl(220,40%,35%)]";
      default:
        return "bg-gradient-to-b from-[hsl(210,100%,50%)] to-[hsl(200,100%,70%)]";
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className={`absolute inset-0 ${getGradient()} transition-colors duration-1000`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Clouds */}
      {(condition === "cloudy" || condition === "rainy" || condition === "stormy") && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute w-64 h-32 bg-white/20 rounded-full blur-3xl"
              style={{
                top: `${20 + i * 25}%`,
                left: `-20%`,
              }}
              animate={{
                x: ["0vw", "120vw"],
              }}
              transition={{
                duration: 40 + i * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 5,
              }}
            />
          ))}
        </>
      )}

      {/* Sun glow */}
      {condition === "clear" && (
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-[hsl(45,100%,55%)] rounded-full blur-3xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Raindrops */}
      {(condition === "rainy" || condition === "stormy") && (
        <div className="absolute inset-0 pointer-events-none">
          {raindrops.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute w-0.5 h-8 bg-gradient-to-b from-white/60 to-transparent"
              style={{
                left: `${drop.left}%`,
                top: "-10%",
              }}
              animate={{
                y: ["0vh", "110vh"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
                delay: drop.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherBackground;
