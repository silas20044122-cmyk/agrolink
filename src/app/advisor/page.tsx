import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, Sparkles, AlertCircle, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAgroLinkChatStream } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import TypingIndicator from '../../components/chat/TypingIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  {
    title: "Fall Armyworm",
    prompt: "How do I control fall armyworms organically on maize crops?",
    icon: "🐛",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-100"
  },
  {
    title: "Potato Watering",
    prompt: "What is the standard watering frequency and irrigation depth for potatoes?",
    icon: "💧",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100"
  },
  {
    title: "Dry-Climate Tomatoes",
    prompt: "What are the best tomato varieties for dry areas in Eastern Kenya and their care?",
    icon: "🍅",
    color: "from-red-500/10 to-rose-500/10 text-red-600 border-red-100"
  },
  {
    title: "Organic Fertilizer",
    prompt: "What natural organic fertilizer can I make at home to boost maize yield?",
    icon: "🌱",
    color: "from-emerald-500/10 to-green-500/10 text-emerald-600 border-emerald-100"
  }
];

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

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Habari Silas! I am your simple AgroLink AI advisor. Ask me any question about your crops, pest control, soil nutrition, or weather preparation. 

*No chat history is saved or uploaded to protect your local storage privacy.*`
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    if (!messageText) {
      setInput('');
    }
    setIsLoading(true);

    // Append user message immediately
    const updatedMessages = [...messages, { role: 'user', content: textToSend } as Message];
    setMessages(updatedMessages);

    try {
      // Create empty placeholder message for model response streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Transform history to expected format
      const historyToSend = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: msg.content }] as [{ text: string }]
      }));

      const stream = getAgroLinkChatStream(textToSend, historyToSend.slice(0, -1));
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

  const handleResetSession = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Habari Silas! I have cleared our session. Ask me any agricultural question whenever you're ready.`
      }
    ]);
  };

  return (
    <div className={cn(
      "flex flex-col h-full font-sans transition-colors duration-200",
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
            <p className={cn("text-[10px] font-bold tracking-widest uppercase mt-0.5", isDark ? "text-emerald-400" : "text-emerald-600")}>Ephemeral Advisory</p>
          </div>
        </div>

        {/* Clear/Reset button for the active session */}
        <button 
          onClick={handleResetSession}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer outline-none border border-transparent rounded-xl",
            isDark 
              ? "text-zinc-400 hover:text-red-400 hover:bg-zinc-900/80" 
              : "text-gray-500 hover:text-red-650 hover:bg-gray-100/80"
          )}
          title="Reset active chat"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </header>

      {/* Main Container Scroll Box */}
      <div className="flex-1 overflow-y-auto premium-scrollbar min-h-0 relative">
        <div className="max-w-2xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col justify-between min-h-full">
          
          {/* Chat Messages and Help Hints */}
          <div className="space-y-5 flex-1 pb-6">
            
            {/* Minimal Ephemeral Note */}
            <div className={cn(
              "p-3 rounded-2xl border text-xs flex items-center gap-2.5 shadow-xs transition-colors duration-200",
              isDark 
                ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400/90" 
                : "bg-emerald-50/40 border-emerald-100/60 text-emerald-800"
            )}>
              <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
              <span>
                <strong>Privacy Guaranteed:</strong> No chat records are saved to the cloud or local storage. Re-opening or refreshing the page starts a clean session.
              </span>
            </div>

            {/* Message Feed */}
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

            {/* Quick Suggestions (Visible only when chat is just starting with 1 greeting) */}
            {messages.length === 1 && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="pt-4 space-y-3"
              >
                <div className="flex items-center gap-1.5 px-1">
                  <HelpCircle size={14} className="text-gray-400" />
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-gray-500")}>
                    Suggested Agricultural Topics
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="quick-suggestions-grid">
                  {QUICK_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug.prompt)}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer bg-white dark:bg-[#111613] group relative overflow-hidden",
                        isDark 
                          ? "border-emerald-950/40 hover:border-emerald-500/35 hover:bg-emerald-950/10 shadow-sm" 
                          : "border-gray-150 hover:border-emerald-200 hover:bg-emerald-50/10 shadow-xs"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg select-none">{sug.icon}</span>
                        <div className={cn(
                          "w-6 h-6 rounded-lg bg-gray-50 dark:bg-[#0a0f0c] text-gray-400 group-hover:bg-primary-fresh group-hover:text-white flex items-center justify-center transition-all"
                        )}>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                      <div>
                        <h4 className={cn("text-xs font-bold leading-tight", isDark ? "text-zinc-200" : "text-gray-800")}>
                          {sug.title}
                        </h4>
                        <p className={cn("text-[11px] mt-1 leading-normal line-clamp-2", isDark ? "text-zinc-400" : "text-gray-500")}>
                          {sug.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </div>

      {/* Footer Input Panel */}
      <div className={cn(
        "p-4 shrink-0 z-20 select-none border-t transition-colors duration-200",
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
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 text-white rounded-lg disabled:opacity-20 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0 border-none",
                isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-[#1B5E20] hover:bg-emerald-700"
              )}
              title="Submit Inquiry"
            >
              <Send size={13} className="stroke-[2.5]" />
            </button>
          </div>

          <p className={cn("text-[9px] sm:text-[10px] text-center font-medium leading-none transition-colors duration-200", isDark ? "text-zinc-500" : "text-gray-400")}>
            Maize leaf spots, watering, pests, soil management & climate resilience questions.
          </p>
        </div>
      </div>

    </div>
  );
}
