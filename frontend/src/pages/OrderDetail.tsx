import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  UserCheck,
  Package,
  User,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { fetchOrderDetails, applyRecommendation } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { AIExplanation } from '../components/AIExplanation';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Applying, setApplying] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(orderId: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrderDetails(orderId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyRecommendation() {
    if (!id) return;
    try {
      setApplying(true);
      const res = await applyRecommendation(id);
      setAppliedMessage(
        `Recommendation Applied! Risk reduced from ${Math.round(
          (1 - res.beforeSuccess) * 100
        )}% to ${Math.round((1 - res.afterSuccess) * 100)}% (+${res.delta}% success boost).`
      );
      // Reload updated details
      await loadData(id);
    } catch (err: any) {
      alert('Failed to apply recommendation: ' + err.message);
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-1">Error Loading Order</h3>
          <p className="text-sm">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { order, customer, package: pkg, vehicle, driver, prediction, recommendation } = data;
  const succPct = Math.round((prediction.successProbability || 0.8) * 100);
  const failPct = Math.round((prediction.failureProbability || 0.2) * 100);

  const recPlan = recommendation?.recommendedPlan;
  const curPlan = recommendation?.currentPlan;
  const deltaPct = Math.round((recommendation?.improvementDelta || 0) * 100);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                Order {order.id}
              </h1>
              <RiskBadge level={prediction.riskLevel} size="md" />
              {order.id === 'O1024' && (
                <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-xs">
                  HERO DEMO ORDER
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled for {customer.name} ({customer.zone}) • {order.requestedTime}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/simulator?orderId=${order.id}`)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Open Decision Simulator
        </button>
      </div>

      {/* Applied Success Message Alert */}
      {appliedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold">{appliedMessage}</span>
          </div>
          <button
            onClick={() => setAppliedMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Cards: Success Probability + Current Plan vs AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Summary Card (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              LOGIX AI Probability
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                {succPct}%
              </span>
              <span className="text-xs font-bold text-slate-500">Success Likelihood</span>
            </div>

            <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${succPct}%` }}
              ></div>
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${failPct}%` }}
              ></div>
            </div>

            <div className="mt-2 flex justify-between text-xs font-semibold">
              <span className="text-emerald-700">Success: {succPct}%</span>
              <span className="text-rose-600">Failure Risk: {failPct}%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-xs space-y-1">
            <span className="font-bold text-slate-700">Risk Assessment:</span>
            <p className="text-slate-600 leading-snug">
              {prediction.riskLevel === 'CRITICAL' || prediction.riskLevel === 'HIGH'
                ? 'High risk of delivery failure under current schedule and vehicle parameters.'
                : 'Delivery parameters are favorable for successful completion.'}
            </p>
          </div>
        </div>

        {/* Current Plan vs AI Recommendation Side-by-Side (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-md border border-indigo-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">LOGIX Prevention Recommendation</h2>
              </div>
              {deltaPct > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-full">
                  +{deltaPct}% Success Increase
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Current Plan Box */}
              <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700 text-xs space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Current Plan
                </span>
                <div className="space-y-1 text-slate-200">
                  <p>
                    <span className="text-slate-400">Window:</span>{' '}
                    <span className="font-bold capitalize">{curPlan?.window}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Vehicle:</span>{' '}
                    <span className="font-semibold">{curPlan?.vehicleNumber}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Driver:</span>{' '}
                    <span className="font-semibold">{curPlan?.driverName}</span>
                  </p>
                  <p className="pt-1 font-mono font-bold text-rose-400">
                    Predicted Success: {Math.round((curPlan?.successProbability || 0) * 100)}%
                  </p>
                </div>
              </div>

              {/* Recommended Plan Box */}
              <div className="bg-indigo-950/90 rounded-lg p-3.5 border border-indigo-600/80 text-xs space-y-2">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  AI Recommended Plan
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                </span>
                <div className="space-y-1 text-white">
                  <p>
                    <span className="text-indigo-300">Window:</span>{' '}
                    <span className="font-bold capitalize text-amber-300">
                      {recPlan?.recommendedWindow} ({recPlan?.recommendedWindowLabel})
                    </span>
                  </p>
                  <p>
                    <span className="text-indigo-300">Vehicle:</span>{' '}
                    <span className="font-semibold">{recPlan?.recommendedVehicleNumber}</span>
                  </p>
                  <p>
                    <span className="text-indigo-300">Driver:</span>{' '}
                    <span className="font-semibold">{recPlan?.recommendedDriverName}</span>
                  </p>
                  <p className="pt-1 font-mono font-bold text-emerald-400">
                    Predicted Success: {Math.round((recPlan?.predictedSuccess || 0.95) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-3 border-t border-indigo-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowWhyModal(!showWhyModal)}
              className="text-xs text-indigo-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
            >
              <HelpCircle className="w-4 h-4" />
              Why this recommendation?
            </button>

            <button
              onClick={handleApplyRecommendation}
              disabled={Applying || deltaPct <= 0}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                deltaPct > 0
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {Applying ? (
                <span>Applying AI Change...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply AI Recommendation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Numbered Plain-Language Explanation Dropdown / Modal */}
      {showWhyModal && (
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-5 shadow-sm text-slate-900 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Plain-Language AI Explanation Steps
            </h3>
            <button
              onClick={() => setShowWhyModal(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {recommendation?.whyExplanation?.map((step: string, idx: number) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-indigo-100 font-medium text-slate-800">
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: AI Plain Language Factor Breakdown + Order Context Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factor Breakdown (2 cols) */}
        <div className="lg:col-span-2">
          <AIExplanation factors={prediction.contributingFactors} />
        </div>

        {/* Entity Metadata Card (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Logistics Entity Context
          </h3>

          <div className="space-y-3">
            {/* Customer */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{customer.name}</span>
                <p className="text-slate-500">
                  Best Window:{' '}
                  <span className="font-semibold text-slate-700 uppercase">
                    {customer.bestDeliveryWindow}
                  </span>
                </p>
                <p className="text-slate-500">
                  Availability Score: {Math.round((customer.availabilityScore || 0.8) * 100)}%
                </p>
              </div>
            </div>

            {/* Package */}
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">
                  {pkg.category} ({pkg.priority} Priority)
                </span>
                <p className="text-slate-500">
                  Handling: {pkg.specialHandling || 'Standard care'}
                </p>
                <p className="text-slate-500">Risk Score: {pkg.riskScore}/100</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">
                  {vehicle.vehicleNumber} ({vehicle.vehicleType})
                </span>
                <p className="text-slate-500">
                  Refrigerated:{' '}
                  <span className="font-semibold">
                    {vehicle.refrigeration ? 'Yes (Active)' : 'No'}
                  </span>
                </p>
                <p className="text-slate-500">Health: {vehicle.healthScore}%</p>
              </div>
            </div>

            {/* Driver */}
            <div className="flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{driver.name}</span>
                <p className="text-slate-500">
                  Experience: {driver.experienceLevel} • Workload: {driver.workloadScore}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
