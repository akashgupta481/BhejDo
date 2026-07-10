interface WalletIconProps {
  className?: string;
  size?: number;
}

export function WalletIcon({ className = '', size = 48 }: WalletIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wallet body */}
      <rect x="6" y="14" width="32" height="24" rx="4" fill="#10B981" />
      {/* Wallet flap */}
      <path
        d="M6 18C6 15.7909 7.79086 14 10 14H34C36.2091 14 38 15.7909 38 18V20H6V18Z"
        fill="#059669"
      />
      {/* Wallet clasp/card slot */}
      <rect x="28" y="24" width="10" height="8" rx="2" fill="#047857" />
      <circle cx="33" cy="28" r="2" fill="#10B981" />
      {/* Coin 1 - flying out top-right */}
      <circle cx="36" cy="8" r="5" fill="#FBBF24" />
      <circle cx="36" cy="8" r="3" fill="#F59E0B" />
      {/* Coin 2 */}
      <circle cx="42" cy="14" r="4" fill="#FBBF24" opacity="0.8" />
      <circle cx="42" cy="14" r="2.5" fill="#F59E0B" opacity="0.8" />
      {/* Coin 3 */}
      <circle cx="28" cy="6" r="3.5" fill="#FBBF24" opacity="0.6" />
      <circle cx="28" cy="6" r="2" fill="#F59E0B" opacity="0.6" />
      {/* Motion lines for coins */}
      <path d="M34 12L33 14" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M40 17L39 19" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Wallet stitching detail */}
      <path
        d="M10 38H34"
        stroke="#059669"
        strokeWidth="1"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
    </svg>
  );
}
