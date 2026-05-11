import React, { useState } from 'react';
import { Sidebar, ResearchDisplay, CommandPanel, ChatNexus } from './components/ResearchHub';
import { deepResearch, ResearchReport, SearchPerspective } from './services/geminiService';
import { Zap, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perspective, setPerspective] = useState<SearchPerspective>("objective");
  const [history, setHistory] = useState<{ query: string, title: string, id: string }[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [activeQuery, setActiveQuery] = useState<string>("");

  const handleSearch = async (query: string, isBranch: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setIsChatOpen(false);
    if (!isBranch) setActiveQuery(query);
    try {
      const data = await deepResearch(query, perspective, isBranch);
      setReport(data);
      if (!isBranch) {
        setHistory(prev => [{ query, title: data.title, id: data.id }, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error(err);
      setError("Critical system failure: Neural nexus bridge disconnected. Verify integration keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefract = (newPerspective: SearchPerspective) => {
    setPerspective(newPerspective);
  };

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden font-sans selection:bg-accent selection:text-black">
      <Sidebar 
        currentPerspective={perspective} 
        onPerspectiveChange={(p) => {
          setPerspective(p);
          setIsChatOpen(false);
        }}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatActive={isChatOpen}
      />

      <main className="flex-1 flex flex-col relative">
        <ChatNexus isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        {/* Immersive background layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent/5 blur-[160px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            {!report && !isLoading && !error ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(0,255,0,0.2)] rotate-12"
                >
                  <Zap size={48} className="text-black" />
                </motion.div>
                <h2 className="text-7xl font-serif italic mb-6 tracking-tight">Manus Infinite</h2>
                <p className="max-w-xl text-sm opacity-40 mono leading-relaxed tracking-[0.1em] mb-12 uppercase">
                  A high-fidelity research synthesis engine powered by Gemini. <br />
                  Bridging the gap between raw data and nuanced understanding.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
                  <SuggestionBox 
                    query="The Fermi Paradox and the Great Filter: A multi-vector analysis" 
                    onClick={handleSearch} 
                  />
                  <SuggestionBox 
                    query="Subatomic architectural principles in bio-organic computing" 
                    onClick={handleSearch} 
                  />
                  <SuggestionBox 
                    query="Long-term socio-economic impact of post-scarcity energy models" 
                    onClick={handleSearch} 
                  />
                  <SuggestionBox 
                    query="Philosophical implications of non-linear temporal perception" 
                    onClick={handleSearch} 
                  />
                  <SuggestionBox 
                    query="Comparative study of decentralized governance in city-states" 
                    onClick={handleSearch} 
                  />
                  <SuggestionBox 
                    query="Synthesis of quantum field theory with neural models" 
                    onClick={handleSearch} 
                  />
                  {history.length > 0 && (
                    <div className="col-span-full mt-8 space-y-4">
                      <div className="flex items-center justify-center gap-2 opacity-20">
                        <History size={14} />
                        <span className="mono text-[10px] uppercase">Session History</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {history.map(item => (
                          <button 
                            key={item.id}
                            onClick={() => handleSearch(item.query)}
                            className="text-[10px] mono border border-line px-3 py-1 rounded-full opacity-40 hover:opacity-100 hover:border-accent transition-all"
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-red-500 gap-4"
              >
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle size={32} />
                </div>
                <span className="mono text-xs uppercase tracking-widest max-w-sm text-center leading-loose">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="mt-4 text-[10px] mono uppercase border-b border-red-500/30 hover:border-red-500 transition-colors"
                >
                  Reset Nexus Bridge
                </button>
              </motion.div>
            ) : (
              <ResearchDisplay 
                report={report} 
                isLoading={isLoading} 
                onBranch={(query) => handleSearch(query, true)}
                currentPerspective={perspective}
                onPerspectiveChange={setPerspective}
                onRefract={() => handleSearch(activeQuery)}
              />
            )}
          </AnimatePresence>
        </div>

        <CommandPanel onSearch={handleSearch} isLoading={isLoading} />
      </main>
    </div>
  );
}

function SuggestionBox({ query, onClick }: { query: string, onClick: (q: string) => void }) {
  return (
    <button 
      onClick={() => onClick(query)}
      className="glass p-6 rounded-2xl text-left hover:border-accent/40 transition-all group bg-white/[0.02]"
    >
      <div className="text-[9px] mono uppercase opacity-30 group-hover:opacity-100 group-hover:text-accent transition-all mb-3 tracking-widest">Initialization Vector</div>
      <p className="text-sm opacity-60 group-hover:opacity-100 leading-snug line-clamp-2">{query}</p>
    </button>
  );
}

