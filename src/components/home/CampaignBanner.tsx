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
          
          {/* Left Column: Premium Placeholder Area */}
          <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-8 bg-[#F8F9FA] border-b lg:border-b-0 lg:border-r border-gray-200">
            <MediaPlaceholder
              label="PARK AVENUE MENSWEAR"
              category="EDITORIAL CAMPAIGN"
              aspectRatio="auto"
              className="w-full h-full min-h-[340px] sm:min-h-[420px]"
              subtext="AUTUMN / WINTER TAILORING EXHIBIT"
            />
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
