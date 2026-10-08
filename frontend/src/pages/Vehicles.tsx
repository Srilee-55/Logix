import React, { useEffect, useState } from 'react';
import { Truck, Thermometer, ShieldCheck, Upload } from 'lucide-react';
import { fetchVehicles } from '../services/api';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      setLoading(true);
      const data = await fetchVehicles().catch(() => []);
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Fleet Suitability & Compatibility ({vehicles.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Refrigeration status, fragile handling support, vehicle mechanical health score, and capacity load analysis from your uploaded dataset.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Fleet Vehicles Data
        </button>
      </div>

      {/* Empty State */}
      {vehicles.length === 0 ? (
        <EmptyDataState
          title="No Fleet Vehicles Uploaded Yet"
          description="Upload your fleet vehicles CSV or Excel file to analyze refrigeration capabilities, package compatibility, and vehicle health."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        /* Vehicles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((v) => {
            const loadPct = Math.round((v.currentLoad / maxOne(v.capacity)) * 100);

            return (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold font-mono text-slate-900 text-sm">{v.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500">{v.vehicleType}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      v.healthScore >= 90
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {v.healthScore}% Health
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold ${
                      v.refrigeration
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <Thermometer className="w-3 h-3" />
                    {v.refrigeration ? 'Refrigerated' : 'No Cold Storage'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold ${
                      v.fragileSupport
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {v.fragileSupport ? 'Fragile Ready' : 'Standard Cargo'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Current Load</span>
                    <span className="font-mono">{v.currentLoad} / {v.capacity} units</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${loadPct > 85 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${loadPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] flex justify-between text-slate-500">
                  <span>Status: <strong className="text-slate-700">{v.maintenanceStatus}</strong></span>
                  <span className="text-emerald-600 font-bold">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadVehicles}
      />
    </div>
  );
};

function maxOne(val: number) {
  return val > 0 ? val : 1;
}
