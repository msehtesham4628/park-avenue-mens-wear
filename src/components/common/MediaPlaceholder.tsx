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
      className={`relative w-full overflow-hidden bg-[#0C1220] border border-white/10 flex flex-col items-center justify-center p-6 text-center select-none group transition-all duration-500 hover:border-[#C8A97E] hover:bg-[#10172A] ${aspectClass} ${className}`}
    >
      {/* Background Architectural Grid & Subtle Radial Ambient */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E293B]/20 to-black/40 pointer-events-none" />

      {/* Decorative Corner Brackets for Luxury Tailoring Drafting Feel */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-[#C8A97E]/50 transition-colors group-hover:border-[#C8A97E]" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-[#C8A97E]/50 transition-colors group-hover:border-[#C8A97E]" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-[#C8A97E]/50 transition-colors group-hover:border-[#C8A97E]" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-[#C8A97E]/50 transition-colors group-hover:border-[#C8A97E]" />

      {/* Center Monogram / Brand Block */}
      <div className="relative z-10 flex flex-col items-center max-w-[85%]">
        {!minimal && (
          <div className="w-10 h-10 mb-3 rounded-none border border-[#C8A97E]/50 flex items-center justify-center font-serif text-sm text-[#C8A97E] tracking-widest bg-[#090D16] shadow-md transition-transform group-hover:scale-105 duration-500">
            PA
          </div>
        )}

        {category && (
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#C8A97E] font-mono mb-1 font-medium">
            {category}
          </span>
        )}

        <div className="font-serif text-xs sm:text-sm tracking-[0.25em] text-white uppercase font-light">
          [{' '}{label}{' '}]
        </div>

        {subtext && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2 font-mono">
            {subtext}
          </p>
        )}
      </div>

      {/* Subtle bottom indicator */}
      <div className="absolute bottom-2 text-[8px] uppercase tracking-[0.25em] text-slate-500 font-mono">
        Atelier Suiting Frame
      </div>
    </div>
  );
};
