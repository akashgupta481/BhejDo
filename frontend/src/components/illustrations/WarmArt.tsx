/*
 * WarmArt — lightweight, playful SVG illustrations for the BhejDo delivery UI.
 * Pure SVG + CSS animation classes (defined in index.css). No dependencies.
 */
import type { CSSProperties } from 'react';

type ArtProps = { className?: string; style?: CSSProperties };

/* Soft floating cloud */
export function Cloud({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden>
      <g fill="#FFFFFF" opacity="0.9">
        <ellipse cx="40" cy="38" rx="30" ry="18" />
        <ellipse cx="66" cy="30" rx="24" ry="20" />
        <ellipse cx="86" cy="40" rx="22" ry="15" />
        <rect x="20" y="38" width="76" height="16" rx="8" />
      </g>
    </svg>
  );
}

/* Cute parcel box with tape + smile */
export function Parcel({ className = '', style, face = true }: ArtProps & { face?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="pclTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7D9AE" />
          <stop offset="100%" stopColor="#E9C46A" />
        </linearGradient>
        <linearGradient id="pclBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFB985" />
          <stop offset="100%" stopColor="#D99A5B" />
        </linearGradient>
      </defs>
      <polygon points="50,10 88,28 50,46 12,28" fill="url(#pclTop)" />
      <polygon points="12,28 50,46 50,90 12,72" fill="url(#pclBody)" />
      <polygon points="88,28 50,46 50,90 88,72" fill="#C9884B" />
      <polygon points="50,46 50,90 45,88 45,48" fill="#6D28D9" opacity="0.35" />
      {/* tape */}
      <polygon points="50,10 62,16 50,22 38,16" fill="#7C3AED" />
      <polygon points="50,22 50,46 44,43 44,19" fill="#7C3AED" opacity="0.85" />
      <polygon points="50,22 50,46 56,43 56,19" fill="#EA580C" opacity="0.85" />
      {face && (
        <g>
          <circle cx="34" cy="58" r="3" fill="#2B2D42" />
          <circle cx="50" cy="64" r="3" fill="#2B2D42" />
          <path d="M32 68 Q42 76 52 70" stroke="#2B2D42" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="66" r="3.5" fill="#C9AEF7" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

/* Location pin with pulsing ring */
export function Pin({ className = '', style, color = '#7C3AED' }: ArtProps & { color?: string }) {
  return (
    <svg viewBox="0 0 80 96" className={className} style={style} aria-hidden>
      <ellipse cx="40" cy="88" rx="18" ry="5" fill="#2B2D42" opacity="0.12" />
      <g className="pin-pop">
        <path d="M40 8 C22 8 10 22 10 40 C10 62 40 84 40 84 C40 84 70 62 70 40 C70 22 58 8 40 8 Z" fill={color} />
        <circle cx="40" cy="38" r="12" fill="#FFF8F2" />
        <circle cx="40" cy="38" r="5" fill={color} />
      </g>
    </svg>
  );
}

/* Delivery scooter courier with spinning wheels */
export function ScooterCourier({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 260 200" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="scBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBA470" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      {/* ground shadow */}
      <ellipse cx="130" cy="182" rx="96" ry="10" fill="#2B2D42" opacity="0.10" />

      <g className="scoot-idle">
        {/* delivery box */}
        <rect x="30" y="78" width="52" height="46" rx="8" fill="url(#scBox)" />
        <rect x="42" y="70" width="28" height="12" rx="4" fill="#6D28D9" />
        <path d="M44 101 h24 M56 90 v22" stroke="#FFF3EC" strokeWidth="3" strokeLinecap="round" />

        {/* scooter body */}
        <path d="M96 150 q-10 -46 -34 -46 h-18" fill="none" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round" />
        <path d="M150 150 h-70 q-8 0 -8 -8 v-6 q0 -6 8 -6 h58 l22 -26" fill="#8B5CF6" />
        <rect x="150" y="96" width="12" height="34" rx="5" fill="#2B2D42" />
        <circle cx="156" cy="92" r="7" fill="#E9C46A" />

        {/* rider */}
        <circle cx="120" cy="66" r="16" fill="#F7C9A3" />
        <path d="M104 62 a16 16 0 0 1 32 0 l-4 -2 h-24 z" fill="#7C3AED" />
        <rect x="112" y="80" width="18" height="30" rx="8" fill="#7C3AED" />
        <path d="M128 96 l24 8" stroke="#F7C9A3" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* wheels */}
      <g>
        <circle cx="80" cy="160" r="24" fill="#2B2D42" />
        <circle cx="80" cy="160" r="10" fill="#DBCBBA" />
        <g className="wheel-spin" style={{ transformOrigin: '80px 160px' }}>
          <path d="M80 142 v36 M62 160 h36 M68 148 l24 24 M92 148 l-24 24" stroke="#8A7A6A" strokeWidth="3" />
        </g>
      </g>
      <g>
        <circle cx="192" cy="160" r="24" fill="#2B2D42" />
        <circle cx="192" cy="160" r="10" fill="#DBCBBA" />
        <g className="wheel-spin" style={{ transformOrigin: '192px 160px' }}>
          <path d="M192 142 v36 M174 160 h36 M180 148 l24 24 M204 148 l-24 24" stroke="#8A7A6A" strokeWidth="3" />
        </g>
      </g>
    </svg>
  );
}

/* Delivery truck */
export function Truck({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 240 150" className={className} style={style} aria-hidden>
      <ellipse cx="120" cy="134" rx="100" ry="8" fill="#2B2D42" opacity="0.10" />
      <rect x="20" y="52" width="120" height="66" rx="10" fill="#FFFFFF" stroke="#ECE1D4" strokeWidth="2" />
      <path d="M20 70 h120 M20 92 h120" stroke="#F1E4D6" strokeWidth="2" />
      <path d="M140 70 h44 l24 26 v22 h-68 z" fill="#7C3AED" />
      <rect x="150" y="76" width="26" height="18" rx="4" fill="#FFF3EC" />
      <circle cx="66" cy="120" r="17" fill="#2B2D42" /><circle cx="66" cy="120" r="7" fill="#DBCBBA" />
      <circle cx="176" cy="120" r="17" fill="#2B2D42" /><circle cx="176" cy="120" r="7" fill="#DBCBBA" />
      <rect x="40" y="66" width="26" height="26" rx="6" fill="#E9C46A" />
    </svg>
  );
}

/* Little delivery drone carrying a parcel */
export function Drone({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} style={style} aria-hidden>
      <rect x="58" y="40" width="44" height="16" rx="8" fill="#7C3AED" />
      <circle cx="80" cy="48" r="6" fill="#E9C46A" />
      <path d="M58 44 H22 M102 44 H138" stroke="#2B2D42" strokeWidth="4" strokeLinecap="round" />
      <g className="wheel-spin" style={{ transformOrigin: '22px 44px' }}>
        <ellipse cx="22" cy="44" rx="18" ry="4" fill="#8B5CF6" opacity="0.85" />
      </g>
      <g className="wheel-spin" style={{ transformOrigin: '138px 44px' }}>
        <ellipse cx="138" cy="44" rx="18" ry="4" fill="#8B5CF6" opacity="0.85" />
      </g>
      <line x1="80" y1="56" x2="80" y2="70" stroke="#8A7A6A" strokeWidth="2" />
      <rect x="66" y="70" width="28" height="24" rx="5" fill="#7C3AED" />
      <path d="M80 70 v24 M66 82 h28" stroke="#FFF3EC" strokeWidth="2.5" />
    </svg>
  );
}

/* Happy customer receiving a parcel (simple, warm) */
export function HappyCustomer({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 180 200" className={className} style={style} aria-hidden>
      <ellipse cx="90" cy="188" rx="66" ry="8" fill="#2B2D42" opacity="0.10" />
      <rect x="54" y="120" width="72" height="66" rx="18" fill="#7C3AED" />
      <circle cx="90" cy="78" r="30" fill="#F7C9A3" />
      <path d="M60 74 a30 30 0 0 1 60 0 l-6 -6 h-48 z" fill="#2B2D42" />
      <circle cx="80" cy="80" r="3.2" fill="#2B2D42" />
      <circle cx="100" cy="80" r="3.2" fill="#2B2D42" />
      <path d="M78 90 q12 10 24 0" stroke="#2B2D42" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="72" cy="88" r="4" fill="#C9AEF7" opacity="0.6" />
      <circle cx="108" cy="88" r="4" fill="#C9AEF7" opacity="0.6" />
      {/* arms holding parcel */}
      <path d="M60 128 l-2 -22" stroke="#F7C9A3" strokeWidth="12" strokeLinecap="round" />
      <path d="M120 128 l2 -22" stroke="#F7C9A3" strokeWidth="12" strokeLinecap="round" />
      <g className="bob-parcel" style={{ transformOrigin: '90px 112px' }}>
        <rect x="66" y="94" width="48" height="40" rx="7" fill="#E9C46A" />
        <path d="M90 94 v40 M66 114 h48" stroke="#7C3AED" strokeWidth="4" />
      </g>
    </svg>
  );
}

/* Empty-state: parcel with a magnifier / waiting rider */
export function EmptyBox({ className = '', style }: ArtProps) {
  return (
    <svg viewBox="0 0 200 160" className={className} style={style} aria-hidden>
      <ellipse cx="100" cy="146" rx="70" ry="8" fill="#2B2D42" opacity="0.08" />
      <polygon points="100,40 150,60 100,80 50,60" fill="#F3E1A0" />
      <polygon points="50,60 100,80 100,132 50,112" fill="#E9C46A" />
      <polygon points="150,60 100,80 100,132 150,112" fill="#D9A94B" />
      <path d="M100 40 l0 40" stroke="#7C3AED" strokeWidth="4" opacity="0.6" />
      <circle cx="100" cy="60" r="0" />
      {/* dashed search line */}
      <path d="M40 30 q40 -20 120 6" stroke="#7C3AED" strokeWidth="2.5" fill="none" strokeDasharray="4 7" strokeLinecap="round" opacity="0.6" />
      <g className="float-soft">
        <circle cx="150" cy="34" r="12" fill="none" stroke="#7C3AED" strokeWidth="4" />
        <line x1="159" y1="43" x2="168" y2="52" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
