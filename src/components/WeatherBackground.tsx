import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WeatherBackgroundProps {
  condition: "clear" | "cloudy" | "rainy" | "stormy";
  isNight?: boolean;
}

const WeatherBackground = ({ condition, isNight = false }: WeatherBackgroundProps) => {
  const [raindrops, setRaindrops] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const [birds, setBirds] = useState<Array<{ id: number; top: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (condition === "rainy" || condition === "stormy") {
      const drops = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setRaindrops(drops);
    }
  }, [condition]);

  useEffect(() => {
    if (condition === "clear" && !isNight) {
      const birdCount = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: 10 + Math.random() * 30,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10
      }));
      setBirds(birdCount);
    }
  }, [condition, isNight]);

  const getGradient = () => {
    if (isNight) {
      switch (condition) {
        case "clear":
          return "bg-gradient-to-b from-[hsl(230,50%,15%)] to-[hsl(240,40%,25%)]";
        case "cloudy":
          return "bg-gradient-to-b from-[hsl(230,30%,20%)] to-[hsl(220,25%,30%)]";
        case "rainy":
          return "bg-gradient-to-b from-[hsl(230,35%,15%)] to-[hsl(220,30%,25%)]";
        case "stormy":
          return "bg-gradient-to-b from-[hsl(230,40%,10%)] to-[hsl(220,35%,20%)]";
        default:
          return "bg-gradient-to-b from-[hsl(230,50%,15%)] to-[hsl(240,40%,25%)]";
      }
    }
    
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

      {/* Sun or Moon */}
      {condition === "clear" && (
        <>
          {!isNight ? (
            <>
              {/* Sun */}
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
              {/* Sun rays */}
              <motion.div
                className="absolute top-20 right-20 w-40 h-40"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-16 bg-[hsl(45,100%,60%)]/30 origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            /* Moon */
            <motion.div
              className="absolute top-20 right-20 w-24 h-24 bg-[hsl(50,20%,90%)] rounded-full opacity-80"
              animate={{
                opacity: [0.8, 0.9, 0.8],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Moon craters */}
              <div className="absolute top-4 right-6 w-4 h-4 bg-[hsl(50,20%,70%)] rounded-full opacity-40" />
              <div className="absolute top-10 right-12 w-3 h-3 bg-[hsl(50,20%,70%)] rounded-full opacity-40" />
            </motion.div>
          )}
        </>
      )}

      {/* Birds */}
      {condition === "clear" && !isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {birds.map((bird) => (
            <motion.div
              key={bird.id}
              className="absolute text-2xl"
              style={{
                top: `${bird.top}%`,
                left: "-10%",
              }}
              animate={{
                x: ["0vw", "120vw"],
                y: [0, -20, 0, 20, 0],
              }}
              transition={{
                x: { duration: bird.duration, repeat: Infinity, ease: "linear", delay: bird.delay },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              🦅
            </motion.div>
          ))}
        </div>
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
