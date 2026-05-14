import { motion } from 'motion/react';
import { Camera, CloudSun, TrendingUp, Truck, Database, Shield, Zap, Sparkles, Sprout, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';

export default function Solutions() {
  const solutions = [
    {
      id: 'ai-scanner',
      icon: <Camera className="text-primary-fresh" />,
      title: 'AI Crop Diagnostics',
      desc: 'Our flagship AI identifies plant diseases, nutrient deficiencies, and pest infestations from simple smartphone photos with 96% accuracy.',
      features: ['Real-time disease detection', 'Treatment recommendations', 'Historical health tracking'],
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'farm-mgmt',
      icon: <LayoutDashboard className="text-primary-dark" />,
      title: 'Farm Activity Management',
      desc: 'A complete operating system for your farm. Track multiple plots, harvest cycles, and historical yields in one unified dashboard.',
      features: ['Multi-plot tracking', 'Harvest cycle logs', 'Soil health monitoring'],
      image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 'market-intel',
      icon: <TrendingUp className="text-accent-amber" />,
      title: 'Precision Market Data',
      desc: 'Stop guessing prices. We aggregate real-time pricing from over 40 regional markets to ensure you sell at the optimal time.',
      features: ['Price fluctuation alerts', 'Regional comparisons', 'Buyer connection portal'],
      image: 'https://images.unsplash.com/photo-1488459711612-402919318f1a?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-12">
      {/* Header */}
      <section className="px-4 pt-12 md:pt-20 pb-12 md:pb-24 max-w-6xl mx-auto space-y-6">
        <Badge variant="success" className="px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-full">
          Capabilities
        </Badge>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-primary-dark max-w-4xl leading-[0.9]">
          Modern solutions for the <span className="text-primary-fresh italic font-serif">connected farmer</span>.
        </h1>
      </section>

      {/* Solution List */}
      <section className="px-4 space-y-20 md:space-y-40 max-w-6xl mx-auto">
        {solutions.map((sol, idx) => (
          <div key={sol.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`lg:col-span-12 xl:col-span-5 space-y-8 ${idx % 2 === 1 ? 'lg:order-last' : ''}`}>
              <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                {sol.icon}
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary-dark leading-tight">{sol.title}</h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">{sol.desc}</p>
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {sol.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-primary-fresh/10 text-primary-fresh flex items-center justify-center">
                      <Zap size={12} fill="currentColor" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="h-14 rounded-2xl px-8 font-bold border-gray-100 items-center gap-2 group">
                Learn More <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="lg:col-span-12 xl:col-span-7">
               <div className="relative rounded-[3rem] overflow-hidden aspect-[16/10] shadow-2xl">
                 <img src={sol.image} alt={sol.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-primary-dark/10" />
               </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="inline-flex p-4 bg-primary-fresh/5 rounded-full mb-6">
             <Sparkles className="text-primary-fresh animate-pulse" size={32} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-primary-dark leading-[0.95]">
            Ready to digitize your farm?<br />
            <span className="text-gray-400">Join 5,000+ top producers.</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
             <Button variant="primary" className="h-16 px-10 rounded-2xl font-bold text-lg w-full md:w-auto shadow-xl shadow-primary-fresh/20">
                Start Free Trial
             </Button>
             <Button variant="outline" className="h-16 px-10 rounded-2xl font-bold text-lg w-full md:w-auto bg-white border-gray-100">
                Consult Advisor
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
