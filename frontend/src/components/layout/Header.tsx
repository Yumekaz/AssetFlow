import React from 'react';
import { Search } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const Header: React.FC = () => {
  return (
    <header className="h-20 glass sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assets, bookings, or employees..." 
            className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown />
      </div>
    </header>
  );
};
