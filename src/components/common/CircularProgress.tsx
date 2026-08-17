import React from 'react';
import { Check } from 'lucide-react';

export interface CircularProgressProps {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: number;
  showValue?: boolean;
  status?: string;
  color?: string;
  trackColor?: string;
  className?: string;
  showCheckOnComplete?: boolean;
  customLabel?: string;
  animate?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 'md',
  strokeWidth = 3.5,
  showValue = true,
  status,
  color,
  trackColor,
  className = '',
  showCheckOnComplete = false,
  customLabel,
  animate = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  // Size mapping
  const sizeInPx = typeof size === 'number' ? size : {
    xs: 24,
    sm: 36,
    md: 52,
    lg: 68,
    xl: 88,
  }[size] || 52;

  // Color mapping based on status or progress value
  const getStrokeColor = (): string => {
    if (color) return color;
    if (status === 'Completed' || clampedValue === 100) return '#10b981'; // Emerald
    if (status === 'Blocked') return '#f43f5e'; // Rose
    if (status === 'On Hold') return '#f59e0b'; // Amber
    if (status === 'Planning') return '#a855f7'; // Purple
    if (clampedValue >= 75) return '#3b82f6'; // Blue
    if (clampedValue >= 40) return '#0ea5e9'; // Sky
    return '#6366f1'; // Indigo
  };

  const getTrackColor = (): string => {
    if (trackColor) return trackColor;
    return 'currentColor'; // Will use text-slate-800 or theme track
  };

  const strokeColor = getStrokeColor();
  const isComplete = clampedValue === 100 || status === 'Completed';
  const gradientId = `circ-grad-${Math.abs(clampedValue)}-${status || 'std'}-${Math.floor(Math.random() * 10000)}`;

  // Font size calculation based on component dimensions
  const getFontSize = () => {
    if (sizeInPx <= 28) return 'text-[9px]';
    if (sizeInPx <= 40) return 'text-[11px]';
    if (sizeInPx <= 56) return 'text-xs';
    if (sizeInPx <= 72) return 'text-sm';
    return 'text-base';
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: sizeInPx, height: sizeInPx }}
    >
      <svg 
        className="w-full h-full -rotate-90 transform" 
        viewBox="0 0 36 36"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} />
            <stop offset="100%" stopColor={isComplete ? '#059669' : strokeColor} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Background Track Circle */}
        <path
          className="text-slate-800/80 dark:text-slate-800/80 opacity-30 dark:opacity-40 transition-colors"
          strokeWidth={strokeWidth}
          stroke={getTrackColor()}
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        {/* Dynamic Foreground Progress Arc */}
        <path
          stroke={`url(#${gradientId})`}
          strokeDasharray={`${clampedValue}, 100`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          className={`${animate ? 'transition-all duration-700 ease-out' : ''}`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>

      {/* Center Percentage / Value Label */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          {showCheckOnComplete && isComplete ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
          ) : customLabel ? (
            <span className={`font-mono font-bold text-slate-100 dark:text-slate-100 ${getFontSize()}`}>
              {customLabel}
            </span>
          ) : (
            <span className={`font-mono font-bold text-slate-100 dark:text-slate-100 ${getFontSize()} leading-none`}>
              {clampedValue}<span className="text-[70%] opacity-80">%</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
