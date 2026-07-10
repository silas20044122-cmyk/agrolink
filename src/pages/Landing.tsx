import { motion } from 'motion/react';
import { 
  Camera, 
  MessageSquare, 
  CloudSun, 
  TrendingUp, 
  ShieldCheck, 
  Globe2, 
  MapPin,
  ChevronRight,
  Sprout,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Base';
import LandingNavbar from '@/src/components/LandingNavbar';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-fresh/10 rounded-full text-primary-dark font-bold text-xs uppercase tracking-widest">
              <Globe2 size={16} /> Now Live across East Africa
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] text-gray-900 tracking-tight">
              Digitizing <span className="text-primary-fresh italic font-serif">Agriculture</span> with Artificial Intelligence.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              AgroLink empowers smallholder farmers in Kenya with AI-driven crop monitoring, disease detection, and real-time market insights. Grow smarter, sell better.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="h-14 px-8 text-base rounded-2xl group relative overflow-hidden shadow-xl shadow-primary-fresh/20 hover:shadow-primary-fresh/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/0 via-white/10 to-primary-dark/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-base rounded-2xl bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-primary-fresh/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                View Demo Video
              </Button>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-8 pt-8">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-primary-dark">50k+</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Farmers Active</p>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-primary-dark">98%</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Accuracy</p>
              </div>
              <div className="h-10 w-[1px] bg-gray-200"></div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-primary-dark">20+</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Regions Supported</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="/images/landing_hero_graphic.jpg" 
                alt="AgroLink Digital Agriculture"
                className="w-full h-auto aspect-[4/5] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent flex flex-col justify-end p-8 text-white">
                <p className="text-xl font-serif italic">"AgroLink saved my maize crop this season with its disease scanner."</p>
                <p className="mt-2 text-sm font-bold">— Mary W., Kakamega County</p>
              </div>
            </div>
            
            {/* Floatings */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-10 -right-10 bg-white p-5 rounded-3xl shadow-xl z-20 border border-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-fresh/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="text-primary-fresh" size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Price</p>
                  <p className="text-lg font-bold text-gray-800">Maize +12%</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
              className="absolute top-1/2 -left-20 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl z-20 border border-white"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-red-500">PEST ALERT</p>
                </div>
                <p className="text-sm font-medium text-gray-800">Armyworm detected in Butere</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Total Agricultural Intelligence</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base">One platform to monitor your farm, predict risks, and connect with profitable markets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Camera />, title: "Disease AI Scanner", desc: "Upload a photo of any crop leaf and get instant diagnosis and treatment plans." },
              { icon: <MessageSquare />, title: "Smart Advisor", desc: "24/7 agricultural expert available in English & Swahili to answer any farming question." },
              { icon: <CloudSun />, title: "Weather Intel", desc: "Hyper-local weather forecasts and irrigation alerts tailored to your farm location." },
              { icon: <TrendingUp />, title: "Market Hub", desc: "Real-time price tracking across Kenya's major markets to ensure better selling prices." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2rem] bg-bg-soft hover:bg-primary-fresh/5 transition-all border border-transparent hover:border-primary-fresh/20"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary-dark mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-fresh opacity-10 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          <Sprout className="w-14 h-14 mx-auto text-primary-fresh" />
          <h2 className="text-4xl md:text-5xl font-serif italic leading-tight">"Revolutionizing how Africa feeds itself, one farmer at a time."</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary-fresh p-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Officer" className="rounded-full" />
            </div>
            <div className="text-left">
              <p className="font-bold">David Juma</p>
              <p className="text-primary-fresh text-sm font-medium">Agricultural Officer, Butere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary-fresh/10 p-10 rounded-[3.5rem] border border-primary-fresh/20">
          <h2 className="text-3xl font-bold">Ready to grow your productivity?</h2>
          <p className="text-gray-600 text-base">Join thousands of Kenyan farmers using AgroLink today. It's free to start.</p>
          <Button onClick={() => navigate('/auth')} size="lg" className="h-14 px-10 text-base rounded-2xl">Create Your Farmer Account</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-dark rounded-lg flex items-center justify-center">
              <Sprout className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-primary-dark">AgroLink</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 AgroLink AG. Built for Africa. Distributed by Butere Technical Training Institute.</p>
          <div className="flex gap-6 text-gray-400">
             <a href="#" className="hover:text-primary-dark text-xs uppercase font-bold tracking-widest">Privacy</a>
             <a href="#" className="hover:text-primary-dark text-xs uppercase font-bold tracking-widest">Terms</a>
             <a href="#" className="hover:text-primary-dark text-xs uppercase font-bold tracking-widest">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
