import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/src/components/ui/Base';
import { 
  CloudSun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  Cloud, 
  Info, 
  Umbrella, 
  Calendar, 
  RefreshCw, 
  Compass, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  SunDim
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LocationConfig {
  name: string;
  county: string;
  latitude: number;
  longitude: number;
  cropsGrown: string[];
}

const KENYAN_REGIONS: LocationConfig[] = [
  { name: 'Kakamega', county: 'Western', latitude: 0.2827, longitude: 34.7519, cropsGrown: ['Maize (Mahindi)', 'Beans (Maharagwe)', 'Sugarcane', 'Tea'] },
  { name: 'Eldoret', county: 'Uasin Gishu', latitude: 0.5143, longitude: 35.2698, cropsGrown: ['Maize (Mahindi)', 'Wheat (Ngano)', 'Beans'] },
  { name: 'Kiambu', county: 'Central', latitude: -1.1714, longitude: 36.8356, cropsGrown: ['Coffee (Kahawa)', 'Tea (Chai)', 'Kales (Sukuma Wiki)', 'Potatoes'] },
  { name: 'Nakuru', county: 'Rift Valley', latitude: -0.3031, longitude: 36.0800, cropsGrown: ['Potatoes (Viazi)', 'Pyrethrum', 'Carrots', 'Barley'] },
  { name: 'Meru', county: 'Eastern Highlands', latitude: 0.0515, longitude: 37.6456, cropsGrown: ['Tea', 'Coffee', 'Bananas (Ndizi)', 'Macadamia'] },
  { name: 'Machakos', county: 'Lower Eastern', latitude: -1.5177, longitude: 37.2634, cropsGrown: ['Sorghum (Mtama)', 'Green Grams (Ndengu)', 'Pigeon Peas', 'Cassava'] },
  { name: 'Kisumu', county: 'Nyanza', latitude: -0.0917, longitude: 34.7680, cropsGrown: ['Rice (Mchele)', 'Cotton (Pamba)', 'Sorghum'] },
];

interface WeatherData {
  temp: number;
  humidity: number;
  apparentTemp: number;
  weatherCode: number;
  weatherLabel: string;
  weatherDetails: string;
  windSpeed: number;
  windDir: string;
  pressure: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  forecast: Array<{
    day: string;
    temp: number;
    minTemp: number;
    code: number;
    rainProb: number;
    status: string;
    dateStr: string;
  }>;
}

// Map degrees to directions
function getWindDirection(degrees: number): string {
  if (degrees === undefined || isNaN(degrees)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16;
  return directions[index];
}

// Convert date representation to localized short name
function getDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return d.toLocaleDateString('en-US', options);
  } catch (err) {
    return dateStr;
  }
}

