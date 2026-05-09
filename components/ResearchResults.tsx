"use client";
import { motion } from 'motion/react';
import { SourceCard } from './SourceCard';
import { BookOpen, CheckCircle, Lightbulb, ListPlus, Share2, Download, Copy, MessagesSquare, TrendingUp, Scale } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Source {
  title: string;
  summary: string;
  url: string;
  date: string;
  relevance: number;
}

interface Section {
  heading: string;
  content: string;
}

interface Metric {
  label: string;
  value: number;
}

interface Comparison {
  feature: string;
  option_a: string;
  option_b: string;
}

interface ResearchResultsProps {
  query: string;
  sources: Source[];
  summary: string;
  sections?: Section[];
  keyFindings?: string[];
  keyMetrics?: Metric[];
  comparisons?: Comparison[];
  onFollowUp?: (followUpQuery: string) => void;
}

export function ResearchResults({ 
  query, 
  sources, 
  summary, 
  sections = [], 
  keyFindings = [], 
  keyMetrics = [],
  comparisons = [],
  onFollowUp 
}: ResearchResultsProps) {
  const handleCopyNotes = () => {
    let text = `# Research: ${query}\n\n## Summary\n${summary}\n\n`;
    if (keyFindings && keyFindings.length > 0) {
      text += `## Key Takeaways\n${keyFindings.map(f => `- ${f}`).join('\n')}\n\n`;
    }
    if (sections && sections.length > 0) {
      sections.forEach(s => {
        text += `## ${s.heading}\n${s.content}\n\n`;
      });
    }
    text += `## Sources\n${sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}\n`;
    
    navigator.clipboard.writeText(text);
    toast.success('Notes copied to clipboard!');
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto pb-12"
    >
      {/* Query header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
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
        </div>
        
        {/* Export Actions (Phase 4 / Step 4) */}
        <div className="flex items-center gap-2 print:hidden">
          <button 
            onClick={handleExportPDF}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2 text-sm" title="Download PDF">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={handleCopyNotes}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all flex items-center gap-2 text-sm" title="Copy Notes">
            <Copy size={16} />
            <span className="hidden sm:inline">Copy</span>
          </button>
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

      {/* Key Findings */}
      {keyFindings && keyFindings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={24} className="text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Key Takeaways</h3>
          </div>
          <ul className="space-y-3">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                <span className="text-white/80 leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Key Metrics (Charts) */}
      {keyMetrics && keyMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Market Metrics</h3>
          </div>
          <div className="h-[300px] w-full">
            <ChartContainer config={{
              value: { label: "Score", color: "hsl(var(--chart-1))" }
            }}>
              <BarChart data={keyMetrics}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="label" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                   stroke="rgba(255,255,255,0.5)" 
                   fontSize={12}
                   tickLine={false}
                   axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorValue)" 
                  radius={[4, 4, 0, 0]} 
                />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ChartContainer>
          </div>
        </motion.div>
      )}

      {/* Comparisons (Tables) */}
      {comparisons && comparisons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-8 overflow-hidden bg-white/5 rounded-2xl border border-white/10"
        >
          <div className="p-6 border-b border-white/10 flex items-center gap-2">
            <Scale size={24} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Comparative Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 text-sm font-semibold text-white/70">Feature</th>
                  <th className="p-4 text-sm font-semibold text-white/70">Primary Option</th>
                  <th className="p-4 text-sm font-semibold text-white/70">Secondary/Alternative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisons.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-white">{item.feature}</td>
                    <td className="p-4 text-sm text-white/70">{item.option_a}</td>
                    <td className="p-4 text-sm text-white/70">{item.option_b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Detailed Sections (Accordion) */}
      {sections && sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ListPlus size={20} className="text-purple-400" />
            Deep Dive
          </h3>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {sections.map((section, idx) => (
              <AccordionItem key={idx} value={`section-${idx}`} className="bg-white/5 border border-white/10 rounded-xl px-4 data-[state=open]:bg-white/10 transition-colors">
                <AccordionTrigger className="text-white hover:no-underline hover:text-cyan-300 transition-colors py-4">
                  {section.heading}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 leading-relaxed pb-4 whitespace-pre-wrap">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}

      {/* Sources section */}
      <div className="mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
        >
          <Share2 size={20} className="text-blue-400" />
          Sources Found ({sources.length})
        </motion.h3>
      </div>

      <div className="space-y-4">
        {sources.map((source, index) => (
          <SourceCard key={index} {...source} index={index} />
        ))}
      </div>

      {/* Follow-up actions (Phase 3) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-white/10 text-center print:hidden"
      >
        <MessagesSquare size={32} className="mx-auto mb-4 text-purple-400" />
        <h3 className="text-lg font-semibold text-white mb-2">Continue the Exploration</h3>
        <p className="text-white/60 mb-6 text-sm">Where would you like to go next?</p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => onFollowUp?.(`Go deeper on: ${query}`)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all hover:scale-105 active:scale-95 text-sm">
            Go deeper on this
          </button>
          <button 
            onClick={() => onFollowUp?.(`Compare alternatives to: ${query}`)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all hover:scale-105 active:scale-95 text-sm">
            Compare with alternatives
          </button>
          <button 
            onClick={() => onFollowUp?.(`Find more sources for: ${query}`)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all hover:scale-105 active:scale-95 text-sm">
            Find more sources
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
