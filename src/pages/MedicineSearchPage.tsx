import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Building2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { Medicine } from '../types';
import { MedicineSearchBar } from '../components/MedicineSearchBar';

const CATEGORIES = [
  'All',
  'Analgesics & Antipyretics',
  'Antibiotics',
  'Antihistamines & Allergy',
  'Gastrointestinal & Antacids',
  'Diabetes Care',
  'Cardiovascular Care',
  'Respiratory Care',
  'Vitamins & Supplements'
];

export const MedicineSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock_only'>('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'availability'>('relevance');

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL params
  useEffect(() => {
    async function fetchMedicines() {
      setIsLoading(true);
      try {
        const queryCategory = selectedCategory !== 'All' ? selectedCategory : undefined;
        const res = await api.medicines.list({
          q: searchQuery.trim() || undefined,
          category: queryCategory
        });
        setMedicines(res);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchMedicines, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'All') {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Filter & sort
  let filtered = medicines.filter(m => {
    if (stockFilter === 'in_stock_only' && !m.has_in_stock) return false;
    if (prescriptionFilter === 'otc' && m.prescription_required) return false;
    if (prescriptionFilter === 'rx' && !m.prescription_required) return false;
    return true;
  });

  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => (a.lowest_price || 9999) - (b.lowest_price || 9999));
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => (b.lowest_price || 0) - (a.lowest_price || 0));
  } else if (sortBy === 'availability') {
    filtered.sort((a, b) => (b.available_pharmacies_count || 0) - (a.available_pharmacies_count || 0));
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medicine Catalog &amp; Local Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search medicine names or generic ingredients to view real-time pharmacy stock, prices, and verified alternatives.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4">
          <MedicineSearchBar
            initialValue={searchQuery}
            placeholder="Search by brand name, generic formula, or condition (e.g. Paracetamol, Metformin)..."
            onSearch={handleSearchChange}
            size="md"
          />

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Stock Filter */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Availability:</span>
                <button
                  onClick={() => setStockFilter(stockFilter === 'all' ? 'in_stock_only' : 'all')}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer ${
                    stockFilter === 'in_stock_only'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {stockFilter === 'in_stock_only' ? '✓ In Stock Only' : 'All Stock Status'}
                </button>
              </div>

              {/* Rx / OTC Filter */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Type:</span>
                <select
                  value={prescriptionFilter}
                  onChange={e => setPrescriptionFilter(e.target.value as any)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white text-slate-700 focus:outline-none"
                >
                  <option value="all">All (OTC + Rx)</option>
                  <option value="otc">OTC Only (No Rx)</option>
                  <option value="rx">Prescription Only (Rx)</option>
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white text-slate-700 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Lowest Price (₹ - High)</option>
                <option value="price_desc">Highest Price (₹ - Low)</option>
                <option value="availability">Highest Pharmacy Availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing <strong className="text-slate-800 tabular-nums">{filtered.length}</strong> medicines</span>
          {searchQuery && (
            <span>Results for "{searchQuery}"</span>
          )}
        </div>

        {/* Medicine Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse p-5">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No medicines found</h3>
            <p className="text-xs text-slate-500">
              No matching medications found for "{searchQuery}". Try searching generic active ingredients like Paracetamol, Cetirizine, or Pantoprazole.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStockFilter('all');
                setPrescriptionFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(med => (
              <div
                key={med.id}
                onClick={() => navigate(`/medicines/${med.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {med.generic_name} · <span className="font-medium text-slate-700">{med.strength}</span>
                      </p>
                    </div>

                    {med.prescription_required ? (
                      <span className="shrink-0 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                        Rx Required
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                        OTC Available
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {med.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-600 font-medium">{med.dosage_form}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{med.manufacturer}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Lowest Counter Price</span>
                    <span className="text-base font-extrabold text-blue-600 tabular-nums">
                      {med.lowest_price ? `₹${med.lowest_price.toFixed(2)}` : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 group-hover:text-blue-600">
                      {med.available_pharmacies_count ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {med.available_pharmacies_count} in stock
                        </span>
                      ) : (
                        <span className="text-red-500">Unavailable</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
