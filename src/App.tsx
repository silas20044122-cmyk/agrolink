/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import LandingNavbar from './components/LandingNavbar';
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
import { Bell, User, Settings, LogOut, Menu, X, Sprout, BarChart3, Camera, MessageSquare, CloudSun, TrendingUp, Truck, Sparkles, Plus, Search, Users, Sun, Moon, Laptop } from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './hooks/useAppData';
import { useNotifications } from './contexts/NotificationContext';
import { NotificationPopover } from './components/NotificationPopover';
import GlobalSearch from './components/GlobalSearch';
import FeedbackButton from './components/FeedbackButton';

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
  children?: React.ReactNode,
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
    <FeedbackButton currentPath={location.pathname} />
    <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
      {mainHeader}
      <div className={cn(
        "flex-1 bg-bg-soft relative no-scrollbar",
        location.pathname === '/advisor' ? "overflow-hidden" : "overflow-y-auto"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children || <Outlet />}
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

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('agrolink_selected_theme') as 'light' | 'dark' | 'system') || 'system';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('agrolink_selected_theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    window.dispatchEvent(new Event('theme-changed'));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('agrolink_selected_theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    const root = document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else if (savedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    const syncThemeFromStorage = () => {
      const current = localStorage.getItem('agrolink_selected_theme') as 'light' | 'dark' | 'system' || 'system';
      setTheme(current);
    };
    window.addEventListener('theme-changed', syncThemeFromStorage);
    return () => window.removeEventListener('theme-changed', syncThemeFromStorage);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (location.pathname === '/' || location.pathname === '/auth') {
          navigate('/dashboard');
        }
      } else {
        const publicPaths = ['/', '/auth', '/about', '/solutions'];
        if (!publicPaths.includes(location.pathname)) {
          navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
        }
      }
    }
  }, [user, loading, location.pathname, location.search, navigate]);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error in handleLogout:', err);
    }
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <BarChart3 size={15} />, label: 'Dashboard' },
    { id: 'my-farms', path: '/my-farms', icon: <Sprout size={15} />, label: 'My Farms' },
    { id: 'scanner', path: '/scanner', icon: <Camera size={15} />, label: 'AI Scanner' },
    { id: 'advisor', path: '/advisor', icon: <MessageSquare size={15} />, label: 'AI Advisor' },
    { id: 'community', path: '/community', icon: <Users size={15} />, label: 'Community' },
    { id: 'weather', path: '/weather', icon: <CloudSun size={15} />, label: 'Weather Intel' },
    { id: 'market', path: '/market', icon: <TrendingUp size={15} />, label: 'Market Prices' },
    { id: 'transport', path: '/transport', icon: <Truck size={15} />, label: 'Transport' },
    { id: 'settings', path: '/settings', icon: <Settings size={15} />, label: 'Settings' },
  ];

  const sidebar = (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 outline-none select-none h-screen overflow-hidden",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4 flex items-center justify-between mb-1">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-7 h-7 bg-primary-fresh rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-bold tracking-tight text-primary-dark font-display">AgroLink</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="px-3 mb-2">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all font-semibold text-xs outline-none border border-gray-100/50"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search...</span>
          <div className="flex items-center gap-0.5 p-0.5 bg-white rounded text-[7px] font-black uppercase tracking-wider px-1 border border-gray-100">
            ⌘K
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path);
              setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 font-bold text-xs tracking-tight outline-none cursor-pointer",
              location.pathname === item.path 
                ? "bg-sidebar-active text-primary-dark" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className="w-4.5 opacity-80 flex justify-center shrink-0">{item.icon}</span>
            <span className="capitalize">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 pb-20 lg:pb-3">
        <div 
          className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50/50 p-1.5 rounded-lg transition-all"
          onClick={() => navigate('/profile')}
        >
          <img src={user?.avatarUrl} className="w-7 h-7 rounded-full bg-gray-200 object-cover" />
          <div className="flex-1 overflow-hidden">
            <div className="text-[11px] font-bold truncate">{user?.name}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user?.region}, KE</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }} 
            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
          >
            <LogOut size={13} />
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
        <h1 className="text-sm md:text-lg font-bold font-display truncate">AgroLink Kenya</h1>
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

         {/* Theme Dropdown Toggle */}
         <div className="relative">
           <button 
             className={cn(
               "p-2 hover:bg-gray-100/55 rounded-full transition-colors relative outline-none cursor-pointer flex items-center justify-center",
               isThemeMenuOpen && "bg-gray-100"
             )}
             onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
             title="Switch Theme"
             id="theme-toggle-btn"
           >
             {theme === 'light' && <Sun size={18} className="text-amber-500" />}
             {theme === 'dark' && <Moon size={18} className="text-blue-400" />}
             {theme === 'system' && <Laptop size={18} className="text-gray-500" />}
           </button>

           <AnimatePresence>
             {isThemeMenuOpen && (
               <>
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="fixed inset-0 z-[90]"
                   onClick={() => setIsThemeMenuOpen(false)}
                 />
                 <motion.div
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   transition={{ duration: 0.15 }}
                   className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 shadow-xl rounded-2xl z-[100] p-1.5 overflow-hidden"
                   id="theme-dropdown-menu"
                 >
                   <div className="text-[9px] font-black uppercase text-gray-400 tracking-wider px-2.5 py-1 select-none">
                     Theme Mode
                   </div>
                   {[
                     { id: 'light', label: 'Light', icon: <Sun size={14} className="text-amber-500" /> },
                     { id: 'dark', label: 'Dark', icon: <Moon size={14} className="text-blue-400" /> },
                     { id: 'system', label: 'System', icon: <Laptop size={14} className="text-gray-500" /> }
                   ].map((t) => (
                     <button
                       key={t.id}
                       onClick={() => {
                         changeTheme(t.id as 'light' | 'dark' | 'system');
                         setIsThemeMenuOpen(false);
                       }}
                       className={cn(
                         "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer outline-none select-none",
                         theme === t.id 
                           ? "bg-emerald-50 text-emerald-700" 
                           : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                       )}
                     >
                       {t.icon}
                       <span>{t.label}</span>
                     </button>
                   ))}
                 </motion.div>
               </>
             )}
           </AnimatePresence>
         </div>
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
        <div className="min-h-screen bg-bg-soft flex flex-col">
          <LandingNavbar />
          <div className="flex-1 pt-24 overflow-y-auto">
            <About />
          </div>
        </div>
      } />
      <Route path="/solutions" element={
        <div className="min-h-screen bg-bg-soft flex flex-col">
          <LandingNavbar />
          <div className="flex-1 pt-24 overflow-y-auto">
            <Solutions />
          </div>
        </div>
      } />

      {/* Protected Routes */}
      <Route element={<AppShell sidebar={sidebar} mainHeader={mainHeader} bottomNav={bottomNav} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} user={user} location={location} />}>
        <Route path="/dashboard" element={<Dashboard user={user} onSearchClick={() => setIsSearchOpen(true)} />} />
        <Route path="/my-farms" element={<MyFarms user={user} />} />
        <Route path="/my-farms/:id" element={<FarmDetails user={user} />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/advisor" element={<AdvisorChat user={user} />} />
        <Route path="/community" element={<Community />} />
        <Route path="/market" element={<MarketInsights user={user} />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/transport" element={<Transport user={user} />} />
        <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
