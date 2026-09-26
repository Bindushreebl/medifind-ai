import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  BellRing,
  ShoppingBag,
  Send,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { InventoryItem, Reservation, RestockAlert, Medicine, StockStatus, ReservationStatus } from '../types';

export const PharmacyDashboardPage: React.FC = () => {
  const { user, pharmacy } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'inventory' | 'reservations' | 'restock_requests'>('inventory');
  const [inventory, setInventory] = useState<(InventoryItem & { medicine?: Medicine })[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Inventory Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    medicine_id: string;
    quantity: number;
    price: number;
    status: StockStatus;
  }>({
    medicine_id: '',
    quantity: 50,
    price: 35.0,
    status: 'in_stock'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invList, resList, alertList, medList] = await Promise.all([
        api.inventory.list(),
        api.reservations.list(),
        api.restockAlerts.list(),
        api.medicines.list()
      ]);
      setInventory(invList);
      setReservations(resList);
      setRestockAlerts(alertList);
      setAllMedicines(medList);
      if (medList.length > 0 && !editingItem.medicine_id) {
        setEditingItem(prev => ({ ...prev, medicine_id: medList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load pharmacy dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inventory.upsert({
        pharmacy_id: pharmacy?.id,
        medicine_id: editingItem.medicine_id,
        quantity: Number(editingItem.quantity),
        price: Number(editingItem.price),
        status: editingItem.status
      });
      setEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update inventory');
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this medicine from inventory?')) return;
    try {
      await api.inventory.delete(id);
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      await api.reservations.updateStatus(id, status);
      setReservations(prev =>
        prev.map(r => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation');
    }
  };

  // Quick Restock & Notify Trigger
  const handleQuickRestock = async (medicineId: string, defaultPrice: number = 45.0) => {
    try {
      await api.inventory.upsert({
        pharmacy_id: pharmacy?.id,
        medicine_id: medicineId,
        quantity: 50,
        price: defaultPrice,
        status: 'in_stock'
      });
      alert('Inventory replenished to IN STOCK! Patients waiting for this medicine have been automatically notified.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to restock');
    }
  };

  // Stats calculation
  const inStockCount = inventory.filter(i => i.status === 'in_stock').length;
  const lowStockCount = inventory.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'out_of_stock').length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Pharmacy Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Authorized Pharmacy Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {pharmacy?.name || 'Pharmacy Management Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {pharmacy?.address || 'Community Chemist Counter'} · Managing live shelf inventory and counter holds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingItem({
                  medicine_id: allMedicines[0]?.id || '',
                  quantity: 50,
                  price: 40.0,
                  status: 'in_stock'
                });
                setEditModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add / Update Stock
            </button>
          </div>
        </div>

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Medicines</span>
            <div className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
              {inventory.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">In store catalog</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">In Stock</span>
            <div className="text-2xl font-black text-emerald-600 mt-2 tabular-nums">
              {inStockCount}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Active availability</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Low Stock</span>
            <div className="text-2xl font-black text-amber-600 mt-2 tabular-nums">
              {lowStockCount}
            </div>
            <span className="text-[11px] text-amber-600 mt-1 block">&lt; 10 units remaining</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Out of Stock</span>
            <div className="text-2xl font-black text-red-600 mt-2 tabular-nums">
              {outOfStockCount}
            </div>
            <span className="text-[11px] text-red-600 mt-1 block">Replenishment needed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Pending Holds</span>
            <div className="text-2xl font-black text-blue-600 mt-2 tabular-nums">
              {pendingReservationsCount}
            </div>
            <span className="text-[11px] text-blue-600 mt-1 block">Awaiting confirmation</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory Manager ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pickup Reservations ({reservations.length})
          </button>

          <button
            onClick={() => setActiveTab('restock_requests')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'restock_requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4" />
            Restock Requests ({restockAlerts.length})
          </button>
        </div>

        {/* TAB 1: Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Current Pharmacy Catalog ({inventory.length} items)
              </span>
              <span className="text-xs text-slate-500">
                Updating an item to "In Stock" automatically triggers notifications for waiting patients.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3 text-left">Medicine</th>
                    <th className="px-4 py-3 text-left">Dosage &amp; Form</th>
                    <th className="px-4 py-3 text-center">Available Qty</th>
                    <th className="px-4 py-3 text-right">Counter Price</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{item.medicine?.name}</span>
                        <span className="text-[11px] text-slate-500">{item.medicine?.generic_name}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        {item.medicine?.dosage_form} · {item.medicine?.strength}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono tabular-nums font-bold">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono tabular-nums font-bold text-slate-900">
                        ₹{item.price.toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {item.status === 'in_stock' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            In Stock
                          </span>
                        ) : item.status === 'low_stock' ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem({
                                medicine_id: item.medicine_id,
                                quantity: item.quantity,
                                price: item.price,
                                status: item.status
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Stock / Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Reservations Management */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800">
              Patient Reservations &amp; In-Store Counter Holds
            </div>

            {reservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active reservations placed at this pharmacy yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reservations.map(res => (
                  <div key={res.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600">#{res.id}</span>
                        <h4 className="font-bold text-sm text-slate-900">
                          {res.medicine?.name} ({res.quantity} units)
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          res.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                          res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {res.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          Customer: {res.user?.name || 'Patient'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {res.customer_phone || res.user?.phone}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Pickup date: <strong className="text-slate-800">{res.pickup_date}</strong>
                        </span>
                      </div>

                      {res.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          Note from patient: "{res.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Due</span>
                        <span className="text-base font-black text-slate-900 tabular-nums">
                          ₹{res.total_price.toFixed(2)}
                        </span>
                      </div>

                      {/* State transitions */}
                      <div className="flex items-center gap-1.5 text-xs">
                        {res.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                          >
                            Confirm Hold
                          </button>
                        )}

                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'ready_for_pickup')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                          >
                            Mark Ready
                          </button>
                        )}

                        {res.status === 'ready_for_pickup' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
                          >
                            Mark Completed
                          </button>
                        )}

                        {res.status !== 'completed' && res.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                            className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Restock Requests */}
        {activeTab === 'restock_requests' && (
          <div className="bg-white rounded-b-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>Patient Restock Alerts Waiting for Replenishment</span>
              <span className="text-slate-500 font-normal">Click restock to replenish shelf and notify patients</span>
            </div>

            {restockAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No patients currently waiting for out-of-stock items at this pharmacy.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {restockAlerts.map(alert => (
                  <div key={alert.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          {alert.medicine?.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alert.status === 'notified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alert.status === 'notified' ? 'Notified' : 'Patient Waiting'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Generic: {alert.medicine?.generic_name} ({alert.medicine?.strength})
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickRestock(alert.medicine_id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Restock &amp; Notify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Inventory Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />
            <div className="inline-block bg-white rounded-2xl p-6 text-left shadow-2xl max-w-md w-full z-10 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Update Shelf Inventory
              </h3>

              <form onSubmit={handleSaveInventory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Medicine</label>
                  <select
                    value={editingItem.medicine_id}
                    onChange={e => setEditingItem({ ...editingItem, medicine_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {allMedicines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.generic_name} · {m.strength})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity in Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingItem.quantity}
                      onChange={e => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Counter Price (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min="1"
                      value={editingItem.price}
                      onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Status</label>
                  <select
                    value={editingItem.status}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value as StockStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="in_stock">In Stock (Available for counter pickup)</option>
                    <option value="low_stock">Low Stock (Limited inventory)</option>
                    <option value="out_of_stock">Out of Stock (Depleted)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
