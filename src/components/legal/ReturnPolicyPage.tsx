import React from 'react';
import { 
  RotateCcw, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  PackageCheck, 
  QrCode, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { navigateTo } from '../../utils/router';

export const ReturnPolicyPage: React.FC = () => {
  const { setActiveView } = useShop();

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
          <button 
            onClick={() => { setActiveView('home'); navigateTo('/'); }} 
            className="hover:text-[#936B34] transition-colors cursor-pointer"
          >
            HOME
          </button>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-[#111827] font-semibold">RETURN &amp; EXCHANGE POLICY</span>
        </nav>

        {/* Page Header Banner */}
        <div className="border-b border-gray-200 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ATELIER CONCIERGE &amp; FIT GUARANTEE</span>
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              15-DAY SATISFACTION WINDOW
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#111827] font-light tracking-wide">
            Returns, Exchanges &amp; Fit Guarantee
          </h1>

          <p className="text-sm text-gray-600 font-sans max-w-2xl leading-relaxed">
            At Park Avenue Menswear, every garment is crafted with uncompromising sartorial perfection. If your bespoke order requires adjustment, size exchange, or return, our concierge provides seamless digital resolution.
          </p>
        </div>

        {/* Highlight Guarantee Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#936B34] font-bold block">
              15-DAY WINDOW
            </span>
            <p className="font-serif text-2xl text-[#111827]">15 Days</p>
            <p className="text-xs text-gray-500 font-sans">
              Calculated from verified carrier delivery timestamp to request initiation.
            </p>
          </div>

          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
              COMPLIMENTARY SHIPPING
            </span>
            <p className="font-serif text-2xl text-emerald-800">Prepaid Return</p>
            <p className="text-xs text-gray-500 font-sans">
              Fully insured FedEx / UPS return labels provided at no additional cost.
            </p>
          </div>

          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold block">
              SETTLEMENT CHOICE
            </span>
            <p className="font-serif text-2xl text-indigo-900">Exchange or Refund</p>
            <p className="text-xs text-gray-500 font-sans">
              Direct refund to original payment method or bespoke size exchange.
            </p>
          </div>
        </div>

        {/* Step-by-Step Return Process */}
        <div className="border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold">
              EASY RESOLUTION
            </span>
            <h2 className="font-serif text-2xl text-[#111827] mt-0.5 font-light">
              How to Initiate a Return or Exchange
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#111827] text-white font-mono text-xs flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-mono text-xs uppercase font-bold text-[#111827]">
                Access Portal
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Navigate to our digital return tracking portal and provide your Order ID and contact details.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#111827] text-white font-mono text-xs flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-mono text-xs uppercase font-bold text-[#111827]">
                Select Preference
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Choose between size exchange, tailoring adjustment, store credit, or direct refund.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#111827] text-white font-mono text-xs flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-mono text-xs uppercase font-bold text-[#111827]">
                Print Prepaid Label
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Download your pre-addressed, insured courier label with barcode QR verification.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#111827] text-white font-mono text-xs flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-mono text-xs uppercase font-bold text-[#111827]">
                Swift Inspection
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Upon delivery to our atelier warehouse, inspection completes within 48 business hours.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-sans">
              Have your Order Number ready? You can track or initiate your return immediately:
            </span>
            <button
              type="button"
              onClick={() => { setActiveView('track-return'); navigateTo('/track-return'); }}
              className="px-5 py-2.5 bg-[#936B34] text-white hover:bg-[#111827] text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-2"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>LAUNCH RETURN PORTAL</span>
            </button>
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-white border border-gray-200 p-6 sm:p-10 shadow-xs space-y-8 text-gray-700 text-sm leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
              1. Eligible Return Conditions
            </h2>
            <p>
              To qualify for return, items must meet the following atelier standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Garments must be in pristine, unworn, and unwashed condition with no fragrances or markings.</li>
              <li>All authentic atelier tags, basting threads, fabric swatches, and cedar presentation packaging must be intact.</li>
              <li>Footwear must show zero sole abrasion and be returned in original branded shoe boxes with dust bags.</li>
              <li>Made-to-order bespoke monograms or custom embroideries are eligible for complimentary fit adjustment rather than full refund.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
              2. Tailoring Adjustments vs. Returns
            </h2>
            <p>
              If a suiting garment requires minor adjustments (such as trouser inseam hem, sleeve length, or waist suppression), we recommend submitting an alteration request through our <span className="font-mono text-[#936B34] font-semibold cursor-pointer hover:underline" onClick={() => { setActiveView('track-alteration'); navigateTo('/track-alteration'); }}>/track-alteration</span> portal.
            </p>
            <p>
              Our master tailors will perform exact adjustments without requiring a complete re-order, ensuring your bespoke fit is preserved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
              3. Refund Processing &amp; Settlement Timelines
            </h2>
            <p>
              Once your returned garment is inspected and approved by our quality control specialists:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Original Payment Method:</strong> Refunds are credited directly to your credit or debit card through Stripe within 3–5 business days depending on your financial institution.</li>
              <li><strong>Store Credit &amp; Gift Cards:</strong> Issued immediately with zero expiration period, redeemable across all future drops.</li>
              <li><strong>Itemized Credit Memo:</strong> A formal itemized receipt detailing refunded sales taxes and subtotal is delivered via email concierge.</li>
            </ul>
          </section>

        </div>

        {/* Navigation & Help Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
          <button
            type="button"
            onClick={() => { setActiveView('shop'); navigateTo('/shop'); }}
            className="px-6 py-3 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO ATELIER SHOP</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <button 
              onClick={() => { setActiveView('terms'); navigateTo('/terms'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              TERMS OF SERVICE &rarr;
            </button>
            <button 
              onClick={() => { setActiveView('login-policy'); navigateTo('/login-policy'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              LOGIN SECURITY POLICY &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
