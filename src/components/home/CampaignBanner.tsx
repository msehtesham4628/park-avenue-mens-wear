import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const CampaignBanner: React.FC = () => {
  const { setSelectedCategory, setActiveView } = useShop();

  const handleExplore = () => {
    setSelectedCategory('All');
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Campaign Container */}
        <div className="border border-gray-200 bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden items-stretch shadow-xl rounded-2xl sm:rounded-3xl">
          
          {/* Left Column: Premium Editorial Campaign Visual */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] overflow-hidden bg-[#0F141E] border-b lg:border-b-0 lg:border-r border-gray-200 group">
            <img
              src="/campaign_model.png"
              alt="Park Avenue Bespoke Menswear Campaign"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                AUTUMN / WINTER SARTORIAL EXHIBIT
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Text & Action */}
          <div className="lg:col-span-5 p-8 sm:p-14 flex flex-col justify-center space-y-8 bg-white">
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] block font-semibold">
                PARK AVENUE MENSWEAR
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-light tracking-wide text-[#111827] uppercase leading-[1.15]">
                MODERN.
                <span className="block italic text-[#936B34]">REFINED.</span>
                <span className="block">TIMELESS.</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light tracking-wider uppercase font-sans">
              Precision craftsmanship meets contemporary masculine silhouettes. Every cut, lapel, and stitch reflects the pinnacle of bespoke tailoring.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExplore}
                className="w-full sm:w-auto px-8 py-4 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-md rounded-full active:scale-95"
              >
                <span>EXPLORE PARK AVENUE MENSWEAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Atelier Details */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <span>Bespoke Standards</span>
              <span className="text-[#936B34] font-semibold">Full Canvas</span>
              <span>Hand Finished</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
