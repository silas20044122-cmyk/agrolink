import { useState } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Phone, Mail, Camera, Shield, Bell, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAppData';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ user, onLogout }: any) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+254 712 345 678',
    region: user?.region || 'Kakamega',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-12 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-inner flex items-center justify-center text-4xl">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-gray-300" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-primary-fresh text-white rounded-2xl shadow-xl">
            <Camera size={18} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-dark">
              {user?.name || 'Farmer Profile'}
            </h2>
            <Badge variant="success" className="text-[10px] uppercase font-black tracking-widest px-3">Verified</Badge>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-fresh" /> {user?.region || 'Kenya'}</div>
            <div className="flex items-center gap-1.5"><Shield size={14} className="text-primary-fresh" /> Elite Tier</div>
          </div>
        </div>

        <Button 
          variant={isEditing ? "primary" : "outline"} 
          className="rounded-2xl h-12 px-6 font-bold"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-7 space-y-8">
           <Card className="p-8 space-y-6 bg-white border-gray-100 rounded-[2rem]">
              <h3 className="text-lg font-bold">Personal Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <Input label="Full Name" value={formData.name} disabled={!isEditing} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Email Address" value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <Input label="Phone Number" value={formData.phone} disabled={!isEditing} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
           </Card>
        </div>

        <div className="md:col-span-5 space-y-8">
           <Card className="p-8 space-y-6 bg-primary-dark text-white border-none rounded-[2rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/50">App Controls</h3>
              <div className="space-y-4">
                 <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-white border-white/20 hover:bg-white/10" onClick={() => navigate('/settings')}>
                    Settings <ChevronRight size={16} />
                 </Button>
                 <Button onClick={onLogout} variant="danger" className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2">
                    <LogOut size={18} /> Sign Out
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
