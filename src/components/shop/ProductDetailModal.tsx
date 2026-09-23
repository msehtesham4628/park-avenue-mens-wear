import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ArrowRight, Scissors } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist, navigateToProduct } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  // Initialize variant defaults if not set
  const currentSize = selectedSize || product.variants?.[0]?.size || 'Standard';
  const currentColor = selectedColor || product.variants?.[0]?.color || 'Standard';

  const matchedVariant = product.variants?.find(
    v => v.size === currentSize && v.color === currentColor
  ) || product.variants?.find(v => v.size === currentSize);

  const availableStock = matchedVariant ? matchedVariant.stock : (product.totalStock ?? 0);
  const isOutOfStock = availableStock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, currentSize, currentColor, quantity);
    if (res.success) {
      onClose();
    }
  };

  const handleGoToPDP = () => {
    onClose();
    navigateToProduct(product.id);
  };

  // Distinct available sizes and colors
  const allSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));
  const allColors = Array.from(new Set(product.variants?.map(v => v.color) || []));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 py-8 md:py-16 flex items-center justify-center">
        <div className="relative w-full max-w-4xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden z-10 text-[#F8FAFC]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-[#0E1526] border border-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Gallery Left: MediaPlaceholder */}
            <div className="relative bg-[#0B101D] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
              <div className="aspect-[3/4] overflow-hidden bg-[#090D16] relative shadow-lg">
                <MediaPlaceholder
                  label="PARK AVENUE MENSWEAR"
                  category={product.category}
                  aspectRatio="auto"
                  className="w-full h-full min-h-[300px]"
                  subtext={product.name}
                />
              </div>

              {/* Angles / Thumbnails */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {['FRONT SILHOUETTE', 'LAPEL DETAIL', 'WEAVE TEXTURE'].map((angle, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`p-2 border text-center transition-colors cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#C8A97E] bg-[#121B2F]' : 'border-white/10 opacity-70 hover:opacity-100 bg-[#0E1526]'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-[#C8A97E] block font-medium">0{idx + 1}</span>
                    <span className="text-[8px] font-mono uppercase text-slate-400">{angle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details Right */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-[#0E1526]">
              <div>
                {/* Monogram brand header */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#C8A97E] font-mono font-bold tracking-widest text-[11px] border border-[#C8A97E]/50 px-1.5 py-0.5 bg-[#090D16]">
                      PA
                    </span>
                    <span className="uppercase tracking-widest text-[#C8A97E] font-medium">{product.category}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">SKU: {product.sku}</span>
                </div>

                <h2 className="font-serif text-2xl text-white mb-2 font-light">
                  {product.name}
                </h2>

                <p className="text-xs text-slate-300 mb-4">
                  {product.subtitle}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-3 pb-4 border-b border-white/10">
                  <span className="font-sans text-2xl font-semibold tabular-nums text-white">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through tabular-nums">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[#C8A97E] font-serif italic">
                    {product.fabric.split('(')[0]}
                  </span>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-300 leading-relaxed my-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Color Selector */}
                {allColors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
                      <span>Color: <strong className="text-white font-medium">{currentColor}</strong></span>
                    </div>
                    <div className="flex gap-2">
                      {allColors.map(col => {
                        const variantWithColor = product.variants.find(v => v.color === col);
                        const isSelected = col === currentColor;
                        return (
                          <button
                            key={col}
                            onClick={() => setSelectedColor(col)}
                            className={`px-3 py-1.5 text-xs border transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-[#C8A97E] text-[#C8A97E] bg-[#C8A97E]/15 font-medium'
                                : 'border-white/10 text-slate-300 hover:text-white hover:border-white/30 bg-[#090D16]'
                            }`}
                          >
                            <span 
                              className="inline-block w-2.5 h-2.5 rounded-full mr-2 border border-white/20 align-middle"
                              style={{ backgroundColor: variantWithColor?.colorHex || '#333' }}
                            />
                            <span>{col}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>Selected Size: <strong className="text-white font-medium">{currentSize}</strong></span>
                    <span className="text-[11px]">
                      {isOutOfStock ? (
                        <span className="text-red-400 font-medium">Out of Stock</span>
                      ) : availableStock <= 3 ? (
                        <span className="text-amber-400 font-medium">Only {availableStock} left in stock</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">In Stock</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allSizes.map(sz => {
                      const v = product.variants.find(item => item.size === sz && item.color === currentColor) 
                                || product.variants.find(item => item.size === sz);
                      const isSelected = sz === currentSize;
                      const out = v ? v.stock <= 0 : false;

                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 text-xs border font-mono transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#C8A97E] text-[#090D16] bg-[#C8A97E] font-semibold'
                              : out
                              ? 'border-white/5 text-slate-600 line-through'
                              : 'border-white/10 text-slate-300 hover:border-white/30 hover:text-white bg-[#090D16]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-white/10 bg-[#090D16]">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs tabular-nums text-white font-medium font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                      disabled={quantity >= availableStock}
                      className="px-3 py-2 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isOutOfStock
                        ? 'bg-[#1E293B] text-slate-500 cursor-not-allowed border border-white/10'
                        : 'bg-[#C8A97E] text-[#090D16] hover:bg-[#D4AF37]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'border-[#C8A97E] text-[#C8A97E] bg-[#C8A97E]/15'
                        : 'border-white/10 text-slate-300 hover:text-white hover:border-white/30 bg-[#090D16]'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C8A97E]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* View Full Product Link */}
              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Scissors className="w-3.5 h-3.5 text-[#C8A97E]" />
                  <span>Complimentary tailoring included</span>
                </div>
                <button
                  onClick={handleGoToPDP}
                  className="text-xs uppercase tracking-wider text-[#C8A97E] hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer font-mono"
                >
                  <span>Full Specifications &amp; Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
