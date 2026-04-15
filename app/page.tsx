"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, AlertCircle } from 'lucide-react';
import { ResearchInput } from '@/components/ResearchInput';
import { ResearchProgress } from '@/components/ResearchProgress';
import { ResearchResults } from '@/components/ResearchResults';
import { Sidebar } from '@/components/Sidebar';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Logo } from '@/components/Logo';

interface ResearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

type AppState = 'idle' | 'searching' | 'results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    setAppState('searching');
    setCurrentStage(1);
    setError(null);

    setHistory((prev) => [{
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
    }, ...prev]);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => Math.min(prev + 1, 3));
    }, 1500);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      clearInterval(stageInterval);
      setCurrentStage(4);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The research request failed to resolve.");
      
      const payload = data.research;
      
      const adaptedSources = (payload.sources || []).map((s: any, i: number) => ({
        title: s.title || s.domain,
        url: s.url,
        summary: s.description || "Reference",
        date: new Date(payload.lastUpdated).toLocaleDateString(),
        relevance: Math.max(0, 100 - (i * 2))
      }));

      setResults({
        query: payload.title || query,
        summary: payload.summary || "Analysis finalized.",
        sources: adaptedSources,
        sections: payload.sections,
        keyFindings: payload.keyFindings
      });
      
      setAppState('results');
    } catch (err: any) {
      clearInterval(stageInterval);
      setAppState('idle');
      setError(err.message);
    }
  };

  const resetSession = () => {
    setAppState('idle');
    setResults(null);
    setCurrentStage(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <FloatingParticles />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <Sidebar
        history={history}
        onSelectHistory={(item) => handleSearch(item.query)}
        onClearHistory={() => setHistory([])}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} />
            </motion.button>
            
            <motion.div className="flex items-center gap-3">
              <Logo size={32} />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Workspace</h1>
                <p className="text-xs sm:text-sm text-white/50">Market Intelligence</p>
              </div>
            </motion.div>
          </div>

          {appState === 'results' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetSession}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Query
            </motion.button>
          )}
        </motion.header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200"
            >
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            {appState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] mt-8 sm:mt-0"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mb-8"
                >
                  <div className="relative flex items-center justify-center">
                    <Logo size={128} isActive={true} />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-40"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl font-bold mb-4 text-center px-4"
                >
                  Define your objective
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl text-white/60 mb-12 text-center max-w-2xl px-4"
                >
                  Initialize a concurrent search across the internet to synthesize contextual datasets.
                </motion.p>

                <div className="w-full px-4 max-w-2xl">
                  <ResearchInput onSubmit={handleSearch} isSearching={false} />
                </div>
              </motion.div>
            )}

            {appState === 'searching' && (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <ResearchProgress currentStage={currentStage} />
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-8 px-4"
                >
                  <p className="text-white/60">Executing: <span className="text-white font-medium">"{currentQuery}"</span></p>
                </motion.div>
              </motion.div>
            )}

            {appState === 'results' && results && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ResearchResults {...results} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
