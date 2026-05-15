import { motion } from 'motion/react';

interface TypingIndicatorProps {
  className?: string;
}

export default function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 px-1 py-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-primary-fresh/60 rounded-full"
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-widest hidden sm:inline">
        AI is analyzing...
      </span>
    </div>
  );
}
