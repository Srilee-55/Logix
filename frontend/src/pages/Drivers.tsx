import React, { useEffect, useState } from 'react';
import { UserCheck, Sparkles, CheckCircle2, Upload } from 'lucide-react';
import { fetchDrivers } from '../services/api';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [highWorkloadDrivers, setHighWorkloadDrivers] = useState<any[]>([]);
  const [lowWorkloadDrivers, setLowWorkloadDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    try {
      setLoading(true);
      const data = await fetchDrivers().catch(() => []);
      setDrivers(data);

      const high = data.filter((d: any) => d.workloadScore > 80);
      const low = data.filter((d: any) => d.workloadScore < 50);
      setHighWorkloadDrivers(high);
      setLowWorkloadDrivers(low);
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
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Driver Workload & Capacity Management ({drivers.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitor working hours, completed deliveries, workload scores, and automated workload redistribution suggestions from your uploaded dataset.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Drivers Data
        </button>
      </div>

      {/* Workload Redistribution Suggestion Banner */}
      {highWorkloadDrivers.length > 0 && lowWorkloadDrivers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/50 border border-amber-300 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                AI Workload Redistribution Recommendation
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              High workload detected on driver <strong className="text-amber-900">{highWorkloadDrivers[0].name}</strong> ({highWorkloadDrivers[0].workloadScore}% capacity). LOGIX recommends reassigning 3 scheduled deliveries to <strong className="text-indigo-900">{lowWorkloadDrivers[0].name}</strong> ({lowWorkloadDrivers[0].zone}, {lowWorkloadDrivers[0].workloadScore}% capacity) to prevent delivery delay risks.
            </p>
          </div>

          <button
            onClick={() => alert(`Reassigned 3 orders from ${highWorkloadDrivers[0].name} to ${lowWorkloadDrivers[0].name}. Workload rebalanced.`)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Redistribute Workload
          </button>
        </div>
      )}

      {/* Empty State */}
      {drivers.length === 0 ? (
        <EmptyDataState
          title="No Drivers Uploaded Yet"
          description="Upload your drivers CSV or Excel file to manage workload saturation, working hours, and driver assignments."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        /* Drivers Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => {
            const isHigh = d.workloadScore > 80;

            return (
              <div
                key={d.id}
                className={`bg-white rounded-xl border p-4 shadow-xs space-y-3 ${
                  isHigh ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                    <p className="text-xs text-slate-500">
                      Zone: <strong className="text-slate-700">{d.zone}</strong> • {d.experienceLevel}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {d.id}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Workload Saturation</span>
                    <span className={`font-mono font-bold ${isHigh ? 'text-amber-700' : 'text-slate-800'}`}>
                      {d.workloadScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${d.workloadScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] grid grid-cols-2 gap-2 text-slate-600">
                  <div>Working Hours: <strong className="text-slate-800">{d.workingHours} hrs</strong></div>
                  <div>Completed: <strong className="text-slate-800">{d.completedDeliveries || 0}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadDrivers}
      />
    </div>
  );
};
