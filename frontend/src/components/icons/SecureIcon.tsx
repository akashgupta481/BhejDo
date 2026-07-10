interface SecureIconProps {
  className?: string;
  size?: number;
}

export function SecureIcon({ className = '', size = 48 }: SecureIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield shape */}
      <path
        d="M24 4L8 12V22C8 33.0457 14.9543 42.4914 24 44C33.0457 42.4914 40 33.0457 40 22V12L24 4Z"
        fill="#4F46E5"
      />
      {/* Shield inner highlight */}
      <path
        d="M24 7L11 14V22C11 31.3888 16.7476 39.4627 24 41.5C31.2524 39.4627 37 31.3888 37 22V14L24 7Z"
        fill="#6366F1"
      />
      {/* Lock body */}
      <rect x="18" y="22" width="12" height="10" rx="2" fill="white" />
      {/* Lock shackle */}
      <path
        d="M20 22V18C20 15.7909 21.7909 14 24 14C26.2091 14 28 15.7909 28 18V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lock keyhole */}
      <circle cx="24" cy="26" r="2" fill="#4F46E5" />
      <path d="M23 27H25V30H23V27Z" fill="#4F46E5" />
    </svg>
  );
}
