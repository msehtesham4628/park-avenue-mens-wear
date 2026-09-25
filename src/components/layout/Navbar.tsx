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
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MobileMenu } from './MobileMenu';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { OFFICIAL_CATEGORIES } from '../../types';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedCategory,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    wishlist,
    currentCustomer,
    isAdminLoggedIn,
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

  const handleNavCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveView('shop');
    setIsCategoriesOpen(false);
    setOpenCategoryDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Navigation Container - Overlays Hero seamlessly and transitions to solid white on scroll */}
      <div 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 text-[#111827]' 
            : activeView === 'home'
              ? 'bg-transparent border-b border-black/5 text-[#111827]'
              : 'bg-white border-b border-gray-200 shadow-xs text-[#111827]'
        }`}
      >
        {/* Top Announcement Bar */}
        <div 
          className={`transition-colors duration-300 py-2 px-4 text-center text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-mono ${
            isScrolled 
              ? 'bg-[#F9F9F8] border-b border-gray-200 text-[#936B34]' 
              : activeView === 'home'
                ? 'bg-black/[0.02] border-b border-black/5 text-[#936B34]'
                : 'bg-[#F9F9F8] border-b border-gray-200 text-[#936B34]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden lg:flex items-center gap-3 text-left text-gray-500">
              <span className="text-[#936B34] font-semibold">PARK AVENUE</span>
              <span className="text-gray-300">|</span>
              <span>BESPOKE SUITING ATELIER</span>
            </div>

            <div className="mx-auto text-center font-medium tracking-[0.2em] text-[#936B34]">
              PARK AVENUE MENSWEAR — HAND-CANVASSED SUITS &amp; BESPOKE TAILORING —
            </div>

            <div className="hidden lg:flex items-center gap-4 text-right text-gray-500 text-[10px]">
              <button 
                onClick={() => setActiveView('track-order')}
                className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3 h-3 text-[#936B34]" />
                <span>ORDER TRACKING</span>
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setActiveView('track-alteration')}
                className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Scissors className="w-3 h-3 text-[#936B34]" />
                <span>SERVICES</span>
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => {
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isAdminLoggedIn ? 'text-[#936B34] font-semibold' : ''
                }`}
                title="Atelier Administration Portal"
              >
                <ShieldCheck className="w-3 h-3 text-[#936B34]" />
                <span>{isAdminLoggedIn ? 'ADMIN DASHBOARD' : 'ADMIN'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Header */}
        <header 
          className={`w-full transition-all duration-300 ${
            isScrolled 
              ? 'py-3 sm:py-3.5' 
              : 'py-4 sm:py-5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
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
                  className="text-[#111827] group-hover:text-[#936B34] transition-colors" 
                />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-[11px] tracking-[0.2em] uppercase font-sans font-medium text-gray-700">
              <button 
                onClick={() => handleNavCategory('New Arrivals')} 
                className={`hover:text-black transition-colors relative py-1 cursor-pointer ${activeView === 'shop' ? 'text-[#936B34] font-semibold' : ''}`}
              >
                NEW ARRIVALS
              </button>
              {['suits', 'blazers-jackets', 'shirts', 'pants'].map(categoryId => {
                const category = OFFICIAL_CATEGORIES.find(c => c.id === categoryId);
                if (!category) return null;
                const isOpen = openCategoryDropdown === category.id;
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setOpenCategoryDropdown(category.id)}
                    onMouseLeave={() => setOpenCategoryDropdown(null)}
                  >
                    <button
                      onClick={() => setOpenCategoryDropdown(isOpen ? null : category.id)}
                      className={"flex items-center gap-1 hover:text-black transition-colors relative py-1 cursor-pointer whitespace-nowrap " + (isOpen ? 'text-[#936B34]' : '')}
                      aria-expanded={isOpen}
                    >
                      <span>{category.name.toUpperCase()}</span>
                      <ChevronDown className={"w-3 h-3 transition-transform duration-200 " + (isOpen ? 'rotate-180 text-[#936B34]' : '')} />
                    </button>
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 min-w-[190px] bg-white border border-gray-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          onClick={() => handleNavCategory(category.queryValue)}
                          className="w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#936B34] hover:bg-[#F9F9F8]"
                        >
                          All {category.name}
                        </button>
                        {(category.subcategories || []).map(subcategory => (
                          <button
                            key={subcategory}
                            onClick={() => handleNavCategory(subcategory)}
                            className="w-full text-left px-3 py-2 text-[11px] text-gray-700 hover:bg-[#F9F9F8] hover:text-[#936B34] transition-colors"
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
                  onClick={() => setIsCategoriesOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 hover:text-black transition-colors py-1 cursor-pointer ${
                    isCategoriesOpen ? 'text-[#936B34]' : ''
                  }`}
                  aria-expanded={isCategoriesOpen}
                >
                  <span>CATEGORIES</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-[#936B34]' : ''}`} />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-white border border-gray-200 shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#936B34] font-semibold">
                          ATELIER DEPARTMENTS
                        </span>
                      </div>
                      <button 
                        onClick={() => handleNavCategory('All')} 
                        className="text-[10px] text-gray-500 hover:text-black underline uppercase tracking-widest"
                      >
                        VIEW ALL COLLECTIONS
                      </button>
                    </div>

                    {/* Complete category hierarchy */}
                    <div className="grid grid-cols-3 gap-2">
                      {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals').map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleNavCategory(cat.queryValue)}
                          className="flex flex-col text-left p-2.5 hover:bg-[#F9F9F8] transition-colors rounded-xs group cursor-pointer"
                        >
                          <span className="text-[11px] font-sans uppercase font-medium tracking-wider text-[#111827] group-hover:text-[#936B34]">
                            {cat.name}
                          </span>
                          <span className="text-[9px] text-gray-600 line-clamp-1 font-sans normal-case mt-0.5 tracking-normal">
                            {cat.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleNavCategory('All')} 
                className="hover:text-black transition-colors relative py-1 cursor-pointer"
              >
                ALL COLLECTIONS
              </button>
            </nav>

            {/* Desktop Right Action Utility */}
            <div className="hidden lg:flex items-center gap-5 text-xs font-mono tracking-wider text-gray-700">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#936B34] transition-colors uppercase text-[11px] cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-[#936B34]" />
                <span>SEARCH</span>
              </button>

              {/* Customer Account / Sign In */}
              {currentCustomer ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveView('account');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 hover:text-[#936B34] transition-colors uppercase text-[11px] cursor-pointer ${
                      activeView === 'account' ? 'text-[#936B34] font-semibold' : ''
                    }`}
                    aria-label="Customer Account"
                  >
                    <User className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>{currentCustomer.name?.split(' ')[0] || 'PATRON'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[9px] text-gray-400 hover:text-[#936B34] font-mono cursor-pointer"
                    title="Switch or manage credentials"
                  >
                    (SWITCH)
                  </button>
                  {(isAdminLoggedIn || currentCustomer?.role === 'admin' || currentCustomer?.role === 'staff') && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="ml-1 px-2 py-0.5 bg-[#936B34] text-white hover:bg-[#111827] text-[10px] font-mono tracking-wider uppercase transition-colors shadow-xs cursor-pointer font-medium"
                      title="Atelier Admin Console"
                    >
                      DASHBOARD
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveView('login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 hover:text-[#936B34] transition-colors uppercase text-[11px] cursor-pointer font-semibold ${
                    activeView === 'login' ? 'text-[#936B34]' : 'text-[#111827]'
                  }`}
                  aria-label="Sign In"
                >
                  <User className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>SIGN IN</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 hover:text-[#936B34] transition-colors uppercase text-[11px] relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="w-3.5 h-3.5 text-[#936B34]" />
                <span>WISHLIST</span>
                {wishlist.length > 0 && (
                  <span className="ml-1 text-[9px] text-[#936B34] font-mono font-semibold">({wishlist.length})</span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#936B34] transition-colors uppercase text-[11px] cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#936B34]" />
                <span>CART</span>
                <span className="ml-1 text-[9px] text-[#936B34] font-mono font-semibold">({cartCount})</span>
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setActiveView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 bg-[#111827] text-[#936B34] border border-[#936B34]/60 text-[10px] uppercase font-mono tracking-widest hover:bg-[#936B34] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                  title="Open Atelier Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DASHBOARD</span>
                </button>
              )}
            </div>

            {/* Mobile Right Controls: SEARCH, ACCOUNT, CART, MENU */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-gray-700 hover:text-[#936B34] cursor-pointer"
                aria-label="SEARCH"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-1.5 text-gray-700 hover:text-[#936B34] cursor-pointer"
                aria-label="ACCOUNT"
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 text-gray-700 hover:text-[#936B34] relative cursor-pointer"
                aria-label="CART"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#111827] text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-gray-700 hover:text-[#936B34] cursor-pointer"
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
