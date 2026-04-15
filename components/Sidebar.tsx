"use client";
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, Clock, X } from 'lucide-react';

interface ResearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

interface SidebarProps {
  history: ResearchHistoryItem[];
  onSelectHistory: (item: ResearchHistoryItem) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ history, onSelectHistory, onClearHistory, isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <History size={20} className="text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Research History</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <p className="text-sm text-white/50">Your recent searches</p>
            </div>

            {/* History list */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-white/40"
                  >
                    <History size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No research history yet</p>
                    <p className="text-sm mt-1">Start a search to begin</p>
                  </motion.div>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-3"
                    >
                      <motion.button
                        onClick={() => {
                          onSelectHistory(item);
                          onClose();
                        }}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl text-left transition-all duration-200 group"
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-white font-medium mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                          {item.query}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Clock size={12} />
                          <span>{item.timestamp.toLocaleDateString()}</span>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t border-white/10"
              >
                <motion.button
                  onClick={onClearHistory}
                  className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-400 flex items-center justify-center gap-2 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 size={16} />
                  Clear All History
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
