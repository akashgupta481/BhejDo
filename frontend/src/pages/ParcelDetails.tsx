import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, Phone, Shield, Copy, Share2, MessageCircle, XCircle, CheckCircle, Clock, Truck, Calendar, Camera, Star } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewModal from '../components/ReviewModal';
import InsuranceInfo from '../components/InsuranceInfo';
import type { Parcel } from '../types';

const statusSteps = [
  { key: 'CREATED', label: 'Order Placed', desc: 'Shipment created and awaiting traveler match', icon: Package },
  { key: 'MATCHED', label: 'Traveler Matched', desc: 'A traveler has been assigned to deliver', icon: Calendar },
  { key: 'PICKED_UP', label: 'Picked Up', desc: 'Parcel collected from sender', icon: CheckCircle },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'On the way with the assigned traveler', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Successfully delivered to receiver', icon: CheckCircle },
];

const ParcelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/parcels/${id}`);
        const apiData = res.data.data || res.data;
        // Backend returns { parcel, sender, assignment, timeline }
        const p = apiData.parcel || apiData;
        // Normalize to camelCase aliases the component uses
        p.trackingCode = p.tracking_code || p.trackingCode;
        p.pickupCity = p.pickup_city || p.pickupCity;
        p.receiverCity = p.destination_city || p.receiver_city || p.receiverCity;
        p.receiverName = p.receiver_name || p.receiverName;
        p.receiverPhone = p.receiver_phone || p.receiverPhone;
        p.receiverAddress = p.receiver_address || p.receiverAddress;
        p.pickupAddress = p.pickup_city || '';
        p.estimatedPrice = p.estimated_price || p.estimatedPrice;
        p.insuranceEnabled = p.insurance === 1;
        p.otp = p.otp_code || p.otp;
        p.createdAt = p.created_at || p.createdAt;
        p.updatedAt = p.created_at || p.updatedAt;
        if (apiData.sender) p.sender = apiData.sender;
        if (apiData.assignment) {
          p.traveler = { name: apiData.assignment.traveler_name, phone: apiData.assignment.traveler_phone } as any;
          if (apiData.assignment.agent_name) {
            p.agent = { name: apiData.assignment.agent_name, phone: apiData.assignment.agent_phone } as any;
          }
        }
        setParcel(p);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Parcel not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchParcel();
  }, [id]);

  const handleCancel = async () => {
    if (!parcel) return;
    try {
      setCancelling(true);
      await api.patch(`/parcels/${parcel.id}/status`, { status: 'CANCELLED' });
      setParcel((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel shipment');
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingCode = () => {
    if (parcel?.trackingCode) {
      navigator.clipboard.writeText(parcel.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCurrentStepIndex = () => {
    if (!parcel) return -1;
    if (parcel.status === 'CANCELLED') return -1;
    return statusSteps.findIndex((s) => s.key === parcel.status);
  };

  const handleDeliveryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDeliveryPhoto(reader.result as string);
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const getEstimatedDelivery = (): string | null => {
    if (!parcel || parcel.status === 'DELIVERED' || parcel.status === 'CANCELLED') return null;
    // Estimate based on creation date + 2-3 days
    const created = new Date(parcel.createdAt || parcel.created_at);
    const estimated = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
    return estimated.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  if (error || !parcel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Parcel Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The parcel you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-medium hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="warm-canvas min-h-screen">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">{parcel.trackingCode}</h1>
            <button
              onClick={copyTrackingCode}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy tracking code"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            {copied && <span className="text-sm text-emerald-600">Copied!</span>}
          </div>
        </div>
        <StatusBadge status={parcel.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="soft-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h2>
            {parcel.status === 'CANCELLED' ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-red-700">Shipment Cancelled</p>
                  <p className="text-sm text-red-600">This shipment has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex gap-4 mb-6 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-full min-h-[2rem] mt-2 ${isCompleted && idx < currentStepIndex ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{step.desc}</p>
                        {isCurrent && parcel.updatedAt && (
                          <p className="text-xs text-indigo-600 mt-1">{new Date(parcel.updatedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Route Info */}
          <div className="soft-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Route</h2>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <div className="w-0.5 h-12 bg-indigo-200" />
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">From</p>
                  <p className="font-medium text-gray-900">{parcel.pickupCity}</p>
                  <p className="text-sm text-gray-600">{parcel.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">To</p>
                  <p className="font-medium text-gray-900">{parcel.receiverCity}</p>
                  <p className="text-sm text-gray-600">{parcel.receiverAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parcel Info */}
          <div className="soft-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parcel Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium text-gray-900">{parcel.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium text-gray-900">{parcel.weight} kg</p>
              </div>
              {parcel.dimensions && (
                <div>
                  <p className="text-sm text-gray-500">Dimensions</p>
                  <p className="font-medium text-gray-900">
                    {(() => {
                      try {
                        const d = typeof parcel.dimensions === 'string' ? JSON.parse(parcel.dimensions) : parcel.dimensions;
                        return `${d.length} x ${d.width} x ${d.height} cm`;
                      } catch {
                        return parcel.dimensions;
                      }
                    })()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Insurance</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  {parcel.insuranceEnabled ? `Covered (₹${parcel.insuranceAmount})` : 'Not insured'}
                </p>
              </div>
            </div>
            {parcel.photos && parcel.photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Photos</p>
                <div className="grid grid-cols-4 gap-2">
                  {(typeof parcel.photos === 'string' ? JSON.parse(parcel.photos) as string[] : []).map((photo: string, idx: number) => (
                    <img key={idx} src={photo} alt="Parcel" className="w-full h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* OTP Section */}
          {(user?.role === 'SENDER' || user?.role === 'AGENT') && parcel.otp && parcel.status !== 'DELIVERED' && parcel.status !== 'CANCELLED' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-2">Verification OTP</h3>
              <div className="flex justify-center gap-2 my-3">
                {parcel.otp.split('').map((digit, idx) => (
                  <span key={idx} className="w-10 h-12 flex items-center justify-center bg-white border-2 border-amber-300 rounded-lg text-xl font-bold text-amber-700">
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-700 text-center">This OTP is required for pickup/delivery verification</p>
            </div>
          )}

          {/* People Involved */}
          <div className="soft-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">People Involved</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sender</p>
                  <p className="font-medium text-gray-900 text-sm">{parcel.sender?.name || 'You'}</p>
                  {parcel.sender?.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {parcel.sender.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Receiver</p>
                  <p className="font-medium text-gray-900 text-sm">{parcel.receiverName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {parcel.receiverPhone}
                  </p>
                </div>
              </div>

              {parcel.traveler && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Traveler</p>
                    <p className="font-medium text-gray-900 text-sm">{parcel.traveler.name}</p>
                    {parcel.traveler.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {parcel.traveler.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {parcel.agent && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Agent</p>
                    <p className="font-medium text-gray-900 text-sm">{parcel.agent.name}</p>
                    {parcel.agent.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {parcel.agent.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          {getEstimatedDelivery() && (
            <div className="soft-card p-5">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Estimated Delivery
              </h3>
              <p className="text-lg font-bold text-indigo-600">{getEstimatedDelivery()}</p>
              <p className="text-xs text-gray-500 mt-1">Based on travel schedule (2-3 days)</p>
            </div>
          )}

          {/* Price */}
          <div className="soft-card p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Estimated Price</h3>
            <p className="text-2xl font-bold text-indigo-600">₹{parcel.estimatedPrice}</p>
          </div>

          {/* Insurance Info */}
          <InsuranceInfo
            insuranceEnabled={!!parcel.insuranceEnabled}
            insuranceAmount={parcel.insuranceAmount || 0}
            parcelDescription={parcel.description}
          />

          {/* Delivery Photo Proof */}
          {(user?.role === 'TRAVELER' || user?.role === 'AGENT') && parcel.status !== 'DELIVERED' && parcel.status !== 'CANCELLED' && (
            <div className="soft-card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                Delivery Photo Proof
              </h3>
              {deliveryPhoto ? (
                <div className="space-y-3">
                  <img src={deliveryPhoto} alt="Delivery proof" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Photo uploaded successfully
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Upload a photo as proof of delivery</p>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 border-2 border-dashed border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {photoUploading ? 'Uploading...' : 'Upload Delivery Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDeliveryPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Review Button (shown after delivery) */}
          {parcel.status === 'DELIVERED' && user?.role === 'SENDER' && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-md"
            >
              <Star className="w-4 h-4" />
              Rate Your Experience
            </button>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {(parcel.status === 'CREATED' || parcel.status === 'MATCHED') && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {cancelling ? 'Cancelling...' : 'Cancel Shipment'}
              </button>
            )}
            <button
              onClick={copyTrackingCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share Tracking
            </button>
            <Link
              to="/track"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        parcelId={parcel.id}
        travelerName={parcel.traveler?.name}
      />
    </div>
    </div>
  );
};

export default ParcelDetails;
