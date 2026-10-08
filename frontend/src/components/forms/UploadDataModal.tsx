import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadLogisticsDataApi } from '../../services/api';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDataModal: React.FC<UploadDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [unifiedFile, setUnifiedFile] = useState<File | null>(null);
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [customersFile, setCustomersFile] = useState<File | null>(null);
  const [vehiclesFile, setVehiclesFile] = useState<File | null>(null);
  const [driversFile, setDriversFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!unifiedFile && !ordersFile && !customersFile && !vehiclesFile && !driversFile) {
      setError('Please select at least one CSV or Excel file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (unifiedFile) formData.append('file', unifiedFile);
      if (ordersFile) formData.append('orders_file', ordersFile);
      if (customersFile) formData.append('customers_file', customersFile);
      if (vehiclesFile) formData.append('vehicles_file', vehiclesFile);
      if (driversFile) formData.append('drivers_file', driversFile);

      await uploadLogisticsDataApi(formData);
      onSuccess();
      onClose();
      navigate('/processing');
    } catch (err: any) {
      setError(err.message || 'Failed to upload logistics data files.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Upload Logistics Data (CSV / Excel)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <p className="font-bold text-slate-800">Option 1: Unified Logistics Master File (Recommended)</p>
            <p className="text-slate-500">Upload a single CSV or XLSX file containing orders, customer details, vehicles & drivers.</p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setUnifiedFile(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="font-bold text-slate-800 mb-2">Option 2: Individual Category Files</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Orders / Deliveries File</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setOrdersFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 font-medium cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customers File</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setCustomersFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 font-medium cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fleet Vehicles File</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setVehiclesFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 font-medium cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drivers File</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setDriversFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 font-medium cursor-pointer"
                />
              </div>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{submitting ? 'Uploading & Analyzing...' : 'Upload & Run AI Engine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
