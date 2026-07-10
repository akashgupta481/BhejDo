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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">
          Notifications
        </h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                notification.read ? 'border-gray-100' : 'border-indigo-200 bg-indigo-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                  <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notification.created_at || notification.createdAt || '').toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 p-1"
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
  );
};

export default Notifications;
