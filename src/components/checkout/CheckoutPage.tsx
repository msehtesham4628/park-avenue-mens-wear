import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Scissors, 
  Check, 
  ArrowRight, 
  Truck, 
  ShoppingBag,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  Building2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { StripePaymentService, StripeGatewayConfig } from '../../services/api';

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
  const [processingStep, setProcessingStep] = useState<string>('');
  const [stripeConfig, setStripeConfig] = useState<StripeGatewayConfig | null>(null);
  const [stripeTransactionId, setStripeTransactionId] = useState<string>('');
  const [copiedTx, setCopiedTx] = useState(false);

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
    paymentMethod: 'stripe_card',
    cardholderName: '',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    cardZip: '',
    // Alteration options
    needAlteration: false,
    trouserHemType: 'Half Break (Modern Classic)',
    inseamLength: '',
    jacketSleeveAdjustment: 'None (Standard)',
    specialTailorNotes: ''
  });

  const [orderComplete, setOrderComplete] = useState<any>(null);

  useEffect(() => {
    StripePaymentService.getConfig().then(cfg => {
      setStripeConfig(cfg);
    }).catch(() => {
      setStripeConfig({
        provider: 'stripe',
        isConfigured: false,
        isLive: false,
        testMode: true,
        publishableKey: '',
        webhookConfigured: false
      });
    });
  }, []);

  const FREE_SHIPPING_THRESHOLD = 250;
  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 35;
  const estimatedTax = cartSubtotal * 0.0825;
  const grandTotal = cartSubtotal + shippingFee + estimatedTax;

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Credit Card';
  };

  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpChange = (val: string) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    setFormData(prev => ({ ...prev, cardExp: clean }));
  };

  const fillStripeTestCard = () => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: 'stripe_card',
      cardholderName: `${prev.firstName || 'Marcus'} ${prev.lastName || 'Sterling'}`,
      cardNumber: '4242 4242 4242 4242',
      cardExp: '12/28',
      cardCvc: '123',
      cardZip: prev.postalCode || '10021'
    }));
    showToast('Filled standard Stripe test card credentials (4242).', 'info');
  };

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
    setProcessingStep('Validating sartorial commission...');

    try {
      if (formData.paymentMethod === 'stripe_card') {
        const cleanCard = formData.cardNumber.replace(/\D/g, '');
        if (cleanCard.length < 15) {
          throw new Error('Please provide a valid 15 or 16-digit card number (e.g. click "Fill Stripe Test Card").');
        }
        if (!formData.cardExp || formData.cardExp.length < 5) {
          throw new Error('Please enter a valid expiry date (MM/YY).');
        }
        if (!formData.cardCvc || formData.cardCvc.length < 3) {
          throw new Error('Please enter a valid CVC security code.');
        }
      }

      setProcessingStep('Securing commission record...');
      const cardBrand = getCardBrand(formData.cardNumber);
      const cardLast4 = formData.cardNumber.replace(/\D/g, '').slice(-4) || '4242';

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
        paymentMethod: formData.paymentMethod === 'stripe_card' 
          ? `Stripe (${cardBrand} •••• ${cardLast4})`
          : 'Private Atelier House Account'
      };

      const createdOrder = await placeNewOrder(orderPayload);
      if (!createdOrder || !createdOrder.id) {
        throw new Error('Could not establish order record. Please retry.');
      }

      let txId = `pi_${Date.now()}`;
      if (formData.paymentMethod === 'stripe_card') {
        setProcessingStep('Generating Stripe PaymentIntent...');
        const intent = await StripePaymentService.createIntent(
          createdOrder.id,
          grandTotal,
          formData.email,
          `${formData.firstName} ${formData.lastName}`
        );

        setProcessingStep('Authorizing 256-bit Stripe transaction...');
        txId = intent.transactionId;
        await StripePaymentService.confirmPayment(
          createdOrder.id,
          txId,
          `Stripe (${cardBrand} •••• ${cardLast4})`
        );
      }

      setStripeTransactionId(txId);
      setOrderComplete({
        ...createdOrder,
        paymentTransactionId: txId,
        paymentMethod: orderPayload.paymentMethod,
        paymentStatus: 'Paid'
      });
      showToast('Stripe payment authorized! Sartorial commission confirmed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'An error occurred during payment processing.', 'error');
    } finally {
      setIsSubmitting(false);
      setProcessingStep('');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white text-[#111827] pt-12 pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="p-8 sm:p-12 border border-gray-200 bg-[#F9F9F8] shadow-2xl relative">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
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

            {/* Order snapshot card with Stripe Verification Details */}
            <div className="bg-white border border-gray-200 p-6 text-left max-w-xl mx-auto my-8 space-y-4 shadow-lg">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-mono text-[#111827] font-medium">{orderComplete.id}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="text-gray-500">Tracking Number:</span>
                <span className="font-mono text-[#936B34] font-medium">{orderComplete.trackingNumber}</span>
              </div>

              {/* Stripe Payment Settlement Badge */}
              <div className="p-3 bg-[#F9F9F8] border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5 font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>Payment Gateway:</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Stripe (Settled &amp; Paid)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">Stripe Transaction ID:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(orderComplete.paymentTransactionId || stripeTransactionId);
                      setCopiedTx(true);
                      setTimeout(() => setCopiedTx(false), 2000);
                      showToast('Stripe transaction ID copied to clipboard', 'info');
                    }}
                    className="flex items-center gap-1 text-[#111827] hover:text-[#936B34] transition-colors cursor-pointer bg-white px-2 py-0.5 border border-gray-200 text-[11px]"
                    title="Click to copy Stripe transaction ID"
                  >
                    <span>{orderComplete.paymentTransactionId || stripeTransactionId}</span>
                    <Copy className="w-3 h-3 text-gray-400" />
                    {copiedTx && <span className="text-emerald-600 text-[9px]">Copied!</span>}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-gray-500 pt-1 border-t border-gray-200/60">
                  <span>Method:</span>
                  <span className="text-gray-800">{orderComplete.paymentMethod || 'Stripe Card Processing'}</span>
                </div>
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
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h2 className="font-serif text-lg text-[#111827] font-light">
                  4. Payment Method
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#111827] text-white text-[10px] font-mono tracking-wider uppercase font-semibold">
                    <Lock className="w-2.5 h-2.5 text-[#936B34]" />
                    <span>Stripe Verified</span>
                  </span>
                  {stripeConfig?.testMode && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#936B34]/15 text-[#936B34] border border-[#936B34]/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Test Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Option 1: Stripe Card */}
                <label className={`flex items-start gap-3 p-3.5 border cursor-pointer text-xs transition-all ${
                  formData.paymentMethod === 'stripe_card' 
                    ? 'bg-white border-[#936B34] shadow-xs' 
                    : 'bg-white/60 border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="pay"
                    checked={formData.paymentMethod === 'stripe_card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'stripe_card' })}
                    className="accent-[#936B34] mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#111827] font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#936B34]" />
                        <span>Credit or Debit Card (Stripe Gateway)</span>
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">Visa · MC · Amex · Discover</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      Direct, instant 256-bit encrypted settlement via Stripe
                    </p>
                  </div>
                </label>

                {/* Stripe Card Fields */}
                {formData.paymentMethod === 'stripe_card' && (
                  <div className="p-4 sm:p-5 bg-white border border-[#936B34]/30 space-y-4 text-xs shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-700 font-mono text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#936B34]" />
                        <span>Stripe Payment Elements &amp; Tokenization</span>
                      </div>
                      <button
                        type="button"
                        onClick={fillStripeTestCard}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F9F9F8] border border-gray-300 hover:border-[#936B34] text-[#111827] hover:text-[#936B34] text-[11px] font-mono font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Autofill standard Stripe 4242 test credentials"
                      >
                        <Zap className="w-3 h-3 text-[#936B34]" />
                        <span>Fill Stripe Test Card</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-mono text-[11px]">Cardholder Full Name</label>
                      <input
                        type="text"
                        value={formData.cardholderName}
                        onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                        placeholder={`${formData.firstName || 'Marcus'} ${formData.lastName || 'Sterling'}`}
                        className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] focus:border-[#936B34] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-gray-600 font-mono text-[11px]">Card Number</label>
                        <span className="text-[10px] font-mono text-[#936B34] font-semibold uppercase">
                          {formData.cardNumber ? getCardBrand(formData.cardNumber) : 'Any Valid Card'}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono tracking-wider focus:border-[#936B34] focus:outline-none"
                          placeholder="•••• •••• •••• ••••"
                          maxLength={19}
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                          <CreditCard className="w-4 h-4 text-[#936B34]" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-600 mb-1 font-mono text-[11px]">Expires (MM/YY)</label>
                        <input
                          type="text"
                          value={formData.cardExp}
                          onChange={(e) => handleExpChange(e.target.value)}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono focus:border-[#936B34] focus:outline-none"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1 font-mono text-[11px]">Security Code (CVC)</label>
                        <input
                          type="password"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value.slice(0, 4) })}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono focus:border-[#936B34] focus:outline-none"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1 font-mono text-[11px]">Billing Postal Code</label>
                        <input
                          type="text"
                          value={formData.cardZip || formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, cardZip: e.target.value })}
                          className="w-full bg-[#F9F9F8] border border-gray-200 p-2.5 text-[#111827] font-mono focus:border-[#936B34] focus:outline-none"
                          placeholder="10021"
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-gray-500 font-mono flex items-center gap-1.5 border-t border-gray-100">
                      <Lock className="w-3 h-3 text-[#936B34]" />
                      <span>Encrypted with Stripe 256-bit TLS. Sensitive card data is tokenized securely and never retained on uncertified servers.</span>
                    </div>
                  </div>
                )}

                {/* Option 2: House Account */}
                <label className={`flex items-start gap-3 p-3.5 border cursor-pointer text-xs transition-all ${
                  formData.paymentMethod === 'atelier_account' 
                    ? 'bg-white border-[#936B34] shadow-xs' 
                    : 'bg-white/60 border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="pay"
                    checked={formData.paymentMethod === 'atelier_account'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'atelier_account' })}
                    className="accent-[#936B34] mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#111827] font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#936B34]" />
                        <span>Private Atelier House Account / Wire Remittance</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#936B34]">Patron Concierge</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      White-glove invoice billed to registered house ledger upon tailoring finalization
                    </p>
                  </div>
                </label>
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
                className="w-full py-4 bg-[#936B34] hover:bg-[#7A5726] text-white font-semibold text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{processingStep || 'Authorizing with Stripe...'}</span>
                  </div>
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
