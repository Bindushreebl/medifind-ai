import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingDown,
  ArrowUpDown,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Medicine, PharmacyAvailability, Pharmacy } from '../types';
import { ReserveModal } from '../components/ReserveModal';

export const PriceComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>(
    searchParams.get('med') || 'med-1'
  );
  const [availability, setAvailability] = useState<PharmacyAvailability[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'stock'>('price');
  const [isLoading, setIsLoading] = useState(false);

  const [reserveModalData, setReserveModalData] = useState<{
    pharmacy: Pharmacy;
    price: number;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    async function loadMedicines() {
      try {
        const list = await api.medicines.list();
        setMedicines(list);
        if (!selectedMedicineId && list.length > 0) {
          setSelectedMedicineId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load medicines:', err);
      }
    }
    loadMedicines();
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedMedicineId) return;
      setIsLoading(true);
      try {
        const data = await api.medicines.getAvailability(selectedMedicineId);
        setAvailability(data);
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAvailability();
  }, [selectedMedicineId]);

  const selectedMed = medicines.find(m => m.id === selectedMedicineId);

  const sortedList = [...availability].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'distance') return a.distance_km - b.distance_km;
    const order: Record<string, number> = { in_stock: 1, low_stock: 2, out_of_stock: 3 };
    return (order[a.status] || 9) - (order[b.status] || 9);
  });

  const inStockPrices = availability.filter(a => a.status !== 'out_of_stock').map(a => a.price);
  const minPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices) : 0;
  const maxPrice = inStockPrices.length > 0 ? Math.max(...inStockPrices) : 0;
  const maxSavings = maxPrice > minPrice ? (maxPrice - minPrice).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pharmacy Price &amp; Availability Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare live OTC and prescription medication prices across local verified pharmacy counters.
          </p>
        </div>

        {/* Medicine Selector Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Medicine to Compare
            </label>
            <select
              value={selectedMedicineId}
              onChange={e => {
                setSelectedMedicineId(e.target.value);
                setSearchParams({ med: e.target.value });
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.generic_name}) · {m.strength} · {m.dosage_form}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs self-end md:self-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort results:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="price">Lowest Price First</option>
              <option value="distance">Nearest Distance First</option>
              <option value="stock">Highest Availability First</option>
            </select>
          </div>
        </div>

        {/* Selected Medicine Highlight & Savings Banner */}
        {selectedMed && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedMed.name}</h2>
                {selectedMed.prescription_required ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Rx</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">OTC</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedMed.generic_name} · {selectedMed.strength} · {selectedMed.manufacturer}
              </p>
            </div>

            {maxSavings && parseFloat(maxSavings) > 0 && (
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>
                  Save up to <strong>₹{maxSavings}</strong> per unit by choosing the lowest-priced counter!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left">
                    Pharmacy
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left">
                    Distance
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left">
                    Stock Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Counter Price
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left">
                    Last Sync
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Loading pharmacy stock...
                    </td>
                  </tr>
                ) : sortedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No pharmacy availability records found.
                    </td>
                  </tr>
                ) : (
                  sortedList.map((item, index) => {
                    const isLowestPrice = item.price === minPrice && item.status !== 'out_of_stock';

                    return (
                      <tr key={item.inventory_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/pharmacies/${item.pharmacy_id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {item.pharmacy_name}
                            </Link>
                            {item.verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {item.address}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap font-mono text-slate-700 tabular-nums">
                          {item.distance_km} km
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {item.status === 'in_stock' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3" /> In Stock ({item.quantity})
                            </span>
                          ) : item.status === 'low_stock' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" /> Low Stock ({item.quantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isLowestPrice && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Best Price
                              </span>
                            )}
                            <span className="text-sm font-extrabold text-slate-900 tabular-nums font-mono">
                              ₹{item.price.toFixed(2)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {new Date(item.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          {item.status !== 'out_of_stock' ? (
                            <button
                              onClick={() =>
                                setReserveModalData({
                                  pharmacy: {
                                    id: item.pharmacy_id,
                                    name: item.pharmacy_name,
                                    address: item.address,
                                    phone: item.phone,
                                    distance_km: item.distance_km,
                                    owner_id: '',
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                    opening_time: item.opening_time,
                                    closing_time: item.closing_time,
                                    verified: item.verified,
                                    rating: item.rating,
                                    review_count: item.review_count,
                                    created_at: ''
                                  },
                                  price: item.price,
                                  quantity: item.quantity
                                })
                              }
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                              Reserve
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {reserveModalData && selectedMed && (
        <ReserveModal
          isOpen={true}
          onClose={() => setReserveModalData(null)}
          medicine={selectedMed}
          pharmacy={reserveModalData.pharmacy}
          unitPrice={reserveModalData.price}
          availableQuantity={reserveModalData.quantity}
          onSuccess={() => setReserveModalData(null)}
        />
      )}
    </div>
  );
};
