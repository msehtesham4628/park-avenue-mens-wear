import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    setActiveView,
    navigateToProduct
  } = useShop();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 250;
  const progressPercent = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 35;
  const estimatedTax = cartSubtotal * 0.08875; // NY tax 8.875%
  const grandTotal = cartSubtotal + shippingFee + estimatedTax;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-black/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-black/10 flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#8C6D3B]" />
              <h2 className="font-serif text-lg text-[#111111] tracking-widest uppercase">
                SHOPPING BAG
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#666666] hover:text-black transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Courier Progress */}
          <div className="px-6 py-3.5 bg-white border-b border-black/5">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-[#8C6D3B] font-medium">
                {cartSubtotal >= FREE_SHIPPING_THRESHOLD
                  ? '✓ COMPLIMENTARY EXPRESS DELIVERY UNLOCKED'
                  : `ADD $${remainingForFree.toFixed(0)} FOR COMPLIMENTARY DELIVERY`}
              </span>
            </div>
            <div className="w-full bg-[#FAF9F6] h-1.5 overflow-hidden border border-black/5">
              <div
                className="bg-[#8C6D3B] h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List or Required Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {cart.length === 0 ? (
              /* Exact required empty state:
                 PARK AVENUE MENSWEAR
                 YOUR CART IS EMPTY
                 CONTINUE SHOPPING */
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-6 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-base text-[#8C6D3B] tracking-widest bg-[#FAF9F6] shadow-xs">
                  PA
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8C6D3B] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>

                <h3 className="font-serif text-2xl text-[#111111] uppercase tracking-wider mb-8 font-light">
                  YOUR CART IS EMPTY
                </h3>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('shop');
                  }}
                  className="px-8 py-3.5 bg-[#111111] text-white text-xs font-semibold uppercase tracking-[0.25em] hover:bg-[#8C6D3B] transition-colors cursor-pointer shadow-sm"
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
                  <div key={item.id} className="pt-6 first:pt-0 flex gap-4 border-b border-black/5 pb-6">
                    {/* Media Placeholder Slot */}
                    <div 
                      onClick={() => {
                        navigateToProduct(item.productId);
                        setIsCartOpen(false);
                      }}
                      className="w-20 h-28 shrink-0 cursor-pointer overflow-hidden group"
                    >
                      <MediaPlaceholder
                        label="PA"
                        category={item.product.category}
                        aspectRatio="portrait"
                        minimal
                        className="w-full h-full p-2"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 
                            onClick={() => {
                              navigateToProduct(item.productId);
                              setIsCartOpen(false);
                            }}
                            className="font-serif text-sm text-[#111111] hover:text-[#8C6D3B] transition-colors cursor-pointer line-clamp-1 uppercase"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-[#666666] hover:text-red-500 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] font-mono text-[#666666] mt-1 space-x-2">
                          <span>SIZE: {item.selectedSize}</span>
                          <span>·</span>
                          <span>COLOR: {item.selectedColor}</span>
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-black/10 bg-[#FAF9F6]">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-[#666666] hover:text-black transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-1.5 text-[#666666] hover:text-black transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-medium text-[#111111] tabular-nums">
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

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-black/10 bg-[#FAF9F6] space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#666666]">
                  <span>SUBTOTAL</span>
                  <span className="text-[#111111] font-semibold">${cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>EXPRESS DELIVERY</span>
                  <span className="text-[#8C6D3B] font-medium">
                    {shippingFee === 0 ? 'COMPLIMENTARY' : `$${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>ESTIMATED TAX</span>
                  <span className="text-[#111111]">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-semibold text-[#111111]">
                  <span>ESTIMATED TOTAL</span>
                  <span className="text-[#8C6D3B] tabular-nums">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-[#111111] hover:bg-[#8C6D3B] text-white text-xs font-semibold uppercase tracking-[0.25em] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
