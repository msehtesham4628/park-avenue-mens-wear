import React from 'react';
import { X, Search, Heart, User, Compass, Scissors, Layers, LogIn, LogOut, ChevronDown, RotateCcw } from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { OFFICIAL_CATEGORIES } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const {
    setActiveView,
    setSelectedCategory,
    openCategoryPage,
    openCategoriesIndex,
    setIsSearchOpen,
    wishlist,
    unreadNotificationCount,
    setIsNotificationsOpen,
    currentCustomer,
    logout
  } = useShop();

  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleNav = (view: AppView, category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setActiveView(view);
    onClose();
  };

  const handleNavToCategory = (cat: string, sub?: string) => {
    openCategoryPage(cat, sub);
    onClose();
  };

  const handleNavToCategoriesIndex = () => {
    openCategoriesIndex();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white border-r border-gray-200 shadow-2xl flex flex-col z-50 text-[#111827]">
        {/* Header with Brand Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-[#F9F9F8]">
          <ParkAvenueLogo variant="horizontal" size="sm" className="text-[#111827]" />
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer rounded-sm"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search trigger */}
        <div className="px-5 py-3 border-b border-gray-200 bg-[#FAFAFA]">
          <button
            onClick={() => {
              onClose();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 bg-white border border-gray-200 text-xs text-gray-500 hover:border-[#936B34] transition-colors text-left cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#936B34]" />
            <span>Search garments, SKU, fabric...</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Quick Views */}
          <div className="space-y-1">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left py-2 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#111827] hover:text-[#936B34] transition-colors"
            >
              HOME
            </button>
            <button
              onClick={() => handleNav('shop', 'New Arrivals')}
              className="w-full text-left py-2 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#936B34] hover:text-black transition-colors flex items-center justify-between"
            >
              <span>NEW ARRIVALS</span>
              <span className="text-[9px] bg-[#936B34]/10 text-[#936B34] px-1.5 py-0.5 rounded-xs font-sans tracking-normal">NEW</span>
            </button>
            <button
              onClick={() => handleNav('shop', 'All')}
              className="w-full text-left py-2 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#111827] hover:text-[#936B34] transition-colors"
            >
              ALL COLLECTIONS
            </button>
          </div>

          {/* All Atelier Categories */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <button
                onClick={handleNavToCategoriesIndex}
                className="flex items-center gap-2 text-left cursor-pointer group"
              >
                <Layers className="w-3 h-3 text-[#936B34]" />
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#936B34] font-semibold group-hover:text-black transition-colors">
                  DEPARTMENTS &amp; CATEGORIES
                </span>
              </button>
              <button
                onClick={handleNavToCategoriesIndex}
                className="text-[9px] font-mono uppercase text-gray-400 hover:text-[#936B34]"
              >
                VIEW ALL
              </button>
            </div>
            <div className="space-y-1">
              {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals').map(cat => {
                const isExpanded = expandedCategory === cat.id;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleNavToCategory(cat.queryValue)}
                        className="flex-1 text-left py-2 px-2 text-xs uppercase font-sans tracking-wider text-gray-700 hover:text-black hover:bg-[#F9F9F8] transition-colors rounded-xs cursor-pointer font-medium"
                      >
                        {cat.name}
                      </button>
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="p-2 text-gray-400 hover:text-[#936B34] cursor-pointer"
                        aria-label={"Expand " + cat.name}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown className={"w-3.5 h-3.5 transition-transform duration-200 " + (isExpanded ? 'rotate-180 text-[#936B34]' : '')} />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-4 mb-1 border-l border-[#936B34]/20 pl-2">
                        <button
                          onClick={() => handleNavToCategory(cat.queryValue)}
                          className="w-full text-left py-1.5 px-2 text-[10px] uppercase tracking-wider font-semibold text-[#936B34] hover:bg-[#F9F9F8]"
                        >
                          All {cat.name} Department
                        </button>
                        {(cat.subcategories || []).map(sub => (
                          <button
                            key={sub}
                            onClick={() => handleNavToCategory(cat.queryValue, sub)}
                            className="w-full text-left py-1.5 px-2 text-[11px] text-gray-600 hover:text-[#936B34] hover:bg-[#F9F9F8] transition-colors"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
                  onClick={() => handleNav('track-return')}
                  className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#936B34]" />
                  <span>Returns &amp; Exchanges</span>
                </button>
              </li>
              <li>
                {currentCustomer ? (
                  <div className="flex items-center justify-between py-1">
                    <button
                      onClick={() => handleNav('customer-dashboard')}
                      className="hover:text-black transition-colors flex items-center gap-2.5 cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-[#936B34]" />
                      <span className="font-semibold">{currentCustomer.name || 'Patron Account'}</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="text-[10px] text-gray-500 hover:text-red-600 uppercase font-mono cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav('login')}
                    className="hover:text-black transition-colors flex items-center gap-2.5 py-1 w-full text-left cursor-pointer font-semibold text-[#936B34]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            {currentCustomer && (
              <button
                onClick={() => handleNav('customer-dashboard')}
                className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-[#936B34] transition-colors py-1 w-full text-left font-mono cursor-pointer"
              >
                <User className="w-4 h-4 text-[#936B34]" />
                <span>Patron Dashboard &amp; Orders</span>
              </button>
            )}
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
