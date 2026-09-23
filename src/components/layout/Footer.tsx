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
    <footer className="bg-[#06090F] border-t border-white/10 text-slate-400 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <div className="pb-12 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 border border-[#C8A97E]/50 flex items-center justify-center font-serif text-sm text-[#C8A97E] tracking-widest bg-[#0E1422] shadow-sm">
              PA
            </span>
            <span className="font-serif text-2xl tracking-[0.25em] text-white font-light uppercase">
              PARK AVENUE MENSWEAR
            </span>
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-[#C8A97E] font-medium">
            FLAGSHIP ATELIER · BESPOKE SUITING
          </div>
        </div>

        {/* 3 Columns:
            SHOP
            SERVICES
            COMPANY
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-b border-white/10">
          
          {/* Column 1: SHOP */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-white font-semibold">
              SHOP
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-slate-400">
              <li>
                <button 
                  onClick={() => handleNavCategory('New Arrivals')} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  NEW ARRIVALS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Suits')} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  SUITS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Dress Shirts')} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  DRESS SHIRTS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Dress Pants')} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  DRESS PANTS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavCategory('Ties')} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  TIES
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: SERVICES */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-white font-semibold">
              SERVICES
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-slate-400">
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-alteration');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  BESPOKE ALTERATIONS
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-order');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
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
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  CLIENT CARE
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-white font-semibold">
              COMPANY
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-slate-400">
              <li className="text-white font-medium">
                PARK AVENUE MENSWEAR
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  ABOUT
                </button>
              </li>
              <li>
                <span className="text-slate-400 hover:text-[#C8A97E] transition-colors cursor-pointer">
                  SUSTAINABILITY
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-[#C8A97E] transition-colors cursor-pointer">
                  CONTACT
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Spec */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono tracking-widest text-slate-500">
          <div>
            © PARK AVENUE MENSWEAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('pa_replay_welcome'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-[#C8A97E] cursor-pointer transition-colors"
            >
              WELCOME EXPERIENCE
            </button>
            <button 
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#C8A97E] hover:underline cursor-pointer font-medium"
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
