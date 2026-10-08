import React from 'react';

interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = (level || 'LOW').toUpperCase();

  let styles = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let label = 'LOW RISK';

  if (normalized === 'CRITICAL') {
    styles = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    label = 'CRITICAL RISK';
  } else if (normalized === 'HIGH') {
    styles = 'bg-amber-100 text-amber-800 border-amber-300';
    label = 'HIGH RISK';
  } else if (normalized === 'MEDIUM') {
    styles = 'bg-orange-100 text-orange-800 border-orange-300';
    label = 'MEDIUM RISK';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${styles} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {label}
    </span>
  );
};
