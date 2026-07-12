import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, Plus, Box, Laptop, Video, Briefcase, Activity } from 'lucide-react';
import { CreateAssetModal } from './CreateAssetModal';

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  condition: string;
  status: string;
  location: string;
  category: { id: string; name: string };
  currentHolder?: { id: string; name: string };
}

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openCreate') === 'true') {
      setIsModalOpen(true);
    }
  }, [location.search]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(search.toLowerCase()) || 
    asset.assetTag.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'laptop': return <Laptop size={16} />;
      case 'projector': return <Video size={16} />;
      default: return <Briefcase size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Available') return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">Available</span>;
    if (status === 'Allocated') return <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 text-xs font-bold border border-brand-200 dark:border-brand-500/30">Allocated</span>;
    return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-500/30">{status}</span>;
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-gradient-brand shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <Box size={24} className="text-white" />
            </div>
            Asset Registry
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Manage and track all company hardware resources.</p>
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
            New Asset
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0c]">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or asset tag..." 
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
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Location / Holder</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="animate-spin text-brand-500" size={32} />
                      <p className="text-slate-400 dark:text-white/40 font-medium">Loading assets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-white/40 font-medium">
                    No assets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{asset.name}</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-white/40 mt-1">{asset.assetTag}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/70 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit font-medium">
                        {getCategoryIcon(asset.category.name)}
                        {asset.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-white/80">
                          {asset.currentHolder ? asset.currentHolder.name : asset.location}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-white/40 mt-0.5">
                          {asset.currentHolder ? 'Assigned' : 'Storage'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/assets/${asset.id}`} className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors inline-block">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredAssets.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between text-sm text-slate-500 dark:text-white/50 font-medium">
            <span>Showing {filteredAssets.length} assets</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 rounded border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

      </div>

      <CreateAssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAssets} 
      />

    </div>
  );
};
