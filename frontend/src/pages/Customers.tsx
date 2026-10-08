import React, { useEffect, useState } from 'react';
import { Users, Upload } from 'lucide-react';
import { useCustomers } from '../hooks/useFirestore';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Customers: React.FC = () => {
  const { customers, loading } = useCustomers();
  const [isUploadOpen, setIsUploadOpen] = useState(false);


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
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Availability Intelligence ({customers.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Per-customer success rates by time window (morning, midday, afternoon, evening), best delivery window, and reschedule history from your uploaded dataset.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Customer Data
        </button>
      </div>

      {/* Empty State */}
      {customers.length === 0 ? (
        <EmptyDataState
          title="No Customers Uploaded Yet"
          description="Upload your logistics CSV or Excel files to process customer availability profiles, time window success rates, and delivery reliability."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        /* Customer Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => {
            const rates = c.windowSuccessRates || {};
            const isUnreliable = c.availabilityScore < 0.50 || c.rescheduleCount >= 4;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border p-4 shadow-xs space-y-3 ${
                  isUnreliable ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.location} ({c.zone})</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {c.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Best Window
                    </span>
                    <span className="font-extrabold text-indigo-700 capitalize">
                      {c.bestDeliveryWindow} ({c.preferredTime})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Availability
                    </span>
                    <span className="font-extrabold font-mono text-slate-800">
                      {Math.round(c.availabilityScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Window Success Rates Heatmap Bars */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Window Success Profile
                  </span>
                  {['morning', 'midday', 'afternoon', 'evening'].map((win) => {
                    const rate = rates[win] || 0.5;
                    const pct = Math.round(rate * 100);
                    const isBest = win === c.bestDeliveryWindow;

                    let color = 'bg-slate-300';
                    if (pct >= 85) color = 'bg-emerald-500';
                    else if (pct >= 60) color = 'bg-indigo-500';
                    else if (pct <= 35) color = 'bg-rose-500';

                    return (
                      <div key={win} className="flex items-center gap-2 text-[11px]">
                        <span className="w-16 capitalize text-slate-600 font-medium">{win}</span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className={`w-8 text-right font-mono font-bold ${isBest ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Deliveries: {c.successfulDeliveries || 0} succ / {c.failedDeliveries || 0} fail</span>
                  <span className="font-semibold text-amber-700">{c.rescheduleCount || 0} Reschedules</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setIsUploadOpen(false)}
      />

    </div>
  );
};
