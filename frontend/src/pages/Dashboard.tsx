import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { fetchRiskSummary, fetchOrders, fetchInsights } from '../services/api';
import { KPICard } from '../components/KPICard';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [atRiskOrders, setAtRiskOrders] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, ordersRes, insightsRes] = await Promise.all([
        fetchRiskSummary(),
        fetchOrders().catch(() => []),
        fetchInsights().catch(() => null),
      ]);
      setSummary(sumRes);
      setTotalOrdersCount(ordersRes.length);

      const filtered = ordersRes.filter((o: any) =>
        ['CRITICAL', 'HIGH', 'MEDIUM'].includes(o.riskLevel)
      );
      setAtRiskOrders(filtered.slice(0, 8));
      setInsights(insightsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">
            Running LOGIX Predictive Intelligence Models...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-1">Error Loading Dashboard</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-3 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Low Risk', count: Math.max(0, (summary?.totalDeliveries || 0) - (summary?.atRiskDeliveries || 0)), color: '#10b981' },
    { name: 'Medium Risk', count: Math.max(0, (summary?.atRiskDeliveries || 0) - (summary?.criticalRiskCount || 0) - (summary?.highRiskCount || 0)), color: '#f59e0b' },
    { name: 'High Risk', count: summary?.highRiskCount || 0, color: '#f97316' },
    { name: 'Critical Risk', count: summary?.criticalRiskCount || 0, color: '#f43f5e' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Logistics Data Source:</span>
          <span className="text-slate-500 font-mono text-[11px]">User Uploaded Files</span>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Logistics Data (CSV / Excel)</span>
        </button>
      </div>

      {/* Empty State when no data has been uploaded */}
      {totalOrdersCount === 0 ? (
        <EmptyDataState
          title="No Logistics Data Uploaded"
          description="Upload your logistics CSV or Excel files (Orders, Customers, Vehicles, Drivers) to process delivery success intelligence, calculate risk probabilities, and evaluate fleet suitability."
          onUploadClick={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <>
          {/* Headline Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Real-time Intelligence
                </span>
                <span className="text-slate-400 text-xs">• {summary?.totalDeliveries || 0} Processed Deliveries</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {summary?.headline || "Today's predicted delivery success: 0%"}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                LOGIX predicts delivery success by analyzing customer behavior windows, package requirements, vehicle compatibility, and driver workload from your uploaded dataset.
              </p>
            </div>

            {summary?.atRiskDeliveries > 0 && (
              <button
                onClick={() => navigate('/at-risk')}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Investigate {summary.atRiskDeliveries} At-Risk Orders
              </button>
            )}
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Scheduled"
              value={summary?.totalDeliveries || 0}
              subtitle="Orders in uploaded dataset"
              icon={PackageCheck}
              color="indigo"
            />
            <KPICard
              title="Predicted Success Rate"
              value={`${summary?.predictedSuccessRate || 0}%`}
              subtitle={`${summary?.successfulDeliveries || 0} orders on track`}
              icon={TrendingUp}
              color="emerald"
            />
            <KPICard
              title="At-Risk Deliveries"
              value={summary?.atRiskDeliveries || 0}
              subtitle="Failure probability > 25%"
              icon={AlertTriangle}
              color="amber"
              badge={`${summary?.criticalRiskCount || 0} Critical`}
            />
            <KPICard
              title="Predicted Failures"
              value={summary?.criticalRiskCount || 0}
              subtitle="Failure probability > 70%"
              icon={XCircle}
              color="rose"
            />
          </div>

          {/* Main Grid: At-Risk Table + Risk Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* At-Risk Table (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Today's At-Risk Deliveries
                    </h2>
                    <p className="text-xs text-slate-500">
                      Prioritized by failure risk level. Click Investigate for AI recommendations.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/at-risk')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {atRiskOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 italic">
                    No at-risk deliveries detected in current uploaded dataset.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-2.5 px-3">Order</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Risk Level</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {atRiskOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-bold font-mono text-slate-900">{order.id}</td>
                            <td className="py-3 px-3 text-slate-700">{order.customerName}</td>
                            <td className="py-3 px-3 text-slate-600">{order.packageCategory}</td>
                            <td className="py-3 px-3">
                              <RiskBadge level={order.riskLevel} size="sm" />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-semibold text-xs cursor-pointer transition-all"
                              >
                                Investigate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Distribution Chart (1 col) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">Risk Level Distribution</h2>
                <p className="text-xs text-slate-500 mb-4">Delivery risk classification overview</p>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI Risk Threshold:
                </span>
                <p className="text-slate-600 text-[11px]">
                  Critical (&gt;70% failure), High (50–70%), Medium (25–50%), Low (&lt;25%).
                </p>
              </div>
            </div>
          </div>

          {/* Operational Insights Summary Banner */}
          {insights && insights.summary && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Operational Pattern Discovery
                </span>
                <p className="text-sm font-medium text-slate-800">
                  {insights.summary}
                </p>
              </div>

              <button
                onClick={() => navigate('/insights')}
                className="px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold rounded-lg text-xs cursor-pointer shadow-2xs shrink-0"
              >
                Explore Insights
              </button>
            </div>
          )}
        </>
      )}

      {/* File Upload Modal */}
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
