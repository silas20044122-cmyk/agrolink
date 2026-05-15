import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Shield, User, Globe, Moon, Sun, Save, ChevronRight, Smartphone, RefreshCw, Key } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/src/components/ui/Base';
import { useAuth } from '@/src/hooks/useAppData';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    harvest: true,
    market: true,
    weather: true
  });

  const sections = [
    { id: 'profile', label: 'Security & Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
    { id: 'app', label: 'App Settings', icon: <Smartphone size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-fresh/10 rounded-xl flex items-center justify-center text-primary-fresh">
            <SettingsIcon size={24} />
          </div>
          Settings & Configuration
        </h2>
        <p className="text-gray-400 font-medium max-w-2xl">Manage your account preferences, security levels, and notification triggers to optimize your farm monitoring experience.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
                activeTab === section.id 
                ? 'bg-white text-primary-fresh shadow-sm border border-gray-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                {section.label}
              </div>
              <ChevronRight size={16} className={activeTab === section.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <Card className="p-8 md:p-10 bg-white border-none shadow-sm rounded-[2.5rem] min-h-[500px]">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-gray-50">
                  <div className="relative group">
                    <img src={user?.avatarUrl} className="w-24 h-24 rounded-3xl bg-gray-100 object-cover shadow-inner" />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-fresh text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark">{user?.name}</h3>
                    <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
                    <Badge variant="info" className="mt-2">Verified Farmer</Badge>
                  </div>
                  <Button variant="outline" className="md:ml-auto rounded-xl">Edit Profile</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                       <Key size={18} className="text-primary-fresh" /> Security
                    </h4>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-between h-12 rounded-xl group">
                         <span>Two-Factor Authentication</span>
                         <Badge variant="default" className="bg-red-50 text-red-500">Disabled</Badge>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 rounded-xl">Change Password</Button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                       <Globe size={18} className="text-primary-fresh" /> Regional
                    </h4>
                    <div className="space-y-4">
                       <Input label="Language" defaultValue="English" readOnly />
                       <Input label="Currency" defaultValue="KES (Kenya Shilling)" readOnly />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-dark">Notification Channels</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'push', label: 'Push Notifications', desc: 'Receive real-time alerts on your mobile device.', icon: <Smartphone /> },
                      { id: 'email', label: 'Email Reports', desc: 'Detailed weekly summaries and harvest forecasts.', icon: <Globe /> },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
                             {item.icon}
                           </div>
                           <div className="space-y-0.5">
                             <p className="text-sm font-bold text-primary-dark">{item.label}</p>
                             <p className="text-[11px] text-gray-400 font-medium">{item.desc}</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notifications[item.id as keyof typeof notifications]}
                            onChange={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-fresh"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-dark">Alert Triggers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'harvest', label: 'Harvest Readiness' },
                      { id: 'market', label: 'Market Price Spikes' },
                      { id: 'weather', label: 'Severe Weather Intel' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                         <span className="text-sm font-bold text-gray-600">{item.label}</span>
                         <input 
                          type="checkbox" 
                          checked={notifications[item.id as keyof typeof notifications]}
                          onChange={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                          className="w-4 h-4 text-primary-fresh rounded focus:ring-primary-fresh"
                         />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pt-10 flex items-center justify-end border-t border-gray-50 mt-10">
              <Button size="lg" className="h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary-fresh/20 gap-2">
                <Save size={18} />
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
