import React, { useState } from 'react';
import { X, PackagePlus } from 'lucide-react';
import { createPackageApi } from '../../services/api';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPackageModal: React.FC<AddPackageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [fragile, setFragile] = useState(false);
  const [temperatureSensitive, setTemperatureSensitive] = useState(false);
  const [refrigerationRequired, setRefrigerationRequired] = useState(false);
  const [specialHandling, setSpecialHandling] = useState('Standard handling');
  const [expirySensitive, setExpirySensitive] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(150);
  const [deadline, setDeadline] = useState('20:00');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createPackageApi({
        category,
        packageType: category,
        description: description || `${category} shipment`,
        priority,
        fragility: fragile ? 'HIGH' : 'LOW',
        fragile,
        temperatureSensitivity: temperatureSensitive || refrigerationRequired ? 'HIGH' : 'LOW',
        temperatureSensitive,
        refrigerationRequired,
        expirySensitivity: expirySensitive ? 'HIGH' : 'LOW',
        expirySensitive,
        specialHandling,
        estimatedValue: Number(estimatedValue),
        deadline,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error creating package: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Add New Package</h2>
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
            <label className="block font-bold text-slate-700 mb-1">Package Category / Type *</label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                if (val === 'Frozen') {
                  setRefrigerationRequired(true);
                  setTemperatureSensitive(true);
                  setSpecialHandling('Keep frozen below -5°C');
                } else if (val === 'Medicine') {
                  setTemperatureSensitive(true);
                  setExpirySensitive(true);
                  setSpecialHandling('Cold-chain monitored');
                } else if (val === 'Fragile' || val === 'Electronics') {
                  setFragile(true);
                  setSpecialHandling('Fragile - Handle with care');
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
            >
              <option value="General">General Goods</option>
              <option value="Medicine">Medicine & Biologicals</option>
              <option value="Frozen">Frozen Food & Cold Items</option>
              <option value="Perishable">Perishable Food</option>
              <option value="Electronics">Fragile Electronics</option>
              <option value="Clothing">Clothing & Apparel</option>
              <option value="Documents">Urgent Documents</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Package Description</label>
            <input
              type="text"
              placeholder="e.g. Temperature controlled insulin shipment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
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
            <div>
              <label className="block font-bold text-slate-700 mb-1">Est. Value ($)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={fragile}
                onChange={(e) => setFragile(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Fragile Package
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={refrigerationRequired}
                onChange={(e) => {
                  setRefrigerationRequired(e.target.checked);
                  if (e.target.checked) setTemperatureSensitive(true);
                }}
                className="rounded text-indigo-600"
              />
              Refrigeration Req.
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={temperatureSensitive}
                onChange={(e) => setTemperatureSensitive(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Temp. Sensitive
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={expirySensitive}
                onChange={(e) => setExpirySensitive(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Expiry Sensitive
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Special Handling Instructions</label>
            <input
              type="text"
              value={specialHandling}
              onChange={(e) => setSpecialHandling(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
            />
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
              {submitting ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
