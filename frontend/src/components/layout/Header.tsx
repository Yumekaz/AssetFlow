import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { useTheme } from './ThemeProvider';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-24 sticky top-0 z-50 flex items-center justify-between px-10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="hidden dark:block absolute inset-0 bg-brand-500/20 rounded-2xl blur-md group-focus-within:bg-brand-500/30 transition-all duration-500"></div>
          <div className="relative flex items-center bg-slate-100 dark:bg-[#111111] border border-transparent dark:border-white/10 rounded-2xl overflow-hidden transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:group-focus-within:border-brand-500/50">
            <Search className="absolute left-4 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search assets, bookings, or employees... (Press '/')" 
              className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 pl-12 pr-4 py-3.5 text-sm outline-none"
            />
            <div className="absolute right-4 px-2 py-1 bg-white dark:bg-white/10 rounded text-xs text-slate-400 dark:text-white/50 font-mono shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
              /
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative focus:outline-none text-slate-500 dark:text-white/70"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <NotificationDropdown />
      </div>
    </header>
  );
};
