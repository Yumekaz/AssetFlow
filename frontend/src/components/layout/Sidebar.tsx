import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Calendar, Wrench, ShieldCheck, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Assets', icon: Box, path: '/assets' },
    { name: 'Bookings', icon: Calendar, path: '/bookings' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Audits', icon: ShieldCheck, path: '/audits' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Box size={20} className="text-white" />
          </div>
          AssetFlow
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600/10 text-brand-500 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="opacity-80" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
