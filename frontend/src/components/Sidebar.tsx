import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  PackageCheck,
  Package,
  SlidersHorizontal,
  Users,
  Truck,
  UserCheck,
  Lightbulb,
  Bot,
  Zap,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/at-risk', label: 'At-Risk Deliveries', icon: AlertTriangle, badge: 'Hero O1024' },
  { path: '/orders', label: 'All Orders', icon: PackageCheck },
  { path: '/simulator', label: 'Decision Simulator', icon: SlidersHorizontal },
  { path: '/customers', label: 'Customer Intelligence', icon: Users },
  { path: '/packages', label: 'Packages & Specs', icon: Package },
  { path: '/vehicles', label: 'Fleet Suitability', icon: Truck },
  { path: '/drivers', label: 'Driver Workload', icon: UserCheck },
  { path: '/insights', label: 'Operational Insights', icon: Lightbulb },
  { path: '/copilot', label: 'LOGIX Copilot', icon: Bot, isAi: true },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-wider text-white">LOGIX</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Success Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.isAi ? 'text-indigo-400' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Philosophy Banner */}
      <div className="p-4 m-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <p className="text-slate-300 italic font-medium">
          "Don't just optimize the route. Predict whether the delivery will succeed."
        </p>
      </div>
    </aside>
  );
};
