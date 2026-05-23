import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Image as ImageIcon, Users, Smile, ShieldCheck, Sparkles, CornerUpLeft } from 'lucide-react';
import { Card } from '@/src/components/ui/Base';
import { useChat, ChatRoom, ChatMessage } from '@/src/hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/src/lib/utils';
import TypingIndicator from '@/src/components/chat/TypingIndicator';
import { isSupabaseConfigured } from '@/src/lib/supabase';

interface ChatWindowProps {
  room: ChatRoom;
  onClose: () => void;
  user: any;
}

export default function ChatWindow({ room, onClose, user }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, deleteMessage } = useChat(room.id, user);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    const replyMeta = replyTarget ? {
      id: replyTarget.id,
      authorName: replyTarget.author?.displayName || 'Farmer',
      content: replyTarget.content
    } : undefined;
    
    await sendMessage(content, undefined, replyMeta);
    setReplyTarget(null);
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
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                      {room.activeUsers} {room.activeUsers === 1 ? 'member' : 'members'} joined
                    </span>
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
            messages.map((m) => {
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
                           "p-4 rounded-2xl text-sm font-medium shadow-sm text-left",
                           isMine ? "bg-primary-dark text-white rounded-br-none" : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                         )}>
                            {m.replyTo && (
                              <div className={cn(
                                "mb-2 p-2.5 rounded-xl border-l-2 text-[10px] leading-relaxed max-w-full text-left",
                                isMine 
                                  ? "bg-white/10 border-white/40 text-white/90" 
                                  : "bg-gray-100/70 border-primary-fresh/60 text-gray-600"
                              )}>
                                 <span className={cn(
                                   "font-bold block text-[8px] uppercase tracking-wider mb-0.5",
                                   isMine ? "text-white/70" : "text-gray-400"
                                 )}>
                                    Reply to {m.replyTo.authorName}:
                                 </span>
                                 <p className="line-clamp-2 italic font-semibold">{m.replyTo.content}</p>
                              </div>
                            )}
                            <p className="break-words leading-relaxed">{m.content}</p>
                         </div>
                      </div>
                   </div>
                   <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 px-1 flex items-center gap-1.5 select-none">
                      <span>{formatDistanceToNow(new Date(m.createdAt))} ago</span>
                      <span>•</span>
                      <button 
                        onClick={() => setReplyTarget(m)}
                        className="text-primary-fresh hover:underline cursor-pointer lowercase flex items-center gap-0.5 font-bold"
                      >
                        <CornerUpLeft size={9} className="stroke-[3]" />
                        reply
                      </button>
                      {(isMine || !isSupabaseConfigured) && (
                        <>
                          <span>•</span>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this message?')) {
                                deleteMessage(m.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-500 hover:underline cursor-pointer lowercase flex items-center gap-0.5 font-bold"
                          >
                            delete
                          </button>
                        </>
                      )}
                   </div>
                </div>
              );
            })
          )}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
           {/* Reply Target Preview */}
           <AnimatePresence>
             {replyTarget && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs transition-all overflow-hidden"
                >
                   <div className="border-l-2 border-primary-fresh pl-3 overflow-hidden text-left">
                      <span className="font-extrabold text-[9px] text-primary-fresh uppercase block">Replying to {replyTarget.author?.displayName || 'Farmer'}</span>
                      <p className="text-gray-500 font-semibold truncate max-w-[200px]">{replyTarget.content}</p>
                   </div>
                   <button 
                      onClick={() => setReplyTarget(null)}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-650 transition-colors shrink-0"
                   >
                      <X size={14} />
                   </button>
                </motion.div>
             )}
           </AnimatePresence>

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
