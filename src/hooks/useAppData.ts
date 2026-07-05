import { useState, useEffect } from 'react';
import { UserProfile, Farm, Crop, Notification, MarketPrice, TransportRequest, Transporter, SharedDeliveryGroup } from '../types';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Shared global state for useAuth
let globalUser: UserProfile | null = null;
let globalLoading = true;
const listeners = new Set<(user: UserProfile | null, loading: boolean) => void>();

function setGlobalState(newUser: UserProfile | null, newLoading: boolean) {
  globalUser = newUser;
  globalLoading = newLoading;
  listeners.forEach((listener) => listener(globalUser, globalLoading));
}

let isInitializing = false;

async function initializeAuth() {
  if (isInitializing) return;
  isInitializing = true;

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
        phoneNumber: '+254 712 345 678',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silas',
        bio: 'Dedicated farmer from Kakamega county focusing on maize and organic farming.'
      };
      localStorage.setItem('agrolink_user_profile', JSON.stringify(storedUser));
    }
    setGlobalState(storedUser, false);
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Try to fetch profile from farmer_profiles
      const { data: dbProfile, error: dbError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      let profile: UserProfile;
      if (dbProfile && !dbError) {
        profile = {
          id: session.user.id,
          name: dbProfile.displayName || session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'farmer',
          region: dbProfile.location || session.user.user_metadata.region || 'Kakamega',
          avatarUrl: dbProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          phoneNumber: session.user.user_metadata.phoneNumber || dbProfile.phoneNumber || '',
          bio: dbProfile.bio || ''
        };
      } else {
        profile = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'farmer',
          region: session.user.user_metadata.region || 'Kakamega',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          phoneNumber: session.user.user_metadata.phoneNumber || '',
          bio: ''
        };

        // Create initial database entry
        await supabase.from('farmer_profiles').upsert({
          id: session.user.id,
          displayName: profile.name,
          avatarUrl: profile.avatarUrl,
          location: profile.region,
          bio: profile.bio || '',
          updatedAt: new Date().toISOString()
        });
      }
      setGlobalState(profile, false);
    } else {
      setGlobalState(null, false);
    }
  } catch (err) {
    console.error('Error during auth initialization:', err);
    setGlobalState(null, false);
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      try {
        const { data: dbProfile } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const profile: UserProfile = {
          id: session.user.id,
          name: dbProfile?.displayName || session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'farmer',
          region: dbProfile?.location || session.user.user_metadata.region || 'Kakamega',
          avatarUrl: dbProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          phoneNumber: session.user.user_metadata.phoneNumber || dbProfile?.phoneNumber || '',
          bio: dbProfile?.bio || ''
        };
        setGlobalState(profile, false);
      } catch (err) {
        console.error('Error during auth state change profile fetch:', err);
      }
    } else {
      setGlobalState(null, false);
    }
  });
}

