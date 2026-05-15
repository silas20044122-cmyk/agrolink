import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Plus, MapPin, Ruler, Activity, TrendingUp, ChevronLeft, Building2, Clock, Sparkles, Calendar, X, ShoppingCart } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/src/components/ui/Base';
import { useFarms, useCrops } from '@/src/hooks/useAppData';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { cn, formatDate } from '@/src/lib/utils';
import { CROP_TYPES } from '@/src/lib/constants';

export default function FarmDetailsPage({ user }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { farms, loading: farmsLoading } = useFarms(user?.id);
  const farm = farms.find((f: any) => f.id === id);
  const { crops, loading: cropsLoading, addCrop } = useCrops(user?.id, id);
  
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('addCrop') === 'true') {
      setShowAddCropModal(true);
    }
  }, []);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  if (farmsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary-fresh border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-primary-dark">Farm Profile Not Found</h2>
        <Button onClick={() => navigate('/my-farms')}>Back to My Farms</Button>
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
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32">
      <button 
        onClick={() => navigate('/my-farms')}
        className="flex items-center gap-2 text-gray-400 hover:text-primary-dark font-bold text-xs uppercase tracking-widest transition-colors mb-4"
      >
        <ChevronLeft size={16} /> Back to My Farms
      </button>

      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-fresh/10 rounded-2xl flex items-center justify-center text-primary-fresh shadow-inner">
              <Building2 size={28} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-dark font-display">{farm.name}</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
             <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
               <MapPin size={14} className="text-primary-fresh" /> {farm.location}, {farm.county}
             </span>
             <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
               <Ruler size={14} className="text-primary-fresh" /> {farm.totalArea}
             </span>
             <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
               <Calendar size={14} className="text-primary-fresh" /> Reg: {formatDate(farm.registrationDate)}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowSellModal(true)} className="h-14 rounded-2xl px-6 font-bold border-gray-200 bg-white">
            <ShoppingCart className="mr-2 text-primary-fresh" size={18} /> Sell Produce
          </Button>
          <Button onClick={() => setShowAddCropModal(true)} size="lg" className="h-14 rounded-2xl px-8 font-bold shadow-lg shadow-primary-fresh/20">
            <Plus className="mr-2" /> Add Crop Plot
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <Card className="p-8 bg-primary-fresh/5 border-none flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-bold text-primary-fresh uppercase tracking-widest leading-none">Active Plots</p>
              <p className="text-4xl font-bold text-primary-dark">{crops.length}</p>
            </div>
            <Sprout className="absolute -right-4 -bottom-4 text-primary-fresh/10 group-hover:rotate-12 transition-transform" size={120} />
         </Card>
      </div>

      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-primary-dark">Crop Plot Inventory</h3>
            <Badge variant="default" className="bg-gray-100 text-gray-400 font-bold">{crops.length} TOTAL</Badge>
         </div>

         {cropsLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[2rem]" />)}
           </div>
         ) : crops.length === 0 ? (
           <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center p-8 space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <Sprout size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-primary-dark">No crops currently in production</h3>
                <p className="text-sm text-gray-400 font-medium">Add crop plots to this farm profile to start real-time monitoring.</p>
              </div>
              <Button onClick={() => setShowAddCropModal(true)}>Add My First Crop</Button>
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
             {crops.map((crop: any) => (
               <CropCard key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} />
             ))}
           </div>
         )}
      </div>

      {/* Modals similar to MyFarms.tsx but extracted for this page */}
      <AnimatePresence>
        {showAddCropModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowAddCropModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 bg-primary-dark text-white">
                <h3 className="text-2xl font-bold tracking-tight">Register New Plot</h3>
                <p className="text-white/60 text-sm font-medium mt-1">Add crop inventory to your profile.</p>
              </div>
              <form onSubmit={handleAddCrop} className="p-8 space-y-6">
                <Input label="Plot Name" placeholder="e.g. Tomato Plot A" required value={cropFormData.name} onChange={(e) => setCropFormData({...cropFormData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Crop Type</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium" value={cropFormData.typeId} onChange={(e) => setCropFormData({...cropFormData, typeId: e.target.value})}>
                       {CROP_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                    </select>
                  </div>
                  <Input label="Area" placeholder="e.g. 2 Acres" required value={cropFormData.area} onChange={(e) => setCropFormData({...cropFormData, area: e.target.value})} />
                </div>
                <Input label="Planting Date" type="date" required value={cropFormData.plantingDate} onChange={(e) => setCropFormData({...cropFormData, plantingDate: e.target.value})} />
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowAddCropModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" className="flex-1 rounded-xl h-12" isLoading={isSubmitting}>Register Plot</Button>
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
  return (
    <Card onClick={onClick} className="p-7 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group bg-white border-gray-100 rounded-[2.5rem]">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
           {cropInfo?.icon || '🌱'}
         </div>
         <div>
            <h4 className="font-bold text-lg text-primary-dark">{crop.name}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{crop.variety}</p>
         </div>
      </div>
      <div className="space-y-4">
         <div className="flex justify-between items-end">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Health & Growth</p>
            <p className="text-xs font-bold text-primary-fresh">{crop.healthScore}%</p>
         </div>
         <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-primary-fresh rounded-full" style={{ width: `${crop.healthScore}%` }} />
         </div>
         <div className="flex justify-between pt-4 border-t border-gray-50 items-center">
            <Badge variant="default" className="text-[9px] font-bold uppercase bg-gray-50 border border-gray-100 text-gray-400 tracking-widest">{crop.area}</Badge>
            <Clock size={16} className="text-gray-200" />
         </div>
      </div>
    </Card>
  );
}
