import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { navigateToProduct, addToCart, toggleWishlist, isInWishlist } = useShop();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.find(v => v.stock > 0)?.size || product.variants?.[0]?.size || 'Standard'
  );
  const isWishlisted = isInWishlist(product.id);

  // Check stock for currently selected size
  const activeVariant = product.variants?.find(v => v.size === selectedSize);
  const isOutOfStock = activeVariant ? activeVariant.stock <= 0 : (product.totalStock ?? 0) <= 0;
  const isLowStock = activeVariant ? activeVariant.stock > 0 && activeVariant.stock <= 3 : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultColor = activeVariant?.color || product.variants?.[0]?.color || 'Standard';
    addToCart(product, selectedSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => navigateToProduct(product.id)}
      className="group flex flex-col bg-white border border-black/10 hover:border-[#8C6D3B] hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Product Media Area (Strictly Luxury Media Placeholder) */}
      <div className="relative aspect-[3/4] bg-[#FAF9F6] overflow-hidden">
        <MediaPlaceholder
          label="PARK AVENUE MENSWEAR"
          category={product.category}
          aspectRatio="auto"
          className="w-full h-full"
          subtext={product.name}
        />

        {/* Top Badges / Indicators */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.isNewArrival && (
            <span className="text-[9px] uppercase tracking-[0.25em] font-mono font-medium text-white bg-[#111111] px-2 py-0.5 shadow-xs">
              NEW ARRIVAL
            </span>
          )}
          {product.isFeatured && !product.isNewArrival && (
            <span className="text-[9px] uppercase tracking-[0.25em] font-mono font-medium text-[#111111] bg-white/95 px-2 py-0.5 border border-black/10 shadow-xs">
              SIGNATURE
            </span>
          )}
        </div>

        {/* Top Right Wishlist & Quick View */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 border backdrop-blur-md transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-[#8C6D3B] text-white border-[#8C6D3B]'
                : 'bg-white/90 text-[#111111] border-black/10 hover:text-[#8C6D3B] hover:border-[#8C6D3B]'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 bg-white/90 text-[#111111] border border-black/10 hover:border-[#8C6D3B] hover:text-[#8C6D3B] backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hover Quick Add to Bag Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white via-white/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              isOutOfStock
                ? 'bg-[#E5E7EB] text-[#888888] cursor-not-allowed border border-black/10'
                : 'bg-[#111111] text-white hover:bg-[#8C6D3B]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'OUT OF STOCK' : `QUICK ADD (${selectedSize})`}</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
        <div>
          {/* Category & Status */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-1">
            <span className="text-[#8C6D3B] font-medium">{product.category}</span>
            <div>
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Sold Out</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-medium">Low Stock</span>
              ) : (
                <span className="text-emerald-600 font-medium">Available</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base sm:text-lg text-[#111111] group-hover:text-[#8C6D3B] transition-colors line-clamp-1 font-light">
            {product.name}
          </h3>

          {/* Subtitle / Fabric info */}
          {product.subtitle && (
            <p className="text-xs text-[#666666] line-clamp-1 mt-1 font-light">
              {product.subtitle}
            </p>
          )}
        </div>

        <div>
          {/* Sizes Selector Pills */}
          {product.variants && product.variants.length > 0 && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex flex-wrap gap-1 mb-3 pt-2 border-t border-black/5"
            >
              {product.variants.map((v) => {
                const out = v.stock <= 0;
                const isSelected = v.size === selectedSize;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.size)}
                    className={`text-[9px] px-1.5 py-0.5 font-mono border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#8C6D3B] text-[#8C6D3B] bg-[#8C6D3B]/10 font-semibold'
                        : out
                        ? 'border-black/5 text-[#AAAAAA] line-through'
                        : 'border-black/10 text-[#666666] hover:border-black/30 hover:text-black bg-[#FAF9F6]'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Price & SKU */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-medium tabular-nums text-[#111111]">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#888888] line-through tabular-nums">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span className="text-[9px] font-mono text-[#888888] uppercase">
              {product.sku}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
