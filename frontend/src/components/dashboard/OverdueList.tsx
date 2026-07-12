import React from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';

export const OverdueList: React.FC = () => {
  const overdueItems = [
    {
      id: '1',
      assetName: 'MacBook Pro 14"',
      assetTag: 'AF-0042',
      employee: 'Sarah Jenkins',
      daysOverdue: 3,
    },
    {
      id: '2',
      assetName: 'Epson Projector',
      assetTag: 'AF-0015',
      employee: 'Marketing Dept',
      daysOverdue: 1,
    }
  ];

  if (overdueItems.length === 0) return null;

  return (
    <div className="rounded-3xl overflow-hidden glass-panel flex flex-col h-full border border-rose-200 dark:border-rose-500/20 shadow-md dark:shadow-[0_0_30px_rgba(225,29,72,0.05)] bg-white dark:bg-transparent">
      <div className="p-6 border-b border-rose-100 dark:border-white/5 flex items-center justify-between relative overflow-hidden bg-rose-50/50 dark:bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 dark:from-rose-500/10 to-transparent"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl shadow-sm dark:shadow-[0_0_15px_rgba(225,29,72,0.3)]">
            <AlertTriangle size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Action Required</h3>
            <p className="text-sm text-slate-500 dark:text-rose-200/60 font-medium">Overdue allocations</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white dark:bg-transparent">
        <div className="flex flex-col gap-2">
          {overdueItems.map((item) => (
            <div key={item.id} className="group p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{item.assetName}</p>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:text-white/30 dark:bg-white/5 px-2 py-0.5 rounded-md">{item.assetTag}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-white/50 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Holder: {item.employee}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 border dark:border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap shadow-sm dark:shadow-[0_0_10px_rgba(225,29,72,0.1)]">
                  <Clock size={14} />
                  {item.daysOverdue}D OVERDUE
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
