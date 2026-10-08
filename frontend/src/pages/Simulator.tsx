import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Zap,
  RefreshCw,
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

import {
  fetchOrders,
  fetchVehicles,
  fetchDrivers,
  runSimulation,
} from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { AIExplanation } from '../components/AIExplanation';
import { EmptyDataState } from '../components/EmptyDataState';
import { UploadDataModal } from '../components/forms/UploadDataModal';

export const Simulator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orders, setOrders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedWindow, setSelectedWindow] = useState('evening');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('CRITICAL');

  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [initialOrderId]);

  async function loadData() {
    try {
      setLoading(true);
      const [ordList, vehList, drvList] = await Promise.all([
        fetchOrders().catch(() => []),
        fetchVehicles().catch(() => []),
        fetchDrivers().catch(() => []),
      ]);
      setOrders(ordList);
      setVehicles(vehList);
      setDrivers(drvList);

      const target = ordList.find((o: any) => o.id === initialOrderId) || ordList[0];
      if (target) {
        setSelectedOrderId(target.id);
        setSelectedWindow('evening');
        setSelectedVehicleId(vehList[0]?.id || target.assignedVehicleId || '');
        setSelectedDriverId(drvList[0]?.id || target.assignedDriverId || '');
        setSelectedPriority(target.priority || 'CRITICAL');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedOrderId) {
      executeSimulation();
    }
  }, [selectedOrderId, selectedWindow, selectedVehicleId, selectedDriverId, selectedPriority]);

  async function executeSimulation() {
    if (!selectedOrderId) return;
    try {
      setSimulating(true);
      const res = await runSimulation({
        orderId: selectedOrderId,
        requestedWindow: selectedWindow,
        assignedVehicleId: selectedVehicleId || undefined,
        assignedDriverId: selectedDriverId || undefined,
        priority: selectedPriority,
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const curSucc = simResult ? Math.round(simResult.current.successProbability * 100) : 60;
  const whatSucc = simResult ? Math.round(simResult.whatIf.successProbability * 100) : 95;
  const delta = simResult ? simResult.deltaPercentagePoints : 35;

  const chartData = [
    { name: 'Current Plan', success: curSucc, fill: '#64748b' },
    { name: 'What-If Simulated', success: whatSucc, fill: '#10b981' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Delivery Decision Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Simulate parameter adjustments (time window, vehicle, driver) to evaluate what-if delivery success outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            Upload Logistics Data
          </button>
          {orders.length > 0 && (
            <button
              onClick={executeSimulation}
              disabled={simulating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              Run Simulation
            </button>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyDataState
          title="No Logistics Data Uploaded for Simulation"
          description="Upload your logistics CSV or Excel files to run what-if simulations on delivery time windows, vehicle assignments, and driver workloads."
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : (
        /* Main Grid: Controls (1 col) + Output Cards & Charts (2 cols) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Controls Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              What-If Parameters
            </h2>

            <div className="space-y-3.5 text-xs">
              {/* Target Order Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {o.customerName} ({o.packageCategory}, {o.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Window */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Time Window</label>
                <select
                  value={selectedWindow}
                  onChange={(e) => setSelectedWindow(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  <option value="morning">Morning (08:00 AM – 11:00 AM)</option>
                  <option value="midday">Midday (11:00 AM – 02:00 PM)</option>
                  <option value="afternoon">Afternoon (02:00 PM – 05:00 PM)</option>
                  <option value="evening">Evening (05:00 PM – 08:00 PM)</option>
                </select>
              </div>

              {/* Assigned Vehicle */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} ({v.vehicleType} - {v.refrigeration ? 'Refrigerated' : 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Driver */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.zone}, Workload: {d.workloadScore}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Priority */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Override</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results & Visualizations (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Plan Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Plan
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 font-mono">{curSucc}%</span>
                  {simResult && <RiskBadge level={simResult.current.riskLevel} size="sm" />}
                </div>
                <p className="text-xs text-slate-500">
                  Failure Risk: {100 - curSucc}%
                </p>
              </div>

              {/* What-If Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-md border border-indigo-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    What-If Simulated Plan
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2 py-0.5 rounded-full">
                    {delta >= 0 ? `+${delta}` : delta} percentage points
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-400 font-mono">{whatSucc}%</span>
                  {simResult && <RiskBadge level={simResult.whatIf.riskLevel} size="sm" />}
                </div>
                <p className="text-xs text-slate-300">
                  Simulated Failure Risk: {100 - whatSucc}%
                </p>
              </div>
            </div>

            {/* Bar Chart Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Success Likelihood Comparison
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Predicted Success']} />
                    <Bar dataKey="success" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contributing Factors for Simulated State */}
            {simResult && (
              <AIExplanation
                factors={simResult.whatIf.contributingFactors}
                title="Simulated Outcome Factors"
              />
            )}
          </div>
        </div>
      )}

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
