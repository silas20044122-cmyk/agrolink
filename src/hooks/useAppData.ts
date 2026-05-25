import { useState, useEffect } from 'react';
import { UserProfile, Farm, Crop, Notification, MarketPrice, TransportRequest, Transporter, SharedDeliveryGroup } from '../types';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Real Supabase Auth Hook
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      let storedUser: UserProfile | null = null;
      try {
        storedUser = JSON.parse(localStorage.getItem('agrolink_user_profile') || 'null');
      } catch (e) {}
      if (!storedUser) {
        storedUser = {
          id: 'mock-farmer-id',
          name: 'Silas Omulama',
          email: 'silas20044122@gmail.com',
          role: 'farmer',
          region: 'Kakamega',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silas'
        };
        localStorage.setItem('agrolink_user_profile', JSON.stringify(storedUser));
      }
      setUser(storedUser);
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

        // Sync with farmer_profiles
        supabase.from('farmer_profiles').upsert({
          id: session.user.id,
          displayName: profile.name,
          avatarUrl: profile.avatarUrl,
          location: profile.region,
          updatedAt: new Date().toISOString()
        }).then(({ error }) => {
           if (error) console.error('Error syncing profile:', error);
        });
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

        // Sync with farmer_profiles
        supabase.from('farmer_profiles').upsert({
          id: session.user.id,
          displayName: profile.name,
          avatarUrl: profile.avatarUrl,
          location: profile.region,
          updatedAt: new Date().toISOString()
        }).then(({ error }) => {
           if (error) console.error('Error syncing profile:', error);
        });
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
    if (!isSupabaseConfigured) {
      localStorage.removeItem('agrolink_user_profile');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    
    const newProfile = { ...user, ...updatedData };
    setUser(newProfile);
    
    if (!isSupabaseConfigured) {
      localStorage.setItem('agrolink_user_profile', JSON.stringify(newProfile));
      return;
    }
    
    try {
      const { error } = await supabase.from('customer_profiles').upsert({
        id: newProfile.id,
        displayName: newProfile.name,
        avatarUrl: newProfile.avatarUrl,
        location: newProfile.region,
        phoneNumber: newProfile.phoneNumber,
        updatedAt: new Date().toISOString()
      });
      if (error) {
        // Fallback to general farmer_profiles error check
        const { error: err2 } = await supabase.from('farmer_profiles').upsert({
          id: newProfile.id,
          displayName: newProfile.name,
          avatarUrl: newProfile.avatarUrl,
          location: newProfile.region,
          phoneNumber: newProfile.phoneNumber,
          updatedAt: new Date().toISOString()
        });
        if (err2) throw err2;
      }
    } catch (err) {
      console.error('Failed to sync profile change to Supabase:', err);
    }
  };

  return { user, loading, login, logout, updateProfile };
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

export function useTransport(userId: string | undefined) {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [sharedGroups, setSharedGroups] = useState<SharedDeliveryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransportData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch User's Requests
      const { data: reqData, error: reqError } = await supabase
        .from('transport_requests')
        .select('*')
        .eq('farmerId', userId)
        .order('createdAt', { ascending: false });

      if (!reqError && reqData) {
        setRequests(reqData);
      } else if (reqError) {
        console.error('Error fetching transport requests:', reqError);
      }

      // 2. Fetch Available Transporters
      const { data: transData, error: transError } = await supabase
        .from('transporters')
        .select('*')
        .eq('available', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (!transError && transData && transData.length > 0) {
        setTransporters(transData);
      } else {
        if (transError) console.error('Error fetching transporters:', transError);
      }

      // 3. Fetch Shared Delivery Groups
      const { data: groupData, error: groupError } = await supabase
        .from('shared_delivery_groups')
        .select('*')
        .order('transportDate', { ascending: true });

      if (!groupError && groupData) {
        // Fetch members for each group
        const groupsWithMembers = await Promise.all(groupData.map(async (group) => {
          const { data: memberData } = await supabase
            .from('shared_delivery_group_members')
            .select('*, author:farmer_profiles(*)')
            .eq('groupId', group.id);
          
          return {
            ...group,
            members: memberData?.map(m => ({
              id: m.id,
              groupId: m.groupId,
              requestId: m.requestId,
              farmerId: m.farmerId,
              farmerName: m.author?.displayName || 'Unknown Farmer',
              avatarUrl: m.author?.avatarUrl
            })) || []
          };
        }));
        
        if (groupsWithMembers.length > 0) {
          setSharedGroups(groupsWithMembers);
        } else {
          // No groups in DB, let's create one for the demo
          const { data: newGroup } = await supabase
            .from('shared_delivery_groups')
            .insert({
              destination: 'NCPB Kakamega',
              transportDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
              estimatedSavings: 3500,
              status: 'planning'
            })
            .select()
            .single();
          
          if (newGroup) setSharedGroups([newGroup]);
        }
      } else {
         if (groupError) console.error('Error fetching delivery groups:', groupError);
      }
    } catch (err) {
      console.error('Error in fetchTransportData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [userId]);

  const addRequest = async (newRequest: Partial<TransportRequest>) => {
    try {
      const { data, error } = await supabase
        .from('transport_requests')
        .insert([{ 
          ...newRequest, 
          farmerId: userId,
          status: 'pending',
          createdAt: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      if (data) setRequests(prev => [data[0], ...prev]);
      return data?.[0];
    } catch (err) {
      console.error('Error adding transport request:', err);
      return null;
    }
  };

  const updateRequestStatus = async (requestId: string, status: TransportRequest['status']) => {
    try {
      const { error } = await supabase
        .from('transport_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      return false;
    }
  };

  return { requests, transporters, sharedGroups, loading, addRequest, updateRequestStatus, refresh: fetchTransportData };
}
