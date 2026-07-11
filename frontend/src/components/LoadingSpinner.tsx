import { Parcel } from './illustrations/WarmArt';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 warm-canvas">
      <div className="relative">
        {/* soft moving shadow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-16 h-3 rounded-full bg-primary-300/40 blur-sm animate-badge-pulse" />
        <div className="w-20 h-20 bob-parcel">
          <Parcel />
        </div>
      </div>
      <div className="flex items-center gap-2 animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-badge-pulse" />
        <span className="text-sm font-medium text-slate-500 font-display">Getting things ready…</span>
      </div>
    </div>
  );
}
