import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Login } from './components/auth/Login';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Or a sleek full-page loader

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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
            <Route path="/assets" element={<Placeholder title="Assets Module" />} />
            <Route path="/bookings" element={<Placeholder title="Bookings Module" />} />
            <Route path="/maintenance" element={<Placeholder title="Maintenance Module" />} />
            <Route path="/audits" element={<Placeholder title="Audits Module" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
    <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center shadow-inner">
      <div className="w-12 h-12 border-4 border-slate-300 dark:border-white/10 border-t-brand-500 rounded-full animate-spin"></div>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">{title}</h2>
    <p className="text-slate-500 dark:text-white/40 text-center max-w-md">
      This module is currently under development. It will be fully integrated and available in Phase 9.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
