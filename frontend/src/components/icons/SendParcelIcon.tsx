interface SendParcelIconProps {
  className?: string;
  size?: number;
}

export function SendParcelIcon({ className = '', size = 48 }: SendParcelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Box body */}
      <path
        d="M8 18L24 10L40 18V36L24 44L8 36V18Z"
        fill="#4F46E5"
      />
      {/* Box top face */}
      <path
        d="M8 18L24 26L40 18L24 10L8 18Z"
        fill="#6366F1"
      />
      {/* Box center line */}
      <path
        d="M24 26V44"
        stroke="#3730A3"
        strokeWidth="1.5"
      />
      {/* Box side shadow */}
      <path
        d="M24 26L40 18V36L24 44V26Z"
        fill="#4338CA"
      />
      {/* Upward curved arrow */}
      <path
        d="M24 20C20 14 18 8 24 4C30 8 28 14 24 20Z"
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M21 6L24 2L27 6"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Motion lines */}
      <path d="M18 8H14" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M34 8H30" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
