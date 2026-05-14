import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { Truck, MapPin, Package, Clock, Phone, ChevronRight, Search, Navigation, Info, Plus, Calendar, ArrowRight, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Logistics() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    origin: '',
    destination: 'NCPB Kakamega',
    loadType: 'Maize',
    volume: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '08:00',
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowBookingModal(false);
    }, 1500);
  };

  const shipments = [
    { id: 'SH-2931', item: 'Maize (20 Bags)', status: 'In Transit', origin: 'Butere Farm', destination: 'NCPB Kakamega', driver: 'Otieno P.', time: '2h 20m away' },
    { id: 'SH-2849', item: 'Beans (5 Large Bags)', status: 'Pending Pickup', origin: 'Mumias', destination: 'Kisumu Market', driver: 'Waiting...', time: 'Scheduled for 3:00 PM' },
    { id: 'SH-2710', item: 'Tomatoes (10 Crates)', status: 'Delivered', origin: 'Eldoret North', destination: 'Nairobi Hub', driver: 'John D.', time: 'Delivered Yesterday' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Logistics Hub</h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium tracking-tight">Coordinate transport to local and national markets.</p>
        </div>
        <Button variant="primary" size="lg" className="h-12 md:h-14 w-full md:w-auto px-8 rounded-xl md:rounded-2xl font-bold text-sm" onClick={() => setShowBookingModal(true)}>
          <Plus className="mr-2" size={18} /> Book Transport
        </Button>
      </header>

      {/* Book Transport Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md" onClick={() => setShowBookingModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 bg-primary-dark text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Book Farm Transport</h3>
                  <p className="text-white/60 text-sm font-medium mt-1">Schedule a pickup for your produce.</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleBooking} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                <div className="space-y-4">
                  <div className="p-4 bg-primary-fresh/5 rounded-2xl border border-primary-fresh/10 space-y-3">
                    <p className="text-[10px] font-bold text-primary-fresh uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={12} /> Origin & Destination
                    </p>
                    <div className="space-y-4">
                      <Input label="Pickup Location (e.g. Riverside Farm Gate)" placeholder="Be specific for the driver" required value={bookingForm.origin} onChange={(e) => setBookingForm({...bookingForm, origin: e.target.value})} />
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Destination Hub</label>
                        <select className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none text-sm font-medium" value={bookingForm.destination} onChange={(e) => setBookingForm({...bookingForm, destination: e.target.value})}>
                          <option>NCPB Kakamega</option>
                          <option>Nairobi Fresh Market</option>
                          <option>Kisumu Lakeside Hub</option>
                          <option>Eldoret Grains Reserve</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Produce Type</label>
                        <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none text-sm font-medium" value={bookingForm.loadType} onChange={(e) => setBookingForm({...bookingForm, loadType: e.target.value})}>
                          <option>Maize</option>
                          <option>Beans</option>
                          <option>Potatoes</option>
                          <option>Tomatoes</option>
                        </select>
                      </div>
                      <Input label="Load Volume (e.g. 50 Bags)" placeholder="Specify weight/count" required value={bookingForm.volume} onChange={(e) => setBookingForm({...bookingForm, volume: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Pickup Date" type="date" required value={bookingForm.pickupDate} onChange={(e) => setBookingForm({...bookingForm, pickupDate: e.target.value})} />
                    <Input label="Preferred Time" type="time" required value={bookingForm.pickupTime} onChange={(e) => setBookingForm({...bookingForm, pickupTime: e.target.value})} />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div className="p-4 bg-bg-soft rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Fee</p>
                      <p className="text-xl font-bold text-primary-dark">KSh 4,500</p>
                    </div>
                    <Badge variant="info" className="h-fit">Instant Quote</Badge>
                  </div>
                  <Button variant="primary" type="submit" className="w-full h-14 rounded-2xl font-bold" isLoading={isSubmitting}>
                    Confirm Logistics Request
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left: Active Shipments */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
           <h3 className="text-lg md:text-xl font-bold tracking-tight px-1">Active Shipments</h3>
           <div className="space-y-4">
             {shipments.map((ship, i) => (
                <Card key={i} className="p-4 md:p-6 hover:shadow-md transition-all rounded-xl md:rounded-2xl">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-dark shrink-0">
                       <Truck className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    
                    <div className="flex-1 space-y-3 md:space-y-4">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                         <div>
                           <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-base md:text-lg">{ship.item}</h4>
                              <Badge variant={ship.status === 'Delivered' ? 'success' : ship.status === 'In Transit' ? 'info' : 'warning'} className="text-[8px] md:text-[10px]">
                                {ship.status}
                              </Badge>
                           </div>
                           <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ship.id}</p>
                         </div>
                         <div className="text-left sm:text-right">
                            <p className="text-xs md:text-sm font-bold text-gray-900">{ship.time}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Completion</p>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 md:pt-4 border-t border-gray-50">
                          <div className="flex gap-2 md:gap-3">
                             <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                               <MapPin size={14} className="text-primary-fresh" />
                             </div>
                             <div className="overflow-hidden">
                               <p className="text-[9px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest">Journey</p>
                               <p className="text-[10px] md:text-xs font-bold text-gray-700 truncate">{ship.origin} → {ship.destination}</p>
                             </div>
                          </div>
                          <div className="flex gap-2 md:gap-3">
                             <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                               <Navigation size={14} className="text-primary-fresh" />
                             </div>
                             <div className="overflow-hidden">
                               <p className="text-[9px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest">Contact</p>
                               <p className="text-[10px] md:text-xs font-bold text-gray-700 truncate">{ship.driver}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-end md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-gray-50">
                       <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 border border-transparent hover:border-gray-200">
                          <Phone size={18} className="text-gray-400" />
                       </Button>
                       <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 border border-transparent hover:border-gray-200">
                          <ChevronRight size={18} className="text-gray-400" />
                       </Button>
                    </div>
                  </div>
                </Card>
             ))}
           </div>
        </div>

        {/* Right: Booking & Helpers */}
        <div className="space-y-6 md:space-y-8">
           <Card className="p-6 md:p-8 space-y-4 md:space-y-6 bg-primary-dark text-white border-none rounded-2xl">
              <div className="space-y-1">
                 <h3 className="text-lg md:text-xl font-bold tracking-tight">Cooperative Booking</h3>
                 <p className="text-[10px] md:text-xs opacity-70 font-medium">Pool with farmers near you to save up to 40% on transport costs.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 py-3 md:py-4 bg-white/10 rounded-xl md:rounded-2xl px-4">
                 <div className="flex -space-x-2 md:-space-x-3 shrink-0">
                   {[1, 2, 3, 4].map(i => (
                     <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer${i}`} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary-dark shadow-sm bg-white" />
                   ))}
                 </div>
                 <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">4/5 Spots Filled</div>
              </div>
              <Button variant="accent" className="w-full h-12 md:h-14 rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase">Join Group</Button>
           </Card>

           <Card className="p-6 md:p-8 space-y-4 md:space-y-6 rounded-2xl shadow-sm">
              <h4 className="font-bold text-base md:text-lg">Quick Estimator</h4>
              <div className="space-y-3 md:space-y-4">
                 <Input label="Volume (Bags/Crates)" placeholder="e.g. 50" className="h-10 md:h-12 border-gray-100 text-sm" />
                 <div className="space-y-1.5 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Route Selection</p>
                    <select className="w-full h-10 md:h-12 px-3 md:px-4 bg-gray-50 border-none rounded-xl text-xs md:text-sm font-medium outline-none focus:ring-2 focus:ring-primary-fresh">
                       <option>Butere → Kisumu</option>
                       <option>Butere → Nairobi</option>
                       <option>Butere → Kakamega</option>
                    </select>
                 </div>
              </div>
              <div className="pt-3 md:pt-4 border-t border-gray-50 flex items-center justify-between">
                 <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Cost</p>
                 <p className="text-lg md:text-xl font-bold text-primary-dark">KSh 3,250</p>
              </div>
              <p className="text-[8px] md:text-[9px] text-gray-400 italic">Includes insurance and fees.</p>
           </Card>
        </div>
      </div>
    </div>
  );
}
