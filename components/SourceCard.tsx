"use client";
import { motion } from 'motion/react';
import { ExternalLink, FileText, Calendar, TrendingUp } from 'lucide-react';

interface SourceCardProps {
  title: string;
  summary: string;
  url: string;
  date: string;
  relevance: number;
  index: number;
}

export function SourceCard({ title, summary, url, date, relevance, index }: SourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <motion.div
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <FileText size={24} className="text-cyan-400" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
              {title}
            </h3>
            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-white/40 hover:text-cyan-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
            </motion.a>
          </div>

          <p className="text-sm text-white/60 mb-4 line-clamp-3">{summary}</p>

          <div className="flex items-center gap-4 text-xs text-white/40">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              <span>{relevance}% relevant</span>
            </div>
          </div>

          {/* Relevance bar */}
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${relevance}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
