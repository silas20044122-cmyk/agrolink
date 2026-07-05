import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, Phone, Mail, Camera, Shield, Bell, ChevronRight, 
  LogOut, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, FileText, X, Plus
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/src/components/ui/Base';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAppData';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ user: propUser, onLogout }: any) {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar } = useAuth();
  
  // Use the synchronized hook state as primary, falling back to propUser if not yet loaded
  const currentUser = user || propUser;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    bio: '',
  });

  // Keep form fields synced with the reactive user state
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '+254 712 345 678',
        region: currentUser.region || 'Kakamega',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  // Upload state indicators
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile save state indicators
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form field-specific errors for live feedback
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (formData.phone.trim()) {
      // General match for +254..., 07..., 01...
      const cleanPhone = formData.phone.trim().replace(/\s+/g, '');
      if (cleanPhone.length < 9) {
        errors.phone = 'Phone number is too short.';
      }
    }

    if (!formData.region.trim()) {
      errors.region = 'Farming region/location is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveError('Please review and correct the errors below.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        region: formData.region.trim(),
        bio: formData.bio.trim(),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      // Auto-clear success banner
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to persist profile updates to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '+254 712 345 678',
        region: currentUser.region || 'Kakamega',
        bio: currentUser.bio || '',
      });
    }
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(false);
  };

  // Profile Picture Upload Handler
  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await uploadAvatar(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input to allow duplicate file uploads
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800 text-sm font-semibold"
          >
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span>Profile information updated successfully in database!</span>
          </motion.div>
        )}

        {saveError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800 text-sm font-semibold"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0" />
              <span>{saveError}</span>
            </div>
            <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {uploadError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800 text-sm font-semibold"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0" />
              <span>Photo Upload Error: {uploadError}</span>
            </div>
            <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-12 relative z-10">
        {/* Profile Picture Zone */}
        <div 
          className="relative group cursor-pointer"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            "w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] overflow-hidden shadow-md flex items-center justify-center text-4xl border-4 transition-all duration-300 relative bg-gray-50",
            dragActive ? "border-primary-fresh bg-primary-fresh/5 scale-105" : "border-white hover:border-primary-fresh/30"
          )}>
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover select-none" 
              />
            ) : (
              <User size={52} className="text-gray-300 select-none" />
            )}

            {/* Overlays / States */}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-[10px] uppercase font-black tracking-widest gap-2">
                <RefreshCw size={24} className="animate-spin text-primary-fresh" />
                <span>Uploading...</span>
              </div>
            )}

            {dragActive && !uploading && (
              <div className="absolute inset-0 bg-primary-fresh/95 flex flex-col items-center justify-center text-white text-xs font-black uppercase tracking-wider text-center p-2">
                <Plus size={24} className="animate-bounce" />
                <span>Drop Image</span>
              </div>
            )}

            {/* Hover overlay for user convenience */}
            {!uploading && !dragActive && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] uppercase font-bold tracking-wider">
                <Camera size={18} className="mb-1" />
                <span>Change Photo</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            className="absolute -bottom-1 -right-1 p-3 bg-primary-fresh text-white rounded-2xl shadow-xl hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Camera size={18} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-dark">
              {currentUser?.name || 'Farmer Profile'}
            </h2>
            <Badge variant="success" className="text-[10px] uppercase font-black tracking-widest px-3">Verified</Badge>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><MapPin size={14} className="text-primary-fresh" /> {currentUser?.region || 'Kenya'}</div>
            <div className="flex items-center gap-1.5"><Shield size={14} className="text-primary-fresh" /> Elite Tier</div>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="rounded-2xl h-12 px-5 font-bold border-gray-200 text-gray-500"
                onClick={handleDiscard}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2"
                onClick={handleSave}
                isLoading={saving}
              >
                Save
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="rounded-2xl h-12 px-6 font-bold border-gray-200 hover:border-primary-fresh text-primary-dark hover:text-primary-fresh"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Form Column */}
        <div className="md:col-span-7 space-y-8">
           <Card className="p-8 space-y-6 bg-white border-gray-100 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-lg font-bold text-primary-dark">Personal Information</h3>
                {isEditing && (
                  <span className="text-[10px] text-primary-fresh font-black uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} className="animate-pulse" /> Editing Mode
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <Input 
                  label="Full Name" 
                  value={formData.name} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  error={fieldErrors.name}
                  placeholder="Enter full name"
                  className={cn(isEditing ? "bg-white" : "bg-gray-50")}
                />
                
                <Input 
                  label="Email Address" 
                  value={formData.email} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  error={fieldErrors.email}
                  placeholder="Enter email address"
                  className={cn(isEditing ? "bg-white" : "bg-gray-50")}
                />
                
                <Input 
                  label="Phone Number" 
                  value={formData.phone} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  error={fieldErrors.phone}
                  placeholder="e.g. +254 712 345 678"
                  className={cn(isEditing ? "bg-white" : "bg-gray-50")}
                />

                <Input 
                  label="Region / County" 
                  value={formData.region} 
                  disabled={!isEditing} 
                  onChange={(e) => setFormData({...formData, region: e.target.value})} 
                  error={fieldErrors.region}
                  placeholder="e.g. Kakamega, Eldoret"
                  className={cn(isEditing ? "bg-white" : "bg-gray-50")}
                />

                {/* Custom Bio Textarea */}
                <div className="w-full space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                    Farmer Biography / Description
                  </label>
                  <textarea
                    value={formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about your farm, experience, crops, or agricultural interests..."
                    maxLength={250}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent transition-all outline-none text-sm resize-none",
                      isEditing ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 text-gray-500"
                    )}
                  />
                  <div className="flex justify-between items-center px-1 text-[10px] text-gray-400 font-semibold uppercase">
                    <span>Max 250 characters</span>
                    <span>{formData.bio.length}/250</span>
                  </div>
                </div>
              </div>
           </Card>
        </div>

        {/* Controls / Info Column */}
        <div className="md:col-span-5 space-y-8">
           <Card className="p-8 space-y-6 bg-primary-dark text-white border-none rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fresh/10 rounded-full blur-2xl -mr-8 -mt-8" />
              
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/50">App Controls</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Manage your global settings, account security preferences, notification alerts, or log out of your session.
                </p>
              </div>

              <div className="space-y-4 relative z-10">
                 <Button 
                   variant="outline" 
                   className="w-full justify-between h-12 rounded-xl text-white border-white/20 hover:bg-white/10" 
                   onClick={() => navigate('/settings')}
                 >
                    <span className="flex items-center gap-2"><Bell size={16} /> Preferences & Safety</span> 
                    <ChevronRight size={16} />
                 </Button>

                 <Button 
                   onClick={onLogout} 
                   variant="danger" 
                   className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95"
                 >
                    <LogOut size={18} /> Sign Out
                 </Button>
              </div>
           </Card>

           <Card className="p-8 space-y-4 bg-white border-gray-100 rounded-[2rem] shadow-sm">
             <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 rounded-xl bg-primary-fresh/10 flex items-center justify-center text-primary-fresh">
                 <Shield size={16} />
               </div>
               <h4 className="text-sm font-bold text-primary-dark">Account Security Audit</h4>
             </div>
             <p className="text-xs text-gray-400 leading-relaxed">
               Your account is securely verified. High-reputation accounts have priority listings in the transport and community boards.
             </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
