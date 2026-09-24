import React from 'react';

interface ParkAvenueLogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark';
  className?: string;
  theme?: 'dark' | 'light' | 'gold' | 'currentColor';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * PARK AVENUE MENSWEAR — Official Brand Identity Logo
 * Recreates the iconic atelier emblem:
 * - Walking gentleman in tailored suit
 * - Dramatic perspective shadow tapering into a tailor's sewing needle
 * - Graceful curved thread loop
 * - Classic Didone luxury serif typography "PARK AVENUE"
 * - Balanced hairline rules framing "MEN'S WEAR"
 */
export const ParkAvenueLogo: React.FC<ParkAvenueLogoProps> = ({
  variant = 'horizontal',
  className = '',
  theme = 'currentColor',
  size = 'md'
}) => {
  const getThemeColor = () => {
    switch (theme) {
      case 'dark':
        return '#111827';
      case 'light':
        return '#FFFFFF';
      case 'gold':
        return '#936B34';
      default:
        return 'currentColor';
    }
  };

  const primaryColor = getThemeColor();
  const contrastEyeColor = theme === 'light' ? '#111827' : '#FFFFFF';

  // Standalone Emblem Mark (Walking Gentleman + Perspective Needle + Thread)
  const Emblem = ({ w = 48, h = 48, showThread = true }: { w?: number; h?: number; showThread?: boolean }) => (
    <svg
      viewBox="0 0 160 160"
      width={w}
      height={h}
      fill={primaryColor}
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <g>
        {/* Gentleman Silhouette from back walking forward */}
        {/* Head */}
        <circle cx="80" cy="24" r="5.5" />
        {/* Neck */}
        <path d="M78,29 L82,29 L83,33 L77,33 Z" />
        
        {/* Tailored Suit Jacket (Shoulders, Tapered Waist, Hem) */}
        <path d="M77,33 L67,40 C64,43 62,49 61,59 L59,84 C58,86 60,88 62,88 C64,88 66,86 66,83 L68,64 L71,82 C72,87 74,90 76,91 L84,91 C86,90 88,87 89,82 L92,64 L94,83 C94,86 96,88 98,88 C100,88 102,86 101,84 L99,59 C98,49 96,43 93,40 L83,33 Z" />
        
        {/* Trousers in walking stride */}
        <path d="M75,91 L76,126 L81,126 L81,91 Z" />
        <path d="M82,91 L83,115 L86,124 L89,123 L87,112 L85,91 Z" />
        
        {/* Dress Shoes */}
        <path d="M74,126 L81,126 L80,129 L73,129 Z" />
        <path d="M86,124 L91,123 L91,127 L86,127 Z" />

        {/* Perspective Shadow transitioning downward into a sharp Tailor's Needle */}
        <polygon 
          points="75,129 89,127 106,140 100,154 94,142" 
          opacity="0.8" 
        />
        
        {/* Needle */}
        <path d="M102,126 L104,127 L95,158 C94.5,159 93.8,159 93.5,158 L99,126 Z" />
        {/* Needle Eye */}
        <ellipse cx="101" cy="132" rx="0.8" ry="2.2" fill={contrastEyeColor} transform="rotate(-15 101 132)" />

        {/* Graceful looping thread */}
        {showThread && (
          <path
            d="M101,132 C110,134 122,138 124,145 C126,152 118,155 122,158 C126,160 134,158 138,159"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );

  // Mark-only layout
  if (variant === 'mark') {
    const dim = size === 'sm' ? 32 : size === 'lg' ? 64 : size === 'xl' ? 84 : 44;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Emblem w={dim} h={dim} />
      </div>
    );
  }

  // Stacked Layout (Exact replication of official luxury mark)
  if (variant === 'stacked') {
    const scale = size === 'sm' ? 'max-w-[200px]' : size === 'lg' ? 'max-w-[340px]' : size === 'xl' ? 'max-w-[420px]' : 'max-w-[260px]';
    return (
      <div className={`flex flex-col items-center text-center ${scale} ${className}`}>
        {/* Gentleman + Needle Emblem */}
        <div className="mb-2">
          <Emblem w={size === 'lg' || size === 'xl' ? 96 : 72} h={size === 'lg' || size === 'xl' ? 96 : 72} />
        </div>

        {/* "PARK AVENUE" Serif Typography */}
        <h1 
          className="font-serif font-semibold tracking-[0.24em] uppercase text-[#111827] transition-colors leading-none"
          style={{
            fontSize: size === 'xl' ? '2.25rem' : size === 'lg' ? '1.75rem' : size === 'sm' ? '1.1rem' : '1.35rem',
            color: primaryColor
          }}
        >
          PARK AVENUE
        </h1>

        {/* Subtitle Bar with Flanking Hairlines */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 mt-1.5 opacity-90">
          <div className="h-[1px] flex-1 max-w-[50px] sm:max-w-[70px] bg-current opacity-60" style={{ backgroundColor: primaryColor }} />
          <span 
            className="font-serif tracking-[0.38em] uppercase font-light text-[9px] sm:text-[10px] whitespace-nowrap"
            style={{ color: primaryColor }}
          >
            MEN&apos;S WEAR
          </span>
          <div className="h-[1px] flex-1 max-w-[50px] sm:max-w-[70px] bg-current opacity-60" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    );
  }

  // Horizontal Layout (Ideal for Sticky Navigation Bar)
  const iconDim = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
  const titleSize = size === 'sm' ? 'text-base tracking-[0.2em]' : size === 'lg' ? 'text-2xl tracking-[0.24em]' : 'text-lg sm:text-xl tracking-[0.22em]';
  const subtitleSize = size === 'sm' ? 'text-[8px] tracking-[0.32em]' : 'text-[9px] sm:text-[10px] tracking-[0.36em]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem Icon */}
      <Emblem w={iconDim} h={iconDim} showThread={true} />

      {/* Typography Column */}
      <div className="flex flex-col text-left leading-none">
        <span 
          className={`font-serif font-medium uppercase transition-colors whitespace-nowrap ${titleSize}`}
          style={{ color: primaryColor }}
        >
          PARK AVENUE
        </span>
        
        <div className="flex items-center gap-2 mt-1 opacity-80">
          <div className="h-[1px] w-3 bg-current opacity-50" style={{ backgroundColor: primaryColor }} />
          <span 
            className={`font-serif font-light uppercase whitespace-nowrap ${subtitleSize}`}
            style={{ color: primaryColor }}
          >
            MEN&apos;S WEAR
          </span>
          <div className="h-[1px] w-3 bg-current opacity-50" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    </div>
  );
};
