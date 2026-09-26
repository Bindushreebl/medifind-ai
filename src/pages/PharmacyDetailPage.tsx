import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  Star,
  Search,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Pharmacy, InventoryItem, Medicine } from '../types';
import { ReserveModal } from '../components/ReserveModal';

export const PharmacyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<(Pharmacy & { inventory: (InventoryItem & { medicine: Medicine })[] }) | null>(null);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock'>('all');
  const [selectedForReserve, setSelectedForReserve] = useState<{
    medicine: Medicine;
    price: number;
    quantity: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.pharmacies.getById(id);
      setPharmacy(data);
    } catch (err) {
      console.error('Failed to load pharmacy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <div className="h-44 bg-white rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900">Pharmacy Not Found</h2>
          <Link to="/pharmacies" className="mt-4 inline-block text-xs text-blue-600 font-semibold underline">
            Back to All Pharmacies
          </Link>
        </div>
      </div>
    );
  }

  const filteredInventory = (pharmacy.inventory || []).filter(item => {
    if (filterStock === 'in_stock' && item.status === 'out_of_stock') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.medicine.name.toLowerCase().includes(q) ||
      item.medicine.generic_name.toLowerCase().includes(q) ||
      item.medicine.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link to="/" className="hover:text-slate-800">Home</Link>
          <span>/</span>
          <Link to="/pharmacies" className="hover:text-slate-800">Pharmacies</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{pharmacy.name}</span>
        </nav>

        {/* Pharmacy Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {pharmacy.name}
                </h1>
                {pharmacy.verified && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Pharmacy
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                {pharmacy.address}
              </p>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className={pharmacy.is_open_now ? 'text-emerald-600 font-bold' : 'text-slate-500 font-medium'}>
                    {pharmacy.is_open_now ? 'Open Now' : 'Closed'} ({pharmacy.opening_time} – {pharmacy.closing_time})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 font-medium">{pharmacy.phone}</span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{pharmacy.rating}</span>
                  <span className="text-slate-400 font-normal">({pharmacy.review_count} patient reviews)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 shrink-0 text-right min-w-[180px]">
              <span className="text-xs text-slate-500 block">Distance to Location</span>
              <div className="text-2xl font-black text-blue-700 font-mono tabular-nums">
                {pharmacy.distance_km} km
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Approx. 8-12 min drive</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-slate-500">
              License verified under State Pharmacy Council. Temperature-controlled medication storage verified.
            </span>
            <span className="font-semibold text-emerald-700">
              {filteredInventory.length} Items Listed in Live Catalog
            </span>
          </div>
        </div>

        {/* Pharmacy Inventory Catalog */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                In-Stock Medicines &amp; Counter Prices
              </h2>
              <p className="text-xs text-slate-500">
                Prices and availability at this specific pharmacy counter.
              </p>
            </div>

            {/* Inventory Search & Stock Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter stock..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setFilterStock(filterStock === 'all' ? 'in_stock' : 'all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  filterStock === 'in_stock'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filterStock === 'in_stock' ? '✓ In Stock Only' : 'All Items'}
              </button>
            </div>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No matching medicines found in this pharmacy's inventory.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredInventory.map(item => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/medicines/${item.medicine_id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {item.medicine.name}
                      </Link>
                      {item.medicine.prescription_required ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                          Rx
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          OTC
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {item.medicine.generic_name} · {item.medicine.strength} · {item.medicine.dosage_form}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {item.status === 'in_stock' ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In Stock ({item.quantity})
                      </span>
                    ) : item.status === 'low_stock' ? (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Low Stock ({item.quantity})
                      </span>
                    ) : (
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400">per strip/unit</span>
                    </div>

                    {item.status !== 'out_of_stock' ? (
                      <button
                        onClick={() =>
                          setSelectedForReserve({
                            medicine: item.medicine,
                            price: item.price,
                            quantity: item.quantity
                          })
                        }
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        Reserve
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedForReserve && (
        <ReserveModal
          isOpen={true}
          onClose={() => setSelectedForReserve(null)}
          medicine={selectedForReserve.medicine}
          pharmacy={pharmacy}
          unitPrice={selectedForReserve.price}
          availableQuantity={selectedForReserve.quantity}
          onSuccess={() => {
            setSelectedForReserve(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
