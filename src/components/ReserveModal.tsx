import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Calendar, Phone, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Medicine, Pharmacy } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine;
  pharmacy: Pharmacy;
  unitPrice: number;
  availableQuantity?: number;
  onSuccess?: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  isOpen,
  onClose,
  medicine,
  pharmacy,
  unitPrice,
  availableQuantity = 10,
  onSuccess
}) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [pickupDate, setPickupDate] = useState<string>(defaultDateStr);
  const [phone, setPhone] = useState<string>(user?.phone || '+91 ');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReservationId, setSuccessReservationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.reservations.create({
        pharmacy_id: pharmacy.id,
        medicine_id: medicine.id,
        quantity,
        pickup_date: pickupDate,
        customer_phone: phone,
        notes
      });

      setSuccessReservationId(res.reservation.id);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      await refreshNotifications();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reservation request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

        {/* Center Modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200">
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Medicine Reservation</h3>
                <p className="text-xs text-slate-500">Hold medicine at pharmacy for counter pickup</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {successReservationId ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Reservation Request Submitted!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Reservation Reference: <span className="font-mono font-bold text-slate-800">#{successReservationId}</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-xs text-left space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Medicine:</span>
                  <span className="font-semibold text-slate-800">{medicine.name} ({quantity} units)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pharmacy:</span>
                  <span className="font-semibold text-slate-800">{pharmacy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Total:</span>
                  <span className="font-bold text-blue-600">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Date:</span>
                  <span className="font-medium text-slate-800">{pickupDate}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 text-left">
                <strong>Pickup Instructions:</strong> Please present valid doctor prescription for Rx drugs upon arrival. Payment will be collected in-store at pickup.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/reservations');
                  }}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  View My Reservations
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product and Pharmacy Summary */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{medicine.name}</h4>
                    <p className="text-xs text-slate-600">
                      {medicine.generic_name} · {medicine.dosage_form} ({medicine.strength})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-700">₹{unitPrice.toFixed(2)}</span>
                    <span className="block text-[10px] text-slate-500">per unit</span>
                  </div>
                </div>
                <div className="pt-2 text-xs text-slate-600 border-t border-blue-200/50 flex items-center justify-between">
                  <span>Pickup from: <strong className="text-slate-800">{pharmacy.name}</strong></span>
                  {pharmacy.distance_km !== undefined && (
                    <span className="text-slate-500 font-mono text-[11px]">{pharmacy.distance_km} km away</span>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quantity selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity (Units / Strips)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-semibold text-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= Math.min(10, availableQuantity)}
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Max hold limit: {Math.min(10, availableQuantity)} units
                  </span>
                </div>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Your Phone Number (For pickup SMS/Call verification)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Note for Pharmacist
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g., Will collect during lunch break / Need specific batch"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Price summary & Notice */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Estimated Total:</span>
                  <p className="text-base font-bold text-slate-900 tabular-nums">₹{totalPrice}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Pay at counter upon collection</span>
                </div>
              </div>

              {/* Crucial Required Disclaimer */}
              <div className="p-3 bg-amber-50/90 rounded-lg border border-amber-200/80 text-[11px] leading-relaxed text-amber-900">
                <span className="font-semibold">Healthcare Disclaimer: </span>
                Reservation is not a purchase or guarantee of availability until confirmed by the pharmacy.
                Prescription medications strictly require an authentic doctor prescription at pickup.
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
