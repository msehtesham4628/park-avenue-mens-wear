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

  const logoSource = '/20260925_004137_0000.png';

  // Use the supplied Park Avenue artwork as the single source of truth for
  // the brand mark. Keeping it as an image prevents the header/favicon from
  // drifting away from the client's supplied artwork.
  if (variant === 'mark') {
    const dim = size === 'sm' ? 32 : size === 'lg' ? 64 : size === 'xl' ? 84 : 44;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img src={logoSource} alt="Park Avenue Menswear" width={dim} height={dim} className="object-contain" />
      </div>
    );
  }

  if (variant === 'stacked') {
    const width = size === 'sm' ? 200 : size === 'lg' ? 340 : size === 'xl' ? 420 : 260;
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ maxWidth: width }}>
        <img src={logoSource} alt="Park Avenue Menswear" className="w-full h-auto max-h-40 object-contain" />
      </div>
    );
  }

  const width = size === 'sm' ? 150 : size === 'lg' ? 220 : 190;
  return (
    <div className={`flex items-center select-none ${className}`} style={{ width }}>
      <img src={logoSource} alt="Park Avenue Menswear" className="w-full h-auto max-h-14 object-contain object-left" />
    </div>
  );
};
