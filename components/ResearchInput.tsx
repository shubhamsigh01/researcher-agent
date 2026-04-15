"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Send } from 'lucide-react';

interface ResearchInputProps {
  onSubmit: (query: string) => void;
  isSearching: boolean;
}

export function ResearchInput({ onSubmit, isSearching }: ResearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSubmit(query);
      setQuery('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <motion.div
            className="absolute left-4 text-cyan-400"
            animate={{
              rotate: isSearching ? 360 : 0,
              scale: isSearching ? [1, 1.2, 1] : 1,
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1, repeat: Infinity },
            }}
          >
            {isSearching ? <Sparkles size={24} /> : <Search size={24} />}
          </motion.div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything... I'll research it for you"
            disabled={isSearching}
            className="w-full pl-14 pr-14 py-5 text-lg bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
          />

          <motion.button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>

      {/* Quick suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex flex-wrap gap-2 justify-center"
      >
        {[
          'Latest market breakthroughs',
          'Climate change solutions',
          'Quantum computing basics',
          'Space exploration news',
        ].map((suggestion, index) => (
          <motion.button
            key={suggestion}
            onClick={() => !isSearching && onSubmit(suggestion)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full text-sm text-white/70 hover:text-white transition-all duration-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
