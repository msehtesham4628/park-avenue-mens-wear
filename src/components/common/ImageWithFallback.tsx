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
      <div className={`relative flex flex-col items-center justify-center overflow-hidden bg-[#F3F4F6] border border-gray-200 text-gray-400 p-6 ${className}`}>
        {/* Subtle tailoring drafting accent — zero logo watermark */}
        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mb-2 text-[#936B34]">
          <span className="text-xs font-serif font-semibold">PA</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 text-center">
          {fallbackTitle || category || 'Bespoke Garment'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Neutral luxury skeleton pulse while image loads — zero logo watermark */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#EFEFED] animate-pulse flex items-center justify-center z-10" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
