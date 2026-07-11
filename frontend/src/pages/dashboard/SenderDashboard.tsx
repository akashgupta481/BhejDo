import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Plus, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ScooterCourier, Parcel as ParcelArt, Cloud, EmptyBox } from '../../components/illustrations/WarmArt';
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="warm-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Playful welcome hero */}
        <div className="hero-gradient rounded-[32px] p-8 sm:p-10 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 warm-dots opacity-25" />
          <Cloud className="cloud-drift absolute top-6 left-8 w-24 opacity-80 hidden sm:block" />
          <Cloud className="cloud-drift d-2 absolute top-16 left-52 w-16 opacity-70 hidden md:block" />
          <div className="relative flex items-center justify-between gap-6">
            <div className="max-w-lg">
              <p className="text-white/85 font-medium mb-1">👋 Namaste, {firstName}!</p>
              <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2 drop-shadow-sm">Where are we sending today?</h1>
              <p className="text-white/90 mb-6">Track your shipments and manage deliveries — all in one happy place.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shipment/create" className="btn-cream inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold">
                  <Plus className="w-5 h-5" /> Create New Shipment
                </Link>
                {/* Same account doubles as a traveler — jump to the traveler dashboard */}
                <Link to="/dashboard/traveler" className="btn-forest sweep inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold ring-2 ring-white/70">
                  <Truck className="w-5 h-5" /> Become a Traveler
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block shrink-0">
              <ScooterCourier className="w-72" />
              <div className="absolute -top-2 right-4 w-14 float-soft"><ParcelArt /></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="soft-card border-l-4 border-l-red-500 text-red-700 px-5 py-4 mb-6">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Parcels" value={stats.total} icon={Package} />
          <StatsCard title="In Transit" value={stats.inTransit} icon={Truck} trend="up" />
          <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle} trend="up" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} trend="neutral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Deliveries — journey cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Your journeys</h2>
            {parcels.length === 0 ? (
              <div className="soft-card p-10 text-center flex flex-col items-center">
                <EmptyBox className="w-44 mb-4" />
                <p className="text-slate-600 font-medium mb-1">No parcels on the road yet</p>
                <p className="text-slate-400 text-sm mb-5">Your first delivery is just a tap away.</p>
                <Link to="/shipment/create" className="btn-terra inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold">
                  <Plus className="w-4 h-4" /> Create Shipment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {parcels.slice(0, 5).map((parcel: any) => (
                  <Link key={parcel.id} to={`/parcel/${parcel.id}`} className="block soft-card p-5 group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-slate-400">{parcel.tracking_code || parcel.trackingCode}</span>
                      <StatusBadge status={parcel.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                      <span className="font-semibold text-slate-700">{parcel.pickup_city || parcel.pickupCity}</span>
                      <span className="flex-1 border-t-2 border-dashed border-primary-200 relative">
                        <ArrowRight className="w-4 h-4 text-primary-400 absolute -right-1 -top-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-700">{parcel.destination_city || parcel.receiver_city}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-3">
                      Created {new Date(parcel.created_at || parcel.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Recent activity</h2>
            {notifications.length === 0 ? (
              <div className="soft-card p-8 text-center flex flex-col items-center">
                <div className="icon-tile icon-tile-mustard w-14 h-14 flex items-center justify-center mb-3">
                  <Bell className="w-7 h-7" />
                </div>
                <p className="text-slate-500 text-sm">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="soft-card divide-y divide-[#F3E9DE] overflow-hidden">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-[#FFF6EF] transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{notif.title}</p>
                        <p className="text-slate-500 text-xs mt-1">{notif.message}</p>
                        <p className="text-slate-400 text-xs mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenderDashboard;
