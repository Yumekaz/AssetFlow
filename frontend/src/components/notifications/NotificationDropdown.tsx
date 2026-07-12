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
    // Attempt to fetch real notifications. Fall back to mock if API fails.
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer MOCK_TOKEN` }
        });
        
        if (!Array.isArray(res.data)) {
          throw new Error('Invalid API response');
        }
        
        setNotifications(res.data);
      } catch (error) {
        console.warn('API unavailable, falling back to mock notifications');
        setNotifications(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer MOCK_TOKEN` }
      });
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('Alert') || type.includes('Rejected')) return <AlertCircle size={16} className="text-red-500" />;
    if (type.includes('Assigned') || type.includes('Confirmed')) return <Check size={16} className="text-green-500" />;
    return <Info size={16} className="text-brand-500" />;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative focus:outline-none"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 overflow-hidden transform origin-top-right transition-all">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <span className="text-xs font-medium bg-brand-100 text-brand-600 px-2 py-1 rounded-full">
                {unreadCount} New
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No notifications yet.</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors ${
                      notif.isRead ? 'opacity-60 bg-white hover:bg-slate-50' : 'bg-brand-50/50 hover:bg-brand-50'
                    }`}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div>
                      <p className={`text-sm ${notif.isRead ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
