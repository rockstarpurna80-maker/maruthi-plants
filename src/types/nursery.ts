export type PlantCategory =
  | 'Vegetable Plants'
  | 'Fruit Plants'
  | 'Flowering Plants'
  | 'Indoor & Air Purifying'
  | 'Medicinal & Herbal'
  | 'Avenue & Shade Trees'
  | 'Bonsai & Exotic';

export interface PlantCareTips {
  wateringFrequency?: string;
  sunlightNeeds?: string;
  soilPreference?: string;
  fertilizerSchedule?: string;
  pruningTips?: string;
  seasonalCare?: string;
  growthNotes?: string;
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  teluguName?: string;
  category: PlantCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  inStock: boolean;
  description: string;
  sunlight: 'Full Sun' | 'Partial Shade' | 'Indirect Bright' | 'Low to Medium Light';
  watering: 'Daily' | 'Twice a Week' | 'Weekly' | 'When Top Soil Dries';
  soil?: string;
  size?: string;
  imageUrl: string;
  featured?: boolean;
  bestSeller?: boolean;
  tags?: string[];
  careTips?: PlantCareTips;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  plant: Plant;
  quantity: number;
  selectedSize?: string;
}

export interface CustomerEnquiry {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  plantInterest?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface NurseryOrder {
  id?: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'store_pickup' | 'home_delivery' | 'bulk_transport';
  deliveryAddress?: string;
  itemsSummary: string;
  items?: { plantId: string; plantName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  sunlight: string;
  watering: string;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'name';
  maxPrice: number;
}

export interface AdminLoginRecord {
  id?: string;
  email: string;
  userId?: string;
  status: 'authorized' | 'denied_unauthorized_email' | 'denied_passcode';
  userAgent?: string;
  timestamp: string;
}

export interface UploadedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  originalSize?: string;
  optimizedSize: string;
  dimensions?: string;
  category?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'customer';
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

export interface UserSessionLog {
  id?: string;
  userId: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'customer';
  timestamp: string;
  userAgent?: string;
  status: 'success' | 'failed' | 'denied';
}

