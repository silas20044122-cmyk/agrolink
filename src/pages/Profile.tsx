import { useState } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Phone, Mail, Camera, Shield, Bell, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { cn } from '@/src/lib/utils';

export default function Profile({ user, onLogout }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Silas Kiprop',
    email: user?.email || 'silas@example.com',
    phone: '+254 712 345 678',
    region: user?.region || 'Kakamega',
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, update user in database
  };

  const sections = [
    { 
      title: 'Farm Metadata', 
      items: [
        { label: 'Primary Language', value: 'English / Swahili' },
        { label: 'Experience', value: '8 Years' },
        { label: 'Farm Membership', value: 'Western Farmers Assoc.' },
      ]
    },
    { 
      title: 'Security & Access', 
      items: [
        { label: 'Two-Factor Auth', value: 'Enabled', active: true },
        { label: 'Regional GPS', value: 'Calibrated', active: true },
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 lg:pb-8">
      {/* Header Profile Card */}
      <Card className="p-6 md:p-10 mb-8 md:mb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fresh/5 rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-inner flex items-center justify-center text-4xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary-fresh text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-dark">
                {user?.name || 'Unregistered Farmer'}
              </h2>
              <Badge variant="success" className="text-[10px] uppercase font-black tracking-widest px-3">Verified Farmer</Badge>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-fresh" /> {user?.region || 'Kenya'}</div>
              <div className="flex items-center gap-1.5"><Shield size={14} className="text-primary-fresh" /> Elite Tier</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-primary-fresh" /> 14 Successful Harvests</div>
            </div>
          </div>

          <Button 
            variant={isEditing ? "primary" : "outline"} 
            className="rounded-2xl h-12 px-6 font-bold"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Main Settings */}
        <div className="md:col-span-7 space-y-8">
           <div className="space-y-6">
              <h3 className="text-lg font-bold px-1">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  value={formData.name} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={cn(!isEditing && "bg-transparent border-none px-0 shadow-none")}
                />
                <Input 
                  label="Email Address" 
                  value={formData.email} 
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={cn(!isEditing && "bg-transparent border-none px-0 shadow-none")}
                />
                <Input 
                  label="Phone Number" 
                  value={formData.phone} 
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={cn(!isEditing && "bg-transparent border-none px-0 shadow-none")}
                />
                <Input 
                  label="Farm Region" 
                  value={formData.region} 
                  disabled={!isEditing}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className={cn(!isEditing && "bg-transparent border-none px-0 shadow-none")}
                />
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-lg font-bold px-1">Notifications</h3>
              {[
                { id: 'weather', label: 'Weather Alerts', desc: 'Real-time severe weather warnings' },
                { id: 'pest', label: 'Pest Outbreaks', desc: 'Regional reports from other scanners' },
                { id: 'market', label: 'Market Dips', desc: 'Notify when prices fluctuate > 5%' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                   <div className="space-y-0.5">
                     <p className="text-sm font-bold text-gray-900">{item.label}</p>
                     <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                   </div>
                   <div className="w-10 h-6 bg-primary-fresh rounded-full p-1 flex justify-end">
                      <div className="w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Settings */}
        <div className="md:col-span-5 space-y-8">
           {sections.map((section, idx) => (
             <div key={idx} className="space-y-4">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                 {section.title}
               </h3>
               <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                 {section.items.map((item, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "p-4 flex items-center justify-between",
                      i !== section.items.length - 1 && "border-bottom border-gray-50"
                    )}
                  >
                     <p className="text-xs font-bold text-gray-500">{item.label}</p>
                     <p className={cn(
                       "text-xs font-black uppercase tracking-tight",
                       item.active ? "text-primary-fresh" : "text-gray-900"
                     )}>
                       {item.value}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
           ))}

           <div className="pt-4">
              <Button 
                onClick={onLogout}
                variant="danger" 
                className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 group"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Sign Out of Workspace
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
