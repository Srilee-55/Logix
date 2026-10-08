import React, { useState } from 'react';
import { X, Truck, Thermometer, ShieldCheck } from 'lucide-react';
import { createVehicleApi } from '../../services/api';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Refrigerated Van');
  const [capacity, setCapacity] = useState(200);
  const [currentLoad, setCurrentLoad] = useState(50);
  const [refrigeration, setRefrigeration] = useState(true);
  const [fragileSupport, setFragileSupport] = useState(true);
  const [healthScore, setHealthScore] = useState(95);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleNumber) return;
    try {
      setSubmitting(true);
      await createVehicleApi({
        vehicleNumber,
        vehicleType,
        capacity,
        currentLoad,
        refrigeration,
        fragileSupport,
        healthScore,
        maintenanceStatus: 'Optimal',
        availability: true,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error creating vehicle: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Add Vehicle to Fleet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle Plate / Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. LOG-V109"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Vehicle Type *</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
            >
              <option value="Refrigerated Van">Refrigerated Van</option>
              <option value="Cold Storage Truck">Cold Storage Truck</option>
              <option value="Standard Van">Standard Van</option>
              <option value="Express Sprinter">Express Sprinter</option>
              <option value="Electric City Cargo">Electric City Cargo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Capacity (Units)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Health Score (0-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={refrigeration}
                onChange={(e) => setRefrigeration(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                Active Refrigeration Support (Cold Chain)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fragileSupport}
                onChange={(e) => setFragileSupport(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Fragile Package Cushioning Support
              </span>
            </label>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
            >
              {submitting ? 'Saving...' : 'Save to Firebase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
