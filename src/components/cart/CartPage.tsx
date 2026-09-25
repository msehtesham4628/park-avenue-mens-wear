import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Tag, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { navigateTo } from '../../utils/router';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartCount,
    setActiveView,
    navigateToProduct,
    showToast
  } = useShop();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'BESPOKE10' || clean === 'WELCOME10') {
      setDiscountPercent(10);
      setAppliedPromo(clean);
      showToast('10% Atelier Privileges discount applied!', 'success');
      setPromoCode('');
    } else if (clean === 'PARKAVENUE' || clean === 'PATRON') {
      setDiscountPercent(15);
      setAppliedPromo(clean);
      showToast('15% VIP Patron discount applied!', 'success');
      setPromoCode('');
    } else {
      showToast('Invalid or expired promotional invitation code.', 'error');
    }
  };

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - discountAmount);
  const handleCheckout = () => {
    setActiveView('checkout');
    navigateTo('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueShopping = () => {
    setActiveView('shop');
    navigateTo('/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider mb-6">
          <button 
            onClick={() => { setActiveView('home'); navigateTo('/'); }} 
            className="hover:text-[#936B34] transition-colors cursor-pointer"
          >
            HOME
          </button>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <button 
            onClick={() => { setActiveView('shop'); navigateTo('/shop'); }} 
            className="hover:text-[#936B34] transition-colors cursor-pointer"
          >
            COLLECTIONS
          </button>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-[#111827] font-semibold">SHOPPING BAG</span>
        </nav>

        {/* Page Title & Count */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#936B34] font-semibold block mb-1">
              PARK AVENUE ATELIER
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-light">
              SHOPPING BAG
            </h1>
          </div>
          <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
            {cartCount} {cartCount === 1 ? 'GARMENT SELECTED' : 'GARMENTS SELECTED'}
          </p>
        </div>

        {/* ========================================================= */}
        {/* EMPTY BAG STATE                                           */}
        {/* ========================================================= */}
        {cart.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 sm:p-20 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#F9F9F8] border border-[#936B34]/40 flex items-center justify-center text-[#936B34]">
              <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#936B34] font-semibold block mb-2">
              BAG IS VACANT
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light mb-3">
              YOUR SHOPPING BAG IS CURRENTLY EMPTY
            </h2>
            <p className="text-xs text-gray-500 font-mono max-w-md mx-auto leading-relaxed mb-8">
              Explore our handcrafted Italian canvassed suits, bespoke Egyptian cotton shirts, and Goodyear-welted footwear.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveView('shop');
                  navigateTo('/suits');
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#111827] text-white hover:bg-[#936B34] active:bg-[#7a5829] active:scale-[0.99] transition-all text-xs uppercase tracking-widest font-semibold cursor-pointer shadow-sm"
              >
                EXPLORE SUITS
              </button>
              <button
                onClick={() => {
                  setActiveView('shop');
                  navigateTo('/shop');
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-300 text-[#111827] hover:border-[#936B34] hover:text-[#936B34] transition-all text-xs uppercase tracking-widest font-medium cursor-pointer"
              >
                ALL COLLECTIONS
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* POPULATED CART LAYOUT                                     */
          /* ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Table Header on Desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-wider text-gray-400 pb-3 border-b border-gray-200">
                <span className="col-span-6">GARMENT / SPECIFICATION</span>
                <span className="col-span-2 text-center">QUANTITY</span>
                <span className="col-span-2 text-right">UNIT PRICE</span>
                <span className="col-span-2 text-right">TOTAL</span>
              </div>

              {/* Items List */}
              {cart.map((item) => {
                const itemTotal = item.product.price * item.quantity;

                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-gray-200 p-4 sm:p-6 shadow-xs flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center"
                  >
                    {/* Garment Details (6 cols) */}
                    <div className="sm:col-span-6 flex items-start gap-4">
                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => navigateToProduct(item.product.id)}
                        className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-[#F5F5F3] border border-gray-200 overflow-hidden cursor-pointer relative group"
                      >
                        <MediaPlaceholder
                          category={item.product.category}
                          label={item.product.name}
                          aspectRatio="portrait"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#936B34] font-semibold block">
                          {item.product.category}
                        </span>
                        <h3 
                          onClick={() => navigateToProduct(item.product.id)}
                          className="font-serif text-base sm:text-lg text-[#111827] uppercase tracking-wide truncate cursor-pointer hover:text-[#936B34] transition-colors"
                        >
                          {item.product.name}
                        </h3>

                        <div className="mt-1.5 space-y-0.5 text-xs font-mono text-gray-500">
                          <div>
                            <span className="text-gray-400">SIZE:</span> <span className="text-[#111827] font-medium">{item.selectedSize}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">COLOR:</span> <span className="text-[#111827]">{item.selectedColor}</span>
                          </div>
                          {item.product.alterationEligible && (
                            <div className="inline-flex items-center gap-1 text-[10px] text-[#936B34] font-semibold uppercase tracking-wider mt-1 bg-[#936B34]/10 px-1.5 py-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Bespoke Tailor Alteration Included</span>
                            </div>
                          )}
                        </div>

                        {/* Mobile Remove Link */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="sm:hidden mt-3 text-xs font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>REMOVE</span>
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls (2 cols) */}
                    <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
                      <div className="flex items-center border border-gray-200 bg-[#FBFBFA]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-xs font-mono font-bold text-[#111827]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Unit Price (2 cols) */}
                    <div className="sm:col-span-2 text-right hidden sm:block">
                      <span className="text-xs font-mono text-gray-600">
                        ${item.product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Total & Desktop Remove (2 cols) */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-mono text-sm font-semibold text-[#111827]">
                        ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="hidden sm:inline-flex p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove from bag"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}

              {/* Continue Shopping & Empty Cart links */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="text-xs font-mono uppercase tracking-wider text-gray-600 hover:text-[#936B34] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>← CONTINUE SHOPPING</span>
                </button>
              </div>

            </div>

            {/* Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-xs">
                <h2 className="font-serif text-xl text-[#111827] uppercase tracking-wide font-light pb-4 border-b border-gray-100">
                  ORDER SUMMARY
                </h2>

                <div className="py-4 space-y-3 text-xs font-mono border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>GARMENT SUBTOTAL</span>
                    <span className="font-semibold text-[#111827]">
                      ${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>PROMO ({appliedPromo} -{discountPercent}%)</span>
                      <span className="font-semibold">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>ATELIER COURIER</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5">COMPLIMENTARY</span>
                    </span>
                    <span className="text-emerald-700 font-semibold">$0.00</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>SALES TAX</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="py-4 flex justify-between items-baseline border-b border-gray-100">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#111827] font-semibold">
                    ESTIMATED TOTAL
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-2xl text-[#111827] font-semibold block">
                      ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">USD · Taxes included in checkout</span>
                  </div>
                </div>

                {/* Promotional Invitation Code */}
                <form onSubmit={handleApplyPromo} className="pt-4 pb-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-medium">
                    PROMOTIONAL INVITATION CODE
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. BESPOKE10"
                        className="w-full pl-9 pr-3 py-2 bg-[#FBFBFA] border border-gray-200 text-xs font-mono uppercase text-[#111827] focus:outline-none focus:border-[#936B34]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-100 hover:bg-[#111827] hover:text-white text-gray-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
                    >
                      APPLY
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] font-mono text-gray-400">
                    Try &quot;BESPOKE10&quot; or &quot;PARKAVENUE&quot; for patron courtesy savings.
                  </p>
                </form>

                {/* Checkout CTA */}
                <div className="pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#111827] text-white hover:bg-[#936B34] active:bg-[#7a5829] active:scale-[0.99] transition-all font-semibold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4 text-[#936B34]" />
                  </button>

                  <p className="text-[10px] text-center font-mono text-gray-400 pt-1">
                    Complimentary White-Glove Suit Bag Included With Every Order
                  </p>
                </div>

              </div>

              {/* Guarantees Box */}
              <div className="bg-[#F9F9F8] border border-gray-200 p-5 space-y-3.5 text-xs font-mono text-gray-600">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-[#936B34] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111827] block uppercase tracking-wider text-[11px]">
                      COMPLIMENTARY DISPATCH
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Standard insured delivery on all sartorial orders across the continental US.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RotateCcw className="w-4 h-4 text-[#936B34] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111827] block uppercase tracking-wider text-[11px]">
                      30-DAY ATELIER RETURNS
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Unworn garments with original basting and tags eligible for full courtesy return.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#936B34] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111827] block uppercase tracking-wider text-[11px]">
                      COMPLIMENTARY FIRST ALTERATION
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Consult our master tailoring artisans or partner fitters for precision hemming and adjustments.
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
