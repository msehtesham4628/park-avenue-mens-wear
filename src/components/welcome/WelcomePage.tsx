import React from 'react';
import { useShop } from '../../context/ShopContext';

export const WelcomePage: React.FC = () => {
  const { setActiveView } = useShop();

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#111827] flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-5xl text-center border border-[#936B34]/25 bg-white px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 shadow-sm">
        <img
          src="/Park_Avenue_Logo.png"
          alt="Park Avenue Menswear"
          className="mx-auto mb-10 w-32 sm:w-44 max-h-32 object-contain"
        />

        <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.4em] text-[#936B34] mb-6">
          PARK AVENUE MENSWEAR
        </p>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl uppercase tracking-[0.08em] font-light leading-[1.05]">
          Welcome to
          <span className="block mt-3">Park Avenue</span>
          <span className="block mt-3">Mens Wear</span>
        </h1>

        <div className="my-12 mx-auto h-px w-32 bg-[#936B34]" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 max-w-3xl mx-auto">
          <div className="border border-gray-200 px-5 py-7">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">Total</p>
            <p className="font-serif text-4xl sm:text-5xl">$500</p>
          </div>

          <div className="border border-gray-200 px-5 py-7">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">Paid</p>
            <p className="font-serif text-4xl sm:text-5xl">$200</p>
          </div>

          <div className="border border-[#936B34]/50 bg-[#FAF3E8] px-5 py-7">
            <p className="text-xs uppercase tracking-[0.25em] text-[#936B34] mb-3">Remaining</p>
            <p className="font-serif text-4xl sm:text-5xl">$300</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('shop')}
          className="mt-12 border border-[#111827] px-8 py-4 text-sm uppercase tracking-[0.25em] hover:bg-[#111827] hover:text-white transition-colors"
        >
          Enter Website →
        </button>

        <div className="mt-16 pt-10 border-t border-gray-200">
          <p className="font-mono text-sm sm:text-base uppercase tracking-[0.28em] text-gray-500 mb-4">
            WEBSITE CREATED BY
          </p>
          <p className="font-serif text-4xl sm:text-6xl lg:text-7xl uppercase tracking-[0.12em] font-light text-[#111827]">
            Zentrixasr Website
          </p>
        </div>
      </section>
    </main>
  );
};
