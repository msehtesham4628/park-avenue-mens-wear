import React from 'react';
import { Scissors, Compass, Clock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const TailoringBanner: React.FC = () => {
  const { setActiveView } = useShop();

  return (
    <section className="py-24 bg-[#FAF9F6] border-y border-black/10 text-[#111111] relative overflow-hidden">
      {/* Background Subtle Watermark */}
      <div className="absolute -right-12 -bottom-12 select-none pointer-events-none font-serif text-[180px] font-bold text-black/[0.02] tracking-tighter">
        PA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Column: Luxury Media Placeholder (No Image) */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-white overflow-hidden border border-black/10 shadow-lg relative p-6 flex flex-col justify-between">
              <MediaPlaceholder
                label="PARK AVENUE MENSWEAR"
                category="BESPOKE ATELIER"
                aspectRatio="auto"
                className="w-full h-full min-h-[360px]"
                subtext="MASTER TAILORING WORKBENCH"
              />

              {/* Bottom Quote on Atelier */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md border border-black/10 shadow-sm">
                <p className="font-serif italic text-xs sm:text-sm text-[#111111] leading-snug">
                  &ldquo;A suit that does not fit with precision is merely cloth. True bespoke is sculptured architecture.&rdquo;
                </p>
                <span className="text-[9px] uppercase tracking-widest text-[#8C6D3B] mt-1.5 block font-mono font-medium">
                  PARK AVENUE MENSWEAR · MASTER TAILORING SALON
                </span>
              </div>
            </div>
          </div>

          {/* Right Editorial Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#8C6D3B] font-sans font-medium">
              <Scissors className="w-3.5 h-3.5" />
              <span>COMPLIMENTARY ATELIER SERVICES</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-light leading-tight uppercase">
              Bespoke Alterations &amp; Live Tracking
            </h2>

            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xl font-light">
              Every Park Avenue suit, dress pant, and shirt includes complimentary master tailoring. 
              Whether you require sleeve shortening from the shoulder, hand-stitched trouser hemming, 
              or waist suppression, our atelier records every millimeter. 
              Track your alteration milestones in real time as our craftsmen shape your garment.
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-black/10 shadow-xs">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#111111] font-medium mb-1">
                  <Scissors className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Complimentary Hemming</span>
                </div>
                <p className="text-xs text-[#666666] font-light">
                  Specify exact inseam breaks and turn-up cuff dimensions during checkout.
                </p>
              </div>

              <div className="p-4 bg-white border border-black/10 shadow-xs">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#111111] font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Atelier Handover</span>
                </div>
                <p className="text-xs text-[#666666] font-light">
                  Accelerated atelier turnaround with real-time status updates and notifications.
                </p>
              </div>
            </div>

            {/* Dual CTAs for Order & Alteration Tracking */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => {
                  setActiveView('track-alteration');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-[#111111] hover:bg-[#8C6D3B] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Scissors className="w-4 h-4 text-[#8C6D3B]" />
                <span>TRACK AN ALTERATION</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('track-order');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white border border-black/20 hover:border-black text-xs uppercase tracking-[0.2em] text-[#111111] hover:text-[#8C6D3B] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4 text-[#8C6D3B]" />
                <span>TRACK AN ORDER</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
