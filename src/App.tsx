/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './app/dashboard/page';
import MyFarms from './app/my-farms/page';
import FarmDetails from './app/my-farms/[id]/page';
import Scanner from './app/scanner/page';
import AdvisorChat from './app/advisor/page';
import Community from './app/community/page';
import MarketInsights from './app/market/page';
import Weather from './app/weather/page';
import Transport from './app/transport/page';
import Profile from './app/profile/page';
import SettingsPage from './app/settings/page';
import About from './pages/About';
import Solutions from './pages/Solutions';
import { Badge, Button } from './components/ui/Base';
import { Bell, User, Settings, LogOut, Menu, X, Sprout, BarChart3, Camera, MessageSquare, CloudSun, TrendingUp, Truck, Sparkles, Plus, Search, Users } from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './hooks/useAppData';
import { useNotifications } from './contexts/NotificationContext';
import { NotificationPopover } from './components/NotificationPopover';
import GlobalSearch from './components/GlobalSearch';

// Move AppShell outside to maintain stable component identity
const AppShell = ({ 
  children, 
  sidebar, 
  mainHeader, 
  bottomNav, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isSearchOpen, 
  setIsSearchOpen, 
  user,
  location
}: { 
  children: React.ReactNode,
  sidebar: React.ReactNode,
  mainHeader: React.ReactNode,
  bottomNav: React.ReactNode,
  isSidebarOpen: boolean,
  setIsSidebarOpen: (open: boolean) => void,
  isSearchOpen: boolean,
  setIsSearchOpen: (open: boolean) => void,
  user: any,
  location: any
}) => (
  <div className="min-h-screen bg-bg-soft flex flex-col lg:flex-row overflow-hidden">
    {sidebar}
    <GlobalSearch 
      isOpen={isSearchOpen} 
      onClose={() => setIsSearchOpen(false)} 
      userId={user?.id}
    />
    <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
      {mainHeader}
      <div className="flex-1 overflow-y-auto bg-bg-soft relative no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      {bottomNav}
    </main>
    {isSidebarOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}
  </div>
);