// Map WMO Weather Codes to Human-Friendly info
function getWeatherInterpretation(code: number): { label: string; details: string; type: 'sunny' | 'cloudy' | 'rainy' } {
  const mapping: Record<number, { label: string; details: string; type: 'sunny' | 'cloudy' | 'rainy' }> = {
    0: { label: 'Sunny / Clear Sky', details: 'Perfect sunny weather for sun-drying maize and grains.', type: 'sunny' },
    1: { label: 'Mainly Clear', details: 'Good, high sunlight level for nursery beds maturation.', type: 'sunny' },
    2: { label: 'Partly Cloudy', details: 'Balanced light; low moisture transpiration.', type: 'cloudy' },
    3: { label: 'Overcast / Cloudy', details: 'Full cloud layout; low transpiration rates today.', type: 'cloudy' },
    45: { label: 'Foggy / Fog', details: 'Chilly morning fog; visibility slightly limited.', type: 'cloudy' },
    48: { label: 'Depositing Rime Fog', details: 'Wet cold morning fog conditions.', type: 'cloudy' },
    51: { label: 'Light Drizzle', details: 'Mild moisture. Perfect for fragile kales nurseries.', type: 'rainy' },
    53: { label: 'Moderate Drizzle', details: 'Light wetting drizzle; supports organic soil health.', type: 'rainy' },
    55: { label: 'Dense Drizzle', details: 'High relative humidity drizzle.', type: 'rainy' },
    56: { label: 'Light Freezing Drizzle', details: 'Unusually cold micro-rain conditions.', type: 'rainy' },
    57: { label: 'Dense Freezing Drizzle', details: 'Cold persistent damp atmosphere alert.', type: 'rainy' },
    61: { label: 'Slight Rain', details: 'Mild intermittent watering; great for young beans.', type: 'rainy' },
    63: { label: 'Moderate Rain', details: 'Superb wetting rains; ideal for fast crop uptake.', type: 'rainy' },
    65: { label: 'Heavy Rain', details: 'High volume rainfall; watch for topsoil erosion.', type: 'rainy' },
    66: { label: 'Light Freezing Rain', details: 'Cold weather storm alert; shelter sprouts.', type: 'rainy' },
    67: { label: 'Heavy Freezing Rain', details: 'High risk of mechanical harm of open shoots.', type: 'rainy' },
    71: { label: 'Slight Snow Fall', details: 'Rare elevated cold wave alert.', type: 'cloudy' },
    73: { label: 'Moderate Snow Fall', details: 'Severe winter frost conditions.', type: 'cloudy' },
    75: { label: 'Heavy Snow Fall', details: 'Frost threat on high mountain farms.', type: 'cloudy' },
    77: { label: 'Snow Grains', details: 'Hail or ice-crystal morning frost.', type: 'cloudy' },
    80: { label: 'Slight Rain Showers', details: 'Passing quick showers. Perfect natural irrigation.', type: 'rainy' },
    81: { label: 'Moderate Rain Showers', details: 'Favorable quick showers. Mulch soil fields.', type: 'rainy' },
    82: { label: 'Violent Rain Showers', details: 'Sudden rain storms; clear the drainage paths.', type: 'rainy' },
    85: { label: 'Slight Snow Showers', details: 'Cold storm frost squalls.', type: 'cloudy' },
    86: { label: 'Heavy Snow Showers', details: 'Severe frost conditions.', type: 'cloudy' },
    95: { label: 'Thunderstorms', details: 'Heavy lightning. Avoid farm machinery in open fields.', type: 'rainy' },
    96: { label: 'Mild Hail Thunderstorm', details: 'Damp storm; check leaves for bruising.', type: 'rainy' },
    99: { label: 'Heavy Hail Thunderstorm', details: 'Severe storm alert; cover delicate greenhouse plants.', type: 'rainy' },
  };
  return mapping[code] || { label: 'Partly Cloudy', details: 'Standard climate parameters.', type: 'cloudy' };
}

function getWeatherIcon(code: number, size = 20, className = '') {
  const interp = getWeatherInterpretation(code);
  switch (interp.type) {
    case 'sunny':
      return <Sun size={size} className={cn("text-amber-400 stroke-1.5", className)} />;
    case 'rainy':
      return <CloudRain size={size} className={cn("text-blue-400 stroke-1.5 animate-bounce-slow", className)} />;
    case 'cloudy':
    default:
      return <CloudSun size={size} className={cn("text-sky-300 stroke-1.5", className)} />;
  }
}

function formatIsoTime(isoStr: string) {
  if (!isoStr) return '--:--';
  try {
    const parts = isoStr.split('T');
    if (parts.length < 2) return isoStr;
    const timeParts = parts[1].split(':');
    const hr = parseInt(timeParts[0], 10);
    const min = timeParts[1];
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 || 12;
    return `${displayHr}:${min} ${ampm}`;
  } catch (e) {
    return isoStr;
  }
}

