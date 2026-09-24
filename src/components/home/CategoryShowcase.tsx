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
  const { setSelectedCategory, setActiveView } = useShop();

  const featuredCards: FeaturedCategoryCard[] = [
    { title: 'Suits', displayName: 'SUITS', tagline: 'Bespoke Half & Full Canvas' },
    { title: 'Dress Shirts', displayName: 'DRESS SHIRTS', tagline: '120s 2-Ply Egyptian Cotton' },
    { title: 'Leather Jackets', displayName: 'LEATHER JACKETS', tagline: 'French Plonge Lambskin' },
    { title: 'Coats', displayName: 'COATS', tagline: 'Pure Italian 650g Cashmere' },
    { title: 'Loofers', displayName: 'LOOFERS', tagline: 'Belgian Glove-Soft Suede' },
    { title: 'Shoe', displayName: 'SHOES', tagline: 'Goodyear Welted French Calf' },
    { title: 'Ties', displayName: 'TIES', tagline: 'Handcrafted Como Grenadine Silk' },
    { title: 'Sweaters', displayName: 'SWEATERS', tagline: '4-Ply Scottish Cashmere' }
  ];

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

        {/* Featured Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredCards.map((cat) => (
            <div
              key={cat.title}
              onClick={() => handleSelect(cat.title)}
              className="group border border-gray-200 bg-white hover:bg-[#FBFBFA] hover:border-[#936B34] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col p-4 sm:p-5"
            >
              {/* Media Placeholder */}
              <div className="relative mb-5 overflow-hidden">
                <MediaPlaceholder
                  label="PARK AVENUE MENSWEAR"
                  category={cat.displayName}
                  aspectRatio="portrait"
                  className="w-full"
                />
              </div>

              {/* Card Content */}
              <div className="space-y-1.5 mt-auto pt-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#936B34]">
                  {cat.tagline}
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide group-hover:text-[#936B34] transition-colors">
                  {cat.displayName}
                </h3>

                <div className="pt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#936B34] group-hover:text-black transition-colors">
                  <span>SHOP NOW</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
