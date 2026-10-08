import React, { useEffect, useState } from 'react';
import { Package, Snowflake, AlertTriangle, ShieldCheck, Clock, Upload } from 'lucide-react';
import { fetchPackages } from '../services/api';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Packages: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchPackages().catch(() => []);
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Package Directory & Handling Requirements ({packages.length})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Package records with cold-chain, fragility, and special handling attributes from your uploaded dataset.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
        >
          <Upload className="w-4 h-4" />
          Upload Packages Data
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading packages from data store...</div>
      ) : packages.length === 0 ? (
        <EmptyDataState
          title="No Packages Uploaded Yet"
          description="Upload your logistics CSV or Excel files to view package categories, fragility flags, and cold-chain transport requirements."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{pkg.id}</span>
                  <h3 className="font-bold text-slate-900 text-base">{pkg.category || pkg.packageType}</h3>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    pkg.priority === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700'
                      : pkg.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {pkg.priority || 'MEDIUM'}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {pkg.description || pkg.specialHandling || 'Standard consignment'}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(pkg.refrigerationRequired || pkg.temperatureSensitivity === 'HIGH' || pkg.temperatureSensitive) && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                    <Snowflake className="w-3 h-3" /> Cold Chain Req.
                  </span>
                )}
                {(pkg.fragility === 'HIGH' || pkg.fragile) && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> Fragile
                  </span>
                )}
                {(pkg.expirySensitivity === 'HIGH' || pkg.expirySensitive) && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    <Clock className="w-3 h-3" /> Expiry Sensitive
                  </span>
                )}
                {!pkg.refrigerationRequired && pkg.fragility !== 'HIGH' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Standard Transport
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                <span>Value: ${pkg.estimatedValue || 150}</span>
                <span>Deadline: {pkg.deadline || '20:00'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadPackages}
      />
    </div>
  );
};
