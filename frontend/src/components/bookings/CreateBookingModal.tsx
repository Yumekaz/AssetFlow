import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, Loader2 } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  assetTag: string;
}

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/assets')
        .then(res => {
          if (Array.isArray(res.data)) {
            setAssets(res.data.filter((a: any) => a.isBookable));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/bookings', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reserve Asset</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="create-booking-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-white/80">Select Asset *</label>
              <select 
                required
                value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              >
                <option value="">Select Asset...</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-white/80">Start Time *</label>
              <input 
                required type="datetime-local"
                value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-white/80">End Time *</label>
              <input 
                required type="datetime-local"
                value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" form="create-booking-form" disabled={loading} className="flex items-center gap-2 bg-gradient-brand text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Submitting...' : 'Confirm Booking'}
          </button>
        </div>

      </div>
    </div>
  );
};
