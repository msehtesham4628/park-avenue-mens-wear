import React from 'react';
import { ArrowRight, Sparkles, ChevronRight, Scissors, Truck, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OFFICIAL_CATEGORIES } from '../../types';

export const CategoriesIndexPage: React.FC = () => {
  const { openCategoryPage, setActiveView, products } = useShop();

  const categoryImages: Record<string, string> = {
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

  const categoryDescriptions: Record<string, { tag: string; desc: string }> = {
    'Suits': {
      tag: 'Bespoke Half & Full Canvas',
      desc: 'Hand-canvassed chest pieces, natural horn buttons, and Super 130s-150s worsted wool from Biella, Italy.'
    },
    'Blazers & Jackets': {
      tag: 'Tailored Layers & Calfskin',
      desc: 'Structured sports coats, Neapolitan soft-shoulder blazers, and hand-buffed calfskin leather outerwear.'
    },
    'Shirts': {
      tag: '120/2 Long-Staple Egyptian Cotton',
      desc: 'Single-needle stitching, Australian mother-of-pearl buttons, and split-yoke sartorial drape.'
    },
    'Pants': {
      tag: 'Tailored Trousers & Kurabo Denim',
      desc: 'Pick-stitched curtain waistbands with generous seam allowances for bespoke hem cuffing.'
    },
    'Outerwear': {
      tag: 'Double-Faced Cashmere & Melton',
      desc: 'Pure Mongolian cashmere overcoats and Loro Piana weather-resistant storm coats.'
    },
    'Sweaters & Knitwear': {
      tag: 'Scottish & Italian Cashmere',
      desc: 'Fully fashioned seamless knitwear crafted from grade-A cashmere and 19.5-micron merino wool.'
    },
    'Footwear': {
      tag: 'Goodyear-Welted French Box Calf',
      desc: 'Handcrafted oxford shoes, monk straps, and Chelsea boots engineered for decades of resoling.'
    },
    'Accessories': {
      tag: 'Como Silk & Sterling Hardware',
      desc: 'Untipped 7-fold Italian silk ties, hand-rolled pocket squares, and solid sterling silver cufflinks.'
    },
    'Shorts': {
      tag: 'Irish Linen & Cotton Tailoring',
      desc: 'Warm-weather pleated shorts with side adjusters tailored for coastal and Riviera leisure.'
    }
  };

  const categories = OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals');

  return (
    <div className="w-full bg-[#FCFCFB] text-[#111827] min-h-screen pb-24">
      {/* Editorial Header */}
      <section className="bg-[#0E1118] text-white py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-gray-400 mb-5">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-[#E5C384] transition-colors cursor-pointer"
            >
              HOME
            </a>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-[#E5C384] font-semibold">ALL DEPARTMENTS</span>
          </nav>

          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-white/15 rounded-full text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.25em] text-[#E5C384]">
              <Sparkles className="w-3 h-3 text-[#E5C384]" />
              <span>THE PARK AVENUE ATELIER DIRECTORY</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight font-light">
              Atelier Departments
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
              Explore our 9 distinct sartorial disciplines — each defined by artisanal benchwork, world-class fabric mills, and dedicated bespoke alteration services.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((category) => {
            const img = categoryImages[category.name] || '/Suits_image.png';
            const info = categoryDescriptions[category.name] || {
              tag: 'Park Avenue Menswear',
              desc: category.description
            };

            const count = products.filter(p => {
              const pCat = (p.category || '').toLowerCase();
              const cName = category.name.toLowerCase();
              return pCat.includes(cName) || cName.includes(pCat);
            }).length;

            return (
              <a
                key={category.id}
                href={`/${category.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  openCategoryPage(category.queryValue);
                }}
                className="group flex flex-col bg-white border border-gray-200 hover:border-[#936B34] transition-all duration-300 cursor-pointer overflow-hidden shadow-xs hover:shadow-xl rounded-xs"
              >
                {/* Visual Cover */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={img}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 text-[9px] font-mono uppercase tracking-[0.2em] text-[#E5C384] rounded-full">
                      {info.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl uppercase tracking-wider leading-none text-white drop-shadow-md">
                        {category.name}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider text-gray-300 bg-black/50 px-2 py-0.5 rounded-xs backdrop-blur-xs">
                      {count > 0 ? `${count} Pieces` : 'Collection'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    {info.desc}
                  </p>

                  {/* Subcategories tags */}
                  {(category.subcategories || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {category.subcategories.map(sub => (
                        <span 
                          key={sub}
                          className="px-2 py-0.5 bg-[#F9F9F8] border border-gray-200 text-[10px] font-mono text-gray-600 uppercase tracking-wider rounded-xs"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Action */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#936B34] font-semibold group-hover:text-black transition-colors flex items-center gap-1.5">
                      <span>Explore Department</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      Dedicated Page
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Atelier Reassurance Services */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-200 p-6 sm:p-8 rounded-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F9F9F8] border border-gray-200 flex items-center justify-center shrink-0">
              <Scissors className="w-5 h-5 text-[#936B34]" />
            </div>
            <div>
              <h3 className="font-serif text-sm uppercase tracking-wider text-[#111827] mb-1">
                Bespoke Alteration Guarantee
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Receive complimentary custom sleeve adjustments, trouser cuffing, and waist tailoring by certified master tailors.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F9F9F8] border border-gray-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#936B34]" />
            </div>
            <div>
              <h3 className="font-serif text-sm uppercase tracking-wider text-[#111827] mb-1">
                Insured Courier Shipment
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Direct dispatch from our atelier with express delivery, real-time tracking number, and garment protection packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F9F9F8] border border-gray-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#936B34]" />
            </div>
            <div>
              <h3 className="font-serif text-sm uppercase tracking-wider text-[#111827] mb-1">
                Mill Authentication
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Every fabric is certified genuine from Vitale Barberis Canonico, Loro Piana, Thomas Mason, or Kurabo Mills.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
