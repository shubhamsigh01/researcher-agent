"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Send, Target, Layers, User, BookOpen, Scale, TrendingUp, Compass } from 'lucide-react';
import { cn } from './ui/utils';

export interface ResearchOptions {
  query: string;
  goal: string;
  depth: string;
  role: string;
}

interface ResearchInputProps {
  onSubmit: (options: ResearchOptions) => void;
  isSearching: boolean;
}

const GOALS = ['Learn', 'Research', 'Invest', 'Build'];
const DEPTHS = ['Basic', 'Detailed', 'Expert'];
const ROLES = ['Teacher', 'Analyst', 'Advisor'];

const TEMPLATES = [
  { text: 'Explain like a beginner', icon: BookOpen, role: 'Teacher', depth: 'Basic', goal: 'Learn' },
  { text: 'Compare technologies', icon: Scale, role: 'Analyst', depth: 'Detailed', goal: 'Research' },
  { text: 'Latest market trends', icon: TrendingUp, role: 'Analyst', depth: 'Expert', goal: 'Invest' },
  { text: 'Step-by-step guide', icon: Compass, role: 'Advisor', depth: 'Detailed', goal: 'Build' },
];

export function ResearchInput({ onSubmit, isSearching }: ResearchInputProps) {
  const [query, setQuery] = useState('');
  const [goal, setGoal] = useState('Research');
  const [depth, setDepth] = useState('Detailed');
  const [role, setRole] = useState('Analyst');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSubmit({ query, goal, depth, role });
      setQuery('');
    }
  };

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    if (isSearching) return;
    setQuery(template.text);
    setRole(template.role);
    setDepth(template.depth);
    setGoal(template.goal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 transition-all duration-300 focus-within:bg-white/10 focus-within:border-cyan-400/50">
        
        {/* Settings Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-cyan-400" />
            <select 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              className="bg-transparent text-sm text-white/80 focus:outline-none cursor-pointer hover:text-white transition-colors"
              disabled={isSearching}
            >
              {GOALS.map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            <select 
              value={depth} 
              onChange={(e) => setDepth(e.target.value)}
              className="bg-transparent text-sm text-white/80 focus:outline-none cursor-pointer hover:text-white transition-colors"
              disabled={isSearching}
            >
              {DEPTHS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <User size={16} className="text-purple-400" />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent text-sm text-white/80 focus:outline-none cursor-pointer hover:text-white transition-colors"
              disabled={isSearching}
            >
              {ROLES.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
            </select>
          </div>
        </div>

        {/* Input Area */}
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
            className="w-full pl-14 pr-14 py-4 text-lg bg-transparent text-white placeholder-white/30 focus:outline-none transition-all duration-300 disabled:opacity-50"
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

      {/* Quick suggestions - Pre-built Templates */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
      >
        {TEMPLATES.map((template, index) => (
          <motion.button
            key={index}
            onClick={() => handleTemplateClick(template)}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/30 rounded-2xl text-left text-sm text-white/70 hover:text-white transition-all duration-200 group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSearching}
          >
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
              <template.icon size={16} />
            </div>
            <span className="font-medium">{template.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