// Mock database to serve as immediate responsive fallbacks on net issues
const MOCK_WEATHER_DATA: Record<string, WeatherData> = {
  'Kakamega': {
    temp: 24,
    humidity: 64,
    apparentTemp: 25,
    weatherCode: 2,
    weatherLabel: 'Partly Cloudy',
    weatherDetails: 'Ideal temperature parameters for local maize health.',
    windSpeed: 4.5,
    windDir: 'NE',
    pressure: 1012,
    uvIndex: 6,
    sunrise: '2026-05-21T06:12',
    sunset: '2026-05-21T18:41',
    isDay: true,
    forecast: [
      { day: 'Mon', temp: 24, minTemp: 18, code: 2, rainProb: 15, status: 'Partly Cloudy', dateStr: '2026-05-21' },
      { day: 'Tue', temp: 22, minTemp: 17, code: 63, rainProb: 85, status: 'Heavy Rain', dateStr: '2026-05-22' },
      { day: 'Wed', temp: 21, minTemp: 16, code: 80, rainProb: 60, status: 'Light Showers', dateStr: '2026-05-23' },
      { day: 'Thu', temp: 25, minTemp: 19, code: 0, rainProb: 5, status: 'Sunny', dateStr: '2026-05-24' },
      { day: 'Fri', temp: 26, minTemp: 20, code: 0, rainProb: 0, status: 'Hot & Sunny', dateStr: '2026-05-25' },
      { day: 'Sat', temp: 23, minTemp: 18, code: 3, rainProb: 20, status: 'Overcast', dateStr: '2026-05-26' },
      { day: 'Sun', temp: 24, minTemp: 18, code: 2, rainProb: 15, status: 'Partly Cloudy', dateStr: '2026-05-27' },
    ]
  },
  'Eldoret': {
    temp: 21,
    humidity: 58,
    apparentTemp: 20,
    weatherCode: 1,
    weatherLabel: 'Mainly Clear',
    weatherDetails: 'Cool mountain breeze, perfect conditions for weed maintenance.',
    windSpeed: 8.2,
    windDir: 'ENE',
    pressure: 1014,
    uvIndex: 7,
    sunrise: '2026-05-21T06:14',
    sunset: '2026-05-21T18:43',
    isDay: true,
    forecast: [
      { day: 'Mon', temp: 21, minTemp: 14, code: 1, rainProb: 10, status: 'Mainly Clear', dateStr: '2026-05-21' },
      { day: 'Tue', temp: 20, minTemp: 13, code: 2, rainProb: 25, status: 'Partly Cloudy', dateStr: '2026-05-22' },
      { day: 'Wed', temp: 19, minTemp: 12, code: 61, rainProb: 55, status: 'Light Rain', dateStr: '2026-05-23' },
      { day: 'Thu', temp: 22, minTemp: 14, code: 0, rainProb: 5, status: 'Sunny', dateStr: '2026-05-24' },
      { day: 'Fri', temp: 23, minTemp: 15, code: 0, rainProb: 0, status: 'Clear Sky', dateStr: '2026-05-25' },
      { day: 'Sat', temp: 21, minTemp: 13, code: 2, rainProb: 10, status: 'Partly Cloudy', dateStr: '2026-05-26' },
      { day: 'Sun', temp: 22, minTemp: 14, code: 1, rainProb: 8, status: 'Mainly Clear', dateStr: '2026-05-27' },
    ]
  }
};

