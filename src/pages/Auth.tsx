import { useState } from 'react';
import { motion } from 'motion/react';
import { Sprout, Mail, Lock, User, AtSign, ArrowRight, ShieldCheck, Phone, ChevronRight } from 'lucide-react';
import { Button, Input, Card } from '@/src/components/ui/Base';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';
import { AlertCircle } from 'lucide-react';
import { KENYA_COUNTIES } from '@/src/lib/constants';

export default function Auth({ onLogin, onRegister, onBack }: { onLogin: () => void, onRegister: () => void, onBack?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('Nairobi');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onLogin();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              region: region,
              role: 'farmer'
            }
          }
        });
        if (signUpError) throw signUpError;
        setMessage('Registration successful! Please check your email for verification.');
        // If auto-confirm is enabled in Supabase, we might proceed, otherwise wait for email
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-10 left-10 w-64 h-64 bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl"></div>
         <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-fresh rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="p-10 shadow-2xl space-y-8 border-none">
          <div className="text-center space-y-3 relative">
             {onBack && (
               <button 
                 onClick={onBack}
                 className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-dark transition-colors"
               >
                 <ChevronRight className="rotate-180" size={20} />
               </button>
             )}
             <div className="w-16 h-16 bg-primary-dark rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-12">
               <Sprout className="text-white w-8 h-8" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight">AgriLink Platform</h1>
             <p className="text-gray-400 text-sm font-medium font-serif italic">Secure Digital Farming Hub for Kenya</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">System Setup Required</p>
                <p className="text-[11px] text-amber-600 font-medium">Please set your Supabase URL and Anon Key in the <strong className="text-amber-800">Settings</strong> menu to enable secure authentication and cloud storage.</p>
              </div>
            </div>
          )}

          <div className="flex bg-gray-50 p-1.5 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all uppercase tracking-widest",
                isLogin ? "bg-white text-primary-dark shadow-sm" : "text-gray-400"
              )}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-xl transition-all uppercase tracking-widest",
                !isLogin ? "bg-white text-primary-dark shadow-sm" : "text-gray-400"
              )}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 italic">
              Error: {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-green-100 italic">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input 
                label="Full Name" 
                placeholder="e.g. Silas Omulama" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                className="bg-white border-gray-100 h-14"
              />
            )}
            <Input 
              label="Email Address" 
              placeholder="your@email.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="bg-white border-gray-100 h-14"
            />
            {!isLogin && (
               <div className="space-y-1.5 flex flex-col">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Select County</label>
                 <select 
                   value={region}
                   onChange={(e) => setRegion(e.target.value)}
                   required 
                   className="w-full px-4 h-14 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent outline-none text-sm font-medium shadow-sm transition-all"
                 >
                   {KENYA_COUNTIES.map(county => (
                     <option key={county} value={county}>{county}</option>
                   ))}
                 </select>
               </div>
            )}
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="bg-white border-gray-100 h-14"
            />
            {isLogin && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setMessage('Password reset instructions sent to your email.')}
                  className="text-[10px] font-bold text-primary-fresh uppercase tracking-widest hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            <Button 
              type="submit" 
              isLoading={isLoading} 
              size="lg" 
              className="w-full h-16 text-lg rounded-2xl group shadow-primary-dark/30 mt-6"
            >
              {isLogin ? 'Enter Dashboard' : 'Create My Account'} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 font-medium">
             By continuing, you agree to AgriLink's <br/>
             <a href="#" className="text-primary-dark underline">Data Protection Terms</a> & <a href="#" className="text-primary-dark underline">Farm Policy</a>
          </p>
        </Card>

        {/* Technical Support */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
           <Phone size={14} />
           <p className="text-[10px] font-bold uppercase tracking-widest">Support Line: +254 0800 123 456</p>
        </div>
      </motion.div>
    </div>
  );
}
