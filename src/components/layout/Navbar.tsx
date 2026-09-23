import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  ShieldCheck, 
  Scissors,
  Truck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedCategory,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    wishlist
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Navigation Container - Overlays Hero seamlessly and transitions to solid white on scroll */}
      <div 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-sm border-b border-black/10' 
            : activeView === 'home'
              ? 'bg-transparent border-b border-transparent'
              : 'bg-white shadow-xs border-b border-black/10'
        }`}
      >
        {/* Top Announcement Bar */}
        <div 
          className={`transition-colors duration-300 py-2 px-4 text-center text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-mono ${
            isScrolled 
              ? 'bg-[#FAF9F6] border-b border-black/5 text-[#8C6D3B]' 
              : activeView === 'home'
                ? 'bg-transparent border-b border-black/[0.04] text-[#8C6D3B]'
                : 'bg-[#FAF9F6] border-b border-black/5 text-[#8C6D3B]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden lg:flex items-center gap-3 text-left text-[#666666]">
              <span className="text-[#8C6D3B] font-semibold">PARK AVENUE</span>
              <span className="text-black/10">|</span>
              <span>FLAGSHIP ATELIER</span>
            </div>

            <div className="mx-auto text-center font-medium">
              PARK AVENUE MENSWEAR — BESPOKE TAILORING &amp; LUXURY APPAREL —
            </div>

            <div className="hidden lg:flex items-center gap-4 text-right text-[#666666] text-[10px]">
              <button 
                onClick={() => setActiveView('track-order')}
                className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3 h-3 text-[#8C6D3B]" />
                <span>ORDER TRACKING</span>
              </button>
              <span className="text-black/10">|</span>
              <button 
                onClick={() => setActiveView('track-alteration')}
                className="hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Scissors className="w-3 h-3 text-[#8C6D3B]" />
                <span>ALTERATIONS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Header */}
        <header 
          className={`w-full transition-all duration-300 ${
            isScrolled 
              ? 'bg-white py-3 sm:py-3.5' 
              : activeView === 'home'
                ? 'bg-transparent py-4 sm:py-5'
                : 'bg-white py-4 sm:py-5'
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
              className="text-left flex items-baseline gap-2 focus-visible:outline-none group cursor-pointer"
              aria-label="PARK AVENUE MENSWEAR Home"
            >
              <span className="font-serif text-lg sm:text-2xl font-light tracking-[0.22em] text-[#111111] group-hover:text-[#8C6D3B] transition-colors whitespace-nowrap">
                PARK AVENUE MENSWEAR
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] tracking-[0.2em] uppercase font-sans font-medium text-[#555555]">
            <button 
              onClick={() => handleNavCategory('New Arrivals')} 
              className={`hover:text-[#111111] transition-colors relative py-1 cursor-pointer ${activeView === 'shop' ? 'text-[#111111] font-semibold' : ''}`}
            >
              NEW ARRIVALS
            </button>
            <button 
              onClick={() => handleNavCategory('Suits')} 
              className="hover:text-[#111111] transition-colors relative py-1 cursor-pointer"
            >
              SUITS
            </button>
            <button 
              onClick={() => handleNavCategory('Dress Shirts')} 
              className="hover:text-[#111111] transition-colors relative py-1 cursor-pointer"
            >
              DRESS SHIRTS
            </button>
            <button 
              onClick={() => handleNavCategory('Dress Pants')} 
              className="hover:text-[#111111] transition-colors relative py-1 cursor-pointer"
            >
              DRESS PANTS
            </button>
            <button 
              onClick={() => handleNavCategory('Ties')} 
              className="hover:text-[#111111] transition-colors relative py-1 cursor-pointer"
            >
              TIES
            </button>
            <button 
              onClick={() => handleNavCategory('All')} 
              className="hover:text-[#111111] transition-colors relative py-1 cursor-pointer"
            >
              COLLECTIONS
            </button>
          </nav>

          {/* Desktop Right Action Utility */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-mono tracking-wider text-[#111111]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 hover:text-[#8C6D3B] transition-colors uppercase text-[11px] cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>SEARCH</span>
            </button>

            <button
              onClick={() => {
                setActiveView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 hover:text-[#8C6D3B] transition-colors uppercase text-[11px] cursor-pointer"
              aria-label="Customer Account"
            >
              <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>ACCOUNT</span>
            </button>

            <button
              onClick={() => {
                setActiveView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 hover:text-[#8C6D3B] transition-colors uppercase text-[11px] relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>WISHLIST</span>
              {wishlist.length > 0 && (
                <span className="ml-1 text-[9px] text-[#8C6D3B] font-mono font-semibold">({wishlist.length})</span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 hover:text-[#8C6D3B] transition-colors uppercase text-[11px] cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>CART</span>
              <span className="ml-1 text-[9px] text-[#8C6D3B] font-mono font-semibold">({cartCount})</span>
            </button>

            <span className="text-black/10">|</span>

            {/* Quick Admin Toggle */}
            <button
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer ${
                activeView === 'admin'
                  ? 'border-[#111111] bg-[#111111] text-white font-semibold'
                  : 'border-black/20 text-[#666666] hover:text-black hover:border-black'
              }`}
            >
              ADMIN
            </button>
          </div>

          {/* Mobile Right Controls: SEARCH, ACCOUNT, CART, MENU */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#111111] hover:text-[#8C6D3B] cursor-pointer"
              aria-label="SEARCH"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1.5 text-[#111111] hover:text-[#8C6D3B] cursor-pointer"
              aria-label="ACCOUNT"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-[#111111] hover:text-[#8C6D3B] relative cursor-pointer"
              aria-label="CART"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-[#111111] hover:text-[#8C6D3B] cursor-pointer"
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
