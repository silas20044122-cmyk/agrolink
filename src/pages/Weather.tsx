import { Card, Badge, Button } from '@/src/components/ui/Base';
import { CloudSun, CloudRain, Wind, Droplets, Thermometer, Sun, Cloud, Info, Umbrella, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Weather() {
  const forecast = [
    { day: 'Mon', temp: 24, icon: <CloudSun />, rain: '10%', status: 'Partly Cloudy' },
    { day: 'Tue', temp: 22, icon: <CloudRain />, rain: '85%', status: 'Heavy Rain' },
    { day: 'Wed', temp: 21, icon: <Umbrella />, rain: '60%', status: 'Light Showers' },
    { day: 'Thu', temp: 25, icon: <Sun />, rain: '5%', status: 'Sunny' },
    { day: 'Fri', temp: 26, icon: <Sun />, rain: '0%', status: 'Hot & Sun' },
    { day: 'Sat', temp: 23, icon: <Cloud />, rain: '20%', status: 'Overcast' },
    { day: 'Sun', temp: 24, icon: <CloudSun />, rain: '15%', status: 'Partly Cloudy' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Weather Intelligence</h2>
          <p className="text-gray-400 text-sm font-medium tracking-tight">Hyper-local climate monitoring for precise irrigation planning.</p>
        </div>
        <div className="flex gap-3">
           <Badge variant="success" className="px-4 py-2 text-xs">Soil Moisture: Optimal</Badge>
        </div>
      </header>

      {/* Hero Weather Card */}
      <Card className="p-6 md:p-12 bg-gradient-to-br from-secondary-ai to-blue-900 text-white border-none relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 blur-[60px] md:blur-[100px] -mr-20 -mt-20"></div>
         
         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
             <div className="text-6xl md:text-8xl font-bold font-display tracking-tighter">24°</div>
             <div className="space-y-1 md:space-y-2">
               <h3 className="text-xl md:text-3xl font-bold">Kakamega, KE</h3>
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[10px] md:text-sm font-medium opacity-80">
                 <span className="flex items-center gap-1"><Thermometer size={14} /> H: 26° L: 19°</span>
                 <span className="flex items-center gap-1"><Droplets size={14} /> Humidity: 64%</span>
               </div>
             </div>
           </div>
           
           <div className="flex flex-col items-center lg:items-end gap-1 md:gap-2 text-center lg:text-right">
             <Sun size={60} className="text-amber-400 animate-pulse-slow my-2 lg:my-0" />
             <p className="text-lg md:text-2xl font-bold tracking-tight">Partly Cloudy Today</p>
             <p className="text-[10px] md:text-sm opacity-70 font-medium">Feels like 26° • Sunrise 6:12 AM</p>
           </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 md:mt-16 pt-8 md:pt-12 border-t border-white/10 relative z-10">
           {[
             { label: 'Wind Direction', value: 'NE 4 km/h', icon: <Wind size={16} /> },
             { label: 'Visibility', value: '12 km', icon: <CloudSun size={16} /> },
             { label: 'UV Index', value: '6 (Mod)', icon: <Sun size={16} /> },
             { label: 'Pressure', value: '1012 hPa', icon: <Droplets size={16} /> },
           ].map((stat, i) => (
             <div key={i} className="space-y-1">
               <div className="flex items-center gap-1.5 md:gap-2 opacity-60 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                 {stat.icon} {stat.label}
               </div>
               <p className="text-sm md:text-xl font-bold">{stat.value}</p>
             </div>
           ))}
         </div>
      </Card>

      {/* 7-Day Forecast */}
      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg md:text-xl font-bold tracking-tight px-1">7-Day Agricultural Forecast</h3>
        <div className="flex lg:grid lg:grid-cols-7 gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
          {forecast.map((day, i) => (
            <Card key={i} className={cn(
              "p-4 md:p-6 flex flex-col items-center justify-between text-center space-y-3 hover:border-blue-200 transition-all cursor-pointer group min-w-[100px] shrink-0 lg:min-w-0",
              i === 0 && "bg-blue-50/50 border-blue-200"
            )}>
              <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{day.day}</p>
              <div className="text-secondary-ai group-hover:scale-110 transition-transform w-8 h-8 md:w-auto md:h-auto flex items-center justify-center">
                {day.icon}
              </div>
              <div>
                <p className="text-base md:text-xl font-bold text-gray-900">{day.temp}°</p>
                <div className="flex items-center justify-center gap-0.5 md:gap-1 text-[8px] md:text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                   <CloudRain size={8} /> {day.rain}
                </div>
              </div>
              <p className="text-[8px] md:text-[10px] font-medium text-gray-500 leading-tight h-4 md:h-auto overflow-hidden">{day.status}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Advice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <Card className="p-8 border-none bg-green-50 space-y-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700">
              <Droplets size={20} />
            </div>
            <h4 className="font-bold text-green-900">Irrigation Advice</h4>
            <p className="text-sm font-medium text-green-800 leading-relaxed opacity-80">
              Expected rainfall on Tuesday and Wednesday will provide sufficient moisture for Maize and Beans. No manual irrigation required this week.
            </p>
         </Card>

         <Card className="p-8 border-none bg-amber-50 space-y-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
              <Calendar size={20} />
            </div>
            <h4 className="font-bold text-amber-900">Planting Window</h4>
            <p className="text-sm font-medium text-amber-800 leading-relaxed opacity-80">
              Soil temperature is currently 22°C. Ideal window for planting secondary vegetables (Kales, Spinach) starting Thursday.
            </p>
         </Card>

         <Card className="p-8 border-none bg-red-50 space-y-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-700">
              <Info size={20} />
            </div>
            <h4 className="font-bold text-red-900">Pest Probability</h4>
            <p className="text-sm font-medium text-red-800 leading-relaxed opacity-80">
              High humidity (85%) on Tuesday increases the risk of Fungal Blight. Inspect tomato crops early Wednesday morning.
            </p>
         </Card>
      </div>
    </div>
  );
}
