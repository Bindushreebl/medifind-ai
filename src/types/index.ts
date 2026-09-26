export type UserRole = 'USER' | 'PHARMACY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_time: string;
  closing_time: string;
  verified: boolean;
  rating: number;
  review_count: number;
  distance_km?: number;
  is_open_now?: boolean;
  available_medicines_count?: number;
  total_inventory_count?: number;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  strength: string;
  manufacturer: string;
  prescription_required: boolean;
  description: string;
  available_pharmacies_count?: number;
  total_stock_count?: number;
  lowest_price?: number | null;
  highest_price?: number | null;
  has_in_stock?: boolean;
  created_at: string;
}

export interface GenericSuggestion {
  generic_name: string;
  matching_medicines: {
    id: string;
    name: string;
    category: string;
  }[];
  count: number;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  status: StockStatus;
  last_updated: string;
  pharmacy?: Pharmacy;
  medicine?: Medicine;
}

export interface PharmacyAvailability {
  inventory_id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  address: string;
  phone: string;
  verified: boolean;
  rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  price: number;
  quantity: number;
  status: StockStatus;
  last_updated: string;
  is_open_now: boolean;
  opening_time: string;
  closing_time: string;
}

export interface Alternative {
  id: string;
  medicine_id: string;
  alternative_medicine_id: string;
  pharmacist_name: string;
  pharmacist_license: string;
  verification_status: 'verified' | 'pending' | 'rejected';
  verification_date: string;
  notes: string;
  medicine?: Medicine;
  alternative_medicine?: Medicine;
}

export interface RestockAlert {
  id: string;
  user_id: string;
  medicine_id: string;
  pharmacy_id?: string;
  status: 'active' | 'notified' | 'cancelled';
  created_at: string;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
  user?: User;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  user_id: string;
  pharmacy_id: string;
  medicine_id: string;
  quantity: number;
  total_price: number;
  status: ReservationStatus;
  pickup_date: string;
  customer_phone: string;
  notes?: string;
  created_at: string;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface SearchHistoryItem {
  id: string;
  user_id?: string;
  medicine_id?: string;
  query: string;
  searched_at: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalPharmacies: number;
  totalMedicines: number;
  totalSearches: number;
  totalReservations: number;
  outOfStockCount: number;
  restockRequestsCount: number;
  topSearches: { name: string; searches: number }[];
  topRequested: { name: string; alerts: number }[];
  inventoryDistribution: { name: string; value: number; fill: string }[];
  reservationBreakdown: { status: string; count: number }[];
}
