import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Sprout, MapPin, Truck, TrendingUp, MessageSquare, ChevronRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFarms, useCrops, useTransport, useMarketData } from '../hooks/useAppData';
import { cn } from '../lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
}

export default function GlobalSearch({ isOpen, onClose, userId }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  const { farms } = useFarms(userId);
  const { crops } = useCrops(userId);
  const { transporters } = useTransport(userId);
  const { marketPrices } = useMarketData('Nairobi');

  // Clear query on close
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // This is handled by parent, but good to have logic here if needed
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return {
      recent: [
        { id: 'advisor', type: 'tool', label: 'AI Farm Advisor', path: '/advisor', icon: <MessageSquare size={16} /> },
        { id: 'transport', type: 'tool', label: 'Book Transport', path: '/transport', icon: <Truck size={16} /> },
        { id: 'market', type: 'tool', label: 'Market Prices', path: '/market', icon: <TrendingUp size={16} /> },
      ],
      hits: []
    };

    const q = query.toLowerCase();
    const hits: any[] = [];

    // Search Farms
    farms.forEach(f => {
      if (f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q)) {
        hits.push({ 
          id: f.id, 
          type: 'farm', 
          label: f.name, 
          sub: f.location, 
          path: `/my-farms/${f.id}`, 
          icon: <MapPin size={16} /> 
        });
      }
    });

    // Search Crops
    crops.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q)) {
        hits.push({ 
          id: c.id, 
          type: 'crop', 
          label: `${c.name} (${c.variety})`, 
          sub: `Farm ID: ${c.farmId}`, 
          path: `/my-farms/${c.farmId}`, 
          icon: <Sprout size={16} /> 
        });
      }
    });

    // Search Transporters
    transporters.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.vehicleType.toLowerCase().includes(q)) {
        hits.push({ 
          id: t.id, 
          type: 'transport', 
          label: t.name, 
          sub: t.vehicleType, 
          path: '/transport', 
          icon: <Truck size={16} /> 
        });
      }
    });

    // Search Market
    marketPrices.forEach(p => {
       if (p.cropName.toLowerCase().includes(q)) {
         hits.push({
           id: p.id,
           type: 'market',
           label: p.cropName,
           sub: `KES ${p.pricePerUnit.toFixed(0)}/${p.unit}`,
           path: '/market',
           icon: <TrendingUp size={16} />
         });
       }
    });

    return { hits, recent: [] };
  }, [query, farms, crops, transporters, marketPrices]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-primary-dark/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <Search className="text-gray-400" size={20} />
          <input 
            autoFocus
            type="text" 
            placeholder="Search anything (farms, crops, market prices...)" 
            className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-primary-dark placeholder:text-gray-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest hidden sm:flex">
            <Command size={10} /> K
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {query.trim() === '' ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Quick Navigation</p>
                <div className="space-y-1">
                  {results.recent.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => handleSelect(res.path)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary-dark group-hover:bg-primary-dark group-hover:text-white transition-colors">
                        {res.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary-dark">{res.label}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.hits.length > 0 ? (
            <div className="space-y-1">
              {results.hits.map((hit) => (
                <button
                  key={hit.id}
                  onClick={() => handleSelect(hit.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                    hit.type === 'farm' ? "bg-green-100 text-green-600" :
                    hit.type === 'crop' ? "bg-primary-dark text-white" :
                    hit.type === 'market' ? "bg-amber-100 text-amber-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {hit.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-primary-dark truncate">{hit.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{hit.sub}</p>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 rounded-lg text-gray-400">
                    {hit.type}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <Search size={48} className="text-gray-100 mx-auto" />
              <p className="text-sm font-medium text-gray-400">No results found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-8">
           <div className="flex gap-4">
              <span className="flex items-center gap-1"><ChevronRight size={10} className="rotate-[90deg]" /> Select</span>
              <span className="flex items-center gap-1"><X size={10} /> Close</span>
           </div>
           <p>AgroLink Search Engine</p>
        </div>
      </motion.div>
    </div>
  );
}
