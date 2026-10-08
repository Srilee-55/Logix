import React, { useState } from 'react';
import { Sparkles, Activity, LogOut, User, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadDataModal } from './forms/UploadDataModal';

interface NavbarProps {
  databaseMode?: string;
  onDataUploaded?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ databaseMode = 'local_mock', onDataUploaded }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        {/* Search / Context */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            LOGIX Engine Active
          </span>
          <span className="text-xs text-slate-400 font-mono">
            DB Mode: {databaseMode.toUpperCase()}
          </span>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            Upload Data (CSV / Excel)
          </button>

          <button
            onClick={() => navigate('/copilot')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            Ask Copilot
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          {/* User Session Profile & Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{user.name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          if (onDataUploaded) onDataUploaded();
        }}
      />
    </>
  );
};
