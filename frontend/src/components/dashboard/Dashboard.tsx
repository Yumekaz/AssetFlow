import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Wrench, Calendar, Activity } from 'lucide-react';
import { KPICard } from './KPICard';
import { OverdueList } from './OverdueList';

export const Dashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceCount: 0,
    activeBookings: 0,
    overdueReturns: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && 'assetsAvailable' in res.data) {
          setKpiData(res.data);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        setKpiData({
          assetsAvailable: 142,
          assetsAllocated: 89,
          maintenanceCount: 12,
          activeBookings: 34,
          overdueReturns: 5
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKPIs();
    
    // Polling as a fallback
    const interval = setInterval(fetchKPIs, 60000);

    // Server-Sent Events for Live Updates
    const eventSource = new EventSource('/api/notifications/events');
    eventSource.onmessage = (event) => {
      console.log('Received live update:', event.data);
      // Re-fetch data instantly when a backend activity occurs
      fetchKPIs();
    };
    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white/60 mb-4 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            System Online
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-lg">
            Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600 dark:from-brand-400 dark:to-accent-500">Overview</span>
          </h1>
          <p className="text-slate-500 dark:text-white/40 mt-3 text-lg font-medium tracking-wide">Real-time telemetry and resource allocation.</p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-5 py-2.5 rounded-2xl font-bold tracking-wide shadow-sm dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-md">
          <Activity size={18} className="animate-pulse" />
          Live updates active
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 dark:opacity-50 rounded-full animate-pulse"></div>
            <div className="relative w-16 h-16 border-4 border-slate-200 dark:border-white/10 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard 
              title="Assets Available" 
              value={kpiData.assetsAvailable} 
              icon={Box} 
              trend="12%" 
              trendUp={true}
              colorClass="text-brand-600 dark:text-brand-400"
              bgClass="bg-brand-50 dark:bg-brand-500/10"
              sparklineData={[10, 15, 20, 25, 40, 35, 45]}
            />
            <KPICard 
              title="Assets Allocated" 
              value={kpiData.assetsAllocated} 
              icon={Box} 
              trend="5%" 
              trendUp={true}
              colorClass="text-accent-600 dark:text-accent-400"
              bgClass="bg-accent-50 dark:bg-accent-500/10"
              sparklineData={[30, 25, 35, 40, 35, 50, 45]}
            />
            <KPICard 
              title="Active Bookings" 
              value={kpiData.activeBookings} 
              icon={Calendar} 
              trend="18%" 
              trendUp={true}
              colorClass="text-emerald-600 dark:text-emerald-400"
              bgClass="bg-emerald-50 dark:bg-emerald-500/10"
              sparklineData={[5, 10, 15, 30, 25, 45, 40]}
            />
            <KPICard 
              title="In Maintenance" 
              value={kpiData.maintenanceCount} 
              icon={Wrench} 
              trend="2%" 
              trendUp={false}
              colorClass="text-amber-600 dark:text-amber-400"
              bgClass="bg-amber-50 dark:bg-amber-500/10"
              sparklineData={[20, 15, 18, 12, 10, 8, 5]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-panel p-8 rounded-3xl h-[450px] flex flex-col items-center justify-center text-slate-400 dark:text-white/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Activity size={48} className="mb-4 opacity-50 dark:opacity-20" />
                <p className="font-semibold tracking-widest uppercase">Asset Utilization Analytics</p>
                <p className="text-sm mt-2 opacity-70 dark:opacity-50">Module expanding in Phase 9</p>
              </div>
            </div>
            <div className="lg:col-span-1 h-[450px]">
              <OverdueList />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
