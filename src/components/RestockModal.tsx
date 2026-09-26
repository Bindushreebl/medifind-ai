import React, { useState } from 'react';
import { X, BellRing, CheckCircle2, AlertCircle } from 'lucide-react';
import { Medicine, Pharmacy } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine;
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string;
  onSuccess?: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  medicine,
  pharmacies,
  selectedPharmacyId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  const [pharmacyId, setPharmacyId] = useState<string>(selectedPharmacyId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.restockAlerts.create({
        medicine_id: medicine.id,
        pharmacy_id: pharmacyId ? pharmacyId : undefined
      });
      setSuccess(true);
      await refreshNotifications();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to set restock alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Restock Availability Alert</h3>
                  <p className="text-xs text-slate-500">Get notified when medicine is back in stock</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Restock Alert Active!</h4>
                <p className="text-xs text-slate-600">
                  You will receive an in-app notification the moment <strong>{medicine.name}</strong> is restocked.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{medicine.name}</span>
                  <span className="text-slate-500 block">{medicine.generic_name} · {medicine.strength}</span>
                </div>

                {error && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Pharmacy (Optional)
                  </label>
                  <select
                    value={pharmacyId}
                    onChange={e => setPharmacyId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Any Nearby Pharmacy (Recommended)</option>
                    {pharmacies.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.distance_km ? `(${p.distance_km} km)` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Selecting "Any" alerts you as soon as any pharmacy in your network restocks.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Setting Alert...' : 'Set In-App Alert'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
