import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { OFFICIAL_CATEGORIES } from '../../types';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, isAdminLoggedIn } = useShop();

  const handleNavCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#F9F9F8] border-t border-gray-200 text-gray-600 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <div className="pb-12 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ParkAvenueLogo variant="horizontal" size="md" className="text-[#111827]" />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-[#936B34] font-medium">
            HAND-CANVASSED SUITS &amp; BESPOKE TAILORING
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-b border-gray-200">
          
          {/* Column 1: SHOP (All 13 Categories) */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
              ATELIER COLLECTIONS
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-wider text-gray-600">
              {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleNavCategory(cat.queryValue)}
                  className="text-left hover:text-[#936B34] transition-colors cursor-pointer truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: SERVICES */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
              SERVICES
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-gray-600">
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-alteration');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#936B34] transition-colors cursor-pointer"
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
                  className="hover:text-[#936B34] transition-colors cursor-pointer"
                >
                  ORDER TRACKING
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('track-return');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#936B34] transition-colors cursor-pointer"
                >
                  RETURNS &amp; EXCHANGES
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
              COMPANY
            </h3>
            <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-gray-600">
              <li className="text-[#111827] font-medium">
                PARK AVENUE MENSWEAR
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#936B34] transition-colors cursor-pointer"
                >
                  ABOUT ATELIER
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('categories');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#936B34] transition-colors cursor-pointer"
                >
                  DEPARTMENTS
                </button>
              </li>
              <li>
                <span className="text-gray-600 hover:text-[#936B34] transition-colors cursor-pointer">
                  CLIENT CARE &amp; CONCIERGE
                </span>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-[#936B34] transition-colors cursor-pointer text-[#936B34] font-medium"
                >
                  ADMIN / ATELIER CONSOLE
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Spec */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono tracking-widest text-gray-500">
          <div>
            © PARK AVENUE MENSWEAR. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-[#936B34] transition-colors cursor-pointer">PRIVACY</span>
            <span className="hover:text-[#936B34] transition-colors cursor-pointer">TERMS OF COMMISSION</span>
            <button
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#936B34] hover:underline cursor-pointer"
            >
              ADMIN CONSOLE
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
