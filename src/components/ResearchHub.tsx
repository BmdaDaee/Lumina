import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BrainCircuit, Globe, History, Settings, Zap, ArrowRight, Loader2, Sparkles, Network, Terminal, Share2, Layers, AlertTriangle, MessageSquare, X, Send, User } from 'lucide-react';
import * as d3 from 'd3';
import { SearchPerspective, ResearchReport, chatWithManus } from '../services/geminiService';

export function Sidebar({ currentPerspective, onPerspectiveChange, onToggleChat, isChatActive }: { 
  currentPerspective: SearchPerspective, 
  onPerspectiveChange: (p: SearchPerspective) => void,
  onToggleChat: () => void,
  isChatActive: boolean
}) {
  const perspectives: { id: SearchPerspective, label: string, icon: any }[] = [
    { id: "objective", label: "Objective Synthesis", icon: <Globe size={16} /> },
    { id: "scientific", label: "Empirical Vector", icon: <Zap size={16} /> },
    { id: "controversial", label: "Edge Cases", icon: <AlertTriangle size={16} /> },
    { id: "historical", label: "Temporal Context", icon: <History size={16} /> },
    { id: "speculative", label: "Future Horizons", icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="w-64 border-r border-line h-screen flex flex-col p-4 bg-black/50 overflow-hidden">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
          <Zap size={18} className="text-black" />
        </div>
        <span className="font-mono text-[11px] tracking-widest uppercase opacity-70">Manus Infinite</span>
      </div>
      
      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <label className="mono text-[9px] uppercase opacity-40 mb-3 block px-2 tracking-tighter">Communication</label>
          <NavItem 
            icon={<MessageSquare size={16} />} 
            label="Neural Dialogue" 
            active={isChatActive} 
            onClick={onToggleChat}
          />
        </div>

        <div>
          <label className="mono text-[9px] uppercase opacity-40 mb-3 block px-2 tracking-tighter">Search Modalities</label>
          <div className="space-y-1">
            {perspectives.map((p) => (
              <NavItem 
                key={p.id} 
                icon={p.icon} 
                label={p.label} 
                active={currentPerspective === p.id && !isChatActive} 
                onClick={() => onPerspectiveChange(p.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mono text-[9px] uppercase opacity-40 mb-3 block px-2 tracking-tighter">Neural Nexus</label>
          <NavItem icon={<Network size={16} />} label="Active Graph" />
          <NavItem icon={<Layers size={16} />} label="Cross-Reference" />
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-line">
        <div className="px-2 py-3 glass rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
            <span className="text-[10px] mono">DV</span>
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-medium truncate">Synthesis Node 01</div>
            <div className="text-[9px] opacity-40 mono">Secure Shell</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const NavItem: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick?: () => void 
}> = ({ icon, label, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm group ${active ? 'bg-white/10 text-accent shadow-[inset_0_0_10px_rgba(0,255,0,0.05)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      <span className={`${active ? 'text-accent' : 'opacity-50 group-hover:opacity-100'}`}>{icon}</span>
      <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
      {active && <motion.div layoutId="nav-active" className="ml-auto w-1 h-3 bg-accent rounded-full" />}
    </button>
  );
};

export function ChatNexus({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let fullResponse = '';
      
      const stream = chatWithManus(userMessage);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: fullResponse }];
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection to Neural Hub lost. Please check infrastructure." }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full max-w-lg glass border-l border-line z-50 flex flex-col bg-black/90 backdrop-blur-3xl"
        >
          <header className="p-6 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h3 className="mono text-xs uppercase tracking-widest">Neural Dialogue</h3>
            </div>
            <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 text-center px-8">
                <BrainCircuit size={48} />
                <p className="text-xs mono uppercase tracking-tighter">Direct communication channel established. Consult the infinite.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-white/10' : 'bg-accent/10 border border-accent/20'}`}>
                  {m.role === 'user' ? <User size={14} /> : <BrainCircuit size={14} className="text-accent" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${m.role === 'user' ? 'bg-white/5 border border-white/10' : 'glass border-accent/5'}`}>
                  {m.content || (isStreaming && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin opacity-40" /> : null)}
                </div>
              </div>
            ))}
          </div>

          <footer className="p-6 border-t border-line bg-black/40">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Manus anything..."
                className="w-full bg-white/5 border border-line rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-accent/40 text-sm mono transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-accent hover:bg-accent/10 disabled:opacity-20 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NeuralNexus({ data }: { data: ResearchReport['nexusData'] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const width = containerRef.current.clientWidth;
    const height = 300;

    d3.select(containerRef.current).selectAll('*').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => d.group === 'root' ? '#00FF00' : '#888')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('title').text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [data]);

  return <div ref={containerRef} className="w-full h-[300px] glass rounded-xl border-accent/5 overflow-hidden" />;
}

export function ResearchDisplay({ 
  report, 
  isLoading, 
  onBranch,
  currentPerspective,
  onPerspectiveChange,
  onRefract
}: { 
  report: ResearchReport | null, 
  isLoading: boolean,
  onBranch: (query: string) => void,
  currentPerspective: SearchPerspective,
  onPerspectiveChange: (p: SearchPerspective) => void,
  onRefract: () => void
}) {
  const [hasCopied, setHasCopied] = useState(false);

  const perspectives: { id: SearchPerspective, label: string, icon: any }[] = [
    { id: "objective", label: "Objective", icon: <Globe size={12} /> },
    { id: "scientific", label: "Scientific", icon: <Zap size={12} /> },
    { id: "controversial", label: "Controversial", icon: <AlertTriangle size={12} /> },
    { id: "historical", label: "Historical", icon: <History size={12} /> },
    { id: "speculative", label: "Speculative", icon: <Sparkles size={12} /> },
  ];

  const handleShare = async () => {
    if (!report) return;
    
    const shareData = {
      title: `Manus Infinite | ${report.title}`,
      text: report.summary,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full scale-[2] animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="border-2 border-accent/30 border-t-accent rounded-full p-4"
          >
            <BrainCircuit className="text-accent" size={48} />
          </motion.div>
        </div>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="mono text-[10px] uppercase text-accent animate-pulse">Neural Path Analysis</span>
          </div>
          <p className="text-sm opacity-40 mono lowercase tracking-tighter max-w-xs mx-auto">
            Resolving conceptual dependencies and building truth indices across global infrastructure...
          </p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto px-8 py-16 max-w-5xl mx-auto custom-scrollbar"
    >
      <header className="mb-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="mono text-[10px] uppercase text-accent tracking-[0.4em] border border-accent/20 px-2 py-0.5 rounded">Synthesis Complete</span>
            <div className="h-px w-12 bg-line" />
            <button 
              onClick={handleShare}
              className={`transition-all duration-300 flex items-center gap-2 px-3 py-1 rounded-full border ${hasCopied ? 'border-accent text-accent bg-accent/10' : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/20'}`}
            >
              <span className="mono text-[9px] uppercase tracking-widest">{hasCopied ? 'Copied' : 'Share'}</span>
              {hasCopied ? <Zap size={14} /> : <Share2 size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-2 p-1 glass rounded-full self-start md:self-auto">
            {perspectives.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPerspectiveChange(p.id);
                  onRefract();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] mono uppercase transition-all ${
                  currentPerspective === p.id 
                    ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                    : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                {p.icon}
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-serif italic tracking-tight leading-[0.95] text-balance">{report.title}</h1>
          <p className="text-xl opacity-70 leading-relaxed max-w-3xl font-light">
            {report.summary}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-8 space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Terminal size={14} className="text-accent" />
              <h3 className="mono text-[10px] uppercase opacity-40 tracking-widest">Key Synthesis Nodes</h3>
            </div>
            <div className="space-y-12">
              {report.keyFindings.map((finding) => (
                <div key={finding.id} className="relative group">
                  <div className="absolute -left-8 top-0 bottom-0 w-px bg-accent/0 group-hover:bg-accent/40 transition-colors" />
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed opacity-90">
                      {finding.text}
                    </p>
                    {finding.subTopic && (
                      <button 
                        onClick={() => onBranch(finding.subTopic!)}
                        className="flex items-center gap-2 text-[10px] mono uppercase text-accent/40 hover:text-accent transition-colors py-1 group/btn"
                      >
                        <Network size={12} className="group-hover/btn:rotate-45 transition-transform" />
                        <span>Branch Research: {finding.subTopic}</span>
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
             <div className="flex items-center gap-3 mb-8">
              <BrainCircuit size={14} className="text-accent" />
              <h3 className="mono text-[10px] uppercase opacity-40 tracking-widest">Metacognition & Pathing</h3>
            </div>
            <div className="p-8 glass rounded-2xl border-accent/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={80} />
              </div>
              <p className="text-xs font-mono opacity-50 leading-loose">
                {report.thoughtProcess}
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <section>
            <h3 className="mono text-[9px] uppercase opacity-30 tracking-widest mb-4">Neural Nexus</h3>
            <NeuralNexus data={report.nexusData} />
          </section>

          <section>
             <h3 className="mono text-[9px] uppercase opacity-30 tracking-widest mb-4">Verification Layer</h3>
             <div className="space-y-4">
               {report.sources.map((source) => (
                 <a 
                   key={source.id}
                   href={source.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="block p-4 glass rounded-xl hover:border-accent/30 transition-all group bg-white/[0.01]"
                 >
                   <div className="flex items-center gap-2 mb-2">
                     <Globe size={10} className="opacity-30 group-hover:text-accent" />
                     <span className="text-[9px] mono uppercase tracking-tighter opacity-40 group-hover:opacity-100">{source.source}</span>
                   </div>
                   <p className="text-[10px] opacity-60 leading-normal line-clamp-3 group-hover:opacity-90">{source.snippet}</p>
                 </a>
               ))}
             </div>
           </section>
         </div>
       </div>

       {/* Follow-up Section */}
       <section className="pt-16 border-t border-line">
         <div className="flex items-center gap-3 mb-8">
           <Zap size={14} className="text-accent" />
           <h3 className="mono text-[10px] uppercase opacity-40 tracking-widest">Next Synthesis Vectors</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {report.followUpQueries.map((query, i) => (
             <button 
               key={i}
               onClick={() => onBranch(query)}
               className="text-left p-6 glass rounded-2xl hover:border-accent/30 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
             >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:text-accent transition-colors">
                 <ArrowRight size={24} />
               </div>
               <div className="text-[9px] mono uppercase opacity-30 mb-2">Vector 0{i+1}</div>
               <p className="text-sm opacity-70 group-hover:opacity-100">{query}</p>
             </button>
           ))}
         </div>
       </section>
     </motion.div>
   );
}

export function CommandPanel({ onSearch, isLoading }: { onSearch: (query: string) => void, isLoading: boolean }) {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <div className="p-6 border-t border-line bg-black/80 backdrop-blur-3xl">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-100 group-focus-within:text-accent transition-all">
            <Search size={18} />
          </div>
          <input 
            type="text"
            disabled={isLoading}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isLoading ? "Manus is synthesizing..." : "Enter research vector..."}
            className="w-full bg-white/5 border border-line rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all text-sm font-mono placeholder:opacity-20 disabled:opacity-50"
          />
          <div className="absolute right-4 inset-y-0 flex items-center">
            <div className={`w-1.5 h-4 transition-all duration-700 ${isLoading ? 'bg-accent animate-pulse' : 'bg-white/10'}`} />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-white text-black px-8 py-2 rounded-2xl hover:bg-accent hover:shadow-[0_0_30px_rgba(0,255,0,0.2)] transition-all flex items-center gap-2 group disabled:opacity-50 disabled:hover:bg-white disabled:hover:shadow-none"
        >
          <span className="font-bold text-xs uppercase tracking-widest">Execute</span>
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </form>
    </div>
  );
}
