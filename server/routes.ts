import { Router, Response } from 'express';
import { db } from './db.js';
import {
  AuthRequest,
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  generateToken,
  comparePassword,
  hashPassword
} from './auth.js';
import { StockStatus, ReservationStatus } from './types.js';

export const apiRouter = Router();

// Default user reference coordinates for demo distance estimation (Bengaluru Tech Corridor)
const DEFAULT_USER_LAT = 12.9350;
const DEFAULT_USER_LNG = 77.6200;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function isOpenNow(openingTime: string, closingTime: string): boolean {
  if (openingTime.toLowerCase().includes('24') || closingTime.toLowerCase().includes('24')) {
    return true;
  }
  // For demo realism: default open during standard hours
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= 8 && currentHour < 22;
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', (req, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const userRole = role === 'PHARMACY' ? 'PHARMACY' : 'USER';
  const newUser = db.createUser({
    name,
    email,
    phone: phone || '',
    password_hash: hashPassword(password),
    role: userRole
  });

  // If registering as a pharmacy, auto-create a starter pharmacy entity for the user
  if (userRole === 'PHARMACY') {
    db.createPharmacy({
      owner_id: newUser.id,
      name: `${newUser.name.split(' ')[0]}'s Pharmacy`,
      address: 'Near Central Hospital Road, Bengaluru',
      latitude: 12.9400 + (Math.random() * 0.04 - 0.02),
      longitude: 77.6200 + (Math.random() * 0.04 - 0.02),
      phone: newUser.phone || '+91 80 2500 0000',
      opening_time: '08:00 AM',
      closing_time: '10:00 PM',
      verified: false,
      rating: 5.0,
      review_count: 1
    });
  }

  const token = generateToken(newUser);
  const { password_hash, ...safeUser } = newUser;

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user: safeUser
  });
});

