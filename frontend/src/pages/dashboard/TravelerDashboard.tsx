import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, MapPin, ArrowRight, Wallet, Filter, Package, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ScooterCourier, Cloud, Parcel as ParcelArt, EmptyBox } from '../../components/illustrations/WarmArt';

interface AvailableJob {
  id: string;
  pickupCity: string;
  destinationCity: string;
  weight: number;
  description: string;
  estimatedPrice: number;
  senderName: string;
  trackingCode: string;
}

interface ActiveDelivery {
  id: string;
  parcelId: string;
  trackingCode: string;
  pickupCity: string;
  destinationCity: string;
  senderName: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  weight: number;
  description: string;
  estimatedPrice: number;
  status: string;
  agentHanded: number;
  travelerReceived: number;
  agentHandedAt: string | null;
}

const TravelerDashboard = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({ totalEarned: 0, monthlyEarned: 0, pendingAmount: 0 });
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [reachingId, setReachingId] = useState<string | null>(null);
  const [confirmingReceivedId, setConfirmingReceivedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityParam = user?.city ? `?city=${encodeURIComponent(user.city)}` : '';
      const [walletRes, availableParcelsRes, assignmentsRes] = await Promise.all([
        api.get('/wallet/earnings'),
        api.get(`/parcels/available${cityParam}`),
        api.get('/assignments'),
      ]);

      const earningsData = walletRes.data.data || {};
      setEarnings({
        totalEarned: earningsData.total_earnings || 0,
        monthlyEarned: earningsData.this_month || 0,
        pendingAmount: earningsData.balance || 0,
      });

      // Available parcels (CREATED status)
      const availableParcels = availableParcelsRes.data.data?.parcels || [];
      const parcelJobs: AvailableJob[] = availableParcels.map((p: any) => ({
        id: p.id,
        pickupCity: p.pickup_city || '',
        destinationCity: p.destination_city || '',
        weight: p.weight || 0,
        description: p.description || '',
        estimatedPrice: p.estimated_price || 0,
        senderName: p.sender_name || '',
        trackingCode: p.tracking_code || '',
      }));
      setAvailableJobs(parcelJobs);

      // My active deliveries (assignments where I'm the traveler, not DELIVERED)
      const allAssignments = assignmentsRes.data.data?.assignments || [];
      const active: ActiveDelivery[] = allAssignments
        .filter((a: any) => ['MATCHED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED'].includes(a.status))
        .map((a: any) => ({
          id: a.id,
          parcelId: a.parcel_id,
          trackingCode: a.tracking_code || '',
          pickupCity: a.pickup_city || '',
          destinationCity: a.destination_city || '',
          senderName: a.sender_name || '',
          receiverName: a.receiver_name || '',
          receiverAddress: a.receiver_address || '',
          receiverCity: a.receiver_city || '',
          weight: a.weight || 0,
          description: a.description || '',
          estimatedPrice: a.estimated_price || 0,
          status: a.status,
          agentHanded: a.agent_handed || 0,
          travelerReceived: a.traveler_received || 0,
          agentHandedAt: a.agent_handed_at || null,
        }));
      setActiveDeliveries(active);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (parcelId: string) => {
    try {
      setAcceptingId(parcelId);
      setError('');
      await api.post(`/parcels/${parcelId}/accept`);
      setSuccessMessage('Job accepted! Agent will be notified for pickup.');
      setAvailableJobs((prev) => prev.filter((j) => j.id !== parcelId));
      // Refresh active deliveries
      const assignmentsRes = await api.get('/assignments');
      const allAssignments = assignmentsRes.data.data?.assignments || [];
      const active: ActiveDelivery[] = allAssignments
        .filter((a: any) => ['MATCHED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED'].includes(a.status))
        .map((a: any) => ({
          id: a.id,
          parcelId: a.parcel_id,
          trackingCode: a.tracking_code || '',
          pickupCity: a.pickup_city || '',
          destinationCity: a.destination_city || '',
          senderName: a.sender_name || '',
          receiverName: a.receiver_name || '',
          receiverAddress: a.receiver_address || '',
          receiverCity: a.receiver_city || '',
          weight: a.weight || 0,
          description: a.description || '',
          estimatedPrice: a.estimated_price || 0,
          status: a.status,
          agentHanded: a.agent_handed || 0,
          travelerReceived: a.traveler_received || 0,
          agentHandedAt: a.agent_handed_at || null,
        }));
      setActiveDeliveries(active);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept job');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReached = async (assignmentId: string) => {
    try {
      setReachingId(assignmentId);
      setError('');
      await api.patch(`/assignments/${assignmentId}/reached`);
      setSuccessMessage('Marked as reached! Destination agent has been notified for final delivery.');
      setActiveDeliveries((prev) =>
        prev.map((d) => (d.id === assignmentId ? { ...d, status: 'REACHED' } : d))
      );
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as reached');
    } finally {
      setReachingId(null);
    }
  };

  const handleConfirmReceived = async (assignmentId: string) => {
    try {
      setConfirmingReceivedId(assignmentId);
      setError('');
      await api.patch(`/assignments/${assignmentId}/confirm-received`);
      setSuccessMessage('Receipt confirmed! Parcel is now in transit.');
      setActiveDeliveries((prev) =>
        prev.map((d) => (d.id === assignmentId ? { ...d, travelerReceived: 1, status: d.agentHanded ? 'IN_TRANSIT' : d.status } : d))
      );
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm receipt');
    } finally {
      setConfirmingReceivedId(null);
    }
  };

  const filteredJobs = availableJobs.filter((job) => {
    if (cityFilter && !job.destinationCity.toLowerCase().includes(cityFilter.toLowerCase()) && !job.pickupCity.toLowerCase().includes(cityFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="warm-canvas min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Playful welcome hero */}
      <div className="hero-gradient rounded-[32px] p-8 sm:p-10 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 warm-dots opacity-25" />
        <Cloud className="cloud-drift absolute top-6 left-10 w-20 opacity-80 hidden sm:block" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-white/85 font-medium mb-1">✈️ Ready to roll, {user?.name?.split(' ')[0]}?</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2 drop-shadow-sm">Earn on the routes you already travel</h1>
            <p className="text-white/90 max-w-lg">Browse jobs heading your way and manage your active deliveries.</p>
          </div>
          <div className="relative hidden lg:block shrink-0">
            <ScooterCourier className="w-64" />
            <div className="absolute -top-2 right-2 w-12 float-soft"><ParcelArt /></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Handoff Reminder Banner */}
      {activeDeliveries.some((d) => d.status === 'PICKED_UP' && d.agentHanded === 1 && !d.travelerReceived) && (
        <div className="bg-orange-50 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <Package className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">You have a parcel waiting for your confirmation!</p>
            <p className="text-sm text-orange-700">Please scroll to your active deliveries and click "I Have Received the Parcel" to proceed.</p>
          </div>
        </div>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white card-hover shadow-md shadow-emerald-200/40 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-emerald-100 text-sm">Total Earned</span>
            </div>
            <p className="text-3xl font-bold font-[family-name:var(--font-family-heading)]">&#8377;{earnings.totalEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white card-hover shadow-md shadow-indigo-200/40 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-indigo-100 text-sm">This Month</span>
            </div>
            <p className="text-3xl font-bold font-[family-name:var(--font-family-heading)]">&#8377;{earnings.monthlyEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white card-hover shadow-md shadow-orange-200/40 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              <span className="text-orange-100 text-sm">Pending</span>
            </div>
            <p className="text-3xl font-bold font-[family-name:var(--font-family-heading)]">&#8377;{earnings.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* My Active Deliveries */}
      {activeDeliveries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            My Active Deliveries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{delivery.trackingCode}</span>
                  <StatusBadge status={delivery.status} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-slate-900">{delivery.pickupCity}</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-slate-900">{delivery.destinationCity}</span>
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Sender:</span> {delivery.senderName}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Receiver:</span> {delivery.receiverName}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Deliver to:</span> {delivery.receiverAddress}, {delivery.receiverCity}
                  </p>
                  {delivery.weight > 0 && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Weight:</span> {delivery.weight} kg
                    </p>
                  )}
                  {delivery.estimatedPrice > 0 && (
                    <p className="text-sm font-semibold text-emerald-600">Earn: &#8377;{Math.round(delivery.estimatedPrice * 0.7)}</p>
                  )}
                </div>

                {/* Handoff UI for PICKED_UP status */}
                {delivery.status === 'PICKED_UP' && delivery.agentHanded === 1 && !delivery.travelerReceived && (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 font-medium flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      Agent has picked up and is ready to hand you the parcel
                    </div>
                    <button
                      onClick={() => handleConfirmReceived(delivery.id)}
                      disabled={confirmingReceivedId === delivery.id}
                      className="btn-press w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200/50 flex items-center justify-center gap-2 text-base"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {confirmingReceivedId === delivery.id ? 'Confirming...' : 'I Have Received the Parcel'}
                    </button>
                  </div>
                )}

                {delivery.status === 'PICKED_UP' && !delivery.agentHanded && (
                  <div className="bg-blue-50 rounded-lg px-4 py-2.5 text-sm text-blue-700 font-medium text-center">
                    Waiting for agent to pick up from sender...
                  </div>
                )}

                {delivery.status === 'PICKED_UP' && delivery.agentHanded === 1 && delivery.travelerReceived === 1 && (
                  <div className="bg-emerald-50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Both confirmed — moving to In Transit
                  </div>
                )}

                {/* Reached button - only show when parcel is with traveler (IN_TRANSIT) */}
                {delivery.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleReached(delivery.id)}
                    disabled={reachingId === delivery.id}
                    className="btn-press w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200/50 flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    {reachingId === delivery.id ? 'Updating...' : "I've Reached Destination"}
                  </button>
                )}

                {['MATCHED', 'ACCEPTED'].includes(delivery.status) && (
                  <div className="bg-blue-50 rounded-lg px-4 py-2.5 text-sm text-blue-700 font-medium text-center">
                    Waiting for agent to pick up from sender
                  </div>
                )}

                {delivery.status === 'REACHED' && (
                  <div className="bg-emerald-50 rounded-lg px-4 py-2.5 text-sm text-emerald-700 font-medium text-center">
                    Destination agent notified — awaiting final delivery
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Available Jobs
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="soft-card p-10 text-center flex flex-col items-center">
            <EmptyBox className="w-40 mb-4" />
            <p className="text-slate-600 font-medium">No jobs on your route right now</p>
            <p className="text-slate-400 text-sm mt-1">New parcels appear here the moment they're posted — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-5 card-hover border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-slate-900">{job.pickupCity}</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-slate-900">{job.destinationCity}</span>
                </div>
                <div className="space-y-2 mb-4">
                  {job.senderName && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Sender:</span> {job.senderName}
                    </p>
                  )}
                  {job.weight > 0 && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Weight:</span> {job.weight} kg
                    </p>
                  )}
                  {job.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      <span className="font-medium">Description:</span> {job.description}
                    </p>
                  )}
                  {job.estimatedPrice > 0 && (
                    <p className="text-lg font-bold text-emerald-600 font-[family-name:var(--font-family-heading)]">
                      Earn &#8377;{Math.round(job.estimatedPrice * 0.7)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={acceptingId === job.id}
                  className="btn-press w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {acceptingId === job.id ? 'Accepting...' : 'Accept Job'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Quick View */}
      <div className="hero-gradient rounded-[28px] p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 warm-dots opacity-20" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Wallet Balance</p>
            <p className="text-3xl font-bold font-display mt-1">&#8377;{(user?.wallet_balance ?? user?.walletBalance ?? 0).toLocaleString()}</p>
          </div>
          <Link
            to="/wallet"
            className="btn-cream flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            <Wallet className="w-4 h-4" />
            View Wallet
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TravelerDashboard;
