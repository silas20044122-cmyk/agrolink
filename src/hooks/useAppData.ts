import { useState, useEffect } from 'react';
import { UserProfile, Farm, Crop, Notification, MarketPrice } from '../types';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Real Supabase Auth Hook
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map Supabase user to our UserProfile
        const profile: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'farmer',
          region: session.user.user_metadata.region || 'Unknown',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        };
        setUser(profile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'farmer',
          region: session.user.user_metadata.region || 'Unknown',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
        };
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string) => {
    // For demo/prototype, we'll use OTP or just assume signin
    // Real implementation would use signWithPassword or signInWithOtp
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return { message: 'Check your email for the login link!' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, login, logout };
}

// Backward compatibility or rename for App.tsx
export const useMockAuth = useAuth;

// useFarms Hook
export function useFarms(userId: string | undefined) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchFarms() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('farmerId', userId);

        if (error) throw error;

        if (data) {
          setFarms(data);
        }
      } catch (err) {
        console.error('Error fetching farms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFarms();
  }, [userId]);

  const addFarm = async (newFarm: Partial<Farm>) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert([{ ...newFarm, farmerId: userId }])
        .select();

      if (error) throw error;
      if (data) setFarms(prev => [...prev, data[0]]);
      return data?.[0];
    } catch (err) {
      console.error('Error adding farm:', err);
      return null;
    }
  };

  return { farms, loading, setFarms, addFarm };
}

export function useCrops(userId: string | undefined, farmId?: string) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    async function fetchCrops() {
      setLoading(true);
      try {
        let query = supabase
          .from('crops')
          .select('*')
          .eq('farmerId', userId);
        
        if (farmId) {
          query = query.eq('farmId', farmId);
        }

        const { data, error } = await query;
          
        if (error) throw error;
        
        if (data) {
          setCrops(data);
        }
      } catch (err) {
        console.error('Error fetching crops:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCrops();
  }, [userId, farmId]);

  const addCrop = async (newCrop: Partial<Crop>) => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert([{ ...newCrop, farmerId: userId }])
        .select();
      
      if (error) throw error;
      if (data) setCrops(prev => [...prev, data[0]]);
      return data?.[0];
    } catch (err) {
      console.error('Error adding crop:', err);
      return null;
    }
  };

  return { crops, loading, setCrops, addCrop };
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;
    const mock: Notification[] = [
      { id: 'n1', title: 'Heavy Rain Warning', message: 'Heavy storms expected in Kakamega tomorrow. Secure your seedlings.', type: 'warning', createdAt: new Date().toISOString(), read: false },
      { id: 'n2', title: 'Market Opportunity', message: 'Maize prices in Kisumu have increased by 15%. Consider selling.', type: 'success', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
    ];
    setNotifications(mock);
  }, [userId]);

  return { notifications };
}

export function useMarketData(region: string) {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      try {
        // In a real app, this would be an external API like WFP or a local Agri-exchange
        // For this implementation, we simulate a real-time fetch with dynamic variations
        // but we'll structure it to easily point to a real endpoint
        
        // Simulating external API response structure
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            const basePrices: any = {
              'Nairobi': [
                { name: 'Maize (Dry)', price: 4200, unit: '90kg Bag', trend: 'up' },
                { name: 'Beans (Rosecoco)', price: 9500, unit: '90kg Bag', trend: 'down' },
                { name: 'Potatoes (Irish)', price: 3100, unit: '50kg Bag', trend: 'up' },
                { name: 'Tomatoes', price: 8400, unit: 'Crate', trend: 'up' },
                { name: 'Kales', price: 1800, unit: 'Bag', trend: 'neutral' },
              ],
              'Mombasa': [
                { name: 'Maize (Dry)', price: 4400, unit: '90kg Bag', trend: 'up' },
                { name: 'Beans (Rosecoco)', price: 9200, unit: '90kg Bag', trend: 'down' },
                { name: 'Potatoes (Irish)', price: 3400, unit: '50kg Bag', trend: 'up' },
                { name: 'Tomatoes', price: 8800, unit: 'Crate', trend: 'up' },
                { name: 'Rice (Pishori)', price: 15500, unit: '90kg Bag', trend: 'up' },
              ],
              'Kisumu': [
                { name: 'Maize (Dry)', price: 4100, unit: '90kg Bag', trend: 'up' },
                { name: 'Beans (Rosecoco)', price: 9700, unit: '90kg Bag', trend: 'neutral' },
                { name: 'Fish (Tilapia)', price: 450, unit: 'kg', trend: 'up' },
                { name: 'Tomatoes', price: 8200, unit: 'Crate', trend: 'down' },
                { name: 'Sorghum', price: 3200, unit: '90kg Bag', trend: 'up' },
              ]
            };

            const data = basePrices[region] || basePrices['Nairobi'];
            
            // Add some real-time flavor (random fluctuation)
            const liveData = data.map((item: any) => ({
              id: `${item.name}-${region}`.toLowerCase().replace(/\s+/g, '-'),
              cropName: item.name,
              pricePerUnit: item.price + (Math.random() * 200 - 100),
              unit: item.unit,
              change: (Math.random() * 5 - 2).toFixed(1),
              region: region,
              lastUpdated: new Date().toISOString()
            }));

            resolve(liveData);
          }, 800);
        });

        setMarketPrices(response as MarketPrice[]);
      } catch (err) {
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    // Refresh every 30 seconds for "real-time" feel
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [region]);

  return { marketPrices, loading };
}
