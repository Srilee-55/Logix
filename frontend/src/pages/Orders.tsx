import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageCheck, ArrowRight, Search, Upload } from 'lucide-react';
import { fetchOrders } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await fetchOrders().catch(() => []);
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = orders;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          (o.customerName && o.customerName.toLowerCase().includes(s)) ||
          (o.packageCategory && o.packageCategory.toLowerCase().includes(s))
      );
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((o) => o.riskLevel === riskFilter);
    }
    setFiltered(result);
  }, [search, riskFilter, orders]);

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
            <PackageCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              All Orders ({orders.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time list of all scheduled orders from your uploaded dataset.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search order or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Orders Data
          </button>
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <EmptyDataState
          title="No Orders Uploaded Yet"
          description="Upload your orders CSV or Excel file to populate order records, evaluate delivery risk levels, and generate AI success predictions."
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
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Window</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-center">Predicted Success</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((o) => {
                  const succPct = Math.round((o.successProbability || 0.8) * 100);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-slate-900">{o.id}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{o.customerName}</td>
                      <td className="py-3 px-4 text-slate-600">{o.packageCategory}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{o.priority}</td>
                      <td className="py-3 px-4 text-slate-700 capitalize">
                        {o.requestedWindow} ({o.requestedTime})
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={o.riskLevel} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">
                        {succPct}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/orders/${o.id}`)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-semibold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-3 h-3" />
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
        onSuccess={loadOrders}
      />
    </div>
  );
};
