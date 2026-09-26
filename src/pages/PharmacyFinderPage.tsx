import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Star,
  CheckCircle,
  Filter,
  ArrowUpDown,
  Navigation,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Pharmacy } from '../types';

export const PharmacyFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'stock'>('distance');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacies() {
      setIsLoading(true);
      try {
        const list = await api.pharmacies.list({
          search: search.trim() || undefined,
          verified: verifiedOnly || undefined,
          open_now: openNowOnly || undefined
        });
        setPharmacies(list);
        if (list.length > 0 && !selectedPharmacyId) {
          setSelectedPharmacyId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load pharmacies:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(loadPharmacies, 200);
    return () => clearTimeout(timer);
  }, [search, verifiedOnly, openNowOnly]);

  const sortedPharmacies = [...pharmacies].sort((a, b) => {
    if (sortBy === 'distance') return (a.distance_km || 0) - (b.distance_km || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'stock') return (b.available_medicines_count || 0) - (a.available_medicines_count || 0);
    return 0;
  });

  const selectedPharmacy = pharmacies.find(p => p.id === selectedPharmacyId) || pharmacies[0];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Pharmacy Finder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Locate verified neighbourhood pharmacies, check live operating hours, and verify stock availability.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Reference Location: <strong>Bengaluru City Central</strong></span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by pharmacy name or area (e.g. Apollo, Indiranagar, HSR)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-3 text-xs">
              <button
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={`px-3 py-2 rounded-lg border font-medium cursor-pointer transition-colors ${
                  openNowOnly
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {openNowOnly ? '✓ Open Now Only' : 'Open Now'}
              </button>

              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-2 rounded-lg border font-medium cursor-pointer transition-colors ${
                  verifiedOnly
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {verifiedOnly ? '✓ Verified Only' : 'Verified'}
              </button>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
                >
                  <option value="distance">Nearest Distance</option>
                  <option value="rating">Highest Rating</option>
                  <option value="stock">Most Medicines in Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Pharmacy List + Interactive Simulated Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pharmacy Cards List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Found <strong>{sortedPharmacies.length}</strong> pharmacies in network</span>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
                ))}
              </div>
            ) : sortedPharmacies.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No pharmacies matched your filters</h3>
                <p className="text-xs text-slate-500">Try clearing the Open Now or Verified filters.</p>
              </div>
            ) : (
              sortedPharmacies.map(pharmacy => {
                const isSelected = selectedPharmacy?.id === pharmacy.id;
                return (
                  <div
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacyId(pharmacy.id)}
                    className={`bg-white rounded-xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">
                              {pharmacy.name}
                            </h3>
                            {pharmacy.verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {pharmacy.address}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-blue-600 font-mono tabular-nums">
                            {pharmacy.distance_km} km
                          </span>
                          <span className="block text-[10px] text-slate-400">approx. distance</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className={pharmacy.is_open_now ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
                            {pharmacy.is_open_now ? 'Open' : 'Closed'} ({pharmacy.opening_time} – {pharmacy.closing_time})
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pharmacy.phone}</span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{pharmacy.rating}</span>
                          <span className="text-slate-400 font-normal">({pharmacy.review_count})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600">
                        {pharmacy.available_medicines_count || 0} medicines in stock
                      </span>

                      <Link
                        to={`/pharmacies/${pharmacy.id}`}
                        onClick={e => e.stopPropagation()}
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View Full Inventory <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Simulated Interactive Map / Radar */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-400" />
                    Simulated Radar &amp; Area Map
                  </h3>
                  <p className="text-[11px] text-slate-400">Interactive pharmacy pin locations</p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-400/30">
                  Demo Mode
                </span>
              </div>

              {/* Map Graphic Area with Interactive Pins */}
              <div className="relative h-80 bg-slate-100 overflow-hidden flex items-center justify-center p-4 select-none">
                {/* Simulated Street Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>

                {/* Concentric Distance Rings */}
                <div className="absolute w-28 h-28 rounded-full border border-blue-300/60 pointer-events-none"></div>
                <div className="absolute w-52 h-52 rounded-full border border-dashed border-blue-300/40 pointer-events-none"></div>
                <div className="absolute w-72 h-72 rounded-full border border-dotted border-blue-300/30 pointer-events-none"></div>

                {/* User Center Pin */}
                <div className="absolute z-10 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-300 shadow-md"></div>
                  <span className="text-[10px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1 border border-slate-200">
                    You Are Here
                  </span>
                </div>

                {/* Pharmacy Pins placed according to relative coords */}
                {sortedPharmacies.slice(0, 8).map((pharmacy, idx) => {
                  // Generate visual offsets around center
                  const angles = [35, 120, 210, 310, 75, 160, 270, 345];
                  const distRatios = [0.45, 0.65, 0.55, 0.8, 0.7, 0.85, 0.9, 0.6];
                  const angle = angles[idx % angles.length];
                  const radius = distRatios[idx % distRatios.length] * 120;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;

                  const isSelected = selectedPharmacy?.id === pharmacy.id;

                  return (
                    <button
                      key={pharmacy.id}
                      onClick={() => setSelectedPharmacyId(pharmacy.id)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`
                      }}
                      className={`absolute z-20 flex flex-col items-center group transition-transform ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md font-bold text-[11px] cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                            : 'bg-white text-slate-800 border-2 border-emerald-600'
                        }`}
                      >
                        +
                      </div>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-xs mt-1 whitespace-nowrap border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {pharmacy.name.split(' ')[0]} ({pharmacy.distance_km}km)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Pharmacy Mini-Drawer */}
              {selectedPharmacy && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{selectedPharmacy.name}</h4>
                      <p className="text-xs text-slate-500">{selectedPharmacy.address}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      {selectedPharmacy.distance_km} km away
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-700 font-semibold">
                      {selectedPharmacy.available_medicines_count || 0} medications available in stock
                    </span>
                    <Link
                      to={`/pharmacies/${selectedPharmacy.id}`}
                      className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      View Pharmacy <ArrowUpDown className="w-3 h-3 rotate-90" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
