interface TravelerIconProps {
  className?: string;
  size?: number;
}

export function TravelerIcon({ className = '', size = 48 }: TravelerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Person head */}
      <circle cx="20" cy="10" r="6" fill="#F97316" />
      {/* Person body */}
      <path
        d="M13 20C13 18.3431 14.3431 17 16 17H24C25.6569 17 27 18.3431 27 20V32C27 33.1046 26.1046 34 25 34H15C13.8954 34 13 33.1046 13 32V20Z"
        fill="#F97316"
      />
      {/* Person legs */}
      <rect x="14" y="34" width="5" height="10" rx="2.5" fill="#EA580C" />
      <rect x="21" y="34" width="5" height="10" rx="2.5" fill="#EA580C" />
      {/* Suitcase */}
      <rect x="30" y="24" width="10" height="16" rx="2" fill="#F97316" />
      <rect x="33" y="21" width="4" height="4" rx="1.5" fill="#EA580C" />
      {/* Suitcase handle */}
      <path
        d="M33 24V22C33 21.4477 33.4477 21 34 21H36C36.5523 21 37 21.4477 37 22V24"
        stroke="#C2410C"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Suitcase stripe */}
      <rect x="30" y="30" width="10" height="2" fill="#EA580C" opacity="0.5" />
      {/* Suitcase wheels */}
      <circle cx="32" cy="41" r="1.5" fill="#7C2D12" />
      <circle cx="38" cy="41" r="1.5" fill="#7C2D12" />
      {/* Checkmark badge */}
      <circle cx="38" cy="10" r="6" fill="#10B981" />
      <path
        d="M35 10L37 12L41 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
