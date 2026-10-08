import React, { useEffect, useState } from 'react';
import { X, PackagePlus, Sparkles } from 'lucide-react';
import {
  fetchCustomers,
  fetchVehicles,
  fetchDrivers,
  createOrderApi,
} from '../../services/api';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [packageCategory, setPackageCategory] = useState('Medicine');
  const [priority, setPriority] = useState('HIGH');
  const [requestedWindow, setRequestedWindow] = useState('morning');
  const [requestedTime, setRequestedTime] = useState('10:00 AM');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEntities();
    }
  }, [isOpen]);

  async function loadEntities() {
    try {
      setLoading(true);
      const [cList, vList, dList] = await Promise.all([
        fetchCustomers(),
        fetchVehicles(),
        fetchDrivers(),
      ]);
      setCustomers(cList);
      setVehicles(vList);
      setDrivers(dList);

      if (cList.length > 0) setCustomerId(cList[0].id);
      if (vList.length > 0) setAssignedVehicleId(vList[0].id);
      if (dList.length > 0) setAssignedDriverId(dList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !assignedVehicleId || !assignedDriverId) {
      alert('Please ensure customer, vehicle, and driver are selected.');
      return;
    }
    try {
      setSubmitting(true);
      await createOrderApi({
        customerId,
        packageCategory,
        priority,
        requestedTime,
        requestedWindow,
        assignedVehicleId,
        assignedDriverId,
        deliveryDeadline: '20:00',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error creating order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Create Order & Analyze Risk</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-500">
            Loading entities from Firebase...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
            <p className="font-bold">No customers available in Firebase yet!</p>
            <p>Please add at least 1 Customer, Vehicle, and Driver before creating an Order.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Customer Select */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.zone}, Best Window: {c.bestDeliveryWindow})
                  </option>
                ))}
              </select>
            </div>

            {/* Package Category & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Category *</label>
                <select
                  value={packageCategory}
                  onChange={(e) => setPackageCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Food">Food</option>
                  <option value="Perishable">Perishable</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Documents">Documents</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            {/* Time Window */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Requested Window *</label>
              <select
                value={requestedWindow}
                onChange={(e) => {
                  const w = e.target.value;
                  setRequestedWindow(w);
                  const map: any = {
                    morning: '10:00 AM',
                    midday: '12:30 PM',
                    afternoon: '03:30 PM',
                    evening: '06:30 PM',
                  };
                  setRequestedTime(map[w] || '10:00 AM');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
              >
                <option value="morning">Morning (08:00 AM – 11:00 AM)</option>
                <option value="midday">Midday (11:00 AM – 02:00 PM)</option>
                <option value="afternoon">Afternoon (02:00 PM – 05:00 PM)</option>
                <option value="evening">Evening (05:00 PM – 08:00 PM)</option>
              </select>
            </div>

            {/* Vehicle & Driver Select */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Vehicle *</label>
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} ({v.refrigeration ? 'Refrigerated' : 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Driver *</label>
                <select
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {submitting ? 'Analyzing...' : 'Create & Analyze Risk'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
