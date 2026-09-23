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
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white border-r border-gray-200 shadow-2xl flex flex-col z-50 text-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-[#F9F9F8]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#111827]">
              PARK AVENUE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#936B34] font-sans border border-[#936B34]/40 px-1.5 py-0.5">
              PA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search trigger */}
        <div className="px-6 py-4 border-b border-gray-200 bg-[#FAFAFA]">
          <button
            onClick={() => {
              onClose();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 text-sm text-gray-500 hover:border-[#936B34] transition-colors text-left cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#936B34]" />
            <span>Search suits, shirts, SKU...</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#936B34] font-semibold mb-3">
              Bespoke Collections
            </div>
            <ul className="space-y-3">
              {navCategories.map(item => (
                <li key={item.category}>
                  <button
                    onClick={() => handleNav('shop', item.category)}
                    className="text-base text-gray-800 hover:text-[#936B34] transition-colors flex items-center justify-between w-full text-left font-serif tracking-wide py-1 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-gray-400 font-sans">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#936B34] font-semibold mb-3">
              Client Services
            </div>
            <ul className="space-y-2.5 text-sm text-gray-700">
              <li>
                <button
                  onClick={() => handleNav('track-order')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#936B34]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('track-alteration')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-[#936B34]" />
                  <span>Alteration Services</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('account')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#936B34]" />
                  <span>Customer Account</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => {
                onClose();
                toggleAdminMode();
              }}
              className="flex items-center gap-2.5 text-xs text-[#936B34] hover:text-black transition-colors py-1 w-full text-left font-medium cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="p-6 border-t border-gray-200 bg-[#F9F9F8] flex items-center justify-between text-xs text-gray-600">
          <button
            onClick={() => handleNav('account')}
            className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 text-[#936B34]" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setIsNotificationsOpen(true);
            }}
            className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Alerts</span>
            {unreadNotificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#936B34]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
