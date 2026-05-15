import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  CloudSun, 
  Sprout, 
  Camera, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  User, 
  LogOut,
  MapPin,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Search,
  Menu,
  ChevronRight,
  Settings,
  HelpCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/Base';
import { useMockAuth, useCrops } from '@/src/hooks/useAppData';
import { cn, formatDate, formatCurrency } from '@/src/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard({ user, onSetPage }: any) {
  const stats = [
    { id: 'farms', label: 'Active Plots', value: '4.2 Acres', trend: '+0.5', icon: <Sprout />, color: 'bg-green-100 text-green-600' },
    { id: 'productivity', label: 'Est. Yield', value: '18.4 Tons', trend: '+12%', icon: <Activity />, color: 'bg-blue-100 text-blue-600' },
    { id: 'market', label: 'Estimated Revenue', value: 'KSh 784k', trend: '+8.2%', icon: <TrendingUp />, color: 'bg-amber-100 text-amber-600' },
    { id: 'health', label: 'Plant Health', value: '94/100', trend: '+2', icon: <ShieldCheck />, color: 'bg-primary-dark/10 text-primary-dark' },
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
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search farms or crops..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary-fresh transition-all outline-none text-sm font-medium"
            />
         </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-2">
        {stats.map((stat) => (
          <Card 
            key={stat.id} 
            className="p-4 cursor-pointer hover:border-primary-fresh/20 transition-all group"
            onClick={() => stat.id === 'farms' ? onSetPage('farms') : stat.id === 'market' ? onSetPage('market') : null}
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

      {/* Top row stats - converted to smaller grid segments */}
      <Card className="col-span-6 md:col-span-3 p-3 md:p-4 hover:border-primary-fresh/20 transition-all cursor-pointer" onClick={() => onSetPage('weather')}>
        <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Local Weather</div>
        <div className="flex justify-between items-center">
          <div className="text-lg md:text-2xl font-bold">24°C</div>
          <div className="text-right">
            <div className="text-[10px] md:text-xs font-bold text-primary-fresh">Cloudy</div>
            <div className="text-[8px] md:text-[10px] text-gray-500 truncate max-w-[60px] md:max-w-none">{user?.region}</div>
          </div>
        </div>
      </Card>

      <Card className="col-span-6 md:col-span-3 p-3 md:p-4">
        <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Soil Nitrogen</div>
        <div className="flex justify-between items-center">
          <div className="text-lg md:text-2xl font-bold">186ppm</div>
          <div className="text-right text-primary-fresh font-bold text-[10px] md:text-xs text-nowrap">Ideal</div>
        </div>
        <div className="w-full h-1 bg-gray-100 mt-2 md:mt-3 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} className="h-full bg-primary-fresh" />
        </div>
      </Card>

      <Card className="col-span-6 md:col-span-3 p-3 md:p-4">
        <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Maize Yield Exp</div>
        <div className="flex justify-between items-center">
          <div className="text-lg md:text-2xl font-bold text-secondary-ai">42.8 Bags</div>
          <div className="text-right text-[10px] md:text-xs text-gray-500 font-bold">+18% vs Ly</div>
        </div>
      </Card>

      <Card className="col-span-6 md:col-span-3 p-3 md:p-4">
        <div className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 mb-1">Nairobi Market</div>
        <div className="flex justify-between items-center">
          <div className="text-lg md:text-2xl font-bold">KSh 3.4k</div>
          <div className="text-right text-[10px] md:text-xs text-primary-fresh font-bold flex items-center gap-0.5 md:gap-1 justify-end">
             <ArrowUpRight size={10} /> 1.8%
          </div>
        </div>
      </Card>

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
             <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] uppercase font-bold text-secondary-ai">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary-ai"></span> <span className="hidden xs:inline">Harvest</span>
             </div>
          </div>
        </div>
        <div className="flex-1 w-full translate-x-[-15px]">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData}>
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

      {/* Right Column: AI Scanner Status/Action */}
      <Card className="col-span-12 lg:col-span-4 bg-primary-dark text-white p-5 md:p-6 shadow-lg flex flex-col min-h-[280px] h-auto lg:h-[400px]">
         <h2 className="font-bold mb-4 flex items-center gap-2 text-sm md:text-base"><Camera size={18} /> AI Disease Scanner</h2>
         <div className="flex-1 border-2 border-dashed border-white/20 rounded-xl mb-4 flex flex-col items-center justify-center p-4 md:p-6 text-center group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onSetPage('scanner')}>
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
               <Badge className="bg-accent-red text-white border-none py-0.5 px-2 text-[8px] normal-case">Critical</Badge>
            </div>
            <div className="bg-white/10 p-2 md:p-3 rounded-lg flex items-center gap-3 border border-white/5 opacity-60">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-xl shrink-0 flex items-center justify-center"><Sprout size={14} /></div>
               <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] md:text-xs font-bold truncate">Fall Armyworm</div>
                  <div className="text-[8px] md:text-[10px] opacity-70">Butere West • 5h ago</div>
               </div>
               <Badge className="bg-accent-amber text-white border-none py-0.5 px-2 text-[8px] normal-case">Warning</Badge>
            </div>
         </div>
         <Button onClick={() => onSetPage('scanner')} className="w-full h-10 md:h-12 bg-primary-fresh hover:bg-white hover:text-primary-dark border-none transition-all text-xs font-bold">Launch Scanner</Button>
      </Card>

      {/* Market Mini-Insights */}
      <Card className="col-span-12 md:col-span-6 lg:col-span-4 p-4">
         <h3 className="text-[9px] md:text-[10px] font-bold mb-4 uppercase tracking-wider text-gray-400">Market Insights</h3>
         <div className="space-y-3">
            {[
              { item: 'Dry Maize (90kg Bag)', price: '3,850', change: 'up' },
              { item: 'Rosecoco Beans (90kg)', price: '13,200', change: 'up' },
              { item: 'Shangi Potatoes (50kg)', price: '2,900', change: 'down' },
              { item: 'Sorghum (90kg)', price: '5,400', change: 'neutral' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="text-[10px] md:text-xs font-medium text-gray-600 group-hover:text-primary-dark transition-colors truncate mr-2">{m.item}</div>
                <div className="text-[10px] md:text-xs font-bold flex items-center gap-1 shrink-0">
                  KSh {m.price}
                  {m.change === 'up' && <span className="text-primary-fresh font-black">↑</span>}
                  {m.change === 'down' && <span className="text-accent-red font-black">↓</span>}
                  {m.change === 'neutral' && <span className="text-gray-400 font-black">-</span>}
                </div>
              </div>
            ))}
         </div>
         <Button variant="ghost" onClick={() => onSetPage('market')} className="w-full mt-4 h-8 text-[9px] uppercase tracking-widest font-black">Full Market Board</Button>
      </Card>

      {/* Tasks Mini-List */}
      <Card className="col-span-12 md:col-span-6 lg:col-span-4 p-4">
         <h3 className="text-[9px] md:text-[10px] font-bold mb-4 uppercase tracking-wider text-gray-400">Next Actions</h3>
         <div className="space-y-3">
            {[
               { task: 'Apply Nitrogen', date: 'Tomorrow', color: 'bg-secondary-ai' },
               { task: 'Irrigation Check', date: 'Thursday', color: 'bg-accent-amber' },
               { task: 'Harvest Prep', date: 'Oct 12', color: 'bg-primary-fresh' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                 <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0", t.color)}></div>
                 <div className="text-[10px] md:text-xs font-medium text-gray-600 flex-1 truncate">{t.task}</div>
                 <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">{t.date}</div>
              </div>
            ))}
         </div>
         <Button variant="ghost" className="w-full mt-4 h-8 text-[9px] uppercase tracking-widest font-black">Calendar</Button>
      </Card>

      {/* Weather Briefing - Responsive adjustments */}
      <Card className="col-span-12 md:col-span-12 lg:col-span-4 p-4 flex flex-row lg:flex-col justify-between items-center lg:items-stretch gap-4">
         <div className="lg:w-full">
            <div className="flex items-center justify-between mb-2 lg:mb-4">
               <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gray-400">Forecast</h3>
               <div className="hidden lg:block text-[9px] font-bold text-primary-fresh uppercase tracking-widest">Next 24h</div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
               <CloudSun className="text-accent-amber shrink-0" size={28} />
               <div>
                  <p className="text-sm md:text-lg font-bold truncate">Partly Sunny</p>
                  <p className="text-[8px] md:text-[10px] text-gray-400 font-medium">Feels like 26° • 12% Rain</p>
               </div>
            </div>
         </div>
         <Button variant="outline" onClick={() => onSetPage('weather')} className="h-8 md:h-10 lg:w-full lg:mt-4 border-gray-100 text-[9px] uppercase tracking-widest font-black px-4 lg:px-2">Deep Forecast</Button>
      </Card>
    </div>
  );
}
