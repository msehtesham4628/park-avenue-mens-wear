import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
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
      {/* Fixed Navigation Container - Overlays Hero seamlessly and transitions to deep solid midnight suiting on scroll */}
      <div 
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#090D16]/95 backdrop-blur-md shadow-xl shadow-black/50 border-b border-white/10' 
            : activeView === 'home'
              ? 'bg-transparent border-b border-transparent'
              : 'bg-[#090D16] border-b border-white/10 shadow-lg shadow-black/40'
        }`}
      >
        {/* Top Announcement Bar */}
        <div 
          className={`transition-colors duration-300 py-2 px-4 text-center text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-mono ${
            isScrolled 
              ? 'bg-[#06090F] border-b border-white/5 text-[#C8A97E]' 
              : activeView === 'home'
                ? 'bg-transparent border-b border-white/[0.04] text-[#C8A97E]'
                : 'bg-[#06090F] border-b border-white/5 text-[#C8A97E]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden lg:flex items-center gap-3 text-left text-slate-400">
              <span className="text-[#C8A97E] font-semibold">PARK AVENUE</span>
              <span className="text-white/20">|</span>
              <span>BESPOKE SUITING ATELIER</span>
            </div>

            <div className="mx-auto text-center font-medium tracking-[0.2em] text-[#C8A97E]">
              PARK AVENUE MENSWEAR — HAND-CANVASSED SUITS &amp; BESPOKE TAILORING —
            </div>

            <div className="hidden lg:flex items-center gap-4 text-right text-slate-400 text-[10px]">
              <button 
                onClick={() => setActiveView('track-order')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3 h-3 text-[#C8A97E]" />
                <span>ORDER TRACKING</span>
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => setActiveView('track-alteration')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Scissors className="w-3 h-3 text-[#C8A97E]" />
                <span>SERVICES</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Header */}
        <header 
          className={`w-full transition-all duration-300 ${
            isScrolled 
              ? 'py-3 sm:py-3.5' 
              : activeView === 'home'
                ? 'py-4 sm:py-5'
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
                className="text-left flex items-baseline gap-2 focus-visible:outline-none group cursor-pointer"
                aria-label="PARK AVENUE MENSWEAR Home"
              >
                <span className="font-serif text-lg sm:text-2xl font-light tracking-[0.22em] text-white group-hover:text-[#C8A97E] transition-colors whitespace-nowrap">
                  PARK AVENUE MENSWEAR
                </span>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] tracking-[0.2em] uppercase font-sans font-medium text-slate-300">
              <button 
                onClick={() => handleNavCategory('New Arrivals')} 
                className={`hover:text-white transition-colors relative py-1 cursor-pointer ${activeView === 'shop' ? 'text-[#C8A97E] font-semibold' : ''}`}
              >
                NEW ARRIVALS
              </button>
              <button 
                onClick={() => handleNavCategory('Suits')} 
                className="hover:text-white transition-colors relative py-1 cursor-pointer"
              >
                SUITS
              </button>
              <button 
                onClick={() => handleNavCategory('Dress Shirts')} 
                className="hover:text-white transition-colors relative py-1 cursor-pointer"
              >
                DRESS SHIRTS
              </button>
              <button 
                onClick={() => handleNavCategory('Dress Pants')} 
                className="hover:text-white transition-colors relative py-1 cursor-pointer"
              >
                DRESS PANTS
              </button>
              <button 
                onClick={() => handleNavCategory('Ties')} 
                className="hover:text-white transition-colors relative py-1 cursor-pointer"
              >
                TIES
              </button>
              <button 
                onClick={() => handleNavCategory('All')} 
                className="hover:text-white transition-colors relative py-1 cursor-pointer"
              >
                COLLECTIONS
              </button>
            </nav>

            {/* Desktop Right Action Utility */}
            <div className="hidden lg:flex items-center gap-5 text-xs font-mono tracking-wider text-slate-200">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#C8A97E] transition-colors uppercase text-[11px] cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>SEARCH</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 hover:text-[#C8A97E] transition-colors uppercase text-[11px] cursor-pointer"
                aria-label="Customer Account"
              >
                <User className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>ACCOUNT</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 hover:text-[#C8A97E] transition-colors uppercase text-[11px] relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>WISHLIST</span>
                {wishlist.length > 0 && (
                  <span className="ml-1 text-[9px] text-[#C8A97E] font-mono font-semibold">({wishlist.length})</span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 hover:text-[#C8A97E] transition-colors uppercase text-[11px] cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>CART</span>
                <span className="ml-1 text-[9px] text-[#C8A97E] font-mono font-semibold">({cartCount})</span>
              </button>

              <span className="text-white/20">|</span>

              {/* Quick Admin Toggle */}
              <button
                onClick={() => {
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer ${
                  activeView === 'admin'
                    ? 'border-[#C8A97E] bg-[#C8A97E] text-[#090D16] font-semibold'
                    : 'border-white/20 text-slate-300 hover:text-white hover:border-white'
                }`}
              >
                ADMIN
              </button>
            </div>

            {/* Mobile Right Controls: SEARCH, ACCOUNT, CART, MENU */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-slate-200 hover:text-[#C8A97E] cursor-pointer"
                aria-label="SEARCH"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveView('account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-1.5 text-slate-200 hover:text-[#C8A97E] cursor-pointer"
                aria-label="ACCOUNT"
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 text-slate-200 hover:text-[#C8A97E] relative cursor-pointer"
                aria-label="CART"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#C8A97E] text-[#090D16] text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 text-slate-200 hover:text-[#C8A97E] cursor-pointer"
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
