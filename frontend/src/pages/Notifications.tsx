import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Notification } from '../types';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await api.get('/notifications');
        setNotifications(res.data.data?.notifications || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: 1 } : n))
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
    } catch {
      // silently fail
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="warm-canvas min-h-screen">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="icon-tile icon-tile-mustard w-12 h-12 flex items-center justify-center">
            <Bell className="w-6 h-6 animate-bounce-subtle" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-cream flex items-center gap-2 text-sm px-4 py-2 rounded-full font-semibold"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="soft-card border-l-4 border-l-red-500 text-red-700 px-5 py-4 mb-6">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="soft-card p-12 text-center flex flex-col items-center">
          <div className="icon-tile icon-tile-mustard w-16 h-16 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <p className="text-slate-600 font-medium">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1">We'll ping you the moment something happens. 🔔</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`soft-card p-4 ${notification.read ? '' : 'ring-2 ring-primary-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notification.read ? 'bg-slate-200' : 'bg-primary-500'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                    <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notification.created_at || notification.createdAt || '').toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="flex-shrink-0 text-primary-600 hover:text-primary-800 p-1"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Notifications;
