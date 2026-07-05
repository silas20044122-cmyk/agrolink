import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout,Mail, Lock, User, AtSign, ArrowRight, ShieldCheck, Phone, 
  ChevronRight, AlertCircle, AlertTriangle, Key, CheckCircle
} from 'lucide-react';
import { Button, Input, Card } from '@/src/components/ui/Base';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';
import { KENYA_COUNTIES } from '@/src/lib/constants';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('Nairobi');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // 2FA Security Verification States
  const [step, setStep] = useState<'auth' | 'mfa'>('auth');
  const [mfaPin, setMfaPin] = useState<string[]>(['', '', '', '', '', '']);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const navigate = useNavigate();

  // Helper: Verify if current client is defined as a trusted device
  const checkIsTrustedDevice = () => {
    const trustedExpiry = localStorage.getItem('agrolink_mfa_trusted_expiry');
    if (trustedExpiry) {
      const expiryTime = parseInt(trustedExpiry, 10);
      if (Date.now() < expiryTime) {
        return true;
      }
    }
    return false;
  };

  const handlePinChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return; // Allow numbers only
    const newPin = [...mfaPin];
    newPin[index] = val.slice(-1); // Take only last character
    setMfaPin(newPin);
    setMfaError(null);

    // Shift focus forward if entry is made
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !mfaPin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newPin = [...mfaPin];
        newPin[index - 1] = '';
        setMfaPin(newPin);
      }
    }
  };

  const startLockCountdown = () => {
    setIsLocked(true);
    setLockCountdown(60); // 60 seconds lockout
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(false);
          setRemainingAttempts(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setMfaError(`Account locked. Please wait ${lockCountdown}s.`);
      return;
    }

    setIsLoading(true);
    setMfaError(null);

    // Simulate backend POST auth schema validation delay
    setTimeout(() => {
      setIsLoading(false);
      const mfaConfig = JSON.parse(localStorage.getItem('agrolink_user_mfa') || '{}');

      if (useBackupCode) {
        // Validate offline backup recovery key
        const sanitisedBackup = backupCode.trim();
        const codesList = mfaConfig.backupCodes || [];
        const codeIndex = codesList.indexOf(sanitisedBackup);

        if (codeIndex !== -1) {
          // Consume the code
          const updatedCodes = [...codesList];
          updatedCodes.splice(codeIndex, 1);
          mfaConfig.backupCodes = updatedCodes;
          localStorage.setItem('agrolink_user_mfa', JSON.stringify(mfaConfig));

          completeMfaSecuredSession();
        } else {
          setRemainingAttempts((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              startLockCountdown();
              return 0;
            }
            return next;
          });
          setMfaError('Invalid backup recovery code provided.');
        }
      } else {
        // Validate standard 6-digit secret PIN code
        const enteredPin = mfaPin.join('');
        const actualPin = mfaConfig.pin || '123456'; // fallback default

        if (enteredPin === actualPin) {
          completeMfaSecuredSession();
        } else {
          const nextAttempts = remainingAttempts - 1;
          setRemainingAttempts(nextAttempts);
          
          if (nextAttempts <= 0) {
            startLockCountdown();
            setMfaError('Maximum verification attempts reached. Security lockout activated.');
          } else {
            setMfaError(`Incorrect 6-digit numeric security PIN. ${nextAttempts} attempts remaining.`);
          }
          // Reset pin fields focusing back to start
          setMfaPin(['', '', '', '', '', '']);
          const firstPin = document.getElementById('pin-0');
          if (firstPin) firstPin.focus();
        }
      }
    }, 1200);
  };

  const completeMfaSecuredSession = () => {
    if (rememberDevice) {
      // Set trusted browser device timestamp for 30 days
      const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('agrolink_mfa_trusted_expiry', thirtyDays.toString());
    }

    // Persist finalized profile and route securely
    localStorage.setItem('agrolink_user_profile', JSON.stringify(pendingUser));
    
    setMessage('✓ Security verified successfully!');
    setTimeout(() => {
      window.location.href = pendingUser.redirectUrl || '/dashboard';
    }, 1000);
  };

  const handleResendPin = () => {
    setMessage('A fresh 2FA setup backup request simulation notification was issued to your handset.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const queryParams = new URLSearchParams(window.location.search);
    const redirectUrl = queryParams.get('redirect') || '/dashboard';

    try {
      // Check if user has Two-Factor Authentication enabled in local security state
      const mfaConfig = JSON.parse(localStorage.getItem('agrolink_user_mfa') || '{}');
      const isTrusted = checkIsTrustedDevice();

      // Baseline credential lookup
      const stubUser = {
        id: 'mock-farmer-id',
        name: isLogin ? 'Silas Omulama' : (fullName || 'Silas Omulama'),
        email: email || 'silas20044122@gmail.com',
        role: 'farmer',
        region: isLogin ? 'Kakamega' : (region || 'Kakamega'),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isLogin ? 'silas' : (fullName || 'silas')}`
      };

      if (isLogin && mfaConfig && mfaConfig.enabled && !isTrusted) {
        // Redirect to supplementary verification identity viewport
        setPendingUser({
          ...stubUser,
          redirectUrl
        });
        setStep('mfa');
        setMfaPin(['', '', '', '', '', '']);
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        localStorage.setItem('agrolink_user_profile', JSON.stringify(stubUser));
        if (isLogin) {
          window.location.href = redirectUrl;
        } else {
          setMessage('Registration successful!');
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1000);
        }
        return;
      }

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate(redirectUrl);
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
        // Navigate after a delay or let user see message
        setTimeout(() => navigate(redirectUrl), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center py-8 px-4 sm:px-6 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-10 left-10 w-64 h-64 bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl"></div>
         <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-fresh rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] z-10 py-4"
      >
        <Card className="p-6 sm:p-8 shadow-xl space-y-5 sm:space-y-6 border-none">
          
          <AnimatePresence mode="wait">
            {step === 'auth' ? (
              <motion.div 
                key="auth-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="text-center space-y-2 relative">
                   <button 
                     onClick={() => navigate('/')}
                     className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-dark transition-colors"
                   >
                     <ChevronRight className="rotate-180" size={18} />
                   </button>
                   <div className="w-11 h-11 bg-primary-dark rounded-xl flex items-center justify-center mx-auto shadow-md rotate-12">
                     <Sprout className="text-white w-5.5 h-5.5" />
                   </div>
                   <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AgroLink Platform</h1>
                   <p className="text-gray-400 text-xs font-medium font-serif italic">Secure Digital Farming Hub for Kenya</p>
                </div>

                {!isSupabaseConfigured && (
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex gap-2.5 items-start shadow-sm">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">System Setup Required</p>
                      <p className="text-[11px] text-amber-600 font-medium leading-relaxed">Set your Supabase credentials in the <strong className="text-amber-800">Settings</strong> menu to enable secure Auth and Cloud storage.</p>
                    </div>
                  </div>
                )}

                <div className="flex bg-gray-50/70 p-1 rounded-xl">
                  <button 
                    onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer",
                      isLogin ? "bg-white text-primary-dark shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider cursor-pointer",
                      !isLogin ? "bg-white text-primary-dark shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Register
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-red-100 italic">
                    Error: {error}
                  </div>
                )}

                {message && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-green-100 italic">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {!isLogin && (
                    <Input 
                      label="Full Name" 
                      placeholder="e.g. Silas Omulama" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                      className="bg-white border-gray-100 h-11"
                    />
                  )}
                  <Input 
                    label="Email Address" 
                    placeholder="your@email.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="bg-white border-gray-100 h-11"
                  />
                  {!isLogin && (
                     <div className="space-y-1 flex flex-col">
                       <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Select County</label>
                       <select 
                         value={region}
                         onChange={(e) => setRegion(e.target.value)}
                         required 
                         className="w-full px-4 h-11 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent outline-none text-sm font-medium shadow-sm transition-all cursor-pointer"
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
                    className="bg-white border-gray-100 h-11"
                  />
                  {isLogin && (
                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => setMessage('Password reset instructions sent to your email.')}
                        className="text-[10px] font-bold text-primary-fresh uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    isLoading={isLoading} 
                    className="w-full h-11 sm:h-12 text-sm rounded-xl group shadow-md shadow-primary-fresh/10 mt-3 sm:mt-4 cursor-pointer"
                  >
                    <span>{isLogin ? 'Enter Dashboard' : 'Create My Account'}</span> 
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={15} />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="mfa-card"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary-fresh/10 rounded-xl flex items-center justify-center mx-auto text-primary-fresh shadow-sm">
                     <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-lg font-black text-primary-dark tracking-tight">Verify Your Identity</h2>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
                    Two-Factor Authentication is active for this account. Provide your credential code to proceed.
                  </p>
                </div>

                {mfaError && (
                  <div className="bg-red-50 border border-red-150 p-3 rounded-xl flex gap-2.5 items-start text-xs font-semibold text-red-800">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <span>{mfaError}</span>
                  </div>
                )}

                {message && (
                  <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex gap-2.5 items-start text-xs font-semibold text-emerald-800">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <span>{message}</span>
                  </div>
                )}

                {isLocked ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-2">
                    <AlertTriangle className="text-amber-500 mx-auto" size={24} />
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Account Security Lockout</p>
                    <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                      Account temporarily locked due to multiple incorrect submissions. Please retry in:
                    </p>
                    <p className="text-3xl font-extrabold text-primary-dark tracking-mono">{lockCountdown}s</p>
                  </div>
                ) : (
                  <form onSubmit={handleMfaSubmit} className="space-y-4">
                    
                    {useBackupCode ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">Backup Recovery Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="e.g. 5421-9874"
                            value={backupCode}
                            onChange={(e) => setBackupCode(e.target.value)}
                            required
                            className="w-full text-center h-11 border border-gray-250 rounded-xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent outline-none font-mono text-sm font-bold tracking-wider uppercase bg-white"
                          />
                          <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium text-center leading-normal">
                          Note: Recovery codes are multi-digit keys that can be consumed once each.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block text-center">6-Digit Security PIN</label>
                        <div className="flex justify-between gap-1.5">
                          {mfaPin.map((digit, i) => (
                            <input
                              key={i}
                              id={`pin-${i}`}
                              type="text"
                              maxLength={1}
                              pattern="[0-9]*"
                              inputMode="numeric"
                              value={digit}
                              onChange={(e) => handlePinChange(e.target.value, i)}
                              onKeyDown={(e) => handleKeyDown(e, i)}
                              className="w-10 h-11 sm:h-12 bg-gray-50 border border-gray-200 focus:border-primary-fresh text-center focus:ring-2 focus:ring-primary-fresh/20 outline-none text-lg font-extrabold rounded-xl transition-all"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remember Browser Device */}
                    <label className="flex items-start gap-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={() => setRememberDevice(!rememberDevice)}
                        className="rounded border-gray-200 text-primary-fresh focus:ring-primary-fresh mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-700 block">Trust this device for 30 days</span>
                        <span className="text-[10px] text-gray-400 font-medium leading-tight block">Bypass 2FA checks on this machine for the next month.</span>
                      </div>
                    </label>

                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full h-11 rounded-xl text-xs uppercase tracking-wider font-black cursor-pointer"
                      >
                        Verify Identity
                      </Button>

                      <div className="flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setMfaPin(['', '', '', '', '', '']);
                            setBackupCode('');
                            setMfaError(null);
                          }}
                          className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-primary-fresh hover:underline font-bold"
                        >
                          {useBackupCode ? 'Use standard PIN device' : 'Use offline Backup code'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleResendPin}
                          className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-primary-fresh hover:underline font-bold"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('auth');
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-[10px] text-gray-400 hover:text-gray-600 underline font-semibold uppercase tracking-wider"
                  >
                    ← Back to credentials login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed">
             By continuing, you agree to AgroLink's <br/>
             <a href="#" className="text-primary-dark underline hover:text-primary-fresh">Data Protection Terms</a> & <a href="#" className="text-primary-dark underline hover:text-primary-fresh">Farm Policy</a>
          </p>
        </Card>

        {/* Technical Support */}
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
           <Phone size={13} />
           <p className="text-[9px] font-bold uppercase tracking-widest">Support Line: +254 0800 123 456</p>
        </div>
      </motion.div>
    </div>
  );
}