// Real Supabase Auth Hook
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);

  useEffect(() => {
    const listener = (u: UserProfile | null, l: boolean) => {
      setUser(u);
      setLoading(l);
    };
    listeners.add(listener);

    if (listeners.size === 1 && globalLoading) {
      initializeAuth();
    } else {
      setUser(globalUser);
      setLoading(globalLoading);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = async (email: string) => {
    if (!isSupabaseConfigured) {
      const mockProfile: UserProfile = {
        id: 'mock-farmer-id',
        name: 'Silas Omulama',
        email: email,
        role: 'farmer',
        region: 'Kakamega',
        phoneNumber: '+254 712 345 678',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silas',
        bio: 'Dedicated farmer from Kakamega county focusing on maize and organic farming.'
      };
      localStorage.setItem('agrolink_user_profile', JSON.stringify(mockProfile));
      setGlobalState(mockProfile, false);
      return { message: 'Demo sign-in successful!' };
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return { message: 'Check your email for the login link!' };
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('agrolink_user_profile');
      setGlobalState(null, false);
      return;
    }
    await supabase.auth.signOut();
    setGlobalState(null, false);
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!globalUser) return;

    const newProfile = { ...globalUser, ...updatedData };
    setGlobalState(newProfile, false);

    if (!isSupabaseConfigured) {
      localStorage.setItem('agrolink_user_profile', JSON.stringify(newProfile));
      return;
    }

    try {
      // 1. Persist metadata in auth for secure retrieval of custom attributes
      await supabase.auth.updateUser({
        data: {
          phoneNumber: newProfile.phoneNumber,
          region: newProfile.region,
          full_name: newProfile.name
        }
      });

      // 2. Sync with farmer_profiles (strictly using existing schema columns)
      const { error: farmError } = await supabase.from('farmer_profiles').upsert({
        id: newProfile.id,
        displayName: newProfile.name,
        avatarUrl: newProfile.avatarUrl,
        location: newProfile.region,
        bio: newProfile.bio || '',
        updatedAt: new Date().toISOString()
      });

      if (farmError) {
        throw farmError;
      }
    } catch (err) {
      console.error('Failed to sync profile change to Supabase:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!globalUser) throw new Error('User not logged in');

    // Client-side validations
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Only image files are allowed.');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size too large. Maximum allowable size is 2MB.');
    }

    if (!isSupabaseConfigured) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result as string;
          try {
            await updateProfile({ avatarUrl: base64String });
            resolve(base64String);
          } catch (e) {
            reject(new Error('Failed to update local avatar.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${globalUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Append cache-busting timestamp
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatarUrl: cacheBustedUrl });
      return cacheBustedUrl;
    } catch (err: any) {
      console.warn('Supabase storage upload failed, falling back to base64 encoding:', err);
      // Fail-safe Base64 conversion
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result as string;
          try {
            await updateProfile({ avatarUrl: base64String });
            resolve(base64String);
          } catch (e) {
            reject(new Error('Failed to update avatar with fallback base64 encoding.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });
    }
  };

  return { user, loading, login, logout, updateProfile, uploadAvatar };
}

// Backward compatibility or rename for App.tsx
export const useMockAuth = useAuth;

const DEFAULT_FARMS: Farm[] = [
  {
    id: 'mock-farm-1',
    farmerId: 'mock-farmer-id',
    name: 'Kakamega Central Farm',
    location: 'Kakamega Central',
    totalArea: '2.5 Acres',
    county: 'Kakamega',
    subCounty: 'Central',
    registrationDate: new Date().toISOString()
  },
  {
    id: 'mock-farm-2',
    farmerId: 'mock-farmer-id',
    name: 'Sugarcane Zone',
    location: 'Mumias West',
    totalArea: '5.0 Acres',
    county: 'Kakamega',
    subCounty: 'Mumias West',
    registrationDate: new Date().toISOString()
  }
];

const DEFAULT_CROPS: Crop[] = [
  {
    id: 'mock-crop-1',
    farmId: 'mock-farm-1',
    farmerId: 'mock-farmer-id',
    name: 'Maize',
    variety: 'H513 High Yield',
    plantingDate: '2026-04-10',
    expectedHarvest: '2026-08-15',
    status: 'healthy',
    healthScore: 92,
    location: 'Kakamega Central',
    area: '1.5 Acres',
    typeId: 'maize'
  },
  {
    id: 'mock-crop-2',
    farmId: 'mock-farm-1',
    farmerId: 'mock-farmer-id',
    name: 'Beans',
    variety: 'Rosecoco Premium',
    plantingDate: '2026-05-15',
    expectedHarvest: '2026-08-30',
    status: 'healthy',
    healthScore: 88,
    location: 'Kakamega Central',
    area: '1.0 Acre',
    typeId: 'beans'
  }
];

const DEFAULT_TRANSPORTERS: Transporter[] = [
  {
    id: 't-1',
    name: 'Wekesa Express',
    phone: '+254711223344',
    vehicleType: '3-Ton Canter Truck',
    maxCapacity: '3000 kg',
    currentLocation: 'Kakamega Town',
    available: true,
    rating: 4.8,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    name: 'Omondi Logistics',
    phone: '+254722334455',
    vehicleType: '10-Ton Lorry',
    maxCapacity: '10000 kg',
    currentLocation: 'Kisumu',
    available: true,
    rating: 4.6,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TRANSPORT_REQUESTS: TransportRequest[] = [
  {
    id: 'tr-1',
    farmerId: 'mock-farmer-id',
    produceType: 'Maize',
    quantity: 1200,
    unit: 'kg',
    pickupLocation: 'Kakamega Central',
    destination: 'NCPB Kakamega',
    preferredDate: '2026-07-10',
    urgency: 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedCost: 1800,
    estimatedSavings: 450
  }
];

const DEFAULT_SHARED_GROUPS: SharedDeliveryGroup[] = [
  {
    id: 'g-1',
    destination: 'NCPB Kakamega',
    transportDate: '2026-07-12',
    estimatedSavings: 3500,
    status: 'planning',
    members: [
      {
        id: 'gm-1',
        groupId: 'g-1',
        requestId: 'tr-1',
        farmerId: 'mock-farmer-id',
        farmerName: 'Silas Omulama',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=silas'
      }
    ]
  }
];

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

      if (!isSupabaseConfigured) {
        try {
          const stored = localStorage.getItem('agrolink_farms');
          if (stored) {
            setFarms(JSON.parse(stored));
          } else {
            localStorage.setItem('agrolink_farms', JSON.stringify(DEFAULT_FARMS));
            setFarms(DEFAULT_FARMS);
          }
        } catch (e) {
          setFarms(DEFAULT_FARMS);
        }
        setLoading(false);
        return;
      }

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
        try {
          const stored = localStorage.getItem('agrolink_farms');
          setFarms(stored ? JSON.parse(stored) : DEFAULT_FARMS);
        } catch (e) {
          setFarms(DEFAULT_FARMS);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFarms();
  }, [userId]);

  const addFarm = async (newFarm: Partial<Farm>) => {
    const fakeId = `farm-${Date.now()}`;
    const farmToAdd: Farm = {
      id: fakeId,
      farmerId: userId || 'mock-farmer-id',
      name: newFarm.name || 'Unnamed Farm',
      location: newFarm.location || 'Unknown',
      totalArea: newFarm.totalArea || '0.5 Acres',
      county: newFarm.county || 'Kakamega',
      subCounty: newFarm.subCounty || 'Unknown',
      registrationDate: newFarm.registrationDate || new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('agrolink_farms');
      const list = stored ? JSON.parse(stored) : [...DEFAULT_FARMS];
      list.push(farmToAdd);
      localStorage.setItem('agrolink_farms', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    setFarms(prev => [...prev, farmToAdd]);

    if (!isSupabaseConfigured) {
      return farmToAdd;
    }

    try {
      const { data, error } = await supabase
        .from('farms')
        .insert([{ ...newFarm, farmerId: userId }])
        .select();

      if (error) throw error;
      if (data) {
        setFarms(prev => prev.map(f => f.id === fakeId ? data[0] : f));
        return data?.[0];
      }
      return farmToAdd;
    } catch (err) {
      console.error('Error adding farm:', err);
      return farmToAdd;
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

      if (!isSupabaseConfigured) {
        try {
          const stored = localStorage.getItem('agrolink_crops');
          let list = DEFAULT_CROPS;
          if (stored) {
            list = JSON.parse(stored);
          } else {
            localStorage.setItem('agrolink_crops', JSON.stringify(DEFAULT_CROPS));
          }
          if (farmId) {
            list = list.filter(c => c.farmId === farmId);
          }
          setCrops(list);
        } catch (e) {
          setCrops(DEFAULT_CROPS);
        }
        setLoading(false);
        return;
      }

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
        try {
          const stored = localStorage.getItem('agrolink_crops');
          let list = stored ? JSON.parse(stored) : DEFAULT_CROPS;
          if (farmId) {
            list = list.filter((c: any) => c.farmId === farmId);
          }
          setCrops(list);
        } catch (e) {
          setCrops(DEFAULT_CROPS);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCrops();
  }, [userId, farmId]);

  const addCrop = async (newCrop: Partial<Crop>) => {
    const fakeId = `crop-${Date.now()}`;
    const cropToAdd: Crop = {
      id: fakeId,
      farmId: newCrop.farmId || 'mock-farm-1',
      farmerId: userId || 'mock-farmer-id',
      name: newCrop.name || 'Unnamed Crop',
      variety: newCrop.variety || 'Unknown Variety',
      plantingDate: newCrop.plantingDate || new Date().toISOString().split('T')[0],
      expectedHarvest: newCrop.expectedHarvest || new Date(Date.now() + 86400000 * 120).toISOString().split('T')[0],
      status: newCrop.status || 'planted',
      healthScore: newCrop.healthScore || 100,
      location: newCrop.location || 'Kakamega',
      area: newCrop.area || '1.0 Acre',
      typeId: newCrop.typeId || 'other'
    };

    try {
      const stored = localStorage.getItem('agrolink_crops');
      const list = stored ? JSON.parse(stored) : [...DEFAULT_CROPS];
      list.push(cropToAdd);
      localStorage.setItem('agrolink_crops', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    setCrops(prev => [...prev, cropToAdd]);

    if (!isSupabaseConfigured) {
      return cropToAdd;
    }

    try {
      const { data, error } = await supabase
        .from('crops')
        .insert([{ ...newCrop, farmerId: userId }])
        .select();
      
      if (error) throw error;
      if (data) {
        setCrops(prev => prev.map(c => c.id === fakeId ? data[0] : c));
        return data?.[0];
      }
      return cropToAdd;
    } catch (err) {
      console.error('Error adding crop:', err);
      return cropToAdd;
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

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem('agrolink_transport_requests');
        setRequests(stored ? JSON.parse(stored) : DEFAULT_TRANSPORT_REQUESTS);
        setTransporters(DEFAULT_TRANSPORTERS);
        setSharedGroups(DEFAULT_SHARED_GROUPS);
      } catch (e) {
        setRequests(DEFAULT_TRANSPORT_REQUESTS);
        setTransporters(DEFAULT_TRANSPORTERS);
        setSharedGroups(DEFAULT_SHARED_GROUPS);
      }
      setLoading(false);
      return;
    }

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
          setSharedGroups(DEFAULT_SHARED_GROUPS);
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
    const fakeId = `tr-${Date.now()}`;
    const reqToAdd: TransportRequest = {
      id: fakeId,
      farmerId: userId || 'mock-farmer-id',
      produceType: newRequest.produceType || 'Maize',
      quantity: newRequest.quantity || 100,
      unit: newRequest.unit || 'kg',
      pickupLocation: newRequest.pickupLocation || 'Kakamega',
      destination: newRequest.destination || 'NCPB',
      preferredDate: newRequest.preferredDate || new Date().toISOString().split('T')[0],
      urgency: newRequest.urgency || 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedCost: newRequest.estimatedCost || 1000,
      estimatedSavings: newRequest.estimatedSavings || 200,
      notes: newRequest.notes
    };

    try {
      const stored = localStorage.getItem('agrolink_transport_requests');
      const list = stored ? JSON.parse(stored) : [...DEFAULT_TRANSPORT_REQUESTS];
      list.unshift(reqToAdd);
      localStorage.setItem('agrolink_transport_requests', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    setRequests(prev => [reqToAdd, ...prev]);

    if (!isSupabaseConfigured) {
      return reqToAdd;
    }

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
      if (data) {
        setRequests(prev => prev.map(r => r.id === fakeId ? data[0] : r));
        return data?.[0];
      }
      return reqToAdd;
    } catch (err) {
      console.error('Error adding transport request:', err);
      return reqToAdd;
    }
  };

  const updateRequestStatus = async (requestId: string, status: TransportRequest['status']) => {
    try {
      const stored = localStorage.getItem('agrolink_transport_requests');
      if (stored) {
        const list: TransportRequest[] = JSON.parse(stored);
        const updated = list.map(r => r.id === requestId ? { ...r, status } : r);
        localStorage.setItem('agrolink_transport_requests', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('transport_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      return false;
    }
  };

  return { requests, transporters, sharedGroups, loading, addRequest, updateRequestStatus, refresh: fetchTransportData };
}
