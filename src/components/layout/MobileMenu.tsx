import React from 'react';
import { X, Search, Heart, User, Shield, Compass, Scissors } from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const {
    setActiveView,
    setSelectedCategory,
    setIsSearchOpen,
    wishlist,
    unreadNotificationCount,
    setIsNotificationsOpen,
    toggleAdminMode
  } = useShop();

  if (!isOpen) return null;

  const handleNav = (view: AppView, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setActiveView(view);
    onClose();
  };

  const navCategories = [
    { label: 'Suits & Tailoring', category: 'Suits' },
    { label: 'Dress Shirts', category: 'Dress Shirts' },
    { label: 'Dress Pants', category: 'Dress Pants' },
    { label: 'Artisanal Ties', category: 'Ties' },
    { label: 'New Arrivals', category: 'New Arrivals' },
    { label: 'All Menswear', category: 'All' }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-[#090D16] border-r border-white/10 shadow-2xl flex flex-col z-50 text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#06090F]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-[0.2em] font-medium text-white">
              PARK AVENUE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C8A97E] font-sans border border-[#C8A97E]/40 px-1.5 py-0.5">
              PA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search trigger */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0B0F1A]">
          <button
            onClick={() => {
              onClose();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#111726] border border-white/10 text-sm text-slate-400 hover:border-[#C8A97E] transition-colors text-left cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#C8A97E]" />
            <span>Search suits, shirts, SKU...</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E] font-semibold mb-3">
              Bespoke Collections
            </div>
            <ul className="space-y-3">
              {navCategories.map(item => (
                <li key={item.category}>
                  <button
                    onClick={() => handleNav('shop', item.category)}
                    className="text-base text-slate-200 hover:text-[#C8A97E] transition-colors flex items-center justify-between w-full text-left font-serif tracking-wide py-1 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-500 font-sans">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E] font-semibold mb-3">
              Client Services
            </div>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => handleNav('track-order')}
                  className="hover:text-white transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#C8A97E]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('track-alteration')}
                  className="hover:text-white transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-[#C8A97E]" />
                  <span>Alteration Services</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('account')}
                  className="hover:text-white transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#C8A97E]" />
                  <span>Customer Account</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => {
                onClose();
                toggleAdminMode();
              }}
              className="flex items-center gap-2.5 text-xs text-[#C8A97E] hover:text-white transition-colors py-1 w-full text-left font-medium cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-6 border-t border-white/10 bg-[#06090F] flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => handleNav('account')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 text-[#C8A97E]" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setIsNotificationsOpen(true);
            }}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Alerts</span>
            {unreadNotificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#C8A97E]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
