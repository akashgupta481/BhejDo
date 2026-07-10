import type { LucideIcon } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: Trend;
  className?: string;
}

function getTrendIndicator(trend: Trend) {
  switch (trend) {
    case 'up':
      return <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">&#9650; Up</span>;
    case 'down':
      return <span className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded-full">&#9660; Down</span>;
    case 'neutral':
      return <span className="text-slate-500 text-xs font-semibold bg-slate-50 px-2 py-0.5 rounded-full">&#8212; Steady</span>;
    default:
      return null;
  }
}

export default function StatsCard({ title, value, icon: Icon, trend, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover group ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-family-heading)]">{value}</p>
            {trend && getTrendIndicator(trend)}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-200/50 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
          <div className="relative p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
