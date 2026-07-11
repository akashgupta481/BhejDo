interface BhejDoLogoProps {
  className?: string;
  size?: number;
}

export function BhejDoLogo({ className = '', size = 48 }: BhejDoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Parcel body - rounded rectangle */}
      <rect x="12" y="18" width="32" height="28" rx="6" fill="#E9C46A" />
      {/* Parcel lid / top flap */}
      <path
        d="M12 22C12 19.7909 13.7909 18 16 18H40C42.2091 18 44 19.7909 44 22V26H12V22Z"
        fill="#D99A5B"
      />
      {/* Parcel tape/stripe */}
      <rect x="25" y="18" width="6" height="28" fill="#7C3AED" opacity="0.85" />
      {/* Diagonal arrow swoosh - motion/delivery */}
      <path
        d="M30 40C34 36 42 28 52 16"
        stroke="#F97316"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head */}
      <path
        d="M48 14L53 15L52 20"
        stroke="#F97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Motion lines */}
      <path
        d="M8 34H14"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M6 40H11"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M9 28H13"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
