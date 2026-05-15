import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Plus, Search, Filter, MapPin, Ruler, Activity, TrendingUp, ChevronLeft, ArrowRight, Trash2, Home, Landmark, Building2, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/src/components/ui/Base';
import { useFarms, useCrops } from '@/src/hooks/useAppData';
import { cn, formatDate } from '@/src/lib/utils';
import { CROP_TYPES, KENYA_COUNTIES } from '@/src/lib/constants';

export default function MyFarms({ user }: any) {
  const { farms, loading: farmsLoading, addFarm } = useFarms(user?.id);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const { crops, loading: cropsLoading, addCrop } = useCrops(user?.id, selectedFarm?.id);
  
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellFormData, setSellFormData] = useState({
    cropId: '',
    quantity: '',
    price: '',
    readiness: '80',
    notes: '',
  });

  const handleSellProduce = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSellModal(false);
      setSelectedCrop(null);
      setSellFormData({ cropId: '', quantity: '', price: '', readiness: '80', notes: '' });
      // In a real app, we'd add this to a listings collection
    }, 1500);
  };

  // Farm Form State
  const [farmFormData, setFarmFormData] = useState({
    name: '',
    location: '',
    county: user?.region || 'Nairobi',
    totalArea: '',
  });

  // Crop Form State
  const [cropFormData, setCropFormData] = useState({
    name: '',
    variety: '',
    typeId: 'maize',
    area: '',
    plantingDate: new Date().toISOString().split('T')[0],
  });

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addFarm({
      ...farmFormData,
      registrationDate: new Date().toISOString().split('T')[0],
    });
    if (result) {
      setShowAddFarmModal(false);
      setFarmFormData({ name: '', location: '', county: user?.region || 'Nairobi', totalArea: '' });
    }
    setIsSubmitting(false);
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) return;
    setIsSubmitting(true);
    
    const plantingDate = new Date(cropFormData.plantingDate);
    const expectedHarvest = new Date(plantingDate);
    expectedHarvest.setMonth(plantingDate.getMonth() + 4);

    const result = await addCrop({
      ...cropFormData,
      farmId: selectedFarm.id,
      location: selectedFarm.location,
      expectedHarvest: expectedHarvest.toISOString().split('T')[0],
      status: 'planted',
      healthScore: 100,
    });

    if (result) {
      setShowAddCropModal(false);
      setCropFormData({
        name: '',
        variety: '',
        typeId: 'maize',
        area: '',
        plantingDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsSubmitting(false);
  };

  if (selectedFarm) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32">
        <button 
          onClick={() => setSelectedFarm(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-primary-fresh transition-colors font-bold uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft size={16} /> Back to All Farms
        </button>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="info" className="mb-2">Farm Profile</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{selectedFarm.name}</h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-fresh" /> {selectedFarm.location}, {selectedFarm.county}</span>
               <span className="flex items-center gap-1.5"><Ruler size={14} className="text-primary-fresh" /> {selectedFarm.totalArea} Total</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setShowSellModal(true)} className="h-14 rounded-2xl px-6 font-bold border-gray-200">
              <TrendingUp className="mr-2 text-primary-fresh" /> Sell Produce
            </Button>
            <Button onClick={() => setShowAddCropModal(true)} size="lg" className="h-14 rounded-2xl px-8 font-bold shadow-lg shadow-primary-fresh/20">
              <Plus className="mr-2" /> Add Crop Plot
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card className="p-6 bg-white border-none shadow-sm flex flex-col items-center text-center space-y-2">
              <Sprout className="text-primary-fresh" size={24} />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Plots</p>
              <p className="text-2xl font-bold text-primary-dark">{crops.length}</p>
           </Card>
           <Card className="p-6 bg-white border-none shadow-sm flex flex-col items-center text-center space-y-2">
              <Activity className="text-accent-amber" size={24} />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Health</p>
              <p className="text-2xl font-bold text-primary-dark">
                {crops.length > 0 ? Math.round(crops.reduce((acc, c) => acc + c.healthScore, 0) / crops.length) : 0}%
              </p>
           </Card>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Crop Inventory</h3>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {crops.length} Plots</div>
           </div>

           {cropsLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[2rem]" />)}
             </div>
           ) : crops.length === 0 ? (
             <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-50 flex flex-col items-center p-8 space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <Sprout size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No crops registered yet</h3>
                  <p className="text-sm text-gray-400 font-medium max-w-xs">Start adding crop plots to this farm to monitor health and harvest.</p>
                </div>
                <Button variant="primary" className="h-12 px-8 rounded-xl" onClick={() => setShowAddCropModal(true)}>Register My First Crop</Button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {crops.map(crop => (
                 <CropCard key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} />
               ))}
             </div>
           )}
        </div>

        {/* Add Crop Modal */}
        <AnimatePresence>
          {showAddCropModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowAddCropModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-8 bg-primary-dark text-white">
                  <h3 className="text-2xl font-bold tracking-tight">Register New Plot</h3>
                  <p className="text-white/60 text-sm font-medium mt-1">Adding crop to: {selectedFarm.name}</p>
                </div>
                <form onSubmit={handleAddCrop} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Plot Name" placeholder="e.g. Tomato Section A" required value={cropFormData.name} onChange={(e) => setCropFormData({...cropFormData, name: e.target.value})} />
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Crop Type</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium" value={cropFormData.typeId} onChange={(e) => setCropFormData({...cropFormData, typeId: e.target.value})}>
                        {CROP_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Variety" placeholder="e.g. Rio Grande" required value={cropFormData.variety} onChange={(e) => setCropFormData({...cropFormData, variety: e.target.value})} />
                    <Input label="Area" placeholder="e.g. 0.5 Acres" required value={cropFormData.area} onChange={(e) => setCropFormData({...cropFormData, area: e.target.value})} />
                  </div>
                  <Input label="Planting Date" type="date" required value={cropFormData.plantingDate} onChange={(e) => setCropFormData({...cropFormData, plantingDate: e.target.value})} />
                  <div className="pt-4 flex gap-3">
                    <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowAddCropModal(false)}>Cancel</Button>
                    <Button variant="primary" type="submit" className="flex-1 rounded-xl h-12" isLoading={isSubmitting}>Add Crop Plot</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Selected Crop Detail Modal */}
        <AnimatePresence>
          {selectedCrop && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
                <div className="p-8 md:p-12 space-y-10 overflow-y-auto no-scrollbar">
                   <div className="flex justify-between items-start">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-bg-soft rounded-xl flex items-center justify-center text-2xl shadow-inner">
                            {CROP_TYPES.find(t => t.id === selectedCrop.typeId)?.icon || '🌱'}
                          </div>
                          <h2 className="text-3xl font-bold tracking-tight">{selectedCrop.name}</h2>
                          <Badge variant={selectedCrop.healthScore > 80 ? "success" : "warning"}>
                            {selectedCrop.healthScore > 80 ? 'Healthy' : 'At Risk'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                          <div className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-fresh" /> {selectedCrop.location}</div>
                          <div className="flex items-center gap-1.5"><Ruler size={14} className="text-primary-fresh" /> {selectedCrop.area}</div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full"><Activity size={14} className="text-primary-fresh" /> {selectedCrop.healthScore}% Score</div>
                        </div>
                     </div>
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner shrink-0 leading-none">
                        {CROP_TYPES.find(t => t.id === selectedCrop.typeId)?.icon || '🌱'}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <Card className="p-6 bg-green-50/30 border-none">
                         <Activity className="text-green-600 mb-4" />
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth Stage</p>
                         <p className="text-xl font-bold text-gray-900">Vegetative (Stage 3)</p>
                      </Card>
                      <Card className="p-6 bg-blue-50/30 border-none">
                         <TrendingUp className="text-blue-600 mb-4" />
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Yield Forecast</p>
                         <p className="text-xl font-bold text-gray-900">High (Est. 45 Bags)</p>
                      </Card>
                      <Card className="p-6 bg-amber-50/30 border-none">
                         <Activity className="text-accent-amber mb-4" />
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Soil Moisture</p>
                         <p className="text-xl font-bold text-gray-900">Optimal (65%)</p>
                      </Card>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Activity size={18} className="text-primary-fresh" />
                          Recent Alerts & Insights
                        </h4>
                        <div className="space-y-3">
                           <div className="p-4 bg-red-50 rounded-2xl flex gap-3 border border-red-100">
                              <div className="text-red-500 shrink-0 mt-0.5">⚠️</div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-red-900">Late Blight Warning</p>
                                <p className="text-[10px] text-red-700 leading-relaxed">Favorable conditions for blight detected in your region. Monitor leaves closely.</p>
                              </div>
                           </div>
                           <div className="p-4 bg-primary-fresh/5 rounded-2xl flex gap-3 border border-primary-fresh/10">
                              <div className="text-primary-fresh shrink-0 mt-0.5">💡</div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-primary-dark">Spray Optimization</p>
                                <p className="text-[10px] text-gray-500 leading-relaxed">Best time to apply top-dress fertilizer is tomorrow between 6AM - 9AM.</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <Clock size={18} className="text-primary-fresh" />
                          Growth Progress
                        </h4>
                        <div className="space-y-6 pt-2">
                           <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="absolute top-0 left-0 h-full bg-primary-fresh rounded-full" style={{ width: '65%' }} />
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <div className="space-y-1">
                               <span>Planted</span>
                               <p className="text-gray-900">{formatDate(selectedCrop.plantingDate)}</p>
                             </div>
                             <div className="text-center space-y-1">
                               <span>Days to Harvest</span>
                               <p className="text-primary-fresh text-sm">~45 Days</p>
                             </div>
                             <div className="text-right space-y-1">
                               <span>Est. Harvest</span>
                               <p className="text-gray-900">{formatDate(selectedCrop.expectedHarvest)}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="pt-4 flex flex-col md:flex-row gap-4">
                     <Button variant="primary" className="flex-1 h-14 rounded-2xl shadow-lg shadow-primary-fresh/20" onClick={() => setShowSellModal(true)}>
                       List Produce for Sale
                     </Button>
                     <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setSelectedCrop(null)}>
                       Close Detailed View
                     </Button>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Sell Produce Modal */}
        <AnimatePresence>
          {showSellModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowSellModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-8 bg-primary-fresh text-white">
                  <h3 className="text-2xl font-bold tracking-tight">Market Listing</h3>
                  <p className="text-white/80 text-sm font-medium mt-1">
                    {selectedCrop 
                      ? `Listing: ${selectedCrop.name}` 
                      : `Farm: ${selectedFarm.name}`}
                  </p>
                </div>
                <form onSubmit={handleSellProduce} className="p-8 space-y-6">
                  {!selectedCrop && (
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Select Crop Plot</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary-fresh transition-all"
                        value={sellFormData.cropId}
                        onChange={(e) => setSellFormData({...sellFormData, cropId: e.target.value})}
                      >
                        <option value="">Choose a plot...</option>
                        {crops.map(crop => (
                          <option key={crop.id} value={crop.id}>{crop.name} ({crop.variety})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Harvest Quantity" placeholder="e.g. 50 Bags" required value={sellFormData.quantity} onChange={(e) => setSellFormData({...sellFormData, quantity: e.target.value})} />
                    <Input label="Price per Unit (KSh)" placeholder="e.g. 4500" type="number" required value={sellFormData.price} onChange={(e) => setSellFormData({...sellFormData, price: e.target.value})} />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Harvest Readiness (%)</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="100" className="flex-1 accent-primary-fresh" value={sellFormData.readiness} onChange={(e) => setSellFormData({...sellFormData, readiness: e.target.value})} />
                      <span className="font-bold text-primary-dark w-12 text-right">{sellFormData.readiness}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Higher readiness attracts more immediate buyers.</p>
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Notes</label>
                    <textarea 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium h-20 resize-none"
                      placeholder="e.g. Grain is dried and moisture tested..."
                      value={sellFormData.notes}
                      onChange={(e) => setSellFormData({...sellFormData, notes: e.target.value})}
                    />
                  </div>
                  <div className="p-4 bg-bg-soft rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Advantage</p>
                    <p className="text-xs font-medium text-gray-700">Recommended Price: <span className="text-primary-fresh font-bold">KSh 4,200 - 4,800</span></p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowSellModal(false)}>Cancel</Button>
                    <Button variant="primary" type="submit" className="flex-1 rounded-xl h-12" isLoading={isSubmitting}>List for Sale</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Farms</h2>
          <p className="text-gray-400 text-sm font-medium">Manage and monitor your agricultural enterprise profiles.</p>
        </div>
        <Button onClick={() => setShowAddFarmModal(true)} size="lg" className="h-14 rounded-2xl px-8 font-bold group">
          <Plus className="mr-2 group-hover:rotate-90 transition-transform" /> Register New Farm
        </Button>
      </header>

      {farmsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[3rem]" />)}
        </div>
      ) : farms.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-50 flex flex-col items-center p-8 space-y-6">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
             <Landmark size={48} />
           </div>
           <div className="space-y-2">
             <h3 className="text-xl font-bold">You haven't added a farm yet</h3>
             <p className="text-sm text-gray-400 font-medium max-w-sm">Create your first farm profile to start organizing your crop plots and monitoring their growth.</p>
           </div>
           <Button variant="primary" className="h-14 px-8 rounded-2xl" onClick={() => setShowAddFarmModal(true)}>Add Your First Farm</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farms.map(farm => (
            <FarmCard key={farm.id} farm={farm} onClick={() => setSelectedFarm(farm)} />
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      <AnimatePresence>
        {showAddFarmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowAddFarmModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 bg-primary-dark text-white">
                <h3 className="text-2xl font-bold tracking-tight">Create Farm Profile</h3>
                <p className="text-white/60 text-sm font-medium mt-1">Define your agricultural asset to start tracking data.</p>
              </div>
              <form onSubmit={handleAddFarm} className="p-8 space-y-6">
                <Input label="Farm Name" placeholder="e.g. Riverside Estate" required value={farmFormData.name} onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">County</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium" value={farmFormData.county} onChange={(e) => setFarmFormData({...farmFormData, county: e.target.value})}>
                      {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input label="Area (e.g. 10 Acres)" placeholder="Total size" required value={farmFormData.totalArea} onChange={(e) => setFarmFormData({...farmFormData, totalArea: e.target.value})} />
                </div>
                <Input label="Location / Village" placeholder="e.g. Near Butere Market" required value={farmFormData.location} onChange={(e) => setFarmFormData({...farmFormData, location: e.target.value})} />
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowAddFarmModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" className="flex-1 rounded-xl h-12" isLoading={isSubmitting}>Create Farm</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FarmCard({ farm, onClick }: { farm: any, onClick: () => void }) {
  return (
    <Card hoverable className="p-8 flex flex-col space-y-6 rounded-[2.5rem] cursor-pointer group" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center text-primary-dark group-hover:scale-110 transition-transform">
           <Building2 size={24} />
        </div>
        <Badge variant="default" className="border-gray-100 text-gray-400 font-bold tracking-widest text-[9px]">ID: {farm.id.slice(0, 5).toUpperCase()}</Badge>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold group-hover:text-primary-fresh transition-colors">{farm.name}</h3>
        <div className="flex items-center gap-1.5 text-gray-400">
           <MapPin size={12} />
           <p className="text-xs font-medium">{farm.location}, {farm.county}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
         <div className="space-y-0.5">
           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Total Size</p>
           <p className="text-sm font-bold text-primary-dark">{farm.totalArea}</p>
         </div>
         <div className="w-10 h-10 bg-primary-fresh/5 rounded-full flex items-center justify-center text-primary-fresh group-hover:bg-primary-fresh group-hover:text-white transition-all">
            <ArrowRight size={18} />
         </div>
      </div>
    </Card>
  );
}

function CropCard({ crop, onClick }: { crop: any, onClick: () => void }) {
  const cropInfo = CROP_TYPES.find(t => t.id === crop.typeId);
  const healthColor = crop.healthScore >= 90 ? 'text-green-500' : crop.healthScore >= 70 ? 'text-accent-amber' : 'text-red-500';
  const healthBg = crop.healthScore >= 90 ? 'bg-green-50' : crop.healthScore >= 70 ? 'bg-amber-50' : 'bg-red-50';
  
  return (
    <Card hoverable className="p-6 cursor-pointer group flex flex-col rounded-[2rem] border-gray-50 shadow-sm relative overflow-hidden" onClick={onClick}>
      <div className="absolute top-0 right-0 p-4">
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5", healthBg, healthColor)}>
          <Activity size={12} />
          {crop.healthScore}% Health
        </div>
      </div>
      
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-bg-soft rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {cropInfo?.icon || '🌱'}
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <div>
          <Badge variant={crop.status === 'planted' ? 'info' : 'success'} className="mb-2 text-[8px] uppercase tracking-widest">{crop.status}</Badge>
          <div className="flex items-center gap-2 group-hover:text-primary-fresh transition-colors">
            <span className="text-xl">{cropInfo?.icon || '🌱'}</span>
            <h3 className="text-lg font-bold truncate">{crop.name}</h3>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{crop.variety} • {crop.area}</p>
        </div>
        
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
           <div className="space-y-0.5">
             <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Est. Harvest</p>
             <p className="text-xs font-bold text-primary-dark">{formatDate(crop.expectedHarvest)}</p>
           </div>
           <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-primary-fresh group-hover:text-primary-fresh group-hover:bg-primary-fresh/5 transition-all">
              <ArrowRight size={14} />
           </div>
        </div>
      </div>
    </Card>
  );
}
