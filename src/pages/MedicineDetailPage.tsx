import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  BellRing,
  ArrowRight,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Medicine, PharmacyAvailability, Alternative, Pharmacy } from '../types';
import { ReserveModal } from '../components/ReserveModal';
import { RestockModal } from '../components/RestockModal';

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [availability, setAvailability] = useState<PharmacyAvailability[]>([]);
  const [alternatives, setAlternatives] = useState<(Alternative & { alternative_medicine: Medicine })[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting for pharmacy list
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'status'>('distance');

  // Modals state
  const [selectedPharmacyForReserve, setSelectedPharmacyForReserve] = useState<{
    pharmacy: Pharmacy;
    price: number;
    quantity: number;
  } | null>(null);

  const [restockModalOpen, setRestockModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [med, avail, alts, phs] = await Promise.all([
        api.medicines.getById(id),
        api.medicines.getAvailability(id),
        api.alternatives.forMedicine(id),
        api.pharmacies.list()
      ]);
      setMedicine(med);
      setAvailability(avail);
      setAlternatives(alts);
      setAllPharmacies(phs);
    } catch (err: any) {
      setError(err.message || 'Medicine not found');
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
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Medicine Not Found</h2>
          <p className="text-xs text-slate-500">The medication you requested could not be retrieved.</p>
          <Link
            to="/medicines"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
          >
            Back to Medicine Search
          </Link>
        </div>
      </div>
    );
  }

  // Sorted availability
  const sortedAvailability = [...availability].sort((a, b) => {
    if (sortBy === 'distance') return a.distance_km - b.distance_km;
    if (sortBy === 'price') return a.price - b.price;
    // Status sort: in_stock > low_stock > out_of_stock
    const order: Record<string, number> = { in_stock: 1, low_stock: 2, out_of_stock: 3 };
    return (order[a.status] || 9) - (order[b.status] || 9);
  });

  const inStockCount = availability.filter(a => a.status === 'in_stock').length;
  const anyStockAvailable = availability.some(a => a.status !== 'out_of_stock');

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Trail */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link to="/" className="hover:text-slate-800">Home</Link>
          <span>/</span>
          <Link to="/medicines" className="hover:text-slate-800">Medicines</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{medicine.name}</span>
        </nav>

        {/* Medicine Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {medicine.name}
                </h1>
                {medicine.prescription_required ? (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                    Rx · Prescription Required
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    OTC · Over The Counter
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Active Ingredient: <span className="text-blue-600">{medicine.generic_name}</span> · {medicine.strength}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span>Form: <strong className="text-slate-800">{medicine.dosage_form}</strong></span>
                <span>·</span>
                <span>Category: <strong className="text-slate-800">{medicine.category}</strong></span>
                <span>·</span>
                <span>Manufacturer: <strong className="text-slate-800">{medicine.manufacturer}</strong></span>
              </div>
            </div>

            {/* Quick Price & Action Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 text-right space-y-1.5 min-w-[200px]">
              <span className="text-xs text-slate-500 block">Lowest Counter Price</span>
              <div className="text-2xl font-black text-blue-600 tabular-nums">
                {medicine.lowest_price ? `₹${medicine.lowest_price.toFixed(2)}` : 'N/A'}
              </div>
              <p className="text-[11px] text-slate-500">
                {inStockCount > 0 ? (
                  <span className="text-emerald-600 font-semibold">Available in {inStockCount} pharmacies</span>
                ) : (
                  <span className="text-red-500 font-semibold">Currently out of stock</span>
                )}
              </p>

              {!anyStockAvailable && (
                <button
                  onClick={() => setRestockModalOpen(true)}
                  className="mt-2 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <BellRing className="w-3.5 h-3.5" /> Notify When Restocked
                </button>
              )}
            </div>
          </div>

          {/* Description & Clinical Information */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              General Clinical Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {medicine.description}
            </p>
          </div>

          {/* Mandatory Healthcare Advice Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Safety Disclaimer: </span>
              Information provided by this platform is strictly for informational and pharmacy availability purposes.
              Do not alter dosage or substitute medications without consulting a qualified medical doctor or licensed pharmacist.
            </div>
          </div>
        </div>

        {/* Section 1: Availability in Local Pharmacies */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Nearby Pharmacy Stock &amp; Price Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Real-time counter prices and verified quantities sorted by distance.
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="distance">Distance (Nearest First)</option>
                <option value="price">Price (Lowest First)</option>
                <option value="status">Stock Status</option>
              </select>
            </div>
          </div>

          {sortedAvailability.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No connected pharmacies currently stock this item</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                None of the pharmacies in our local network have registered active stock. Click below to receive an alert when a pharmacy restocks it.
              </p>
              <button
                onClick={() => setRestockModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                Set Restock Alert
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              {sortedAvailability.map(item => (
                <div
                  key={item.inventory_id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Pharmacy Identity */}
                  <div className="space-y-1 md:w-5/12">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/pharmacies/${item.pharmacy_id}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {item.pharmacy_name}
                      </Link>
                      {item.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">{item.address}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                      <span className="text-slate-700 font-mono font-medium">{item.distance_km} km away</span>
                      <span>·</span>
                      <span className={item.is_open_now ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                        {item.is_open_now ? 'Open Now' : 'Closed'}
                      </span>
                      <span>·</span>
                      <span className="text-slate-400">{item.phone}</span>
                    </div>
                  </div>

                  {/* Stock Status & Quantity */}
                  <div className="flex items-center gap-4 text-xs md:w-3/12">
                    <div>
                      {item.status === 'in_stock' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> In Stock
                        </span>
                      ) : item.status === 'low_stock' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs">
                          <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      )}
                      <span className="block text-[11px] text-slate-400 mt-1 tabular-nums">
                        {item.quantity > 0 ? `~${item.quantity} units available` : 'Replenishment pending'}
                      </span>
                    </div>
                  </div>

                  {/* Price & Reserve Action */}
                  <div className="flex items-center justify-between md:justify-end gap-5 md:w-4/12">
                    <div className="text-left md:text-right">
                      <span className="text-base font-black text-slate-900 tabular-nums">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Updated {new Date(item.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {item.status !== 'out_of_stock' ? (
                      <button
                        onClick={() =>
                          setSelectedPharmacyForReserve({
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        Reserve for Pickup
                      </button>
                    ) : (
                      <button
                        onClick={() => setRestockModalOpen(true)}
                        className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        <BellRing className="w-3.5 h-3.5" /> Alert Me
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Pharmacist-Verified Equivalent Options */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Pharmacist-Verified Equivalent Options
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Medically verified bioequivalent products with identical therapeutic indications.
              </p>
            </div>
          </div>

          {/* Critical substitution advisory warning */}
          <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 leading-relaxed">
            <span className="font-bold">Clinical Advisory: </span>
            Never change, start, or substitute medicines on your own. Bioequivalent alternatives are shown here
            solely when confirmed by an authorized pharmacist. Always obtain approval from your prescribing doctor or pharmacist before substituting.
          </div>

          {alternatives.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
              No pharmacist-verified alternatives have been recorded in the database for {medicine.name}.
              MediFind adheres strictly to verified records and does not algorithmically fabricate substitutions.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alternatives.map(alt => (
                <div
                  key={alt.id}
                  className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified by Pharmacist
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {alt.verification_date}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">
                      {alt.alternative_medicine?.name || 'Verified Alternative'}
                    </h3>

                    <p className="text-xs text-slate-600">
                      <strong>Active Ingredient:</strong> {alt.alternative_medicine?.generic_name} ({alt.alternative_medicine?.strength})
                    </p>

                    <p className="text-xs text-slate-600">
                      <strong>Dosage Form:</strong> {alt.alternative_medicine?.dosage_form} · {alt.alternative_medicine?.manufacturer}
                    </p>

                    <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed space-y-1">
                      <div className="text-[11px] font-semibold text-blue-900">
                        {alt.pharmacist_name}
                        {alt.pharmacist_license && ` (${alt.pharmacist_license})`}
                      </div>
                      <p className="text-slate-600 italic">"{alt.notes}"</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Price from ₹{alt.alternative_medicine?.lowest_price ? alt.alternative_medicine.lowest_price.toFixed(2) : '30.00'}
                    </span>
                    <button
                      onClick={() => navigate(`/medicines/${alt.alternative_medicine_id}`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Alternative Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedPharmacyForReserve && (
        <ReserveModal
          isOpen={true}
          onClose={() => setSelectedPharmacyForReserve(null)}
          medicine={medicine}
          pharmacy={selectedPharmacyForReserve.pharmacy}
          unitPrice={selectedPharmacyForReserve.price}
          availableQuantity={selectedPharmacyForReserve.quantity}
          onSuccess={() => {
            setSelectedPharmacyForReserve(null);
            loadData();
          }}
        />
      )}

      {restockModalOpen && (
        <RestockModal
          isOpen={restockModalOpen}
          onClose={() => setRestockModalOpen(false)}
          medicine={medicine}
          pharmacies={allPharmacies}
          onSuccess={() => setRestockModalOpen(false)}
        />
      )}
    </div>
  );
};
