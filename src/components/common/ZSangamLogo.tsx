import React from 'react';

interface ZSangamLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const ZSangamLogo: React.FC<ZSangamLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-white',
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subtitleSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Z Geometric Circuit Node Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
        >
          <defs>
            <linearGradient id="zsangam-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="zsangam-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background hexagon / rounded shield subtle plate */}
          <rect x="2" y="2" width="44" height="44" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

          {/* Circuit Connection Lines */}
          <path
            d="M 12 14 L 36 14 L 16 34 L 36 34"
            stroke="url(#zsangam-blue-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 12 14 L 26 24"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.6"
          />
          <path
            d="M 28 14 L 20 34"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Glowing Neural Network Node Points */}
          <circle cx="12" cy="14" r="3.2" fill="#38bdf8" />
          <circle cx="12" cy="14" r="1.5" fill="#ffffff" />

          <circle cx="36" cy="14" r="3.2" fill="#60a5fa" />
          <circle cx="36" cy="14" r="1.5" fill="#ffffff" />

          <circle cx="26" cy="24" r="2.5" fill="#93c5fd" />
          <circle cx="26" cy="24" r="1" fill="#ffffff" />

          <circle cx="16" cy="34" r="3.2" fill="#3b82f6" />
          <circle cx="16" cy="34" r="1.5" fill="#ffffff" />

          <circle cx="36" cy="34" r="3.2" fill="#2563eb" />
          <circle cx="36" cy="34" r="1.5" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight leading-none ${titleSize} ${textColor} flex items-center gap-1`}>
            <span>Z-SANGAM</span>
          </div>
          <span className={`tracking-widest uppercase font-semibold text-blue-400 opacity-90 ${subtitleSize} mt-0.5`}>
            ENTERPRISE
          </span>
        </div>
      )}
    </div>
  );
};
