import React from 'react';

interface ParkAvenueLogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark';
  className?: string;
  theme?: 'dark' | 'light' | 'gold' | 'currentColor';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Park Avenue Menswear logo.
 * The supplied PNG in /public is the single source of truth for branding.
 */
export const ParkAvenueLogo: React.FC<ParkAvenueLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md'
}) => {
  const logoSource = '/Park_Avenue_Logo.png';

  if (variant === 'mark') {
    const dim = size === 'sm' ? 36 : size === 'lg' ? 72 : size === 'xl' ? 96 : 52;
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={logoSource}
          alt="Park Avenue Menswear"
          width={dim}
          height={dim}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    const width = size === 'sm' ? 180 : size === 'lg' ? 320 : size === 'xl' ? 400 : 240;
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ maxWidth: width }}>
        <img
          src={logoSource}
          alt="Park Avenue Menswear"
          className="w-full h-auto max-h-40 object-contain"
        />
      </div>
    );
  }

  const width = size === 'sm' ? 140 : size === 'lg' ? 220 : size === 'xl' ? 260 : 175;
  return (
    <div className={`flex items-center select-none shrink-0 ${className}`} style={{ width, minWidth: width }}>
      <img
        src={logoSource}
        alt="Park Avenue Menswear"
        className="w-full h-auto max-h-14 object-contain object-left"
      />
    </div>
  );
};
