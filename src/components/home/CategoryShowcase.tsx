import React from 'react';
import { ArrowRight, ArrowUpRight, Sparkles, Compass } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { OFFICIAL_CATEGORIES, ProductCategory } from '../../types';
import { getCategorySlug } from '../../utils/router';

interface FeaturedCategoryCard {
  title: ProductCategory;
  displayName: string;
  tagline: string;
}

export const CategoryShowcase: React.FC = () => {
  const { openCategoryPage, openCategoriesIndex, products } = useShop();

  const taglineByCategory: Record<string, string> = {
    'Suits': 'Bespoke Half & Full Canvas',
    'Blazers & Jackets': 'Tailored Layers & Sport Coats',
    'Shirts': 'Giza Egyptian Cotton & Twill',
    'Pants': 'Tailored Trousers & Flannel',
    'Outerwear': 'Italian Wool & Pure Cashmere',
    'Sweaters & Knitwear': 'Fine Scottish & Mongolian Knitwear',
    'Footwear': 'Goodyear Welted Handcrafted Leather',
    'Accessories': 'Hand-Finished Silk Ties & Accents',
    'Shorts': 'Refined Sartorial Summer Cut'
  };

  const categoryCards = OFFICIAL_CATEGORIES
    .filter(c => c.id !== 'all' && c.id !== 'new-arrivals')
    .map(category => {
      const categoryProducts = products.filter(product => {
        const pCat = (product.category || '').toLowerCase();
        const cName = category.name.toLowerCase();
        const cQuery = category.queryValue.toLowerCase();
        if (pCat === cName || pCat === cQuery) return true;
        if (cName.includes('suit') && pCat.includes('suit')) return true;
        if (cName.includes('shirt') && pCat.includes('shirt')) return true;
        if (cName.includes('sweater') && (pCat.includes('sweater') || pCat.includes('knit'))) return true;
        if (cName.includes('footwear') && (pCat.includes('footwear') || pCat.includes('shoe') || pCat.includes('boot') || pCat.includes('loaf') || pCat.includes('loof'))) return true;
        if (cName.includes('pant') && (pCat.includes('pant') || pCat.includes('jean') || pCat.includes('trouser'))) return true;
        if (cName.includes('blazer') && (pCat.includes('blazer') || pCat.includes('jacket'))) return true;
        if (cName.includes('outerwear') && (pCat.includes('outerwear') || pCat.includes('coat'))) return true;
        if (cName.includes('accessor') && (pCat.includes('accessor') || pCat.includes('tie'))) return true;
        if (cName.includes('short') && pCat.includes('short')) return true;
        return category.subcategories?.some(sub => pCat.includes(sub.toLowerCase()));
      });
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
    if (category === 'All') {
      openCategoriesIndex();
    } else {
      openCategoryPage(category);
    }
  };

  const departments = OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals');

  return (
    <section id="category-showcase" className="py-20 sm:py-24 bg-white text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>SARTORIAL DIRECTORY</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] uppercase tracking-wide font-light">
              Departments &amp; Categories
            </h2>
          </div>
          <a
            href="/categories"
            onClick={(e) => {
              e.preventDefault();
              openCategoriesIndex();
            }}
            className="mt-4 sm:mt-0 text-xs font-mono uppercase tracking-[0.2em] text-[#111827] hover:text-white bg-white hover:bg-[#936B34] border border-gray-300 hover:border-[#936B34] px-4 sm:px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 font-medium cursor-pointer group shadow-xs active:scale-95"
          >
            <span>VIEW COMPLETE CATALOG</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Elevated Luxury Department Buttons Bar */}
        <div className="mb-14 p-5 sm:p-6 bg-[#FAF8F5] border border-gray-200/90 shadow-sm rounded-2xl sm:rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#936B34]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-gray-800 font-semibold">
                QUICK DEPARTMENT JUMP
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest hidden sm:inline">
              9 Tailoring Departments Available
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary 'All Collections' Button */}
            <a
              href="/categories"
              onClick={(e) => {
                e.preventDefault();
                openCategoriesIndex();
              }}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] border border-[#111827] hover:border-[#936B34] text-white text-xs font-mono uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer font-medium rounded-full active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C384]" />
              <span>ALL COLLECTIONS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>

            {/* Individual Atelier Department Buttons (Suits, Blazers, Shirts, etc.) */}
            {departments.map((cat) => (
              <a
                key={cat.id}
                href={`/${cat.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(cat.queryValue);
                }}
                className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-[#111827] border border-gray-300 hover:border-[#111827] text-gray-800 hover:text-white text-xs font-mono uppercase tracking-[0.15em] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer rounded-full active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#936B34] group-hover:bg-[#E5C384] transition-colors" />
                <span className="font-medium">{cat.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E5C384] transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Full-image category cards with refined interactive styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categoryCards.map((cat) => (
            <a
              key={cat.title}
              href={`/${getCategorySlug(cat.title)}`}
              onClick={(e) => {
                e.preventDefault();
                handleSelect(cat.title);
              }}
              className="group relative block w-full aspect-[4/5] overflow-hidden bg-[#F5F5F3] border border-gray-200 hover:border-[#936B34] text-left cursor-pointer transition-all duration-300 shadow-xs hover:shadow-xl rounded-2xl sm:rounded-3xl"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.displayName}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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

              {/* Luxury gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-all duration-500" />

              {/* Category card content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C384]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E5C384]">
                    {cat.tagline}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.1em] font-light mb-4 text-white group-hover:text-white transition-colors">
                  {cat.displayName}
                </h3>

                <span className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-xs border border-white/60 group-hover:border-[#E5C384] group-hover:bg-white group-hover:text-black px-5 py-2.5 text-[10px] sm:text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-full shadow-sm">
                  <span>DISCOVER COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
