import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  Scissors,
  Truck,
  ChevronDown,
  Sparkles,
  LogIn,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MobileMenu } from './MobileMenu';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { OFFICIAL_CATEGORIES } from '../../types';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    openCategoryPage,
    openCategoriesIndex,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    wishlist,
    currentCustomer,
    logout
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavCategory = (category: string, subcategory?: string) => {
    setIsCategoriesOpen(false);
    setOpenCategoryDropdown(null);
    if (category === 'All' || category === 'all') {
      openCategoriesIndex();
    } else {
      openCategoryPage(category, subcategory);
    }
  };

  const isHome = activeView === 'home';
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      {/* Fixed Navigation Container - Sleek reduced height & compact luxury framing */}
      <div 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/85 via-black/45 to-transparent border-b border-white/10 text-white'
            : isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-xs border-b border-gray-200/80 text-[#111827]'
            : 'bg-white/85 backdrop-blur-md border-b border-gray-200/70 shadow-xs text-[#111827]'
        }`}
      >
        {/* Sleek Ultra-Compact Announcement Bar */}
        <div 
          className={`transition-colors duration-500 py-1 px-4 text-center text-[10px] tracking-[0.2em] uppercase font-mono ${
            isTransparent
              ? 'bg-black/40 backdrop-blur-xs border-b border-white/10 text-[#E5C384]'
              : 'bg-[#F9F9F8]/90 backdrop-blur-xs border-b border-gray-200/70 text-[#936B34]'
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className={`hidden md:flex items-center gap-2 text-left ${isTransparent ? 'text-gray-300' : 'text-gray-500'}`}>
              <span className={isTransparent ? 'text-[#E5C384] font-semibold' : 'text-[#936B34] font-semibold'}>PARK AVENUE</span>
              <span className={isTransparent ? 'text-white/20' : 'text-gray-300'}>•</span>
              <span>ATELIER MENSWEAR</span>
            </div>

            <div className={`mx-auto text-center font-medium tracking-[0.18em] truncate px-2 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`}>
              COMPLIMENTARY WORLDWIDE DELIVERY &amp; BESPOKE TAILORING
            </div>

            <div className={`hidden md:flex items-center gap-3 text-right text-[10px] ${isTransparent ? 'text-gray-300' : 'text-gray-500'}`}>
</div>

            {/* Mobile Right Controls: SEARCH, ACCOUNT, CART, MENU */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-1.5 cursor-pointer transition-colors ${
                  isTransparent ? 'text-white hover:text-[#E5C384]' : 'text-gray-700 hover:text-[#936B34]'
                }`}
                aria-label="SEARCH"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (currentCustomer) {
                    setActiveView('customer-dashboard');
                  } else {
                    setActiveView('login');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-1.5 cursor-pointer transition-colors ${
                  isTransparent ? 'text-white hover:text-[#E5C384]' : 'text-gray-700 hover:text-[#936B34]'
                }`}
                aria-label={currentCustomer ? 'Patron Dashboard' : 'Sign In'}
                title={currentCustomer ? 'Patron Dashboard' : 'Sign In'}
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-1.5 relative cursor-pointer transition-colors ${
                  isTransparent ? 'text-white hover:text-[#E5C384]' : 'text-gray-700 hover:text-[#936B34]'
                }`}
                aria-label="CART"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#936B34] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-1.5 cursor-pointer transition-colors ${
                  isTransparent ? 'text-white hover:text-[#E5C384]' : 'text-gray-700 hover:text-[#936B34]'
                }`}
                aria-label="MENU"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};
