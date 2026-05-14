import { motion } from 'motion/react';
import { Sprout, Target, Users, Zap, ShieldCheck, Globe, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';

export default function About() {
  const features = [
    { icon: <BarChart3 size={24} />, title: 'Farm Management', desc: 'Comprehensive system for tracking crops and farm activities.' },
    { icon: <Cpu size={24} />, title: 'AI Crop Analysis', desc: 'Real-time disease detection and health monitoring using AI.' },
    { icon: <Globe size={24} />, title: 'Market Intelligence', desc: 'Real-time tracking of food prices and market trends across regions.' },
    { icon: <Zap size={24} />, title: 'Logistics & Sales', desc: 'Streamlined transport booking and direct-to-buyer produce listing.' },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-12 bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fresh/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <Badge variant="info" className="px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-full">
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary-dark leading-[0.95]">
            Bridging the gap between <span className="text-primary-fresh">traditional farming</span> and <span className="text-accent-amber">AI-driven agriculture</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl">
            AgriLink is an AI-powered agricultural intelligence platform designed to empower farmers with actionable insights, helping them manage crops, monitor health, and access markets efficiently.
          </p>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="px-4 py-20 bg-bg-soft/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-primary-dark">The Challenge</h2>
            <p className="text-gray-500 leading-relaxed font-medium">
              Smallholder and medium-scale farmers often lack access to timely, region-specific agricultural information. Traditional methods make it difficult to track crop health accurately, monitor market price fluctuations, and secure reliable logistics for moving produce.
            </p>
            <div className="space-y-4">
              {['Information Asymmetry', 'Crop Loss & Disease', 'Market Inaccessibility'].map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">✕</div>
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-primary-fresh">Our Solution</h2>
            <p className="text-gray-500 leading-relaxed font-medium">
              We provide a unified digital ecosystem that integrates AI monitoring, farm-based management, and market connectivity. By turning data into intelligence, we help farmers reduce risks and maximize productivity.
            </p>
            <div className="space-y-4">
              {['AI Disease Detection', 'Unified Farm Dashboard', 'Logistics Marketplace'].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xs">✓</div>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-primary-dark">Who we serve</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Empowering the entire agricultural value chain</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: <Target className="mx-auto mb-4 text-primary-fresh" />, label: 'Small-scale Farmers' },
              { icon: <Users className="mx-auto mb-4 text-primary-fresh" />, label: 'Cooperatives' },
              { icon: <ShieldCheck className="mx-auto mb-4 text-primary-fresh" />, label: 'Agri-Officers' },
              { icon: <Globe className="mx-auto mb-4 text-primary-fresh" />, label: 'Market Buyers' },
            ].map((u, i) => (
              <Card key={i} className="p-8 border-none bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all group">
                {u.icon}
                <p className="font-bold text-gray-900 group-hover:text-primary-fresh transition-colors">{u.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="px-4 py-20 bg-primary-dark text-white rounded-[3rem] mx-4 my-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-12">
             <div className="space-y-4">
               <Badge variant="default" className="text-white/40 border-white/10 uppercase tracking-[0.3em] font-black text-[9px]">Mission</Badge>
               <h3 className="text-3xl md:text-5xl font-bold leading-tight">Improving agricultural productivity through accessible AI tools.</h3>
             </div>
             <div className="space-y-4">
               <Badge variant="default" className="text-white/40 border-white/10 uppercase tracking-[0.3em] font-black text-[9px]">Vision</Badge>
               <h3 className="text-3xl md:text-5xl font-bold leading-tight opacity-60">Digitally empower African farmers with smart farming intelligence.</h3>
             </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
             <Card className="bg-white/5 border-white/10 p-8 md:p-12 space-y-6">
                <div className="w-16 h-16 bg-primary-fresh rounded-3xl flex items-center justify-center text-white">
                  <Sprout size={32} />
                </div>
                <h4 className="text-2xl font-bold">Trusted Impact</h4>
                <p className="text-white/60 leading-relaxed font-medium">
                  AgriLink bridges the gap between traditional farming and modern AI-driven agriculture by providing farmers with actionable insights in one unified platform.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                   <div className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">+Yield Efficiency</div>
                   <div className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">-Crop Loss</div>
                </div>
             </Card>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="px-4 py-20 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Core Tech</h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-40 grayscale">
            <span className="font-black tracking-tighter text-2xl uppercase italic">React.JS</span>
            <span className="font-black tracking-tighter text-2xl uppercase italic">Supabase</span>
            <span className="font-black tracking-tighter text-2xl uppercase italic">Gemini AI</span>
            <span className="font-black tracking-tighter text-2xl uppercase italic">Vite</span>
          </div>
        </div>
      </section>
    </div>
  );
}
