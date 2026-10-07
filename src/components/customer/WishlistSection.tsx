import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ExternalLink,
  Layers,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Product } from '../../types';

interface WishlistSectionProps {
  onBrowseShop?: () => void;
}

export const WishlistSection: React.FC<WishlistSectionProps> = ({ onBrowseShop }) => {
  const { 
    wishlist, 
    wishlistCount,
    toggleWishlist, 
    clearWishlist,
    products, 
    addToCart, 
    navigateToProduct, 
    setActiveView,
    setIsCartOpen,
    showToast 
  } = useShop();

  const [addingId, setAddingId] = useState<string | null>(null);

  // Match wishlist IDs with current product catalog (matching id, productId, or sku)
  const savedProducts: Product[] = products.filter(p => 
    wishlist.includes(p.id) || 
    ((p as any).productId && wishlist.includes((p as any).productId)) || 
    (p.sku && wishlist.includes(p.sku))
  );

  // Auto-prune any orphaned IDs if catalog is loaded but no products match
  React.useEffect(() => {
    if (products.length > 0 && wishlist.length > 0 && savedProducts.length === 0) {
      clearWishlist();
    }
  }, [products.length, wishlist.length, savedProducts.length]);

  const totalValue = savedProducts.reduce((sum, p) => sum + (p.price || 0), 0);

  const handleMoveToBag = (product: Product) => {
    setAddingId(product.id);
    const defaultVariant = product.variants?.[0];
    const size = defaultVariant?.size || '40R';
    const color = defaultVariant?.color || product.colors?.[0] || 'Default';

    addToCart(product, size, color, 1);
    showToast(`Added "${product.name}" to your shopping bag`, 'success');
    
    setTimeout(() => {
      setAddingId(null);
      setIsCartOpen(true);
    }, 400);
  };

  const handleMoveAllToBag = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach(product => {
      const defaultVariant = product.variants?.[0];
      const size = defaultVariant?.size || '40R';
      const color = defaultVariant?.color || product.colors?.[0] || 'Default';
      addToCart(product, size, color, 1);
    });
    showToast(`Moved ${savedProducts.length} saved garments to your shopping bag!`, 'success');
    setIsCartOpen(true);
  };

  const handleViewProduct = (productId: string) => {
    navigateToProduct(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToShop = () => {
    if (onBrowseShop) {
      onBrowseShop();
    } else {
      setActiveView('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="wishlist-section" className="border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              SAVED GARMENTS &amp; WARDROBE
            </span>
            {savedProducts.length > 0 && (
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#FAF8F5] text-[#936B34] border border-[#936B34]/30 font-bold">
                {savedProducts.length} RESERVED
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] mt-1 font-light tracking-wide">
            Curated Patron Wishlist
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-1 max-w-xl">
            Garments saved for future fitting appointments, bespoke commissions, and seasonal acquisitions.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Curated Value</span>
              <span className="font-serif text-lg font-medium text-[#111827]">${totalValue.toLocaleString()}</span>
            </div>
            <button
              onClick={handleMoveAllToBag}
              className="px-4 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer font-medium shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E5C384]" />
              <span>MOVE ALL TO BAG</span>
            </button>
            <button
              onClick={clearWishlist}
              className="px-3 py-2.5 bg-white border border-gray-300 text-gray-700 hover:text-red-700 hover:border-red-300 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              title="Clear all saved garments"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {savedProducts.length === 0 ? (
        <div className="py-16 sm:py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FAF8F5] border border-gray-200 rounded-full flex items-center justify-center mb-5 text-[#936B34]">
            <Heart className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wider font-light">
            YOUR WISHLIST IS EMPTY
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-2 leading-relaxed">
            You have not saved any garments to your private atelier archive yet. Browse our master-tailored suits, Italian blazers, and Egyptian cotton dress shirts to build your wardrobe.
          </p>
          <button
            onClick={handleGoToShop}
            className="mt-6 px-6 py-3 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-[0.2em] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>EXPLORE CATALOGUE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedProducts.map((product) => {
              const displayImg = product.productViews?.front || product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800';
              const isAddingThis = addingId === product.id;
              const hasStock = (product.totalStock ?? 10) > 0;

              return (
                <div 
                  key={product.id}
                  className="border border-gray-200 bg-white flex flex-col justify-between group hover:border-[#936B34]/60 transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  {/* Top Image Frame */}
                  <div className="relative aspect-[3/4] bg-[#F8F9FA] overflow-hidden">
                    <ImageWithFallback
                      src={displayImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick remove icon button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer backdrop-blur-xs"
                      title="Remove from Wishlist"
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Category pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 bg-[#111827]/85 backdrop-blur-xs text-white text-[9px] font-mono uppercase tracking-widest font-medium">
                        {product.category || 'Atelier'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>SKU: {product.sku || 'PA-STD'}</span>
                        <span className={hasStock ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                          {hasStock ? '● In Stock' : '○ Made-to-Order'}
                        </span>
                      </div>

                      <h4 
                        onClick={() => handleViewProduct(product.id)}
                        className="font-serif text-base text-[#111827] group-hover:text-[#936B34] transition-colors cursor-pointer line-clamp-1 font-normal"
                        title={product.name}
                      >
                        {product.name}
                      </h4>

                      {product.fabric && (
                        <p className="text-[11px] text-gray-500 font-sans mt-0.5 line-clamp-1 italic">
                          {product.fabric}
                        </p>
                      )}

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-serif text-lg text-[#111827] font-semibold">
                          ${product.price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 uppercase">USD</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleMoveToBag(product)}
                        disabled={isAddingThis}
                        className="w-full py-2.5 px-3 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium shadow-xs disabled:opacity-50"
                      >
                        {isAddingThis ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ADDED TO BAG</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#E5C384]" />
                            <span>MOVE TO BAG</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="flex-1 py-1.5 px-2 bg-[#FAF8F5] hover:bg-gray-100 text-[#111827] text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium border border-gray-200"
                        >
                          <span>VIEW DETAILS</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="py-1.5 px-2.5 text-gray-400 hover:text-red-600 text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer border border-gray-200 hover:border-red-200 hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
