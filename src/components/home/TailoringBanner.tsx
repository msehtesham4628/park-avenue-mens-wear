import React from 'react';
import { Scissors, Compass, Clock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const TailoringBanner: React.FC = () => {
  const { setActiveView } = useShop();

  return (
    <section className="py-24 bg-[#F9F9F8] border-y border-white/10 text-[#F8FAFC] relative overflow-hidden">
      {/* Background supplied-logo watermark */}
      <img
        src="/park-avenue-logo.svg"
        alt=""
        aria-hidden="true"
        className="absolute -right-16 -bottom-16 w-72 h-72 object-contain opacity-[0.025] pointer-events-none select-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Column: Luxury Media Placeholder */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-[#0E1526] overflow-hidden border border-white/10 shadow-2xl relative p-6 flex flex-col justify-between">
              <MediaPlaceholder
                label="PARK AVENUE MENSWEAR"
                category="BESPOKE ATELIER"
                aspectRatio="auto"
                className="w-full h-full min-h-[360px]"
                subtext="MASTER TAILORING WORKBENCH"
              />

              {/* Bottom Quote on Atelier */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md border border-white/10 shadow-lg">
                <p className="font-serif italic text-xs sm:text-sm text-slate-200 leading-snug">
                  &ldquo;A suit that does not fit with precision is merely cloth. True bespoke is sculptured architecture.&rdquo;
                </p>
                <span className="text-[9px] uppercase tracking-widest text-[#936B34] mt-1.5 block font-mono font-medium">
                  PARK AVENUE MENSWEAR · MASTER TAILORING SALON
                </span>
              </div>
            </div>
          </div>

          {/* Right Editorial Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#936B34] font-sans font-medium">
              <Scissors className="w-3.5 h-3.5" />
              <span>COMPLIMENTARY ATELIER SERVICES</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight uppercase">
              Bespoke Alterations &amp; Live Tracking
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-light">
              Every Park Avenue suit, dress pant, and shirt includes complimentary master tailoring. 
              Whether you require sleeve shortening from the shoulder, hand-stitched trouser hemming, 
              or waist suppression, our atelier records every millimeter. 
              Track your alteration milestones in real time as our craftsmen shape your garment.
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0E1526] border border-white/10 shadow-xs">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white font-medium mb-1">
                  <Scissors className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>Complimentary Hemming</span>
                </div>
                <p className="text-xs text-slate-400 font-light">
                  Specify exact inseam breaks and turn-up cuff dimensions during checkout.
                </p>
              </div>

              <div className="p-4 bg-[#0E1526] border border-white/10 shadow-xs">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>Atelier Handover</span>
                </div>
                <p className="text-xs text-slate-400 font-light">
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
                className="px-8 py-4 bg-[#936B34] hover:bg-[#7A5726] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Scissors className="w-4 h-4 text-white" />
                <span>TRACK AN ALTERATION</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('track-order');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-transparent border border-white/20 hover:border-[#936B34] text-slate-200 hover:text-[#936B34] text-xs font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#936B34]" />
                <span>TRACK RECENT ORDER</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
