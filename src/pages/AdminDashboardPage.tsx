import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Package,
  Search,
  ShoppingBag,
  AlertTriangle,
  BellRing,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { AdminAnalytics, Pharmacy, User, Alternative, Medicine } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alternatives, setAlternatives] = useState<(Alternative & { medicine: Medicine; alternative_medicine: Medicine })[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'pharmacies' | 'alternatives' | 'users'>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [anData, phList, uList, altList] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getPharmacies(),
        api.admin.getUsers(),
        api.admin.getAlternatives()
      ]);
      setAnalytics(anData);
      setPharmacies(phList);
      setUsers(uList);
      setAlternatives(altList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleTogglePharmacyVerify = async (id: string, current: boolean) => {
    try {
      await api.admin.verifyPharmacy(id, !current);
      setPharmacies(prev =>
        prev.map(p => (p.id === id ? { ...p, verified: !current } : p))
      );
    } catch (err) {
      console.error('Failed to update pharmacy verification:', err);
    }
  };

  const handleUpdateAlternativeStatus = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await api.alternatives.updateStatus(id, status);
      setAlternatives(prev =>
        prev.map(a => (a.id === id ? { ...a, verification_status: status } : a))
      );
    } catch (err) {
      console.error('Failed to update alternative status:', err);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="h-32 bg-white rounded-xl animate-pulse"></div>
          <div className="h-64 bg-white rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Admin Console
              </span>
              <span className="text-xs text-slate-400">Chief Clinical Pharmacist View</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              MediFind System Administration &amp; Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Platform-wide network telemetry, pharmacy regulatory verification, and clinical equivalence governance.
            </p>
          </div>
        </div>

        {/* 7 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Total Users</span>
            <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
              {analytics.totalUsers}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Pharmacies</span>
            <div className="text-xl font-black text-blue-600 mt-1 tabular-nums">
              {analytics.totalPharmacies}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Medicines</span>
            <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
              {analytics.totalMedicines}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Total Searches</span>
            <div className="text-xl font-black text-indigo-600 mt-1 tabular-nums">
              {analytics.totalSearches}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Reservations</span>
            <div className="text-xl font-black text-emerald-600 mt-1 tabular-nums">
              {analytics.totalReservations}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Out of Stock</span>
            <div className="text-xl font-black text-red-600 mt-1 tabular-nums">
              {analytics.outOfStockCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500">Restock Requests</span>
            <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">
              {analytics.restockRequestsCount}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> System Analytics &amp; Trends
          </button>

          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pharmacies' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Pharmacy Verification ({pharmacies.length})
          </button>

          <button
            onClick={() => setActiveTab('alternatives')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alternatives' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Clinical Equivalence Approval ({alternatives.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> User Directory ({users.length})
          </button>
        </div>

        {/* TAB 1: Analytics Charts */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Most Searched Medicines Bar Chart */}
              <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">Most Searched Medicines</h3>
                  <span className="text-[11px] text-slate-400">Search volume frequency</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topSearches} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="searches" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Distribution Pie Chart */}
              <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">Network Stock Health</h3>
                  <span className="text-[11px] text-slate-400">Total item distribution</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.inventoryDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {analytics.inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Reservation Status Trends */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Reservation Lifecycle Volume</h3>
                <span className="text-[11px] text-slate-400">State breakdown across all counters</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.reservationBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Pharmacy Verification Manager */}
        {activeTab === 'pharmacies' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Pharmacy Verification Registry</span>
              <span className="text-slate-500">Verified status grants the official blue clinical verification checkmark</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3 text-left">Pharmacy Name</th>
                    <th className="px-4 py-3 text-left">Location Address</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pharmacies.map(ph => (
                    <tr key={ph.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                        {ph.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {ph.address}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono">
                        {ph.phone}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {ph.verified ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Pending Audit
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleTogglePharmacyVerify(ph.id, ph.verified)}
                          className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            ph.verified
                              ? 'border border-red-200 text-red-600 hover:bg-red-50'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {ph.verified ? 'Revoke Verification' : 'Verify Pharmacy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Clinical Equivalence Approval */}
        {activeTab === 'alternatives' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800">
              Pharmacist Bioequivalence Submission Review
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {alternatives.map(alt => (
                <div key={alt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {alt.medicine?.name} ➔ {alt.alternative_medicine?.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        alt.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alt.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {alt.verification_status}
                      </span>
                    </div>

                    <p className="text-slate-500">
                      <strong>Submitted by:</strong> {alt.pharmacist_name} ({alt.pharmacist_license}) · Verified Date: {alt.verification_date}
                    </p>
                    <p className="text-slate-700 italic pt-1">
                      "{alt.notes}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alt.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleUpdateAlternativeStatus(alt.id, 'verified')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                      >
                        Approve Equivalence
                      </button>
                    )}
                    {alt.verification_status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateAlternativeStatus(alt.id, 'rejected')}
                        className="px-3 py-1.5 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: User Directory */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800">
              Registered System Accounts
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3 text-left">Full Name</th>
                    <th className="px-4 py-3 text-left">Email Address</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-center">System Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">{u.email}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">{u.phone || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'PHARMACY' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
