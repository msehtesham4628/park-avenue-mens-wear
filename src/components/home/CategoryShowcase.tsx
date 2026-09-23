import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { ProductCategory } from '../../types';

interface CategoryCardItem {
  title: ProductCategory;
  displayName: string;
}

export const CategoryShowcase: React.FC = () => {
  const { setSelectedCategory, setActiveView } = useShop();

  const categories: CategoryCardItem[] = [
    { title: 'Suits', displayName: 'SUITS' },
    { title: 'Dress Shirts', displayName: 'DRESS SHIRTS' },
    { title: 'Dress Pants', displayName: 'DRESS PANTS' },
    { title: 'Ties', displayName: 'TIES' }
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 pb-6 border-b border-gray-200">
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

        {/* 4 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((cat) => (
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
              <div className="space-y-2 mt-auto pt-2">
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-500">
                  PARK AVENUE MENSWEAR
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
