import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  category?: string;
}

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
          src="/20260925_004137_0000.png"
          alt="Park Avenue Menswear"
          className="w-full h-full object-contain p-8"
        />
        <span className="sr-only">{fallbackTitle || category || 'Park Avenue Menswear'}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton / Shimmer placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#16181E] animate-pulse flex items-center justify-center">
          <span className="font-serif text-xs tracking-widest text-[#C5A880]/40">PA</span>
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
