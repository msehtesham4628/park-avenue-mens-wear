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
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white border-r border-black/10 shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#111111]">
              PARK AVENUE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#8C6D3B] font-sans border border-[#8C6D3B]/40 px-1 py-0.5">
              PA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#666666] hover:text-black transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search trigger */}
        <div className="px-6 py-4 border-b border-black/5">
          <button
            onClick={() => {
              onClose();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#FAF9F6] border border-black/10 text-sm text-[#666666] hover:border-[#8C6D3B] transition-colors text-left"
          >
            <Search className="w-4 h-4 text-[#8C6D3B]" />
            <span>Search suits, shirts, SKU...</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C6D3B] font-semibold mb-3">
              Collections
            </div>
            <ul className="space-y-3">
              {navCategories.map(item => (
                <li key={item.category}>
                  <button
                    onClick={() => handleNav('shop', item.category)}
                    className="text-base text-[#111111] hover:text-[#8C6D3B] transition-colors flex items-center justify-between w-full text-left font-serif tracking-wide py-1"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-[#888888] font-sans">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-black/10 pt-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#8C6D3B] font-semibold mb-3">
              Client Concierge
            </div>
            <ul className="space-y-2.5 text-sm text-[#555555]">
              <li>
                <button
                  onClick={() => handleNav('track-order')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left"
                >
                  <Compass className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('track-alteration')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left"
                >
                  <Scissors className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Track Bespoke Alteration</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('account')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left"
                >
                  <User className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Customer Account</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="border-t border-black/10 pt-4">
            <button
              onClick={() => {
                onClose();
                toggleAdminMode();
              }}
              className="flex items-center gap-2.5 text-xs text-[#8C6D3B] hover:text-[#111111] transition-colors py-1 w-full text-left font-medium"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-6 border-t border-black/10 bg-[#FAF9F6] flex items-center justify-between text-xs text-[#555555]">
          <button
            onClick={() => handleNav('account')}
            className="flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <Heart className="w-4 h-4 text-[#8C6D3B]" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setIsNotificationsOpen(true);
            }}
            className="hover:text-black transition-colors flex items-center gap-1"
          >
            <span>Alerts</span>
            {unreadNotificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#8C6D3B]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
