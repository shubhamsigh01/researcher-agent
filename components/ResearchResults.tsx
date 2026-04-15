"use client";
import { motion } from 'motion/react';
import { SourceCard } from './SourceCard';
import { BookOpen, CheckCircle } from 'lucide-react';

interface Source {
  title: string;
  summary: string;
  url: string;
  date: string;
  relevance: number;
}

interface ResearchResultsProps {
  query: string;
  sources: Source[];
  summary: string;
}

export function ResearchResults({ query, sources, summary }: ResearchResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Query header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <CheckCircle size={32} className="text-green-400" />
        </motion.div>
        <div>
          <p className="text-sm text-white/50">Research complete for:</p>
          <h2 className="text-2xl font-bold text-white">{query}</h2>
        </div>
      </motion.div>

      {/* Summary section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={24} className="text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Research Summary</h3>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 leading-relaxed"
        >
          {summary}
        </motion.p>
      </motion.div>

      {/* Sources section */}
      <div className="mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-white mb-4"
        >
          Sources Found ({sources.length})
        </motion.h3>
      </div>

      <div className="space-y-4">
        {sources.map((source, index) => (
          <SourceCard key={index} {...source} index={index} />
        ))}
      </div>

      {/* Load more indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: sources.length * 0.1 + 0.5 }}
        className="mt-8 text-center"
      >
        <motion.button
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Load More Sources
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
