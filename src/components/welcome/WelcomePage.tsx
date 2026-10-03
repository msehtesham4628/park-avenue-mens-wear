import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const WelcomePage: React.FC = () => {
  const { continueFromWelcome } = useShop();
  const [progress, setProgress] = useState(0);
  const hasFinishedRef = useRef(false);

  const handleEnter = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    continueFromWelcome();
  };

  useEffect(() => {
    const started = Date.now();
    const duration = 750; // Smooth snappy 750ms entry

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const value = Math.min(100, (elapsed / duration) * 100);
      setProgress(value);

      if (value >= 100) {
        window.clearInterval(timer);
        handleEnter();
      }
    }, 50);

    // Guaranteed safety timeout
    const safetyTimer = window.setTimeout(() => {
      handleEnter();
    }, 950);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(safetyTimer);
    };
  }, [continueFromWelcome]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0A0D14] text-white flex items-center justify-center px-4 sm:px-6 py-10 overflow-y-auto select-none"
      aria-label="Welcome to Park Avenue Menswear"
    >
      {/* Background Image Layer with Luxury Sartorial Tint & Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/Hero_image_0.png"
          alt=""
          className="w-full h-full object-cover object-center scale-105 filter brightness-45 contrast-105"
          loading="eager"
        />
        {/* Subtle luxury vignette gradients for deep contrast and elegance */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/90 via-[#0A0D14]/75 to-[#0A0D14]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0A0D14]/50 to-[#0A0D14]/90" />
      </div>

      <section className="relative z-10 w-full max-w-3xl text-center my-auto p-6 sm:p-10 md:p-12 bg-black/45 backdrop-blur-md border border-white/15 rounded-3xl shadow-2xl">
        <div className="mx-auto mb-6 flex justify-center">
          <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl inline-block">
            <img
              src="/Park_Avenue_Logo.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/park-avenue-logo.svg';
              }}
              alt="Park Avenue Menswear"
              className="w-28 sm:w-36 max-h-24 object-contain brightness-0 invert drop-shadow-md"
            />
          </div>
        </div>

        <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.45em] text-[#E5C384] mb-3 font-medium">
          PARK AVENUE MENSWEAR
        </p>

        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.08em] font-light leading-tight text-white drop-shadow-md">
          Welcome to
          <span className="block mt-1 sm:mt-2 font-normal text-[#E5C384]">Park Avenue Mens Wear</span>
        </h1>

        <div className="mt-8 sm:mt-10 mx-auto w-full max-w-md">
          {/* Progress bar */}
          <div className="h-1.5 bg-white/20 backdrop-blur-xs overflow-hidden rounded-full shadow-inner border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#E5C384] to-[#F3E5AB] transition-[width] duration-75 ease-linear rounded-full shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-gray-300">
            <span>Entering Boutique</span>
            <span className="font-semibold text-[#E5C384]">{Math.round(progress)}%</span>
          </div>

          {/* Quick enter button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleEnter}
              className="inline-flex items-center gap-2.5 px-7 py-3 border border-[#E5C384]/70 bg-[#E5C384] text-[#0A0D14] hover:bg-white hover:text-[#0A0D14] hover:border-white transition-all text-xs font-mono font-medium tracking-[0.22em] uppercase shadow-lg cursor-pointer hover:shadow-2xl rounded-full active:scale-95"
            >
              <span>Enter Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/10">
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-gray-400">
            WEBSITE CREATED BY
          </p>
          <p className="mt-1.5 font-serif text-base sm:text-xl lg:text-2xl uppercase tracking-[0.14em] font-light text-white drop-shadow-sm">
            Zentrixasr Website
          </p>
        </div>
      </section>
    </div>
  );
};