apiRouter.post('/auth/login', (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;
  const pharmacy = user.role === 'PHARMACY' ? db.getPharmacyByOwnerId(user.id) : undefined;

  return res.json({
    message: 'Login successful',
    token,
    user: safeUser,
    pharmacy
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { password_hash, ...safeUser } = req.user;
  const pharmacy = req.user.role === 'PHARMACY' ? db.getPharmacyByOwnerId(req.user.id) : undefined;
  return res.json({
    user: safeUser,
    pharmacy
  });
});

// ==========================================
// 2. MEDICINES ENDPOINTS
// ==========================================

apiRouter.get('/medicines', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  const { q, category, prescription_required } = req.query;
  let list = db.getMedicines();

  if (category && category !== 'All') {
    list = list.filter(m => m.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (prescription_required !== undefined) {
    const isRx = prescription_required === 'true';
    list = list.filter(m => m.prescription_required === isRx);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const queryStr = q.trim().toLowerCase();
    db.recordSearch(queryStr, req.user?.id);

    list = list.filter(m =>
      m.name.toLowerCase().includes(queryStr) ||
      m.generic_name.toLowerCase().includes(queryStr) ||
      m.category.toLowerCase().includes(queryStr) ||
      m.manufacturer.toLowerCase().includes(queryStr)
    );
  }

  // Enrich with availability summary
  const enriched = list.map(med => {
    const inv = db.getInventoryByMedicine(med.id);
    const inStockItems = inv.filter(i => i.status === 'in_stock');
    const lowStockItems = inv.filter(i => i.status === 'low_stock');
    const availablePharmaciesCount = inStockItems.length + lowStockItems.length;
    const prices = inStockItems.concat(lowStockItems).map(i => i.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : null;

    return {
      ...med,
      available_pharmacies_count: availablePharmaciesCount,
      total_stock_count: inv.reduce((sum, item) => sum + item.quantity, 0),
      lowest_price: lowestPrice,
      highest_price: highestPrice,
      has_in_stock: inStockItems.length > 0
    };
  });

  return res.json(enriched);
});

apiRouter.get('/medicines/suggestions', (req, res: Response) => {
  const q = (req.query.q as string || '').trim().toLowerCase();
  if (!q || q.length < 1) {
    return res.json([]);
  }

  const allMeds = db.getMedicines();
  
  // Aggregate generic names matching query in either generic_name or brand name
  const genericMap = new Map<string, { generic_name: string; matching_medicines: { id: string; name: string; category: string }[]; count: number }>();

  for (const med of allMeds) {
    const genericLower = med.generic_name.toLowerCase();
    const nameLower = med.name.toLowerCase();

    // Check if query matches generic name or brand name
    if (genericLower.includes(q) || nameLower.includes(q)) {
      if (!genericMap.has(med.generic_name)) {
        genericMap.set(med.generic_name, {
          generic_name: med.generic_name,
          matching_medicines: [],
          count: 0
        });
      }
      const entry = genericMap.get(med.generic_name)!;
      entry.count += 1;
      if (!entry.matching_medicines.some(m => m.id === med.id)) {
        entry.matching_medicines.push({
          id: med.id,
          name: med.name,
          category: med.category
        });
      }
    }
  }

  // Sort matching suggestions: exact startsWith generic_name first, then others
  const results = Array.from(genericMap.values()).sort((a, b) => {
    const aStarts = a.generic_name.toLowerCase().startsWith(q);
    const bStarts = b.generic_name.toLowerCase().startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return b.count - a.count;
  });

  return res.json(results.slice(0, 8));
});

apiRouter.get('/medicines/search', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string || '').trim().toLowerCase();
  if (!q) {
    return res.json([]);
  }

  db.recordSearch(q, req.user?.id);
  const medicines = db.getMedicines().filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.generic_name.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );

  return res.json(medicines);
});

apiRouter.get('/medicines/:id', (req, res: Response) => {
  const medicine = db.getMedicineById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const inv = db.getInventoryByMedicine(medicine.id);
  const inStockItems = inv.filter(i => i.status === 'in_stock');
  const lowStockItems = inv.filter(i => i.status === 'low_stock');
  const prices = inStockItems.concat(lowStockItems).map(i => i.price);

  return res.json({
    ...medicine,
    available_pharmacies_count: inStockItems.length + lowStockItems.length,
    lowest_price: prices.length > 0 ? Math.min(...prices) : null,
    highest_price: prices.length > 0 ? Math.max(...prices) : null
  });
});

apiRouter.get('/medicines/:id/availability', (req, res: Response) => {
  const medicine = db.getMedicineById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const userLat = parseFloat(req.query.lat as string) || DEFAULT_USER_LAT;
  const userLng = parseFloat(req.query.lng as string) || DEFAULT_USER_LNG;

  const inv = db.getInventoryByMedicine(medicine.id);

  const availability = inv.map(item => {
    const dist = calculateDistanceKm(userLat, userLng, item.pharmacy.latitude, item.pharmacy.longitude);
    return {
      inventory_id: item.id,
      pharmacy_id: item.pharmacy.id,
      pharmacy_name: item.pharmacy.name,
      address: item.pharmacy.address,
      phone: item.pharmacy.phone,
      verified: item.pharmacy.verified,
      rating: item.pharmacy.rating,
      review_count: item.pharmacy.review_count,
      latitude: item.pharmacy.latitude,
      longitude: item.pharmacy.longitude,
      distance_km: dist,
      price: item.price,
      quantity: item.quantity,
      status: item.status,
      last_updated: item.last_updated,
      is_open_now: isOpenNow(item.pharmacy.opening_time, item.pharmacy.closing_time),
      opening_time: item.pharmacy.opening_time,
      closing_time: item.pharmacy.closing_time
    };
  });

  // Sort by distance ascending by default
  availability.sort((a, b) => a.distance_km - b.distance_km);

  return res.json(availability);
});

apiRouter.post('/medicines', authenticateToken, requireRole(['ADMIN']), (req, res: Response) => {
  const { name, generic_name, category, dosage_form, strength, manufacturer, prescription_required, description } = req.body;
  if (!name || !generic_name || !category) {
    return res.status(400).json({ message: 'Name, generic name, and category are required' });
  }

  const med = db.createMedicine({
    name,
    generic_name,
    category,
    dosage_form: dosage_form || 'Tablet',
    strength: strength || 'N/A',
    manufacturer: manufacturer || 'Generic',
    prescription_required: !!prescription_required,
    description: description || ''
  });

  return res.status(201).json(med);
});

// ==========================================
// 3. PHARMACIES ENDPOINTS
// ==========================================

apiRouter.get('/pharmacies', (req, res: Response) => {
  const { search, verified, open_now } = req.query;
  const userLat = parseFloat(req.query.lat as string) || DEFAULT_USER_LAT;
  const userLng = parseFloat(req.query.lng as string) || DEFAULT_USER_LNG;

  let list = db.getPharmacies();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
  }

  if (verified === 'true') {
    list = list.filter(p => p.verified);
  }

  const enriched = list.map(p => {
    const dist = calculateDistanceKm(userLat, userLng, p.latitude, p.longitude);
    const open = isOpenNow(p.opening_time, p.closing_time);
    const inv = db.getInventoryByPharmacy(p.id);
    const availableCount = inv.filter(i => i.status !== 'out_of_stock').length;

    return {
      ...p,
      distance_km: dist,
      is_open_now: open,
      available_medicines_count: availableCount,
      total_inventory_count: inv.length
    };
  });

  if (open_now === 'true') {
    return res.json(enriched.filter(p => p.is_open_now));
  }

  enriched.sort((a, b) => a.distance_km - b.distance_km);
  return res.json(enriched);
});

