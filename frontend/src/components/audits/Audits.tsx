import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Search, Filter, Plus, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface AuditCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: { id: string; name: string };
  auditItems: any[];
}

export const Audits: React.FC = () => {
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await axios.get('/api/audits');
        setAudits(response.data);
      } catch (error) {
        console.error('Failed to fetch audits', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  const filteredAudits = audits.filter(audit => 
    audit.name.toLowerCase().includes(search.toLowerCase()) ||
    audit.createdBy.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'Closed') return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70 text-xs font-bold border border-slate-200 dark:border-white/20 flex items-center gap-1.5 w-fit"><CheckCircle2 size={14} /> Closed</span>;
    if (status === 'In Progress') return <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-500/30 flex items-center gap-1.5 w-fit"><Activity size={14} /> In Progress</span>;
    return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 w-fit"><Clock size={14} /> {status}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-gradient-brand shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <ShieldCheck size={24} className="text-white" />
            </div>
            Compliance Audits
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Manage organization-wide inventory scanning and compliance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-bold shadow-md dark:shadow-[0_5px_20px_rgba(99,102,241,0.4)] hover:opacity-90 transition-opacity">
            <Plus size={18} />
            Start New Audit
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0c]">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search audit cycles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 dark:text-white/50 font-bold">
                <th className="px-6 py-4">Audit Name</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Items Scanned</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="animate-spin text-brand-500" size={32} />
                      <p className="text-slate-400 dark:text-white/40 font-medium">Loading audits...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 dark:text-white/40 font-medium">
                    No compliance audits found.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((audit) => (
                  <tr key={audit.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {audit.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-white/80">
                      {audit.createdBy.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-white/60">
                        <div className="flex items-center gap-1.5"><span className="w-8">Start:</span> {formatDate(audit.startDate)}</div>
                        <div className="flex items-center gap-1.5"><span className="w-8 text-slate-400 dark:text-white/40">End:</span> {formatDate(audit.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(audit.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                        {audit.auditItems.length} scanned
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
