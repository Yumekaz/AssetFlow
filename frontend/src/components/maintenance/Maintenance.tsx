import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Search, Filter, Plus, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { CreateMaintenanceModal } from './CreateMaintenanceModal';

interface Maintenance {
  id: string;
  asset: { id: string; name: string; assetTag: string };
  raisedBy: { id: string; name: string };
  issueDescription: string;
  priority: string;
  status: string;
  createdAt: string;
}

export const Maintenance: React.FC = () => {
  const [maintenanceTickets, setMaintenanceTickets] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get('/api/maintenance');
      setMaintenanceTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const filteredTickets = maintenanceTickets.filter(ticket => 
    ticket.asset.name.toLowerCase().includes(search.toLowerCase()) || 
    ticket.issueDescription.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Critical') return <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold uppercase tracking-wide">Critical</span>;
    if (priority === 'High') return <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">High</span>;
    return <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">{priority}</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Resolved') return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 w-fit"><CheckCircle size={14} /> Resolved</span>;
    if (status === 'Pending') return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 w-fit"><AlertTriangle size={14} /> Pending</span>;
    return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70 text-xs font-bold flex items-center gap-1.5 w-fit">{status}</span>;
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
              <Wrench size={24} className="text-white" />
            </div>
            Maintenance Tickets
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Track repairs and service requests for your assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300">
            <Filter size={18} />
            Filters
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-brand text-white px-5 py-2.5 rounded-xl font-bold shadow-md dark:shadow-[0_5px_20px_rgba(99,102,241,0.4)] hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Report Issue
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0c]">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search issues or assets..." 
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
                <th className="px-6 py-4">Issue / Asset</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="animate-spin text-brand-500" size={32} />
                      <p className="text-slate-400 dark:text-white/40 font-medium">Loading tickets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-white/40 font-medium">
                    No maintenance tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {ticket.issueDescription}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-white/50">{ticket.asset.assetTag}</span>
                          <span className="text-xs text-slate-500 dark:text-white/40 truncate">{ticket.asset.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 dark:text-white/80">{ticket.raisedBy.name}</span>
                        <span className="text-xs text-slate-400 dark:text-white/40">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
      
      <CreateMaintenanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMaintenance} 
      />

    </div>
  );
};