apiRouter.get('/pharmacies/nearby', (req, res: Response) => {
  const userLat = parseFloat(req.query.lat as string) || DEFAULT_USER_LAT;
  const userLng = parseFloat(req.query.lng as string) || DEFAULT_USER_LNG;
  const limit = parseInt(req.query.limit as string) || 5;

  const list = db.getPharmacies().map(p => ({
    ...p,
    distance_km: calculateDistanceKm(userLat, userLng, p.latitude, p.longitude),
    is_open_now: isOpenNow(p.opening_time, p.closing_time),
    available_medicines_count: db.getInventoryByPharmacy(p.id).filter(i => i.status !== 'out_of_stock').length
  }));

  list.sort((a, b) => a.distance_km - b.distance_km);
  return res.json(list.slice(0, limit));
});

apiRouter.get('/pharmacies/:id', (req, res: Response) => {
  const pharmacy = db.getPharmacyById(req.params.id);
  if (!pharmacy) {
    return res.status(404).json({ message: 'Pharmacy not found' });
  }

  const userLat = parseFloat(req.query.lat as string) || DEFAULT_USER_LAT;
  const userLng = parseFloat(req.query.lng as string) || DEFAULT_USER_LNG;
  const dist = calculateDistanceKm(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
  const open = isOpenNow(pharmacy.opening_time, pharmacy.closing_time);
  const inventory = db.getInventoryByPharmacy(pharmacy.id);

  return res.json({
    ...pharmacy,
    distance_km: dist,
    is_open_now: open,
    inventory
  });
});

apiRouter.put('/pharmacies/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const pharmacy = db.getPharmacyById(req.params.id);
  if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

  // Only owner or admin can update
  if (req.user?.role !== 'ADMIN' && req.user?.id !== pharmacy.owner_id) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const updated = db.updatePharmacy(req.params.id, req.body);
  return res.json(updated);
});

// ==========================================
// 4. INVENTORY ENDPOINTS
// ==========================================

apiRouter.get('/inventory', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  const { pharmacy_id, medicine_id } = req.query;

  if (pharmacy_id && typeof pharmacy_id === 'string') {
    return res.json(db.getInventoryByPharmacy(pharmacy_id));
  }
  if (medicine_id && typeof medicine_id === 'string') {
    return res.json(db.getInventoryByMedicine(medicine_id));
  }

  // If user is a pharmacy owner, default to their pharmacy's inventory
  if (req.user?.role === 'PHARMACY') {
    const ph = db.getPharmacyByOwnerId(req.user.id);
    if (ph) {
      return res.json(db.getInventoryByPharmacy(ph.id));
    }
  }

  return res.json(db.getInventory());
});

