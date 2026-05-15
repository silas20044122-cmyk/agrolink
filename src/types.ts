export type UserRole = 'farmer' | 'admin' | 'officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  farmSize?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  totalArea: string;
  county: string;
  subCounty?: string;
  registrationDate: string;
}

export interface Crop {
  id: string;
  farmId: string;
  farmerId: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvest: string;
  status: 'healthy' | 'at-risk' | 'harvested' | 'planted';
  healthScore: number;
  location: string;
  area: string;
  typeId: string;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  pricePerUnit: number;
  unit: string;
  change: number;
  region: string;
  lastUpdated: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  rainProbability: number;
  forecast: {
    day: string;
    temp: number;
    icon: string;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface TransportRequest {
  id: string;
  farmerId: string;
  produceType: string;
  quantity: number;
  unit: string;
  pickupLocation: string;
  destination: string;
  preferredDate: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'matched' | 'scheduled' | 'in-transit' | 'delivered';
  notes?: string;
  createdAt: string;
  estimatedCost?: number;
  estimatedSavings?: number;
}

export interface Transporter {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  maxCapacity: string;
  currentLocation: string;
  available: boolean;
  createdAt: string;
  rating?: number;
}

export interface SharedDeliveryGroup {
  id: string;
  destination: string;
  transportDate: string;
  estimatedSavings: number;
  status: 'planning' | 'confirmed' | 'completed';
  members?: SharedGroupMember[];
}

export interface SharedGroupMember {
  id: string;
  groupId: string;
  requestId: string;
  farmerId: string;
  farmerName?: string;
  avatarUrl?: string;
}
