import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'Asset Assigned',
    message: 'A new MacBook Pro 16" has been assigned to you.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'Booking Confirmed',
    message: 'Your booking for the Main Conference Room is confirmed for tomorrow.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    type: 'Overdue Alert',
    message: 'The projector you checked out is currently overdue.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications');
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    const eventSource = new EventSource('/api/notifications/events');
    eventSource.onmessage = (event) => {
      console.log('Live notification event received:', event.data);
      fetchNotifications();
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await axios.put(`/api/notifications/${id}/read`);
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('Alert') || type.includes('Rejected')) {
      return (
        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
          <AlertCircle size={16} />
        </div>
      );
    }
    if (type.includes('Assigned') || type.includes('Confirmed')) {
      return (
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <Check size={16} />
        </div>
      );
    }
    return (
      <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">
        <Info size={16} />
      </div>
    );
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative focus:outline-none border border-transparent hover:border-slate-200 dark:hover:border-white/10"
      >
        <Bell size={20} className="text-slate-500 dark:text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#111] shadow-sm dark:shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-[#0f0f11] glass-panel rounded-3xl z-40 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 shadow-xl dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10">
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
              <h3 className="font-bold text-slate-800 dark:text-white tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2.5 py-1 rounded-full shadow-sm dark:shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400 dark:text-white/40">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-slate-300 dark:text-white/20" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-white/40 font-medium">You're all caught up.</p>
                </div>
              ) : (
                <div className="flex flex-col p-2 gap-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      className={`p-4 rounded-2xl flex gap-4 cursor-pointer transition-all duration-300 border border-transparent ${
                        notif.isRead 
                          ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-white/5' 
                          : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 shadow-sm dark:shadow-lg hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.isRead ? 'text-slate-500 dark:text-white/60' : 'text-slate-800 dark:text-white font-medium drop-shadow-sm dark:drop-shadow-md'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-white/30 mt-1.5 font-medium tracking-wide">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="flex-shrink-0 self-center">
                          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] dark:shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-center">
                <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors py-2">
                  View All Activity
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
