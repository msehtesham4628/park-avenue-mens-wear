import React from 'react';

interface MediaPlaceholderProps {
  label?: string;
  category?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'hero' | 'wide' | 'auto';
  className?: string;
  subtext?: string;
  minimal?: boolean;
}

export const MediaPlaceholder: React.FC<MediaPlaceholderProps> = ({
  label = 'PARK AVENUE MENSWEAR',
  category,
  aspectRatio = 'portrait',
  className = '',
  subtext,
  minimal = false
}) => {
  const aspectClass = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[16/10]',
    square: 'aspect-square',
    hero: 'aspect-[21/9] sm:aspect-[16/7]',
    wide: 'aspect-[16/9]',
    auto: ''
  }[aspectRatio];

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#F8F9FA] border border-gray-200 flex flex-col items-center justify-center p-6 text-center select-none group transition-all duration-500 hover:border-[#936B34] hover:bg-[#F3F4F6] ${aspectClass} ${className}`}
    >
      {/* Background Architectural Grid & Subtle Radial Ambient */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-black/[0.03] pointer-events-none" />

      {/* Decorative Corner Brackets for Luxury Tailoring Drafting Feel */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#936B34]/60 transition-colors group-hover:border-[#936B34]" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#936B34]/60 transition-colors group-hover:border-[#936B34]" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-[#936B34]/60 transition-colors group-hover:border-[#936B34]" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-[#936B34]/60 transition-colors group-hover:border-[#936B34]" />

      {/* Supplied official Park Avenue artwork — no generated/text logo. */}
      <div className="relative z-10 flex flex-col items-center max-w-[85%]">
        <img
          src="/20260925_004137_0000.png"
          alt="Park Avenue Menswear"
          className={`${minimal ? 'w-28 sm:w-36' : 'w-36 sm:w-48'} max-h-40 object-contain mb-4 transition-transform duration-500 group-hover:scale-105`}
          loading="lazy"
        />

        {category && (
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#936B34] font-mono mb-1 font-semibold">
            {category}
          </span>
        )}

        {!minimal && (
          <div className="font-serif text-xs sm:text-sm tracking-[0.25em] text-[#111827] uppercase font-light">
            [{' '}{label}{' '}]
          </div>
        )}

        {subtext && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-2 font-mono">
            {subtext}
          </p>
        )}
      </div>

      {/* Subtle bottom indicator */}
      <div className="absolute bottom-2 text-[8px] uppercase tracking-[0.25em] text-gray-400 font-mono">
        Atelier Suiting Frame
      </div>
    </div>
  );
};
