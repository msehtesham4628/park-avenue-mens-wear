import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ArrowRight, Scissors, Calculator, CheckCircle2, Truck } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { estimateTaxByZip } from '../../services/taxEngine';
import { extractProductColors } from '../../utils/colorUtils';

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
  const [zipInput, setZipInput] = useState('');
  const [zipTaxEstimate, setZipTaxEstimate] = useState<{
    stateCode: string;
    stateName: string;
    taxRate: number;
    taxRateFormatted: string;
    estimatedTax: number;
    totalWithTax: number;
    notes?: string;
  } | null>(null);
  const [zipTaxError, setZipTaxError] = useState('');

  if (!product) return null;

  const handleCalculateZipTax = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setZipTaxError('');
    if (!zipInput.trim()) {
      setZipTaxEstimate(null);
      return;
    }
    const estimate = estimateTaxByZip(zipInput.trim(), product.price);
    if (!estimate) {
      setZipTaxError('Please enter a valid 5-digit US ZIP code.');
      setZipTaxEstimate(null);
    } else {
      setZipTaxEstimate(estimate);
    }
  };

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
    navigateToProduct(product.id, product.category);
  };

  // Distinct available sizes and colors
  const allSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));
  const extractedColors = extractProductColors(product);
  const allColors = extractedColors.map(c => c.name);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 py-8 md:py-16 flex items-center justify-center">
        <div className="relative w-full max-w-4xl bg-white border border-gray-200 shadow-2xl overflow-hidden z-10 text-[#F8FAFC]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-gray-500 hover:text-[#111827] bg-[#F9F9F8] border border-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Gallery Left: Real Garment Image or MediaPlaceholder */}
            {(() => {
              const views: { label: string; url?: string }[] = [];
              if (product.productViews?.front || product.images?.[0]) {
                views.push({ label: 'Front View', url: product.productViews?.front || product.images?.[0] });
              }
              if (product.productViews?.back || product.images?.[1]) {
                views.push({ label: 'Back View', url: product.productViews?.back || product.images?.[1] });
              }
              if (product.productViews?.left || product.images?.[2]) {
                views.push({ label: 'Left View', url: product.productViews?.left || product.images?.[2] });
              }
              if (product.productViews?.right || product.images?.[3]) {
                views.push({ label: 'Right View', url: product.productViews?.right || product.images?.[3] });
              }
              if (product.productViews?.detail || product.images?.[4]) {
                views.push({ label: 'Detail View', url: product.productViews?.detail || product.images?.[4] });
              }

              const displayViews = views.length > 0 ? views : [
                { label: 'Front Silhouette', url: undefined },
                { label: 'Lapel Detail', url: undefined },
                { label: 'Weave Texture', url: undefined }
              ];
              const safeIndex = Math.min(activeImageIndex, displayViews.length - 1);
              const currentView = displayViews[safeIndex];

              return (
                <div className="relative bg-[#F8F9FA] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="aspect-[3/4] overflow-hidden bg-white relative shadow-lg">
                    {currentView?.url ? (
                      <img
                        src={currentView.url}
                        alt={`${product.name} - ${currentView.label}`}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <MediaPlaceholder
                        label="PARK AVENUE MENSWEAR"
                        category={product.category}
                        aspectRatio="auto"
                        className="w-full h-full min-h-[300px]"
                        subtext={product.name}
                      />
                    )}
                    {/* Image indicator badge */}
                    <div className="absolute top-2 left-2 bg-[#111827] text-white text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider">
                      {product.category}
                    </div>
                  </div>

                  {/* 3 to 5 Angles / Thumbnails */}
                  <div className={`grid grid-cols-${Math.min(displayViews.length, 5)} gap-2 mt-4`} style={{ gridTemplateColumns: `repeat(${Math.min(displayViews.length, 5)}, minmax(0, 1fr))` }}>
                    {displayViews.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`p-1 border text-center transition-colors cursor-pointer rounded-xs ${
                          safeIndex === idx ? 'border-[#936B34] bg-[#F3F4F6] ring-1 ring-[#936B34]' : 'border-gray-200 opacity-70 hover:opacity-100 bg-[#F9F9F8]'
                        }`}
                        aria-label={`View photo 0${idx + 1}`}
                      >
                        {v.url ? (
                          <div className="aspect-[3/4] mb-1 bg-gray-100 overflow-hidden">
                            <img src={v.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                        <span className="font-mono text-[9px] text-[#936B34] block font-medium">0{idx + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Product Details Right */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-[#F9F9F8]">
              <div>
                {/* Monogram brand header */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#936B34] font-mono font-bold tracking-widest text-[11px] border border-[#936B34]/50 px-1.5 py-0.5 bg-white">
                      PA
                    </span>
                    <span className="uppercase tracking-widest text-[#936B34] font-medium">{product.category}</span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl text-[#111827] mb-2 font-light">
                  {product.name}
                </h2>

                <p className="text-xs text-gray-600 mb-4">
                  {product.subtitle}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-3 pb-4 border-b border-gray-200">
                  <span className="font-sans text-2xl font-semibold tabular-nums text-[#111827]">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through tabular-nums">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[#936B34] font-serif italic">
                    {product.fabric.split('(')[0]}
                  </span>
                </div>

                {/* Shipment Charge Tag */}
                <div className="flex items-center justify-between p-2.5 bg-[#FBFBFA] border border-gray-200 mt-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#936B34]" />
                    <span className="text-gray-600">Shipment Charge:</span>
                  </div>
                  <strong className={product.shippingCharge === 0 ? 'text-emerald-700 font-semibold' : 'text-[#111827] font-semibold'}>
                    {product.shippingCharge === 0 ? 'Free Shipping (Insured)' : `+$${product.shippingCharge !== undefined ? product.shippingCharge : 15}.00 Insured Ground`}
                  </strong>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-gray-600 leading-relaxed my-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Color Selector */}
                {extractedColors.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                      <span>Color: <strong className="text-[#111827] font-medium">{currentColor}</strong></span>
                      <span className="text-[#936B34] text-[11px] font-mono">{extractedColors.length} {extractedColors.length === 1 ? 'shade' : 'shades'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedColors.map(colorItem => {
                        const isSelected = colorItem.name.toLowerCase() === currentColor.toLowerCase();
                        return (
                          <button
                            key={colorItem.name}
                            type="button"
                            onClick={() => setSelectedColor(colorItem.name)}
                            className={`px-3 py-1.5 text-xs font-mono border transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'border-[#936B34] text-[#111827] bg-[#936B34]/10 ring-1 ring-[#936B34] font-medium shadow-2xs'
                                : 'border-gray-200 text-gray-600 hover:text-[#111827] hover:border-gray-400 bg-white'
                            }`}
                          >
                            <span 
                              className={`inline-block w-3 h-3 rounded-full border ${
                                colorItem.isLight ? 'border-gray-400' : 'border-black/20'
                              }`}
                              style={{ backgroundColor: colorItem.hex }}
                            />
                            <span>{colorItem.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                    <span>Selected Size: <strong className="text-[#111827] font-medium">{currentSize}</strong></span>
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
                              ? 'border-[#936B34] text-white bg-[#936B34] font-semibold'
                              : out
                              ? 'border-gray-100 text-gray-400 line-through'
                              : 'border-gray-200 text-gray-600 hover:border-black/30 hover:text-[#111827] bg-white'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Sales Tax Estimator by ZIP Code */}
                <div className="mb-4 p-3 bg-[#F9F9F8] border border-gray-200 text-xs font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-gray-700 font-semibold uppercase text-[10px] tracking-wider">
                      <Calculator className="w-3.5 h-3.5 text-[#936B34]" />
                      ESTIMATE STATE SALES TAX
                    </span>
                    {zipTaxEstimate && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 border border-emerald-300">
                        {zipTaxEstimate.stateCode} APPLIED
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleCalculateZipTax} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      value={zipInput}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setZipInput(val);
                        if (val.length === 5) {
                          const est = estimateTaxByZip(val, product.price);
                          if (est) setZipTaxEstimate(est);
                        } else {
                          setZipTaxEstimate(null);
                        }
                      }}
                      placeholder="Enter 5-digit ZIP"
                      className="flex-1 bg-white border border-gray-300 px-2.5 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#111827] hover:bg-[#936B34] text-white text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                    >
                      CALCULATE
                    </button>
                  </form>
                  {zipTaxError && (
                    <p className="text-[11px] text-red-600 mt-1.5">{zipTaxError}</p>
                  )}
                  {zipTaxEstimate && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-[11px]">
                      <div className="flex justify-between text-gray-600">
                        <span>State:</span>
                        <strong className="text-[#111827]">{zipTaxEstimate.stateName} ({zipTaxEstimate.stateCode})</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Estimated Tax:</span>
                        <span className="font-semibold text-[#936B34]">
                          {zipTaxEstimate.estimatedTax === 0 ? 'Exempt / $0.00' : `+$${zipTaxEstimate.estimatedTax.toFixed(2)} (${zipTaxEstimate.taxRateFormatted})`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#111827] font-semibold border-t border-gray-200/60 pt-1">
                        <span>Total with Tax:</span>
                        <span className="text-[#111827]">${zipTaxEstimate.totalWithTax.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-gray-200 bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-500 hover:text-[#111827] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs tabular-nums text-[#111827] font-medium font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                      disabled={quantity >= availableStock}
                      className="px-3 py-2 text-gray-500 hover:text-[#111827] disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-[#111827] text-white hover:bg-[#7A5726]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'border-[#936B34] text-[#936B34] bg-[#936B34]/15'
                        : 'border-gray-200 text-gray-600 hover:text-[#111827] hover:border-black/30 bg-white'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#936B34]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* View Full Product Link */}
              <div className="pt-6 border-t border-gray-200 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <Scissors className="w-3.5 h-3.5 text-[#936B34]" />
                  <span>Atelier master tailoring included</span>
                </div>
                <button
                  onClick={handleGoToPDP}
                  className="text-xs uppercase tracking-wider text-[#936B34] hover:text-[#111827] flex items-center gap-1 font-medium transition-colors cursor-pointer font-mono"
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
