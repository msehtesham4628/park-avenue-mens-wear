import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Scissors, 
  Truck, 
  Ruler, 
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { SizeGuideModal } from './SizeGuideModal';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    setActiveView,
    setSelectedCategory
  } = useShop();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      const firstAvailableVariant = product.variants?.find(v => v.stock > 0) || product.variants?.[0];
      if (firstAvailableVariant) {
        setSelectedSize(firstAvailableVariant.size);
        setSelectedColor(firstAvailableVariant.color);
      }
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-white text-[#111111] px-4 py-20">
        <div className="max-w-md w-full border border-black/10 bg-[#FAF9F6] p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 mb-6 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-base text-[#8C6D3B] tracking-widest bg-white shadow-xs">
            PA
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#8C6D3B] mb-3 block font-medium">
            PARK AVENUE MENSWEAR
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#111111] uppercase tracking-wider mb-4 font-light">
            NO PRODUCT SELECTED
          </h2>

          <p className="text-xs text-[#666666] uppercase tracking-widest font-mono leading-relaxed mb-8">
            The product detail view is connected to the backend catalog interface. Once garments are selected or published from the API, their complete specifications will display here.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => setActiveView('shop')}
              className="flex-1 px-6 py-3.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#8C6D3B] transition-colors cursor-pointer shadow-sm"
            >
              EXPLORE CATALOGUE
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className="flex-1 px-6 py-3.5 border border-black/20 text-[#111111] text-xs font-mono tracking-widest uppercase hover:border-[#8C6D3B] hover:text-[#8C6D3B] transition-colors cursor-pointer"
            >
              ADMIN PORTAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSize = selectedSize || product.variants?.[0]?.size || 'Standard';
  const currentColor = selectedColor || product.variants?.[0]?.color || 'Standard';

  const matchedVariant = product.variants?.find(
    v => v.size === currentSize && v.color === currentColor
  ) || product.variants?.find(v => v.size === currentSize);

  const availableStock = matchedVariant ? matchedVariant.stock : (product.totalStock ?? 0);
  const isOutOfStock = availableStock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const allSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));
  const allColors = Array.from(new Set(product.variants?.map(v => v.color) || []));

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentSize, currentColor, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, currentSize, currentColor, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const detailAngles = [
    'FRONT VIEW & SILHOUETTE',
    'LAPEL & SHOULDER DETAIL',
    'FABRIC WEAVE TEXTURE',
    'INTERIOR TAILOR CANVAS'
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="py-4 text-xs font-mono uppercase tracking-widest text-[#666666] flex items-center gap-2 mb-6">
          <button onClick={() => setActiveView('home')} className="hover:text-black transition-colors cursor-pointer">
            HOME
          </button>
          <span>/</span>
          <button 
            onClick={() => {
              setSelectedCategory(product.category);
              setActiveView('shop');
            }} 
            className="hover:text-black transition-colors cursor-pointer"
          >
            {product.category.toUpperCase()}
          </button>
          <span>/</span>
          <span className="text-[#8C6D3B] truncate max-w-xs font-medium">{product.name}</span>
        </nav>

        {/* Main PDP Grid: Gallery Left, Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Gallery Column (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Media Placeholder */}
            <div className="relative aspect-[3/4] bg-[#FAF9F6] overflow-hidden border border-black/10 shadow-xs">
              <MediaPlaceholder
                label="PARK AVENUE MENSWEAR"
                category={product.category}
                aspectRatio="auto"
                className="w-full h-full min-h-[440px]"
                subtext={detailAngles[activeImageIndex] || product.name}
              />
              
              {/* Badge */}
              {product.isNewArrival && (
                <div className="absolute top-4 left-4 z-10 text-[9px] uppercase tracking-[0.25em] font-mono font-medium text-white bg-[#111111] px-3 py-1 shadow-sm">
                  NEW ARRIVAL
                </div>
              )}
            </div>

            {/* Architectural Angle Slots */}
            <div className="grid grid-cols-4 gap-3">
              {detailAngles.map((angle, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[3/4] bg-[#FAF9F6] border p-2 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#8C6D3B] bg-white shadow-xs'
                      : 'border-black/10 opacity-70 hover:opacity-100 hover:border-black/30'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[#8C6D3B] block mb-1 font-medium">0{idx + 1}</span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#666666] line-clamp-2">
                    {angle}
                  </span>
                </button>
              ))}
            </div>

            {/* Atelier Craftsmanship Note */}
            <div className="p-6 bg-[#FAF9F6] border border-black/10 space-y-3 mt-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C6D3B] font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ATELIER INTEGRITY</span>
              </div>
              <p className="font-serif text-sm text-[#111111] leading-relaxed italic">
                &ldquo;Every Park Avenue commission is inspected across 14 checkpoints by our master tailors before dispatch, ensuring flawless drape, hand-finished pick stitching, and balance.&rdquo;
              </p>
            </div>
          </div>

          {/* Sticky Purchase Module Right (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#666666] mb-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#8C6D3B] border border-[#8C6D3B]/40 px-1">
                    PA
                  </span>
                  <span className="uppercase tracking-widest text-[#8C6D3B] font-medium">{product.category}</span>
                </div>
                <span className="text-[10px] text-[#888888]">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] font-light leading-tight mb-2 uppercase">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs text-[#666666] leading-relaxed font-light">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price & Inventory Status */}
            <div className="pb-5 border-b border-black/10 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums text-[#111111]">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#888888] line-through tabular-nums">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono">
                {isOutOfStock ? (
                  <span className="text-red-500 font-medium">Sold Out</span>
                ) : availableStock <= 3 ? (
                  <span className="text-amber-600 font-medium">Only {availableStock} left in stock</span>
                ) : (
                  <span className="text-emerald-600 font-medium">In Stock — Dispatches in 24h</span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            {allColors.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-[#666666] mb-2.5 font-mono">
                  <span>COLOR: <strong className="text-[#111111] font-medium">{currentColor}</strong></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allColors.map(color => {
                    const isSelected = color === currentColor;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#8C6D3B] bg-[#8C6D3B]/10 text-[#8C6D3B] font-semibold'
                            : 'border-black/10 text-[#666666] hover:border-black/30 hover:text-black bg-[#FAF9F6]'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector & Size Guide */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#666666] mb-2.5 font-mono">
                <span>SIZE: <strong className="text-[#111111] font-medium">{currentSize}</strong></span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#8C6D3B] hover:text-[#111111] flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>SIZE GUIDE</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {allSizes.map(size => {
                  const variant = product.variants?.find(v => v.size === size);
                  const isAvailable = variant ? variant.stock > 0 : true;
                  const isSelected = size === currentSize;

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`py-2 text-xs font-mono border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-white font-semibold'
                          : !isAvailable
                          ? 'border-black/5 text-[#AAAAAA] line-through cursor-not-allowed bg-transparent'
                          : 'border-black/10 text-[#111111] hover:border-black/30 bg-[#FAF9F6]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 py-2">
              <span className="text-xs font-mono uppercase text-[#666666]">QUANTITY:</span>
              <div className="flex items-center border border-black/10 bg-[#FAF9F6]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm text-[#666666] hover:text-black cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-mono text-[#111111]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm text-[#666666] hover:text-black cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions: Add to Cart, Buy Now, Wishlist */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  isOutOfStock
                    ? 'bg-[#E5E7EB] text-[#888888] cursor-not-allowed border border-black/10'
                    : 'bg-[#111111] text-white hover:bg-[#8C6D3B]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-4 border border-black/20 hover:border-black text-xs font-mono tracking-widest uppercase text-[#111111] hover:text-black transition-colors text-center cursor-pointer shadow-xs bg-white"
                >
                  BUY NOW
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border transition-colors cursor-pointer flex items-center justify-center ${
                    isWishlisted
                      ? 'border-[#8C6D3B] bg-[#8C6D3B]/10 text-[#8C6D3B]'
                      : 'border-black/10 text-[#666666] hover:text-black hover:border-black/30 bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#8C6D3B]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Delivery & Alteration Information Accordions */}
            <div className="border-t border-black/10 pt-4 space-y-3">
              
              {/* Delivery Information */}
              <div className="p-4 bg-[#FAF9F6] border border-black/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C6D3B] font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  <span>COMPLIMENTARY EXPRESS DELIVERY</span>
                </div>
                <p className="text-xs text-[#666666] font-light leading-relaxed">
                  Dispatched via DHL Express Priority. Domestic orders delivered in 1–2 business days. Signature required upon handover.
                </p>
              </div>

              {/* Alteration Information */}
              <div className="p-4 bg-[#FAF9F6] border border-black/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C6D3B] font-medium">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>COMPLIMENTARY ATELIER ALTERATIONS</span>
                </div>
                <p className="text-xs text-[#666666] font-light leading-relaxed">
                  Every Park Avenue suit and trouser commission includes complimentary hemming and sleeve adjustments. Select your specs during checkout or track your garment with your Alteration ID.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
};
