export type UserRole = 'USER' | 'PHARMACY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
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
  created_at: string;
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
}

export interface RestockAlert {
  id: string;
  user_id: string;
  medicine_id: string;
  pharmacy_id?: string;
  status: 'active' | 'notified' | 'cancelled';
  created_at: string;
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
}

export interface SearchHistoryItem {
  id: string;
  user_id?: string;
  medicine_id?: string;
  query: string;
  searched_at: string;
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

export interface DatabaseSchema {
  users: User[];
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  inventory: InventoryItem[];
  alternatives: Alternative[];
  restock_alerts: RestockAlert[];
  reservations: Reservation[];
  search_history: SearchHistoryItem[];
  notifications: Notification[];
}
