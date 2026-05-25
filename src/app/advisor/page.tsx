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
    <div className="flex flex-col h-full bg-[#FAFAF9] text-gray-800 font-sans relative overflow-hidden select-none">
      
      {/* Header Panel */}
      <header className="h-14 border-b border-gray-200/60 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-[#1B5E20] rounded-xl text-white shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight leading-none">AgroLink AI</h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase mt-0.5">Simple AI Advisor</p>
          </div>
        </div>

        {/* Clear Button */}
        <button 
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:text-red-650 hover:bg-gray-100/80 rounded-xl transition-all cursor-pointer outline-none border border-transparent"
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
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold shadow-xs",
                msg.role === 'user' 
                  ? "bg-gray-800 border-gray-800 text-white" 
                  : "bg-white border-gray-100 text-[#1B5E20]"
              )}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>

              {/* Chat bubble body */}
              <div className={cn(
                "p-3.5 rounded-xl text-xs sm:text-[13px] leading-relaxed border shadow-xs break-words overflow-hidden",
                msg.role === 'user'
                  ? "bg-[#1B5E20] text-white border-[#1B5E20]/10 rounded-tr-none"
                  : "bg-white text-gray-700 border-gray-100/90 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Static Footer Input Panel */}
      {/* pb-24 on mobile shifts the text bar cleanly above the fixed bottom navigation panel */}
      <div className="bg-white border-t border-gray-150 p-4 pb-24 sm:p-5 sm:pb-5 shrink-0 z-20 shadow-[0_-2px_8px_rgba(0,0,0,0.015)] selection:bg-[#E8F5E9]">
        <div className="max-w-xl mx-auto space-y-2.5">
          
          {/* Input Row Box */}
          <div className="flex gap-2 bg-gray-50 border border-gray-200/80 rounded-xl focus-with-within:bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 transition-all p-1.5 shadow-xs">
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
              className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 font-medium outline-none disabled:opacity-50"
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-[#1B5E20] hover:bg-emerald-700 text-white rounded-lg disabled:opacity-25 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0"
              title="Submit Inquiry"
            >
              <Send size={13} className="stroke-[2.5]" />
            </button>
          </div>

          <p className="text-[9px] sm:text-[10px] text-center text-gray-400 font-medium leading-none">
            Ask simple questions about planting, pests, crop rotation or disease remedies.
          </p>
        </div>
      </div>

    </div>
  );
}
