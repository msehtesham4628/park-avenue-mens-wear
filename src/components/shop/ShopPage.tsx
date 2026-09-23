import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Search, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { Product } from '../../types';

export const ShopPage: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory,
    searchFilter,
    setSearchFilter,
    setActiveView
  } = useShop();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2200);
  const [availability, setAvailability] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  const categories = ['All', 'Suits', 'Dress Shirts', 'Dress Pants', 'Ties', 'New Arrivals'];

  const availableSizes = [
    '38R', '40R', '42R', '44R',
    '15.0 (38)', '15.5 (39)', '16.0 (41)', '16.5 (42)',
    '30W', '32W', '34W', '36W',
    'Classic (8cm)', 'Classic (8.5cm)'
  ];

  const availableColors = [
    { label: 'Midnight Navy', hex: '#1B263B' },
    { label: 'Charcoal Grey', hex: '#2B2D42' },
    { label: 'Crisp White', hex: '#F8F9FA' },
    { label: 'Sky Blue', hex: '#A2C2E1' },
    { label: 'Deep Burgundy', hex: '#722F37' },
    { label: 'Rich Camel', hex: '#C19A6B' },
    { label: 'Midnight Black', hex: '#121214' }
  ];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(2200);
    setAvailability('all');
    setSearchFilter('');
    setSortBy('featured');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    maxPrice < 2200 ||
    availability !== 'all' ||
    searchFilter.trim() !== '';

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Category filter
        if (selectedCategory !== 'All') {
          if (selectedCategory === 'New Arrivals') {
            if (!product.isNewArrival) return false;
          } else if (product.category !== selectedCategory) {
            return false;
          }
        }

        // Search Query filter
        if (searchFilter.trim() !== '') {
          const q = searchFilter.toLowerCase();
          const match = 
            product.name.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q) ||
            product.fabric.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Price filter
        if (product.price > maxPrice) return false;

        // Size filter
        if (selectedSizes.length > 0) {
          const hasMatchingSize = product.variants.some(
            v => selectedSizes.includes(v.size) && v.stock > 0
          );
          if (!hasMatchingSize) return false;
        }

        // Color filter
        if (selectedColors.length > 0) {
          const hasMatchingColor = product.variants.some(
            v => selectedColors.includes(v.color)
          );
          if (!hasMatchingColor) return false;
        }

        // Availability filter
        if (availability === 'in_stock') {
          if (product.totalStock <= 0) return false;
        } else if (availability === 'low_stock') {
          const hasLow = product.variants.some(v => v.stock > 0 && v.stock <= 3);
          if (!hasLow) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchFilter, maxPrice, selectedSizes, selectedColors, availability, sortBy]);

  return (
    <div className="min-h-screen bg-white text-[#111827] pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Breadcrumb & Header */}
        <div className="py-8 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#936B34] mb-2 font-mono">
            <span>Park Avenue Menswear</span>
            <span>/</span>
            <span>Ready-To-Wear &amp; Bespoke</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#111827] font-light">
                {selectedCategory === 'All' ? 'Complete Collection' : selectedCategory}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Super 150s virgin wool suits, Egyptian cotton dress shirts, worsted wool trousers, and seven-fold silk ties.
              </p>
            </div>

            <div className="text-xs text-gray-500 font-mono tabular-nums">
              Showing <span className="text-[#936B34] font-medium">{filteredProducts.length}</span> tailored pieces
            </div>
          </div>
        </div>

        {/* Top Controls Bar */}
        <div className="py-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-200">
          
          {/* Quick Categories Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#111827] text-white border-[#936B34] font-semibold'
                    : 'bg-[#F9F9F8] text-gray-500 border-gray-200 hover:border-gray-400 hover:text-[#111827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Controls: Search inside catalog + Sort */}
          <div className="flex items-center gap-3">
            {/* Inline search */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter current view..."
                className="w-full bg-[#F9F9F8] border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-[#111827] placeholder-slate-500 focus:border-[#936B34] focus:outline-none"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#111827] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden px-3 py-1.5 bg-[#F9F9F8] border border-gray-200 text-xs text-[#111827] flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#936B34]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#936B34]" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="bg-[#F9F9F8] border border-gray-200 text-xs text-[#111827] px-3 py-1.5 appearance-none pr-8 focus:border-[#936B34] focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured &amp; Tailored</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">New Arrivals First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Main Grid & Filters Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 pr-6 border-r border-gray-200">
            
            {/* Filter Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#111827] flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#936B34]" />
                <span>Refine Selection</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-[#936B34] hover:text-[#111827] flex items-center gap-1 transition-colors cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2 font-mono">
                <span className="uppercase tracking-wider">Maximum Price</span>
                <span className="text-[#936B34] font-semibold tabular-nums">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="180"
                max="2200"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#936B34] bg-gray-200 h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums font-mono">
                <span>$180</span>
                <span>$2,200</span>
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#936B34] mb-2.5 font-mono">
                Vault Availability
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Catalog' },
                  { id: 'in_stock', label: 'In Stock Only' },
                  { id: 'low_stock', label: 'Limited Run / Low Stock' }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer hover:text-[#936B34]">
                    <input
                      type="radio"
                      name="avail"
                      checked={availability === opt.id}
                      onChange={() => setAvailability(opt.id as any)}
                      className="accent-[#936B34]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#936B34] mb-2.5 font-mono">
                Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map(sz => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer font-mono ${
                        isSelected
                          ? 'border-[#936B34] bg-[#111827] text-white font-semibold'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-[#111827] bg-[#F9F9F8]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#936B34] mb-2.5 font-mono">
                Color Palette
              </span>
              <div className="space-y-2">
                {availableColors.map(color => {
                  const isSelected = selectedColors.includes(color.label);
                  return (
                    <button
                      key={color.label}
                      onClick={() => toggleColor(color.label)}
                      className="flex items-center justify-between w-full text-left text-xs py-1 text-gray-600 hover:text-[#111827] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={isSelected ? 'text-[#936B34] font-semibold' : ''}>
                          {color.label}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#936B34]" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Product Grid Area (3 Columns on desktop) */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 flex flex-col items-center justify-center relative shadow-xl">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/50 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-white shadow-md">
                  PA
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO PRODUCTS AVAILABLE
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-8">
                  {hasActiveFilters 
                    ? 'No garments match the active filter criteria. Clear filters or adjust your sartorial preferences.'
                    : 'The storefront architecture is ready. When products are published from the backend API or added through the admin console, they will dynamically populate here.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={resetAllFilters}
                    className="px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
                  >
                    RESET ALL FILTERS
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView('admin')}
                    className="px-6 py-3 border border-[#936B34] text-[#936B34] hover:bg-[#936B34] hover:text-white transition-colors text-xs font-mono tracking-widest uppercase cursor-pointer"
                  >
                    OPEN ADMIN INVENTORY
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white text-[#111827] border-l border-gray-200 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                  <span className="font-serif text-lg text-[#111827]">Refine Selection</span>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 text-gray-500 hover:text-[#111827] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                    <span>Max Price</span>
                    <span className="text-[#936B34] font-medium">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="180"
                    max="2200"
                    step="25"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#936B34]"
                  />
                </div>

                {/* Sizes */}
                <div className="mb-6">
                  <span className="block text-xs uppercase tracking-wider text-[#936B34] mb-2 font-mono">Size</span>
                  <div className="flex flex-wrap gap-1">
                    {availableSizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-2 py-1 text-xs border font-mono cursor-pointer ${
                          selectedSizes.includes(sz)
                            ? 'bg-[#111827] text-white font-semibold border-[#936B34]'
                            : 'border-gray-200 text-gray-500 bg-[#F9F9F8]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <span className="block text-xs uppercase tracking-wider text-[#936B34] mb-2 font-mono">Colors</span>
                  <div className="space-y-1.5">
                    {availableColors.map(c => (
                      <button
                        key={c.label}
                        onClick={() => toggleColor(c.label)}
                        className="flex items-center justify-between w-full text-xs text-gray-600 py-1 cursor-pointer"
                      >
                        <span>{c.label}</span>
                        {selectedColors.includes(c.label) && <Check className="w-3.5 h-3.5 text-[#936B34]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-[#111827] text-white font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-[#7A5726] transition-colors"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="w-full py-2 bg-transparent text-gray-500 text-xs hover:text-[#111827] cursor-pointer font-mono"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
