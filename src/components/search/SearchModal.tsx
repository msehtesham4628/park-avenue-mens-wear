import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, navigateToProduct } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isSearchOpen]);

  // Handle keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const quickTerms = [
    'Navy Suit',
    'Egyptian Cotton',
    'Tuxedo',
    'Grenadine Silk',
    'Worsted Wool Trousers',
    'Double-Breasted'
  ];

  const filteredProducts = searchTerm.trim() === ''
    ? []
    : products.filter(p => {
        const query = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.collection.toLowerCase().includes(query) ||
          p.fabric.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen px-4 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-3xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden flex flex-col my-auto text-[#F8FAFC]">
          
          {/* Search Input Bar */}
          <div className="relative flex items-center px-6 py-5 border-b border-white/10 bg-[#06090F]">
            <Search className="w-5 h-5 text-[#C8A97E] mr-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by garment name, category, SKU, or fabric..."
              className="w-full bg-transparent text-base md:text-lg text-white placeholder-slate-500 focus:outline-none font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-white mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div className="px-6 py-3.5 bg-[#0B0F1A] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-[#C8A97E]" />
              Trending:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {quickTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-2.5 py-1 text-xs text-slate-300 bg-[#111726] hover:bg-[#1A233A] hover:text-[#C8A97E] border border-white/10 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-6 bg-[#090D16]">
            {searchTerm.trim() === '' ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-serif text-lg text-white">Search Park Avenue Menswear</p>
                <p className="text-xs mt-1 text-slate-400 max-w-sm mx-auto">
                  Type a keyword to discover bespoke suits, Egyptian cotton shirts, wool trousers, or handcrafted neckwear.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-serif text-base text-white">No garments found for &ldquo;{searchTerm}&rdquo;</p>
                <p className="text-xs mt-1">Try searching by category such as &ldquo;Suits&rdquo; or &ldquo;Ties&rdquo;.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-[#C8A97E] font-mono">
                  Found {filteredProducts.length} tailored pieces
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        navigateToProduct(product.id);
                        setIsSearchOpen(false);
                      }}
                      className="group flex gap-4 p-3 bg-[#0E1526] border border-white/10 hover:border-[#C8A97E] hover:bg-[#121B2F] transition-all cursor-pointer shadow-lg"
                    >
                      <div className="w-20 h-24 shrink-0 overflow-hidden">
                        <MediaPlaceholder
                          label="PA"
                          category={product.category}
                          aspectRatio="portrait"
                          minimal
                          className="w-full h-full p-2"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#C8A97E] block mb-0.5 font-mono">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-serif text-white group-hover:text-[#C8A97E] transition-colors truncate">
                            {product.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5 font-mono">
                            SKU: {product.sku}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="text-xs font-semibold tabular-nums text-white">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#C8A97E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-[#06090F] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press ESC or click outside to dismiss</span>
            <span className="text-[#C8A97E] font-medium">Park Avenue Private Atelier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
