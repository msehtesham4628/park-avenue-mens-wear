import React from 'react';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory } = useShop();

  const handleNavCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-black/10 text-[#666666] pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <div className="pb-12 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-sm text-[#8C6D3B] tracking-widest bg-white shadow-xs">
              PA
            </span>
            <span className="font-serif text-2xl tracking-[0.25em] text-[#111111] font-light uppercase">
              PARK AVENUE MENSWEAR
            </span>
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-medium">
            NEW YORK · USA
          </div>
        </div>

        {/* 3 Columns:
            SHOP
            SERVICES
            COMPANY
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-b border-black/10">
          
          {/* Column 1: SHOP */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
              SHOP
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-[#555555]">
              <li>
                <button 
                  onClick={() => handleNavCategory('New Arrivals')} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  NEW ARRIVALS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Suits')} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  SUITS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Dress Shirts')} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  DRESS SHIRTS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Dress Pants')} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  DRESS PANTS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Ties')} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  TIES
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: SERVICES */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
              SERVICES
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-[#555555]">
              <li>
                <button 
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 1000, behavior: 'smooth' });
                  }}
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  BESPOKE TAILORING
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-alteration');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  ALTERATIONS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-order');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  ORDER TRACKING
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  CLIENT CARE
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111111] font-semibold">
              COMPANY
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-[#555555]">
              <li className="text-[#111111] font-medium">
                PARK AVENUE MENSWEAR
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#8C6D3B] transition-colors cursor-pointer"
                >
                  ABOUT
                </button>
              </li>
              <li>
                <span className="text-[#666666] hover:text-[#8C6D3B] transition-colors cursor-pointer">
                  SUSTAINABILITY
                </span>
              </li>
              <li>
                <span className="text-[#666666] hover:text-[#8C6D3B] transition-colors cursor-pointer">
                  CONTACT
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Spec:
            © PARK AVENUE MENSWEAR. ALL RIGHTS RESERVED. */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono tracking-widest text-[#777777]">
          <div>
            © PARK AVENUE MENSWEAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('pa_replay_welcome'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#666666] hover:text-[#8C6D3B] cursor-pointer transition-colors"
            >
              WELCOME EXPERIENCE
            </button>
            <button 
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#8C6D3B] hover:underline cursor-pointer font-medium"
            >
              ADMIN PORTAL
            </button>
            <span>PRIVACY</span>
            <span>TERMS OF COMMISSION</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
