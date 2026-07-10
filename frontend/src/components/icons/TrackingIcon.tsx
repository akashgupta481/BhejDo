interface TrackingIconProps {
  className?: string;
  size?: number;
}

export function TrackingIcon({ className = '', size = 48 }: TrackingIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Winding path/route */}
      <path
        d="M8 40C8 40 12 32 18 32C24 32 22 20 28 20C34 20 32 12 38 8"
        stroke="#4F46E5"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dashed overlay for style */}
      <path
        d="M8 40C8 40 12 32 18 32C24 32 22 20 28 20C34 20 32 12 38 8"
        stroke="#818CF8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 5"
        fill="none"
      />
      {/* Pin 1 - bottom */}
      <circle cx="10" cy="38" r="4" fill="#F97316" />
      <circle cx="10" cy="38" r="2" fill="white" />
      <path d="M10 42L8 46H12L10 42Z" fill="#F97316" />
      {/* Pin 2 - middle */}
      <circle cx="25" cy="22" r="4" fill="#F97316" />
      <circle cx="25" cy="22" r="2" fill="white" />
      <path d="M25 26L23 30H27L25 26Z" fill="#F97316" />
      {/* Pin 3 - top */}
      <circle cx="38" cy="8" r="4" fill="#F97316" />
      <circle cx="38" cy="8" r="2" fill="white" />
      <path d="M38 12L36 16H40L38 12Z" fill="#F97316" />
    </svg>
  );
}
