import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { TrendingUp, MapPin, Search, Filter, ArrowUpRight, ArrowDownRight, Info, ShoppingCart, RefreshCcw, X, Plus, Calendar, ChevronRight, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/src/lib/utils';
import { useMarketData, useCrops } from '@/src/hooks/useAppData';

interface MarketInsight {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
  ctaUrlLabel?: string;
  actionSteps: string[];
}

const REGIONAL_MARKET_INSIGHTS: Record<string, MarketInsight[]> = {
  'Nairobi': [
    {
      title: 'Maize Influx Management',
      description: 'Heavy maize deliveries from South Rift have created a short-term wholesale surplus at Wakulima Market. Prices are temporarily depressed.',
      type: 'warning',
      ctaUrlLabel: 'Optimize Storage Hold',
      actionSteps: [
        'Store dry grains in airtight hermetic bags (PICS bags) to maintain zero pest infestation.',
        'Wait 7-10 days before releasing grain to let the temporary market supply flood settle.',
        'Target secondary millers in Thika/Kiambu who offer a price premium for quick direct delivery.'
      ]
    },
    {
      title: 'Potato Price Escalation',
      description: 'Central Province potato supply is low due to localized heavy frost. Wholesale prices in Nairobi hubs are elevated by 15%.',
      type: 'success',
      ctaUrlLabel: 'Target Direct Markets',
      actionSteps: [
        'Harvest potatoes that are mature and store them in dry, dark trays for direct transport.',
        'Bypass brokers in Wakulima and sell directly to hotel chains in Westlands for +15% profit.',
        'Ensure skin curation is optimal to avoid mechanical damage during transit.'
      ]
    },
    {
      title: 'Fungal Post-Harvest Risks',
      description: 'High moisture transport lines entering Nairobi are reporting mildew. Clean sorting is required before offloading.',
      type: 'info',
      ctaUrlLabel: 'Implement Farm-Gate Sorting',
      actionSteps: [
        'Perform thorough manual grading; discard infected produce to safeguard the harvest grade.',
        'Line transportation boxes with dry newspapers to mitigate humidity-driven decay.',
        'Ensure direct aeration is maintained in delivery vehicles during early morning transit.'
      ]
    }
  ],
  'Mombasa': [
    {
      title: 'Coastal Grain Deficit',
      description: 'Import shipping congestion at Kilindini Port is restricting flour milling imports. Domestic dry maize demand is at a seasonal peak.',
      type: 'success',
      ctaUrlLabel: 'Secure Miller Contract',
      actionSteps: [
        'Submit grain samples with less than 13% moisture to millers in Shimanzi directly.',
        'Lock in a delivery contract before imported grain clearance begins next month.',
        'Negotiate direct-bank payment terms for cash flow optimization.'
      ]
    },
    {
      title: 'Aflatoxin Alert Protocol',
      description: 'Coastal air relative humidity is averaging 84%. There is a high risk of grain moisture re-absorption and mold development.',
      type: 'warning',
      ctaUrlLabel: 'Deploy Pallets & Desiccants',
      actionSteps: [
        'Stack sacks strictly on elevated wooden pallets at least 4 inches off the floor.',
        'Maintain a 1-meter clearance space between the stack and the warehouse walls for ventilation.',
        'Avoid wrapping plastic sheets over damp sacks; use porous jute bags for continuous airflow.'
      ]
    },
    {
      title: 'Vegetable Shortage Opportunity',
      description: 'Intense coastal temperatures are causing high water evaporation in local kales/Sukuma Wiki plots, driving retail prices up 25%.',
      type: 'success',
      ctaUrlLabel: 'Access Retail Markets',
      actionSteps: [
        'Adopt overhead shade nets and mulch soil beds with dried grass to retain moisture.',
        'Irrigate vegetables early in the morning before direct sun evaporation peaks.',
        'Sell directly to local restaurants and kiosks at Kongowea for premium rates.'
      ]
    }
  ],
  'Kisumu': [
    {
      title: 'Rice Supply Inflow Flood',
      description: 'Heavy harvesting in the Kano Plains/Ahero schemes has increased rice supply, leading to a temporary 10% price soften at Kibuye.',
      type: 'warning',
      ctaUrlLabel: 'Defer Bulk Ground Sales',
      actionSteps: [
        'Melt or dry paddy rice perfectly to 12.5% or less for longer term silo storage.',
        'Convert to milled white rice which commands a 40% value-added price bonus locally.',
        'Explore alternative bulk markets in Kakamega or Busia where supply is constrained.'
      ]
    },
    {
      title: 'Premium Organic Vegetables Duty',
      description: 'Lakeside hotels and retail complexes are reporting a deficit in natural chemical-free leafy vegetables and fresh tomatoes.',
      type: 'success',
      ctaUrlLabel: 'Launch Green Delivery',
      actionSteps: [
        'Acquire organic certification markers or pitch directly using transparency of farm logs.',
        'Pack leafy vegetables in breathable baskets rather than plastic bags to retain dew freshness.',
        'Coordinate early morning local bicycle delivery lines to reduce fuel transport costs.'
      ]
    },
    {
      title: 'Border Legume Freight Lag',
      description: 'Temporary standard testing delays at the border have restricted bean imports, elevating local bean margins.',
      type: 'info',
      ctaUrlLabel: 'Direct Offloading Action',
      actionSteps: [
        'Release Rosecoco/Yellow bean inventory into Kibuye wholesale market immediately.',
        'Group with local cooperatives to negotiate bulk pricing direct to school feeding programs.',
        'Verify bean cleaning quality to justify premium grades over dusty imports.'
      ]
    }
  ],
  'Nakuru': [
    {
      title: 'Bulk Premium Sourcing Trend',
      description: 'Eminent logistics hubs are buying large batches of local Shangi potatoes for institutional processing units in Nairobi.',
      type: 'success',
      ctaUrlLabel: 'Establish Bulk Link',
      actionSteps: [
        'Sort potatoes into uniform Grade 1 sizes; discard bruised or greened tubers immediately.',
        'Use airy wooden crates instead of standard high-volume synthetic bags to limit transit friction.',
        'Utilize collective marketing with neighbors to gather a full truckload for shipping.'
      ]
    },
    {
      title: 'NCPB Wheat Deposit Notice',
      description: 'The National Cereals and Produce Board depot has officially stabilized the crop buying price for Grade AA wheat grains.',
      type: 'info',
      ctaUrlLabel: 'Access Depot Quotas',
      actionSteps: [
        'Test grain density and moisture using a calibrated regional field reader.',
        'Obtain standard voucher documentation from local agricultural officers for clearance.',
        'Book delivery slots early during low-congestion morning hours.'
      ]
    },
    {
      title: 'Pyrethrum Moisture Alert',
      description: 'Persistent afternoon showers have raised the humidity in Pyrethrum flower drying beds, risking mold decay.',
      type: 'warning',
      ctaUrlLabel: 'Adopt Solar Dryers',
      actionSteps: [
        'Utilize raised drying beds styled with transparent plastic covers or black shade cloth.',
        'Avoid turning flowers with bare hands; use wooden rakes to ensure zero contaminant transfer.',
        'Keep dried flowers in airtight polythene liners until dispatch for processing.'
      ]
    }
  ],
  'Eldoret': [
    {
      title: 'Armyworm Damage Warning',
      description: 'Localized Fall Armyworm infestation has driven up the expected market value for healthy maize grains later this season.',
      type: 'warning',
      ctaUrlLabel: 'Implement IPM Scans',
      actionSteps: [
        'Perform weekly diagonal walking checks across crop fields to count damage symptoms.',
        'Use neem-based biopesticides or apply sand/wood ash directly to young maize leaf whorls.',
        'Protect natural predators like wasps and ladybirds which naturally suppress pest eggs.'
      ]
    },
    {
      title: 'Premium Legume Demand Surge',
      description: 'Low cultivation density has elevated mixed beans and yellow bean pricing up to KSh 8,500 per bag in major Eldoret depots.',
      type: 'success',
      ctaUrlLabel: 'Sell to Local Depots',
      actionSteps: [
        'Package dry beans in hermetic sacks to prevent insect development without chemicals.',
        'Sell directly to school institutions in Uasin Gishu county to bypass middleman commissions.',
        'Coordinate delivery using the Transport link to reduce combined dispatch expenses.'
      ]
    },
    {
      title: 'Subsidized Input Scheme',
      description: 'The second wave of national subsidized agricultural inputs has arrived at local NCPB centers for registered farmers.',
      type: 'info',
      ctaUrlLabel: 'Claim Subsidized CAN',
      actionSteps: [
        'Ensure your national farmer registration profile QR code is active in your settings page.',
        'Bring secondary transport bags or containers for immediate manual packaging.',
        'Apply CAN fertilizer at the optimal split crop-growth stage based on local rains.'
      ]
    }
  ],
  'Kakamega': [
    {
      title: 'Western Organic Value Boost',
      description: 'Farmers utilizing homemade compost are saving up to 15% on synthetic inputs while securing better price premiums from conscious buyers.',
      type: 'success',
      ctaUrlLabel: 'Construct Compost Bays',
      actionSteps: [
        'Set up a pile using 4 parts brown carbon leaves (dry stalks) to 1 part green nitrogen (manure/scraps).',
        'Turn organic residue every two weeks to aerate the bacteria and speed up breaking down cycles.',
        'Apply completed dark, earthy soil compost directly onto root zones before rainy intervals.'
      ]
    },
    {
      title: 'Leaf Plucking Quality Premium',
      description: 'High tea demand from global auction centers has boosted the payments for standard "two leaves and a bud" selective plucks.',
      type: 'info',
      ctaUrlLabel: 'Upgrade Selective Harvesting',
      actionSteps: [
        'Train harvesting workers on strict selective leaf plucking protocols.',
        'Transport fresh green leaves in shaded airy baskets to prevent premature warmth fermentation.',
        'Deliver immediately to local county collection centers to lock in morning grade weight bonuses.'
      ]
    },
    {
      title: 'Milling Logistics Slowdown',
      description: 'Bulk cane transport queues have increased. Intercropping with quick-rotation crops is highly recommended.',
      type: 'warning',
      ctaUrlLabel: 'Leverage Fast Intercrops',
      actionSteps: [
        'Sow leafy green varieties (sukuma wiki, spinach) or bush beans between sugarcane avenues.',
        'Obtain cash flow every 4 weeks to offset long delay wait times from bulk millers.',
        'Incorporate organic material back into soil after legume cycle completion.'
      ]
    }
  ],
  'Busia': [
    {
      title: 'Peanut Crop Shortage',
      description: 'Heavy localized seed shortages have elevated fresh groundnut market retail value up to KSh 12,000 per bag at the border.',
      type: 'success',
      ctaUrlLabel: 'Acquire Seed Grade',
      actionSteps: [
        'Procure high-vigor certified groundnut seeds from local agro-dealers.',
        'Plant in light, sandy-loam soils with spacious spacing to support root pegging.',
        'Harvest when the inner shell turns dark brown or black for ultimate oil weight.'
      ]
    },
    {
      title: 'Cassava Import Softening',
      description: 'Enhanced border inflows of Ugandan raw fresh cassava have temporarily softened raw cassava margins.',
      type: 'warning',
      ctaUrlLabel: 'Convert to Flour',
      actionSteps: [
        'Slice and dry fresh cassava roots immediately on raised tarpaulins under clear sunlight.',
        'Mill the perfectly dried slices into high-value composite baking flour.',
        'Sell the processed flour to urban bakeries or distributors for up to triple the return.'
      ]
    },
    {
      title: 'Cross-Border Safety Inspection',
      description: 'Border inspectors are strict on moisture ratings. Safe grain testing limits are maintained heavily.',
      type: 'info',
      ctaUrlLabel: 'Pre-Test Grain Moisture',
      actionSteps: [
        'Aerate grains thoroughly on dry black canvas under bright sunlight to reach <13.5% metrics.',
        'Request certified field pre-testing from local cooperatives to avoid border rejection.',
        'Keep transportation bags secure from sudden rains with waterproof tarpaulins.'
      ]
    }
  ]
};

export default function MarketPage({ user }: any) {
  const [activeMarket, setActiveMarket] = useState('Nairobi');
  const { marketPrices, loading } = useMarketData(activeMarket);
  const { crops } = useCrops(user?.id);
  
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: rect.height });
    }
    
    return () => resizeObserver.disconnect();
  }, [isMounted]);

  const [showSellModal, setShowSellModal] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [formData, setFormData] = useState({
    cropId: '',
    quantity: '',
    price: '',
    notes: ''
  });

  const markets = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kakamega', 'Busia'];
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null);
  const [acknowledgedInsights, setAcknowledgedInsights] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

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

              <div ref={containerRef} className="h-60 md:h-80 w-full relative min-h-[240px] min-w-0 min-h-0">
                {isMounted && dimensions.width > 0 && dimensions.height > 0 && (
                  <ResponsiveContainer width={dimensions.width} height={dimensions.height} debounce={50}>
                    <AreaChart data={chartData} margin={{ left: -20 }}>
                      <defs>
                        <linearGradient id="colorPriceMarket" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94A3B8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94A3B8' }} domain={['dataMin - 100', 'dataMax + 100']} hide={windowWidth < 640} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#1B5E20" strokeWidth={3} fillOpacity={1} fill="url(#colorPriceMarket)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
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

           <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-gray-100 pb-3">
               <div className="flex items-center gap-2">
                 <Sparkles className="text-amber-500 animate-pulse" size={18} />
                 <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-950">AI Regional Market Insights</h3>
               </div>
               <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-100 py-1 px-2.5 rounded-full">
                 <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                 <span className="text-[9px] font-extrabold uppercase tracking-wider">Gemini Live Analytics</span>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {(REGIONAL_MARKET_INSIGHTS[activeMarket] || []).map((insight) => {
                 const isAck = acknowledgedInsights.includes(insight.title);
                 
                 // Style configurations
                 const borderStyle = insight.type === 'success' 
                   ? 'border-l-4 border-l-emerald-500 border-gray-150 bg-emerald-50/10 hover:bg-emerald-50/20' 
                   : insight.type === 'warning' 
                   ? 'border-l-4 border-l-amber-500 border-gray-150 bg-amber-50/10 hover:bg-amber-50/20' 
                   : 'border-l-4 border-l-blue-500 border-gray-150 bg-blue-50/10 hover:bg-blue-50/20';

                 const badgeVariant = insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'info';
                 
                 const icon = insight.type === 'success' 
                   ? <Sparkles className="text-emerald-500 animate-pulse" size={16} /> 
                   : insight.type === 'warning' 
                   ? <AlertTriangle className="text-amber-500" size={16} /> 
                   : <Info className="text-blue-500" size={16} />;

                 return (
                   <motion.div
                     key={insight.title}
                     whileHover={{ y: -2 }}
                     whileTap={{ scale: 0.99 }}
                     onClick={() => setSelectedInsight(insight)}
                   >
                     <Card className={cn("p-4 md:p-5 cursor-pointer relative transition-all duration-200 hover:shadow-md", borderStyle)}>
                       <div className="flex items-start justify-between gap-4">
                         <div className="space-y-2">
                           <div className="flex items-center gap-2 flex-wrap">
                             {icon}
                             <h4 className="font-extrabold text-gray-900 text-sm md:text-base tracking-tight">{insight.title}</h4>
                             <Badge variant={badgeVariant} className="text-[8px] px-1.5 font-bold leading-normal">
                               {insight.type}
                             </Badge>
                             {isAck && (
                               <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[8px] font-black uppercase py-0.5 px-1.5 rounded-md border border-green-200">
                                 <CheckCircle size={10} /> Applied
                                </span>
                             )}
                           </div>
                           <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                             {insight.description}
                           </p>
                         </div>
                       </div>

                       <div className="mt-4 pt-3 border-t border-gray-100/60 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                           Action Plan Checklist Available
                         </span>
                         <span className="text-xs font-bold text-primary-fresh flex items-center gap-1">
                           {insight.ctaUrlLabel || 'Explore Actions'} <ChevronRight size={14} />
                         </span>
                       </div>
                     </Card>
                   </motion.div>
                 );
               })}
             </div>
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
                      {crops.map((crop: any) => (
                        <option key={crop.id} value={crop.id}>{crop.name} ({crop.variety})</option>
                      ))}
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
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button variant="primary" type="submit" className="w-full h-14 rounded-2xl font-bold" isLoading={isListing}>
                    List on {activeMarket} Market
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" 
              onClick={() => setSelectedInsight(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className={cn(
                "p-6 md:p-8 text-white flex justify-between items-start shrink-0",
                selectedInsight.type === 'success' ? 'bg-emerald-600' : selectedInsight.type === 'warning' ? 'bg-amber-600' : 'bg-blue-600'
              )}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/95">AGROLINK AI ADVISORY • {activeMarket}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight leading-snug">{selectedInsight.title}</h3>
                  <Badge 
                    variant={selectedInsight.type === 'success' ? 'success' : selectedInsight.type === 'warning' ? 'warning' : 'info'} 
                    className="bg-white/20 text-white border border-white/10"
                  >
                    {selectedInsight.type} Insight
                  </Badge>
                </div>
                <button onClick={() => setSelectedInsight(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Analysis Overview</span>
                  <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150">
                    {selectedInsight.description}
                  </p>
                </div>

                {/* Interactive Action Steps Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Action Steps Checklist</span>
                    <span className="text-[10px] text-gray-400 font-bold">Tap steps to complete</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedInsight.actionSteps.map((step, idx) => {
                      const isChecked = !!checkedSteps[step];
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            setCheckedSteps(prev => ({ ...prev, [step]: !prev[step] }));
                          }}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                            isChecked 
                              ? "bg-green-50/50 border-green-200 text-green-905" 
                              : "bg-white border-gray-150 hover:bg-gray-50/50 text-gray-750"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all text-white",
                            isChecked ? "bg-green-600 border-green-600" : "border-gray-350"
                          )}>
                            {isChecked && <CheckCircle size={14} className="stroke-[3]" />}
                          </div>
                          <span className={cn(
                            "text-xs font-semibold leading-relaxed transition-all",
                            isChecked && "line-through text-green-700/70"
                          )}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer actions */}
                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    variant={selectedInsight.type === 'success' ? 'primary' : 'secondary'}
                    onClick={() => {
                      if (!acknowledgedInsights.includes(selectedInsight.title)) {
                        setAcknowledgedInsights(prev => [...prev, selectedInsight.title]);
                      }
                      setSelectedInsight(null);
                    }}
                    className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle size={16} />
                    <span>Apply to My Active Plan</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedInsight(null)}
                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-650"
                  >
                    Cancel Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
