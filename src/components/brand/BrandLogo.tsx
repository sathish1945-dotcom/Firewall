import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm font-semibold tracking-tight',
    md: 'text-base font-semibold tracking-tight',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Calm shield with mindful pause bars */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-slate-900 text-teal-400 shadow-sm shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Subtle shield outline */}
          <path
            d="M16 4C9 4 6 7 6 12C6 19.5 10.5 25.5 16 28C21.5 25.5 26 19.5 26 12C26 7 23 4 16 4Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pause bars representing intentional delay */}
          <line
            x1="13.5"
            y1="11"
            x2="13.5"
            y2="20"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line
            x1="18.5"
            y1="11"
            x2="18.5"
            y2="20"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`text-slate-900 ${textSizes[size]}`}>
          Impulse Firewall
        </span>
      )}
    </div>
  );
};
