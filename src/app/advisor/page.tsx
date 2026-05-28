import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAgroLinkChatStream } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import TypingIndicator from '../../components/chat/TypingIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AdvisorPage({ user }: any) {
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('agrolink_simple_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }
    return [
      {
        role: 'assistant',
        content: `Habari Silas! I am your simple AgroLink AI advisor. Ask me any question about your crops, pest control, soil nutrition, or weather preparation.`
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messaging history to local storage for convenience
  useEffect(() => {
    localStorage.setItem('agrolink_simple_chat', JSON.stringify(messages));
  }, [messages]);

  // Handle automatic scrolling to physical bottom of messages feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Append user message immediately
    const updatedMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(updatedMessages);

    try {
      // Create empty placeholder message for model response streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Transform history to expected format
      const historyToSend = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: msg.content }] as [{ text: string }]
      }));

      const stream = getAgroLinkChatStream(userMessage, historyToSend.slice(0, -1));
      let accumulatedText = '';

      for await (const chunk of stream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          setMessages(prev => {
            const copy = [...prev];
            if (copy.length > 0) {
              copy[copy.length - 1] = {
                role: 'assistant',
                content: accumulatedText
              };
            }
            return copy;
          });
        }
      }
    } catch (err: any) {
      console.error("Advisor chat request failed:", err);
      setMessages(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1] = {
            role: 'assistant',
            content: `⚠️ **Advisory Offline**: ${err?.message || "Could not connect to AI advisor. Please check your network and Gemini API key."}`
          };
        }
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const resetMsg: Message[] = [
        {
          role: 'assistant',
          content: `Habari Silas! I have cleared our session. Ask me any agricultural question whenever you're ready.`
        }
      ];
      setMessages(resetMsg);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full font-sans relative overflow-hidden select-none transition-colors duration-200",
      isDark ? "bg-[#070b08] text-zinc-100" : "bg-[#F8FAF8] text-gray-800"
    )}>
      
      {/* Header Panel */}
      <header className={cn(
        "h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 transition-all duration-200",
        isDark 
          ? "border-emerald-950/60 bg-[#0a0f0c]/90 backdrop-blur-md shadow-md" 
          : "border-gray-200/60 bg-white shadow-xs"
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-[#1B5E20] rounded-xl text-[#e8f5e9] shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className={cn("font-bold text-sm sm:text-base tracking-tight leading-none", isDark ? "text-zinc-50" : "text-gray-900")}>AgroLink AI</h1>
            <p className={cn("text-[10px] font-bold tracking-widest uppercase mt-0.5", isDark ? "text-emerald-400" : "text-emerald-600")}>Simple AI Advisor</p>
          </div>
        </div>

        {/* Clear Button */}
        <button 
          onClick={handleClearHistory}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer outline-none border border-transparent rounded-xl",
            isDark 
              ? "text-zinc-400 hover:text-red-400 hover:bg-zinc-900/80" 
              : "text-gray-500 hover:text-red-650 hover:bg-gray-100/80"
          )}
          title="Clear Conversation History"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </header>

      {/* Main Container Scroll Box */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 max-w-2xl w-full mx-auto premium-scrollbar min-h-0 relative">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex gap-3 max-w-[85%] md:max-w-[80%] items-start",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Profile Thumbnail */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold shadow-xs transition-colors duration-200",
                msg.role === 'user' 
                  ? (isDark ? "bg-emerald-800 border-emerald-700 text-emerald-50" : "bg-gray-800 border-gray-800 text-white") 
                  : (isDark ? "bg-[#0f1511] border-emerald-950 text-emerald-400" : "bg-white border-gray-100 text-[#1B5E20]")
              )}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>

              {/* Chat bubble body */}
              <div className={cn(
                "p-3.5 rounded-xl text-xs sm:text-[13px] leading-relaxed border break-words overflow-hidden transition-all duration-200",
                msg.role === 'user'
                  ? (isDark 
                      ? "bg-[#1B5E20] text-emerald-50 border-emerald-700/60 rounded-tr-none shadow-md"
                      : "bg-[#1B5E20] text-white border-[#1B5E20]/10 rounded-tr-none shadow-sm")
                  : (isDark 
                      ? "bg-[#111613] text-zinc-200 border-emerald-950/80 rounded-tl-none shadow-md" 
                      : "bg-white text-gray-700 border-gray-100/90 rounded-tl-none shadow-xs")
              )}>
                <div className={cn(
                  "markdown-body text-inherit select-text max-w-none [&_p]:text-inherit [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 mb-[-16px]",
                  isDark 
                    ? "prose-invert [&_strong]:text-white [&_strong]:font-bold [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white" 
                    : "[&_strong]:text-gray-900 [&_strong]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_h4]:text-gray-900"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <TypingIndicator 
              className={cn(
                "transition-colors duration-200",
                isDark 
                  ? "bg-[#111613] border-emerald-950/60 shadow-md text-emerald-400" 
                  : "bg-white border-gray-100 shadow-sm text-emerald-600"
              )}
              labelClassName={isDark ? "text-emerald-500/80 font-bold" : "text-emerald-600/80 font-bold"}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Static Footer Input Panel */}
      {/* pb-24 on mobile shifts the text bar cleanly above the fixed bottom navigation panel */}
      <div className={cn(
        "p-4 pb-24 sm:p-5 sm:pb-5 shrink-0 z-20 select-none border-t transition-colors duration-200",
        isDark 
          ? "bg-[#0a0f0c] border-emerald-950/60 shadow-[0_-2px_12px_rgba(0,0,0,0.3)]" 
          : "bg-white border-gray-150 shadow-[0_-2px_8px_rgba(0,0,0,0.015)]"
      )}>
        <div className="max-w-xl mx-auto space-y-2.5">
          
          {/* Input Row Box */}
          <div className={cn(
            "flex gap-2 rounded-xl transition-all p-1.5 border",
            isDark 
              ? "bg-[#101713] border-emerald-900/35 focus-within:bg-[#121c17] focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 shadow-md" 
              : "bg-gray-50 border-gray-200/80 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 shadow-xs"
          )}>
            <input 
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your question about crops or weather..."
              className={cn(
                "flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-[13px] font-medium outline-none disabled:opacity-50",
                isDark ? "text-zinc-100 placeholder-zinc-500" : "text-gray-800 placeholder-gray-400"
              )}
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 text-white rounded-lg disabled:opacity-20 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0",
                isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-[#1B5E20] hover:bg-emerald-700"
              )}
              title="Submit Inquiry"
            >
              <Send size={13} className="stroke-[2.5]" />
            </button>
          </div>

          <p className={cn("text-[9px] sm:text-[10px] text-center font-medium leading-none transition-colors duration-200", isDark ? "text-zinc-500" : "text-gray-400")}>
            Ask simple questions about planting, pests, crop rotation or disease remedies.
          </p>
        </div>
      </div>

    </div>
  );
}
