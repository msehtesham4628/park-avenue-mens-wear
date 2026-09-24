import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToNext = () => {
    const el = document.getElementById('category-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[96vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FFFFFF] to-[#F8F9FA] pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20">
      {/* Background Architectural Canvas & Textures - Sartorial White Suiting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fine luxury pinstripe drafting weave */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient subtle light wells - Warm Champagne & Sartorial Bronze */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-[#FAF3E8]/80 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[600px] h-[380px] bg-[#936B34]/5 rounded-full blur-[130px]" />

        {/* Geometric Atelier Drafting Lines */}
        <div className="absolute inset-0 max-w-7xl mx-auto border-x border-black/[0.04]" />
        <div className="absolute top-1/4 inset-x-0 border-t border-black/[0.03]" />
        <div className="absolute top-3/4 inset-x-0 border-t border-black/[0.03]" />
      </div>

      {/* Main Architectural Visual Composition - Strictly Zero Text */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center">
        
        {/* Large Architectural Fashion Podium / Frame (No Text) */}
        <div className="w-full aspect-[16/10] sm:aspect-[21/9] max-h-[580px] bg-white/95 border border-gray-200 shadow-xl relative p-6 sm:p-10 flex items-center justify-center transition-all duration-700 hover:shadow-2xl group backdrop-blur-xs">
          
          {/* Atelier Precision Corner Brass Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#936B34] transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#936B34] transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#936B34] transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#936B34] transition-transform duration-300 group-hover:scale-110" />

          {/* Precision Tailor Silhouette Drafting Lines (SVG Graphic - Pure Visual Aesthetics, Zero Text) */}
          <svg 
            className="w-full h-full max-w-2xl max-h-[400px] text-gray-900/[0.08] group-hover:text-gray-900/[0.14] transition-colors duration-500" 
            viewBox="0 0 600 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Center vertical symmetry axis */}
            <line x1="300" y1="20" x2="300" y2="280" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Shoulder and chest golden-ratio guidelines */}
            <line x1="160" y1="60" x2="440" y2="60" stroke="currentColor" strokeWidth="0.8" />
            <line x1="190" y1="120" x2="410" y2="120" stroke="currentColor" strokeWidth="0.8" />
            <line x1="220" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="0.8" />
            
            {/* Tailored lapel and canvas drape diagonals */}
            <path d="M 230 60 L 300 170 L 370 60" stroke="#936B34" strokeWidth="1.2" strokeOpacity="0.75" fill="none" />
            <path d="M 200 60 L 270 230" stroke="#936B34" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
            <path d="M 400 60 L 330 230" stroke="#936B34" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
            
            {/* Outer silhouette contour */}
            <path 
              d="M 170 80 Q 210 50 300 50 Q 390 50 430 80 L 415 250 L 185 250 Z" 
              stroke="currentColor" 
              strokeWidth="1.2" 
              fill="none" 
            />

            {/* Precision crosshair registration marks */}
            <g stroke="#936B34" strokeWidth="1" strokeOpacity="0.8">
              <path d="M 160 55 L 160 65 M 155 60 L 165 60" />
              <path d="M 440 55 L 440 65 M 435 60 L 445 60" />
              <path d="M 300 15 L 300 25 M 295 20 L 305 20" />
              <path d="M 300 275 L 300 285 M 295 280 L 305 280" />
            </g>

            {/* Concentric proportion circles */}
            <circle cx="300" cy="150" r="80" stroke="#936B34" strokeWidth="0.75" strokeDasharray="6 6" strokeOpacity="0.45" />
            <circle cx="300" cy="150" r="130" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
          </svg>

          {/* Official supplied Park Avenue PNG logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/20260925_004137_0000.png"
              alt="Park Avenue Menswear"
              className="w-40 sm:w-56 lg:w-64 max-h-[55%] object-contain drop-shadow-xl transform transition-transform duration-500 group-hover:scale-105"
            />
          </div>

        </div>

      </div>

      {/* Downward Pure Visual Indicator (No Text) */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <button
          onClick={scrollToNext}
          aria-label="Scroll to collection"
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#936B34] bg-white text-[#936B34] hover:text-black transition-all flex items-center justify-center shadow-sm cursor-pointer group"
        >
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* Bottom Fine Line */}
      <div className="absolute bottom-0 inset-x-0 border-b border-gray-200" />
    </section>
  );
};
