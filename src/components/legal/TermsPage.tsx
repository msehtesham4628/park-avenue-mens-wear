import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Scissors, 
  CreditCard, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { navigateTo } from '../../utils/router';

export const TermsPage: React.FC = () => {
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
          <span className="text-[#111827] font-semibold">TERMS &amp; CONDITIONS</span>
        </nav>

        {/* Page Header Banner */}
        <div className="border-b border-gray-200 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>LEGAL ACCORD &amp; SARTORIAL COVENANT</span>
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold border border-gray-200">
              EFFECTIVE 2026
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#111827] font-light tracking-wide">
            Terms &amp; Conditions of Service
          </h1>

          <p className="text-sm text-gray-600 font-sans max-w-2xl leading-relaxed">
            Welcome to Park Avenue Menswear. These terms govern the commissioning, tailoring, purchase, and delivery of bespoke garments, handcrafted suiting, footwear, and luxury appointments through our digital boutique and private atelier.
          </p>
        </div>

        {/* Quick Summary Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-[#936B34] font-mono text-[10px] uppercase font-bold">
              <Scissors className="w-3.5 h-3.5" />
              <span>BESPOKE FIT</span>
            </div>
            <p className="font-serif text-base text-[#111827]">Complimentary Alteration</p>
            <p className="text-[11px] text-gray-500 font-sans">
              All commissioned suits include master tailor fit adjustments within 30 days of receipt.
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-mono text-[10px] uppercase font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SECURITY FIRST</span>
            </div>
            <p className="font-serif text-base text-[#111827]">256-Bit Cryptography</p>
            <p className="text-[11px] text-gray-500 font-sans">
              Patron credentials and payments are safeguarded under banking-grade SSL &amp; Stripe tokenization.
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-indigo-700 font-mono text-[10px] uppercase font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>RETURN WINDOW</span>
            </div>
            <p className="font-serif text-base text-[#111827]">15-Day Inspection</p>
            <p className="text-[11px] text-gray-500 font-sans">
              Unworn garments in original cedar packaging enjoy 15-day return and exchange privileges.
            </p>
          </div>
        </div>

        {/* Main Terms Sections */}
        <div className="bg-white border border-gray-200 p-6 sm:p-10 shadow-xs space-y-8 text-gray-700 text-sm leading-relaxed font-sans">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">1</span>
              <span>Atelier Commission &amp; Bespoke Craftsmanship</span>
            </h2>
            <p>
              Every garment offered by Park Avenue Menswear is tailored according to rigorous European tailoring specifications. Our suiting features full floating horsehair canvases, Super 130s-150s worsted wools sourced from renowned Biella mills, and handcrafted silk appointments. By completing an order, patrons enter into a binding craftsmanship agreement for the production and delivery of specified garments.
            </p>
            <p>
              Due to natural variations in genuine horn buttons, pure silk linings, and hand-woven fabrics, minor artisanal nuances reflect the authentic bespoke heritage of each handcrafted piece.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">2</span>
              <span>Sizing, Fit Guarantee &amp; Alteration Allowances</span>
            </h2>
            <p>
              We provide precise anatomical measurement guides for every garment category. To guarantee the signature Park Avenue silhouette:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>All two-piece and three-piece suits include complimentary alteration allowances at certified atelier locations or via insured mail-in fit tracking.</li>
              <li>Patrons may submit alteration requests within 30 calendar days of delivery via our <span className="font-mono text-[#936B34] font-semibold cursor-pointer hover:underline" onClick={() => { setActiveView('track-alteration'); navigateTo('/track-alteration'); }}>/track-alteration</span> portal.</li>
              <li>Any garment altered by an uncertified external third party without prior authorization voids subsequent replacement or return rights.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">3</span>
              <span>Pricing, Currency, Taxes &amp; Luxury Shipping</span>
            </h2>
            <p>
              All prices are listed in United States Dollars (USD) and inclusive of luxury garment bag packaging. State sales taxes are automatically determined at checkout based on verified destination jurisdiction in compliance with United States interstate commerce regulations.
            </p>
            <p>
              Complimentary expedited insured shipping applies to all domestic orders exceeding $200.00 USD. Orders are dispatched with signature-required white-glove courier handling.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">4</span>
              <span>Account Credentials, Passwords &amp; Patron Roles</span>
            </h2>
            <p>
              Upon registration, patron accounts are granted standard customer privileges with personal measurement history, order tracking, and wishlist synchronization. Customers are responsible for safeguarding their login credentials.
            </p>
            <p>
              Administrative access to atelier operational consoles is strictly restricted and verified via database access controls. For full details on authentication safeguards, please review our <span className="font-mono text-[#936B34] font-semibold cursor-pointer hover:underline" onClick={() => { setActiveView('login-policy'); navigateTo('/login-policy'); }}>Login &amp; Security Policy</span>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">5</span>
              <span>Promotional Coupons &amp; Atelier Privileges</span>
            </h2>
            <p>
              Coupons and VIP invitation codes issued through our concierge announcements or marketing broadcasts are valid strictly up to specified expiration dates and minimum subtotal thresholds. Promotional codes cannot be exchanged for cash currency or applied retroactively to previously finalized commissions.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-gray-300 flex items-center justify-center text-[10px] text-[#936B34]">6</span>
              <span>Intellectual Property &amp; Governing Jurisdiction</span>
            </h2>
            <p>
              All sartorial patterns, product titles, photography, descriptions, and the Park Avenue Menswear hallmark are proprietary intellectual property. These terms are governed under the laws of the State of New York and the United States of America.
            </p>
          </section>

        </div>

        {/* Footer Actions */}
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
              onClick={() => { setActiveView('return-policy'); navigateTo('/returns'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              RETURN POLICY &rarr;
            </button>
            <button 
              onClick={() => { setActiveView('login-policy'); navigateTo('/login-policy'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              LOGIN &amp; SECURITY POLICY &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
