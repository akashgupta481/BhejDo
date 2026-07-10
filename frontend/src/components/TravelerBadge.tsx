import { Shield, Star, CheckCircle, Award } from 'lucide-react';

interface TravelerBadgeProps {
  name: string;
  idVerified?: boolean;
  tripsCompleted?: number;
  ratingAvg?: number;
  compact?: boolean;
}

function calculateTrustScore(idVerified: boolean, tripsCompleted: number, ratingAvg: number): number {
  let score = 0;
  // ID verification: 30 points
  if (idVerified) score += 30;
  // Trips completed: up to 40 points (max at 20 trips)
  score += Math.min(tripsCompleted * 2, 40);
  // Rating: up to 30 points (rating out of 5, scaled)
  score += Math.round((ratingAvg / 5) * 30);
  return Math.min(score, 100);
}

function getTrustLevel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-700', bgColor: 'bg-emerald-100' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-700', bgColor: 'bg-amber-100' };
  return { label: 'New', color: 'text-gray-700', bgColor: 'bg-gray-100' };
}

export default function TravelerBadge({
  name,
  idVerified = false,
  tripsCompleted = 0,
  ratingAvg = 0,
  compact = false,
}: TravelerBadgeProps) {
  const trustScore = calculateTrustScore(idVerified, tripsCompleted, ratingAvg);
  const trustLevel = getTrustLevel(trustScore);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900 text-sm">{name}</span>
        {idVerified && (
          <span className="inline-flex items-center gap-0.5 text-xs text-blue-600" title="ID Verified">
            <CheckCircle className="w-3.5 h-3.5 fill-blue-600 text-white" />
          </span>
        )}
        {ratingAvg > 0 && (
          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {ratingAvg.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Traveler Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-700 font-semibold text-sm">
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{name}</span>
            {idVerified && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium" title="ID Verified">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {ratingAvg > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {ratingAvg.toFixed(1)}
              </span>
            )}
            <span className="text-xs text-gray-500">{tripsCompleted} trips</span>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Trust Score</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trustLevel.bgColor} ${trustLevel.color}`}>
          <Award className="w-3 h-3" />
          {trustScore}/100 - {trustLevel.label}
        </span>
      </div>

      {/* Trust Score Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            trustScore >= 80
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : trustScore >= 60
              ? 'bg-gradient-to-r from-blue-400 to-blue-500'
              : trustScore >= 40
              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
              : 'bg-gradient-to-r from-gray-300 to-gray-400'
          }`}
          style={{ width: `${trustScore}%` }}
        />
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="text-center">
          <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${idVerified ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <CheckCircle className={`w-3.5 h-3.5 ${idVerified ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-xs text-gray-500 mt-1">ID Verified</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{tripsCompleted}</p>
          <p className="text-xs text-gray-500">Trips Done</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900">{ratingAvg > 0 ? ratingAvg.toFixed(1) : 'N/A'}</span>
          </div>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>
    </div>
  );
}
