import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  TrendingDown,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Building2,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Medicine, Pharmacy } from '../types';
import { MedicineSearchBar } from '../components/MedicineSearchBar';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meds, phs] = await Promise.all([
          api.medicines.list(),
          api.pharmacies.nearby(4)
        ]);
        setFeaturedMedicines(meds.slice(0, 6));
        setNearbyPharmacies(phs);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed inline trust metadata */}
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <span>Real-Time Local Inventory</span>
                <span aria-hidden="true">·</span>
                <span>Pharmacist-Verified Equivalents</span>
                <span aria-hidden="true">·</span>
                <span>Zero Markup</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Find Your Medicine. <br className="hidden sm:inline" />
                <span className="text-blue-600">Find It Nearby.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Search medicine availability across community pharmacies, compare prices side-by-side,
                and discover safe, pharmacist-verified equivalent options in one place.
              </p>

              {/* Live Search with Real-time Generic Suggestions Dropdown */}
              <div className="relative max-w-xl">
                <MedicineSearchBar
                  placeholder="Search medicine name, generic formula (e.g. Paracetamol, Pan 40)..."
                  size="md"
                  className="shadow-md"
                />

                {/* Popular Search Suggestions */}
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
                  <span className="font-medium text-slate-400">Popular:</span>
                  {['Crocin 650', 'Pan 40', 'Cetzine 10mg', 'Brufen', 'Azithral'].map(term => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => navigate(`/medicines?q=${encodeURIComponent(term)}`)}
                      className="hover:text-blue-600 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Link
                  to="/medicines"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Browse All Medicines
                </Link>
                <Link
                  to="/pharmacies"
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Find Pharmacies
                </Link>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[16/10] bg-slate-100">
                <img
                  src="/src/assets/images/medifind_hero_pharmacy_1790405738626.jpg"
                  alt="Modern pharmacy consultation counter with licensed pharmacist"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-5">
                  <div className="text-white">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Verified Community Network
                    </span>
                    <p className="text-sm font-bold mt-1">Live Inventory Synchronized Every 15 Minutes</p>
                    <p className="text-xs text-slate-300 mt-0.5">8 Local Bengaluru Pharmacies Active</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Indicator */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg border border-slate-200 p-3.5 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  98%
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">High Stock Accuracy</p>
                  <p className="text-slate-500">Validated with counter staff</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Strip */}
      <section className="bg-amber-500/10 border-y border-amber-200/80 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-medium text-amber-900 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety First: </strong>
            Medicine substitutions should only be made after consultation with a qualified doctor or pharmacist.
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Simple 4-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">How MediFind Works</h2>
            <p className="text-sm text-slate-600 mt-2">
              Save time and avoid wasted pharmacy visits with transparent medicine availability and price comparisons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Search Medicine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Enter brand or generic name. Search among thousands of verified medications, dosages, and therapeutic categories.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Compare Pharmacies</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                View real-time stock levels (In Stock, Low Stock), distances, operating hours, and transparent counter prices.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Alternatives</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If out of stock, explore pharmacist-verified bioequivalent options with active ingredient equivalence and notes.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Reserve & Pickup</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hold your medicine with 1-click reservation or set an instant restock alert to be notified as soon as it arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacist-Verified Feature Spotlight */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white aspect-[4/3]">
                <img
                  src="/src/assets/images/pharmacist_verified_feature_1790405757099.jpg"
                  alt="Clinical pharmacist verifying medicine equivalence with digital records"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Clinical Safety Standard
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Pharmacist-Verified Equivalent Options
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                MediFind never uses automated algorithmic guessing to swap medications. Every single alternative record
                in our database is strictly reviewed and confirmed by a licensed clinical pharmacist with registration license numbers,
                ingredient bioequivalence checks, and detailed administration notes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Identical Active Ingredient
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Matching molecular compound, salt form, and milligram strength.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Pharmacist Accountability
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Every verification displays the pharmacist's name and state license ID.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/alternatives"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Explore Verified Bioequivalent Directory <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Medicines Preview */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Quick Availability</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Frequently Searched Medicines
              </h2>
            </div>
            <Link
              to="/medicines"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full Catalog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMedicines.map(med => (
              <div
                key={med.id}
                onClick={() => navigate(`/medicines/${med.id}`)}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {med.name}
                    </h3>
                    {med.prescription_required ? (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Rx
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        OTC
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {med.generic_name} · {med.strength}
                  </p>

                  <div className="mt-3 text-xs text-slate-500">
                    <span>{med.dosage_form}</span>
                    <span className="mx-1.5">·</span>
                    <span>{med.category}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Starting from</span>
                    <span className="text-sm font-bold text-blue-600 tabular-nums">
                      {med.lowest_price ? `₹${med.lowest_price.toFixed(2)}` : 'Check stock'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 group-hover:text-blue-600">
                    {med.available_pharmacies_count || 0} pharmacies <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Pharmacies Preview */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Verified Network</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Connected Local Pharmacies
              </h2>
            </div>
            <Link
              to="/pharmacies"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Explore Map & All Locations <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyPharmacies.map(pharmacy => (
              <div
                key={pharmacy.id}
                onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-mono">
                      {pharmacy.distance_km !== undefined ? `${pharmacy.distance_km} km away` : 'Nearby'}
                    </span>
                    {pharmacy.verified && (
                      <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {pharmacy.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {pharmacy.address}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${pharmacy.is_open_now ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {pharmacy.is_open_now ? '● Open Now' : '○ Closed'}
                  </span>
                  <span className="text-blue-600 font-medium">
                    {pharmacy.available_medicines_count || 0} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop Driving Between Pharmacies.
          </h2>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Check real availability in seconds, compare counter rates, and pick up your medicine with zero surprises.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/medicines"
              className="w-full sm:w-auto px-6 py-3 bg-white text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Search Medicine Availability
            </Link>
            <Link
              to="/compare"
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors border border-blue-500"
            >
              Compare Pharmacy Prices
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
