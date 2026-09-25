import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { OFFICIAL_CATEGORIES, ProductCategory } from '../../types';

interface FeaturedCategoryCard {
  title: ProductCategory;
  displayName: string;
  tagline: string;
}

export const CategoryShowcase: React.FC = () => {
  const { setSelectedCategory, setActiveView, products } = useShop();

  const taglineByCategory: Record<string, string> = {
    'Suits': 'Bespoke Half & Full Canvas',
    'Blazers & Jackets': 'Tailored Layers & Jackets',
    'Shirts': 'Premium Egyptian Cotton',
    'Pants': 'Tailored Trousers & Denim',
    'Outerwear': 'Italian Wool & Cashmere',
    'Sweaters & Knitwear': 'Fine Scottish Knitwear',
    'Footwear': 'Handcrafted Leather Shoes',
    'Accessories': 'Hand-Finished Sartorial Details',
    'Shorts': 'Refined Casual Tailoring'
  };

  const categoryCards = OFFICIAL_CATEGORIES
    .filter(c => c.id !== 'all' && c.id !== 'new-arrivals')
    .map(category => {
      const categoryProducts = products.filter(product =>
        product.category === category.queryValue ||
        product.category === category.name ||
        category.subcategories.some(sub => product.category === sub)
      );
      const categoryImageMap: Record<string, string> = {
        'Suits': '/Suits_image.png',
        'Blazers & Jackets': '/Blazers_jackets_image.png',
        'Shirts': '/Shirts_image.png',
        'Pants': '/Pants_image.png',
        'Outerwear': '/Outwear_image.png',
        'Sweaters & Knitwear': '/Sweaters_kintwear_image.png',
        'Footwear': '/Footwear_image.png',
        'Accessories': '/Accessories_image.png',
        'Shorts': '/Shorts_image.png'
      };
      const image = categoryImageMap[category.name] || categoryProducts.find(product => product.images?.[0])?.images?.[0];
      return {
        title: category.queryValue as ProductCategory,
        displayName: category.name.toUpperCase(),
        tagline: taglineByCategory[category.name] || 'Park Avenue Menswear',
        image
      };
    });

  const handleSelect = (category: string) => {
    setSelectedCategory(category);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="category-showcase" className="py-24 bg-white text-[#111827] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-gray-200">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] block mb-2 font-semibold">
              PARK AVENUE MENSWEAR
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] uppercase tracking-wide font-light">
              DEPARTMENTS &amp; CATEGORIES
            </h2>
          </div>
          <button
            onClick={() => handleSelect('All')}
            className="mt-4 sm:mt-0 text-xs uppercase tracking-[0.25em] text-[#936B34] hover:text-black transition-colors flex items-center gap-2 font-medium cursor-pointer"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 13 Categories Quick Navigation Pills */}
        <div className="mb-12 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 font-semibold">
              EXPLORE ALL 13 ATELIER DEPARTMENTS
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals').map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.queryValue)}
                className="px-3.5 py-1.5 bg-[#F9F9F8] border border-gray-200 text-xs font-mono uppercase tracking-wider text-gray-700 hover:border-[#936B34] hover:text-[#111827] hover:bg-white transition-all cursor-pointer rounded-xs"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Full-image category cards with content over the image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categoryCards.map((cat) => (
            <button
              key={cat.title}
              type="button"
              onClick={() => handleSelect(cat.title)}
              className="group relative w-full aspect-[4/5] overflow-hidden bg-[#F5F5F3] border border-gray-200 text-left cursor-pointer"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.displayName}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <MediaPlaceholder
                  label="PARK AVENUE MENSWEAR"
                  category={cat.displayName}
                  aspectRatio="portrait"
                  className="absolute inset-0 w-full h-full"
                />
              )}

              {/* Luxury overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5 group-hover:from-black/80 transition-all duration-500" />

              {/* Category content inside image */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-white/80 mb-2">
                  {cat.tagline}
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.12em] font-light mb-4">
                  {cat.displayName}
                </h3>
                <span className="inline-flex items-center gap-2 border border-white/70 px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] font-medium group-hover:bg-white group-hover:text-black transition-all duration-300">
                  SHOP NOW <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
