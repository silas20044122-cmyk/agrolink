import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, MessageSquare, Trash2, Globe2, ImageIcon, Plus } from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/Base';
import { getAgroLinkChatStream } from '@/src/services/geminiService';
import { useFarms, useCrops } from '@/src/hooks/useAppData';
import { CROP_TYPES } from '@/src/lib/constants';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

export default function AdvisorPage({ user }: any) {
  const { farms } = useFarms(user?.id);
  const { crops } = useCrops(user?.id);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoize context
  const farmerContext = useMemo(() => {
    if (!user) return '';
    const farmInfo = farms.map((f: any) => `- ${f.name} in ${f.county}`).join('\n');
    const cropInfo = crops.map((c: any) => `- ${c.name} (${c.variety}) - Status: ${c.status}`).join('\n');
    
    return `User: ${user.name}, Region: ${user.region}\nFarms:\n${farmInfo}\nCrops:\n${cropInfo}`;
  }, [user, farms, crops]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user', content: input };
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
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: fullResponse }];
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-2 md:p-6 pb-28 md:pb-6">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-fresh/10 rounded-2xl flex items-center justify-center text-primary-fresh">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-dark">AI Technical Advisor</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available for agricultural advisory</span>
        </div>
      </header>

      <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-2xl bg-white rounded-[2.5rem]">
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gray-50/20 no-scrollbar">
           {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <Sparkles size={48} className="text-primary-fresh opacity-20" />
               <p className="text-sm text-gray-400 font-medium max-w-xs">Ask me about crop health, market shifts, or irrigation strategies.</p>
             </div>
           )}
           {messages.map((m, i) => (
             <div key={i} className={cn("flex items-start gap-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
               <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", m.role === 'user' ? "bg-primary-dark text-white" : "bg-white text-primary-fresh border border-gray-100")}>
                 {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
               </div>
               <div className={cn("max-w-[80%] p-6 shadow-sm rounded-[2rem]", m.role === 'user' ? "bg-primary-fresh text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100")}>
                 <div className="markdown-body text-sm leading-relaxed">
                   <ReactMarkdown>{m.content}</ReactMarkdown>
                 </div>
               </div>
             </div>
           ))}
         </div>

         <div className="p-6 md:p-8 bg-white border-t border-gray-50">
           <div className="max-w-3xl mx-auto flex items-end gap-3 relative">
             <textarea 
               rows={1}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
               placeholder="Ask for advice..."
               className="w-full pl-5 pr-14 py-4 bg-gray-50 border-none rounded-[1.75rem] outline-none resize-none text-sm font-medium"
             />
             <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-1.5 bottom-1.5 p-3.5 bg-primary-dark text-white rounded-2xl disabled:opacity-30">
               <Send size={18} />
             </button>
           </div>
         </div>
      </Card>
    </div>
  );
}
