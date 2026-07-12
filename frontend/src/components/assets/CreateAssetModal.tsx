import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Box, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'New',
    location: '',
  });

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/categories').then(res => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/assets', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
              <Box size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register New Asset</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="create-asset-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Asset Name *</label>
                <input 
                  required type="text" placeholder="e.g. MacBook Pro M3"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Category *</label>
                <select 
                  required
                  value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Serial Number</label>
                <input 
                  type="text" placeholder="e.g. C02X123456"
                  value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Acquisition Date *</label>
                <input 
                  required type="date"
                  value={formData.acquisitionDate} onChange={e => setFormData({...formData, acquisitionDate: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Cost ($)</label>
                <input 
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={formData.acquisitionCost} onChange={e => setFormData({...formData, acquisitionCost: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Condition *</label>
                <select 
                  required
                  value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-white/80">Storage Location</label>
                <input 
                  type="text" placeholder="e.g. IT Server Room A"
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" form="create-asset-form" disabled={loading} className="flex items-center gap-2 bg-gradient-brand text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Creating...' : 'Create Asset'}
          </button>
        </div>

      </div>
    </div>
  );
};
