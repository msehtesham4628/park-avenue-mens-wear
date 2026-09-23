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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen px-4 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-3xl bg-white border border-black/10 shadow-2xl overflow-hidden flex flex-col my-auto">
          
          {/* Search Input Bar */}
          <div className="relative flex items-center px-6 py-5 border-b border-black/10 bg-[#FAF9F6]">
            <Search className="w-5 h-5 text-[#8C6D3B] mr-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by garment name, category, SKU, or fabric..."
              className="w-full bg-transparent text-base md:text-lg text-[#111111] placeholder-[#888888] focus:outline-none font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-[#666666] hover:text-black mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-[#666666] hover:text-black cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div className="px-6 py-3.5 bg-white border-b border-black/5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] uppercase tracking-wider text-[#666666] shrink-0 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-[#8C6D3B]" />
              Trending:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {quickTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-2.5 py-1 text-xs text-[#111111] bg-[#FAF9F6] hover:bg-[#F0EEEA] hover:text-[#8C6D3B] border border-black/10 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-6 bg-white">
            {searchTerm.trim() === '' ? (
              <div className="py-12 text-center text-[#666666]">
                <p className="font-serif text-lg text-[#111111]">Search Park Avenue Menswear</p>
                <p className="text-xs mt-1 text-[#777777] max-w-sm mx-auto">
                  Type a keyword to discover bespoke suits, Egyptian cotton shirts, wool trousers, or handcrafted neckwear.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-[#666666]">
                <p className="font-serif text-base text-[#111111]">No garments found for &ldquo;{searchTerm}&rdquo;</p>
                <p className="text-xs mt-1">Try searching by category such as &ldquo;Suits&rdquo; or &ldquo;Ties&rdquo;.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-[#666666] font-mono">
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
                      className="group flex gap-4 p-3 bg-[#FAF9F6] border border-black/10 hover:border-[#8C6D3B] hover:bg-white transition-all cursor-pointer shadow-xs"
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
                          <span className="text-[10px] uppercase tracking-widest text-[#8C6D3B] block mb-0.5 font-mono">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-serif text-[#111111] group-hover:text-[#8C6D3B] transition-colors truncate">
                            {product.name}
                          </h4>
                          <span className="text-[11px] text-[#666666] block truncate mt-0.5 font-mono">
                            SKU: {product.sku}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                          <span className="text-xs font-semibold tabular-nums text-[#111111]">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#8C6D3B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
          <div className="px-6 py-3 bg-[#FAF9F6] border-t border-black/10 flex items-center justify-between text-[11px] text-[#666666]">
            <span>Press ESC or click outside to dismiss</span>
            <span className="text-[#8C6D3B] font-medium">Park Avenue Private Atelier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
