import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Calendar as CalendarIcon, Search, Plus, Activity, Clock, CheckCircle2, XCircle, Check, X, Edit, Trash2, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { CreateBookingModal } from './CreateBookingModal';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openCreate') === 'true') {
      setIsModalOpen(true);
    }
  }, [location.search]);

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/bookings/${id}/approve`);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/bookings/${id}/reject`);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(id);
    try {
      await axios.put(`/api/bookings/${id}/cancel`);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleSubmit = async (id: string) => {
    if (!rescheduleStart || !rescheduleEnd) return;
    setActionLoading(id);
    try {
      await axios.put(`/api/bookings/${id}/reschedule`, {
        startTime: rescheduleStart,
        endTime: rescheduleEnd,
      });
      setReschedulingId(null);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reschedule booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const startRescheduling = (booking: Booking) => {
    setReschedulingId(booking.id);
    const startIso = new Date(booking.startTime).toISOString().slice(0, 16);
    const endIso = new Date(booking.endTime).toISOString().slice(0, 16);
    setRescheduleStart(startIso);
    setRescheduleEnd(endIso);
  };

  const filteredBookings = bookings.filter(booking => 
    booking.asset.name.toLowerCase().includes(search.toLowerCase()) || 
    booking.bookedBy.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5 w-fit"><CheckCircle2 size={14} /> Approved</span>;
    if (status === 'Pending') return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 w-fit"><Clock size={14} /> Pending</span>;
    if (status === 'Rejected') return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5 w-fit"><XCircle size={14} /> Rejected</span>;
    if (status === 'Cancelled') return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-1.5 w-fit"><X size={14} /> Cancelled</span>;
    return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/77 text-xs font-bold border border-slate-200 dark:border-white/20 flex items-center gap-1.5 w-fit">{status}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const isApprover = user?.role === 'Admin' || user?.role === 'Department Head';

  // Calendar helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      
      // Check if day falls within booking duration
      const checkDate = new Date(day);
      checkDate.setHours(0, 0, 0, 0);
      
      const startCompare = new Date(bStart);
      startCompare.setHours(0, 0, 0, 0);
      
      const endCompare = new Date(bEnd);
      endCompare.setHours(0, 0, 0, 0);
      
      return checkDate >= startCompare && checkDate <= endCompare && b.status !== 'Cancelled';
    });
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 dark:bg-gradient-brand flex items-center justify-center shadow-lg">
              <CalendarIcon size={20} className="text-white" />
            </div>
            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600 dark:from-brand-400 dark:to-accent-500">Bookings</span>
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-1">Calendar reservations and time-slot scheduling.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 p-0.5 bg-slate-100 dark:bg-white/5">
            <button 
              onClick={() => setView('list')}
              className={`p-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                view === 'list' 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-white/40'
              }`}
            >
              <List size={14} />
              List
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`p-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                view === 'calendar' 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-white/40'
              }`}
            >
              <CalendarIcon size={14} />
              Calendar
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-brand-500/25 text-sm"
          >
            <Plus size={18} />
            New Reservation
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <>
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={20} />
            <input
              type="text"
              placeholder="Search by asset or booker name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-transparent">
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
                          {reschedulingId === booking.id ? (
                            <div className="flex flex-col gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded-2xl">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-500">Start Time</span>
                                <input
                                  type="datetime-local"
                                  value={rescheduleStart}
                                  onChange={e => setRescheduleStart(e.target.value)}
                                  className="bg-white dark:bg-[#111] text-xs p-1.5 rounded-lg border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-500">End Time</span>
                                <input
                                  type="datetime-local"
                                  value={rescheduleEnd}
                                  onChange={e => setRescheduleEnd(e.target.value)}
                                  className="bg-white dark:bg-[#111] text-xs p-1.5 rounded-lg border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white"
                                />
                              </div>
                              <div className="flex gap-2 justify-end mt-1">
                                <button
                                  onClick={() => setReschedulingId(null)}
                                  className="p-1 text-slate-500 hover:text-rose-500"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={() => handleRescheduleSubmit(booking.id)}
                                  className="p-1 text-brand-500 hover:text-brand-600"
                                  title="Save Changes"
                                  disabled={actionLoading === booking.id}
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {reschedulingId !== booking.id && (
                            <div className="flex items-center justify-end gap-2.5">
                              {booking.status === 'Pending' && isApprover && (
                                <>
                                  <button
                                    onClick={() => handleApprove(booking.id)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-100 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(booking.id)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {(booking.status === 'Pending' || booking.status === 'Approved') && (booking.bookedBy.id === user?.id || user?.role === 'Admin') && (
                                <>
                                  <button
                                    onClick={() => startRescheduling(booking)}
                                    disabled={actionLoading !== null}
                                    className="p-2 text-slate-500 hover:text-brand-500 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    title="Reschedule"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={actionLoading !== null}
                                    className="p-2 text-slate-500 hover:text-rose-500 dark:text-white/40 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Cancel Reservation"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Premium Interactive Calendar View */
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-transparent animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors text-slate-600 dark:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors text-slate-600 dark:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-4">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2 auto-rows-[120px]">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="bg-slate-50/30 dark:bg-transparent rounded-2xl border border-dashed border-slate-100 dark:border-white/5"></div>;
              
              const dayBookings = getBookingsForDay(day);
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div 
                  key={day.toISOString()} 
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between overflow-hidden group hover:border-brand-500/50 transition-all ${
                    isToday 
                      ? 'border-brand-500 bg-brand-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)]' 
                      : 'border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent'
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-white/40'}`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar space-y-1.5">
                    {dayBookings.slice(0, 3).map(b => (
                      <div 
                        key={b.id} 
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate ${
                          b.status === 'Approved' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                        title={`${b.asset.name} - ${b.bookedBy.name}`}
                      >
                        {b.asset.name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[9px] font-bold text-slate-400 dark:text-white/30 text-center">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <CreateBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBookings} 
      />

    </div>
  );
};
