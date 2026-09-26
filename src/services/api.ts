import {
  User,
  Pharmacy,
  Medicine,
  InventoryItem,
  PharmacyAvailability,
  Alternative,
  RestockAlert,
  Reservation,
  Notification,
  SearchHistoryItem,
  AdminAnalytics,
  StockStatus,
  ReservationStatus,
  GenericSuggestion
} from '../types';

const TOKEN_KEY = 'medifind_auth_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (body: { name: string; email: string; phone?: string; password: string; role?: string }) =>
      request<{ token: string; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
      }),

    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: User; pharmacy?: Pharmacy; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
      }),

    me: () => request<{ user: User; pharmacy?: Pharmacy }>('/auth/me')
  },

  // Medicines
  medicines: {
    list: (params?: { q?: string; category?: string; prescription_required?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.q) query.set('q', params.q);
      if (params?.category && params.category !== 'All') query.set('category', params.category);
      if (params?.prescription_required !== undefined) query.set('prescription_required', String(params.prescription_required));
      return request<Medicine[]>(`/medicines?${query.toString()}`);
    },

    search: (q: string) => request<Medicine[]>(`/medicines/search?q=${encodeURIComponent(q)}`),

    suggestions: (q: string) => request<GenericSuggestion[]>(`/medicines/suggestions?q=${encodeURIComponent(q)}`),

    getById: (id: string) => request<Medicine>(`/medicines/${id}`),

    getAvailability: (id: string, coords?: { lat: number; lng: number }) => {
      const query = new URLSearchParams();
      if (coords) {
        query.set('lat', coords.lat.toString());
        query.set('lng', coords.lng.toString());
      }
      return request<PharmacyAvailability[]>(`/medicines/${id}/availability?${query.toString()}`);
    },

    create: (data: Partial<Medicine>) =>
      request<Medicine>('/medicines', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Pharmacies
  pharmacies: {
    list: (params?: { search?: string; verified?: boolean; open_now?: boolean; lat?: number; lng?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.verified) query.set('verified', 'true');
      if (params?.open_now) query.set('open_now', 'true');
      if (params?.lat) query.set('lat', params.lat.toString());
      if (params?.lng) query.set('lng', params.lng.toString());
      return request<Pharmacy[]>(`/pharmacies?${query.toString()}`);
    },

    nearby: (limit: number = 5, coords?: { lat: number; lng: number }) => {
      const query = new URLSearchParams();
      query.set('limit', limit.toString());
      if (coords) {
        query.set('lat', coords.lat.toString());
        query.set('lng', coords.lng.toString());
      }
      return request<Pharmacy[]>(`/pharmacies/nearby?${query.toString()}`);
    },

    getById: (id: string, coords?: { lat: number; lng: number }) => {
      const query = new URLSearchParams();
      if (coords) {
        query.set('lat', coords.lat.toString());
        query.set('lng', coords.lng.toString());
      }
      return request<Pharmacy & { inventory: (InventoryItem & { medicine: Medicine })[] }>(`/pharmacies/${id}?${query.toString()}`);
    },

    update: (id: string, data: Partial<Pharmacy>) =>
      request<Pharmacy>(`/pharmacies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Inventory
  inventory: {
    list: (params?: { pharmacy_id?: string; medicine_id?: string }) => {
      const query = new URLSearchParams();
      if (params?.pharmacy_id) query.set('pharmacy_id', params.pharmacy_id);
      if (params?.medicine_id) query.set('medicine_id', params.medicine_id);
      return request<(InventoryItem & { medicine?: Medicine; pharmacy?: Pharmacy })[]>(`/inventory?${query.toString()}`);
    },

    upsert: (data: { pharmacy_id?: string; medicine_id: string; quantity: number; price: number; status?: StockStatus }) =>
      request<InventoryItem>('/inventory', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/inventory/${id}`, {
        method: 'DELETE'
      })
  },

  // Alternatives
  alternatives: {
    forMedicine: (medicineId: string) =>
      request<(Alternative & { alternative_medicine: Medicine })[]>(`/medicines/${medicineId}/alternatives`),

    create: (data: { medicine_id: string; alternative_medicine_id: string; pharmacist_name: string; pharmacist_license?: string; notes?: string }) =>
      request<Alternative>('/alternatives', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateStatus: (id: string, status: 'verified' | 'pending' | 'rejected', notes?: string) =>
      request<Alternative>(`/alternatives/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      })
  },

  // Restock Alerts
  restockAlerts: {
    create: (data: { medicine_id: string; pharmacy_id?: string }) =>
      request<{ message: string; alert: RestockAlert }>('/restock-alerts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    list: () => request<RestockAlert[]>('/restock-alerts'),

    delete: (id: string) =>
      request<{ message: string }>(`/restock-alerts/${id}`, {
        method: 'DELETE'
      })
  },

  // Reservations
  reservations: {
    create: (data: { pharmacy_id: string; medicine_id: string; quantity: number; pickup_date: string; customer_phone?: string; notes?: string }) =>
      request<{ message: string; reservation: Reservation; disclaimer: string }>('/reservations', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    list: () => request<Reservation[]>('/reservations'),

    updateStatus: (id: string, status: ReservationStatus) =>
      request<Reservation>(`/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },

  // Notifications
  notifications: {
    list: () => request<Notification[]>('/notifications'),
    markRead: (id: string) => request<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request<{ message: string }>('/notifications/read-all', { method: 'PUT' })
  },

  // Search History
  searchHistory: {
    list: () => request<SearchHistoryItem[]>('/search/history')
  },

  // Admin
  admin: {
    getAnalytics: () => request<AdminAnalytics>('/admin/analytics'),
    getUsers: () => request<User[]>('/admin/users'),
    getPharmacies: () => request<Pharmacy[]>('/admin/pharmacies'),
    verifyPharmacy: (id: string, verified: boolean) =>
      request<Pharmacy>(`/admin/pharmacies/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ verified })
      }),
    getAlternatives: () => request<(Alternative & { medicine: Medicine; alternative_medicine: Medicine })[]>('/admin/alternatives')
  }
};
