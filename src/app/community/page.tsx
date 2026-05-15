import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Filter, 
  Search, 
  Sparkles,
  MessageCircle,
  Hash,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAppData';
import { useCommunity, CommunityPost, ChatRoom } from '@/src/hooks/useCommunity';
import { Card } from '@/src/components/ui/Base';
import { cn } from '@/src/lib/utils';
import PostCard from '@/src/components/community/PostCard';
import ChatRoomCard from '@/src/components/community/ChatRoomCard';
import CreatePostModal from '@/src/components/community/CreatePostModal';
import ChatWindow from '@/src/components/community/ChatWindow';

const CATEGORIES = [
  'All',
  'Crop Diseases',
  'Irrigation',
  'Market Trends',
  'Transport',
  'Fertilizers',
  'Livestock',
  'AI Tips'
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { posts, rooms, loading, fetchPosts, likePost } = useCommunity(user?.id);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchPosts(cat);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary-fresh/10 rounded-2xl flex items-center justify-center text-primary-fresh">
                <Users size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold text-primary-dark">Farmer Community</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Knowledge Sharing Hub</p>
             </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
             <button 
               onClick={() => setActiveTab('feed')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                 activeTab === 'feed' ? "bg-white text-primary-dark shadow-sm" : "text-gray-500 hover:text-primary-dark"
               )}
             >
               <MessageSquare size={14} />
               Discussion Feed
             </button>
             <button 
               onClick={() => setActiveTab('chat')}
               className={cn(
                 "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                 activeTab === 'chat' ? "bg-white text-primary-dark shadow-sm" : "text-gray-500 hover:text-primary-dark"
               )}
             >
               <MessageCircle size={14} />
               Live Chat Rooms
             </button>
          </div>

          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="p-3.5 bg-primary-dark text-white rounded-2xl shadow-xl shadow-primary-dark/20 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-8">
        {/* Left Column: Sidebar Info */}
        <aside className="hidden lg:block col-span-3 space-y-6">
          <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-primary-dark to-slate-800 text-white overflow-hidden relative">
             <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   <Sparkles size={20} className="text-primary-fresh" />
                </div>
                <h3 className="font-bold text-lg leading-tight">AgroLink AI Insights</h3>
                <p className="text-xs text-white/70 font-medium">3 farmers nearby are discussing Fall Armyworm this week in Kakamega.</p>
                <div className="pt-2">
                   <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-fresh">
                      Join Discussion <ArrowRight size={12} />
                   </button>
                </div>
             </div>
             <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          </Card>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Top Contributors</h4>
             {[
               { name: 'David K.', badge: 'Crop Expert', points: 2450, avatar: '🌽' },
               { name: 'Sarah O.', badge: 'Trusted Advisor', points: 1820, avatar: '👩‍🌾' },
               { name: 'Peter M.', badge: 'Livestock Pro', points: 1560, avatar: '🐄' },
             ].map((u, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">{u.avatar}</div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-primary-dark truncate">{u.name}</p>
                     <p className="text-[10px] font-bold text-primary-fresh uppercase tracking-widest">{u.badge}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400">{u.points} pts</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
             <div className="flex items-center gap-2 text-primary-fresh">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Community Rules</span>
             </div>
             <ul className="space-y-3">
                <li className="text-xs text-gray-500 flex gap-2">
                   <span className="text-primary-fresh font-bold">•</span>
                   Be helpful and respectful
                </li>
                <li className="text-xs text-gray-500 flex gap-2">
                   <span className="text-primary-fresh font-bold">•</span>
                   Share verified information
                </li>
                <li className="text-xs text-gray-500 flex gap-2">
                   <span className="text-primary-fresh font-bold">•</span>
                   No spam or commercial ads
                </li>
             </ul>
          </div>
        </aside>

        {/* Middle Column: Active Feed */}
        <main className="col-span-12 lg:col-span-6 space-y-6">
          {activeTab === 'feed' ? (
            <>
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                 <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                       <Filter size={14} />
                    </div>
                 </div>
                 {CATEGORIES.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
                        selectedCategory === cat ? "bg-primary-fresh text-primary-dark shadow-md" : "bg-white text-gray-500 border border-gray-100 hover:border-primary-fresh/30"
                      )}
                    >
                      {cat}
                    </button>
                 ))}
              </div>

              {/* Feed Content */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {loading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse">
                          <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-100 rounded w-1/4" />
                              <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-full" />
                            <div className="h-4 bg-gray-100 rounded w-5/6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={() => likePost(post.id)} 
                        userId={user?.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 space-y-4">
                       <MessageSquare size={48} className="text-gray-100 mx-auto" />
                       <p className="text-sm font-medium text-gray-400">No discussions found in this category.</p>
                       <button 
                         onClick={() => setIsPostModalOpen(true)}
                         className="text-primary-fresh text-xs font-bold uppercase tracking-widest hover:underline"
                       >
                         Start the first discussion
                       </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {rooms.map((room) => (
                 <ChatRoomCard key={room.id} room={room} onClick={() => setActiveRoom(room)} />
               ))}
            </div>
          )}
        </main>

        {/* Right Column: Trending & Search */}
        <aside className="hidden lg:block col-span-3 space-y-6">
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-fresh transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Search discussions..." 
               className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary-fresh/20 transition-all text-sm font-medium"
             />
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <TrendingUp size={18} className="text-amber-500" />
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trending Topics</h4>
                </div>
             </div>
             <div className="space-y-4">
                {[
                  { tag: 'FallArmyworm', count: 124, trend: 'up' },
                  { tag: 'MilkPrices', count: 86, trend: 'up' },
                  { tag: 'DroughtResistance', count: 54, trend: 'down' },
                  { tag: 'FertilizerSubsidies', count: 42, trend: 'up' },
                ].map((t, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-2">
                         <Hash size={14} className="text-gray-300" />
                         <span className="text-sm font-bold text-primary-dark group-hover:text-primary-fresh transition-colors">{t.tag}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300">{t.count}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="p-8 bg-primary-dark rounded-[2.5rem] text-white relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">Need Urgent Help?</h3>
                <p className="text-xs text-white/60 font-medium">Our AI-assisted Pest & Disease support room is active 24/7.</p>
                <button 
                  onClick={() => {
                    setActiveTab('chat');
                    setActiveRoom(rooms.find(r => r.id === 'pests') || null);
                  }}
                  className="w-full py-4 bg-primary-fresh text-primary-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-fresh/20 hover:scale-105 transition-all"
                >
                  Join Help Room
                </button>
             </div>
          </div>
        </aside>
      </div>

      {/* Modals & Chat Windows */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        user={user}
      />

      <AnimatePresence>
        {activeRoom && (
          <ChatWindow 
            room={activeRoom} 
            onClose={() => setActiveRoom(null)} 
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
