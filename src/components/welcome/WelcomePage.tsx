import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';

export const WelcomePage: React.FC = () => {
  const { continueFromWelcome } = useShop();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 2800;

    const timer = window.setInterval(() => {
      const value = Math.min(100, ((Date.now() - started) / duration) * 100);
      setProgress(value);

      if (value >= 100) {
        window.clearInterval(timer);
        continueFromWelcome();
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [continueFromWelcome]);

  return (
    <main
      className="min-h-screen bg-[#FAF8F5] text-[#111827] flex items-center justify-center px-6"
      aria-label="Loading Park Avenue Menswear"
    >
      <section className="w-full max-w-5xl text-center">
        <img
          src="/Park_Avenue_Logo.png"
          alt="Park Avenue Menswear"
          className="mx-auto mb-10 w-36 sm:w-48 max-h-36 object-contain"
        />

        <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.4em] text-[#936B34] mb-7">
          PARK AVENUE MENSWEAR
        </p>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-8xl uppercase tracking-[0.08em] font-light leading-[1.05]">
          Welcome to
          <span className="block mt-3">Park Avenue Mens Wear</span>
        </h1>

        <div className="mt-14 mx-auto w-full max-w-md">
          <div className="h-px bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[#936B34] transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500">
            <span>Loading</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="mt-16">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.28em] text-gray-500">
            WEBSITE CREATED BY
          </p>
          <p className="mt-3 font-serif text-2xl sm:text-4xl lg:text-5xl uppercase tracking-[0.12em] font-light">
            Zentrixasr Website
          </p>
        </div>
      </section>
    </main>
  );
};
