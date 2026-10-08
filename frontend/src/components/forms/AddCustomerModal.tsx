import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { createCustomerApi } from '../../services/api';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('Zone A');
  const [bestWindow, setBestWindow] = useState('evening');
  const [preferredTime, setPreferredTime] = useState('17:00–20:00');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !location) return;
    try {
      setSubmitting(true);
      await createCustomerApi({
        name,
        phone,
        location,
        zone,
        bestDeliveryWindow: bestWindow,
        preferredTime,
        availabilityScore: bestWindow === 'evening' ? 0.92 : 0.85,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error creating customer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Add New Customer</h2>
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
            <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone / Contact</label>
              <input
                type="text"
                placeholder="555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Zone *</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
              >
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location Address *</label>
            <input
              type="text"
              required
              placeholder="Zone A, Sector 4, Tech Park"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Time Window *</label>
            <select
              value={bestWindow}
              onChange={(e) => {
                const w = e.target.value;
                setBestWindow(w);
                const map: any = {
                  morning: '08:00–11:00',
                  midday: '11:00–14:00',
                  afternoon: '14:00–17:00',
                  evening: '17:00–20:00',
                };
                setPreferredTime(map[w] || '17:00–20:00');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
            >
              <option value="morning">Morning (08:00 AM – 11:00 AM)</option>
              <option value="midday">Midday (11:00 AM – 02:00 PM)</option>
              <option value="afternoon">Afternoon (02:00 PM – 05:00 PM)</option>
              <option value="evening">Evening (05:00 PM – 08:00 PM)</option>
            </select>
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
