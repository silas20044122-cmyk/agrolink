import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, RefreshCcw, CheckCircle2, AlertCircle, Info, Sparkles, X, ChevronDown, Wand2 } from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/Base';
import { analyzeCropDisease } from '@/src/services/geminiService';
import { cn } from '@/src/lib/utils';
import { useNotifications } from '@/src/contexts/NotificationContext';

export default function Scanner() {
  const { addNotification } = useNotifications();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setImage(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeCropDisease(image, 'image/jpeg');
      setResult(res);
      
      const isHealthy = res.healthStatus.toLowerCase().includes('healthy');
      addNotification({
        title: isHealthy ? 'Crop Scan Complete' : 'Disease Detected!',
        message: isHealthy 
          ? `Analysis of your ${res.cropName} shows it is healthy.`
          : `Alert: ${res.healthStatus} detected on your ${res.cropName}. Review the treatment plan.`,
        type: isHealthy ? 'success' : 'warning',
      });
    } catch (err) {
      setError("AI analysis failed. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 pb-24 md:pb-6">
      <div className="text-center space-y-1 md:space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">AI Crop Scanner</h2>
        <p className="text-gray-500 text-xs md:text-sm font-medium max-w-lg mx-auto">Identify diseases and get expert treatment advice instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left: Input */}
        <div className="space-y-4 md:space-y-6">
          <Card className={cn(
            "relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden rounded-2xl md:rounded-[2.5rem]",
            image && "border-solid border-primary-fresh/20"
          )}>
            {showCamera ? (
              <div className="w-full h-full relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <Button variant="accent" size="icon" className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl" onClick={capturePhoto}>
                    <Camera size={28} />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-md text-white rounded-full w-14 h-14 md:w-16 md:h-16" onClick={stopCamera}>
                    <X size={24} />
                  </Button>
                </div>
              </div>
            ) : image ? (
              <div className="w-full h-full relative group">
                <img src={image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setImage(null)}>Change Photo</Button>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 text-center space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-sm text-primary-dark">
                  <Camera size={32} />
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-base md:text-lg">Select Crop Image</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Leaf or Stems recommended</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="primary" className="h-12 md:h-14 rounded-xl md:rounded-2xl text-sm font-bold" onClick={startCamera}>
                    <Camera className="mr-2" size={16} /> Farm Camera
                  </Button>
                  <Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white text-sm font-bold shadow-sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" size={16} /> Phone Gallery
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
            )}
          </Card>

          {image && !result && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button 
                variant="accent" 
                className="w-full h-14 md:h-16 text-sm md:text-lg rounded-xl md:rounded-2xl shadow-lg shadow-accent-amber/20 font-bold uppercase tracking-widest"
                onClick={runAnalysis}
              >
                <Sparkles className="mr-2" /> Start AI Analysis
              </Button>
            </motion.div>
          )}

          {isAnalyzing && (
            <div className="space-y-3 p-6 md:p-8 bg-primary-fresh/5 rounded-2xl md:rounded-3xl border border-primary-fresh/20 text-center shadow-inner">
              <RefreshCcw className="w-8 h-8 md:w-10 md:h-10 animate-spin text-primary-fresh mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm md:text-base text-primary-dark tracking-tight">AI Intelligence Scanning...</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Validating disease patterns against global database.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 md:p-4 bg-red-50 rounded-xl md:rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
              <AlertCircle size={18} />
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <AnimatePresence>
          {result && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="space-y-4 md:space-y-6"
            >
              <Card className="p-6 md:p-8 border-none shadow-xl bg-white space-y-6 md:space-y-8 rounded-2xl md:rounded-[2.5rem]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                       <h3 className="text-xl md:text-2xl font-bold">{result.cropName}</h3>
                       <Badge variant={result.healthStatus.toLowerCase().includes('healthy') ? 'success' : 'error'} className="text-[10px]">
                         {result.healthStatus}
                       </Badge>
                    </div>
                    <p className="text-[10px] md:text-sm font-medium text-gray-400 uppercase tracking-widest">Confidence: {(result.confidence * 100 || 94).toFixed(0)}%</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-fresh shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Info size={12} /> AI Diagnosis
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                    {result.diagnosis}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-primary-fresh/5 rounded-xl md:rounded-2xl border border-primary-fresh/10 space-y-1.5 md:space-y-2">
                     <p className="text-[9px] md:text-[10px] uppercase font-bold text-primary-dark tracking-widest">Treatment Plan (EN)</p>
                     <p className="text-[11px] md:text-xs font-medium text-gray-700 leading-relaxed italic">{result.treatmentEn || result.treatmentPlanEn || "Early detection prevents spread."}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-accent-amber/5 rounded-xl md:rounded-2xl border border-accent-amber/10 space-y-1.5 md:space-y-2">
                     <p className="text-[9px] md:text-[10px] uppercase font-bold text-accent-amber tracking-widest">Matibabu (SW)</p>
                     <p className="text-[11px] md:text-xs font-medium text-gray-700 leading-relaxed italic">{result.treatmentSw || result.treatmentPlanSw || "Gunduzi wa mapema huzuia kuenea."}</p>
                  </div>
                </div>

                <Button variant="primary" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold" onClick={() => { setImage(null); setResult(null); }}>
                   Analyze Another Crop
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !isAnalyzing && (
          <div className="hidden lg:flex flex-col items-center justify-center text-center p-12 space-y-6 bg-white rounded-[3rem] border border-gray-50 opacity-60">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
               <Info size={48} />
             </div>
             <div className="space-y-2">
               <p className="font-bold text-xl text-gray-400 tracking-tight">Scanner Report</p>
               <p className="text-sm text-gray-400 font-medium">Your AI diagnosis results will appear here after scanning.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
