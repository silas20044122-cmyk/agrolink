import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Plus, Filter, MapPin, Ruler, Landmark, Building2, ArrowRight, Map as MapIcon, X } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/src/components/ui/Base';
import { useFarms } from '@/src/hooks/useAppData';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { cn } from '@/src/lib/utils';
import { KENYA_COUNTIES } from '@/src/lib/constants';
import FarmMap from '@/src/components/FarmMap';

export default function MyFarmsPage({ user }: any) {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { farms, loading: farmsLoading, addFarm } = useFarms(user?.id);
  
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  const [farmFormData, setFarmFormData] = useState({
    name: '',
    location: '',
    county: user?.region || 'Nairobi',
    totalArea: '',
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
      addNotification({
        title: 'Farm Registered',
        message: `Successfully created profile for "${farmFormData.name}".`,
        type: 'success',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark">My Agricultural Assets</h2>
          <p className="text-gray-400 text-sm font-medium">Manage and monitor your farm profiles in real-time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
             <button 
               onClick={() => setViewMode('grid')}
               className={cn(
                 "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                 viewMode === 'grid' ? "bg-white text-primary-dark shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
                <Filter size={14} /> Grid
             </button>
             <button 
               onClick={() => setViewMode('map')}
               className={cn(
                 "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                 viewMode === 'map' ? "bg-white text-primary-dark shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
                <MapIcon size={14} /> Map
             </button>
          </div>
          <Button onClick={() => setShowAddFarmModal(true)} size="lg" className="h-14 rounded-2xl px-8 font-bold group shadow-lg shadow-primary-fresh/20">
            <Plus className="mr-2 group-hover:rotate-90 transition-transform" /> Register New Farm
          </Button>
        </div>
      </header>

      {viewMode === 'map' && farms.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm relative z-0">
           <FarmMap farms={farms} onFarmClick={(f: any) => navigate(`/my-farms/${f.id}`)} className="h-full" />
        </motion.div>
      )}

      {viewMode === 'grid' && (
        farmsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[3rem]" />)}
          </div>
        ) : farms.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3.5rem] border border-gray-100 flex flex-col items-center p-12 space-y-10 relative overflow-hidden">
             <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 border border-gray-100/50 shadow-inner">
               <Landmark size={64} strokeWidth={1} />
             </div>
             <div className="space-y-3 max-w-md">
               <h3 className="text-3xl font-bold tracking-tight text-primary-dark">Establish Your First Farm</h3>
               <p className="text-base text-gray-400 font-medium">Create a digital profile for your agricultural assets to start tracking data.</p>
             </div>
             <Button onClick={() => setShowAddFarmModal(true)} size="lg" className="h-16 px-12 rounded-[2rem] font-bold shadow-xl shadow-primary-fresh/20">
                Register My First Farm
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.map((farm: any) => (
              <FarmCard 
                key={farm.id} 
                farm={farm} 
                onClick={() => {
                  setSelectedFarm(farm);
                  setShowDetailsModal(true);
                }} 
              />
            ))}
          </div>
        )
      )}

      {/* Farm Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedFarm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowDetailsModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-8 bg-primary-dark text-white flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">{selectedFarm.name}</h3>
                  <div className="flex items-center gap-3 mt-2 opacity-70">
                    <MapPin size={16} />
                    <p className="text-sm font-medium">{selectedFarm.location}, {selectedFarm.county} County</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Area</p>
                    <p className="text-lg font-bold text-primary-dark">{selectedFarm.totalArea}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registration</p>
                    <p className="text-lg font-bold text-primary-dark">{selectedFarm.registrationDate || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Crops</p>
                    <p className="text-lg font-bold text-primary-dark">{selectedFarm.crops?.length || 0} Registered</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold">Associated Crops</h4>
                    <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 group" onClick={() => navigate(`/my-farms/${selectedFarm.id}?addCrop=true`)}>
                      <Plus size={14} className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Crop
                    </Button>
                  </div>
                  
                  {selectedFarm.crops && selectedFarm.crops.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFarm.crops.map((crop: any, i: number) => (
                        <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-fresh/10 rounded-xl flex items-center justify-center text-primary-fresh text-xl">
                              {crop.icon || '🌱'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{crop.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{crop.variety}</p>
                            </div>
                          </div>
                          <Badge variant="success" className="text-[9px]">{crop.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium italic">No crops registered to this farm yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 bg-gray-50/10 flex gap-4">
                <Button variant="primary" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => navigate(`/my-farms/${selectedFarm.id}`)}>
                   Full Farm Management <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Farm Modal */}
      <AnimatePresence>
        {showAddFarmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowAddFarmModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 bg-primary-dark text-white">
                <h3 className="text-2xl font-bold tracking-tight">Create Farm Profile</h3>
                <p className="text-white/60 text-sm font-medium mt-1">Define your agricultural asset.</p>
              </div>
              <form onSubmit={handleAddFarm} className="p-8 space-y-6">
                <Input label="Farm Name" placeholder="e.g. Riverside Estate" required value={farmFormData.name} onChange={(e) => setFarmFormData({...farmFormData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">County</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary-fresh transition-all" value={farmFormData.county} onChange={(e) => setFarmFormData({...farmFormData, county: e.target.value})}>
                      {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input label="Area (Acres)" placeholder="Total size" required value={farmFormData.totalArea} onChange={(e) => setFarmFormData({...farmFormData, totalArea: e.target.value})} />
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
    <Card 
      onClick={onClick}
      className="group relative flex flex-col p-0 rounded-[2.5rem] overflow-hidden border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-primary-fresh/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white"
    >
      <div className="p-8 pb-6 flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <div className="relative">
            <div className="w-16 h-16 bg-primary-fresh/5 rounded-[2rem] flex items-center justify-center text-primary-fresh group-hover:scale-110 group-hover:bg-primary-fresh group-hover:text-white transition-all duration-500">
               <Building2 size={28} strokeWidth={1.5} />
            </div>
          </div>
          <Badge variant="default" className="bg-gray-50 border-gray-100 text-gray-400 font-bold tracking-widest text-[8px] px-2 py-0.5">
            REF: {farm.id.slice(0, 5).toUpperCase()}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-primary-dark group-hover:text-primary-fresh transition-colors duration-300">
            {farm.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 bg-gray-50/50 w-fit px-3 py-1.5 rounded-full border border-gray-100/50">
             <MapPin size={14} className="text-primary-fresh/60" />
             <p className="text-xs font-bold tracking-tight">{farm.location}, {farm.county}</p>
          </div>
        </div>
      </div>
      <div className="mt-auto px-8 py-5 bg-gray-50/50 border-t border-gray-100/80 flex items-center justify-between group-hover:bg-white transition-colors duration-300">
         <div className="flex gap-6">
           <div className="space-y-0.5">
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Area</p>
             <p className="text-sm font-bold text-primary-dark flex items-center gap-1"><Ruler size={14} />{farm.totalArea}</p>
           </div>
         </div>
         <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-primary-fresh transition-all duration-300">
            <ArrowRight size={20} />
         </div>
      </div>
    </Card>
  );
}
