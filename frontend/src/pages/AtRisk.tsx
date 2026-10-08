import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Upload } from 'lucide-react';
import { fetchOrders } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const AtRisk: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadAtRisk();
  }, []);

  async function loadAtRisk() {
    try {
      setLoading(true);
      const data = await fetchOrders().catch(() => []);
      const filtered = data.filter((o: any) =>
        ['CRITICAL', 'HIGH', 'MEDIUM'].includes(o.riskLevel)
      );
      setOrders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              At-Risk Deliveries ({orders.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Orders predicted to fail due to customer window mismatches, vehicle incompatibility, or driver workload.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Logistics Data
        </button>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <EmptyDataState
          title="No At-Risk Deliveries Found"
          description="Upload your logistics CSV or Excel files to process delivery risk levels and automatically detect orders at risk of failure."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        /* Orders Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Requested Window</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-center">Failure Risk %</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((o) => {
                  const failPct = Math.round((o.failureProbability || 0.5) * 100);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-900">{o.id}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{o.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {o.packageCategory} ({o.priority})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{o.zone}</td>
                      <td className="py-3.5 px-4 text-slate-700 capitalize font-medium">
                        {o.requestedWindow} ({o.requestedTime})
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={o.riskLevel} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-rose-600">
                        {failPct}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/orders/${o.id}`)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Investigate <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadAtRisk}
      />
    </div>
  );
};