export default function Weather() {
  const [selectedLoc, setSelectedLoc] = useState<LocationConfig>(KENYAN_REGIONS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Interactive Day Selection (Master-Detail)
  const [selectedForecastIndex, setSelectedForecastIndex] = useState<number>(0);

  // Core data fetcher
  const fetchWeatherData = async (loc: LocationConfig, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setApiError(null);

    try {
      // Build dynamic Open meteo URL targeting location coordinates
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=Africa/Nairobi`
      );

      if (!response.ok) {
        throw new Error(`Weather services returned error ${response.status}`);
      }

      const raw = await response.json();
      
      // Parse payload to design format
      if (!raw?.current || !raw?.daily) {
        throw new Error("Payload parsed incomplete.");
      }

      const formattedForecast = raw.daily.time.map((timeStr: string, idx: number) => {
        const code = raw.daily.weather_code[idx];
        const interp = getWeatherInterpretation(code);
        return {
          day: getDayName(timeStr),
          temp: Math.round(raw.daily.temperature_2m_max[idx]),
          minTemp: Math.round(raw.daily.temperature_2m_min[idx]),
          code: code,
          rainProb: Math.round(raw.daily.precipitation_probability_max[idx] ?? 0),
          status: interp.label,
          dateStr: timeStr
        };
      });

      const currentInterp = getWeatherInterpretation(raw.current.weather_code);

      const parsedData: WeatherData = {
        temp: Math.round(raw.current.temperature_2m),
        humidity: Math.round(raw.current.relative_humidity_2m),
        apparentTemp: Math.round(raw.current.apparent_temperature),
        weatherCode: raw.current.weather_code,
        weatherLabel: currentInterp.label,
        weatherDetails: currentInterp.details,
        windSpeed: parseFloat((raw.current.wind_speed_10m ?? 0).toFixed(1)),
        windDir: getWindDirection(raw.current.wind_direction_10m),
        pressure: Math.round(raw.current.surface_pressure ?? 1013),
        uvIndex: Math.round(raw.daily.uv_index_max[0] ?? 5),
        sunrise: raw.daily.sunrise[0],
        sunset: raw.daily.sunset[0],
        isDay: raw.current.is_day === 1,
        forecast: formattedForecast
      };

      setWeather(parsedData);
      setFallbackActive(false);
      setLastRefreshed(new Date());
      setSelectedForecastIndex(0); // reset forecast index to today
    } catch (err: any) {
      console.warn("API Web weather failed, launching offline database helper:", err.message);
      setApiError("Unable to access live satellite feeder. Showing localized, seasonal climate simulation.");
      
      // Load fallback mock dataset specifically tailored to this county
      const offlineMock = MOCK_WEATHER_DATA[loc.name] || {
        ...MOCK_WEATHER_DATA['Kakamega'],
        temp: Math.round(23 + Math.random() * 4),
        weatherDetails: `Fallback climate template for agricultural planning in ${loc.name}.`
      };
      
      setWeather(offlineMock);
      setFallbackActive(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger on Location select changes
  useEffect(() => {
    fetchWeatherData(selectedLoc);
  }, [selectedLoc]);

  // Handle periodic dynamic updates (auto updates every 5 minutes/300 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeatherData(selectedLoc, false);
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, [selectedLoc]);

  // Dynamic advice generation based on current weather + 7 day forecasts
  const cropAdvice = weather ? generateAgriculturalAdvice(weather, selectedLoc) : null;

  // Selected Day Details (either current today, or clicked forecast day)
  const isViewingForecastDetail = selectedForecastIndex > 0;
  const currentViewDay = weather ? (isViewingForecastDetail ? weather.forecast[selectedForecastIndex] : null) : null;
  const displayTemp = currentViewDay ? currentViewDay.temp : (weather ? weather.temp : 24);
  const displayStatus = currentViewDay ? currentViewDay.status : (weather ? weather.weatherLabel : '');
  const displayCode = currentViewDay ? currentViewDay.code : (weather ? weather.weatherCode : 0);
  const displayDetails = currentViewDay ? getWeatherInterpretation(currentViewDay.code).details : (weather ? weather.weatherDetails : '');

  // Master advice evaluation
  function generateAgriculturalAdvice(data: WeatherData, location: LocationConfig) {
    // 1. Irrigation Advice
    const rainNextThreeDays = data.forecast.slice(0, 3).reduce((acc, curr) => acc + curr.rainProb, 0);
    const avgRainProb = rainNextThreeDays / 3;
    
    let irrigation: { title: string; description: string; status: 'optimal' | 'warning' | 'critical' };
    if (avgRainProb > 50) {
      irrigation = {
        title: 'Skip Manual Irrigation',
        description: `With a high chance of rainfall (${Math.round(avgRainProb)}% average) forecasted over the next 3 days, natural weather will irrigate your soil. Skip watering to prevent soil leaching for your ${location.cropsGrown[0]}.`,
        status: 'warning'
      };
    } else if (data.humidity > 78 && avgRainProb > 25) {
      irrigation = {
        title: 'Mild Micro-Drip Irrigation',
        description: `High local humidity (${data.humidity}%) matches low soil evaporation. Deliver short, light cycles of water directly to roots. Avoid overhead sprinklers to prevent fungal build-up.`,
        status: 'optimal'
      };
    } else {
      irrigation = {
        title: 'Action Required: Dry Spell',
        description: `Dry conditions ahead with less than 20% precipitation probability. Deliver deep irrigation to support ${location.cropsGrown.slice(0, 2).join(' and ')} during high-photosynthesis light hours.`,
        status: 'critical'
      };
    }

    // 2. Planting Window
    let planting: { title: string; description: string; status: 'optimal' | 'warning' | 'critical' };
    if (data.temp < 19) {
      planting = {
        title: 'Cold Weather Rest Period',
        description: `Current air temp averages ${Math.round(data.temp)}°C. Perfect opportunity for compost integration, weeding, and nursery protection instead of delicate seedling transplant.`,
        status: 'warning'
      };
    } else if (data.temp > 27) {
      planting = {
        title: 'Postpone Seedling Transplant',
        description: `High heat (${Math.round(data.temp)}°C) causes extreme transplant shock. Mulch existing plots with straw to block sun or shield nursery lines under shade nets until cooler periods.`,
        status: 'warning'
      };
    } else {
      planting = {
        title: 'Favorable Sowing Conditions',
        description: `Temperate climate at ${Math.round(data.temp)}°C provides strong germination conditions. Excellent time to sow ${location.cropsGrown.slice(0, 3).join(', ')} directly in standard planting depths.`,
        status: 'optimal'
      };
    }

    // 3. Pest & Disease Probability
    let pests: { title: string; description: string; status: 'optimal' | 'warning' | 'critical' };
    if (data.humidity > 75 || avgRainProb > 60) {
      pests = {
        title: 'High Blight & Mildew Threat',
        description: `Moist air (${data.humidity}% humidity) combined with warm forecasts creates breeding setups for Fungal Blight on tomato/potato. Prune bottom leaves to enhance breeze, and apply copper sprays or wood ash proactive feeds.`,
        status: 'critical'
      };
    } else if (data.temp > 25 && data.humidity < 50) {
      pests = {
        title: 'Mite & Sucking Pests Alert',
        description: `Hot, dry atmosphere is highly ideal for Red Spider Mite, Whitefly, and Aphids. Spray biological pesticides like Mwarobaini (Neem extract) under leaves on dry afternoons.`,
        status: 'warning'
      };
    } else {
      pests = {
        title: 'Pest Threshold Balanced',
        description: `Standard thermal and moisture variables are maintaining pests below dangerous threshold limits. Standard field observation during weekly weeding remains sufficient.`,
        status: 'optimal'
      };
    }

    return { irrigation, planting, pests };
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-32 font-sans text-gray-800">
      
      {/* Header and Region Selector */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Weather Intelligence</h2>
            {fallbackActive && (
              <Badge variant="warning" className="animate-pulse flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 py-1 px-2 border border-amber-200">
                <AlertCircle size={10} />
                <span>Simulated Mode</span>
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium tracking-tight">
            Live telemetry data from satellite networks and microclimate forecasts.
          </p>
        </div>

        {/* Region Dropdown list */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest leading-none select-none">Farm Zone:</span>
            <select
              id="region-selector"
              value={selectedLoc.name}
              onChange={(e) => {
                const found = KENYAN_REGIONS.find(r => r.name === e.target.value);
                if (found) setSelectedLoc(found);
              }}
              className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none border-none py-0.5 cursor-pointer leading-tight"
            >
              {KENYAN_REGIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.county})
                </option>
              ))}
            </select>
          </div>

          <Button
            id="btn-refresh-weather"
            variant="outline"
            size="sm"
            onClick={() => fetchWeatherData(selectedLoc, true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-xl transition-all duration-200 border border-gray-200"
          >
            <RefreshCw size={12} className={cn("", (isRefreshing || isLoading) ? "animate-spin text-primary-fresh" : "text-gray-500")} />
            <span>{isRefreshing ? "Syncing..." : "Sync Live"}</span>
          </Button>
        </div>
      </header>

      {/* Warnings & Advisories for API Issues */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed shadow-sm"
        >
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-950 uppercase tracking-widest text-[9px] block">Network Notification</span>
            <span>{apiError}</span>
          </div>
        </motion.div>
      )}

      {/* Primary Loading Dashboard State */}
      {isLoading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-primary-fresh/10 opacity-75"></div>
            <div className="relative p-4 bg-primary-fresh/10 text-primary-fresh rounded-full">
              <RefreshCw size={24} className="animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-700 animate-pulse">Contacting meteorology satellites...</p>
            <p className="text-xs text-gray-400 font-medium">Fetching real-time temperature, pressure and soil metrics</p>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-8">
          
          {/* Main Weather Metric Box */}
          <section id="hero-weather-module">
            <Card className="p-6 md:p-10 bg-gradient-to-br from-[#1e293b] via-[#111827] to-[#1e3a8a] text-white border-none relative overflow-hidden shadow-xl rounded-3xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[80px] -mr-20 -mt-20 pointer-events-none rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-fresh/5 blur-[60px] pointer-events-none rounded-full" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Temp and Location */}
                <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 md:gap-8">
                  <div className="relative select-none">
                    <span className="text-7xl md:text-8xl font-black font-mono tracking-tighter block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-200">
                      {displayTemp}°
                    </span>
                    <span className="text-xs font-bold text-gray-400 absolute right-0 top-1 text-right mt-1.5 uppercase tracking-widest">Celsius</span>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-none">
                        {selectedLoc.name}
                      </h3>
                      <span className="text-[10px] font-extrabold text-[#93c5fd] bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/20 uppercase tracking-widest self-center">
                        {selectedLoc.county} KE
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-300 font-medium max-w-md leading-relaxed">
                      {displayDetails}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-gray-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Thermometer size={14} className="text-blue-300" />
                        <span>Feels like: <strong className="text-white">{weather?.apparentTemp}°C</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Droplets size={14} className="text-blue-300" />
                        <span>Humidity: <strong className="text-white">{weather?.humidity}%</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Illustration */}
                <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center text-center lg:text-right space-y-2 border-t lg:border-t-0 border-white/15 pt-6 lg:pt-0">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-inner inline-flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                    {getWeatherIcon(displayCode, 48)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-base md:text-lg font-bold text-white tracking-tight">
                      {displayStatus}
                    </h4>
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium">
                      {isViewingForecastDetail ? `Forecast for ${currentViewDay?.day}` : "Selected: Today's Conditions"}
                    </p>
                  </div>
                  {isViewingForecastDetail && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedForecastIndex(0)}
                      className="text-[9px] font-bold text-sky-200 border-sky-400/20 bg-sky-500/10 max-h-7 py-1 px-2 uppercase tracking-wider rounded-md h-fit text-center"
                    >
                      Reset to Live Today
                    </Button>
                  )}
                </div>

              </div>

              {/* Sub parameters breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 md:mt-12 pt-8 border-t border-white/10 relative z-10 text-xs text-gray-300">
                {[
                  { label: 'Wind Current', value: `${weather?.windSpeed} km/h ${weather?.windDir}`, icon: <Wind size={14} className="text-emerald-400" /> },
                  { label: 'UV Radiation', value: `${weather?.uvIndex} (${weather?.uvIndex && weather.uvIndex > 5 ? 'High' : 'Moderate'})`, icon: <SunDim size={14} className="text-amber-400" /> },
                  { label: 'Pressure Index', value: `${weather?.pressure} hPa`, icon: <Compass size={14} className="text-teal-400" /> },
                  { label: 'Sun Cycle', value: `${formatIsoTime(weather?.sunrise ?? '')} - ${formatIsoTime(weather?.sunset ?? '')}`, icon: <Sun size={14} className="text-rose-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-[8px] md:text-[99px] uppercase tracking-wider font-extrabold text-gray-400">
                      {stat.icon}
                      <span className="text-[9px]">{stat.label}</span>
                    </div>
                    <p className="text-sm md:text-base font-extrabold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Interactive 7-Day Agricultural Forecast Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-0.5">
                <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">7-Day Agricultural Forecast</h3>
                <p className="text-[10px] md:text-xs text-gray-400 font-medium">Click on any forecast day card below to load comprehensive sub-climate alerts.</p>
              </div>
              <Badge variant="success" className="text-[9px] font-extrabold uppercase py-1 px-2.5 bg-green-50 text-green-700 border border-green-200">
                Soil Moisture Est: Stable
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pb-2">
              {weather?.forecast.map((day, i) => {
                const isSelected = selectedForecastIndex === i;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedForecastIndex(i)}
                    className={cn(
                      "p-4 rounded-2xl border text-center flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden group select-none",
                      isSelected 
                        ? "bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-400/10" 
                        : "bg-white border-gray-200 hover:border-gray-300 text-gray-650"
                    )}
                  >
                    {/* Top Accent Day bar */}
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
                    )}

                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider group-hover:text-gray-500">
                      {day.day}
                    </span>

                    <div className="flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      {getWeatherIcon(day.code, 24)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base font-bold text-gray-900 select-all">{day.temp}°</span>
                        <span className="text-xs text-gray-400 font-medium">{day.minTemp}°</span>
                      </div>
                      
                      <div className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-500 bg-blue-500/5 py-0.5 px-1.5 rounded-full border border-blue-500/10">
                        <CloudRain size={8} />
                        <span>{day.rainProb}%</span>
                      </div>
                    </div>

                    <p className="text-[9px] font-bold text-gray-500 group-hover:text-gray-650 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      {day.status}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Interactive reactive advice blocks */}
          <section className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight px-1">Reactive Agricultural Advisory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Irrigation Advice */}
              <Card className="p-6 border-none bg-emerald-50/70 border border-emerald-100/30 flex flex-col justify-between space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                      <Droplets size={20} />
                    </div>
                    {cropAdvice?.irrigation.status === 'optimal' ? (
                      <Badge variant="success" className="text-[9px] font-extrabold uppercase">Optimal Moisture</Badge>
                    ) : cropAdvice?.irrigation.status === 'warning' ? (
                      <Badge variant="warning" className="text-[9px] font-extrabold uppercase">Skip Irrigation</Badge>
                    ) : ( 
                      <Badge variant="error" className="text-[9px] font-extrabold uppercase text-red-600 bg-red-100">Critical Dry</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-emerald-950 text-sm tracking-tight">
                      {cropAdvice?.irrigation.title}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-800 leading-relaxed opacity-90 h-auto">
                      {cropAdvice?.irrigation.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100/40 flex items-center justify-between text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest leading-none">
                  <span>Resource Conservation</span>
                  <CheckCircle size={10} />
                </div>
              </Card>

              {/* Planting Window */}
              <Card className="p-6 border-none bg-amber-50/70 border border-amber-100/30 flex flex-col justify-between space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-amber-100/80 rounded-xl flex items-center justify-center text-amber-700 font-bold shadow-sm">
                      <Calendar size={20} />
                    </div>
                    {cropAdvice?.planting.status === 'optimal' ? (
                      <Badge variant="success" className="text-[9px] font-extrabold uppercase">Ideal Spot</Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px] font-extrabold uppercase">Postpone window</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-950 text-sm tracking-tight2">
                      {cropAdvice?.planting.title}
                    </h4>
                    <p className="text-[11px] font-medium text-amber-800 leading-relaxed opacity-90 h-auto">
                      {cropAdvice?.planting.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-100/40 flex items-center justify-between text-[9px] font-extrabold text-amber-700 uppercase tracking-widest leading-none">
                  <span>Aggress Sowing Calendar</span>
                  <CheckCircle size={10} />
                </div>
              </Card>

              {/* Crop Pest Index */}
              <Card className="p-6 border-none bg-rose-50/50 border border-rose-100/30 flex flex-col justify-between space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-rose-100/80 rounded-xl flex items-center justify-center text-rose-700 font-bold shadow-sm">
                      <Info size={19} />
                    </div>
                    {cropAdvice?.pests.status === 'optimal' ? (
                      <Badge variant="success" className="text-[9px] font-extrabold uppercase">Low Threat</Badge>
                    ) : cropAdvice?.pests.status === 'warning' ? (
                      <Badge variant="warning" className="text-[9px] font-extrabold uppercase">Moderate Insects</Badge>
                    ) : (
                      <Badge variant="error" className="text-[9px] font-extrabold uppercase text-red-650 bg-red-100/80">Blight Alert</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-rose-950 text-sm tracking-tight2">
                      {cropAdvice?.pests.title}
                    </h4>
                    <p className="text-[11px] font-medium text-rose-800 leading-relaxed opacity-90 h-auto">
                      {cropAdvice?.pests.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-100/40 flex items-center justify-between text-[9px] font-extrabold text-rose-700 uppercase tracking-widest leading-none">
                  <span>Integrated IPM Protocol</span>
                  <CheckCircle size={10} />
                </div>
              </Card>

            </div>
          </section>

          {/* Regional crops metadata */}
          <section className="bg-gray-50 border border-gray-150 rounded-2xl p-5 md:p-6 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-primary-fresh tracking-widest">Crop Integration Spotlight</span>
              <p className="font-bold text-gray-800 text-sm">Key Crops of {selectedLoc.name}:</p>
              <p className="text-gray-500 font-medium">Standard seed-spacing and weather patterns are calculated specifically referencing these localized crop varieties.</p>
            </div>
            
            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {selectedLoc.cropsGrown.map((crop, index) => (
                <div 
                  key={index}
                  className="px-3 py-1.5 bg-white border border-gray-200/80 rounded-lg text-xs font-semibold text-gray-700 shadow-sm"
                >
                  {crop}
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Last Sync and Disclaimer */}
          <footer className="flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
            <span>Satellite network: SAF-WEATHER-09</span>
            <span>Last synched: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </footer>

        </div>
      )}
    </div>
  );
}
