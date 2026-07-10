import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, Truck, AlertCircle, MapPin, ArrowRight, User, Hand } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AssignmentCard {
  id: string;
  trackingCode: string;
  description: string;
  weight: number;
  pickupCity: string;
  destinationCity: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  status: string;
  createdAt: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  travelerName: string;
  travelerPhone: string;
  travelerAddress: string;
  travelerCity: string;
  agentId: string | null;
  destinationAgentId: string | null;
  agentHanded: number;
  travelerReceived: number;
  agentHandedAt: string | null;
}

const AgentDashboard = () => {
  const { user } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<AssignmentCard[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<AssignmentCard[]>([]);
  const [availableInCity, setAvailableInCity] = useState<AssignmentCard[]>([]);
  const [completedJobs, setCompletedJobs] = useState<AssignmentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments');
      const data = response.data.data || response.data;
      const allAssignments = data.assignments || [];

      const mapAssignment = (a: any): AssignmentCard => ({
        id: a.id,
        trackingCode: a.tracking_code || '',
        description: a.description || '',
        weight: a.weight || 0,
        pickupCity: a.pickup_city || '',
        destinationCity: a.destination_city || '',
        receiverName: a.receiver_name || '',
        receiverPhone: a.receiver_phone || '',
        receiverAddress: a.receiver_address || '',
        receiverCity: a.receiver_city || a.destination_city || '',
        status: a.status,
        createdAt: a.created_at || '',
        senderName: a.sender_name || '',
        senderPhone: a.sender_phone || '',
        senderAddress: a.sender_address || '',
        travelerName: a.traveler_name || '',
        travelerPhone: a.traveler_phone || '',
        travelerAddress: a.traveler_address || '',
        travelerCity: a.traveler_city || '',
        agentId: a.agent_id || null,
        destinationAgentId: a.destination_agent_id || null,
        agentHanded: a.agent_handed || 0,
        travelerReceived: a.traveler_received || 0,
        agentHandedAt: a.agent_handed_at || null,
      });

      // Pending pickups: I'm the pickup agent (agent_id) and status is MATCHED/ACCEPTED/PICKED_UP (need to pickup from sender and hand to traveler)
      const pickups = allAssignments
        .filter((a: any) => a.agent_id === user?.id && ['MATCHED', 'ACCEPTED', 'PICKED_UP'].includes(a.status))
        .map(mapAssignment);

      // Pending deliveries: I'm the destination agent (destination_agent_id) and traveler has REACHED (need to pickup from traveler and deliver to receiver)
      const deliveries = allAssignments
        .filter((a: any) => a.destination_agent_id === user?.id && a.status === 'REACHED')
        .map(mapAssignment);

      // Available in my city: orders where agent_id is null (pickup) or destination_agent_id is null (delivery at REACHED)
      // These are orders that match my city but haven't been claimed yet
      const available = allAssignments
        .filter((a: any) => {
          const isUnclaimedPickup = !a.agent_id && ['MATCHED', 'ACCEPTED', 'PICKED_UP'].includes(a.status);
          const isUnclaimedDelivery = !a.destination_agent_id && a.status === 'REACHED';
          return isUnclaimedPickup || isUnclaimedDelivery;
        })
        .map(mapAssignment);

      // Completed: DELIVERED where I was involved
      const completed = allAssignments
        .filter((a: any) => a.status === 'DELIVERED')
        .map(mapAssignment);

      setPendingPickups(pickups);
      setPendingDeliveries(deliveries);
      setAvailableInCity(available);
      setCompletedJobs(completed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAssignment = async (assignmentId: string) => {
    try {
      setClaimingId(assignmentId);
      setError('');
      await api.patch(`/assignments/${assignmentId}/claim`);
      setSuccessMessage('Assignment claimed successfully!');
      // Refresh data to move the item to the correct section
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim assignment.');
    } finally {
      setClaimingId(null);
    }
  };

  const handleConfirmPickup = async (assignmentId: string) => {
    try {
      setProcessingId(assignmentId);
      setError('');
      await api.patch(`/assignments/${assignmentId}/pickup`);
      setSuccessMessage('Pickup confirmed! Parcel collected from sender.');
      // Update local state
      setPendingPickups((prev) =>
        prev.map((p) => (p.id === assignmentId ? { ...p, status: 'PICKED_UP' } : p))
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm pickup.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTransferToTraveler = async (assignmentId: string) => {
    try {
      setProcessingId(assignmentId);
      setError('');
      const res = await api.patch(`/assignments/${assignmentId}/hand-to-traveler`);
      const data = res.data.data;
      if (data.status === 'IN_TRANSIT') {
        setSuccessMessage('Both parties confirmed! Parcel is now in transit.');
        setPendingPickups((prev) => prev.filter((p) => p.id !== assignmentId));
      } else {
        setSuccessMessage('Handoff recorded. Waiting for traveler to confirm receipt.');
        setPendingPickups((prev) =>
          prev.map((p) => (p.id === assignmentId ? { ...p, agentHanded: 1, agentHandedAt: data.agent_handed_at } : p))
        );
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to hand parcel to traveler');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeliverToReceiver = async (assignmentId: string) => {
    const otp = otpInputs[assignmentId];
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP provided by the receiver to confirm delivery.');
      return;
    }
    try {
      setProcessingId(assignmentId);
      setError('');
      await api.patch(`/assignments/${assignmentId}/deliver`, { otp });
      setSuccessMessage('Delivery confirmed! Parcel delivered to receiver.');
      setPendingDeliveries((prev) => prev.filter((p) => p.id !== assignmentId));
      // Refresh to update completed list
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm delivery. Check OTP.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">Agent Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome, {user?.name}. Manage pickups and deliveries in {user?.city || 'your city'}.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold text-sm ring-1 ring-indigo-200">
            {pendingPickups.length} Pickups
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm ring-1 ring-orange-200">
            {pendingDeliveries.length} Deliveries
          </div>
          {availableInCity.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm ring-1 ring-purple-200">
              {availableInCity.length} Available
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200/50 rounded-xl blur-md"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Pickups</p>
              <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">{pendingPickups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-200/50 rounded-xl blur-md"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Deliveries</p>
              <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">{pendingDeliveries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-200/50 rounded-xl blur-md"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Hand className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Available</p>
              <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">{availableInCity.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200/50 rounded-xl blur-md"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">{completedJobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available in Your City — Unclaimed orders to claim */}
      {availableInCity.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Available in Your City
            <span className="text-sm font-normal text-gray-500">(Claim to start working)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableInCity.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{item.trackingCode}</span>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span>{item.pickupCity}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span>{item.destinationCity}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Sender:</span> {item.senderName}
                  </p>
                  {item.senderPhone && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Phone:</span> {item.senderPhone}
                    </p>
                  )}
                  {item.senderAddress && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Address:</span> {item.senderAddress}, {item.pickupCity}
                    </p>
                  )}
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Traveler:</span> {item.travelerName}
                  </p>
                  {item.description && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Parcel:</span> {item.description} {item.weight > 0 && `(${item.weight} kg)`}
                    </p>
                  )}
                </div>

                {/* Claim type indicator */}
                <div className="mb-3">
                  {!item.agentId && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full ring-1 ring-indigo-200">
                      <Package className="w-3 h-3" /> Pickup Needed
                    </span>
                  )}
                  {!item.destinationAgentId && item.status === 'REACHED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full ring-1 ring-orange-200">
                      <Truck className="w-3 h-3" /> Delivery Needed
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleClaimAssignment(item.id)}
                  disabled={claimingId === item.id}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  {claimingId === item.id ? 'Claiming...' : (!item.agentId ? 'Claim This Pickup' : 'Claim This Delivery')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Pickups — Collect from sender, hand to traveler */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Pending Pickups
          <span className="text-sm font-normal text-gray-500">(Collect from sender, hand to traveler)</span>
        </h2>
        {pendingPickups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending pickups. You will be notified when a traveler accepts a job.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPickups.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{item.trackingCode}</span>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>{item.pickupCity}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span>{item.destinationCity}</span>
                </div>

                {/* FROM: Sender */}
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> PICKUP FROM (Sender)
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{item.senderName}</p>
                  <p className="text-sm text-gray-600">{item.senderPhone}</p>
                  <p className="text-sm text-gray-600">{item.senderAddress ? `${item.senderAddress}, ` : ''}{item.pickupCity}</p>
                </div>

                {/* TO: Traveler */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> HAND TO (Traveler)
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{item.travelerName}</p>
                  <p className="text-sm text-gray-600">{item.travelerPhone}</p>
                  {item.travelerAddress && (
                    <p className="text-sm text-gray-600">{item.travelerAddress}, {item.travelerCity || item.pickupCity}</p>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Parcel:</span> {item.description} {item.weight > 0 && `(${item.weight} kg)`}
                  </p>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  {['MATCHED', 'ACCEPTED'].includes(item.status) && (
                    <button
                      onClick={() => handleConfirmPickup(item.id)}
                      disabled={processingId === item.id}
                      className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processingId === item.id ? 'Processing...' : 'Confirm Picked Up from Sender'}
                    </button>
                  )}
                  {item.status === 'PICKED_UP' && !item.agentHanded && (
                    <button
                      onClick={() => handleTransferToTraveler(item.id)}
                      disabled={processingId === item.id}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
                    >
                      {processingId === item.id ? 'Processing...' : 'Handed to Traveler'}
                    </button>
                  )}
                  {item.status === 'PICKED_UP' && item.agentHanded === 1 && !item.travelerReceived && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700 font-medium text-center">
                      Waiting for traveler to confirm receipt...
                    </div>
                  )}
                  {item.status === 'PICKED_UP' && item.agentHanded === 1 && item.travelerReceived === 1 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700 font-medium text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      In Transit
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Deliveries — Traveler has arrived, deliver to receiver */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-600" />
          Pending Deliveries
          <span className="text-sm font-normal text-gray-500">(Traveler arrived — deliver to receiver)</span>
        </h2>
        {pendingDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending deliveries. You will be notified when a traveler reaches your city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDeliveries.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{item.trackingCode}</span>
                  <StatusBadge status={item.status} />
                </div>

                {/* FROM: Traveler */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> PICKUP FROM (Traveler)
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{item.travelerName}</p>
                  <p className="text-sm text-gray-600">{item.travelerPhone}</p>
                  {item.travelerAddress && (
                    <p className="text-sm text-gray-600">{item.travelerAddress}, {item.travelerCity || item.destinationCity}</p>
                  )}
                </div>

                {/* TO: Receiver */}
                <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> DELIVER TO (Receiver)
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{item.receiverName}</p>
                  <p className="text-sm text-gray-600">{item.receiverPhone}</p>
                  <p className="text-sm text-gray-600">{item.receiverAddress ? `${item.receiverAddress}, ` : ''}{item.receiverCity}</p>
                </div>

                {/* OTP & Deliver Action */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Enter receiver OTP to confirm delivery</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otpInputs[item.id] || ''}
                      onChange={(e) => setOtpInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <button
                    onClick={() => handleDeliverToReceiver(item.id)}
                    disabled={processingId === item.id}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {processingId === item.id ? 'Processing...' : 'Confirm Delivered to Receiver'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Completed
        </h2>
        {completedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">No completed jobs yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedJobs.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{item.trackingCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.pickupCity} → {item.destinationCity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.receiverName}</td>
                    <td className="px-4 py-3"><StatusBadge status="DELIVERED" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
