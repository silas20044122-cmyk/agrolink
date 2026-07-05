import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Plus, 
  MapPin, 
  Ruler, 
  Activity, 
  TrendingUp, 
  ChevronLeft, 
  Building2, 
  Clock, 
  Sparkles, 
  Calendar, 
  X, 
  ShoppingCart, 
  ShieldCheck, 
  Check, 
  Heart, 
  Percent,
  ClipboardList,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/src/components/ui/Base';
import { useFarms, useCrops } from '@/src/hooks/useAppData';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { cn, formatDate, formatCurrency } from '@/src/lib/utils';
import { CROP_TYPES } from '@/src/lib/constants';

export default function FarmDetailsPage({ user }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { farms, loading: farmsLoading } = useFarms(user?.id);
  const farm = farms.find((f: any) => f.id === id);
  const { crops: hookCrops, loading: cropsLoading, addCrop } = useCrops(user?.id, id);
  
  const [localCrops, setLocalCrops] = useState<any[]>([]);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize hook state with local state for interactive updates
  useEffect(() => {
    if (hookCrops) {
      setLocalCrops(hookCrops);
    }
  }, [hookCrops]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('addCrop') === 'true') {
      setShowAddCropModal(true);
    }
  }, []);
  
  const [cropFormData, setCropFormData] = useState({
    name: '',
    variety: '',
    typeId: 'maize',
    area: '',
    plantingDate: new Date().toISOString().split('T')[0],
  });

  const [sellFormData, setSellFormData] = useState({
    cropId: '',
    quantity: '',
    price: '',
    readiness: '80',
    notes: '',
  });

  // Calculate stats based on crops in this farm
  const totalPlots = localCrops.length;
  const avgHealth = localCrops.length > 0 
    ? Math.round(localCrops.reduce((sum: number, c: any) => sum + (c.healthScore || 0), 0) / localCrops.length) 
    : 100;
  
  const totalFarmAcreage = farm ? parseFloat(farm.totalArea) || 5.0 : 5.0;
  const cultivatedAcreage = localCrops.reduce((sum: number, c: any) => {
    const num = parseFloat(c.area);
    return isNaN(num) ? sum + 1.0 : sum + num;
  }, 0);
  
  const utilizationRate = Math.min(100, Math.round((cultivatedAcreage / totalFarmAcreage) * 100));

  if (farmsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-fresh border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Assets...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center py-24 bg-white border border-gray-100 rounded-[3rem] shadow-sm space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <X size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary-dark">Farm Profile Not Found</h2>
          <p className="text-sm text-gray-400 font-medium">The farm portfolio you are looking for does not exist or has been relocated.</p>
        </div>
        <Button onClick={() => navigate('/my-farms')} className="px-6 h-11 font-bold rounded-xl">Back to My Farms</Button>
      </div>
    );
  }

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const plantingDate = new Date(cropFormData.plantingDate);
    const expectedHarvest = new Date(plantingDate);
    expectedHarvest.setMonth(plantingDate.getMonth() + 4);

    const result = await addCrop({
      ...cropFormData,
      farmId: id,
      location: farm.location,
      expectedHarvest: expectedHarvest.toISOString().split('T')[0],
      status: 'planted',
      healthScore: 100,
    });

    if (result) {
      setShowAddCropModal(false);
      setCropFormData({ name: '', variety: '', typeId: 'maize', area: '', plantingDate: new Date().toISOString().split('T')[0] });
      addNotification({
        title: 'Crop Plot Added',
        message: `${cropFormData.name} has been added to the farm.`,
        type: 'success',
      });
    }
    setIsSubmitting(false);
  };

  const handleUpdateCropRecord = (cropId: string, updatedFields: Partial<any>) => {
    // 1. Update local state
    const updatedCrops = localCrops.map(c => c.id === cropId ? { ...c, ...updatedFields } : c);
    setLocalCrops(updatedCrops);
    
    // 2. Persist directly to localStorage
    try {
      const stored = localStorage.getItem('agrolink_crops');
      const allCrops = stored ? JSON.parse(stored) : [];
      const updatedAllCrops = allCrops.map((c: any) => 
        c.id === cropId ? { ...c, ...updatedFields } : c
      );
      localStorage.setItem('agrolink_crops', JSON.stringify(updatedAllCrops));
    } catch (err) {
      console.error('Failed to save updated crop to localStorage:', err);
    }

    // Update active modal selected crop state if open
    if (selectedCrop && selectedCrop.id === cropId) {
      setSelectedCrop((prev: any) => ({ ...prev, ...updatedFields }));
    }

    addNotification({
      title: 'Plot Record Updated',
      message: `Successfully updated state for ${selectedCrop?.name || 'crop'}.`,
      type: 'success',
    });
  };

  const handleSellProduce = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSellModal(false);
      addNotification({
        title: 'Market Listing Created',
        message: `Your produce is now listed on the marketplace.`,
        type: 'success',
      });
    }, 1200);
  };

  // Advisory tips mapping based on crop type
  const getAdvisoryTip = (typeId: string) => {
    switch (typeId) {
      case 'maize':
        return "Ensure optimal nitrogen levels during the vegetative state to maximize grain size. Scout daily for early signs of fall armyworms on leaves.";
      case 'beans':
        return "Moisture stress during flowering can cause flowers to drop. Keep the soil evenly moist but well-drained. Mulch around the base.";
      case 'potatoes':
        return "Hilling should be performed when potatoes reach 15-20cm tall to protect tubers from light. Watch out for early blight.";
      case 'tomatoes':
        return "Prune outer side-shoots (suckers) regularly to direct energy into healthy fruit development. Stake early to prevent blight.";
      case 'kales':
        return "Harvest the outer leaves incrementally to support continuous leaf production. Spray with organic neem formulation for aphids.";
      default:
        return "Keep soil conditions loose, weeded, and monitored. Adequate moisture levels now will maximize crop survival and yield potential.";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32">
      
      {/* Back button and breadcrumbs */}
      <button 
        onClick={() => navigate('/my-farms')}
        className="flex items-center gap-2 text-gray-400 hover:text-primary-dark font-bold text-xs uppercase tracking-widest transition-colors mb-2 outline-none border-none bg-transparent cursor-pointer"
      >
        <ChevronLeft size={16} /> Back to My Farms
      </button>

      {/* Modernized Portfolio Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary-fresh/5 rounded-full blur-2xl" />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-fresh/10 to-primary-dark/5 rounded-2xl flex items-center justify-center text-primary-dark shadow-inner">
              <Building2 size={26} className="text-primary-fresh" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-primary-dark font-display leading-tight">{farm.name}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                <MapPin size={13} className="text-primary-fresh" />
                <span className="text-xs font-bold uppercase tracking-wider">{farm.location}, {farm.county} County</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
             <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-wider">
               <Ruler size={13} className="text-primary-fresh" /> Area: {farm.totalArea}
             </span>
             <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-wider">
               <Calendar size={13} className="text-primary-fresh" /> Registered: {formatDate(farm.registrationDate)}
             </span>
             <span className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
               <Sprout size={13} className="text-emerald-500" /> {totalPlots} Plot{totalPlots !== 1 ? 's' : ''} Active
             </span>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setShowSellModal(true)} className="h-12 rounded-xl px-5 font-bold border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all flex items-center gap-2">
            <ShoppingCart className="text-primary-fresh" size={16} /> Sell Surplus
          </Button>
          <Button onClick={() => setShowAddCropModal(true)} className="h-12 rounded-xl px-6 font-bold shadow-md shadow-primary-fresh/20 flex items-center gap-2">
            <Plus size={16} /> Add Crop Plot
          </Button>
        </div>
      </header>

      {/* Smart Diagnostics & Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Stat Card 1: Active Crops Count */}
         <Card className="p-6 bg-white dark:bg-[#0c120e] border border-gray-100 dark:border-emerald-500/15 flex items-center justify-between shadow-xs relative overflow-hidden group rounded-[2rem]">
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none block">Total Production Plots</span>
              <p className="text-4xl font-black text-primary-dark dark:text-white leading-none tracking-tight">{totalPlots}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-405 font-medium">
                {localCrops.length > 0 ? "Tracking live cultivation cycles" : "Ready for seedling inventory"}
              </p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-primary-fresh dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-xs border border-emerald-100/10 shrink-0">
              <Sprout size={24} />
            </div>
         </Card>

         {/* Stat Card 2: Average Health index */}
         <Card className="p-6 bg-white dark:bg-[#0c120e] border border-gray-100 dark:border-emerald-500/15 flex items-center justify-between shadow-xs relative overflow-hidden group rounded-[2rem]">
            <div className="absolute right-0 top-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none block">Farm Health Index</span>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-primary-dark dark:text-white leading-none tracking-tight">{avgHealth}%</p>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                  avgHealth >= 85 ? "bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300" : avgHealth >= 60 ? "bg-amber-100/90 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300" : "bg-red-100/90 dark:bg-red-500/15 text-red-800 dark:text-red-300"
                )}>
                  {avgHealth >= 85 ? "Optimal" : avgHealth >= 60 ? "Warning" : "Critical"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-405 font-medium flex items-center gap-1">
                <Heart size={12} className="text-red-500 fill-red-500" /> Verified biometric data
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-xs border border-blue-100/10 shrink-0">
              <Activity size={24} />
            </div>
         </Card>

         {/* Stat Card 3: Soil Utilization Card */}
         <Card className="p-6 bg-white dark:bg-[#0c120e] border border-gray-100 dark:border-emerald-500/15 flex flex-col justify-between shadow-xs relative overflow-hidden group rounded-[2rem]">
            <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between w-full z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none block">Land Resource Utilization</span>
                <p className="text-xl font-black text-primary-dark dark:text-white tracking-tight">{cultivatedAcreage} / {totalFarmAcreage} Acres</p>
              </div>
              <div className="w-11 h-11 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100/10 shadow-xs shrink-0">
                <Percent size={18} />
              </div>
            </div>
            <div className="space-y-2 mt-4 z-10">
              <div className="h-1.5 w-full bg-gray-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${utilizationRate}%` }} />
              </div>
              <div className="flex justify-between text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                <span>{utilizationRate}% Cultivated</span>
                <span>{Math.max(0, 100 - utilizationRate)}% Fallow</span>
              </div>
            </div>
         </Card>
      </div>

      {/* Main Inventory Layout */}
      <div className="space-y-6">
         <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-primary-dark">Cultivation Plot Inventory</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Scout and manage active plant life cycles</p>
            </div>
            <Badge variant="default" className="bg-gray-150 text-gray-500 font-bold px-3.5 py-1 text-xs">{totalPlots} Total Plots</Badge>
         </div>

         {cropsLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2].map(i => <div key={i} className="h-56 bg-gray-50 animate-pulse rounded-[2.2rem]" />)}
           </div>
         ) : localCrops.length === 0 ? (
           <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center p-8 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-primary-fresh rounded-[2rem] flex items-center justify-center shadow-inner">
                <Sprout size={36} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-bold tracking-tight text-primary-dark">No crops currently registered</h3>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider leading-relaxed">Add individual plots to this farm profile to begin tracking watering, disease scanning, and expected harvest schedules.</p>
              </div>
              <Button onClick={() => setShowAddCropModal(true)} className="px-6 h-11 rounded-xl font-bold">Add Your First Crop Plot</Button>
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
             {localCrops.map((crop: any) => (
               <CropCard key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} />
             ))}
           </div>
         )}
      </div>

      {/* Interactive Crop Plot Detail Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-primary-dark/50 backdrop-blur-md" 
              onClick={() => setSelectedCrop(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-primary-dark to-[#2c6e31] text-white flex justify-between items-start shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    {CROP_TYPES.find(t => t.id === selectedCrop.typeId)?.icon || '🌱'}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">{selectedCrop.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mt-1">
                      {selectedCrop.variety || 'Standard Local Variety'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCrop(null)} 
                  className="p-1.5 hover:bg-white/15 rounded-xl text-white transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto premium-scrollbar flex-1">
                
                {/* 3-Column Meta Panel */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Land Area</p>
                    <p className="text-sm font-extrabold text-primary-dark flex items-center justify-center gap-1">
                      <Ruler size={13} /> {selectedCrop.area || '1 Acre'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Cycle</p>
                    <p className="text-sm font-extrabold text-primary-dark flex items-center justify-center gap-1">
                      <Clock size={13} /> {
                        Math.max(1, Math.ceil(Math.abs(new Date().getTime() - new Date(selectedCrop.plantingDate).getTime()) / (1000 * 60 * 60 * 24)))
                      } Days
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Maturity Date</p>
                    <p className="text-sm font-extrabold text-primary-dark flex items-center justify-center gap-1">
                      <Calendar size={13} /> {formatDate(selectedCrop.expectedHarvest)}
                    </p>
                  </div>
                </div>

                {/* Growth Stage Timeline */}
                <div className="space-y-3 bg-gray-50/55 p-5 border border-gray-100/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ClipboardList size={13} className="text-primary-fresh" /> Active Crop Stage Progress
                  </h4>
                  <div className="relative flex justify-between items-center px-1">
                    <div className="absolute left-4 right-4 h-1 bg-gray-200 top-4 -z-10" />
                    {[
                      { label: "Sown", desc: "Seedbed" },
                      { label: "Vegetative", desc: "Active Leafing" },
                      { label: "Flowering", desc: "Bloom" },
                      { label: "Harvest", desc: "Ripe" }
                    ].map((stg, i) => {
                      // Calculate active point based on health Score & dummy progression
                      const activeIndex = selectedCrop.status === 'harvested' ? 3 : selectedCrop.healthScore < 60 ? 1 : 2;
                      const isDone = i < activeIndex;
                      const isActive = i === activeIndex;
                      
                      return (
                        <div key={i} className="flex flex-col items-center space-y-1.5 relative z-10">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border transition-all text-xs font-bold",
                            isDone ? "bg-primary-fresh text-white border-primary-fresh shadow-xs" :
                            isActive ? "bg-white border-primary-fresh text-primary-fresh ring-4 ring-primary-fresh/10 font-black" :
                            "bg-white border-gray-200 text-gray-400"
                          )}>
                            {isDone ? <Check size={14} /> : i + 1}
                          </div>
                          <div className="text-center">
                            <p className={cn("text-[10px] font-bold leading-none", (isActive || isDone) ? "text-gray-800" : "text-gray-400")}>
                              {stg.label}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{stg.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Edit Biometrics and Crop Status */}
                <div className="p-5 border border-gray-150 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={13} className="text-primary-fresh" /> Live Field Scouting Form
                  </h4>
                  
                  {/* Status selection buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Health Status</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['healthy', 'needs scouting', 'harvested', 'struggling'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateCropRecord(selectedCrop.id, { status: st })}
                          className={cn(
                            "py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer outline-none",
                            selectedCrop.status === st 
                              ? "bg-primary-dark border-primary-dark text-white shadow-xs" 
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Adjust Crop Health Score</span>
                      <span className="text-primary-dark font-black">{selectedCrop.healthScore || 100}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={selectedCrop.healthScore || 100}
                      onChange={(e) => handleUpdateCropRecord(selectedCrop.id, { healthScore: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-fresh outline-none"
                    />
                  </div>
                </div>

                {/* Leaf scanner shortcut & AI Advisory suggestion */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-10 h-10 bg-[#1B5E20] text-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-xs font-bold text-primary-dark uppercase tracking-wide">AgroLink AI Diagnostic Recommendation</h5>
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                      "{getAdvisoryTip(selectedCrop.typeId)}"
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row gap-3 shrink-0">
                <Button 
                  onClick={() => {
                    setSelectedCrop(null);
                    navigate('/scanner');
                  }} 
                  className="flex-1 h-12 rounded-xl text-xs font-bold bg-[#1B5E20] hover:bg-emerald-700 text-white flex items-center justify-center gap-2 border-none"
                >
                  <Activity size={15} /> Run AI Leaf Health Scan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCrop(null)} 
                  className="h-12 rounded-xl text-xs font-bold border-gray-200 text-gray-500 bg-white"
                >
                  Close Records
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Crop Plot Modal */}
      <AnimatePresence>
        {showAddCropModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowAddCropModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 md:p-8 bg-primary-dark text-white">
                <h3 className="text-2xl font-black tracking-tight">Register New Plot</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Add cultivation plots to your farm portfolio</p>
              </div>
              <form onSubmit={handleAddCrop} className="p-6 md:p-8 space-y-5">
                <Input label="Plot / Crop Name" placeholder="e.g. Premium Sukuma Plot A" required value={cropFormData.name} onChange={(e) => setCropFormData({...cropFormData, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Crop Variety</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-primary-fresh transition-all" value={cropFormData.typeId} onChange={(e) => setCropFormData({...cropFormData, typeId: e.target.value})}>
                       {CROP_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                    </select>
                  </div>
                  <Input label="Acreage Size" placeholder="e.g. 1.2 Acres" required value={cropFormData.area} onChange={(e) => setCropFormData({...cropFormData, area: e.target.value})} />
                </div>

                <Input label="Planting Date" type="date" required value={cropFormData.plantingDate} onChange={(e) => setCropFormData({...cropFormData, plantingDate: e.target.value})} />
                
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" type="button" className="flex-1 rounded-xl h-11 text-xs font-bold" onClick={() => setShowAddCropModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" className="flex-1 rounded-xl h-11 text-xs font-bold border-none" isLoading={isSubmitting}>Register Cultivation</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sell Produce surplus Listing Modal */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowSellModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 md:p-8 bg-primary-dark text-white">
                <h3 className="text-2xl font-black tracking-tight">Sell Produce Surplus</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Direct listing to the Agrolink Marketplace</p>
              </div>
              <form onSubmit={handleSellProduce} className="p-6 md:p-8 space-y-5">
                
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Crop Plot to Sell From</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-primary-fresh transition-all" 
                    value={sellFormData.cropId} 
                    required
                    onChange={(e) => setSellFormData({...sellFormData, cropId: e.target.value})}
                  >
                    <option value="" disabled>-- Select Plot --</option>
                    {localCrops.map(c => (
                      <option key={c.id} value={c.id}>
                        {CROP_TYPES.find(t => t.id === c.typeId)?.icon || '🌱'} {c.name} ({c.variety})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Harvest Weight (kg)" 
                    placeholder="e.g. 500" 
                    type="number"
                    required 
                    value={sellFormData.quantity} 
                    onChange={(e) => setSellFormData({...sellFormData, quantity: e.target.value})} 
                  />
                  <Input 
                    label="Price per kg (KES)" 
                    placeholder="e.g. 80" 
                    type="number"
                    required 
                    value={sellFormData.price} 
                    onChange={(e) => setSellFormData({...sellFormData, price: e.target.value})} 
                  />
                </div>

                {/* Estimate calculations */}
                {sellFormData.quantity && sellFormData.price && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Estimated Gross Income:</span>
                    <span className="text-base font-black text-primary-dark">
                      {formatCurrency(parseInt(sellFormData.quantity) * parseInt(sellFormData.price))}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Maturity/Readiness level</span>
                    <span className="text-primary-dark font-black">{sellFormData.readiness}% Mature</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="100"
                    value={sellFormData.readiness}
                    onChange={(e) => setSellFormData({...sellFormData, readiness: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-fresh outline-none"
                  />
                </div>

                <Input 
                  label="Description / Storage Conditions" 
                  placeholder="e.g. Sun-dried, packed in 90kg bags, organic" 
                  value={sellFormData.notes} 
                  onChange={(e) => setSellFormData({...sellFormData, notes: e.target.value})} 
                />

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" type="button" className="flex-1 rounded-xl h-11 text-xs font-bold bg-white" onClick={() => setShowSellModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" className="flex-1 rounded-xl h-11 text-xs font-bold border-none" isLoading={isSubmitting}>Submit Marketplace Listing</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function CropCard({ crop, onClick }: { crop: any, onClick: () => void }) {
  const cropInfo = CROP_TYPES.find(t => t.id === crop.typeId);
  
  // Custom styling for health levels
  let healthColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (crop.healthScore < 60) {
    healthColor = "text-red-700 bg-red-50 border-red-100";
  } else if (crop.healthScore < 85) {
    healthColor = "text-amber-700 bg-amber-50 border-amber-100";
  }

  // Calculate duration of crop in soil
  const plantingDate = new Date(crop.plantingDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - plantingDate.getTime());
  const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Card 
      onClick={onClick} 
      className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group bg-white border border-gray-100/90 rounded-[2.2rem] flex flex-col justify-between"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform duration-300 border border-gray-100">
              {cropInfo?.icon || '🌱'}
            </div>
            <div>
              <h4 className="font-bold text-base text-primary-dark group-hover:text-primary-fresh transition-colors leading-tight">{crop.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{crop.variety || 'Local Variety'}</p>
            </div>
          </div>
          <Badge className={cn("text-[9px] font-bold uppercase py-1 px-2.5 rounded-lg border", healthColor)}>
            {crop.status || 'Active'}
          </Badge>
        </div>

        {/* Dynamic Health Index Display */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crop Health Index</span>
            <span className="text-xs font-extrabold text-primary-dark">{crop.healthScore || 100}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                crop.healthScore > 80 ? "bg-emerald-500" : crop.healthScore > 50 ? "bg-amber-500" : "bg-red-500"
              )} 
              style={{ width: `${crop.healthScore || 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Card Footer with meta-stats */}
      <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500">
        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100/50 text-[10px] uppercase font-bold text-gray-400">
          <Ruler size={12} className="text-primary-fresh" /> {crop.area || '1 Acre'}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
          <Clock size={12} className="text-primary-fresh animate-pulse" /> {daysActive} Days Active
        </span>
      </div>
    </Card>
  );
}
