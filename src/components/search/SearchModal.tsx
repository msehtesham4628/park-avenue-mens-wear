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
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen px-4 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col my-auto text-[#111827]">
          
          {/* Search Input Bar */}
          <div className="relative flex items-center px-6 py-5 border-b border-gray-200 bg-[#F9F9F8]">
            <Search className="w-5 h-5 text-[#936B34] mr-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by garment name, category, SKU, or fabric..."
              className="w-full bg-transparent text-base md:text-lg text-[#111827] placeholder-slate-500 focus:outline-none font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-gray-500 hover:text-[#111827] mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-gray-500 hover:text-[#111827] cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div className="px-6 py-3.5 bg-[#0B0F1A] border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 shrink-0 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-[#936B34]" />
              Trending:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {quickTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-2.5 py-1 text-xs text-gray-600 bg-[#F8F9FA] hover:bg-[#1A233A] hover:text-[#936B34] border border-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-6 bg-white">
            {searchTerm.trim() === '' ? (
              <div className="py-12 text-center text-gray-500">
                <p className="font-serif text-lg text-[#111827]">Search Park Avenue Menswear</p>
                <p className="text-xs mt-1 text-gray-500 max-w-sm mx-auto">
                  Type a keyword to discover bespoke suits, Egyptian cotton shirts, wool trousers, or handcrafted neckwear.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="font-serif text-base text-[#111827]">No garments found for &ldquo;{searchTerm}&rdquo;</p>
                <p className="text-xs mt-1">Try searching by category such as &ldquo;Suits&rdquo; or &ldquo;Ties&rdquo;.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-[#936B34] font-mono">
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
                      className="group flex gap-4 p-3 bg-[#F9F9F8] border border-gray-200 hover:border-[#936B34] hover:bg-[#F3F4F6] transition-all cursor-pointer shadow-lg"
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
                          <span className="text-[10px] uppercase tracking-widest text-[#936B34] block mb-0.5 font-mono">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-serif text-[#111827] group-hover:text-[#936B34] transition-colors truncate">
                            {product.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 block truncate mt-0.5 font-mono">
                            SKU: {product.sku}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs font-semibold tabular-nums text-[#111827]">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#936B34] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
          <div className="px-6 py-3 bg-[#F9F9F8] border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span>Press ESC or click outside to dismiss</span>
            <span className="text-[#936B34] font-medium">Park Avenue Private Atelier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
