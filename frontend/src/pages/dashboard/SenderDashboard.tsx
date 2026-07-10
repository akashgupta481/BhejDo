import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Plus, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Parcel, Notification } from '../../types';

const SenderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, inTransit: 0, delivered: 0, pending: 0 });
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [parcelsRes, notifRes] = await Promise.all([
          api.get('/parcels'),
          api.get('/notifications'),
        ]);
        const parcelsData = parcelsRes.data.data?.parcels || [];
        setParcels(parcelsData);
        // Compute stats from parcels data
        setStats({
          total: parcelsData.length,
          inTransit: parcelsData.filter((p: any) => p.status === 'IN_TRANSIT').length,
          delivered: parcelsData.filter((p: any) => p.status === 'DELIVERED').length,
          pending: parcelsData.filter((p: any) => ['CREATED', 'MATCHED'].includes(p.status)).length,
        });
        setNotifications(notifRes.data.data?.notifications || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="hero-gradient rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-orange-500/10 rounded-full blur-xl"></div>
        </div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-[family-name:var(--font-family-heading)]">Welcome back, {user?.name}!</h1>
          <p className="text-indigo-100">Track your shipments and manage your deliveries all in one place.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Parcels" value={stats.total} icon={Package} />
        <StatsCard title="In Transit" value={stats.inTransit} icon={Truck} trend="up" />
        <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle} trend="up" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} trend="neutral" />
      </div>

      {/* Create Shipment Button */}
      <div className="mb-8">
        <Link
          to="/shipment/create"
          className="btn-press inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create New Shipment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Deliveries */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Deliveries</h2>
          {parcels.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No parcels yet. Create your first shipment!</p>
              <Link
                to="/shipment/create"
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Create Shipment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {parcels.slice(0, 5).map((parcel: any) => (
                <Link
                  key={parcel.id}
                  to={`/parcel/${parcel.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 card-hover border-l-4 border-l-indigo-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-gray-500">{parcel.tracking_code || parcel.trackingCode}</span>
                    <StatusBadge status={parcel.status} />
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">{parcel.pickup_city || parcel.pickupCity}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{parcel.destination_city || parcel.receiver_city}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Created {new Date(parcel.created_at || parcel.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No recent notifications</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="p-4">
                  <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SenderDashboard;
