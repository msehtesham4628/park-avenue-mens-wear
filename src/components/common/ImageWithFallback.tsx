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
      <div 
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#181A20] via-[#14151A] to-[#0E0F13] text-[#EBE8E3] border border-white/5 p-6 select-none ${className}`}
      >
        {/* Subtle luxury geometric pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Monogram emblem */}
        <div className="relative z-10 w-14 h-14 rounded-full border border-[#C5A880]/30 flex items-center justify-center bg-[#0D0E11]/80 mb-3 shadow-inner">
          <span className="font-serif text-lg tracking-widest text-[#C5A880] font-light">PA</span>
        </div>

        {category && (
          <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] text-[#C5A880]/80 font-medium mb-1">
            {category}
          </span>
        )}

        {fallbackTitle && (
          <span className="relative z-10 text-xs font-serif text-center max-w-[85%] text-[#EBE8E3]/90 tracking-wide line-clamp-2">
            {fallbackTitle}
          </span>
        )}

        <span className="relative z-10 mt-2 text-[9px] uppercase tracking-widest text-[#9E9B95]/50">
          Park Avenue Atelier
        </span>
      </div>
    );
  }

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
