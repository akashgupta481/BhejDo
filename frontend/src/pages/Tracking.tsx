import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MapPin, Package, CheckCircle2, Circle, Clock, Loader2, AlertCircle, Truck, User } from 'lucide-react';
import api from '../lib/api';

interface TrackingEvent {
  status: string;
  timestamp: string;
  description: string;
}

interface ParcelTracking {
  trackingCode: string;
  status: string;
  events: TrackingEvent[];
  currentHandler?: {
    name: string;
    phone: string;
    role: string;
  };
  estimatedDelivery?: string;
  sender: {
    city: string;
  };
  receiver: {
    city: string;
  };
}

const STATUS_STEPS = [
  { key: 'CREATED', label: 'Order Placed', description: 'Order created and awaiting match' },
  { key: 'MATCHED', label: 'Traveler Matched', description: 'A traveler has been assigned' },
  { key: 'PICKED_UP', label: 'Picked Up', description: 'Parcel collected from sender' },
  { key: 'IN_TRANSIT', label: 'In Transit', description: 'On the way with traveler' },
  { key: 'DELIVERED', label: 'Delivered', description: 'Successfully delivered' },
];

function getStatusIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'CREATED':
      return 'bg-amber-100 text-amber-800';
    case 'MATCHED':
      return 'bg-blue-100 text-blue-800';
    case 'PICKED_UP':
      return 'bg-indigo-100 text-indigo-800';
    case 'IN_TRANSIT':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function Tracking() {
  const { code } = useParams<{ code?: string }>();
  const [trackingCode, setTrackingCode] = useState(code || '');
  const [result, setResult] = useState<ParcelTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchCode?: string) => {
    const codeToSearch = searchCode || trackingCode.trim();
    if (!codeToSearch) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);

    try {
      const response = await api.get(`/parcels/track/${codeToSearch}`);
      const apiData = response.data.data || response.data;
      const parcel = apiData.parcel;
      const assignment = apiData.assignment;
      // Map backend response to the shape the component expects
      // Calculate estimated delivery (created_at + 3 days)
      const createdDate = new Date(parcel.created_at);
      const estimatedDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      const trackingResult: ParcelTracking = {
        trackingCode: parcel.tracking_code,
        status: parcel.status,
        events: [],
        sender: { city: parcel.pickup_city },
        receiver: { city: parcel.destination_city || parcel.receiver_city },
        estimatedDelivery: parcel.status !== 'DELIVERED' && parcel.status !== 'CANCELLED' ? estimatedDate.toISOString() : undefined,
      };
      if (assignment) {
        trackingResult.currentHandler = {
          name: assignment.traveler_name || 'Assigned Traveler',
          phone: '',
          role: 'Traveler',
        };
        // Build events from assignment timeline
        const events: TrackingEvent[] = [];
        events.push({ status: 'PENDING', timestamp: parcel.created_at, description: 'Parcel created' });
        if (assignment.pickup_time) {
          events.push({ status: 'PICKED_UP', timestamp: assignment.pickup_time, description: 'Parcel picked up' });
        }
        if (assignment.status === 'IN_TRANSIT' || assignment.status === 'DELIVERED') {
          events.push({ status: 'IN_TRANSIT', timestamp: assignment.pickup_time || parcel.created_at, description: 'In transit' });
        }
        if (assignment.delivery_time) {
          events.push({ status: 'DELIVERED', timestamp: assignment.delivery_time, description: 'Delivered' });
        }
        trackingResult.events = events;
      }
      setResult(trackingResult);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No parcel found with this tracking code');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      setTrackingCode(code);
      handleSearch(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const currentStatusIndex = result ? getStatusIndex(result.status) : -1;

  const getTimestampForStep = (stepKey: string): string | null => {
    if (!result?.events) return null;
    const event = result.events.find((e) => e.status === stepKey);
    return event?.timestamp || null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-family-heading)]">
            Track Your Parcel
          </h1>
          <p className="text-indigo-100 mb-8 text-lg">
            Enter your tracking code to get real-time updates on your delivery
          </p>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter your tracking code (e.g., BHJ-XXXX-XXXX)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 placeholder-gray-400 border-0 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-lg shadow-lg"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading || !trackingCode.trim()}
                className="btn-press px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Track
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Searching for your parcel...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tracking Not Found</h3>
            <p className="text-gray-500">{error}</p>
            <p className="text-gray-400 mt-2 text-sm">
              Please check the tracking code and try again.
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking Code</p>
                  <p className="text-2xl font-bold text-gray-800">{result.trackingCode}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {result.sender.city} → {result.receiver.city}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    result.status
                  )}`}
                >
                  {STATUS_STEPS.find((s) => s.key === result.status)?.label || result.status}
                </span>
              </div>

              {result.estimatedDelivery && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-600">
                    Estimated Delivery:{' '}
                    <span className="font-medium text-gray-800">
                      {new Date(result.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Delivery Progress</h3>
              <div className="relative">
                {STATUS_STEPS.map((step, index) => {
                  const isReached = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const timestamp = getTimestampForStep(step.key);
                  const isLast = index === STATUS_STEPS.length - 1;

                  return (
                    <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[15px] top-8 w-0.5 h-full ${
                            index < currentStatusIndex ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      {/* Dot */}
                      <div className="relative z-10 flex-shrink-0">
                        {isReached ? (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCurrent
                                ? 'bg-emerald-500 animate-scale-pulse'
                                : 'bg-emerald-500'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                            <Circle className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p
                          className={`font-medium ${
                            isReached ? 'text-gray-800' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-sm mt-0.5 ${
                            isReached ? 'text-gray-500' : 'text-gray-300'
                          }`}
                        >
                          {step.description}
                        </p>
                        {timestamp && (
                          <p className="text-xs text-indigo-600 mt-1">
                            {new Date(timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Handler */}
            {result.currentHandler && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Handler</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{result.currentHandler.name}</p>
                    <p className="text-sm text-gray-500">{result.currentHandler.role}</p>
                    <p className="text-sm text-gray-500">{result.currentHandler.phone}</p>
                  </div>
                  <div className="ml-auto">
                    <Truck className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-100 h-64 flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium">Live tracking map coming soon</p>
                <p className="text-sm text-gray-400 mt-1">
                  Real-time GPS tracking will be available here
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no search performed */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">
              Enter a tracking code above to get started
            </h3>
            <p className="text-gray-400 mt-2">
              You can find your tracking code in the confirmation email or SMS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
