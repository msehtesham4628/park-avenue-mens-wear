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
