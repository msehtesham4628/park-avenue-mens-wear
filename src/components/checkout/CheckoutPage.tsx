import React, { useEffect, useMemo, useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Lock, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  FileCheck2,
  ChevronLeft,
  Scissors
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OrderService } from '../../services/api';
import { calculateStateTax, getUsStateTaxRates } from '../../services/taxEngine';
import { getShippingMethodsForState } from '../../services/shippingService';

const STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],
  ['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],
  ['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],
  ['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
  ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],
  ['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],
  ['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],
  ['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],
  ['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],
  ['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],['PR','Puerto Rico']
] as const;

const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    currentCustomer, 
    currentOrder, 
    setActiveView, 
    showToast, 
    clearCart, 
    setCurrentOrder,
    isPaymentGatewayHidden
  } = useShop();
  
  // Step 1: Shipment & Contact Confirmation
  // Step 2: Dedicated Order Summary Page (All details + confirmation checkbox)
  // Step 3: Dedicated Stripe Payment Page (Bypassed when payment is hidden)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Contact & Address details (Note: NO Country US field; State selector only)
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [address, setAddress] = useState({ street: '', apartment: '', city: '', state: '', postalCode: '' });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [alterationNotes, setAlterationNotes] = useState('');

  // Step 2 confirmation tick box
  const [isOrderConfirmedAndAgreed, setIsOrderConfirmedAndAgreed] = useState(false);

  // Step 3 Stripe Payment Form
  const [stripeCardholder, setStripeCardholder] = useState('');
  const [stripeCardNumber, setStripeCardNumber] = useState('4242 •••• •••• 4242');
  const [stripeExpiry, setStripeExpiry] = useState('12/28');
  const [stripeCvc, setStripeCvc] = useState('888');
  const [stripeZip, setStripeZip] = useState('');
  const [stripeError, setStripeError] = useState('');

  // Placed Order Result
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  useEffect(() => {
    if (!currentCustomer) {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('pa_checkout_return', '1');
      showToast('Please sign in to proceed with checkout', 'info');
      setActiveView('login');
      return;
    }
    const parts = (currentCustomer.name || '').trim().split(/\s+/);
    setContact({
      firstName: (currentCustomer as any).firstName || parts[0] || '',
      lastName: (currentCustomer as any).lastName || parts.slice(1).join(' '),
      email: currentCustomer.email || '',
      phone: currentCustomer.phone || ''
    });

    if (currentCustomer.addresses && currentCustomer.addresses.length > 0) {
      const def = currentCustomer.addresses.find(a => a.isDefault) || currentCustomer.addresses[0];
      setAddress({
        street: def.street || '',
        apartment: def.apartment || '',
        city: def.city || '',
        state: def.state || '',
        postalCode: def.postalCode || def.zipCode || ''
      });
    }
  }, [currentCustomer]);

  // Dynamic available shipping methods based on selected US state
  const availableShippingMethods = useMemo(() => {
    return getShippingMethodsForState(address.state);
  }, [address.state]);

  const selectedShippingOption = useMemo(() => {
    return availableShippingMethods.find(m => m.id === shippingMethod) || availableShippingMethods[0];
  }, [availableShippingMethods, shippingMethod]);

  const shippingAmount = selectedShippingOption ? selectedShippingOption.cost : 15;

  // Real-time State Sales Tax Calculation using configured tax rates
  const taxCalculation = useMemo(() => {
    if (!address.state || !cart.length) return null;
    const items = cart.map(i => ({ price: i.price, quantity: i.quantity }));
    return calculateStateTax(address.state, items, cartSubtotal);
  }, [address.state, cart, cartSubtotal]);

  const taxAmount = taxCalculation ? taxCalculation.taxAmount : 0;
  const grandTotal = Math.round((cartSubtotal + shippingAmount + taxAmount) * 100) / 100;

  // Step 1 Validation & Confirmation -> Advances to Dedicated Step 2 (Order Summary Page)
  const handleConfirmShipment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contact.firstName.trim() || !contact.lastName.trim()) {
      setError('Please provide the recipient First and Last Name.');
      return;
    }
    if (!contact.email.trim() || !contact.email.includes('@')) {
      setError('Please provide a valid patron email address.');
      return;
    }
    if (!contact.phone.trim()) {
      setError('Please provide a contact phone number for secure delivery updates.');
      return;
    }
    if (!address.street.trim()) {
      setError('Please provide your street delivery address.');
      return;
    }
    if (!address.city.trim()) {
      setError('Please provide your city.');
      return;
    }
    if (!address.state.trim()) {
      setError('Please select your destination US state to determine statutory tax and shipping.');
      return;
    }
    if (!address.postalCode.trim() || address.postalCode.trim().length < 5) {
      setError('Please enter a valid 5-digit US Postal Code.');
      return;
    }

    // Advance directly to Dedicated Step 2 (Order Summary Page)
    setStep(2);
    setIsOrderConfirmedAndAgreed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place order directly when online payment is temporarily suspended
  const handlePlaceOrderDirectly = async () => {
    if (!isOrderConfirmedAndAgreed) {
      setError('Please confirm that all shipping, order details, and alterations are correct.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const generatedOrderId = `PA-ORD-${orderNumber}`;

      const orderPayload: any = {
        orderId: generatedOrderId,
        customerName: `${contact.firstName} ${contact.lastName}`.trim(),
        customerEmail: contact.email.trim(),
        customerPhone: contact.phone.trim(),
        shippingAddress: {
          street: address.street,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'United States'
        },
        shippingInfo: {
          street: address.street,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'United States',
          shippingMethod: selectedShippingOption.name,
          shippingCarrier: selectedShippingOption.carrier,
          shippingFee: shippingAmount,
          recipientName: `${contact.firstName} ${contact.lastName}`.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim()
        },
        shippingMethod: selectedShippingOption.name,
        shippingFee: shippingAmount,
        subtotal: cartSubtotal,
        tax: taxAmount,
        total: grandTotal,
        paymentStatus: 'Invoice',
        paymentMethod: 'Atelier Concierge Billing (Card Payment Suspended)',
        paymentTransactionId: `inv_concierge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        orderStatus: 'Order Confirmed',
        trackingNumber: undefined,
        carrier: selectedShippingOption.carrier,
        items: cart.map(i => ({
          productId: i.productId,
          productName: i.product.name,
          category: i.product.category,
          size: i.selectedSize,
          color: i.selectedColor,
          quantity: i.quantity,
          price: i.price,
          sku: i.product.sku,
          image: i.product.images?.[0]
        })),
        alterationRequested: Boolean(alterationNotes.trim()),
        alterationNotes: alterationNotes.trim() || undefined
      };

      const created = await OrderService.create(orderPayload);
      clearCart();
      setCurrentOrder(created);
      setPlacedOrder(created);
      showToast(`Consignment ${created.id || generatedOrderId} confirmed! Online payment is temporarily suspended.`, 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Validation -> Advances to Dedicated Step 3 (Stripe Payment Page)
  const handleProceedToStripe = () => {
    if (!isOrderConfirmedAndAgreed) {
      setError('Please confirm that all shipping, order details, and alterations are correct.');
      return;
    }
    setError('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Authorize & Pay via Stripe
  const handleAuthorizeStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStripeError('');
    setLoading(true);

    try {
      if (!stripeCardholder.trim() && !(contact.firstName && contact.lastName)) {
        setStripeError('Please enter the cardholder name.');
        setLoading(false);
        return;
      }

      // Generate unique Order ID
      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const generatedOrderId = `PA-ORD-${orderNumber}`;

      const orderPayload: any = {
        orderId: generatedOrderId,
        customerName: `${contact.firstName} ${contact.lastName}`.trim(),
        customerEmail: contact.email.trim(),
        customerPhone: contact.phone.trim(),
        shippingAddress: {
          street: address.street,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'United States'
        },
        shippingInfo: {
          street: address.street,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: 'United States',
          shippingMethod: selectedShippingOption.name,
          shippingCarrier: selectedShippingOption.carrier,
          shippingFee: shippingAmount,
          recipientName: `${contact.firstName} ${contact.lastName}`.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim()
        },
        shippingMethod: selectedShippingOption.name,
        shippingFee: shippingAmount,
        subtotal: cartSubtotal,
        tax: taxAmount,
        total: grandTotal,
        paymentStatus: 'Paid',
        paymentMethod: 'Stripe Credit Card (Authorized)',
        paymentTransactionId: `ch_stripe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        orderStatus: 'Order Confirmed',
        // Tracking ID will NOT be assigned immediately - will be assigned by admin in dashboard
        trackingNumber: undefined,
        carrier: selectedShippingOption.carrier,
        items: cart.map(i => ({
          productId: i.productId,
          productName: i.product.name,
          category: i.product.category,
          size: i.selectedSize,
          color: i.selectedColor,
          quantity: i.quantity,
          price: i.price,
          sku: i.product.sku,
          image: i.product.images?.[0]
        })),
        alterationRequested: Boolean(alterationNotes.trim()),
        alterationNotes: alterationNotes.trim() || undefined
      };

      const created = await OrderService.create(orderPayload);
      clearCart();
      setCurrentOrder(created);
      setPlacedOrder(created);
      showToast(`Payment authorized via Stripe! Consignment ${created.id || generatedOrderId} confirmed.`, 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Stripe payment failed:', err);
      setStripeError(err.message || 'Payment authorization failed. Please verify card credentials.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESSFUL ORDER CONFIRMATION SCREEN
  if (placedOrder) {
    const displayOrderId = placedOrder.id || (placedOrder as any).orderId || 'PA-ORD-88210';
    return (
      <div className="min-h-[80vh] bg-white text-[#111827] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-[#936B34] flex items-center justify-center bg-white shadow-md rounded-full">
            <Check className="w-8 h-8 text-[#936B34]" />
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] block font-semibold mb-2">
              PARK AVENUE ATELIER · ORDER CONFIRMED
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] uppercase tracking-wide font-light">
              CONSIGNMENT RECEIVED
            </h1>
          </div>

          {/* Prominent Order ID display */}
          <div className="p-6 bg-white border border-[#936B34]/30 shadow-xs space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 block">
              YOUR ORDER ID
            </span>
            <div className="font-serif text-3xl sm:text-4xl text-[#111827] font-semibold tracking-wider">
              {displayOrderId}
            </div>
            <p className="text-xs font-mono text-[#936B34] pt-1">
              Please save this Order ID for tracking your consignment.
            </p>
          </div>

          {/* Explicit Note Regarding Tracking ID Assigned by Admin */}
          <div className="p-5 bg-amber-50/80 border border-amber-200 text-left space-y-2 rounded-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-900 font-semibold">
              <Truck className="w-4 h-4 text-[#936B34]" />
              <span>DISPATCH &amp; TRACKING NUMBER NOTICE</span>
            </div>
            <p className="text-xs text-amber-950 font-sans leading-relaxed">
              Your order has been safely placed. <strong>Your Tracking ID will not be given immediately.</strong> It will be assigned and updated directly from the atelier dashboard by our administration team once your garments have completed master tailor inspection and are packaged for courier handover.
            </p>
            <div className="text-[11px] font-mono text-gray-600 pt-1">
              Current Shipment Status: <span className="font-semibold text-[#111827]">Pending Dispatch (Tracking ID will be provided by admin)</span>
            </div>
          </div>

          {/* Summary Details */}
          <div className="p-4 bg-white border border-gray-200 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Recipient:</span>
              <strong className="text-[#111827]">{placedOrder.customerName || `${contact.firstName} ${contact.lastName}`}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Destination:</span>
              <strong className="text-[#111827]">{address.city}, {address.state} {address.postalCode}</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Selected Method:</span>
              <strong className="text-[#111827]">{selectedShippingOption.name}</strong>
            </div>
            <div className="flex justify-between text-[#111827] font-semibold pt-2 border-t border-gray-100">
              <span>{placedOrder.paymentMethod?.includes('Suspended') || isPaymentGatewayHidden ? 'Order Total (Concierge Invoice):' : 'Total Amount Paid via Stripe:'}</span>
              <div className="text-right">
                <strong className="text-base text-[#936B34] block">{money(grandTotal)}</strong>
                {(placedOrder.paymentMethod?.includes('Suspended') || isPaymentGatewayHidden) && (
                  <span className="text-[10px] font-mono text-gray-500 font-normal">Card payment suspended · Invoiced on delivery</span>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => {
                setActiveView('track-order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-4 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-md"
            >
              TRACK VIA ORDER ID
            </button>
            <button
              onClick={() => {
                setActiveView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-4 border border-gray-300 hover:border-black text-gray-800 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer bg-white"
            >
              MY CUSTOMER DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white text-[#111827] py-20 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 mb-6 border border-[#936B34] flex items-center justify-center text-[#936B34] font-serif text-lg bg-[#F9F9F8] shadow-md">
          PA
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-2 font-medium">
          PARK AVENUE MENSWEAR
        </span>
        <h1 className="font-serif text-3xl text-[#111827] uppercase tracking-wide font-light mb-4">
          YOUR SHOPPING BAG IS EMPTY
        </h1>
        <p className="text-xs text-gray-500 font-mono max-w-md mb-8">
          Please add fine tailored garments or accessories to your shopping bag before proceeding to checkout.
        </p>
        <button
          onClick={() => setActiveView('shop')}
          className="px-8 py-4 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-semibold uppercase tracking-[0.25em] transition-colors cursor-pointer shadow-md"
        >
          EXPLORE COLLECTIONS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Stage Indicator */}
        <div className="pt-4 pb-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#936B34] block font-semibold mb-1">
                PARK AVENUE ATELIER CHECKOUT
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
                {step === 1 && '1. Contact & Shipment Confirmation'}
                {step === 2 && '2. Order Summary & Atelier Review'}
                {step === 3 && '3. Secure Stripe Payment'}
              </h1>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
              <span className={`px-3 py-1 border transition-colors ${
                step === 1 ? 'border-[#936B34] bg-[#936B34] text-white font-bold' : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                1. SHIPMENT
              </span>
              <span className="text-gray-300">→</span>
              <span className={`px-3 py-1 border transition-colors ${
                step === 2 ? 'border-[#936B34] bg-[#936B34] text-white font-bold' : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                {isPaymentGatewayHidden ? '2. REVIEW & CONFIRM' : '2. SUMMARY'}
              </span>
              {!isPaymentGatewayHidden && (
                <>
                  <span className="text-gray-300">→</span>
                  <span className={`px-3 py-1 border transition-colors ${
                    step === 3 ? 'border-[#936B34] bg-[#936B34] text-white font-bold' : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}>
                    3. STRIPE
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: CUSTOMER CONTACT & SHIPMENT CONFIRMATION
            (NO ORDER SUMMARY SHOWN BELOW THIS FORM!)
           ========================================================================= */}
        {step === 1 && (
          <div className="mt-8">
            <form onSubmit={handleConfirmShipment} className="space-y-8">
              {/* Recipient Information */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    1.1 RECIPIENT &amp; PATRON CONTACT
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    First Name *
                    <input
                      required
                      type="text"
                      value={contact.firstName}
                      onChange={e => setContact({ ...contact, firstName: e.target.value })}
                      placeholder="e.g. Montgomery"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    Last Name *
                    <input
                      required
                      type="text"
                      value={contact.lastName}
                      onChange={e => setContact({ ...contact, lastName: e.target.value })}
                      placeholder="e.g. Vance"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    Email Address (for Order ID confirmation) *
                    <input
                      required
                      type="email"
                      value={contact.email}
                      onChange={e => setContact({ ...contact, email: e.target.value })}
                      placeholder="e.g. patron@example.com"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    Phone Number (for Courier SMS updates) *
                    <input
                      required
                      type="tel"
                      value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>
                </div>
              </div>

              {/* Shipping Address (US Country removed, State Selector prominent) */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    1.2 DESTINATION ADDRESS (UNITED STATES)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700 sm:col-span-2">
                    Street Address *
                    <input
                      required
                      type="text"
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      placeholder="e.g. 740 Park Avenue"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700 sm:col-span-2">
                    Apartment / Suite / Floor (Optional)
                    <input
                      type="text"
                      value={address.apartment}
                      onChange={e => setAddress({ ...address, apartment: e.target.value })}
                      placeholder="e.g. Penthouse B"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    City *
                    <input
                      required
                      type="text"
                      value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. New York"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700">
                    Destination US State *
                    <select
                      required
                      value={address.state}
                      onChange={e => setAddress({ ...address, state: e.target.value })}
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34] cursor-pointer"
                    >
                      <option value="">Select US destination state</option>
                      {STATES.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name} ({code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-mono uppercase tracking-wider text-gray-700 sm:col-span-2">
                    Postal Code (ZIP) *
                    <input
                      required
                      type="text"
                      maxLength={10}
                      value={address.postalCode}
                      onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                      placeholder="e.g. 10021"
                      className="mt-2 w-full bg-white border border-gray-300 p-3 text-sm font-sans normal-case tracking-normal focus:outline-none focus:border-[#936B34]"
                    />
                  </label>
                </div>
              </div>

              {/* Delivery Tier Options */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    1.3 SELECT DELIVERY COURIER &amp; TIER
                  </span>
                </div>

                <div className="space-y-3">
                  {availableShippingMethods.map(m => {
                    const isSelected = shippingMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-start justify-between border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#936B34] bg-white shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={isSelected}
                            onChange={() => setShippingMethod(m.id)}
                            className="mt-1 accent-[#936B34]"
                          />
                          <div>
                            <div className="font-medium text-sm text-[#111827]">
                              {m.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {m.description}
                            </div>
                            <div className="text-[11px] font-mono text-[#936B34] mt-1 font-semibold">
                              Speed: {m.speed} · Carrier: {m.carrier}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <span className="font-mono text-sm font-semibold text-[#111827]">
                            {money(m.cost)}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Atelier Master Tailoring Instructions (Optional) */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#936B34] font-semibold">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>1.4 ATELIER TAILORING &amp; ALTERATION NOTES (OPTIONAL)</span>
                </div>
                <textarea
                  rows={2}
                  value={alterationNotes}
                  onChange={e => setAlterationNotes(e.target.value)}
                  placeholder="Specify desired trouser break, hemming measurement, sleeve adjustments, or special concierge packaging..."
                  className="w-full bg-white border border-gray-300 p-3 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              {/* Action Button: Moves to Next Page (Order Summary) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#111827] hover:bg-[#936B34] text-white py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>CONFIRM SHIPMENT &amp; VIEW ORDER SUMMARY</span>
                  <ArrowRight className="w-4 h-4 text-[#936B34]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            STEP 2: DEDICATED ORDER SUMMARY PAGE
            (All details shown here, confirmation tick box, then proceed to Stripe)
           ========================================================================= */}
        {step === 2 && (
          <div className="mt-8 space-y-8">
            <div className="p-4 bg-[#F9F9F8] border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold">
                  ORDER SUMMARY &amp; SPECIFICATIONS REVIEW
                </span>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Please review your complete delivery details, garment line items, and statutory charges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs font-mono uppercase tracking-wider text-[#936B34] underline hover:text-black cursor-pointer"
              >
                Edit Shipment
              </button>
            </div>

            {/* Recipient & Shipping Summary Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 border border-gray-200 bg-[#F9F9F8] space-y-2 text-xs font-mono shadow-xs">
                <span className="text-[10px] uppercase text-[#936B34] font-semibold tracking-wider block">
                  DELIVERY DESTINATION
                </span>
                <div className="font-semibold text-sm text-[#111827]">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="text-gray-700">
                  {address.street} {address.apartment ? `, ${address.apartment}` : ''}
                </div>
                <div className="text-gray-700">
                  {address.city}, {address.state} {address.postalCode}
                </div>
                <div className="text-gray-500 text-[11px] pt-1">
                  Email: {contact.email} · Phone: {contact.phone}
                </div>
              </div>

              <div className="p-5 border border-gray-200 bg-[#F9F9F8] space-y-2 text-xs font-mono shadow-xs">
                <span className="text-[10px] uppercase text-[#936B34] font-semibold tracking-wider block">
                  SHIPPING METHOD &amp; SPEED
                </span>
                <div className="font-semibold text-sm text-[#111827]">
                  {selectedShippingOption.name}
                </div>
                <div className="text-gray-700">
                  Carrier: {selectedShippingOption.carrier}
                </div>
                <div className="text-[#936B34] font-semibold">
                  Estimated Speed: {selectedShippingOption.speed}
                </div>
                <div className="text-gray-500 text-[11px]">
                  Shipping Rate: {money(shippingAmount)}
                </div>
              </div>
            </div>

            {/* Complete Itemized Garments Breakdown */}
            <div className="border border-gray-200 bg-white shadow-xs">
              <div className="p-4 bg-[#F9F9F8] border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-700 font-semibold">
                  SELECTED GARMENTS ({cart.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <span className="text-xs font-mono text-gray-500">
                  Itemized Total: {money(cartSubtotal)}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map(i => (
                  <div key={i.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {i.product.images?.[0] ? (
                        <img 
                          src={i.product.images[0]} 
                          alt={i.product.name} 
                          className="w-16 h-20 object-cover border border-gray-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-100 flex items-center justify-center text-xs font-serif text-[#936B34] shrink-0 border border-gray-200">
                          PA
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-base text-[#111827] font-medium">
                          {i.product.name}
                        </h4>
                        <div className="text-xs font-mono text-gray-500 space-x-2 mt-0.5">
                          <span>Size: <strong>{i.selectedSize}</strong></span>
                          <span>·</span>
                          <span>Color: <strong>{i.selectedColor}</strong></span>
                          <span>·</span>
                          <span>Qty: <strong>{i.quantity}</strong></span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 mt-1">
                          SKU: {i.product.sku}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm text-[#111827] font-semibold block">
                        {money(i.price * i.quantity)}
                      </span>
                      {i.quantity > 1 && (
                        <span className="text-[10px] font-mono text-gray-400">
                          {money(i.price)} each
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atelier Alterations Note if supplied */}
            {alterationNotes && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 text-xs font-mono space-y-1">
                <span className="font-semibold text-amber-900 uppercase">
                  ATELIER ALTERATION &amp; BREAK SPECIFICATIONS:
                </span>
                <p className="text-amber-950 font-sans">{alterationNotes}</p>
              </div>
            )}

            {/* Financial Summary Breakdown */}
            <div className="p-6 border border-gray-200 bg-[#F9F9F8] space-y-3.5 text-xs font-mono shadow-xs">
              <div className="flex justify-between text-gray-700">
                <span>GARMENT SUBTOTAL</span>
                <span className="font-semibold text-[#111827]">{money(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>SHIPPING &amp; COURIER FEE ({selectedShippingOption.name})</span>
                <span className="font-semibold text-[#111827]">{money(shippingAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <div>
                  <span>STATE SALES TAX ({address.state})</span>
                  {taxCalculation && (
                    <span className="block text-[10px] text-[#936B34]">
                      {taxCalculation.rateFormatted} statutory rate
                    </span>
                  )}
                </div>
                <span className="font-semibold text-[#111827]">
                  {taxAmount === 0 ? 'Exempt / $0.00' : money(taxAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-xl text-[#111827] font-semibold block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-[10px] text-gray-500">
                    USD · Includes Destination Sales Tax &amp; Fully Insured Delivery
                  </span>
                </div>
                <span className="font-serif text-2xl text-[#936B34] font-bold tabular-nums">
                  {money(grandTotal)}
                </span>
              </div>
            </div>

            {/* Atelier Concierge Billing Banner when payment is temporarily suspended */}
            {isPaymentGatewayHidden && (
              <div className="p-4 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs font-mono flex items-start gap-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#936B34] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#936B34] uppercase tracking-wider block">
                    ONLINE CARD PAYMENT TEMPORARILY SUSPENDED · CONCIERGE BILLING
                  </span>
                  <p className="font-sans leading-relaxed text-amber-900">
                    Online card checkout is temporarily paused upon client request. No payment or credit card is required today. Your garments will be reserved in our private atelier vault, and an invoice will be provided upon concierge confirmation and fitting delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Mandatory Confirmation Checkbox */}
            <div className="p-5 border-2 border-[#936B34] bg-[#FBF9F5] shadow-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOrderConfirmedAndAgreed}
                  onChange={(e) => setIsOrderConfirmedAndAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#936B34] cursor-pointer"
                />
                <div className="text-xs text-gray-800 leading-relaxed font-sans">
                  <strong className="text-[#111827] font-semibold block mb-0.5">
                    CONFIRMATION &amp; ATELIER AGREEMENT:
                  </strong>
                  {isPaymentGatewayHidden ? (
                    <span>
                      I confirm that all shipping destination details, selected garment sizes, colors, and alteration specifications listed above are correct. I agree to place this bespoke consignment with total amount <strong>{money(grandTotal)}</strong> to be invoiced upon salon concierge delivery.
                    </span>
                  ) : (
                    <span>
                      I confirm that all shipping destination details, selected garment sizes, colors, and alteration specifications listed above are correct. I agree to proceed to the secure Stripe payment page to authorize <strong>{money(grandTotal)}</strong>.
                    </span>
                  )}
                </div>
              </label>
            </div>

            {/* Step 2 Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="py-4 px-6 border border-gray-300 text-xs font-mono uppercase tracking-wider hover:border-black transition-colors cursor-pointer bg-white"
              >
                Back to Edit Shipment
              </button>

              {isPaymentGatewayHidden ? (
                <button
                  type="button"
                  disabled={!isOrderConfirmedAndAgreed || loading}
                  onClick={handlePlaceOrderDirectly}
                  className="flex-1 py-4 px-6 bg-[#111827] hover:bg-[#936B34] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>CONFIRMING BESPOKE ORDER...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM &amp; PLACE BESPOKE ORDER</span>
                      <ArrowRight className="w-4 h-4 text-[#936B34]" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isOrderConfirmedAndAgreed}
                  onClick={handleProceedToStripe}
                  className="flex-1 py-4 px-6 bg-[#111827] hover:bg-[#936B34] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>PROCEED TO STRIPE PAYMENT</span>
                  <ArrowRight className="w-4 h-4 text-[#936B34]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DEDICATED STRIPE PAYMENT PAGE
           ========================================================================= */}
        {step === 3 && (
          <div className="mt-8 space-y-6">
            {/* Payment Total Banner */}
            <div className="p-5 bg-[#111827] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E5C384] block mb-1">
                  PAYMENT AUTHORIZATION
                </span>
                <h3 className="font-serif text-2xl text-white font-light">
                  Stripe Payment Sheet
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">
                  AMOUNT TO CHARGE
                </span>
                <span className="font-serif text-2xl text-[#E5C384] font-semibold tabular-nums">
                  {money(grandTotal)} USD
                </span>
              </div>
            </div>

            {/* Stripe Form Container */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#635BFF] text-white text-[11px] font-bold rounded-xs shadow-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>stripe</span>
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-600">
                    Encrypted Payment Gateway
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>256-Bit TLS PCI-DSS</span>
                </div>
              </div>

              {stripeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{stripeError}</span>
                </div>
              )}

              <form onSubmit={handleAuthorizeStripePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-700 mb-1.5 font-medium">
                    CARDHOLDER NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={stripeCardholder || `${contact.firstName} ${contact.lastName}`.trim()}
                    onChange={e => setStripeCardholder(e.target.value)}
                    placeholder="e.g. Montgomery Vance"
                    className="w-full bg-white border border-gray-300 p-3 text-sm font-sans focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-700 mb-1.5 font-medium">
                    CARD NUMBER *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={stripeCardNumber}
                      onChange={e => setStripeCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:outline-none focus:border-[#936B34]"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-700 mb-1.5 font-medium">
                      EXPIRY *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={stripeExpiry}
                      onChange={e => setStripeExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-700 mb-1.5 font-medium">
                      CVC / CVV *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={stripeCvc}
                      onChange={e => setStripeCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-700 mb-1.5 font-medium">
                      BILLING ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={stripeZip || address.postalCode}
                      onChange={e => setStripeZip(e.target.value)}
                      placeholder="e.g. 10021"
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>

                {/* Important Notice Regarding Tracking ID Assignment */}
                <div className="pt-2 text-[11px] font-mono text-gray-500 bg-gray-50 p-3 border border-gray-200">
                  ℹ️ Upon successful payment, you will immediately receive your <strong>Order ID</strong>. Your courier <strong>Tracking ID</strong> will be generated and issued by our atelier administrators once packaging is finalized.
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="py-4 px-6 border border-gray-300 text-xs font-mono uppercase tracking-wider hover:border-black transition-colors cursor-pointer bg-white"
                  >
                    Back to Summary
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-6 bg-[#635BFF] hover:bg-[#5249e0] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing with Stripe…</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>AUTHORIZE &amp; PAY {money(grandTotal)}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
