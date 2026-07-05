import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  CloudSun, 
  Sprout, 
  Camera, 
  MessageSquare, 
  TrendingUp, 
  MapPin,
  Plus,
  ArrowUpRight,
  Activity,
  Search,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/Base';
import { useCrops, useFarms } from '@/src/hooks/useAppData';
import { cn } from '@/src/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardPage({ user, onSearchClick }: { user: any, onSearchClick?: () => void }) {
  const navigate = useNavigate();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const { farms, loading: farmsLoading } = useFarms(user?.id);
  const { crops, loading: cropsLoading } = useCrops(user?.id);

  // Calculate real stats from user data
  const totalArea = farms.reduce((acc, f) => acc + (parseFloat(f.totalArea) || 0), 0);
  const avgHealth = crops.length > 0 ? Math.round(crops.reduce((acc, c) => acc + (c.healthScore || 0), 0) / crops.length) : 0;
  
  const stats = [
    { id: 'farms', label: 'Active Plots', value: `${farms.length} Farms`, trend: farms.length > 0 ? '+' + farms.length : '0', icon: <Sprout />, color: 'bg-green-100 text-green-600', path: '/my-farms' },
    { id: 'productivity', label: 'Total Area', value: `${totalArea.toFixed(1)} Acres`, trend: '+0.5', icon: <Activity />, color: 'bg-blue-100 text-blue-600' },
    { id: 'market', label: 'Estimated Revenue', value: crops.length > 0 ? `KSh ${(crops.length * 45).toFixed(0)}k` : 'KSh 0', trend: '+8.2%', icon: <TrendingUp />, color: 'bg-amber-100 text-amber-600', path: '/market' },
    { id: 'health', label: 'Plant Health', value: crops.length > 0 ? `${avgHealth}/100` : '--/100', trend: crops.length > 0 ? '+2' : '-', icon: <ShieldCheck />, color: 'bg-primary-dark/10 text-primary-dark' },
  ];

  const marketData = [
    { day: 'Mon', price: 3800, inventory: 45 },
    { day: 'Tue', price: 3950, inventory: 52 },
    { day: 'Wed', price: 4100, inventory: 48 },
    { day: 'Thu', price: 4050, inventory: 60 },
    { day: 'Fri', price: 4200, inventory: 55 },
    { day: 'Sat', price: 4350, inventory: 42 },
    { day: 'Sun', price: 4300, inventory: 38 },
  ];

  return (
    <div className="p-3 md:p-6 pb-24 grid grid-cols-12 gap-3 md:gap-4 max-w-full">
      {/* Search Bar - Mobile Focus */}
      <div className="col-span-12 md:hidden mb-2">
         <div className="relative" onClick={onSearchClick}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              readOnly
              type="text" 
              placeholder="Search farms or crops..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary-fresh transition-all outline-none text-sm font-medium cursor-pointer"
            />
         </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-2">
        {stats.map((stat) => (
          <Card 
            key={stat.id} 
            className="p-4 cursor-pointer hover:border-primary-fresh/20 transition-all group"
            onClick={() => stat.path && navigate(stat.path)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-transform", stat.color)}>
                {stat.icon}
              </div>
              <div className="text-[10px] font-bold text-primary-fresh bg-primary-fresh/10 px-2 py-0.5 rounded-full">
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-primary-dark">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chart Area */}
      <Card className="col-span-12 lg:col-span-8 p-4 md:p-6 flex flex-col h-[300px] md:h-[400px]">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div>
             <h2 className="font-bold text-xs md:text-sm">Harvest & Market Performance</h2>
             <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market Price vs Yield Content</p>
          </div>
          <div className="flex gap-2 md:gap-4 shrink-0">
             <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] uppercase font-bold text-primary-fresh">
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary-fresh"></span> <span className="hidden xs:inline">Market Price</span>
             </div>
             <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] uppercase font-bold text-primary-dark">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary-dark"></span> <span className="hidden xs:inline">Harvest</span>
             </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-[250px] relative">
           <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={marketData} margin={{ left: -20 }}>
                 <defs>
                   <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#43A047" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#43A047" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94A3B8' }} />
                 <YAxis hide />
                 <Tooltip 
                   contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '9px' }}
                 />
                 <Area type="monotone" dataKey="price" stroke="#43A047" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </Card>

      {/* Right Column: AI Disease Scanner Status */}
      <Card className="col-span-12 lg:col-span-4 bg-primary-dark text-white p-5 md:p-6 shadow-lg flex flex-col min-h-[280px] h-auto lg:h-[400px]">
         <h2 className="font-bold mb-4 flex items-center gap-2 text-sm md:text-base"><Camera size={18} /> AI Disease Scanner</h2>
         <div className="flex-1 border-2 border-dashed border-white/20 rounded-xl mb-4 flex flex-col items-center justify-center p-4 md:p-6 text-center group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/scanner')}>
            <div className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
            <p className="text-xs md:text-sm font-bold mb-1">Click to Scan Leaf</p>
            <p className="text-[9px] md:text-[10px] opacity-60 font-medium">Auto-detection active</p>
         </div>
         <div className="space-y-2 mb-2 lg:mb-4">
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60">Recent History</div>
            <div className="bg-white/10 p-2 md:p-3 rounded-lg flex items-center gap-3 border border-white/5">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-xl shrink-0 flex items-center justify-center"><Sprout size={14} /></div>
               <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] md:text-xs font-bold truncate">Maize Lethal Necrosis</div>
                  <div className="text-[8px] md:text-[10px] opacity-70">Butere East • 2h ago</div>
               </div>
               <Badge className="bg-red-500 text-white border-none py-0.5 px-2 text-[8px] normal-case">Critical</Badge>
            </div>
         </div>
         <Button onClick={() => navigate('/scanner')} className="w-full h-10 md:h-12 bg-primary-fresh hover:bg-white hover:text-primary-dark border-none transition-all text-xs font-bold">Launch Scanner</Button>
      </Card>

      {/* Quick Action Floating Button Menu */}
      <div className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-45 flex flex-col items-end gap-3" id="quick-action-menu-container">
        <AnimatePresence>
          {isQuickMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  }
                },
                hidden: {
                  transition: {
                    staggerChildren: 0.05,
                    staggerDirection: -1
                  }
                }
              }}
              className="flex flex-col items-end gap-3 mb-2"
              id="quick-action-list"
            >
              {/* Action 1: AI Advisor Chat */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.8 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => {
                  navigate('/advisor');
                  setIsQuickMenuOpen(false);
                }}
                id="quick-action-advisor"
              >
                <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-gray-100/80 group-hover:bg-primary-dark group-hover:text-white transition-all whitespace-nowrap">
                  Talk to AI Advisor
                </span>
                <div className="w-11 h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
                  <MessageSquare size={18} />
                </div>
              </motion.div>

              {/* Action 2: Check Market Prices */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.8 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => {
                  navigate('/market');
                  setIsQuickMenuOpen(false);
                }}
                id="quick-action-market"
              >
                <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-gray-100/80 group-hover:bg-primary-dark group-hover:text-white transition-all whitespace-nowrap">
                  Check Market Prices
                </span>
                <div className="w-11 h-11 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
                  <TrendingUp size={18} />
                </div>
              </motion.div>

              {/* Action 3: Scan a Leaf */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.8 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => {
                  navigate('/scanner');
                  setIsQuickMenuOpen(false);
                }}
                id="quick-action-scanner"
              >
                <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md border border-gray-100/80 group-hover:bg-primary-dark group-hover:text-white transition-all whitespace-nowrap">
                  Scan Leaf Disease
                </span>
                <div className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
                  <Camera size={18} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Toggle Button */}
        <motion.button
          onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-colors duration-300 outline-none z-50 border-none",
            isQuickMenuOpen 
              ? "bg-gray-800 hover:bg-gray-900 shadow-gray-800/20" 
              : "bg-gradient-to-r from-primary-fresh to-primary-dark hover:from-primary-dark hover:to-primary-fresh shadow-primary-fresh/30"
          )}
          id="quick-action-toggle-btn"
          aria-label="Toggle Quick Actions Menu"
        >
          <motion.div
            animate={{ rotate: isQuickMenuOpen ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            {isQuickMenuOpen ? <Plus size={24} /> : <Sparkles size={24} />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
