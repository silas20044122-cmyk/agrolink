/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyFarms from './pages/MyFarms';
import Scanner from './pages/Scanner';
import AdvisorChat from './pages/AdvisorChat';
import MarketInsights from './pages/MarketInsights';
import Weather from './pages/Weather';
import Logistics from './pages/Logistics';
import Profile from './pages/Profile';
import About from './pages/About';
import Solutions from './pages/Solutions';
import { Badge, Button } from './components/ui/Base';
import { Bell, User, Settings, LogOut, Menu, X, Sprout, BarChart3, Camera, MessageSquare, CloudSun, TrendingUp, Truck, Sparkles, Plus } from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './hooks/useAppData';

type Page = 'landing' | 'auth' | 'overview' | 'farms' | 'scanner' | 'advisor' | 'weather' | 'market' | 'logistics' | 'profile' | 'about' | 'solutions';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && currentPage === 'landing') {
      setCurrentPage('overview');
    }
  }, [user]);

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

  // Auth flow
  if (currentPage === 'landing') return <Landing onStart={() => setCurrentPage('auth')} onSetPage={setCurrentPage as any} />;
  if (currentPage === 'auth') return <Auth onLogin={() => setCurrentPage('overview')} onRegister={() => setCurrentPage('overview')} onBack={() => setCurrentPage('landing')} />;
  if (currentPage === 'about') return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-primary-dark">AgroLink</span>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setCurrentPage('solutions')}>Solutions</Button>
           <Button variant="primary" onClick={() => setCurrentPage('auth')}>Get Started</Button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <About />
      </div>
    </div>
  );
  if (currentPage === 'solutions') return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-primary-dark">AgroLink</span>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setCurrentPage('about')}>About</Button>
           <Button variant="primary" onClick={() => setCurrentPage('auth')}>Get Started</Button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <Solutions />
      </div>
    </div>
  );

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  const menuItems = [
    { id: 'overview', icon: <BarChart3 />, label: 'Dashboard' },
    { id: 'farms', icon: <Sprout />, label: 'My Farms' },
    { id: 'scanner', icon: <Camera />, label: 'AI Scanner' },
    { id: 'advisor', icon: <MessageSquare />, label: 'AI Advisor' },
    { id: 'weather', icon: <CloudSun />, label: 'Weather Intel' },
    { id: 'market', icon: <TrendingUp />, label: 'Market Prices' },
    { id: 'logistics', icon: <Truck />, label: 'Logistics' },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'overview': return <Dashboard user={user} onSetPage={setCurrentPage} onLogout={handleLogout} />;
      case 'farms': return <MyFarms user={user} />;
      case 'scanner': return <Scanner />;
      case 'advisor': return <AdvisorChat />;
      case 'market': return <MarketInsights user={user} />;
      case 'weather': return <Weather />;
      case 'logistics': return <Logistics />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} />;
      default: return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6">
           <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
             <Settings size={48} />
           </div>
           <div className="space-y-2">
             <h3 className="text-2xl font-bold">Coming Soon</h3>
             <p className="text-gray-400 font-medium">The {currentPage} module is being optimized for Kenyan farming conditions.</p>
           </div>
           <Button onClick={() => setCurrentPage('overview')}>Return to Dashboard</Button>
        </div>
      );
    }
  };

  // If page is Landing or Auth, no shell
  const needsShell = !['landing', 'auth'].includes(currentPage);

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col lg:flex-row overflow-hidden">
      {needsShell && (
        <>
          {/* Shared Sidebar - Desktop */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 outline-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="p-6 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-fresh rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-xl font-bold tracking-tight text-primary-dark font-display">AgroLink</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm tracking-tight outline-none",
                    currentPage === item.id 
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
                  onClick={() => setCurrentPage('advisor')} 
                  className="w-full py-1.5 h-auto bg-secondary-ai text-white rounded text-[11px] font-bold"
                >
                  Ask Advisor
                </Button>
              </div>

              <div 
                className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 p-2 -m-2 rounded-xl transition-all"
                onClick={() => setCurrentPage('profile')}
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

          {/* Main Body */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
            <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg outline-none" onClick={() => setIsSidebarOpen(true)}>
                  <Menu size={20} className="text-gray-600" />
                </button>
                <h1 className="text-sm md:text-lg font-bold font-display truncate">Regional Intelligence</h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-amber/10 text-accent-amber rounded-full text-xs font-bold">
                   <span className="w-2 h-2 bg-accent-amber rounded-full animate-pulse" /> Alert: Pests
                 </div>
                 <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell size={18} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
                 <button onClick={() => setCurrentPage('farms')} className="lg:hidden w-8 h-8 rounded-lg bg-primary-fresh text-white flex items-center justify-center">
                    <Plus size={16} />
                 </button>
                 <button 
                  onClick={() => setCurrentPage('farms')}
                  className="hidden lg:flex px-4 py-2 bg-primary-fresh hover:bg-primary-dark text-white rounded-lg text-sm font-bold items-center gap-2 transition-colors"
                >
                   <Plus size={16} /> Add New Farm
                 </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto bg-bg-soft relative no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 shrink-0 z-50 lg:hidden shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] pb-4 md:pb-0">
              {[
                { id: 'overview', icon: <BarChart3 />, label: 'Home' },
                { id: 'farms', icon: <Sprout />, label: 'Farms' },
                { id: 'scanner', icon: <Camera />, label: 'Scan' },
                { id: 'advisor', icon: <MessageSquare />, label: 'Talk' },
                { id: 'market', icon: <TrendingUp />, label: 'Prices' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors",
                    currentPage === item.id ? "text-primary-fresh" : "text-gray-400"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all",
                    currentPage === item.id && "bg-primary-fresh/10"
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </nav>
          </main>
        </>
      )}

      {!needsShell && renderContent()}
      
      {/* Mobile Sidebar Overlay */}
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
}
