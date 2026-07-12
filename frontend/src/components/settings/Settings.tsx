import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-gradient-brand shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            <SettingsIcon size={24} className="text-white" />
          </div>
          System Settings
        </h1>
        <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Manage your personal profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/10 rounded-xl font-bold text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-brand-500/30 transition-all">
            <User size={18} /> Profile Information
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-all">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-all">
            <Shield size={18} /> Security & Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-medium transition-all">
            <Globe size={18} /> Workspace Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0c]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h2>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <button className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg font-bold text-sm transition-colors">
                  Change Avatar
                </button>
                <p className="text-xs text-slate-500 dark:text-white/40 mt-2">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Email Address</label>
                <input type="email" defaultValue={user?.email} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Role</label>
                <input type="text" defaultValue={user?.role} disabled className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-slate-500 dark:text-white/50 cursor-not-allowed" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end">
              <button className="bg-gradient-brand text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
