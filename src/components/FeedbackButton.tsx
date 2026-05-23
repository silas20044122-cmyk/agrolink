import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquarePlus, X, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FeedbackButtonProps {
  currentPath: string;
}

export default function FeedbackButton({ currentPath }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<'bug' | 'suggestion' | 'praise' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 && !category && !comment.trim()) return;

    setIsSubmitting(true);
    // Simulate real database insert / submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Save feedback in localStorage for analysis/audit
      try {
        const key = 'agrolink_user_feedback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
          rating,
          category,
          comment,
          path: currentPath,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        console.error('Feedback save failed:', err);
      }

      // Reset state and close modal
      setTimeout(() => {
        setIsOpen(false);
        // Wait for exit transition to finish before resetting state
        setTimeout(() => {
          setRating(0);
          setCategory(null);
          setComment('');
          setIsSuccess(false);
        }, 300);
      }, 2000);
    }, 1200);
  };

  const getFeatureLabel = (path: string) => {
    if (path.startsWith('/scanner')) return 'Crop Disease Scanner';
    if (path.startsWith('/advisor')) return 'AI Technical Advisor';
    if (path.startsWith('/my-farms')) return 'My Farm Management';
    if (path.startsWith('/weather')) return 'Weather Intelligence';
    if (path.startsWith('/market')) return 'Market Prices';
    if (path.startsWith('/transport')) return 'Shared Logistics';
    if (path.startsWith('/community')) return 'Farmer Groups & Forum';
    if (path.startsWith('/dashboard')) return 'Platform Dashboard';
    return 'AgroLink App';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        id="btn-trigger-feedback"
        className="fixed z-40 right-6 bottom-24 lg:bottom-6 flex items-center gap-2 px-4 py-2.5 bg-primary-fresh text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-250 cursor-pointer text-xs font-bold leading-none select-none tracking-tight border border-white/20"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <MessageSquarePlus size={16} />
        <span>Rate this Feature</span>
      </motion.button>

      {/* Feedback Dialog Container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="feedback-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Dialog */}
            <motion.div
              id="feedback-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed z-50 right-4 bottom-24 lg:right-6 lg:bottom-20 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary-fresh p-4 text-white flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm tracking-tight">Help Us Improve</h4>
                  <p className="text-[10px] text-white/80 font-medium">Feedback on {getFeatureLabel(currentPath)}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 font-sans">
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.form
                      key="submission-form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* 1. Star Rating */}
                      <div className="space-y-2 text-center p-2 bg-gray-50 rounded-xl border border-gray-100/50">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">How would you rate this tool?</label>
                        <div className="flex items-center justify-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 text-gray-300 hover:scale-110 transition-transform focus:outline-none"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              <Star
                                size={26}
                                className={cn(
                                  "transition-colors duration-150 stroke-1.5",
                                  (hoverRating || rating) >= star
                                    ? "fill-accent-amber stroke-accent-amber"
                                    : "stroke-gray-300"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Categories selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block ml-1">Type of input</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['suggestion', 'bug', 'praise'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={cn(
                                "py-2 px-1 text-center text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-200 outline-none",
                                category === cat
                                  ? cat === 'bug'
                                    ? "bg-red-50 text-accent-red border-accent-red"
                                    : cat === 'suggestion'
                                    ? "bg-primary-fresh/5 text-primary-fresh border-primary-fresh"
                                    : "bg-green-50 text-green-700 border-green-650"
                                  : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50/50"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Custom text suggestion */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block ml-1">Your review / comments</label>
                        <textarea
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you like? What can we improve?"
                          className="w-full text-xs font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent transition-all outline-none resize-none leading-relaxed placeholder:text-gray-400"
                        />
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || (rating === 0 && !category && !comment.trim())}
                        className="w-full py-3 bg-primary-fresh hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-primary-fresh/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Submit Feedback</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success-prompt"
                      className="text-center py-6 space-y-4"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-green-50 text-primary-fresh rounded-full flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: 0, duration: 0.4 }}
                      >
                        <CheckCircle2 size={36} />
                      </motion.div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-base leading-tight">Thank You!</h4>
                        <p className="text-xs text-gray-500 font-medium px-2 leading-relaxed">
                          Your response helps us improve AgroLink tools for smallholder farmers across Kenya.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
