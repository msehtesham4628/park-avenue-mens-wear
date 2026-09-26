import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  SlidersHorizontal, 
  ChevronRight, 
  Truck, 
  Scissors, 
  ShieldCheck, 
  RotateCcw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OFFICIAL_CATEGORIES, ProductCategory, Product } from '../../types';
import { ProductCard } from '../shop/ProductCard';
import { ProductDetailModal } from '../shop/ProductDetailModal';

export const CategoryPage: React.FC = () => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    selectedSubcategory, 
    setSelectedSubcategory, 
    openCategoryPage, 
    openCategoriesIndex,
    setActiveView, 
    products 
  } = useShop();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find category item configuration
  const currentCategoryItem = useMemo(() => {
    return OFFICIAL_CATEGORIES.find(
      c => c.queryValue.toLowerCase() === selectedCategory.toLowerCase() ||
           c.name.toLowerCase() === selectedCategory.toLowerCase() ||
           c.id.toLowerCase() === selectedCategory.toLowerCase()
    ) || OFFICIAL_CATEGORIES.find(c => c.id === 'suits')!;
  }, [selectedCategory]);

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

  const categoryStories: Record<string, { tag: string; headline: string; description: string; highlights: string[] }> = {
    'Suits': {
      tag: 'Bespoke Suiting Atelier',
      headline: 'Hand-Canvassed Half & Full Canvas Suiting',
      description: 'Engineered with hand-sewn horsehair canvas chest pieces, natural horn buttons, and Super 130s-150s worsted Australian merino wool woven by heritage mills in Biella, Italy.',
      highlights: ['Super 130s-150s Wool', 'Full & Half Canvas', 'Bespoke Alteration Included', 'Hand-Stitched Lapels']
    },
    'Blazers & Jackets': {
      tag: 'Structured & Deconstructed Tailoring',
      headline: 'Architectural Blazers & Supple Leather Outerwear',
      description: 'Precision cut tailored blazers and hand-buffed calfskin jackets. Balanced drape with roped shoulders or soft Neapolitan silhouette for versatile elegance.',
      highlights: ['Italian Mill Hopsack', 'Supple Nappa Leather', 'Mother-of-Pearl Buttons', 'Bespoke Sleeve Finish']
    },
    'Shirts': {
      tag: 'Fine Shirting Guild',
      headline: 'Egyptian Giza Cotton & Pure Silk Shirting',
      description: 'Tailored from two-ply 120/2 and 140/2 long-staple Egyptian cotton. Single-needle stitching, Australian mother-of-pearl buttons, and removable brass collar stays.',
      highlights: ['120/2 Two-Ply Cotton', 'Genuine Pearl Buttons', 'Split Yoke Comfort', 'French & Barrel Cuffs']
    },
    'Pants': {
      tag: 'Trousers & Sartorial Denim',
      headline: 'Tailored Wool Trousers & Kurabo Selvedge Denim',
      description: 'Curved curtain waistbands, pick-stitched fly fronts, and generous seam allowances for custom bespoke cuffing, break tailoring, and waist adjustments.',
      highlights: ['Curtain Waistband', 'Pick-Stitched Seams', 'Free Hem Alteration', 'Italian Stretch Wool']
    },
    'Outerwear': {
      tag: 'Artisanal Outerwear',
      headline: 'Pure Double-Faced Cashmere & Heavy Melton Overcoats',
      description: 'Engineered for thermal insulation and clean sartorial lines. Unlined double-faced cashmere and rain-repellent Loro Piana Storm System wool blends.',
      highlights: ['100% Mongolian Cashmere', 'Loro Piana Fabric', 'Storm-Proof Finish', 'Hand-Bound Edges']
    },
    'Sweaters & Knitwear': {
      tag: 'Scottish & Italian Knitwear',
      headline: 'Grade-A Cashmere & Extra-Fine Merino Knits',
      description: 'Spun from pure 2-ply Scottish cashmere and extra-fine 19.5-micron merino wool. Fully fashioned seamless shoulder construction for an immaculate second-skin fit.',
      highlights: ['2-Ply Grade-A Cashmere', 'Fully Fashioned Knit', 'Anti-Pilling Finish', 'Ribbed Horn Accents']
    },
    'Footwear': {
      tag: 'Cordwainer Guild',
      headline: 'Goodyear-Welted Footwear & Hand-Burnished Calfskin',
      description: 'Artisanal oxfords, monks, and Chelsea boots crafted from French box calf leather. Goodyear-welted construction allowing multiple re-solings over decades of wear.',
      highlights: ['Goodyear-Welted Sole', 'French Box Calfskin', 'Hand-Burnished Patina', 'Cork Footbed Molding']
    },
    'Accessories': {
      tag: 'Sartorial Details',
      headline: 'Woven Jacquard Silk Ties, Pocket Squares & Sterling Cufflinks',
      description: 'Untipped 7-fold Como silk ties, hand-rolled Italian silk pocket squares, and solid sterling silver hardware engineered to crown the gentleman’s silhouette.',
      highlights: ['7-Fold Como Silk', 'Hand-Rolled Edges', 'Solid Sterling Silver', 'Artisanal Presentation']
    },
    'Shorts': {
      tag: 'Warm-Weather Tailoring',
      headline: 'Pleated Linen & Stretch Cotton Sartorial Shorts',
      description: 'Refined warm-weather silhouettes cut with side adjusters, double pleats, and breathable Irish linen blends for Riviera leisure.',
      highlights: ['Irish Linen & Cotton', 'Side Buckle Adjusters', 'Forward Double Pleats', 'Tailored Inseam']
    }
  };

  const story = categoryStories[currentCategoryItem.name] || {
    tag: 'Park Avenue Menswear',
    headline: `${currentCategoryItem.name} Sartorial Collection`,
    description: currentCategoryItem.description || 'Handcrafted bespoke garments tailored with perfection.',
    highlights: ['Artisanal Tailoring', 'Bespoke Alterations', 'Worldwide Insured Courier', 'Park Avenue Guarantee']
  };

  const bgImage = categoryImages[currentCategoryItem.name] || '/Suits_image.png';

  // Subcategories available for this category
  const subcategoriesList = useMemo(() => {
    return currentCategoryItem.subcategories || [];
  }, [currentCategoryItem]);

  // Filter products by category, subcategory, search, stock, and sort
  const categoryProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Primary category match
      const pCat = (product.category || '').toLowerCase();
      const currentCatName = currentCategoryItem.name.toLowerCase();
      const currentQuery = currentCategoryItem.queryValue.toLowerCase();

      let matchesCategory = pCat === currentCatName || pCat === currentQuery;
      if (!matchesCategory) {
        if (currentCatName.includes('suit') && pCat.includes('suit')) matchesCategory = true;
        if (currentCatName.includes('blazer') && (pCat.includes('blazer') || pCat.includes('jacket'))) matchesCategory = true;
        if (currentCatName.includes('shirt') && pCat.includes('shirt')) matchesCategory = true;
        if (currentCatName.includes('pant') && (pCat.includes('pant') || pCat.includes('jean') || pCat.includes('trouser'))) matchesCategory = true;
        if (currentCatName.includes('outerwear') && (pCat.includes('coat') || pCat.includes('outerwear'))) matchesCategory = true;
        if (currentCatName.includes('sweater') && (pCat.includes('sweater') || pCat.includes('knitwear'))) matchesCategory = true;
        if (currentCatName.includes('footwear') && (pCat.includes('shoe') || pCat.includes('boot') || pCat.includes('loafer') || pCat.includes('footwear'))) matchesCategory = true;
        if (currentCatName.includes('accessories') && (pCat.includes('tie') || pCat.includes('accessory') || pCat.includes('accessories'))) matchesCategory = true;
        if (currentCatName.includes('short') && pCat.includes('short')) matchesCategory = true;
      }

      if (!matchesCategory) return false;

      // 2. Subcategory match if specified
      if (selectedSubcategory && selectedSubcategory !== 'All') {
        const subLower = selectedSubcategory.toLowerCase();
        const pNameLower = product.name.toLowerCase();
        const pDescLower = (product.description || '').toLowerCase();
        const pSubLower = (product.subtitle || '').toLowerCase();
        const matchesSub = pCat.includes(subLower) || pNameLower.includes(subLower) || pDescLower.includes(subLower) || pSubLower.includes(subLower);
        if (!matchesSub) return false;
      }

      // 3. Search query within this category
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q) ||
          (product.fabric || '').toLowerCase().includes(q) ||
          (product.description || '').toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 4. In-stock filter
      if (filterInStockOnly && (product.totalStock ?? 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [products, currentCategoryItem, selectedSubcategory, searchQuery, filterInStockOnly]);

  // Group products by name for color swatching
  const groupedProducts = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of categoryProducts) {
      const key = p.name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(p);
    }
    return Array.from(map.values()).map(list => ({
      primary: list[0],
      colorVariants: list.slice(1)
    }));
  }, [categoryProducts]);

  // Sort grouped products
  const sortedProducts = useMemo(() => {
    return [...groupedProducts].sort((a, b) => {
      if (sortBy === 'price-low') return a.primary.price - b.primary.price;
      if (sortBy === 'price-high') return b.primary.price - a.primary.price;
      if (sortBy === 'newest') return (b.primary.isNewArrival ? 1 : 0) - (a.primary.isNewArrival ? 1 : 0);
      return (b.primary.isFeatured ? 1 : 0) - (a.primary.isFeatured ? 1 : 0);
    });
  }, [groupedProducts, sortBy]);

  // Other categories for easy cross-shopping
  const otherCategories = useMemo(() => {
    return OFFICIAL_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'new-arrivals' && c.name !== currentCategoryItem.name);
  }, [currentCategoryItem]);

  return (
    <div className="w-full bg-[#FCFCFB] text-[#111827] min-h-screen pb-20">
      {/* 1. Atelier Department Hero Banner */}
      <section className="relative w-full overflow-hidden bg-[#0D1017] text-white">
        {/* Background Image with Ambient Luxury Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={bgImage}
            alt={currentCategoryItem.name}
            className="w-full h-full object-cover object-center brightness-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1017] via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0D1017]/50 to-[#0D1017]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:pt-16 sm:pb-20">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-gray-400 mb-6">
            <button 
              onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-[#E5C384] transition-colors cursor-pointer"
            >
              HOME
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <button 
              onClick={openCategoriesIndex}
              className="hover:text-[#E5C384] transition-colors cursor-pointer"
            >
              DEPARTMENTS
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-[#E5C384] font-semibold">{currentCategoryItem.name.toUpperCase()}</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/15 rounded-full text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.25em] text-[#E5C384]">
              <Sparkles className="w-3 h-3 text-[#E5C384]" />
              <span>{story.tag}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide text-white leading-tight font-light drop-shadow-md">
              {currentCategoryItem.name}
            </h1>

            <p className="text-sm sm:text-base text-gray-200/90 font-light leading-relaxed max-w-2xl drop-shadow-sm">
              {story.description}
            </p>

            {/* Department Highlights */}
            <div className="pt-2 flex flex-wrap gap-2 sm:gap-2.5">
              {story.highlights.map(item => (
                <span 
                  key={item}
                  className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xs text-[10px] sm:text-[11px] font-sans text-gray-200 tracking-wider uppercase font-medium"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner Details Ribbon: Alterations, Courier, Guarantees */}
        <div className="relative border-t border-white/10 bg-black/40 backdrop-blur-md py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-gray-300">
            <div className="flex items-center gap-2 text-[#E5C384]">
              <Scissors className="w-3.5 h-3.5" />
              <span>Bespoke Tailoring &amp; Alteration Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Truck className="w-3.5 h-3.5 text-[#E5C384]" />
              <span>Express Insured Courier • Live Real-Time Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 hidden md:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5C384]" />
              <span>Master Tailor Consultation Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Subcategory Navigation Pills & Filter Toolbar */}
      <section className="sticky top-[58px] sm:top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Subcategory Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedSubcategory('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  !selectedSubcategory || selectedSubcategory === 'All'
                    ? 'bg-[#111827] text-white shadow-xs' 
                    : 'bg-[#F4F4F3] text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
              >
                All {currentCategoryItem.name} ({categoryProducts.length})
              </button>

              {subcategoriesList.map(sub => {
                const isSelected = selectedSubcategory?.toLowerCase() === sub.toLowerCase();
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(isSelected ? 'All' : sub)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      isSelected 
                        ? 'bg-[#936B34] text-white shadow-xs' 
                        : 'bg-[#F4F4F3] text-gray-700 hover:bg-gray-200 hover:text-black'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Sort & Filter Toggle */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs">
              {/* In-Stock Filter */}
              <label className="flex items-center gap-1.5 text-xs text-gray-600 font-mono uppercase cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterInStockOnly}
                  onChange={(e) => setFilterInStockOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#936B34] rounded-xs cursor-pointer"
                />
                <span className="text-[11px] tracking-wider">In Stock</span>
              </label>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 bg-[#F9F9F8] border border-gray-200 px-2 py-1 rounded-xs">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-gray-800 font-mono uppercase tracking-wider focus:outline-none cursor-pointer"
                  aria-label="Sort garments"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Garments Product Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Category Header Meta Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-gray-500">
              Showing <span className="text-[#111827] font-semibold">{sortedProducts.length}</span> Sartorial Styles in {currentCategoryItem.name}
            </h2>
            {selectedSubcategory && (
              <span className="px-2 py-0.5 bg-[#936B34]/10 text-[#936B34] text-[10px] font-mono rounded-xs">
                • {selectedSubcategory}
              </span>
            )}
          </div>

          <button
            onClick={openCategoriesIndex}
            className="text-xs uppercase font-mono tracking-wider text-[#936B34] hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>All Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-gray-200 rounded-xs p-8 max-w-md mx-auto my-12">
            <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">No Matching Garments Found</h3>
            <p className="text-xs text-gray-500 mb-6">
              We could not find garments in {currentCategoryItem.name} matching your current filters.
            </p>
            <button
              onClick={() => {
                setSelectedSubcategory('All');
                setFilterInStockOnly(false);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-[0.2em] transition-colors rounded-xs cursor-pointer"
            >
              Reset Category Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {sortedProducts.map(({ primary, colorVariants }) => (
              <ProductCard
                key={primary.id}
                product={primary}
                colorProducts={colorVariants}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Atelier Craftsmanship Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-[#111827] text-white p-6 sm:p-10 border border-gray-800 rounded-xs shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="space-y-2 pr-0 md:pr-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E5C384]">ATELIER CRAFT</span>
              <h4 className="font-serif text-lg text-white uppercase">Master Tailor Fit Service</h4>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Every {currentCategoryItem.name.toLowerCase()} order includes complimentary alteration coverage and direct consultations with our Savile Row &amp; Milan-trained master tailors.
              </p>
            </div>

            <div className="space-y-2 pt-6 md:pt-0 px-0 md:px-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E5C384]">DIRECT DISPATCH</span>
              <h4 className="font-serif text-lg text-white uppercase">Insured Courier Shipment</h4>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Garments are protected in breathable garment bags and bespoke cedar-scented packaging with real-time GPS tracking from the atelier to your door.
              </p>
            </div>

            <div className="space-y-2 pt-6 md:pt-0 pl-0 md:pl-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E5C384]">FABRIC PROVENANCE</span>
              <h4 className="font-serif text-lg text-white uppercase">Heritage European Mills</h4>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Exclusively milled by century-old fabric houses: Vitale Barberis Canonico, Loro Piana, Thomas Mason, and Dormeuil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cross-Category Atelier Directory Strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 pt-10 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#936B34] block font-semibold">
              COMPLETE THE WARDROBE
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wide">
              Explore Complementary Atelier Departments
            </h3>
          </div>
          <button
            onClick={openCategoriesIndex}
            className="text-xs uppercase font-mono tracking-wider text-[#936B34] hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {otherCategories.map(cat => {
            const catImg = categoryImages[cat.name] || '/Suits_image.png';
            return (
              <button
                key={cat.id}
                onClick={() => openCategoryPage(cat.queryValue)}
                className="group flex flex-col bg-white border border-gray-200 hover:border-[#936B34] transition-all p-2 rounded-xs text-left cursor-pointer hover:shadow-md"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 mb-2 rounded-2xs">
                  <img
                    src={catImg}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-800 group-hover:text-[#936B34] line-clamp-1 font-medium">
                  {cat.name}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {cat.subcategories?.[0] || 'Atelier'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};
