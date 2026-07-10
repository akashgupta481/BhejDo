import { Shield, CheckCircle, AlertTriangle, FileText, Phone } from 'lucide-react';

interface InsuranceInfoProps {
  insuranceEnabled: boolean;
  insuranceAmount?: number;
  parcelDescription?: string;
}

export default function InsuranceInfo({
  insuranceEnabled,
  insuranceAmount = 0,
  parcelDescription = 'your parcel',
}: InsuranceInfoProps) {
  if (!insuranceEnabled) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">No Insurance Coverage</h4>
            <p className="text-sm text-amber-700 mt-1">
              This parcel is not insured. In case of damage or loss during transit,
              BhejDo will not be able to provide compensation.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Tip: Enable insurance during shipment creation to protect your items.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Insurance Coverage</h3>
          <p className="text-xs text-emerald-600 font-medium">Active Protection</p>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Coverage Amount</span>
          <span className="font-bold text-emerald-700 text-lg">₹{insuranceAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Premium Paid</span>
          <span className="font-medium text-gray-900">₹{Math.round(insuranceAmount * 0.02)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Covered Item</span>
          <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{parcelDescription}</span>
        </div>
      </div>

      {/* What's Covered */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">What&apos;s Covered</h4>
        <div className="space-y-2">
          {[
            'Loss of parcel during transit',
            'Damage due to mishandling',
            'Theft or pilferage',
            'Water or weather damage',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's NOT Covered */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Exclusions</h4>
        <div className="space-y-2">
          {[
            'Perishable goods and liquids',
            'Pre-existing damage',
            'Prohibited or illegal items',
            'Wear and tear from normal use',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How to File a Claim */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          How to File a Claim
        </h4>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span>Report damage/loss within 48 hours of delivery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span>Submit photos and description of damage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span>Our team reviews within 3-5 business days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <span>Approved claims are paid to your wallet</span>
          </li>
        </ol>
      </div>

      {/* Support Contact */}
      <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
        <Phone className="w-4 h-4 text-indigo-600" />
        <div>
          <p className="text-xs text-gray-500">Need help with a claim?</p>
          <p className="text-sm font-medium text-indigo-600">support@bhejdo.com</p>
        </div>
      </div>
    </div>
  );
}
