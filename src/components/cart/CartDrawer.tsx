import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { getColorHex, isLightColor } from '../../utils/colorUtils';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    setActiveView,
    navigateToProduct,
    currentCustomer,
    showToast
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col text-[#111827]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#F9F9F8]">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#936B34]" />
              <h2 className="font-serif text-lg text-[#111827] tracking-widest uppercase">
                SHOPPING BAG
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Insured Atelier Delivery Information & Free Shipping Progress */}
          <div className="px-6 py-3.5 bg-[#F9F9F8] border-b border-gray-200">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-[#936B34] font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {cartSubtotal >= 200 ? (
                    <strong className="text-emerald-700">FREE SHIPPING UNLOCKED</strong>
                  ) : (
                    <span>ADD <strong>${(200 - cartSubtotal).toFixed(2)}</strong> FOR FREE SHIPPING</span>
                  )}
                </span>
              </div>
              <span className="font-semibold text-gray-500">
                {cartSubtotal >= 200 ? 'QUALIFIED' : `$${cartSubtotal.toFixed(0)} / $200`}
              </span>
            </div>
            {/* Free Shipping Progress Meter */}
            <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${cartSubtotal >= 200 ? 'bg-emerald-600' : 'bg-[#936B34]'}`}
                style={{ width: `${Math.min(100, Math.max(0, (cartSubtotal / 200) * 100))}%` }}
              />
            </div>
          </div>

          {/* Cart Items List or Required Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {cart.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-6 border border-[#936B34]/50 flex items-center justify-center font-serif text-base text-[#936B34] tracking-widest bg-[#F9F9F8] shadow-md">
                  PA
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>

                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-8 font-light">
                  YOUR CART IS EMPTY
                </h3>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('shop');
                  }}
                  className="px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.25em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const variant = item.product.variants?.find(
                  v => v.size === item.selectedSize && v.color === item.selectedColor
                );
                const maxStock = variant ? variant.stock : (item.product.totalStock ?? 10);

                return (
                  <div key={item.id} className="pt-6 first:pt-0 flex gap-4 border-b border-gray-200 pb-6">
                    {/* Thumbnail Slot */}
                    <div 
                      onClick={() => {
                        navigateToProduct(item.product.sku || item.productId, item.product.category);
                        setIsCartOpen(false);
                      }}
                      className="w-20 h-28 shrink-0 cursor-pointer overflow-hidden group bg-[#F5F5F3] border border-gray-200 relative"
                    >
                      {(item.product.images?.[0] || item.product.colorImages?.[item.selectedColor]?.[0] || item.product.productViews?.front) ? (
                        <img
                          src={item.product.colorImages?.[item.selectedColor]?.[0] || item.product.images?.[0] || item.product.productViews?.front}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <MediaPlaceholder
                          label="PA"
                          category={item.product.category}
                          aspectRatio="portrait"
                          minimal
                          className="w-full h-full p-2"
                        />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 
                            onClick={() => {
                              navigateToProduct(item.product.sku || item.productId, item.product.category);
                              setIsCartOpen(false);
                            }}
                            className="font-serif text-sm text-[#111827] hover:text-[#936B34] transition-colors cursor-pointer line-clamp-1 uppercase"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>SIZE: <strong className="text-[#111827] font-semibold">{item.selectedSize}</strong></span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span>COLOR:</span>
                            <span 
                              className={`inline-block w-2.5 h-2.5 rounded-full border ${isLightColor(getColorHex(item.selectedColor)) ? 'border-gray-400' : 'border-black/20'}`}
                              style={{ backgroundColor: getColorHex(item.selectedColor) }}
                            />
                            <strong className="text-[#111827] font-semibold">{item.selectedColor}</strong>
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                          <span>Shipment: </span>
                          <span className={item.product.shippingCharge === 0 ? 'text-emerald-700 font-semibold' : 'text-gray-700'}>
                            {item.product.shippingCharge === 0 ? 'Free' : `+$${item.product.shippingCharge !== undefined ? item.product.shippingCharge : 15} Insured`}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-200 bg-[#F9F9F8]">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono text-[#111827]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-1.5 text-gray-500 hover:text-[#111827] transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-medium text-[#111827] tabular-nums">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Bag Actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-[#F9F9F8] space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-gray-500">
                  <span>SUBTOTAL</span>
                  <span className="text-[#111827] font-semibold">${cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>STANDARD DELIVERY</span>
                  <span className={cartSubtotal >= 200 ? "text-emerald-700 font-semibold" : "text-[#111827] font-semibold"}>
                    {cartSubtotal >= 200 ? 'FREE ($0.00)' : '$15.00'}
                  </span>
                </div>
                {cartSubtotal >= 200 && (
                  <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 justify-end">
                    <span>✓ Free shipping on orders &gt; $200</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold text-[#111827]">
                  <span>ESTIMATED TOTAL</span>
                  <span className="text-[#936B34] tabular-nums">
                    ${(cartSubtotal + (cartSubtotal >= 200 ? 0 : 15)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Atelier Shipping Guarantee Notice */}
              <div className="p-3 bg-[#FAF8F5] border border-[#936B34]/30 space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[#936B34] text-[10px] font-mono uppercase font-bold tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Complimentary Insured Delivery</span>
                </div>
                <p className="text-[11px] font-mono text-gray-600 leading-relaxed">
                  {cartSubtotal >= 200 
                    ? 'Congratulations! Your order qualifies for free insured ground shipping.' 
                    : `Add $${(200 - cartSubtotal).toFixed(2)} more to your bag to enjoy free shipping.`}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (!currentCustomer) {
                    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('pa_checkout_return', '1');
                    showToast('Please sign in to proceed with checkout', 'info');
                    setActiveView('login');
                  } else {
                    setActiveView('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-semibold uppercase tracking-[0.25em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveView('cart');
                }}
                className="w-full py-2.5 bg-white border border-gray-300 hover:border-black text-gray-700 hover:text-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer text-center block"
              >
                VIEW DETAILED BAG (/cart)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
