import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';

interface Factor {
  factor: string;
  impact: string;
  direction: string;
  score: number;
}

interface AIExplanationProps {
  factors: Factor[];
  title?: string;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({
  factors,
  title = "AI Delivery Failure Risk Breakdown",
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-600" />
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">Plain Business Language</span>
      </div>

      <div className="space-y-2.5">
        {factors && factors.length > 0 ? (
          factors.map((item, idx) => {
            const isNegative = item.score < 0 || item.direction.includes('-');
            const isCritical = item.impact?.includes('CRITICAL');

            let icon = <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />;
            let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

            if (isNegative) {
              icon = <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />;
              badgeStyle = isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                : 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  {icon}
                  <span className="text-xs font-medium text-slate-800 leading-snug">
                    {item.factor}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border shrink-0 ${badgeStyle}`}
                >
                  {item.direction}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 italic">No risk factors evaluated.</p>
        )}
      </div>
    </div>
  );
};
