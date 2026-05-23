import { motion } from 'motion/react';
import { Users, ChevronRight } from 'lucide-react';
import { ChatRoom } from '@/src/hooks/useCommunity';

interface ChatRoomCardProps {
  room: ChatRoom;
  onClick: () => void;
}

export default function ChatRoomCard({ room, onClick }: ChatRoomCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-left hover:shadow-md transition-all group flex flex-col justify-between h-48"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary-fresh/20 transition-colors">
              {room.icon}
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-[10px] font-black text-green-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {room.activeUsers} {room.activeUsers === 1 ? 'member' : 'members'} joined
           </div>
        </div>
        
        <div>
           <h3 className="font-bold text-primary-dark group-hover:text-primary-fresh transition-colors">{room.name}</h3>
           <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1 line-clamp-2">{room.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{room.category}</span>
         <div className="flex items-center gap-1 text-[10px] font-black text-primary-fresh uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            Join Chat <ChevronRight size={12} />
         </div>
      </div>
    </motion.button>
  );
}
