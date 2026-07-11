interface EmptyStateIllustrationProps {
  className?: string;
  size?: number;
}

export function EmptyStateIllustration({ className = '', size = 200 }: EmptyStateIllustrationProps) {
  const scaledHeight = (size * 160) / 200;
  return (
    <svg
      width={size}
      height={scaledHeight}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Open box - back flaps */}
      <path
        d="M60 60L80 40L100 55L120 40L140 60"
        stroke="#D99A5B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Left back flap */}
      <path d="M60 60L80 40L100 55V70L60 60Z" fill="#F3E1A0" />
      {/* Right back flap */}
      <path d="M140 60L120 40L100 55V70L140 60Z" fill="#EAD08A" />
      {/* Box body */}
      <path
        d="M60 60V120C60 122.209 61.7909 124 64 124H136C138.209 124 140 122.209 140 120V60L100 70L60 60Z"
        fill="#F7EBD6"
      />
      {/* Box left side shadow */}
      <path d="M60 60V120C60 122.209 61.7909 124 64 124H100V70L60 60Z" fill="#EAD9BE" />
      {/* Box edge lines */}
      <path d="M60 60V120C60 122.209 61.7909 124 64 124H136C138.209 124 140 122.209 140 120V60" stroke="#D99A5B" strokeWidth="2" fill="none" />
      {/* Box bottom line */}
      <path d="M70 124H130" stroke="#D99A5B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Sparkles (terracotta / olive) */}
      <path d="M45 45L47 40L49 45L54 47L49 49L47 54L45 49L40 47L45 45Z" fill="#7C3AED" opacity="0.75" />
      <path d="M152 35L154 30L156 35L161 37L156 39L154 44L152 39L147 37L152 35Z" fill="#7C3AED" opacity="0.5" />
      <path d="M160 75L161.5 71L163 75L167 76.5L163 78L161.5 82L160 78L156 76.5L160 75Z" fill="#F97316" opacity="0.6" />
      <path d="M35 80L36.5 76L38 80L42 81.5L38 83L36.5 87L35 83L31 81.5L35 80Z" fill="#F97316" opacity="0.45" />
      {/* Small dots */}
      <circle cx="50" cy="65" r="2" fill="#F4A261" opacity="0.7" />
      <circle cx="155" cy="55" r="2" fill="#F4A261" opacity="0.7" />
      <circle cx="165" cy="95" r="1.5" fill="#F4A261" opacity="0.55" />
      <circle cx="30" cy="100" r="1.5" fill="#F4A261" opacity="0.55" />

      {/* Text below */}
      <text x="100" y="148" textAnchor="middle" fontSize="12" fill="#8A7A6A" fontFamily="Inter, system-ui, sans-serif">
        Nothing here yet
      </text>
    </svg>
  );
}
