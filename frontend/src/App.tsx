import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Login } from './pages/Login';
import { Processing } from './pages/Processing';

import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { AtRisk } from './pages/AtRisk';
import { OrderDetail } from './pages/OrderDetail';
import { Simulator } from './pages/Simulator';
import { Customers } from './pages/Customers';
import { Packages } from './pages/Packages';
import { Vehicles } from './pages/Vehicles';
import { Drivers } from './pages/Drivers';
import { Insights } from './pages/Insights';
import { CopilotPage } from './pages/CopilotPage';

import { fetchHealth } from './services/api';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [dbMode, setDbMode] = useState('local_mock');

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        if (h && h.database_mode) setDbMode(h.database_mode);
      })
      .catch(() => {});
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar databaseMode={dbMode} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/at-risk" element={<AtRisk />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/copilot" element={<CopilotPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/processing" element={<Processing />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
