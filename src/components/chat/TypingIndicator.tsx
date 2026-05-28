import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function TypingIndicator({ label = "Farmer typing...", className, labelClassName }: { label?: string; className?: string; labelClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm", className)}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        className="w-1.5 h-1.5 bg-primary-fresh rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        className="w-1.5 h-1.5 bg-primary-fresh rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        className="w-1.5 h-1.5 bg-primary-fresh rounded-full"
      />
      <span className={cn("text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2", labelClassName)}>{label}</span>
    </div>
  );
}
