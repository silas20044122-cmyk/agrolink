import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Send, Sparkles, Hash } from 'lucide-react';
import { Card } from '@/src/components/ui/Base';
import { useCommunity } from '@/src/hooks/useCommunity';
import { cn } from '@/src/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const CATEGORIES = [
  'General',
  'Crop Diseases',
  'Irrigation',
  'Market Trends',
  'Transport',
  'Fertilizers',
  'Livestock',
  'AI Tips'
];

export default function CreatePostModal({ isOpen, onClose, user }: CreatePostModalProps) {
  const { createPost } = useCommunity(user?.id);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createPost(content, category);
      setContent('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl"
      >
        <Card className="p-0 border-none shadow-2xl overflow-hidden bg-white rounded-[2.5rem]">
           <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary-fresh/20 rounded-xl flex items-center justify-center text-primary-fresh">
                    <Sparkles size={20} />
                 </div>
                 <h2 className="font-bold text-primary-dark">Start a Discussion</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                 <X size={20} />
              </button>
           </div>

           <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">👨‍🌾</div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-primary-dark">{user?.name || 'Farmer Member'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posting to Community</p>
                 </div>
              </div>

              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your farming experience, ask a question, or give a tip..."
                className="w-full h-40 bg-transparent border-none outline-none resize-none text-base font-medium text-gray-700 placeholder:text-gray-300"
                autoFocus
              />

              <div className="space-y-4 pt-4">
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    <Hash size={14} className="text-gray-300 shrink-0" />
                    {CATEGORIES.map((cat) => (
                       <button 
                         key={cat}
                         onClick={() => setCategory(cat)}
                         className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                           category === cat ? "bg-primary-dark text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                         )}
                       >
                         {cat}
                       </button>
                    ))}
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                       <button className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-primary-fresh/10 hover:text-primary-fresh transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <ImageIcon size={18} /> Add Photo
                       </button>
                    </div>
                    
                    <button 
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      className="px-8 py-3.5 bg-primary-dark text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary-dark/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                       {isSubmitting ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       ) : (
                         <>
                           Post Discussion <Send size={18} />
                         </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </Card>
      </motion.div>
    </div>
  );
}
