import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-200 bg-white text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        <span className="font-semibold text-slate-700">LOGIX — AI Delivery Success Intelligence</span>
        <span className="mx-2">•</span>
        <span>"Don't just optimize the route. Predict whether the delivery will succeed."</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
        <span className="font-mono text-slate-400 text-[11px]">
          Synthetic / simulated logistics data for demonstration
        </span>
      </div>
    </footer>
  );
};
