import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Assets } from './components/assets/Assets';
import { AssetDetail } from './components/assets/AssetDetail';
import { Bookings } from './components/bookings/Bookings';
import { Maintenance } from './components/maintenance/Maintenance';
import { Audits } from './components/audits/Audits';
import { Settings } from './components/settings/Settings';
import { Employees } from './components/employees/Employees';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Or a sleek full-page loader

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#050505] text-slate-800 dark:text-white transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="hidden dark:block absolute top-0 left-1/4 w-1/2 h-32 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <Header />
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Remove Placeholder component since it's no longer used
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
