import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  category?: string;
}

const BRAND_LOGO = '/Park_Avenue_Logo.png';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Park Avenue Menswear',
  className = '',
  fallbackTitle,
  category,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-[#F8F9FA] border border-gray-200 ${className}`}>
        <img
          src={BRAND_LOGO}
          alt="Park Avenue Menswear"
          className="w-full h-full object-contain p-8"
        />
        <span className="sr-only">{fallbackTitle || category || 'Park Avenue Menswear'}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Supplied Park Avenue PNG while the real product image loads. */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F8F9FA] flex items-center justify-center z-10">
          <img
            src={BRAND_LOGO}
            alt=""
            aria-hidden="true"
            className="w-24 sm:w-32 max-h-24 object-contain opacity-80"
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
