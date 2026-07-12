import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<div className="p-8">Assets Module (Coming Soon)</div>} />
              <Route path="/bookings" element={<div className="p-8">Bookings Module (Coming Soon)</div>} />
              <Route path="/maintenance" element={<div className="p-8">Maintenance Module (Coming Soon)</div>} />
              <Route path="/audits" element={<div className="p-8">Audits Module (Coming Soon)</div>} />
              <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