apiRouter.post('/inventory', authenticateToken, requireRole(['PHARMACY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const { pharmacy_id, medicine_id, quantity, price, status } = req.body;

  let targetPharmacyId = pharmacy_id;
  if (req.user?.role === 'PHARMACY') {
    const ph = db.getPharmacyByOwnerId(req.user.id);
    if (!ph) return res.status(400).json({ message: 'No pharmacy profile associated with this account' });
    targetPharmacyId = ph.id;
  }

  if (!targetPharmacyId || !medicine_id || price === undefined) {
    return res.status(400).json({ message: 'Pharmacy, medicine, and price are required' });
  }

  const qty = parseInt(quantity) || 0;
  let stockStatus: StockStatus = status;
  if (!stockStatus) {
    if (qty <= 0) stockStatus = 'out_of_stock';
    else if (qty < 10) stockStatus = 'low_stock';
    else stockStatus = 'in_stock';
  }

  const saved = db.upsertInventoryItem({
    pharmacy_id: targetPharmacyId,
    medicine_id,
    quantity: qty,
    price: parseFloat(price),
    status: stockStatus
  });

  return res.json(saved);
});

apiRouter.delete('/inventory/:id', authenticateToken, requireRole(['PHARMACY', 'ADMIN']), (req: AuthRequest, res: Response) => {
  const success = db.deleteInventoryItem(req.params.id);
  if (!success) {
    return res.status(404).json({ message: 'Inventory item not found' });
  }
  return res.json({ message: 'Inventory item deleted' });
});

// ==========================================
// 5. PHARMACIST-VERIFIED ALTERNATIVES
// ==========================================

apiRouter.get('/medicines/:id/alternatives', (req, res: Response) => {
  const alternatives = db.getAlternativesForMedicine(req.params.id);
  return res.json(alternatives);
});

apiRouter.post('/alternatives', authenticateToken, requireRole(['ADMIN', 'PHARMACY']), (req: AuthRequest, res: Response) => {
  const { medicine_id, alternative_medicine_id, pharmacist_name, pharmacist_license, notes } = req.body;

  if (!medicine_id || !alternative_medicine_id || !pharmacist_name) {
    return res.status(400).json({ message: 'Original medicine, alternative medicine, and pharmacist name required' });
  }

  const alt = db.createAlternative({
    medicine_id,
    alternative_medicine_id,
    pharmacist_name,
    pharmacist_license: pharmacist_license || 'VERIFIED-CLINICAL-PHARMACIST',
    verification_status: req.user?.role === 'ADMIN' ? 'verified' : 'pending',
    verification_date: new Date().toISOString().split('T')[0],
    notes: notes || 'Clinical equivalent bioequivalence verified by pharmacist.'
  });

  return res.status(201).json(alt);
});

apiRouter.put('/alternatives/:id', authenticateToken, requireRole(['ADMIN']), (req, res: Response) => {
  const { status, notes } = req.body;
  const updated = db.updateAlternativeStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ message: 'Alternative record not found' });
  return res.json(updated);
});

// ==========================================
// 6. RESTOCK NOTIFICATION ALERTS
// ==========================================

apiRouter.post('/restock-alerts', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { medicine_id, pharmacy_id } = req.body;

  if (!medicine_id) {
    return res.status(400).json({ message: 'Medicine ID is required' });
  }

  const alert = db.createRestockAlert(req.user.id, medicine_id, pharmacy_id);
  const med = db.getMedicineById(medicine_id);

  db.createNotification({
    user_id: req.user.id,
    title: 'Restock Alert Created',
    message: `You will be notified immediately when ${med?.name || 'this medicine'} becomes available in stock.`,
    link: `/medicines/${medicine_id}`
  });

  return res.status(201).json({
    message: 'Restock notification request created successfully',
    alert
  });
});

