import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, ChevronDown, Camera, TrendingUp, CloudSun, ArrowUpRight, ChevronRight, Info, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Base';
import { cn } from '@/src/lib/utils';

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync scroll class on mount as well
  useEffect(() => {
    setIsScrolled(window.scrollY > 20);
  }, [location.pathname]);

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const handleFeaturesClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('features');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/85 backdrop-blur-lg border-b border-gray-100/85 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.02)]" 
          : "bg-transparent py-5 border-b border-transparent"
      )}
      id="landing-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Container with hover animation */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-dark to-primary-fresh rounded-xl flex items-center justify-center shadow-md shadow-primary-fresh/20"
          >
            <Sprout className="text-white w-6 h-6" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-black font-display tracking-tight text-primary-dark leading-none">
              AgroLink
            </span>
            <span className="text-[9px] font-bold text-primary-fresh uppercase tracking-widest mt-0.5">
              East Africa
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-gray-600 text-sm tracking-tight">
          <Link 
            to="/#features" 
            onClick={handleFeaturesClick}
            className={cn(
              "relative py-1.5 transition-colors group",
              location.hash === '#features' ? "text-primary-dark" : "hover:text-primary-fresh"
            )}
          >
            Features
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-fresh scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </Link>

          {/* Hover Dropdown for Solutions */}
          <div 
            className="relative"
            onMouseEnter={() => setIsSolutionsOpen(true)}
            onMouseLeave={() => setIsSolutionsOpen(false)}
          >
            <button 
              className={cn(
                "flex items-center gap-1 py-1.5 cursor-pointer transition-colors group outline-none",
                location.pathname.startsWith('/solutions') ? "text-primary-dark font-bold" : "hover:text-primary-fresh"
              )}
            >
              <span>Solutions</span>
              <ChevronDown size={14} className={cn("transition-transform duration-300", isSolutionsOpen && "rotate-180 text-primary-fresh")} />
            </button>
            <AnimatePresence>
              {isSolutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-[460px] bg-white border border-gray-100/90 rounded-[2rem] shadow-[0_20px_50px_rgba(27,94,32,0.1)] p-5 z-50 grid grid-cols-2 gap-3"
                  id="solutions-megamenu"
                >
                  <div className="col-span-2 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2 mb-1 select-none">
                    AgroLink Intelligence Suit
                  </div>
                  
                  <Link 
                    to="/solutions" 
                    className="flex gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary-fresh flex items-center justify-center shrink-0 group-hover/item:bg-primary-fresh group-hover/item:text-white transition-all">
                      <Camera size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 group-hover/item:text-primary-dark transition-colors">AI Diagnostics</h4>
                      <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Crop leaf scanner and immediate solution guides.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/solutions" 
                    className="flex gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary-fresh flex items-center justify-center shrink-0 group-hover/item:bg-primary-fresh group-hover/item:text-white transition-all">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 group-hover/item:text-primary-dark transition-colors">Market Hub</h4>
                      <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Real-time local commodity price indexes.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/solutions" 
                    className="flex gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary-fresh flex items-center justify-center shrink-0 group-hover/item:bg-primary-fresh group-hover/item:text-white transition-all">
                      <CloudSun size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 group-hover/item:text-primary-dark transition-colors">Climate Intel</h4>
                      <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Hyper-local climate advisory and predictions.</p>
                    </div>
                  </Link>

                  <Link 
                    to="/solutions" 
                    className="flex gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary-fresh flex items-center justify-center shrink-0 group-hover/item:bg-primary-fresh group-hover/item:text-white transition-all">
                      <Award size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800 group-hover/item:text-primary-dark transition-colors">Unified Systems</h4>
                      <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Full logistics networks and plot cycle management.</p>
                    </div>
                  </Link>
                  
                  <div className="col-span-2 bg-emerald-50/20 rounded-2xl p-3 flex items-center justify-between text-xs mt-1 border border-emerald-50/40">
                    <span className="text-gray-500 font-medium">Explore standard platform features</span>
                    <Link to="/solutions" className="text-primary-fresh font-bold hover:underline inline-flex items-center gap-0.5">
                      Read Solutions <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link 
            to="/about" 
            className={cn(
              "relative py-1.5 transition-colors group",
              isLinkActive('/about') ? "text-primary-dark font-bold" : "hover:text-primary-fresh"
            )}
          >
            About
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-fresh scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            {isLinkActive('/about') && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-fresh scale-x-100" />
            )}
          </Link>
          
          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/auth')} 
            variant="primary" 
            size="md"
            className="rounded-xl px-5 h-11 bg-primary-fresh text-white font-bold text-sm tracking-tight transition-all duration-300 hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.98] shadow-md shadow-primary-fresh/10 hover:shadow-lg hover:shadow-primary-fresh/20 flex items-center gap-1.5 border-none cursor-pointer"
          >
            <span>Launch Platform</span>
            <ChevronRight size={15} />
          </Button>
        </div>

        {/* Hamburger Icon for Mobile with spring transition */}
        <button 
          className="md:hidden w-10 h-10 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-primary-dark flex items-center justify-center transition-colors cursor-pointer" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile Navigation Drawer with modern layout */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-xl"
            id="mobile-navbar-drawer"
          >
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3.5">
                <Link 
                  to="/#features" 
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleFeaturesClick(e);
                  }}
                  className="flex flex-col gap-1 p-4 bg-gray-50/70 hover:bg-emerald-50/40 rounded-2xl transition-all"
                >
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">01</span>
                  <span className="text-sm font-bold text-gray-800">Features</span>
                </Link>
                <Link 
                  to="/solutions" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col gap-1 p-4 bg-gray-50/70 hover:bg-emerald-50/40 rounded-2xl transition-all"
                >
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">02</span>
                  <span className="text-sm font-bold text-gray-800">Solutions</span>
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col gap-1 p-4 bg-gray-50/70 hover:bg-emerald-50/40 rounded-2xl transition-all"
                >
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">03</span>
                  <span className="text-sm font-bold text-gray-800">About</span>
                </Link>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col gap-1 p-4 bg-emerald-50/30 border border-emerald-100/30 rounded-2xl transition-all"
                >
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">04</span>
                  <span className="text-sm font-bold text-emerald-800">Launch App</span>
                </Link>
              </div>
              
              <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth');
                  }} 
                  variant="primary" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-md shadow-primary-fresh/10 border-none cursor-pointer"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
