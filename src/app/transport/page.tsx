import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { Truck, MapPin, Package, Clock, Phone, ChevronRight, Search, Navigation, Info, Plus, Calendar, ArrowRight, X, RefreshCcw, TrendingUp, ShieldCheck, Users, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useTransport, useMarketData } from '@/src/hooks/useAppData';
import { estimateTransportCost, rankTransporters, recommendVehicle, calculatePotentialSavings } from '@/src/lib/logistics';
import { TransportRequest, UserProfile } from '@/src/types';

export default function TransportPage({ user }: { user: UserProfile }) {
  const { requests, transporters, sharedGroups, loading, addRequest, updateRequestStatus } = useTransport(user?.id);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    produceType: 'Maize',
    quantity: 50,
    unit: 'Bags (90kg)',
    pickupLocation: user?.region || '',
    destination: 'NCPB Kakamega',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await addRequest({
      ...formData,
      quantity: Number(formData.quantity)
    });
    
    if (result) {
      setShowBookingModal(false);
      setFormData({
        produceType: 'Maize',
        quantity: 50,
        unit: 'Bags (90kg)',
        pickupLocation: user?.region || '',
        destination: 'NCPB Kakamega',
        preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        urgency: 'medium',
        notes: '',
      });
    }
    setIsSubmitting(false);
  };

  // Smart Matching Recommendations
  const recommendations = useMemo(() => {
    if (!formData.quantity) return null;
    return recommendVehicle(Number(formData.quantity), formData.unit);
  }, [formData.quantity, formData.unit]);

  const rankedTransporters = useMemo(() => {
    return rankTransporters(formData, transporters);
  }, [formData, transporters]);

  const activeRequests = requests.filter(r => r.status !== 'delivered');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="info" className="px-3 py-1 bg-primary-fresh/10 text-primary-fresh border-none text-[10px] uppercase font-black tracking-widest">
            Logistics Engine 2.0
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-dark font-display">Transport Intelligence</h2>
          <p className="text-gray-400 font-medium max-w-xl text-sm md:text-base">
            Optimize your supply chain with AI-powered vehicle matching and shared delivery groups. 
            Reduce carbon footprint and logistics costs by up to 45%.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          className="h-14 md:h-16 px-10 rounded-2xl md:rounded-3xl font-bold text-base shadow-xl shadow-primary-fresh/20 group overflow-hidden relative"
          onClick={() => setShowBookingModal(true)}
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
          <Plus className="mr-2 group-hover:rotate-90 transition-transform" size={20} /> Book Smart Transport
        </Button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         {[
           { label: 'Active Shipments', value: activeRequests.length, icon: <Truck size={20} />, color: 'bg-blue-500' },
           { label: 'Potential Savings', value: 'KES 8.4k', icon: <TrendingUp size={20} />, color: 'bg-green-500' },
           { label: 'Avg Carbon Saved', value: '12%', icon: <Zap size={20} />, color: 'bg-amber-500' },
           { label: 'Reliability Score', value: '98%', icon: <ShieldCheck size={20} />, color: 'bg-purple-500' },
         ].map((stat, i) => (
           <Card key={i} className="p-6 border-none shadow-sm bg-white rounded-3xl flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-primary-dark leading-none mt-1">{stat.value}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Main Content: Shipments and Groups */}
        <div className="lg:col-span-8 space-y-12">
           
           {/* Section 1: Active Shipments */}
           <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-primary-dark">Active Logistics</h3>
                <button className="text-xs font-bold text-primary-fresh hover:underline uppercase tracking-widest">View History</button>
             </div>
             
             <div className="space-y-4">
               {loading ? (
                 <div className="p-12 text-center bg-white rounded-3xl animate-pulse text-gray-300">Loading your transit data...</div>
               ) : activeRequests.length === 0 ? (
                 <div className="p-16 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem] space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                      <Package size={40} />
                    </div>
                    <p className="text-gray-400 font-medium italic">No active shipments. Ready to harvest?</p>
                    <Button variant="outline" onClick={() => setShowBookingModal(true)} className="rounded-xl">Start Your First Request</Button>
                 </div>
               ) : (
                 activeRequests.map((req) => (
                   <Card key={req.id} className="group p-6 md:p-8 hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white border-gray-100/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity translate-x-4 -translate-y-4">
                         <Truck size={120} />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-6 md:gap-10 relative z-10">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                             <div className="w-14 h-14 bg-primary-dark rounded-[1.25rem] flex items-center justify-center text-white shadow-lg">
                                <Package size={24} />
                             </div>
                             <div>
                                <h4 className="font-bold text-xl text-primary-dark">{req.produceType} ({req.quantity} {req.unit})</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={req.status === 'in-transit' ? 'success' : 'info'} className="text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest shadow-sm">
                                    {req.status}
                                  </Badge>
                                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{req.id.slice(0, 8)}</span>
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                             <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                   <MapPin size={10} className="text-primary-fresh" /> Route Details
                                </p>
                                <p className="text-sm font-bold text-primary-dark truncate">{req.pickupLocation} → {req.destination}</p>
                             </div>
                             <div className="space-y-1 text-right md:text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 md:justify-start justify-end">
                                   <Calendar size={10} className="text-primary-fresh" /> Scheduled for
                                </p>
                                <p className="text-sm font-bold text-primary-dark">{new Date(req.preferredDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</p>
                             </div>
                          </div>
                        </div>

                        <div className="md:w-px md:h-24 bg-gray-100" />

                        <div className="flex flex-col justify-between items-center md:items-end gap-6">
                           <div className="text-center md:text-right">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Est. Transport Cost</p>
                              <p className="text-2xl font-black text-primary-dark tracking-tight">KSh {estimateTransportCost(req.quantity, req.unit).toLocaleString()}</p>
                           </div>
                           <Button variant="outline" size="sm" className="w-full md:w-auto h-11 px-6 rounded-xl border-gray-200 font-bold hover:bg-gray-50 group/btn">
                              Track Ship <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                           </Button>
                        </div>
                      </div>
                   </Card>
                 ))
               )}
             </div>
           </section>

           {/* Section 2: Shared Delivery Opportunities */}
           <section className="space-y-6">
             <div className="flex items-center gap-3 px-2">
                <Users className="text-primary-fresh" size={24} />
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-primary-dark">Shared Delivery Intel</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sharedGroups.map((group) => (
                  <Card key={group.id} className="p-8 bg-gradient-to-br from-primary-dark to-primary-dark/90 text-white border-none rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                     <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl">
                           <Users size={20} className="text-primary-fresh" />
                        </div>
                        <Badge variant="success" className="bg-primary-fresh text-primary-dark border-none px-3 font-black text-[9px] uppercase tracking-widest">Highly Optimized</Badge>
                     </div>
                     <div className="space-y-1 mb-8">
                        <h4 className="text-xl font-bold tracking-tight">Group to {group.destination}</h4>
                        <p className="text-white/60 text-xs font-medium">Scheduled: {new Date(group.transportDate).toLocaleDateString()}</p>
                     </div>
                     <div className="p-5 bg-white/5 rounded-3xl mb-8 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                           <span className="opacity-60">Est. Savings per Farmer</span>
                           <span className="font-bold text-primary-fresh">+ KSh {group.estimatedSavings.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: '80%' }}
                             className="h-full bg-primary-fresh"
                           />
                        </div>
                     </div>
                     <Button variant="accent" className="w-full h-14 rounded-2xl font-bold text-primary-dark tracking-tight">
                        Apply to Join Group
                     </Button>
                  </Card>
                ))}
             </div>
           </section>
        </div>

        {/* Sidebar: Recommendations & Transporters */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Section 3: Smart Recommendations */}
           <Card className="p-8 bg-white border-none shadow-xl rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-2">
                 <Zap className="text-amber-500" size={20} fill="currentColor" />
                 <h4 className="font-bold text-lg text-primary-dark">AI Logistics Suggest</h4>
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-amber-900 leading-snug">Optimal Vehicle Found</p>
                       <p className="text-[10px] text-amber-700 font-medium mt-0.5">Based on your 50 bag load, a 1-ton Pickup is 15% cheaper than a medium truck.</p>
                    </div>
                 </div>

                 <div className="p-4 bg-primary-fresh/5 border border-primary-fresh/10 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-primary-fresh rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                       <TrendingUp size={18} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-primary-dark leading-snug">Market Arbitrage Tip</p>
                       <p className="text-[10px] text-primary-dark/70 font-medium mt-0.5">Current prices in Nairobi are KSh 800 higher. Transporting there yields KSh 40k extra profit after fuel.</p>
                    </div>
                 </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50">
                 <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center mb-4">Route Efficiency Tracker</p>
                 <div className="flex justify-between items-center">
                    <div className="text-center">
                       <p className="text-sm font-bold text-primary-dark">2h 15m</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Driving Time</p>
                    </div>
                    <div className="flex-1 px-4">
                       <div className="h-1 bg-gray-100 rounded-full relative">
                          <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-fresh rounded-full shadow-sm z-10" />
                          <div className="h-full bg-primary-fresh rounded-full w-2/3" />
                       </div>
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-bold text-primary-dark">82km</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total Dist</p>
                    </div>
                 </div>
              </div>
           </Card>

           {/* Section 4: Available Transporters */}
           <section className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-primary-dark px-2">Verified Transit Partners</h3>
              <div className="space-y-3">
                 {transporters.map((t) => (
                   <div key={t.id} className="p-4 bg-white hover:bg-gray-50 transition-colors border border-gray-100 rounded-3xl flex items-center justify-between cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-primary-dark group-hover:bg-primary-dark group-hover:text-white transition-colors overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`} alt={t.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="min-w-0">
                            <h5 className="font-bold text-sm text-primary-dark truncate">{t.name}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                               <Badge className="text-[8px] bg-green-500/10 text-green-600 border-none px-1.5 py-0">★ {t.rating || 4.5}</Badge>
                               <span className="text-[10px] text-gray-400 font-medium truncate">{t.vehicleType} • {t.currentLocation}</span>
                            </div>
                         </div>
                      </div>
                      <button className="p-2.5 text-gray-300 hover:text-primary-fresh hover:bg-white rounded-xl transition-all shadow-sm">
                         <Phone size={16} />
                      </button>
                   </div>
                 ))}
              </div>
              <Button variant="outline" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-gray-100">
                 Directory Search
              </Button>
           </section>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-primary-dark/80 backdrop-blur-xl" 
               onClick={() => setShowBookingModal(false)} 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 30 }} 
               className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-10 bg-primary-dark text-white flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="success" className="bg-primary-fresh text-primary-dark border-none font-black text-[9px] px-3 uppercase tracking-widest">
                    Smart Booking System
                  </Badge>
                  <h3 className="text-3xl font-bold tracking-tight font-display mt-2">New Transport Request</h3>
                  <p className="text-white/60 text-sm font-medium">Matching with 12 nearby transporters...</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                <form onSubmit={handleBooking} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                      <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                         <div className="w-1 h-1 bg-primary-fresh rounded-full" /> Load Details
                      </h4>
                      <Input 
                        label="Produce Type" 
                        placeholder="e.g. Maize, Beans, Kales" 
                        required 
                        value={formData.produceType} 
                        onChange={(e) => setFormData({...formData, produceType: e.target.value})} 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label="Quantity" 
                          type="number" 
                          required 
                          value={formData.quantity} 
                          onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} 
                        />
                        <Input 
                          label="Unit" 
                          placeholder="e.g. 90kg Bags" 
                          required 
                          value={formData.unit} 
                          onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Urgency Level</label>
                        <div className="flex gap-2">
                          {(['low', 'medium', 'high'] as const).map(u => (
                            <button 
                              key={u}
                              type="button"
                              onClick={() => setFormData({...formData, urgency: u})}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all border",
                                formData.urgency === u 
                                  ? "bg-primary-fresh text-white border-primary-fresh shadow-lg shadow-primary-fresh/20" 
                                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                              )}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                         <div className="w-1 h-1 bg-primary-fresh rounded-full" /> Logistics Path
                      </h4>
                      <Input 
                        label="Pickup Location" 
                        placeholder="e.g. Butere Farm Gate" 
                        required 
                        value={formData.pickupLocation} 
                        onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})} 
                      />
                      <Input 
                        label="Destination Market" 
                        placeholder="e.g. Kibuye Market, Kisumu" 
                        required 
                        value={formData.destination} 
                        onChange={(e) => setFormData({...formData, destination: e.target.value})} 
                      />
                      <Input 
                        label="Preferred Date" 
                        type="date" 
                        required 
                        value={formData.preferredDate} 
                        onChange={(e) => setFormData({...formData, preferredDate: e.target.value})} 
                      />
                    </section>
                  </div>

                  {/* Smart Suggestions in Modal */}
                  <div className="bg-primary-dark/5 p-6 rounded-[2rem] border border-primary-dark/5 flex gap-6 items-center">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-fresh shadow-sm">
                        <Truck size={24} />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-bold text-primary-dark">AI Optimization Active</p>
                        <p className="text-[10px] text-gray-500 font-medium">Recommended: {recommendations?.type} ({recommendations?.reason})</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">Est. Direct Fee</p>
                        <p className="text-lg font-black text-primary-dark leading-none">KSh {estimateTransportCost(formData.quantity, formData.unit).toLocaleString()}</p>
                     </div>
                  </div>

                  <Button variant="primary" type="submit" className="w-full h-16 rounded-[1.5rem] font-bold text-lg shadow-xl" isLoading={isSubmitting}>
                    Confirm and Alert Transporters
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
