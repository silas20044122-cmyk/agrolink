import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Image as ImageIcon, Users, Smile, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/src/components/ui/Base';
import { useChat, ChatRoom } from '@/src/hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/src/lib/utils';
import TypingIndicator from '@/src/components/chat/TypingIndicator';

interface ChatWindowProps {
  room: ChatRoom;
  onClose: () => void;
  user: any;
}

export default function ChatWindow({ room, onClose, user }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage } = useChat(room.id, user?.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    await sendMessage(content);
  };

  return (
    <div className="fixed inset-0 lg:inset-auto lg:bottom-4 lg:right-4 z-[150] lg:w-96 lg:h-[600px] flex flex-col">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary-dark/40 lg:hidden" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex-1 bg-white flex flex-col overflow-hidden lg:rounded-[2.5rem] shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 bg-primary-dark text-white flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                 {room.icon}
              </div>
              <div>
                 <h3 className="text-sm font-bold leading-tight">{room.name}</h3>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{room.activeUsers} farmers online</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2 bg-primary-fresh/10 border-b border-primary-fresh/10 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary-fresh" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary-dark/60">Community Safety Active</span>
           </div>
           <Sparkles size={12} className="text-primary-fresh opacity-40" />
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar bg-gray-50/30"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
               <div className="w-8 h-8 border-3 border-primary-dark/10 border-t-primary-dark rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
               <Users size={48} className="text-gray-300" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No messages yet.<br/>Start the conversation!</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMine = m.authorId === user?.id;
              return (
                <div key={m.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                   <div className={cn("flex items-end gap-2 max-w-[85%]", isMine && "flex-row-reverse")}>
                      {!isMine && (
                        <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                           {m.author?.avatarUrl && (m.author.avatarUrl.startsWith('http') || m.author.avatarUrl.includes('/')) ? (
                             <img src={m.author.avatarUrl} alt={m.author.displayName} className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-sm">{m.author?.avatarUrl || '👨‍🌾'}</span>
                           )}
                        </div>
                      )}
                      <div>
                         {!isMine && (
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">{m.author?.displayName || 'Farmer'}</p>
                         )}
                         <div className={cn(
                           "p-4 rounded-2xl text-sm font-medium shadow-sm",
                           isMine ? "bg-primary-dark text-white rounded-br-none" : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                         )}>
                            {m.content}
                         </div>
                      </div>
                   </div>
                   <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 px-1">
                      {formatDistanceToNow(new Date(m.createdAt))} ago
                   </span>
                </div>
              );
            })
          )}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
           <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Type a message..."
                className="w-full pl-5 pr-14 py-4 bg-gray-50 border-none rounded-[1.75rem] outline-none resize-none text-sm font-medium focus:ring-2 focus:ring-primary-fresh/20 transition-all"
              />
              <div className="absolute left-2 -top-10 flex gap-2">
                 {/* Quick reactions could go here */}
              </div>
              <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1">
                 <button className="p-2 text-gray-400 hover:text-primary-fresh transition-colors">
                    <ImageIcon size={18} />
                 </button>
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim()}
                   className="p-3 bg-primary-dark text-white rounded-2xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                 >
                    <Send size={18} />
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