export default function App() {
  const { user, loading, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [user, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center space-y-6">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-primary-dark rounded-[2rem] flex items-center justify-center shadow-2xl"
        >
          <Sprout className="text-white w-10 h-10" />
        </motion.div>
        <div className="space-y-2 text-center">
          <p className="text-2xl font-bold font-display text-primary-dark tracking-tight">AgroLink Platform</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Farm Intelligence...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <BarChart3 />, label: 'Dashboard' },
    { id: 'my-farms', path: '/my-farms', icon: <Sprout />, label: 'My Farms' },
    { id: 'scanner', path: '/scanner', icon: <Camera />, label: 'AI Scanner' },
    { id: 'advisor', path: '/advisor', icon: <MessageSquare />, label: 'AI Advisor' },
    { id: 'community', path: '/community', icon: <Users />, label: 'Community' },
    { id: 'weather', path: '/weather', icon: <CloudSun />, label: 'Weather Intel' },
    { id: 'market', path: '/market', icon: <TrendingUp />, label: 'Market Prices' },
    { id: 'transport', path: '/transport', icon: <Truck />, label: 'Transport' },
    { id: 'settings', path: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  const sidebar = (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 outline-none",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between mb-4">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-8 h-8 bg-primary-fresh rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary-dark font-display">AgroLink</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all font-semibold text-sm outline-none border border-gray-100/50"
        >
          <Search size={16} />
          <span className="flex-1 text-left">Search...</span>
          <div className="flex items-center gap-1 p-1 bg-white rounded-md text-[8px] font-black uppercase tracking-widest px-1.5 border border-gray-100">
            ⌘ K
          </div>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path);
              setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm tracking-tight outline-none",
              location.pathname === item.path 
                ? "bg-sidebar-active text-primary-dark" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <span className="w-5 opacity-70 flex justify-center">{item.icon}</span>
            <span className="capitalize">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 pb-20 lg:pb-4">
        <div className="bg-secondary-ai/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-secondary-ai text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> AI Assistant
          </div>
          <p className="text-[11px] text-secondary-ai leading-tight mb-2 italic">
            "Rain expected in 48h. Prepare drainage for Maize sector."
          </p>
          <Button 
            onClick={() => navigate('/advisor')} 
            className="w-full py-1.5 h-auto bg-secondary-ai text-white rounded text-[11px] font-bold"
          >
            Ask Advisor
          </Button>
        </div>

        <div 
          className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 p-2 -m-2 rounded-xl transition-all"
          onClick={() => navigate('/profile')}
        >
          <img src={user?.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.region}, KE</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }} 
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  const mainHeader = (
    <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg outline-none" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={20} className="text-gray-600" />
        </button>
        <h1 className="text-sm md:text-lg font-bold font-display truncate">Regional Intelligence</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 relative">
         <button 
           className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 outline-none"
           onClick={() => setIsSearchOpen(true)}
         >
           <Search size={18} />
         </button>
         <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-amber/10 text-accent-amber rounded-full text-xs font-bold">
           <span className="w-2 h-2 bg-accent-amber rounded-full animate-pulse" /> Alert: Pests
         </div>
         <button 
           className={cn(
             "p-2 hover:bg-gray-100 rounded-full transition-colors relative outline-none",
             isNotificationsOpen && "bg-gray-100"
           )}
           onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
         >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
         </button>
         
         <AnimatePresence>
           {isNotificationsOpen && (
             <>
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[90]"
                 onClick={() => setIsNotificationsOpen(false)}
               />
               <NotificationPopover 
                 notifications={notifications}
                 onMarkAsRead={markAsRead}
                 onMarkAllAsRead={markAllAsRead}
                 onDelete={deleteNotification}
                 onClose={() => setIsNotificationsOpen(false)}
               />
             </>
           )}
         </AnimatePresence>

         <button onClick={() => navigate('/my-farms')} className="lg:hidden w-8 h-8 rounded-lg bg-primary-fresh text-white flex items-center justify-center">
            <Plus size={16} />
         </button>
         <button 
          onClick={() => navigate('/my-farms')}
          className="hidden lg:flex px-4 py-2 bg-primary-fresh hover:bg-primary-dark text-white rounded-lg text-sm font-bold items-center gap-2 transition-colors"
        >
           <Plus size={16} /> Add New Farm
         </button>
      </div>
    </header>
  );

  const bottomNav = (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 shrink-0 z-50 lg:hidden shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] pb-4 md:pb-0">
      {[
        { path: '/dashboard', icon: <BarChart3 />, label: 'Home' },
        { path: '/my-farms', icon: <Sprout />, label: 'Farms' },
        { path: '/community', icon: <Users />, label: 'Group' },
        { path: '/advisor', icon: <MessageSquare />, label: 'Talk' },
        { path: '/scanner', icon: <Camera />, label: 'Scan' },
      ].map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors",
            location.pathname === item.path ? "text-primary-fresh" : "text-gray-400"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-xl transition-all",
            location.pathname === item.path && "bg-primary-fresh/10"
          )}>
            {item.icon}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );


  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/about" element={
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-50">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
                <Sprout className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-primary-dark">AgroLink</span>
            </Link>
            <div className="flex gap-4">
               <Button variant="outline" onClick={() => navigate('/solutions')}>Solutions</Button>
               <Button variant="primary" onClick={() => navigate('/auth')}>Get Started</Button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <About />
          </div>
        </div>
      } />
      <Route path="/solutions" element={
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-50">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
                <Sprout className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-primary-dark">AgroLink</span>
            </Link>
            <div className="flex gap-4">
               <Button variant="outline" onClick={() => navigate('/about')}>About</Button>
               <Button variant="primary" onClick={() => navigate('/auth')}>Get Started</Button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <Solutions />
          </div>
        </div>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Dashboard user={user} onSearchClick={() => setIsSearchOpen(true)} /></AppShell>} />
      <Route path="/my-farms" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><MyFarms user={user} /></AppShell>} />
      <Route path="/my-farms/:id" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><FarmDetails user={user} /></AppShell>} />
      <Route path="/scanner" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Scanner /></AppShell>} />
      <Route path="/advisor" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><AdvisorChat user={user} /></AppShell>} />
      <Route path="/community" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Community /></AppShell>} />
      <Route path="/market" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><MarketInsights user={user} /></AppShell>} />
      <Route path="/weather" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Weather /></AppShell>} />
      <Route path="/transport" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Transport user={user} /></AppShell>} />
      <Route path="/profile" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><Profile user={user} onLogout={handleLogout} /></AppShell>} />
      <Route path="/settings" element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location}><SettingsPage /></AppShell>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
