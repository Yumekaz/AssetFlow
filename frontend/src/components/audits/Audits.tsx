import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Search, Plus, Activity, Clock, CheckCircle2, AlertTriangle, AlertCircle, Check, X, FileText, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuditItem {
  id: string;
  asset: { name: string; assetTag: string };
  result: string;
  notes: string | null;
}

interface AuditCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: { id: string; name: string };
  auditItems: AuditItem[];
}

export const Audits: React.FC = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Start Audit Modal States
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Scan Modal States
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  
  // Discrepancy Modal States
  const [activeDiscrepancies, setActiveDiscrepancies] = useState<any | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/audits');
      setAudits(response.data);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditName || !startDate || !endDate) return;
    try {
      await axios.post('/api/audits', {
        name: auditName,
        startDate,
        endDate
      });
      setIsStartModalOpen(false);
      setAuditName('');
      setStartDate('');
      setEndDate('');
      fetchAudits();
    } catch (error) {
      alert('Failed to start new audit cycle.');
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuditId || !tagsInput) return;
    
    // Split input by comma or whitespace, filter empty values
    const tags = tagsInput.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
    
    try {
      await axios.post(`/api/audits/${selectedAuditId}/scan`, {
        assetTags: tags
      });
      setIsScanModalOpen(false);
      setTagsInput('');
      setSelectedAuditId(null);
      fetchAudits();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit asset scans.');
    }
  };

  const handleCloseAudit = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this audit cycle? This will lock edits and update asset conditions/statuses.')) return;
    try {
      const res = await axios.put(`/api/audits/${id}/close`);
      // Open the discrepancy report returned in the response
      setActiveDiscrepancies(res.data.discrepancyReport);
      fetchAudits();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to close audit cycle.');
    }
  };

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

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Asset Manager';

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-gradient-brand shadow-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            Compliance Audits
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Manage organization-wide inventory scanning and compliance.</p>
        </div>
        
        {isAdminOrManager && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStartModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-brand text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              Start New Audit
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-transparent">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search audit cycles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-all shadow-sm"
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
                        <div className="flex items-center gap-1.5"><span className="w-8 font-semibold">Start:</span> {formatDate(audit.startDate)}</div>
                        <div className="flex items-center gap-1.5"><span className="w-8 text-slate-400 dark:text-white/40">End:</span> {formatDate(audit.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(audit.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                        {audit.auditItems?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {audit.status === 'In Progress' && isAdminOrManager && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAuditId(audit.id);
                                setIsScanModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Upload size={12} /> Scan CSV
                            </button>
                            <button
                              onClick={() => handleCloseAudit(audit.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Check size={12} /> Close Cycle
                            </button>
                          </>
                        )}
                        {audit.status === 'Closed' && (
                          <button
                            onClick={() => {
                              const discrepant = audit.auditItems.filter((i: any) => i.result === 'Missing' || i.result === 'Damaged');
                              setActiveDiscrepancies({
                                totalItems: audit.auditItems.length,
                                discrepanciesCount: discrepant.length,
                                discrepancies: discrepant
                              });
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-white/60 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <FileText size={12} /> Discrepancies
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Audit Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-brand-500" /> Start New Audit
              </h3>
              <button onClick={() => setIsStartModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleStartAudit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Audit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Hardware Audit"
                  value={auditName}
                  onChange={e => setAuditName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] rounded-2xl py-3 px-4 outline-none border border-transparent focus:border-brand-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#111] rounded-2xl py-3 px-4 outline-none border border-transparent focus:border-brand-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#111] rounded-2xl py-3 px-4 outline-none border border-transparent focus:border-brand-500 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl py-3.5 font-bold shadow-lg hover:shadow-brand-500/20 transition-all text-sm mt-4"
              >
                Initialize Audit Cycle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scan Assets Modal */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Upload className="text-brand-500" /> Scanned Assets Import
              </h3>
              <button onClick={() => setIsScanModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScanSubmit} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-xs text-slate-500 space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1 text-slate-700 dark:text-white/80">
                  <AlertCircle size={14} className="text-brand-500" /> CSV Simulation
                </p>
                <p>Paste the barcode/asset tags scanned during this inventory walk. Separate multiple tags with commas or line breaks.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Scanned Tags</label>
                <textarea
                  required
                  placeholder="e.g. AF-0001, AF-0002, AF-0003"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-100 dark:bg-[#111] rounded-2xl py-3 px-4 outline-none border border-transparent focus:border-brand-500 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl py-3.5 font-bold shadow-lg hover:shadow-brand-500/20 transition-all text-sm mt-4"
              >
                Upload & Process Scanned List
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discrepancy Report Modal */}
      {activeDiscrepancies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0c] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-rose-500" /> Discrepancy Report
              </h3>
              <button onClick={() => setActiveDiscrepancies(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center border border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-400 font-bold uppercase">Total Scope</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeDiscrepancies.totalItems}</p>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-center border border-rose-100 dark:border-rose-500/20">
                <p className="text-xs text-rose-500 font-bold uppercase">Discrepancies</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{activeDiscrepancies.discrepanciesCount}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-center border border-emerald-100 dark:border-emerald-500/20">
                <p className="text-xs text-emerald-500 font-bold uppercase">Verified Ok</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeDiscrepancies.totalItems - activeDiscrepancies.discrepanciesCount}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-4">
              {activeDiscrepancies.discrepanciesCount === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 dark:text-white">Zero Discrepancies</p>
                  <p className="text-xs text-slate-400 mt-1">All catalogued items in this scope were verified successfully.</p>
                </div>
              ) : (
                activeDiscrepancies.discrepancies.map((item: any) => (
                  <div key={item.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-white/5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.asset?.name || 'Unknown Asset'}</p>
                      <span className="text-xs font-mono text-slate-500 dark:text-white/40 mt-1 inline-block">{item.asset?.assetTag}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        item.result === 'Missing' 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {item.result}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="shrink-0 p-4 bg-rose-50 dark:bg-rose-500/5 rounded-2xl border border-rose-200/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              <span className="font-bold flex items-center gap-1 mb-1">
                <AlertTriangle size={14} /> Database Synchronized
              </span>
              Missing assets have been updated to **Lost**. Damaged assets are updated to **Under Maintenance** and pending tickets have been automatically raised.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
