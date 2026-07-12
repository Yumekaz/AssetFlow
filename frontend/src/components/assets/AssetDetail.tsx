import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, User, Calendar, AlertTriangle, ArrowLeft, RefreshCw, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Allocation {
  id: string;
  employee?: { name: string } | null;
  department?: { name: string } | null;
  allocatedAt: string;
  expectedReturnDate: string | null;
  returnedAt: string | null;
  status: string;
  conditionNotesOnReturn: string | null;
}

interface MaintenanceRequest {
  id: string;
  issueDescription: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: { name: string };
  serialNumber: string | null;
  acquisitionDate: string;
  acquisitionCost: number | null;
  condition: string;
  location: string | null;
  status: string;
  isBookable: boolean;
  currentHolder?: { name: string } | null;
  currentDepartment?: { name: string } | null;
  allocations: Allocation[];
  maintenanceRequests: MaintenanceRequest[];
}

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [allocationError, setAllocationError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
      if (res.data.length > 0) {
        setSelectedEmployeeId(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      setAllocationLoading(true);
      setAllocationError('');
      await axios.post('/api/allocations', {
        assetId: asset?.id,
        employeeId: selectedEmployeeId,
      });
      setShowAllocateModal(false);
      fetchAssetDetails();
    } catch (err: any) {
      console.error('Error allocating asset:', err);
      setAllocationError(err.response?.data?.error || 'Failed to allocate asset.');
    } finally {
      setAllocationLoading(false);
    }
  };

  const handleReturn = async () => {
    const activeAlloc = asset?.allocations.find((a) => a.status === 'Active');
    if (!activeAlloc) return;

    try {
      setAllocationLoading(true);
      await axios.post(`/api/allocations/${activeAlloc.id}/return`);
      fetchAssetDetails();
    } catch (err: any) {
      console.error('Error returning asset:', err);
      alert(err.response?.data?.error || 'Failed to process return.');
    } finally {
      setAllocationLoading(false);
    }
  };

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/assets/${id}`);
      setAsset(res.data);
    } catch (err: any) {
      console.error('Error fetching asset details:', err);
      setError(err.response?.data?.error || 'Failed to retrieve asset details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-brand-500" size={32} />
          <p className="text-slate-400 dark:text-white/40 font-medium">Loading asset specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-10 max-w-2xl mx-auto">
        <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl text-center">
          <AlertTriangle className="text-rose-500 mx-auto mb-4" size={40} />
          <p className="text-rose-700 dark:text-rose-300 font-bold mb-4">{error || 'Asset not found'}</p>
          <button onClick={() => navigate('/assets')} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold">
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      Available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400',
      Allocated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400',
      Reserved: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
      'Under Maintenance': 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400',
      'In Maintenance': 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400',
      Lost: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-white/40',
      Retired: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-white/40',
    }[status] || 'bg-slate-100 text-slate-800';

    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${classes}`}>{status}</span>;
  };

  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <Link to="/assets" className="flex items-center gap-2 text-slate-500 hover:text-brand-500 font-bold transition-colors">
          <ArrowLeft size={20} />
          Back to Directory
        </Link>
        <div className="text-sm font-mono text-slate-400">
          ID: {asset.id}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Specifications Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">{asset.category.name}</span>
                <h2 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{asset.name}</h2>
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-2xl">
                <Box size={24} />
              </div>
            </div>

            <div className="space-y-4 text-sm border-t border-slate-100 dark:border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Asset Tag</span>
                <span className="font-mono font-bold">{asset.assetTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serial Number</span>
                <span className="font-semibold text-slate-800 dark:text-white/80">{asset.serialNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                {getStatusBadge(asset.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condition</span>
                <span className="font-semibold text-slate-800 dark:text-white/80">{asset.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type</span>
                <span className="font-semibold text-slate-800 dark:text-white/80">{asset.isBookable ? 'Shared (Bookable)' : 'Assigned (Allocated)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold text-slate-800 dark:text-white/80">{asset.location || 'Not Specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition Date</span>
                <span className="font-semibold text-slate-800 dark:text-white/80">{new Date(asset.acquisitionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Current Assignment / Custody status */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User size={18} className="text-brand-500" /> Current Custody
            </h3>
            {asset.currentHolder ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                  {asset.currentHolder.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{asset.currentHolder.name}</p>
                  <p className="text-xs text-slate-400">Holder</p>
                </div>
              </div>
            ) : asset.currentDepartment ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center font-bold">
                  D
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{asset.currentDepartment.name}</p>
                  <p className="text-xs text-slate-400">Assigned Department</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No current active allocation or custody.</p>
            )}

            {/* Direct Allocation Controls for Admin/Asset Manager */}
            {(user?.role === 'Admin' || user?.role === 'Asset Manager') && !asset.isBookable && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                {asset.status === 'Available' && (
                  <button
                    onClick={() => {
                      setShowAllocateModal(true);
                      fetchEmployees();
                    }}
                    className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 text-sm cursor-pointer"
                  >
                    Allocate Asset
                  </button>
                )}
                {asset.status === 'Allocated' && (
                  <button
                    onClick={handleReturn}
                    disabled={allocationLoading}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {allocationLoading ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      'Mark as Returned'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Allocations History */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-brand-500" /> Custody & Allocation History
            </h3>
            
            <div className="relative border-l border-slate-200 dark:border-white/5 pl-6 ml-3 space-y-6">
              {asset.allocations.length === 0 ? (
                <p className="text-sm text-slate-400 italic ml-[-6px]">No allocation history found for this asset.</p>
              ) : (
                asset.allocations.map((alloc) => (
                  <div key={alloc.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute left-[-31px] top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-[#050505] ${
                      alloc.returnedAt ? 'border-slate-300 dark:border-white/20' : 'border-brand-500'
                    }`}></div>
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {alloc.employee?.name || alloc.department?.name || 'Unknown Holder'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(alloc.allocatedAt).toLocaleDateString()}
                          {alloc.returnedAt && ` – ${new Date(alloc.returnedAt).toLocaleDateString()}`}
                        </p>
                        {alloc.conditionNotesOnReturn && (
                          <p className="text-xs bg-slate-100 dark:bg-white/5 px-2 py-1 rounded mt-2 text-slate-500">
                            Notes on return: {alloc.conditionNotesOnReturn}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider self-start ${
                        alloc.status === 'Active' 
                          ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/30'
                      }`}>
                        {alloc.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings size={20} className="text-brand-500" /> Maintenance & Repair History
            </h3>

            <div className="relative border-l border-slate-200 dark:border-white/5 pl-6 ml-3 space-y-6">
              {asset.maintenanceRequests.length === 0 ? (
                <p className="text-sm text-slate-400 italic ml-[-6px]">No maintenance history found for this asset.</p>
              ) : (
                asset.maintenanceRequests.map((req) => (
                  <div key={req.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute left-[-31px] top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-[#050505] ${
                      req.status === 'Resolved' ? 'border-emerald-500' : 'border-rose-500'
                    }`}></div>

                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {req.issueDescription}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Calendar size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                          {req.resolvedAt && ` – Resolved: ${new Date(req.resolvedAt).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs mt-1">
                          Priority: <span className="font-semibold text-rose-500">{req.priority}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider self-start ${
                        req.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Allocate Asset</h3>
            <form onSubmit={handleAllocate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-white/40 mb-2">Select Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              {allocationError && (
                <p className="text-xs text-rose-500 font-bold">{allocationError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl font-bold transition-all text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocationLoading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 text-sm flex items-center gap-2 cursor-pointer"
                >
                  {allocationLoading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    'Confirm Allocation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
