import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Calendar, Wrench, ShieldCheck, Settings, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/' },
    { name: 'Assets', icon: Box, path: '/assets' },
    { name: 'Bookings', icon: Calendar, path: '/bookings' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Audits', icon: ShieldCheck, path: '/audits' },
  ];

  return (
    <aside className="w-72 h-screen bg-white dark:bg-[#0a0a0c] border-r border-slate-200 dark:border-white/5 flex flex-col z-20 sticky top-0 transition-colors duration-500">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 dark:bg-gradient-brand flex items-center justify-center shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Box size={20} className="text-white" />
          </div>
          AssetFlow
        </h1>
      </div>
      
      <div className="px-6 pb-2 text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider">
        Main Menu
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'text-brand-700 bg-brand-50 shadow-sm dark:text-white dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-600 dark:bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                )}
                <item.icon size={20} className={`transition-all duration-300 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'group-hover:scale-110'}`} />
                <span className="font-medium tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6">
        <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'text-brand-700 bg-brand-50 dark:text-white dark:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
              }`
            }
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-medium tracking-wide">Settings</span>
        </NavLink>
        
        <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-gradient-to-br dark:from-brand-600 dark:to-accent-600 flex items-center justify-center text-brand-700 dark:text-white font-bold text-sm shadow-inner">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-brand-600 dark:text-brand-400 truncate">{user?.role || 'Employee'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
