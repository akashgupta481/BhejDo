interface HeroIllustrationProps {
  className?: string;
  size?: number;
}

export function HeroIllustration({ className = '', size = 400 }: HeroIllustrationProps) {
  const height = (size * 300) / 400;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="200" cy="150" r="120" fill="#EEF2FF" opacity="0.5" />

      {/* === Left side: Sender with parcel === */}
      {/* Body */}
      <rect x="70" y="140" width="40" height="55" rx="8" fill="#4F46E5" />
      {/* Head */}
      <circle cx="90" cy="120" r="18" fill="#FDE68A" />
      {/* Hair */}
      <path
        d="M74 115C74 105 80 100 90 100C100 100 106 105 106 115"
        fill="#92400E"
      />
      {/* Arms holding box */}
      <path
        d="M70 155C60 155 55 160 55 165V175H70V155Z"
        fill="#4338CA"
      />
      <path
        d="M110 155C120 155 125 160 125 165V175H110V155Z"
        fill="#4338CA"
      />
      {/* Parcel/box being held */}
      <rect x="55" y="168" width="70" height="45" rx="4" fill="#F97316" />
      <rect x="55" y="168" width="70" height="10" rx="3" fill="#EA580C" />
      <rect x="83" y="168" width="14" height="45" fill="#C2410C" opacity="0.3" />
      {/* Legs */}
      <rect x="75" y="195" width="12" height="40" rx="4" fill="#312E81" />
      <rect x="93" y="195" width="12" height="40" rx="4" fill="#312E81" />
      {/* Shoes */}
      <ellipse cx="81" cy="237" rx="8" ry="5" fill="#1E1B4B" />
      <ellipse cx="99" cy="237" rx="8" ry="5" fill="#1E1B4B" />

      {/* === Dotted arc path connecting them === */}
      <path
        d="M130 160 C 170 80, 230 80, 270 160"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        fill="none"
      />
      {/* Small arrow on the arc */}
      <path
        d="M260 140L270 160L255 155"
        fill="#10B981"
      />
      {/* Sparkle dots along path */}
      <circle cx="160" cy="105" r="3" fill="#10B981" opacity="0.6" />
      <circle cx="200" cy="90" r="4" fill="#10B981" opacity="0.8" />
      <circle cx="240" cy="105" r="3" fill="#10B981" opacity="0.6" />

      {/* === Right side: Traveler with suitcase === */}
      {/* Body */}
      <rect x="290" y="140" width="40" height="55" rx="8" fill="#F97316" />
      {/* Head */}
      <circle cx="310" cy="120" r="18" fill="#FDE68A" />
      {/* Hair */}
      <path
        d="M295 112C296 102 302 98 310 98C318 98 324 102 325 112C325 112 322 110 310 110C298 110 295 112 295 112Z"
        fill="#451A03"
      />
      {/* Backpack */}
      <rect x="320" y="145" width="18" height="35" rx="5" fill="#EA580C" />
      <rect x="322" y="148" width="14" height="6" rx="2" fill="#C2410C" />
      {/* Arm holding suitcase */}
      <path
        d="M290 155C282 158 278 162 278 168V195"
        stroke="#EA580C"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Suitcase */}
      <rect x="265" y="190" width="28" height="38" rx="4" fill="#4F46E5" />
      <rect x="275" y="185" width="8" height="8" rx="3" fill="#3730A3" />
      <circle cx="271" cy="232" r="3" fill="#312E81" />
      <circle cx="287" cy="232" r="3" fill="#312E81" />
      {/* Legs */}
      <rect x="295" y="195" width="12" height="40" rx="4" fill="#7C2D12" />
      <rect x="313" y="195" width="12" height="40" rx="4" fill="#7C2D12" />
      {/* Shoes */}
      <ellipse cx="301" cy="237" rx="8" ry="5" fill="#451A03" />
      <ellipse cx="319" cy="237" rx="8" ry="5" fill="#451A03" />

      {/* Ground line */}
      <path
        d="M40 242H360"
        stroke="#CBD5E1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
    </svg>
  );
}
