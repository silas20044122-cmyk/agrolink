import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { TrendingUp, TrendingDown, MapPin, Search, Filter, ArrowUpRight, ArrowDownRight, Info, ShoppingCart, RefreshCcw, X, Plus, Calendar } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/src/lib/utils';
import { useMarketData, useCrops } from '@/src/hooks/useAppData';

export default function MarketInsights({ user }: any) {
  const [activeMarket, setActiveMarket] = useState('Nairobi');
  const { marketPrices, loading } = useMarketData(activeMarket);
  const { crops } = useCrops(user?.id);
  
  const [showSellModal, setShowSellModal] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [formData, setFormData] = useState({
    cropId: '',
    quantity: '',
    price: '',
    notes: ''
  });

  const markets = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kakamega', 'Busia'];

  const chartData = [
    { month: 'Jan', price: 3800 },
    { month: 'Feb', price: 3950 },
    { month: 'Mar', price: 4100 },
    { month: 'Apr', price: 4050 },
    { month: 'May', price: 4200 },
    { month: 'Jun', price: 4350 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Market Intelligence</h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium tracking-tight">Real-time commodity prices and demand forecasts across Kenya.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
           <Button variant="outline" className="bg-white border-gray-100 rounded-2xl h-12 md:h-14 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
             Export Analysis
           </Button>
           <Button 
             variant="primary" 
             className="rounded-2xl h-12 md:h-14 px-8 flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary-fresh/20"
             onClick={() => setShowSellModal(true)}
            >
             <ShoppingCart size={18} /> Sell Produce
           </Button>
        </div>
      </header>

      {/* Market Selector */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 gap-2 md:gap-3 no-scrollbar">
        {markets.map(m => (
          <button
            key={m}
            onClick={() => setActiveMarket(m)}
            className={cn(
              "whitespace-nowrap px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all",
              activeMarket === m 
                ? "bg-primary-dark text-white shadow-lg" 
                : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Left: Price List */}
        <div className="xl:col-span-1 space-y-4 md:space-y-6 order-2 xl:order-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg md:text-xl font-bold tracking-tight">Latest in {activeMarket}</h3>
            {loading && <RefreshCcw className="animate-spin text-primary-fresh" size={16} />}
          </div>
          
          <div className="space-y-4">
            {marketPrices.map((item) => (
              <Card key={item.id} className="p-4 md:p-6 group hover:border-primary-fresh/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-dark group-hover:bg-primary-fresh/10 transition-colors">
                       <TrendingUp size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.cropName}</h4>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Per {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base md:text-lg font-bold text-gray-900">KSh {Math.round(item.pricePerUnit).toLocaleString()}</p>
                    <div className={cn(
                      "flex items-center justify-end gap-0.5 md:gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest",
                      Number(item.change) > 0 ? 'text-green-600' : Number(item.change) < 0 ? 'text-red-500' : 'text-gray-400'
                    )}>
                      {Number(item.change) > 0 ? <ArrowUpRight size={10} /> : Number(item.change) < 0 ? <ArrowDownRight size={10} /> : null}
                      {item.change}%
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {marketPrices.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-400 font-medium">
                No market data available for this region.
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Analysis */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8 order-1 xl:order-2">
           <Card className="p-5 md:p-10 space-y-6 md:space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">Price Trend Analysis</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Dry Maize (Wholesale) • {activeMarket}</p>
                 </div>
                 <Badge variant="info" className="w-fit">Predicted +4.2%</Badge>
              </div>

              <div className="h-60 md:h-80 w-full relative min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <AreaChart data={chartData} margin={{ left: -20 }}>
                    <defs>
                      <linearGradient id="colorPriceMarket" x1="0" y1="1" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94A3B8' }} domain={['dataMin - 100', 'dataMax + 100']} hide={window.innerWidth < 640} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#1B5E20" strokeWidth={3} fillOpacity={1} fill="url(#colorPriceMarket)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                <div className="space-y-1">
                   <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Status</p>
                   <p className="text-base md:text-lg font-bold text-primary-dark">High Demand</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supply Vol.</p>
                   <p className="text-base md:text-lg font-bold text-amber-600">Low (Drought)</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Hub</p>
                   <p className="text-base md:text-lg font-bold text-blue-600">NCPB Hub</p>
                </div>
              </div>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <Card className="p-6 md:p-8 bg-blue-600 text-white border-none space-y-4 md:space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                     <TrendingUp size={20} />
                   </div>
                   <h4 className="font-bold text-sm md:text-base">Advisor Tip</h4>
                 </div>
                 <p className="text-xs md:text-sm font-medium leading-relaxed opacity-90">
                   Wholesale buyers are prioritizing high-quality, Grade 1 maize with moisture levels below 13.5%.
                 </p>
                 <Button variant="ghost" className="text-white hover:bg-white/10 p-0 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 h-auto">
                   View Tips <ChevronRight size={14} />
                 </Button>
              </Card>

              <Card className="p-6 md:p-8 border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center space-y-2 md:space-y-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                   <Info size={24} />
                 </div>
                 <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Updates</p>
                 <p className="text-[10px] md:text-xs font-medium text-gray-500 leading-relaxed">
                   Source: Kenya AFA & Hub Agents.
                 </p>
              </Card>
           </div>
        </div>
      </div>

      {/* Sell Produce Modal */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" 
              onClick={() => setShowSellModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 bg-primary-fresh text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">List Your Produce</h3>
                  <p className="text-white/80 text-sm font-medium mt-1">Directly connect with wholesale buyers.</p>
                </div>
                <button onClick={() => setShowSellModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form 
                className="p-8 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsListing(true);
                  setTimeout(() => {
                    setIsListing(false);
                    setShowSellModal(false);
                  }, 1500);
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Select Your Crop</label>
                    <select 
                       required
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary-fresh transition-all"
                       value={formData.cropId}
                       onChange={(e) => setFormData({...formData, cropId: e.target.value})}
                    >
                      <option value="">Choose a crop plot...</option>
                      {crops.map(crop => (
                        <option key={crop.id} value={crop.id}>{crop.name} ({crop.variety})</option>
                      ))}
                      {crops.length === 0 && <option disabled>No crops found. Register some in My Farms first.</option>}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                       label="Quantity" 
                       placeholder="e.g. 50 Bags" 
                       required 
                       value={formData.quantity} 
                       onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                     />
                    <Input 
                       label="Price (KSh)" 
                       placeholder="e.g. 4500" 
                       type="number" 
                       required 
                       value={formData.price} 
                       onChange={(e) => setFormData({...formData, price: e.target.value})}
                     />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Additional Notes</label>
                    <textarea 
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary-fresh transition-all resize-none h-24"
                       placeholder="Describe quality, storage, or urgency..."
                       value={formData.notes}
                       onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div className="p-4 bg-bg-soft rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Advantage</p>
                      <p className="text-xs font-bold text-primary-dark">Prices are +2% higher today</p>
                    </div>
                    <TrendingUp className="text-primary-fresh" size={20} />
                  </div>
                  <Button variant="primary" type="submit" className="w-full h-14 rounded-2xl font-bold" isLoading={isListing}>
                    List on {activeMarket} Market
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
