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
      className="fixed inset-0 z-[100] bg-[#FAF8F5] text-[#111827] flex items-center justify-center px-6 py-12 overflow-y-auto select-none"
      aria-label="Welcome to Park Avenue Menswear"
    >
      <section className="w-full max-w-4xl text-center my-auto">
        <img
          src="/Park_Avenue_Logo.png"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/park-avenue-logo.svg';
          }}
          alt="Park Avenue Menswear"
          className="mx-auto mb-8 w-36 sm:w-52 max-h-36 object-contain"
        />

        <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.45em] text-[#936B34] mb-6 font-medium">
          PARK AVENUE MENSWEAR
        </p>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl uppercase tracking-[0.08em] font-light leading-[1.15]">
          Welcome to
          <span className="block mt-2 font-normal text-[#1B2A4A]">Park Avenue Mens Wear</span>
        </h1>

        <div className="mt-12 mx-auto w-full max-w-md">
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 overflow-hidden rounded-full shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#B8860B] to-[#936B34] transition-[width] duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500">
            <span>Entering Boutique</span>
            <span className="font-semibold text-[#936B34]">{Math.round(progress)}%</span>
          </div>

          {/* Quick enter button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleEnter}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#936B34]/60 bg-white text-[#111827] hover:bg-[#936B34] hover:text-white transition-all text-xs font-mono tracking-[0.2em] uppercase shadow-sm cursor-pointer hover:shadow-md"
            >
              <span>Enter Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-14">
          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.28em] text-gray-400">
            WEBSITE CREATED BY
          </p>
          <p className="mt-2 font-serif text-xl sm:text-3xl lg:text-4xl uppercase tracking-[0.12em] font-light text-[#111827]">
            Zentrixasr Website
          </p>
        </div>
      </section>
    </div>
  );
};
