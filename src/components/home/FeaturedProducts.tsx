import React, { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../shop/ProductCard';
import { ProductDetailModal } from '../shop/ProductDetailModal';
import { Product } from '../../types';

export const FeaturedProducts: React.FC = () => {
  const { products, setActiveView, setSelectedCategory } = useShop();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const tabs = [
    { label: 'ALL COLLECTIONS', value: 'All' },
    { label: 'SUITS', value: 'Suits' },
    { label: 'DRESS SHIRTS', value: 'Dress Shirts' },
    { label: 'SHOES & LOAFERS', value: 'Shoe' },
    { label: 'COATS & JACKETS', value: 'Coats' },
    { label: 'TIES', value: 'Ties' },
    { label: 'NEW ARRIVALS', value: 'New Arrivals' }
  ];

  const displayedProducts = products.filter(p => {
    if (activeTab === 'All') return p.isFeatured || p.isNewArrival || true;
    if (activeTab === 'New Arrivals') return p.isNewArrival;
    const tabNorm = activeTab.toLowerCase();
    const catNorm = (p.category || '').toLowerCase();
    if (tabNorm === 'shoe') {
      return catNorm.includes('shoe') || catNorm.includes('loof') || catNorm.includes('loaf') || catNorm.includes('boot');
    }
    if (tabNorm === 'coats') {
      return catNorm.includes('coat') || catNorm.includes('jacket');
    }
    return catNorm === tabNorm || catNorm.replace(/\s+/g, '') === tabNorm.replace(/\s+/g, '');
  }).slice(0, 8);

  const handleExploreMore = () => {
    setSelectedCategory(activeTab);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-white text-[#111827] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#936B34] mb-2 font-mono">
              <img src="/Park_Avenue_Logo.png" alt="Park Avenue Menswear" className="w-8 h-8 object-contain" />
              <span>CURATED SELECTION</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-light uppercase tracking-wide">
              FEATURED MENSWEAR &amp; TAILORING
            </h2>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {tabs.map(tab => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-mono tracking-widest uppercase transition-all whitespace-nowrap border cursor-pointer rounded-full active:scale-95 ${
                    isActive
                      ? 'bg-[#111827] text-white border-[#111827] shadow-xs font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#936B34] hover:text-[#111827]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#E5C384]' : 'bg-transparent border border-gray-300'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid or Elegant Empty State */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 bg-[#F9F9F8] py-24 px-6 text-center flex flex-col items-center justify-center relative overflow-hidden rounded-2xl">
            {/* Background geometric drafting grid */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />

            <div className="w-12 h-12 mb-6 border border-[#936B34] flex items-center justify-center font-serif text-base text-[#111827] tracking-widest bg-white shadow-xs rounded-full">
              PA
            </div>

            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-semibold">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider mb-4 font-light">
              PRODUCTS WILL APPEAR HERE
            </h3>

            <p className="text-xs text-gray-600 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-8">
              Handcrafted Italian canvassed suits, bespoke Egyptian cotton shirts, worsted wool trousers, and seven-fold silk neckwear curated by the atelier.
            </p>

            <button
              onClick={() => setActiveView('shop')}
              className="px-6 py-3 border border-[#111827] bg-[#111827] text-white hover:bg-[#936B34] hover:border-[#936B34] transition-colors text-xs font-mono font-medium tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-sm rounded-full active:scale-95"
            >
              <span>DISCOVER SARTORIAL COLLECTION</span>
            </button>
          </div>
        )}

        {/* Section Bottom CTA (when products exist) */}
        {displayedProducts.length > 0 && (
          <div className="mt-14 text-center">
            <button
              onClick={handleExploreMore}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-white hover:bg-[#111827] border border-gray-300 hover:border-[#111827] text-xs uppercase tracking-[0.2em] text-gray-800 hover:text-white transition-all duration-300 cursor-pointer shadow-xs rounded-full active:scale-95"
            >
              <span>EXPLORE ALL {activeTab === 'All' ? 'GARMENTS' : activeTab}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
};
