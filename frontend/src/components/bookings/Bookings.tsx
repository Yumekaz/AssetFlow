import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Filter, Plus, Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { CreateBookingModal } from './CreateBookingModal';

interface Booking {
  id: string;
  asset: { id: string; name: string; assetTag: string };
  bookedBy: { id: string; name: string };
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => 
    booking.asset.name.toLowerCase().includes(search.toLowerCase()) || 
    booking.bookedBy.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5 w-fit"><CheckCircle2 size={14} /> Approved</span>;
    if (status === 'Pending') return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 w-fit"><Clock size={14} /> Pending</span>;
    if (status === 'Rejected') return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5 w-fit"><XCircle size={14} /> Rejected</span>;
    return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70 text-xs font-bold border border-slate-200 dark:border-white/20 flex items-center gap-1.5 w-fit">{status}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-600 dark:bg-gradient-brand shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <Calendar size={24} className="text-white" />
            </div>
            Resource Bookings
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 font-medium">Manage temporary reservations for shared assets.</p>
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
            New Booking
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-white dark:bg-[#0a0a0c]">
        
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by asset or user name..." 
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
                <th className="px-6 py-4">Booked By</th>
                <th className="px-6 py-4">Duration</th>
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
                      <p className="text-slate-400 dark:text-white/40 font-medium">Loading bookings...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-white/40 font-medium">
                    No bookings found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{booking.asset.name}</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-white/40 mt-1">{booking.asset.assetTag}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-white/80">
                      {booking.bookedBy.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-white/60">
                        <div className="flex items-center gap-1.5"><Clock size={14} className="text-brand-500" /> {formatDate(booking.startTime)}</div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 flex justify-center text-slate-300 dark:text-white/20">↳</div> 
                          <span className={new Date(booking.endTime) < new Date() && booking.status === 'Approved' ? 'text-red-500 font-bold' : ''}>
                            {formatDate(booking.endTime)}
                            {new Date(booking.endTime) < new Date() && booking.status === 'Approved' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
      
      <CreateBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBookings} 
      />

    </div>
  );
};
