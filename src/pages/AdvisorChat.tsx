import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Plus, Image as ImageIcon, MessageSquare, Trash2, Globe2 } from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/Base';
import { getAgroLinkChatStream } from '@/src/services/geminiService';
import { useMockAuth, useFarms, useCrops } from '@/src/hooks/useAppData';
import { CROP_TYPES } from '@/src/lib/constants';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

export default function AdvisorChat() {
  const { user } = useMockAuth();
  const { farms } = useFarms(user?.id);
  const { crops } = useCrops(user?.id);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoize context to avoid re-calculating on every render
  const farmerContext = useMemo(() => {
    if (!user) return '';

    const farmInfo = farms.map(f => `- ${f.name} in ${f.location} (${f.county} County), Area: ${f.totalArea}`).join('\n');
    const cropInfo = crops.map(c => {
      const icon = CROP_TYPES.find(t => t.id === c.typeId)?.icon || '🌱';
      return `- ${icon} ${c.name} (${c.variety}) - Status: ${c.status}, Health Score: ${c.healthScore}/100, Planted: ${c.plantingDate}`;
    }).join('\n');
    
    return `
User Profile: ${user.name}, Region: ${user.region}
Owned Farms:
${farmInfo || 'No farms registered yet.'}

Active Crops:
${cropInfo || 'No crops currently being tracked.'}

Current Date: ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Note: Use emojis/icons next to crop names in your responses as well (e.g. 🌽 for Maize). If they ask about irrigation and you see they have Maize in a specific region, factor in the typical rainfall there.
`.trim();
  }, [user, farms, crops]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ 
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model', 
        parts: [{ text: m.content }] as [{ text: string }]
      }));
      
      const stream = await getAgroLinkChatStream(input, history, farmerContext);
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '', timestamp: new Date().toISOString() }]);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: fullResponse }];
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Mambo! Samahani, I'm having trouble connecting right now. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How do I control armyworms in maize?",
    "Zao la nyanya linahitaji mbolea gani?",
    "Best time to plant beans in Butere?",
    "How to improve soil health naturally?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-2 md:p-6 pb-28 md:pb-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 px-2 md:px-1 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-fresh/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-fresh shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">Farm AI Advisor</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active & Learning</span>
            </div>
          </div>
        </div>
        
        {crops.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-1 hidden sm:inline">Context:</span>
            {crops.slice(0, 3).map(c => (
              <Badge key={c.id} variant="default" className="bg-white/50 backdrop-blur-sm border border-gray-100 flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] whitespace-nowrap">
                <span>{CROP_TYPES.find(t => t.id === c.typeId)?.icon || '🌱'}</span>
                <span className="font-bold text-gray-700">{c.name}</span>
              </Badge>
            ))}
            {crops.length > 3 && <Badge variant="default" className="text-[10px] bg-white/50 border border-gray-100 rounded-full">+{crops.length - 3}</Badge>}
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="text-gray-300 hover:text-red-500 hover:bg-red-50 w-9 h-9 hidden md:flex">
           <Trash2 size={18} />
        </Button>
      </header>

      {/* Chat Area */}
      <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-2xl md:shadow-xl bg-white rounded-3xl md:rounded-[2.5rem]">
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-8 bg-gray-50/20 no-scrollbar scroll-smooth">
           {messages.length === 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col items-center justify-center text-center space-y-8"
             >
               <div className="relative">
                 <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-fresh/20 to-primary-dark/5 rounded-[2rem] flex items-center justify-center text-primary-dark shadow-inner rotate-3">
                   <Sparkles size={40} className="animate-pulse" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-fresh">
                    <MessageSquare size={16} />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Mambo! I am AgroLink AI</h3>
                 <p className="text-gray-400 max-w-[240px] md:max-w-sm mx-auto text-xs md:text-sm font-medium leading-relaxed italic">
                   "A friend in agriculture is a friend in life." Ask me anything in Swahili or English.
                 </p>
               </div>
               
               <div className="grid grid-cols-1 gap-3 w-full max-w-sm px-4">
                 <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Suggested Inquiries</p>
                 {suggestions.map((s, i) => (
                   <button 
                     key={i} 
                     onClick={() => setInput(s)}
                     className="group p-4 bg-white border border-gray-100 rounded-2xl text-[11px] md:text-xs font-bold text-gray-500 hover:border-primary-fresh hover:text-primary-dark transition-all text-left shadow-sm flex items-center justify-between"
                   >
                     <span className="line-clamp-1">{s}</span>
                     <Plus size={14} className="text-gray-300 group-hover:text-primary-fresh transition-colors" />
                   </button>
                 ))}
               </div>
             </motion.div>
           )}

           <AnimatePresence mode="popLayout">
             {messages.map((m, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, scale: 0.9, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className={cn("flex items-end gap-2 md:gap-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}
               >
                 <div className={cn(
                   "w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm mb-1",
                   m.role === 'user' ? "bg-primary-fresh text-white" : "bg-white text-primary-fresh border border-gray-100"
                 )}>
                   {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                 </div>
                 <div className={cn(
                   "max-w-[88%] md:max-w-[80%] p-3.5 md:p-6 shadow-sm relative",
                   m.role === 'user' 
                     ? "bg-primary-dark text-white rounded-[1.25rem] rounded-br-[0.25rem]" 
                     : "bg-white text-gray-800 rounded-[1.25rem] rounded-bl-[0.25rem] border border-gray-100"
                 )}>
                   <div className="markdown-body text-xs md:text-sm leading-relaxed antialiased">
                     <ReactMarkdown>{m.content}</ReactMarkdown>
                   </div>
                   {i === messages.length - 1 && isLoading && m.role === 'model' && (
                     <div className="flex items-center gap-1.5 mt-4 p-2 bg-gray-50/50 rounded-xl w-fit">
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">AI Analyzing...</span>
                       <span className="flex gap-1">
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 bg-primary-fresh rounded-full" />
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-primary-fresh rounded-full" />
                         <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-primary-fresh rounded-full" />
                       </span>
                     </div>
                   )}
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
         </div>

         {/* Input Area */}
         <div className="p-4 md:p-8 bg-white border-t border-gray-50">
           <div className="max-w-3xl mx-auto flex items-end gap-3">
             <button className="p-3.5 text-gray-400 hover:bg-bg-soft rounded-2xl transition-colors shrink-0 mb-0.5">
               <ImageIcon size={22} />
             </button>
             <div className="flex-1 relative">
               <textarea 
                 rows={1}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                   }
                 }}
                 placeholder="Uliza ushauri wa kilimo..."
                 className="w-full pl-5 pr-14 py-4 bg-gray-50 border-none rounded-[1.75rem] focus:ring-2 focus:ring-primary-fresh transition-all outline-none resize-none text-sm font-medium leading-tight"
                 style={{ minHeight: '56px', maxHeight: '120px' }}
               />
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isLoading}
                 className="absolute right-1.5 bottom-1.5 p-3.5 bg-primary-dark text-white rounded-2xl disabled:opacity-30 hover:bg-opacity-90 transition-all shadow-lg shadow-primary-dark/20"
               >
                 <Send size={18} />
               </button>
             </div>
           </div>
           
           <div className="flex items-center justify-center gap-6 mt-4 opacity-40">
              <div className="flex items-center gap-1.5">
                <Globe2 size={10} />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Multilingual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">Smart Advice</span>
              </div>
           </div>
         </div>
      </Card>
    </div>
  );
}
