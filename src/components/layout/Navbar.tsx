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
              FREE INSURED SHIPPING ON ORDERS OVER $200 · BESPOKE ATELIER TAILORING
            </div>

            <div className={`hidden md:flex items-center gap-3 text-right text-[10px] ${isTransparent ? 'text-gray-300' : 'text-gray-500'}`}>
              <button 
                onClick={() => setActiveView('track-order')}
                className={`transition-colors flex items-center gap-1 cursor-pointer ${isTransparent ? 'hover:text-white' : 'hover:text-black'}`}
              >
                <Truck className={`w-3 h-3 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>TRACKING</span>
              </button>
              <span className={isTransparent ? 'text-white/20' : 'text-gray-300'}>|</span>
              <button 
                onClick={() => setActiveView('track-alteration')}
                className={`transition-colors flex items-center gap-1 cursor-pointer ${isTransparent ? 'hover:text-white' : 'hover:text-black'}`}
              >
                <Scissors className={`w-3 h-3 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>SERVICES</span>
              </button>
              <span className={isTransparent ? 'text-white/20' : 'text-gray-300'}>|</span>
              <button 
                onClick={() => {
                  setActiveView('track-return');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-colors flex items-center gap-1 cursor-pointer ${isTransparent ? 'hover:text-white' : 'hover:text-black'}`}
                title="Size Exchange & Return Tracking"
              >
                <RotateCcw className={`w-3 h-3 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>RETURNS</span>
              </button>

            </div>
          </div>
        </div>

        {/* Main Navigation Header - Reduced length & tight vertical padding */}
        <header 
          className={`w-full transition-all duration-300 ${
            isScrolled 
              ? 'py-1.5 sm:py-2' 
              : 'py-2 sm:py-2.5'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left focus-visible:outline-none group cursor-pointer"
                aria-label="PARK AVENUE MENSWEAR Home"
              >
                <ParkAvenueLogo 
                  variant="horizontal" 
                  size={isScrolled ? 'sm' : 'md'} 
                  className={`transition-all duration-300 ${
                    isTransparent 
                      ? 'brightness-0 invert drop-shadow-md group-hover:brightness-125' 
                      : 'text-[#111827] group-hover:text-[#936B34]'
                  }`} 
                />
              </button>
            </div>

            {/* Desktop Navigation Links - Compact luxury spacing */}
            <nav className={`hidden lg:flex items-center gap-3 xl:gap-4.5 text-[10px] xl:text-[11px] tracking-[0.18em] uppercase font-sans font-medium ${
              isTransparent ? 'text-white/90' : 'text-gray-700'
            }`}>
              <button 
                onClick={() => {
                  setSelectedCategory('New Arrivals');
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className={`transition-colors relative py-1 cursor-pointer ${
                  activeView === 'shop' && selectedCategory.toLowerCase().includes('new')
                    ? (isTransparent ? 'text-[#E5C384] font-semibold' : 'text-[#936B34] font-semibold')
                    : (isTransparent ? 'hover:text-white' : 'hover:text-black')
                }`}
              >
                NEW ARRIVALS
              </button>

              {['suits', 'blazers-jackets', 'shirts', 'pants'].map(categoryId => {
                const category = OFFICIAL_CATEGORIES.find(c => c.id === categoryId);
                if (!category) return null;
                const isOpen = openCategoryDropdown === category.id;
                const isSelected = activeView === 'category' && (
                  selectedCategory.toLowerCase() === category.queryValue.toLowerCase() ||
                  selectedCategory.toLowerCase() === category.name.toLowerCase()
                );

                return (
                  <div
                    key={category.id}
                    className="relative flex items-center"
                    onMouseEnter={() => setOpenCategoryDropdown(category.id)}
                    onMouseLeave={() => setOpenCategoryDropdown(null)}
                  >
                    <button
                      onClick={() => handleNavCategory(category.queryValue)}
                      className={`transition-colors relative py-1 cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? (isTransparent ? 'text-[#E5C384] font-semibold' : 'text-[#936B34] font-semibold')
                          : (isTransparent ? 'hover:text-white' : 'hover:text-black')
                      }`}
                    >
                      <span>{category.name.toUpperCase()}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCategoryDropdown(isOpen ? null : category.id);
                      }}
                      className={`p-1 cursor-pointer transition-colors ${
                        isTransparent ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-[#936B34]'
                      }`}
                      aria-label={`Toggle ${category.name} subcategories`}
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#936B34]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-gray-200 shadow-xl p-2 z-50 text-[#111827] animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          onClick={() => handleNavCategory(category.queryValue)}
                          className="w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#936B34] hover:bg-[#F9F9F8] cursor-pointer"
                        >
                          All {category.name} Department
                        </button>
                        {(category.subcategories || []).map(subcategory => (
                          <button
                            key={subcategory}
                            onClick={() => handleNavCategory(category.queryValue, subcategory)}
                            className="w-full text-left px-3 py-2 text-[11px] text-gray-700 hover:bg-[#F9F9F8] hover:text-[#936B34] transition-colors cursor-pointer"
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* All Categories Dropdown Mega Menu */}
              <div 
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button
                  onClick={() => openCategoriesIndex()}
                  className={`flex items-center gap-1 transition-colors py-1 cursor-pointer ${
                    activeView === 'categories' || isCategoriesOpen 
                      ? (isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]') 
                      : (isTransparent ? 'hover:text-white' : 'hover:text-black')
                  }`}
                  aria-expanded={isCategoriesOpen}
                >
                  <span>CATEGORIES</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-[#936B34]' : ''}`} />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white border border-gray-200 shadow-2xl p-5 z-50 text-[#111827] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#936B34] font-semibold">
                          ATELIER DEPARTMENTS
                        </span>
                      </div>
                      <button 
                        onClick={openCategoriesIndex} 
                        className="text-[10px] text-gray-500 hover:text-black underline uppercase tracking-widest cursor-pointer"
                      >
                        VIEW ALL DEPARTMENTS
                      </button>
                    </div>

                    {/* Complete category hierarchy with direct category links */}
                    <div className="grid grid-cols-3 gap-2">
                      {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals').map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleNavCategory(cat.queryValue)}
                          className="flex flex-col text-left p-2 hover:bg-[#F9F9F8] transition-colors rounded-xs group cursor-pointer"
                        >
                          <span className="text-[11px] font-sans uppercase font-medium tracking-wider text-[#111827] group-hover:text-[#936B34]">
                            {cat.name}
                          </span>
                          <span className="text-[9px] text-gray-500 line-clamp-1 font-sans normal-case mt-0.5 tracking-normal">
                            {cat.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className={`transition-colors relative py-1 cursor-pointer ${
                  activeView === 'shop' && selectedCategory === 'All'
                    ? (isTransparent ? 'text-[#E5C384] font-semibold' : 'text-[#936B34] font-semibold')
                    : (isTransparent ? 'hover:text-white' : 'hover:text-black')
                }`}
              >
                ALL
              </button>
            </nav>

            {/* Desktop Right Action Utility - Compact */}
            <div className={`hidden lg:flex items-center gap-3.5 xl:gap-4 text-xs font-mono tracking-wider ${
              isTransparent ? 'text-white/90' : 'text-gray-700'
            }`}>
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-1.5 transition-colors uppercase text-[11px] cursor-pointer ${
                  isTransparent ? 'hover:text-[#E5C384]' : 'hover:text-[#936B34]'
                }`}
                aria-label="Search"
              >
                <Search className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>SEARCH</span>
              </button>

              {/* Customer Account / Sign In */}
              {currentCustomer ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveView('customer-dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 transition-colors uppercase text-[11px] cursor-pointer ${
                      activeView === 'customer-dashboard' || activeView === 'account'
                        ? (isTransparent ? 'text-[#E5C384] font-semibold' : 'text-[#936B34] font-semibold')
                        : (isTransparent ? 'hover:text-[#E5C384]' : 'hover:text-[#936B34]')
                    }`}
                    aria-label="Customer Dashboard"
                  >
                    <User className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                    <span>{currentCustomer.name?.split(' ')[0] || 'PATRON'} DASHBOARD</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-[9px] font-mono cursor-pointer ${
                      isTransparent ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-[#936B34]'
                    }`}
                    title="Switch or manage credentials"
                  >
                    (SWITCH)
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveView('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 transition-colors uppercase text-[11px] cursor-pointer font-semibold ${
                    activeView === 'login' 
                      ? (isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]')
                      : (isTransparent ? 'text-white hover:text-[#E5C384]' : 'text-[#111827] hover:text-[#936B34]')
                  }`}
                  aria-label="Sign In"
                >
                  <User className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                  <span>SIGN IN</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 transition-colors uppercase text-[11px] relative cursor-pointer ${
                  isTransparent ? 'hover:text-[#E5C384]' : 'hover:text-[#936B34]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>WISHLIST</span>
                {wishlist.length > 0 && (
                  <span className={`ml-1 text-[9px] font-mono font-semibold ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`}>
                    ({wishlist.length})
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className={`flex items-center gap-1.5 transition-colors uppercase text-[11px] cursor-pointer ${
                  isTransparent ? 'hover:text-[#E5C384]' : 'hover:text-[#936B34]'
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`} />
                <span>CART</span>
                <span className={`ml-1 text-[9px] font-mono font-semibold ${isTransparent ? 'text-[#E5C384]' : 'text-[#936B34]'}`}>
                  ({cartCount})
                </span>
              </button>


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
