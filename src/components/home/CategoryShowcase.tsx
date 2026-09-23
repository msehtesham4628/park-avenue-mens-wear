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
    <section id="category-showcase" className="py-24 bg-[#090D16] text-[#F8FAFC] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 pb-6 border-b border-white/10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] block mb-2 font-medium">
              PARK AVENUE MENSWEAR
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white uppercase tracking-wide font-light">
              DEPARTMENTS &amp; CATEGORIES
            </h2>
          </div>
          <button
            onClick={() => handleSelect('All')}
            className="mt-4 sm:mt-0 text-xs uppercase tracking-[0.25em] text-[#C8A97E] hover:text-white transition-colors flex items-center gap-2 font-medium cursor-pointer"
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
              className="group border border-white/10 bg-[#0E1422] hover:bg-[#121B2F] hover:border-[#C8A97E] hover:shadow-2xl hover:shadow-black/70 transition-all duration-300 cursor-pointer flex flex-col p-4 sm:p-5"
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
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400">
                  PARK AVENUE MENSWEAR
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-white uppercase tracking-wide group-hover:text-[#C8A97E] transition-colors">
                  {cat.displayName}
                </h3>

                <div className="pt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#C8A97E] group-hover:text-white transition-colors">
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
