import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Reservation, ReservationStatus } from '../types';

export const ReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const list = await api.reservations.list();
      setReservations(list);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, [user]);

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm('Cancel this medicine pickup reservation?')) return;
    try {
      await api.reservations.updateStatus(id, 'cancelled');
      setReservations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'cancelled' } : r))
      );
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
    }
  };

  const filtered = reservations.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Medicine Counter Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track the status of your pharmacy counter holds and prepare for pickup.
            </p>
          </div>

          <Link
            to="/medicines"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg self-start sm:self-auto shadow-xs"
          >
            Reserve More Medicine
          </Link>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Reservation Policy: </strong>
            Reservation is not a purchase or guarantee of availability until confirmed by the pharmacy.
            You will pay in-store during counter collection. Authentic medical prescription must be presented for all Rx drugs.
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          {['all', 'pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-36 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No reservations found</h3>
              <p className="text-xs text-slate-500">
                You have no medicine pickups registered under this status.
              </p>
              <Link
                to="/medicines"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
              >
                Search Medicines to Reserve
              </Link>
            </div>
          ) : (
            filtered.map(res => (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-600">#{res.id}</span>
                      <h3 className="font-bold text-base text-slate-900">
                        {res.medicine?.name}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500">
                        × {res.quantity} {res.quantity > 1 ? 'units' : 'unit'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {res.medicine?.generic_name} ({res.medicine?.strength}) · {res.medicine?.dosage_form}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Pickup from: <strong className="text-slate-900">{res.pharmacy?.name}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-5">{res.pharmacy?.address}</p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                      res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      res.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-800' :
                      res.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {res.status.replace('_', ' ')}
                    </span>

                    <div className="text-lg font-black text-slate-900 tabular-nums">
                      ₹{res.total_price.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Pay at pharmacy counter</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Scheduled Pickup: {res.pickup_date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Pharmacy Contact: {res.pharmacy?.phone}
                    </span>
                  </div>

                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleCancelReservation(res.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline self-end sm:self-auto cursor-pointer"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
