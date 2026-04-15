"use client";
import { motion } from 'motion/react';
import { Network, DatabaseZap, FileText, Blocks } from 'lucide-react';

interface ResearchProgressProps {
  currentStage: number;
}

const STAGES = [
  { icon: Network, label: 'Formulating Vectors', color: 'from-blue-500 to-cyan-400' },
  { icon: DatabaseZap, label: 'Executing Grounding', color: 'from-cyan-500 to-blue-400' },
  { icon: FileText, label: 'Parsing Context', color: 'from-blue-400 to-cyan-500' },
  { icon: Blocks, label: 'Synthesizing Output', color: 'from-cyan-400 to-blue-500' }
];

export function ResearchProgress({ currentStage }: ResearchProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-4xl mx-auto mb-8"
    >
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-start gap-4 h-32 relative">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;

            return (
              <div key={index} className="flex-1 relative flex flex-col items-center z-10">
                <motion.div
                  className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-500 ${
                    isActive || isCompleted
                      ? `bg-gradient-to-br ${stage.color} shadow-lg`
                      : 'bg-white/5 border border-white/10'
                  }`}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -4 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    size={24}
                    className={isActive || isCompleted ? 'text-white' : 'text-white/30'}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl mix-blend-overlay"
                      style={{ background: `linear-gradient(to right, ${stage.color})` }}
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                <p className={`text-sm tracking-tight text-center transition-colors duration-300 ${
                  isActive ? 'text-white font-medium drop-shadow-sm' : isCompleted ? 'text-white/80' : 'text-white/40'
                }`}>
                  {stage.label}
                </p>
                
                {/* Connector Nodes */}
                {index < STAGES.length - 1 && (
                  <div className="absolute left-[60%] top-7 w-[80%] h-[2px] bg-white/10 -z-10 overflow-hidden">
                    <motion.div
                      className="h-full bg-white/40"
                      initial={{ x: '-100%' }}
                      animate={{ x: isCompleted ? '0%' : '-100%' }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-[length:200%_100%]"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${((currentStage + 1) / STAGES.length) * 100}%`,
              backgroundPosition: ['100% 0', '-100% 0']
            }}
            transition={{ 
              width: { duration: 0.6, ease: "circOut" },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
