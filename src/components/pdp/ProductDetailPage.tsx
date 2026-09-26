import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Scissors, 
  Truck, 
  Ruler, 
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { SizeGuideModal } from './SizeGuideModal';
import { estimateTaxByZip } from '../../services/taxEngine';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    setActiveView,
    setSelectedCategory,
    openCategoryPage,
    currentCustomer,
    showToast
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
      <div className="min-h-[75vh] flex items-center justify-center bg-white text-[#111827] px-4 py-20">
        <div className="max-w-md w-full border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 text-center flex flex-col items-center shadow-2xl">
          <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-medium">
            PARK AVENUE MENSWEAR
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider mb-4 font-light">
            NO PRODUCT SELECTED
          </h2>

          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed mb-8">
            The product detail view is connected to the backend catalog interface. Once garments are selected or published from the API, their complete specifications will display here.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => setActiveView('shop')}
              className="flex-1 px-6 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
            >
              EXPLORE READY-TO-WEAR
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 text-xs font-mono tracking-widest uppercase hover:border-[#936B34] hover:text-[#936B34] transition-colors cursor-pointer"
            >
              RETURN TO SALON
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const handleCalculateZipTax = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setZipTaxError('');
    if (!zipInput.trim()) {
      setZipTaxEstimate(null);
      return;
    }
    const estimate = estimateTaxByZip(zipInput.trim(), product.price);
    if (!estimate) {
      setZipTaxError('Please enter a valid 5-digit US ZIP code (e.g. 10021, 90210, 75001).');
      setZipTaxEstimate(null);
    } else {
      setZipTaxEstimate(estimate);
    }
  };

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
    if (!currentCustomer) { sessionStorage.setItem('pa_checkout_return','1'); showToast('Please sign in or create an account to proceed to checkout.', 'info'); setActiveView('login'); return; }
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
    <div className="min-h-screen bg-white text-[#111827] pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="py-4 text-xs font-mono uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-6">
          <button onClick={() => setActiveView('home')} className="hover:text-[#111827] transition-colors cursor-pointer">
            HOME
          </button>
          <span>/</span>
          <button 
            onClick={() => {
              openCategoryPage(product.category);
            }} 
            className="hover:text-[#111827] transition-colors cursor-pointer"
          >
            {product.category.toUpperCase()}
          </button>
          <span>/</span>
          <span className="text-[#936B34] truncate max-w-xs font-medium">{product.name}</span>
        </nav>

        {/* Main PDP Grid: Gallery Left, Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Gallery Column (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Media Placeholder */}
            <div className="relative aspect-[3/4] bg-[#F9F9F8] overflow-hidden border border-gray-200 shadow-2xl">
              <MediaPlaceholder
                label="PARK AVENUE MENSWEAR"
                category={product.category}
                aspectRatio="auto"
                className="w-full h-full min-h-[440px]"
                subtext={detailAngles[activeImageIndex] || product.name}
              />
              
              {/* Badge */}
              {product.isNewArrival && (
                <div className="absolute top-4 left-4 z-10 text-[9px] uppercase tracking-[0.25em] font-mono font-semibold text-white bg-[#936B34] px-3 py-1 shadow-md">
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
                  className={`aspect-[3/4] bg-[#F9F9F8] border p-2 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#936B34] bg-[#F3F4F6] shadow-sm'
                      : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-black/30'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[#936B34] block mb-1 font-medium">0{idx + 1}</span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-gray-500 line-clamp-2">
                    {angle}
                  </span>
                </button>
              ))}
            </div>

            {/* Atelier Craftsmanship Note */}
            <div className="p-6 bg-[#F9F9F8] border border-gray-200 space-y-3 mt-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#936B34] font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ATELIER INTEGRITY</span>
              </div>
              <p className="font-serif text-sm text-slate-200 leading-relaxed italic">
                &ldquo;Every Park Avenue commission is inspected across 14 checkpoints by our master tailors before dispatch, ensuring flawless drape, hand-finished pick stitching, and balance.&rdquo;
              </p>
            </div>
          </div>

          {/* Sticky Purchase Module Right (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-mono">
                <div className="flex items-center gap-2">
                  <ParkAvenueLogo variant="mark" size="sm" className="w-7 h-7" />
                  <span className="uppercase tracking-widest text-[#936B34] font-medium">{product.category}</span>
                </div>
                <span className="text-[10px] text-gray-400">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-light leading-tight mb-2 uppercase">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price & Inventory Status */}
            <div className="pb-4 border-b border-gray-200 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums text-[#111827]">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through tabular-nums">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono">
                {isOutOfStock ? (
                  <span className="text-red-400 font-medium">Sold Out</span>
                ) : availableStock <= 3 ? (
                  <span className="text-amber-400 font-medium">Only {availableStock} left in stock</span>
                ) : (
                  <span className="text-emerald-400 font-medium">In Stock — Dispatches in 24h</span>
                )}
              </div>
            </div>

            {/* Shipment Charges Banner */}
            <div className="p-3 bg-[#F9F9F8] border border-gray-200 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#936B34]" />
                <div>
                  <span className="text-gray-600 uppercase tracking-wider block">Shipment Charge:</span>
                  <span className="text-[11px] text-gray-500 font-sans">
                    {product.shippingCharge === 0 ? 'Complimentary atelier insured delivery' : 'UPS Ground / FedEx Insured Delivery (3–5 days)'}
                  </span>
                </div>
              </div>
              <strong className={product.shippingCharge === 0 ? 'text-emerald-700 font-semibold' : 'text-[#111827] font-semibold'}>
                {product.shippingCharge === 0 ? 'Free ($0.00)' : `+$${product.shippingCharge !== undefined ? product.shippingCharge : 15}.00`}
              </strong>
            </div>

            {/* Color Selector */}
            {allColors.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2.5 font-mono">
                  <span>COLOR: <strong className="text-[#111827] font-medium">{currentColor}</strong></span>
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
                            ? 'border-[#936B34] bg-[#936B34]/15 text-[#936B34] font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-black/30 hover:text-[#111827] bg-[#F9F9F8]'
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
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5 font-mono">
                <span>SIZE: <strong className="text-[#111827] font-medium">{currentSize}</strong></span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#936B34] hover:text-[#111827] flex items-center gap-1 cursor-pointer font-medium"
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
                          ? 'border-[#936B34] bg-[#111827] text-white font-semibold'
                          : !isAvailable
                          ? 'border-gray-100 text-gray-400 line-through cursor-not-allowed bg-transparent'
                          : 'border-gray-200 text-gray-600 hover:border-black/30 bg-[#F9F9F8]'
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
              <span className="text-xs font-mono uppercase text-gray-500">QUANTITY:</span>
              <div className="flex items-center border border-gray-200 bg-[#F9F9F8]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-[#111827] cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-mono text-[#111827]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-[#111827] cursor-pointer"
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
                className={`w-full py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-[#111827] text-white hover:bg-[#7A5726]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-4 border border-gray-300 hover:border-[#936B34] text-xs font-mono tracking-widest uppercase text-[#111827] hover:text-[#936B34] transition-colors text-center cursor-pointer shadow-xs bg-[#F9F9F8]"
                >
                  BUY NOW
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border transition-colors cursor-pointer flex items-center justify-center ${
                    isWishlisted
                      ? 'border-[#936B34] bg-[#936B34]/15 text-[#936B34]'
                      : 'border-gray-200 text-gray-500 hover:text-[#111827] hover:border-black/30 bg-[#F9F9F8]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#936B34]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Delivery, Estimated Tax & Atelier Alterations */}
            <div className="border-t border-gray-200 pt-5 space-y-4">
              
              {/* Interactive Sales Tax by ZIP Code Estimator */}
              <div className="p-4 bg-[#F9F9F8] border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#936B34] font-semibold">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>ESTIMATE SALES TAX BY ZIP CODE</span>
                  </div>
                  {zipTaxEstimate && (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs font-semibold">
                      {zipTaxEstimate.stateCode} APPLIED
                    </span>
                  )}
                </div>

                <form onSubmit={handleCalculateZipTax} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    value={zipInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setZipInput(v);
                      if (v.length === 5) {
                        const est = estimateTaxByZip(v, product.price);
                        if (est) {
                          setZipTaxEstimate(est);
                          setZipTaxError('');
                        } else {
                          setZipTaxEstimate(null);
                        }
                      } else {
                        setZipTaxEstimate(null);
                      }
                    }}
                    placeholder="Enter 5-digit US ZIP (e.g. 10021, 90210)"
                    className="flex-1 bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34] placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#111827] hover:bg-[#936B34] text-white text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 font-semibold shadow-xs"
                  >
                    CALCULATE
                  </button>
                </form>

                {zipTaxError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-mono">
                    <AlertCircle className="w-3 h-3" />
                    <span>{zipTaxError}</span>
                  </div>
                )}

                {zipTaxEstimate && (
                  <div className="mt-2 p-3 bg-white border border-gray-200 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Destination State:</span>
                      <strong className="text-[#111827]">{zipTaxEstimate.stateName} ({zipTaxEstimate.stateCode})</strong>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Statutory Tax Rate:</span>
                      <strong className="text-[#111827]">{zipTaxEstimate.taxRateFormatted}</strong>
                    </div>
                    <div className="flex items-center justify-between text-gray-700 pt-1 border-t border-gray-100">
                      <span>Estimated Tax:</span>
                      <strong className="text-[#936B34] text-sm tabular-nums">
                        {zipTaxEstimate.estimatedTax === 0 ? 'Exempt / $0.00' : `+$${zipTaxEstimate.estimatedTax.toFixed(2)}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[#111827] font-semibold pt-1 border-t border-gray-100">
                      <span>Estimated Total (Garment + Tax):</span>
                      <span className="text-[#111827] text-sm tabular-nums">
                        ${zipTaxEstimate.totalWithTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {zipTaxEstimate.notes && (
                      <p className="text-[10px] text-gray-600 pt-1 italic font-sans leading-normal">
                        * {zipTaxEstimate.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Delivery Information */}
              <div className="p-4 bg-[#F9F9F8] border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#936B34] font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  <span>INSURED LUXURY COURIER DISPATCH</span>
                </div>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  Dispatched via UPS Ground or FedEx Priority Air. Standard and expedited rates are calculated directly based on destination US state during checkout.
                </p>
              </div>

              {/* Alteration Information */}
              <div className="p-4 bg-[#F9F9F8] border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#936B34] font-medium">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>ATELIER MASTER TAILORING SERVICES</span>
                </div>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  Every Park Avenue suit and trouser commission includes precision master tailoring hemming and sleeve adjustments. Select your specs during checkout or track your garment with your Alteration ID.
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
