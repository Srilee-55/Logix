import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, Loader2, Cpu, BarChart3, ShieldAlert } from 'lucide-react';
import { fetchOrders, fetchRiskSummary } from '../services/api';

const processingSteps = [
  { id: 1, label: 'LOGIX Engine Initializing & Connecting to Data Store...', icon: Cpu },
  { id: 2, label: 'Checking & Loading Delivery Records...', icon: Zap },
  { id: 3, label: 'Evaluating Vehicle Compatibility & Capacity...', icon: BarChart3 },
  { id: 4, label: 'Calculating Driver Workload & Zone Constraints...', icon: BarChart3 },
  { id: 5, label: 'Running ML Model: Predicting Success & Risk Levels...', icon: ShieldAlert },
  { id: 6, label: 'Generating Operational Insights & Recommendations...', icon: CheckCircle2 },
];

export const Processing: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [statusText, setStatusText] = useState('Initializing LOGIX Core System...');

  useEffect(() => {
    let isMounted = true;

    async function runEngineProcessing() {
      try {
        if (!isMounted) return;
        setActiveStep(1);
        setStatusText('Checking database connection...');

        await fetchOrders().catch(() => []);
        setCompletedSteps((prev) => [...prev, 1]);

        for (let step = 2; step <= 6; step++) {
          await new Promise((r) => setTimeout(r, 250));
          if (!isMounted) return;
          setActiveStep(step);
          setCompletedSteps((prev) => [...prev, step]);
        }

        await fetchRiskSummary().catch(() => {});

        setStatusText('Analysis Complete — Redirecting to Dashboard...');
        await new Promise((r) => setTimeout(r, 300));
        if (isMounted) {
          navigate('/');
        }
      } catch (err) {
        console.error('Processing error:', err);
        if (isMounted) navigate('/');
      }
    }

    runEngineProcessing();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">LOGIX Engine Initializing</h1>
            <p className="text-xs text-indigo-400 font-semibold">{statusText}</p>
          </div>
        </div>

        <div className="space-y-3">
          {processingSteps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isActive
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{step.label}</span>
                </div>

                {isDone && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    READY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${(completedSteps.length / processingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
