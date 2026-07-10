interface SpeedIconProps {
  className?: string;
  size?: number;
}

export function SpeedIcon({ className = '', size = 48 }: SpeedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lightning bolt */}
      <path
        d="M28 4L12 26H22L18 44L36 20H26L28 4Z"
        fill="#F97316"
      />
      {/* Lightning inner highlight */}
      <path
        d="M27 8L15 26H21L18 38L33 22H27L27 8Z"
        fill="#FDBA74"
        opacity="0.4"
      />
      {/* Motion lines - left side */}
      <path
        d="M6 18H10"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M4 24H9"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M6 30H10"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Motion lines - right side */}
      <path
        d="M40 14H44"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M42 20H46"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Small energy dots */}
      <circle cx="8" cy="14" r="1.5" fill="#F97316" opacity="0.4" />
      <circle cx="42" cy="28" r="1.5" fill="#F97316" opacity="0.4" />
      <circle cx="10" cy="36" r="1.5" fill="#F97316" opacity="0.3" />
    </svg>
  );
}
