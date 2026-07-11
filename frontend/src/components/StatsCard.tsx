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

const TILES = ['icon-tile-terra', 'icon-tile-forest', 'icon-tile-mustard', 'icon-tile-olive'];

export default function StatsCard({ title, value, icon: Icon, trend, className = '' }: StatsCardProps) {
  // Pick a stable tile colour from the title so a row of cards looks varied.
  const tile = TILES[Math.abs(Array.from(title).reduce((a, c) => a + c.charCodeAt(0), 0)) % TILES.length];
  return (
    <div className={`soft-card p-6 group ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900 font-display">{value}</p>
            {trend && getTrendIndicator(trend)}
          </div>
        </div>
        <div className={`icon-tile ${tile} p-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