apiRouter.get('/restock-alerts', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.user.role === 'ADMIN') {
    return res.json(db.getAllRestockAlerts());
  }

  if (req.user.role === 'PHARMACY') {
    const ph = db.getPharmacyByOwnerId(req.user.id);
    const all = db.getAllRestockAlerts();
    if (!ph) return res.json([]);
    return res.json(all.filter(a => !a.pharmacy_id || a.pharmacy_id === ph.id));
  }

  return res.json(db.getRestockAlertsByUser(req.user.id));
});

apiRouter.delete('/restock-alerts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const success = db.deleteRestockAlert(req.params.id, req.user.id);
  if (!success) {
    return res.status(404).json({ message: 'Alert not found or already removed' });
  }
  return res.json({ message: 'Restock alert removed' });
});

// ==========================================
// 7. RESERVATION SYSTEM
// ==========================================

apiRouter.post('/reservations', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { pharmacy_id, medicine_id, quantity, pickup_date, customer_phone, notes } = req.body;

  if (!pharmacy_id || !medicine_id || !quantity || !pickup_date) {
    return res.status(400).json({ message: 'Pharmacy, medicine, quantity, and pickup date are required' });
  }

  const invList = db.getInventoryByMedicine(medicine_id);
  const pharmacyStock = invList.find(i => i.pharmacy_id === pharmacy_id);
  const pricePerUnit = pharmacyStock ? pharmacyStock.price : 0;
  const totalPrice = pricePerUnit * parseInt(quantity);

  const reservation = db.createReservation({
    user_id: req.user.id,
    pharmacy_id,
    medicine_id,
    quantity: parseInt(quantity),
    total_price: totalPrice,
    pickup_date,
    customer_phone: customer_phone || req.user.phone || '',
    notes
  });

  return res.status(201).json({
    message: 'Reservation submitted successfully',
    reservation,
    disclaimer: 'Reservation is not a purchase or guarantee of availability until confirmed by the pharmacy.'
  });
});

apiRouter.get('/reservations', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.user.role === 'ADMIN') {
    return res.json(db.getAllReservations());
  }

  if (req.user.role === 'PHARMACY') {
    const ph = db.getPharmacyByOwnerId(req.user.id);
    if (!ph) return res.json([]);
    return res.json(db.getReservationsByPharmacy(ph.id));
  }

  return res.json(db.getReservationsByUser(req.user.id));
});

apiRouter.put('/reservations/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.body as { status: ReservationStatus };
  if (!status) return res.status(400).json({ message: 'Status is required' });

  const updated = db.updateReservationStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ message: 'Reservation not found' });
  return res.json(updated);
});

// ==========================================
// 8. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.json(db.getNotifications(req.user.id));
});

apiRouter.put('/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  db.markNotificationRead(req.params.id, req.user.id);
  return res.json({ message: 'Notification marked as read' });
});

apiRouter.put('/notifications/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  db.markAllNotificationsRead(req.user.id);
  return res.json({ message: 'All notifications marked as read' });
});

// ==========================================
// 9. ADMIN & SEARCH ANALYTICS
// ==========================================

apiRouter.get('/admin/analytics', authenticateToken, requireRole(['ADMIN']), (_req, res: Response) => {
  return res.json(db.getAdminAnalytics());
});

apiRouter.get('/admin/users', authenticateToken, requireRole(['ADMIN']), (_req, res: Response) => {
  const users = db.getUsers().map(({ password_hash, ...u }) => u);
  return res.json(users);
});

apiRouter.get('/admin/pharmacies', authenticateToken, requireRole(['ADMIN']), (_req, res: Response) => {
  return res.json(db.getPharmacies());
});

apiRouter.put('/admin/pharmacies/:id/verify', authenticateToken, requireRole(['ADMIN']), (req, res: Response) => {
  const { verified } = req.body;
  const ph = db.updatePharmacy(req.params.id, { verified: !!verified });
  if (!ph) return res.status(404).json({ message: 'Pharmacy not found' });
  return res.json(ph);
});

apiRouter.get('/admin/alternatives', authenticateToken, requireRole(['ADMIN']), (_req, res: Response) => {
  return res.json(db.getAllAlternatives());
});

apiRouter.get('/search/history', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  return res.json(db.getRecentSearches(req.user?.id));
});
