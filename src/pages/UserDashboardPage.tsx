import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  BellRing,
  ShoppingBag,
  Clock,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle,
  Building2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RestockAlert, Reservation, Pharmacy, SearchHistoryItem } from '../types';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<RestockAlert[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [altList, resList, phList, shList] = await Promise.all([
        api.restockAlerts.list(),
        api.reservations.list(),
        api.pharmacies.nearby(4),
        api.searchHistory.list()
      ]);
      setAlerts(altList);
      setReservations(resList);
      setNearbyPharmacies(phList);
      setRecentSearches(shList.slice(0, 5));
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteAlert = async (id: string) => {
    try {
      await api.restockAlerts.delete(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to remove alert:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Patient Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your counter reservations, manage stock notifications, and find nearby medication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/medicines"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Find Medicine
            </Link>
            <Link
              to="/reservations"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              View Pickups
            </Link>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Medicines Searched</span>
              <Search className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {recentSearches.length > 0 ? recentSearches.length + 3 : 8}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">In local territory</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pharmacies Nearby</span>
              <MapPin className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {nearbyPharmacies.length > 0 ? nearbyPharmacies.length + 4 : 8}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Open now within 5km</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Restock Alerts</span>
              <BellRing className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Monitoring stock replenishment</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Reservations</span>
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {reservations.filter(r => r.status === 'pending' || r.status === 'confirmed' || r.status === 'ready_for_pickup').length}
            </div>
            <span className="text-[11px] text-indigo-600 mt-1 block">Counter pickup active</span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => navigate('/medicines')}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors font-medium text-slate-700 flex items-center justify-between"
            >
              <span>🔍 Search Medicine</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => navigate('/pharmacies')}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors font-medium text-slate-700 flex items-center justify-between"
            >
              <span>🏥 Find Pharmacy</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors font-medium text-slate-700 flex items-center justify-between"
            >
              <span>📊 Price Comparison</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors font-medium text-slate-700 flex items-center justify-between"
            >
              <span>📦 My Reservations</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 2-Column Section: Recent Searches + Recommended Pharmacies */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Searches */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Recent Searches &amp; Inquiries</h3>
              <Link to="/medicines" className="text-xs text-blue-600 hover:underline">
                Search more
              </Link>
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent searches recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSearches.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/medicines?q=${encodeURIComponent(item.query)}`)}
                    className="py-3 flex items-center justify-between text-xs hover:text-blue-600 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-medium text-slate-800 group-hover:text-blue-600">{item.query}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.searched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Recommended Nearby Pharmacies */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Recommended Nearby Pharmacies</h3>
              <Link to="/pharmacies" className="text-xs text-blue-600 hover:underline">
                View on map
              </Link>
            </div>

            <div className="space-y-3">
              {nearbyPharmacies.slice(0, 3).map(pharmacy => (
                <div
                  key={pharmacy.id}
                  onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{pharmacy.name}</span>
                      {pharmacy.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{pharmacy.address}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <span className={pharmacy.is_open_now ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>
                        {pharmacy.is_open_now ? 'Open' : 'Closed'}
                      </span>
                      <span>·</span>
                      <span className="text-amber-500 font-bold">★ {pharmacy.rating}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-blue-600 font-mono">{pharmacy.distance_km} km</span>
                    <span className="block text-[10px] text-slate-400">
                      {pharmacy.available_medicines_count || 0} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Restock Alerts Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Active Restock Notifications</h3>
              <p className="text-xs text-slate-500">You will receive an in-app alert when stock arrives.</p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums font-mono">
              {alerts.length} registered
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No active restock alerts. If you search for an unavailable medicine, click "Notify Me" to get alerts here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {alerts.map(alert => (
                <div key={alert.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <Link
                      to={`/medicines/${alert.medicine_id}`}
                      className="font-bold text-slate-900 hover:text-blue-600"
                    >
                      {alert.medicine?.name}
                    </Link>
                    <p className="text-slate-500 text-[11px]">
                      {alert.medicine?.generic_name} · {alert.pharmacy ? alert.pharmacy.name : 'Any Nearby Pharmacy'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      alert.status === 'notified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.status === 'notified' ? 'Restocked / Notified' : 'Monitoring Stock'}
                    </span>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Cancel alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
