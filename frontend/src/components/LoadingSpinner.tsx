import { BhejDoLogo } from './icons/BhejDoLogo';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200/30 rounded-full blur-xl animate-badge-pulse"></div>
        <div className="relative animate-spin">
          <svg
            className="h-12 w-12 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-2 animate-fade-in">
        <BhejDoLogo className="w-6 h-6" />
        <span className="text-sm font-medium text-slate-500">Loading...</span>
      </div>
    </div>
  );
}
