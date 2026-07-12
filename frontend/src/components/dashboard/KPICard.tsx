import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
  bgClass?: string;
  sparklineData?: number[];
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  colorClass = "text-brand-500",
  bgClass = "bg-white/5",
  sparklineData = [10, 25, 15, 30, 20, 45, 35]
}) => {
  // Simple SVG sparkline generator
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min || 1;
  const points = sparklineData.map((d, i) => {
    const x = (i / (sparklineData.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = trendUp ? '#10b981' : '#f43f5e';

  return (
    <div className="group relative rounded-3xl overflow-hidden glass-panel glass-panel-hover transition-all duration-500 hover:-translate-y-1 bg-white dark:bg-transparent">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-7">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-inner ${bgClass} ${colorClass}`}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${trendUp ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
              {trendUp ? '↗' : '↘'} {trend}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-white mb-1 drop-shadow-sm dark:drop-shadow-md">{value}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-white/50 tracking-wide">{title}</p>
        </div>
      </div>
      
      {/* Sparkline Graphic */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-60 transition-opacity duration-500 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <polyline 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            points={points} 
            className="dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          />
          <polygon 
            fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
            points={`0,100 ${points} 100,100`}
            className="opacity-20"
          />
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
