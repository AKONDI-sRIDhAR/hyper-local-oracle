import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StickmanCharacterProps {
  condition: "clear" | "cloudy" | "rainy" | "stormy";
  isNight?: boolean;
  temperature?: number;
  message?: string;
}

const StickmanCharacter = ({ condition, isNight = false, temperature = 20, message }: StickmanCharacterProps) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const getAnimation = () => {
    switch (condition) {
      case "rainy":
        return {
          body: { y: [0, -5, 0], rotate: [0, -2, 0] },
          arm: { rotate: [-45, -50, -45] },
          transition: { duration: 2, repeat: Infinity as number }
        };
      case "stormy":
        return {
          body: { y: [0, 5, 0], x: [-5, 5, -5], rotate: [0, 10, -10, 0] },
          transition: { duration: 0.3, repeat: Infinity as number }
        };
      case "clear":
        if (isNight) {
          return {
            body: { y: [0, -2, 0] },
            transition: { duration: 3, repeat: Infinity as number }
          };
        }
        return {
          body: { y: [0, -8, 0] },
          arm: { rotate: [0, 180, 360] },
          transition: { duration: 2, repeat: Infinity as number }
        };
      case "cloudy":
        return {
          body: { x: [-3, 3, -3] },
          transition: { duration: 4, repeat: Infinity as number }
        };
      default:
        return {
          body: { y: [0, -5, 0] },
          transition: { duration: 2, repeat: Infinity as number }
        };
    }
  };

  const animation = getAnimation();
  const isCold = temperature < 10;

  return (
    <div className="fixed bottom-32 left-12 z-20">
      <motion.div
        className="relative"
        animate={animation.body}
        transition={animation.transition}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {showMessage && message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-2xl text-sm font-medium text-gray-800 shadow-xl whitespace-nowrap"
            >
              {message}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/90" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stickman */}
        <svg width="80" height="120" viewBox="0 0 80 120" className="drop-shadow-lg">
          {/* Head */}
          <motion.circle
            cx="40"
            cy="20"
            r="12"
            stroke="white"
            strokeWidth="3"
            fill="none"
            animate={isCold ? { x: [-1, 1, -1] } : {}}
            transition={{ duration: 0.3, repeat: Infinity as number }}
          />
          
          {/* Face expressions based on weather */}
          {condition === "stormy" && (
            <>
              <circle cx="35" cy="18" r="1.5" fill="white" />
              <circle cx="45" cy="18" r="1.5" fill="white" />
              <path d="M 35 25 Q 40 23 45 25" stroke="white" strokeWidth="2" fill="none" />
            </>
          )}
          {condition === "clear" && !isNight && (
            <>
              <circle cx="35" cy="18" r="2" fill="white" />
              <circle cx="45" cy="18" r="2" fill="white" />
              <path d="M 33 24 Q 40 27 47 24" stroke="white" strokeWidth="2" fill="none" />
            </>
          )}
          {condition === "rainy" && (
            <>
              <circle cx="35" cy="18" r="1.5" fill="white" />
              <circle cx="45" cy="18" r="1.5" fill="white" />
              <path d="M 35 24 Q 40 26 45 24" stroke="white" strokeWidth="2" fill="none" />
            </>
          )}

          {/* Body */}
          <motion.line
            x1="40"
            y1="32"
            x2="40"
            y2="65"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Arms */}
          {condition === "rainy" && (
            <motion.g animate={animation.arm} transition={animation.transition}>
              {/* Umbrella */}
              <path
                d="M 30 35 Q 40 30 50 35"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <line x1="40" y1="30" x2="40" y2="55" stroke="white" strokeWidth="2" />
            </motion.g>
          )}
          {condition === "clear" && !isNight && (
            <motion.g animate={animation.arm} transition={animation.transition}>
              <line x1="40" y1="40" x2="25" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="40" y1="40" x2="55" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </motion.g>
          )}
          {(condition === "cloudy" || condition === "stormy" || (condition === "clear" && isNight)) && (
            <>
              <line x1="40" y1="40" x2="25" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="40" y1="40" x2="55" y2="50" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Coffee mug if cold */}
          {isCold && (
            <motion.g
              animate={{ y: [-1, 1, -1] }}
              transition={{ duration: 1, repeat: Infinity as number }}
            >
              <rect x="52" y="45" width="12" height="10" stroke="white" strokeWidth="2" fill="none" rx="2" />
              <path d="M 64 48 Q 68 48 68 51 Q 68 54 64 54" stroke="white" strokeWidth="2" fill="none" />
              <motion.g
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity as number }}
              >
                <path d="M 56 42 Q 56 38 56 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 60 42 Q 60 38 60 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>
            </motion.g>
          )}

          {/* Legs */}
          <line x1="40" y1="65" x2="30" y2="90" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="65" x2="50" y2="90" stroke="white" strokeWidth="3" strokeLinecap="round" />

          {/* Feet */}
          <motion.g
            animate={condition === "clear" && !isNight ? { rotate: [0, 5, 0, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity as number }}
          >
            <line x1="30" y1="90" x2="22" y2="90" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="90" x2="58" y2="90" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};

export default StickmanCharacter;
