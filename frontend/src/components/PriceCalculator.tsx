import { useState } from 'react';
import { Package, Calculator, Info } from 'lucide-react';

interface ParcelSize {
  id: string;
  label: string;
  icon: string;
  dimensions: string;
  maxWeight: number;
  basePrice: number;
  description: string;
}

const PARCEL_SIZES: ParcelSize[] = [
  {
    id: 'envelope',
    label: 'Envelope',
    icon: '✉️',
    dimensions: '30 x 22 x 2 cm',
    maxWeight: 0.5,
    basePrice: 30,
    description: 'Documents, letters, thin items',
  },
  {
    id: 'small',
    label: 'Small Box',
    icon: '📦',
    dimensions: '30 x 25 x 15 cm',
    maxWeight: 3,
    basePrice: 60,
    description: 'Books, electronics, small gifts',
  },
  {
    id: 'medium',
    label: 'Medium Box',
    icon: '📦',
    dimensions: '45 x 35 x 25 cm',
    maxWeight: 10,
    basePrice: 100,
    description: 'Clothing, shoes, medium items',
  },
  {
    id: 'large',
    label: 'Large Box',
    icon: '📦',
    dimensions: '60 x 50 x 40 cm',
    maxWeight: 25,
    basePrice: 180,
    description: 'Appliances, large packages',
  },
];

interface PriceBreakdown {
  basePrice: number;
  distanceCharge: number;
  weightSurcharge: number;
  insurancePremium: number;
  total: number;
}

interface PriceCalculatorProps {
  onPriceCalculated?: (breakdown: PriceBreakdown, selectedSize: ParcelSize) => void;
  distance?: number;
  weight?: number;
  insuranceAmount?: number;
  insuranceEnabled?: boolean;
}

export default function PriceCalculator({
  onPriceCalculated,
  distance = 500,
  weight = 1,
  insuranceAmount = 0,
  insuranceEnabled = false,
}: PriceCalculatorProps) {
  const [selectedSize, setSelectedSize] = useState<string>('small');
  const [inputDistance, setInputDistance] = useState(distance);
  const [inputWeight, setInputWeight] = useState(weight);

  const currentSize = PARCEL_SIZES.find((s) => s.id === selectedSize) || PARCEL_SIZES[1];

  const calculatePrice = (): PriceBreakdown => {
    const basePrice = currentSize.basePrice;
    const perKmRate = 0.15;
    const distanceCharge = Math.round(inputDistance * perKmRate);
    const weightSurcharge = inputWeight > currentSize.maxWeight * 0.5
      ? Math.round((inputWeight - currentSize.maxWeight * 0.5) * 20)
      : 0;
    const insurancePremium = insuranceEnabled ? Math.round(insuranceAmount * 0.02) : 0;
    const total = basePrice + distanceCharge + weightSurcharge + insurancePremium;

    return { basePrice, distanceCharge, weightSurcharge, insurancePremium, total };
  };

  const breakdown = calculatePrice();

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSize(sizeId);
    if (onPriceCalculated) {
      const size = PARCEL_SIZES.find((s) => s.id === sizeId) || PARCEL_SIZES[1];
      onPriceCalculated(calculatePrice(), size);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Select Parcel Size
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PARCEL_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => handleSizeSelect(size.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                selectedSize === size.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              {selectedSize === size.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-2xl block mb-2">{size.icon}</span>
              <p className="font-semibold text-gray-900 text-sm">{size.label}</p>
              <p className="text-xs text-gray-500 mt-1">{size.dimensions}</p>
              <p className="text-xs text-gray-500">Up to {size.maxWeight} kg</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">From ₹{size.basePrice}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Size Details */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-800">
            {currentSize.label}: {currentSize.description}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max dimensions: {currentSize.dimensions} | Max weight: {currentSize.maxWeight} kg
          </p>
        </div>
      </div>

      {/* Distance & Weight Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Distance (km)
          </label>
          <input
            type="number"
            min="1"
            value={inputDistance}
            onChange={(e) => setInputDistance(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actual Weight (kg)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {inputWeight > currentSize.maxWeight && (
            <p className="text-xs text-amber-600 mt-1">
              Weight exceeds recommended limit for {currentSize.label}. Consider a larger size.
            </p>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Price Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Price ({currentSize.label})</span>
            <span className="font-medium text-gray-900">₹{breakdown.basePrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Distance ({inputDistance} km x ₹0.15/km)</span>
            <span className="font-medium text-gray-900">₹{breakdown.distanceCharge}</span>
          </div>
          {breakdown.weightSurcharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Weight Surcharge</span>
              <span className="font-medium text-gray-900">₹{breakdown.weightSurcharge}</span>
            </div>
          )}
          {insuranceEnabled && breakdown.insurancePremium > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Insurance Premium (2%)</span>
              <span className="font-medium text-gray-900">₹{breakdown.insurancePremium}</span>
            </div>
          )}
          <div className="border-t border-indigo-200 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Estimated Total</span>
            <span className="font-bold text-2xl text-indigo-600">₹{breakdown.total}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Final price may vary based on actual distance and traveler availability
        </p>
      </div>
    </div>
  );
}
