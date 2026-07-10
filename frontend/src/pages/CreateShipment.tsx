import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Package, Shield, ClipboardCheck, ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react';
import api from '../lib/api';

interface ShipmentForm {
  pickupCity: string;
  pickupAddress: string;
  pickupDate: string;
  pickupTimeSlot: string;
  receiverName: string;
  receiverPhone: string;
  receiverCity: string;
  receiverAddress: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  description: string;
  photos: File[];
  insuranceEnabled: boolean;
  insuranceAmount: number;
}

const steps = [
  { label: 'Pickup', icon: MapPin },
  { label: 'Receiver', icon: User },
  { label: 'Parcel', icon: Package },
  { label: 'Insurance', icon: Shield },
  { label: 'Review', icon: ClipboardCheck },
];

const CreateShipment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ShipmentForm>({
    pickupCity: '',
    pickupAddress: '',
    pickupDate: '',
    pickupTimeSlot: 'Morning',
    receiverName: '',
    receiverPhone: '',
    receiverCity: '',
    receiverAddress: '',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    description: '',
    photos: [],
    insuranceEnabled: false,
    insuranceAmount: 0,
  });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const updateForm = (field: keyof ShipmentForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!form.pickupCity.trim()) errors.pickupCity = 'Pickup city is required';
        if (!form.pickupAddress.trim()) errors.pickupAddress = 'Pickup address is required';
        if (!form.pickupDate) errors.pickupDate = 'Pickup date is required';
        break;
      case 1:
        if (!form.receiverName.trim()) errors.receiverName = 'Receiver name is required';
        if (!form.receiverPhone.trim()) errors.receiverPhone = 'Receiver phone is required';
        if (!form.receiverCity.trim()) errors.receiverCity = 'Receiver city is required';
        if (!form.receiverAddress.trim()) errors.receiverAddress = 'Receiver address is required';
        break;
      case 2:
        if (!form.weight || form.weight <= 0) errors.weight = 'Weight must be greater than 0';
        if (!form.description.trim()) errors.description = 'Description is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const estimatedPrice = () => {
    const basePrice = 50;
    const weightCharge = form.weight * 50;
    const distanceFactor = 100;
    const insurancePremium = form.insuranceEnabled ? form.insuranceAmount * 0.02 : 0;
    return {
      base: basePrice,
      weightCharge,
      distanceFactor,
      insurancePremium,
      total: basePrice + weightCharge + distanceFactor + insurancePremium,
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const price = estimatedPrice();
      const payload = {
        pickup_city: form.pickupCity,
        pickup_address: form.pickupAddress,
        pickup_date: form.pickupDate,
        pickup_time_slot: form.pickupTimeSlot,
        receiver_name: form.receiverName,
        receiver_phone: form.receiverPhone,
        receiver_city: form.receiverCity,
        receiver_address: form.receiverAddress,
        destination_city: form.receiverCity,
        weight: form.weight,
        dimensions: JSON.stringify({ length: form.length, width: form.width, height: form.height }),
        description: form.description,
        insurance: form.insuranceEnabled,
        estimated_price: price.total,
      };
      const res = await api.post('/parcels', payload);
      const parcelId = res.data.data?.parcel?.id || res.data.data?.id;
      navigate(`/parcel/${parcelId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create shipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const price = estimatedPrice();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 font-[family-name:var(--font-family-heading)]">Create New Shipment</h1>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={`flex-1 h-0.5 transition-colors duration-500 ${idx <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    idx < currentStep
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                      : idx === currentStep
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 scale-110'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {idx < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-colors duration-500 ${idx < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
              <span className={`text-xs mt-2 font-semibold transition-colors ${idx <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        {/* Step 1: Pickup */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup City</label>
              <input
                type="text"
                value={form.pickupCity}
                onChange={(e) => updateForm('pickupCity', e.target.value)}
                placeholder="e.g., Mumbai"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.pickupCity ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.pickupCity && <p className="text-red-500 text-sm mt-1">{validationErrors.pickupCity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <textarea
                value={form.pickupAddress}
                onChange={(e) => updateForm('pickupAddress', e.target.value)}
                placeholder="Full pickup address"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.pickupAddress ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.pickupAddress && <p className="text-red-500 text-sm mt-1">{validationErrors.pickupAddress}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pickup Date</label>
                <input
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) => updateForm('pickupDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.pickupDate ? 'border-red-300' : 'border-gray-300'}`}
                />
                {validationErrors.pickupDate && <p className="text-red-500 text-sm mt-1">{validationErrors.pickupDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <select
                  value={form.pickupTimeSlot}
                  onChange={(e) => updateForm('pickupTimeSlot', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Morning">Morning (9AM - 12PM)</option>
                  <option value="Afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="Evening">Evening (4PM - 8PM)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Receiver */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receiver Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
              <input
                type="text"
                value={form.receiverName}
                onChange={(e) => updateForm('receiverName', e.target.value)}
                placeholder="Full name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.receiverName ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.receiverName && <p className="text-red-500 text-sm mt-1">{validationErrors.receiverName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Phone</label>
              <input
                type="tel"
                value={form.receiverPhone}
                onChange={(e) => updateForm('receiverPhone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.receiverPhone ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.receiverPhone && <p className="text-red-500 text-sm mt-1">{validationErrors.receiverPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver City</label>
              <input
                type="text"
                value={form.receiverCity}
                onChange={(e) => updateForm('receiverCity', e.target.value)}
                placeholder="e.g., Delhi"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.receiverCity ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.receiverCity && <p className="text-red-500 text-sm mt-1">{validationErrors.receiverCity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
              <textarea
                value={form.receiverAddress}
                onChange={(e) => updateForm('receiverAddress', e.target.value)}
                placeholder="Full delivery address"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.receiverAddress ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.receiverAddress && <p className="text-red-500 text-sm mt-1">{validationErrors.receiverAddress}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Parcel */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parcel Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight || ''}
                onChange={(e) => updateForm('weight', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.weight ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.weight && <p className="text-red-500 text-sm mt-1">{validationErrors.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  min="0"
                  value={form.length || ''}
                  onChange={(e) => updateForm('length', parseFloat(e.target.value) || 0)}
                  placeholder="Length"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  min="0"
                  value={form.width || ''}
                  onChange={(e) => updateForm('width', parseFloat(e.target.value) || 0)}
                  placeholder="Width"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  min="0"
                  value={form.height || ''}
                  onChange={(e) => updateForm('height', parseFloat(e.target.value) || 0)}
                  placeholder="Height"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Describe your parcel (e.g., electronics, documents, clothing)"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.description ? 'border-red-300' : 'border-gray-300'}`}
              />
              {validationErrors.description && <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop photos or click to upload</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 text-sm font-medium"
                >
                  Choose Files
                </label>
              </div>
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {photoPreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Insurance */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Pricing</h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Insurance</p>
                <p className="text-sm text-gray-500">Protect your parcel against loss or damage</p>
              </div>
              <button
                onClick={() => updateForm('insuranceEnabled', !form.insuranceEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.insuranceEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${form.insuranceEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {form.insuranceEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Declared Value (for insurance)</label>
                <input
                  type="number"
                  min="0"
                  value={form.insuranceAmount || ''}
                  onChange={(e) => updateForm('insuranceAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter declared value in INR"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-gray-500 mt-1">Insurance premium: 2% of declared value</p>
              </div>
            )}

            <div className="bg-indigo-50 rounded-xl p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">₹{price.base}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weight Surcharge ({form.weight} kg x ₹50)</span>
                  <span className="font-medium">₹{price.weightCharge}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance Factor</span>
                  <span className="font-medium">₹{price.distanceFactor}</span>
                </div>
                {form.insuranceEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance Premium (2%)</span>
                    <span className="font-medium">₹{price.insurancePremium.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-indigo-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-indigo-600">₹{price.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Pickup Details</h3>
                  <button onClick={() => setCurrentStep(0)} className="text-indigo-600 text-sm hover:underline">Edit</button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">City:</span> {form.pickupCity}</p>
                  <p><span className="font-medium">Address:</span> {form.pickupAddress}</p>
                  <p><span className="font-medium">Date:</span> {form.pickupDate}</p>
                  <p><span className="font-medium">Time:</span> {form.pickupTimeSlot}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Receiver Details</h3>
                  <button onClick={() => setCurrentStep(1)} className="text-indigo-600 text-sm hover:underline">Edit</button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {form.receiverName}</p>
                  <p><span className="font-medium">Phone:</span> {form.receiverPhone}</p>
                  <p><span className="font-medium">City:</span> {form.receiverCity}</p>
                  <p><span className="font-medium">Address:</span> {form.receiverAddress}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Parcel Details</h3>
                  <button onClick={() => setCurrentStep(2)} className="text-indigo-600 text-sm hover:underline">Edit</button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Weight:</span> {form.weight} kg</p>
                  <p><span className="font-medium">Dimensions:</span> {form.length} x {form.width} x {form.height} cm</p>
                  <p><span className="font-medium">Description:</span> {form.description}</p>
                  <p><span className="font-medium">Photos:</span> {form.photos.length} uploaded</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Pricing</h3>
                  <button onClick={() => setCurrentStep(3)} className="text-indigo-600 text-sm hover:underline">Edit</button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Insurance:</span> {form.insuranceEnabled ? 'Yes' : 'No'}</p>
                  {form.insuranceEnabled && <p><span className="font-medium">Coverage:</span> ₹{form.insuranceAmount}</p>}
                  <p className="text-lg font-bold text-indigo-600 mt-2">Total: ₹{price.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="btn-press flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="btn-press flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium shadow-md shadow-indigo-200/50"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-press flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200/50"
          >
            {loading ? 'Creating...' : 'Confirm & Create Shipment'}
            {!loading && <Check className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;
