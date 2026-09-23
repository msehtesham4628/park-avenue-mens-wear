import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Scissors, 
  Check, 
  ArrowRight, 
  Truck, 
  ShoppingBag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    placeNewOrder, 
    setActiveView, 
    setCurrentOrder,
    showToast 
  } = useShop();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - clean defaults ready for user input
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    // Alteration options
    needAlteration: false,
    trouserHemType: 'Half Break (Modern Classic)',
    inseamLength: '',
    jacketSleeveAdjustment: 'None (Standard)',
    specialTailorNotes: ''
  });

  const [orderComplete, setOrderComplete] = useState<any>(null);

  const FREE_SHIPPING_THRESHOLD = 250;
  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 35;
  const estimatedTax = cartSubtotal * 0.0825;
  const grandTotal = cartSubtotal + shippingFee + estimatedTax;

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white text-[#111827] px-4">
        <div className="text-center max-w-md bg-[#F9F9F8] p-8 sm:p-12 border border-gray-200 shadow-2xl">
          <ShoppingBag className="w-12 h-12 text-[#936B34] mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-[#111827] mb-2 font-light">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-gray-500 mb-6">
            Please select from our suits, dress shirts, trousers, or neckwear before checking out.
          </p>
          <button
            onClick={() => setActiveView('shop')}
            className="px-6 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
          >
            Explore Catalogue
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          category: item.product.category,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0]
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        alterationRequested: formData.needAlteration,
        alterationNotes: formData.needAlteration 
          ? `Hem: ${formData.trouserHemType}, Inseam: ${formData.inseamLength || 'N/A'}, Sleeves: ${formData.jacketSleeveAdjustment}. Note: ${formData.specialTailorNotes}`
          : undefined,
        subtotal: cartSubtotal,
        shippingFee,
        tax: estimatedTax,
        total: grandTotal,
        paymentMethod: formData.paymentMethod
      };

      const createdOrder = await placeNewOrder(orderPayload);
      if (createdOrder && createdOrder.id) {
        setOrderComplete(createdOrder);
        showToast('Commission confirmed! Master tailors notified.', 'success');
      } else {
        showToast('Failed to authorize commission. Please retry.', 'error');
      }
    } catch (err) {
      showToast('An error occurred during order dispatch.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white text-[#111827] pt-12 pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="p-8 sm:p-12 border border-gray-200 bg-[#F9F9F8] shadow-2xl relative">
            <div className="w-14 h-14 bg-[#F3F4F6] border border-[#936B34] rounded-full flex items-center justify-center mx-auto mb-4 text-[#936B34]">
              <Check className="w-7 h-7" />
            </div>

            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#936B34] block mb-2 font-medium">
              PARK AVENUE ATELIER
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-light uppercase tracking-wider mb-2">
              COMMISSION CONFIRMED
            </h1>

            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you for trusting Park Avenue Menswear. A tailored receipt and authentication guarantee have been forwarded to{' '}
              <strong className="text-[#111827]">{orderComplete.customerEmail}</strong>.
            </p>

            {/* Order snapshot card */}
            <div className="bg-white border border-gray-200 p-6 text-left max-w-xl mx-auto my-8 space-y-4 shadow-lg">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-mono text-[#111827] font-medium">{orderComplete.id}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="text-gray-500">Tracking Number:</span>
                <span className="font-mono text-[#936B34] font-medium">{orderComplete.trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="text-gray-500">Est. Delivery:</span>
                <span className="text-[#111827] font-medium">{orderComplete.estimatedDelivery}</span>
              </div>

              {orderComplete.alterationRequested && (
                <div className="pt-2 flex items-start gap-2 text-xs text-[#936B34]">
                  <Scissors className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Master tailor alterations registered. Inseam will be tailored prior to courier handover.
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setCurrentOrder(orderComplete);
                  setActiveView('track-order');
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A5726] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Truck className="w-4 h-4 text-white" />
                <span>Track Live Status</span>
              </button>

              <button
                onClick={() => setActiveView('home')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-300 text-[#111827] hover:border-[#936B34] hover:text-[#936B34] text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Return to Home
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-6 border-b border-gray-200 mb-8 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#936B34] mb-1 font-mono font-medium">
              PA Atelier Checkout
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-light">
              Secure Order &amp; Tailoring Commission
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <Lock className="w-4 h-4 text-[#936B34]" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Form: Customer, Shipping, Alterations & Payment */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* 1. Contact Information */}
            <div className="p-6 bg-[#F9F9F8] border border-gray-200 space-y-4">
              <h2 className="font-serif text-lg text-[#111827] pb-2 border-b border-gray-200 font-light">
                1. Client Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1 font-mono">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-mono">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-mono">Email Address (Order confirmation)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-mono">Mobile Phone (Courier SMS updates)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Courier Shipping Address */}
            <div className="p-6 bg-[#F9F9F8] border border-gray-200 space-y-4">
              <h2 className="font-serif text-lg text-[#111827] pb-2 border-b border-gray-200 font-light">
                2. Courier Shipping Destination
              </h2>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1 font-mono">Street Address / Suite</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-gray-500 mb-1 font-mono">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-mono">State / Province</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-mono">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bespoke Alteration Studio Option */}
            <div className="p-6 bg-[#F9F9F8] border border-[#936B34]/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#936B34]" />
                  <h2 className="font-serif text-lg text-[#111827] font-light">
                    3. Atelier Tailoring &amp; Alteration Specifications
                  </h2>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white bg-[#936B34] px-2 py-0.5 font-mono font-semibold">
                  Complimentary
                </span>
              </div>

              <label className="flex items-center gap-3 text-xs text-slate-200 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={formData.needAlteration}
                  onChange={(e) => setFormData({ ...formData, needAlteration: e.target.checked })}
                  className="accent-[#936B34] w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">
                  Request custom tailoring adjustments before handover (adds 24-48h to dispatch)
                </span>
              </label>

              {formData.needAlteration && (
                <div className="pt-3 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 mb-1 font-mono">Trouser Hem Style</label>
                      <select
                        value={formData.trouserHemType}
                        onChange={(e) => setFormData({ ...formData, trouserHemType: e.target.value })}
                        className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                      >
                        <option>Half Break (Modern Classic)</option>
                        <option>Full Break (Traditional)</option>
                        <option>Quarter / Slight Break (Contemporary)</option>
                        <option>No Break (Clean Crop)</option>
                        <option>Leave Unfinished for Personal Tailor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 font-mono">Target Inseam (Inches)</label>
                      <input
                        type="text"
                        value={formData.inseamLength}
                        onChange={(e) => setFormData({ ...formData, inseamLength: e.target.value })}
                        placeholder='e.g. 32.5"'
                        className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-mono">Sleeve Adjustment</label>
                    <select
                      value={formData.jacketSleeveAdjustment}
                      onChange={(e) => setFormData({ ...formData, jacketSleeveAdjustment: e.target.value })}
                      className="w-full bg-white border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none cursor-pointer"
                    >
                      <option>None (Standard 34.5")</option>
                      <option>Shorten Sleeves by 0.5"</option>
                      <option>Shorten Sleeves by 1.0"</option>
                      <option>Lengthen Sleeves by 0.5"</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-mono">Tailor Notes for Master Craftsman</label>
                    <textarea
                      rows={2}
                      value={formData.specialTailorNotes}
                      onChange={(e) => setFormData({ ...formData, specialTailorNotes: e.target.value })}
                      className="w-full bg-white border border-gray-200 p-2 text-[#111827] focus:border-[#936B34] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Payment Method */}
            <div className="p-6 bg-[#F9F9F8] border border-gray-200 space-y-4">
              <h2 className="font-serif text-lg text-[#111827] pb-2 border-b border-gray-200 font-light">
                4. Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="pay"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                    className="accent-[#936B34]"
                  />
                  <CreditCard className="w-4 h-4 text-[#936B34]" />
                  <span className="text-[#111827] font-medium">Credit or Debit Card (Visa, Mastercard, American Express)</span>
                </label>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="p-4 bg-white border border-gray-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-500 mb-1 font-mono">Card Number</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 mb-1 font-mono">Expiry Date</label>
                        <input
                          type="text"
                          value={formData.cardExp}
                          onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-mono">CVC / Security Code</label>
                        <input
                          type="text"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F9F9F8] border border-gray-200 p-6 space-y-6 sticky top-24 shadow-2xl">
              <h2 className="font-serif text-xl text-[#111827] pb-3 border-b border-gray-200 font-light">
                Order Review ({cart.length} pieces)
              </h2>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-4 divide-y divide-gray-100 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3 text-xs">
                    <div className="w-14 h-18 shrink-0 overflow-hidden">
                      <MediaPlaceholder
                        label="PA"
                        category={item.product.category}
                        aspectRatio="portrait"
                        minimal
                        className="w-full h-full p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-[#111827] truncate uppercase">{item.product.name}</h4>
                      <p className="text-[11px] font-mono text-gray-500">Size: {item.selectedSize} · {item.selectedColor}</p>
                      <p className="text-[11px] font-mono text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium font-mono tabular-nums text-[#111827]">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-500 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#111827]">${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worldwide Courier Delivery</span>
                  <span className="tabular-nums text-[#111827]">
                    {shippingFee === 0 ? <span className="text-[#936B34] font-medium">Complimentary</span> : `$${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atelier Alterations</span>
                  <span className="text-[#936B34] font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Sales Tax</span>
                  <span className="tabular-nums text-[#111827]">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-serif text-[#111827]">
                  <span>Total Due</span>
                  <span className="tabular-nums font-sans font-bold text-lg text-[#936B34]">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#936B34] hover:bg-[#7A5726] text-white font-semibold text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span>Dispatching Commission...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Authorize Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#936B34]" />
                <span>Protected by Park Avenue Atelier Guarantee</span>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
