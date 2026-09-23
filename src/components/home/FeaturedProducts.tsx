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
    { label: 'DRESS PANTS', value: 'Dress Pants' },
    { label: 'TIES', value: 'Ties' },
    { label: 'NEW ARRIVALS', value: 'New Arrivals' }
  ];

  const displayedProducts = products.filter(p => {
    if (activeTab === 'All') return p.isFeatured || p.isNewArrival || true;
    if (activeTab === 'New Arrivals') return p.isNewArrival;
    return p.category === activeTab;
  }).slice(0, 6);

  const handleExploreMore = () => {
    setSelectedCategory(activeTab);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-white text-[#111111] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-6 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#8C6D3B] mb-2 font-mono">
              <span className="font-bold border border-[#8C6D3B]/40 px-1">PA</span>
              <span>CURATED SELECTION</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light uppercase tracking-wide">
              FEATURED MENSWEAR &amp; TAILORING
            </h2>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-colors whitespace-nowrap border cursor-pointer ${
                  activeTab === tab.value
                    ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                    : 'bg-[#FAF9F6] text-[#666666] border-black/10 hover:border-black/30 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
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
          /* Exact Required Empty State:
             PARK AVENUE MENSWEAR
             PRODUCTS WILL APPEAR HERE */
          <div className="border border-black/10 bg-[#FAF9F6] py-24 px-6 text-center flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background geometric drafting grid */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />

            <div className="w-12 h-12 mb-6 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-base text-[#8C6D3B] tracking-widest bg-white shadow-xs">
              PA
            </div>

            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#8C6D3B] mb-3 block font-medium">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#111111] uppercase tracking-wider mb-4 font-light">
              PRODUCTS WILL APPEAR HERE
            </h3>

            <p className="text-xs text-[#666666] max-w-md uppercase tracking-widest font-mono leading-relaxed mb-8">
              The product architecture and service layers are connected. Once catalog inventory is published via the backend API or Admin Management portal, garments will render here automatically.
            </p>

            <button
              onClick={() => setActiveView('admin')}
              className="px-6 py-3 border border-[#8C6D3B] text-[#8C6D3B] hover:bg-[#8C6D3B] hover:text-white transition-colors text-xs font-mono tracking-widest uppercase flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>OPEN ADMIN PRODUCT PORTAL</span>
            </button>
          </div>
        )}

        {/* Section Bottom CTA (when products exist) */}
        {displayedProducts.length > 0 && (
          <div className="mt-14 text-center">
            <button
              onClick={handleExploreMore}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-transparent border border-black/20 hover:border-[#8C6D3B] text-xs uppercase tracking-[0.2em] text-[#111111] hover:text-[#8C6D3B] transition-colors cursor-pointer"
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
