import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Lock, ShoppingBag, Truck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CheckoutService, OrderService } from '../../services/api';

const STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']
] as const;

const money=(n:number)=>`$${n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, currentCustomer, currentOrder, setActiveView, showToast, clearCart, setCurrentOrder } = useShop();
  const [step,setStep]=useState<1|2|3>(1);
  const [calculating,setCalculating]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [options,setOptions]=useState<any>({shippingMethods:[]});
  const [calc,setCalc]=useState<any>(null);
  const [contact,setContact]=useState({firstName:'',lastName:'',email:'',phone:''});
  const [address,setAddress]=useState({street:'',apartment:'',city:'',state:'',postalCode:''});
  const [shippingMethod,setShippingMethod]=useState('standard');
  const [paymentResult,setPaymentResult]=useState<'success'|'cancelled'|null>(null);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const returnedOrderId = params.get('orderId');
    if ((payment === 'success' || payment === 'cancelled') && returnedOrderId) {
      setPaymentResult(payment);
      if (payment === 'success') {
        clearCart();
        OrderService.getById(returnedOrderId).then(order => { if(order) setCurrentOrder(order); }).catch(()=>{});
      }
    }
    if(!currentCustomer){
      if(typeof sessionStorage!=='undefined') sessionStorage.setItem('pa_checkout_return','1');
      showToast('Please sign in or create an account to proceed to checkout','info');
      setActiveView('login');
      return;
    }
    const parts=(currentCustomer.name||'').trim().split(/\s+/);
    setContact({firstName:(currentCustomer as any).firstName||parts[0]||'',lastName:(currentCustomer as any).lastName||parts.slice(1).join(' '),email:currentCustomer.email||'',phone:currentCustomer.phone||''});
    CheckoutService.getOptions().then(o=>{ if(o) {setOptions(o); if(o.shippingMethods?.[0]) setShippingMethod(o.shippingMethods[0].id);} }).catch(()=>{});
  },[currentCustomer]);

  const items=useMemo(()=>cart.map(i=>({productId:i.productId,variantId:i.product.variants.find(v=>v.size===i.selectedSize&&v.color===i.selectedColor)?.id,size:i.selectedSize,color:i.selectedColor,quantity:i.quantity})),[cart]);

  useEffect(()=>{
    if(step<2 || !address.state || !items.length) { setCalc(null); return; }
    let cancelled=false;
    setCalculating(true);
    CheckoutService.calculate({items,state:address.state,shippingMethod}).then(result=>{if(!cancelled)setCalc(result);}).catch(e=>{if(!cancelled)setError(e.message||'Unable to calculate totals.');}).finally(()=>{if(!cancelled)setCalculating(false);});
    return()=>{cancelled=true};
  },[address.state,shippingMethod,items,step]);

  const continueShipping=()=>{
    if(!contact.firstName.trim()||!contact.lastName.trim()||!/^\S+@\S+\.\S+$/.test(contact.email)||!contact.phone.trim()){setError('Please complete your name, email and phone number.');return;}
    setError('');setStep(2);
  };
  const continuePayment=()=>{
    if(!address.street.trim()||!address.city.trim()||!address.state||!/^\d{5}(-\d{4})?$/.test(address.postalCode)){setError('Please complete a valid US shipping address.');return;}
    if(!calc){setError('Please wait for shipping and sales tax to finish calculating.');return;}
    setError('');setStep(3);
  };
  const makePayment=async()=>{
    if(!currentCustomer){sessionStorage.setItem('pa_checkout_return','1');setActiveView('login');return;}
    setLoading(true);setError('');
    try{
      const result=await CheckoutService.createSession({contact,shippingAddress:address,shippingMethod,items});
      if(!result?.checkoutUrl) throw new Error('Stripe did not return a secure checkout URL.');
      window.location.assign(result.checkoutUrl);
    }catch(e:any){setError(e.message||'Unable to start payment.');setLoading(false);}
  };

  if(!currentCustomer) return null;
  if(paymentResult==='success') return <div className="min-h-[70vh] flex items-center justify-center p-8"><div className="max-w-xl text-center border border-gray-200 p-10 bg-[#FBF9F5]"><Check className="w-10 h-10 text-emerald-600 mx-auto mb-4"/><div className="text-[10px] uppercase tracking-[.3em] text-[#936B34]">Payment submitted</div><h1 className="font-serif text-3xl mt-2">Thank you for your Park Avenue order.</h1><p className="text-sm text-gray-500 mt-4">{currentOrder?.id ? <>Order <strong>{currentOrder.id}</strong>. </> : ''}Stripe payment confirmation is synchronized by webhook. Your order tracking information will appear in your account once dispatched.</p><button onClick={()=>setActiveView('account')} className="mt-6 bg-[#111827] text-white px-6 py-3 text-xs uppercase tracking-wider">View My Orders</button></div></div>;
  if(paymentResult==='cancelled') return <div className="min-h-[70vh] flex items-center justify-center p-8"><div className="max-w-xl text-center border border-gray-200 p-10"><h1 className="font-serif text-3xl">Payment cancelled</h1><p className="text-sm text-gray-500 mt-3">Your order remains unpaid. Your shopping bag is preserved so you can retry payment.</p><button onClick={()=>{setPaymentResult(null); window.history.replaceState({},'', '/checkout');}} className="mt-6 bg-[#111827] text-white px-6 py-3 text-xs uppercase tracking-wider">Return to Checkout</button></div></div>;
  if(!cart.length) return <div className="min-h-[60vh] flex items-center justify-center p-8"><div className="text-center"><ShoppingBag className="mx-auto mb-4 text-[#936B34]"/><h2 className="font-serif text-2xl">Your shopping bag is empty</h2></div></div>;

  return <div className="min-h-[70vh] bg-white text-[#111827] px-4 py-10 sm:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10"><div className="text-[11px] uppercase tracking-[.35em] text-[#936B34] mb-2">PA Atelier Checkout</div><h1 className="font-serif text-3xl sm:text-4xl">Secure Checkout</h1></div>
      <div className="grid grid-cols-3 gap-2 mb-8">
        {(['Contact','Shipping','Payment'] as const).map((label,i)=>{const n=i+1;return <button key={label} onClick={()=>n<step&&setStep(n as any)} className={`border p-3 text-left ${step===n?'border-[#936B34] bg-[#FBF9F5]':'border-gray-200'}`}><div className="text-[10px] uppercase tracking-widest text-gray-500">Step {n}</div><div className="font-mono text-xs mt-1">{label} {step>n&&<Check className="inline w-3 h-3 ml-1 text-emerald-600"/>}</div></button>})}
      </div>
      {error&&<div className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid lg:grid-cols-[1.5fr_.8fr] gap-8">
        <div className="border border-gray-200 p-5 sm:p-8">
          {step===1&&<div className="space-y-5">
            <h2 className="font-serif text-2xl">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">{[['firstName','First Name'],['lastName','Last Name'],['email','Email'],['phone','Phone Number']].map(([key,label])=><label key={key} className="text-xs font-mono uppercase tracking-wider">{label}<input value={(contact as any)[key]} onChange={e=>setContact({...contact,[key]:e.target.value})} className="mt-2 w-full border border-gray-200 p-3 text-sm normal-case tracking-normal" /></label>)}</div>
            <button onClick={continueShipping} className="w-full bg-[#111827] text-white p-4 text-xs uppercase tracking-[.25em]">Continue to Shipping <ArrowRight className="inline w-4 ml-2"/></button>
          </div>}
          {step===2&&<div className="space-y-5">
            <h2 className="font-serif text-2xl">Shipping Address & Method</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs font-mono uppercase tracking-wider sm:col-span-2">Street Address<input value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal"/></label>
              <label className="text-xs font-mono uppercase tracking-wider sm:col-span-2">Apartment / Suite <input value={address.apartment} onChange={e=>setAddress({...address,apartment:e.target.value})} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal"/></label>
              <label className="text-xs font-mono uppercase tracking-wider">City<input value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal"/></label>
              <label className="text-xs font-mono uppercase tracking-wider">US State<select value={address.state} onChange={e=>setAddress({...address,state:e.target.value})} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal"><option value="">Select state</option>{STATES.map(([code,name])=><option key={code} value={code}>{name} ({code})</option>)}</select></label>
              <label className="text-xs font-mono uppercase tracking-wider">Postal Code<input value={address.postalCode} onChange={e=>setAddress({...address,postalCode:e.target.value})} className="mt-2 w-full border p-3 text-sm normal-case tracking-normal"/></label>
            </div>
            <div><div className="text-xs font-mono uppercase tracking-wider mb-3">Shipping Method</div><div className="space-y-2">{(options.shippingMethods||[]).map((m:any)=><label key={m.id} className={`flex justify-between border p-4 cursor-pointer ${shippingMethod===m.id?'border-[#936B34] bg-[#FBF9F5]':'border-gray-200'}`}><span><input type="radio" name="shipping" checked={shippingMethod===m.id} onChange={()=>setShippingMethod(m.id)} className="mr-3"/><span className="font-medium text-sm">{m.name}</span><span className="block ml-6 text-xs text-gray-500">{m.description} · {m.estimatedDelivery}</span></span><span className="font-mono text-sm">{money(m.price)}</span></label>)}</div></div>
            <div className="flex justify-between gap-3"><button onClick={()=>setStep(1)} className="border px-5 py-3 text-xs uppercase tracking-wider">Back</button><button disabled={calculating} onClick={continuePayment} className="flex-1 bg-[#111827] text-white p-4 text-xs uppercase tracking-[.2em]">{calculating?'Calculating…':'Continue to Payment'} <ArrowRight className="inline w-4 ml-2"/></button></div>
          </div>}
          {step===3&&<div className="space-y-6">
            <h2 className="font-serif text-2xl">Order Review & Payment</h2>
            <div className="grid sm:grid-cols-2 gap-5 text-sm"><div><div className="font-mono text-[10px] uppercase text-[#936B34]">Contact</div><p>{contact.firstName} {contact.lastName}<br/>{contact.email}<br/>{contact.phone}</p></div><div><div className="font-mono text-[10px] uppercase text-[#936B34]">Shipping</div><p>{address.street}{address.apartment ? `, ${address.apartment}` : ''}<br/>{address.city}, {address.state} {address.postalCode}<br/>United States</p></div></div>
            <div className="border-t pt-5 space-y-3">{cart.map(i=><div key={i.id} className="flex justify-between text-sm"><span>{i.product.name} × {i.quantity}</span><span>{money(i.price*i.quantity)}</span></div>)}</div>
            <div className="flex justify-between gap-3"><button onClick={()=>setStep(2)} className="border px-5 py-3 text-xs uppercase tracking-wider">Back</button><button disabled={loading} onClick={makePayment} className="flex-1 bg-[#111827] text-white p-4 text-xs uppercase tracking-[.2em]">{loading?'Opening secure payment…':'Make Payment'} <Lock className="inline w-3.5 ml-2"/></button></div>
            <p className="text-[11px] text-gray-500 flex gap-2"><Lock className="w-3.5 shrink-0"/> Payment is processed on Stripe's hosted secure checkout. Final totals are recalculated and verified on the server.</p>
          </div>}
        </div>
        <aside className="border border-gray-200 p-5 sm:p-7 h-fit lg:sticky lg:top-6">
          <div className="flex items-center gap-2 font-serif text-xl mb-5"><Truck className="w-5 text-[#936B34]"/> Order Summary</div>
          <div className="space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(calc?.subtotal??cartSubtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{step>=2&&calc?money(calc.shipping.amount):'Select method'}</span></div><div className="flex justify-between"><span>Sales Tax</span><span>{!address.state?'Calculated upon selecting state':calculating?'Calculating…':calc?money(calc.tax.taxAmount):'Calculating…'}</span></div></div>
          <div className="border-t mt-5 pt-5 flex justify-between font-serif text-xl"><span>Total</span><span>{calc?money(calc.total):'—'}</span></div>
          <p className="text-[10px] text-gray-400 mt-4">US state-level tax shown after a shipping state is selected. Local/ZIP tax rules can be added to the centralized tax engine later.</p>
        </aside>
      </div>
    </div>
  </div>;
};
