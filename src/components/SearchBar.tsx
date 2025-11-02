import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getLocationSuggestions } from "@/data/locationCodes";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

const SearchBar = ({ value, onChange, onSearch, loading = false }: SearchBarProps) => {
  const [suggestions, setSuggestions] = useState<Array<{ label: string; value: string; type: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 2) {
        const results = await getLocationSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: { label: string; value: string; type: string }) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    setTimeout(onSearch, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto relative"
    >
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search location... (e.g., 'Delhi', 'VTZ', 'dilli', 'beach near goa')"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="h-14 px-6 text-lg bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 transition-all"
          />
          
          {/* Autocomplete suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-6 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between group"
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-gray-900 font-medium">{suggestion.label}</span>
                    <span className="text-xs text-gray-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                      {suggestion.type}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          onClick={() => {
            setShowSuggestions(false);
            onSearch();
          }}
          disabled={loading}
          className="h-14 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/20 text-white"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default SearchBar;
