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
      {/* Subtle atelier background — no hero card/container */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-[#FAF3E8]/80 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[600px] h-[380px] bg-[#936B34]/5 rounded-full blur-[130px]" />
        <div className="absolute inset-0 max-w-7xl mx-auto border-x border-black/[0.04]" />
      </div>

      {/* Official supplied logo only — no PA square, no fake logo, no bordered hero container */}
      <div className="relative z-10 w-full flex items-center justify-center px-6 sm:px-8">
        <img
          src="/Park_Avenue_Logo.png"
          alt="Park Avenue Menswear"
          className="w-[210px] sm:w-[280px] md:w-[340px] lg:w-[390px] max-h-[46vh] object-contain"
          fetchPriority="high"
        />
      </div>

      <div className="relative z-10 mt-12 flex flex-col items-center justify-center">
        <button
          onClick={scrollToNext}
          aria-label="Scroll to collection"
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#936B34] bg-white text-[#936B34] hover:text-black transition-all flex items-center justify-center shadow-sm cursor-pointer group"
        >
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 border-b border-gray-200" />
    </section>
  );
};
