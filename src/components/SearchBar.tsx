import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

const SearchBar = ({ value, onChange, onSearch, loading }: SearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/10 rounded-full p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/20">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-white/60 ml-4" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather anywhere... (e.g., 'weather in Mumbai tomorrow')"
            className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
            disabled={loading}
          />
          <Button
            onClick={onSearch}
            disabled={loading}
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-300"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
