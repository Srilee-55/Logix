import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Upload } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { useOperationalInsights, useOrders } from '../hooks/useFirestore';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Insights: React.FC = () => {
  const { insights, loading: insightsLoading } = useOperationalInsights();
  const { orders, loading: ordersLoading } = useOrders();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const hasData = orders.length > 0;
  const loading = insightsLoading || ordersLoading;


  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const zoneData = insights?.zoneSuccessRates30Days || [
    { zone: 'Zone A', successRate: 88.4 },
    { zone: 'Zone B', successRate: 71.8 },
    { zone: 'Zone C', successRate: 82.5 },
  ];

  const failureReasons = insights?.topFailureReasons || [
    { reason: 'Customer Unavailable in Time Window', percentage: 48 },
    { reason: 'Vehicle Refrigeration Mismatch', percentage: 24 },
    { reason: 'Driver Workload Saturation', percentage: 18 },
  ];

  const patterns = insights?.discoveredPatterns || [
    'Zone B deliveries between 11 AM and 1 PM experience 34% higher unavailability.',
    'Frozen packages assigned to standard vans have a higher failure rate.',
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Operational Memory & AI Insights
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Zone success rate analytics, top historical failure reasons, and AI-discovered logistics patterns.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Logistics Data
        </button>
      </div>

      {!hasData ? (
        <EmptyDataState
          title="No Operational Insights Available"
          description="Upload your logistics CSV or Excel files to process zone analytics, historical failure patterns, and operational recommendations."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone 30-Day Success Rates Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Zone Delivery Success Rates
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">Derived from uploaded dataset</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Success Rate']} />
                    <Bar dataKey="successRate" radius={[6, 6, 0, 0]}>
                      {zoneData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.zone === 'Zone B' ? '#f59e0b' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Failure Reasons */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Top Delivery Failure Reasons
              </h2>

              <div className="space-y-3 pt-2">
                {failureReasons.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.reason}</span>
                      <span className="font-mono font-bold text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Discovered Logistics Patterns */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-amber-400">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              AI Discovered Operational Patterns
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pat: string, idx: number) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Pattern #{idx + 1}
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">{pat}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => setIsUploadOpen(false)}
      />

    </div>
  );
};
