import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { OFFICIAL_CATEGORIES } from '../../types';
import { LegalModal } from './LegalModals';
import { Lock, ShieldCheck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { navigateTo } from '../../utils/router';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory } = useShop();
  const [legalModalType, setLegalModalType] = useState<'terms' | 'return-policy' | 'login-encryption' | 'payment-encryption' | null>(null);

  const handleNavCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-[#F9F9F8] border-t border-gray-200 text-gray-600 pt-16 pb-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Brand Header */}
          <div className="pb-12 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ParkAvenueLogo variant="horizontal" size="md" className="text-[#111827]" />
            </div>

            <div className="text-xs font-mono uppercase tracking-widest text-[#936B34] font-medium">
              HAND-CANVASSED SUITS &amp; BESPOKE TAILORING · GURNEE, IL
            </div>
          </div>

          {/* 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-b border-gray-200">
            
            {/* Column 1: SHOP (All Categories) */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
                ATELIER COLLECTIONS
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono uppercase tracking-wider text-gray-600">
                {OFFICIAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleNavCategory(cat.queryValue)}
                    className="text-left hover:text-[#936B34] transition-colors cursor-pointer truncate"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: SERVICES & POLICIES */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
                SERVICES &amp; POLICIES
              </h3>
              <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-gray-600">
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('track-alteration');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#936B34] transition-colors cursor-pointer"
                  >
                    BESPOKE ALTERATIONS
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('track-order');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-[#936B34] transition-colors cursor-pointer"
                  >
                    ORDER TRACKING
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('track-return');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-[#936B34] transition-colors cursor-pointer"
                  >
                    RETURNS &amp; EXCHANGES
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('return-policy');
                      navigateTo('/returns');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#936B34] transition-colors cursor-pointer text-[#111827] font-medium flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>RETURN POLICY (15-DAY GUARANTEE)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('terms');
                      navigateTo('/terms');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#936B34] transition-colors cursor-pointer text-[#111827] font-medium flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#936B34]" />
                    <span>TERMS &amp; CONDITIONS</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('login-policy');
                      navigateTo('/login-policy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#936B34] transition-colors cursor-pointer text-[#111827] font-medium flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>LOGIN SECURITY &amp; ACCESS POLICY</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPANY & SECURITY */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#111827] font-semibold">
                COMPANY &amp; ATELIER
              </h3>
              <ul className="space-y-3 text-xs font-mono uppercase tracking-wider text-gray-600">
                <li className="text-[#111827] font-medium">
                  PARK AVENUE MENSWEAR
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-[#936B34] transition-colors cursor-pointer"
                  >
                    ABOUT ATELIER
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setActiveView('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="hover:text-[#936B34] transition-colors cursor-pointer"
                  >
                    DEPARTMENTS DIRECTORY
                  </button>
                </li>
                <li>
                  <span className="text-gray-600 hover:text-[#936B34] transition-colors cursor-pointer">
                    CLIENT CARE &amp; CONCIERGE
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Security & Cryptographic Trust Badges */}
          <div className="py-8 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Login Encryption Badge */}
            <button
              type="button"
              onClick={() => setLegalModalType('login-encryption')}
              className="p-4 bg-white border border-gray-200 hover:border-emerald-500 rounded-sm text-left transition-all duration-300 flex items-start gap-3 cursor-pointer shadow-xs group"
            >
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full group-hover:scale-105 transition-transform shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold text-[#111827]">
                  <span>256-BIT SSL LOGIN ENCRYPTION</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                  End-to-end cryptographic patron session protection. Zero plaintext password transmission.
                </p>
                <span className="text-[10px] font-mono text-emerald-700 font-medium hover:underline inline-block mt-1">
                  View Security Accord &rarr;
                </span>
              </div>
            </button>

            {/* Payment Encryption Badge */}
            <button
              type="button"
              onClick={() => setLegalModalType('payment-encryption')}
              className="p-4 bg-white border border-gray-200 hover:border-indigo-500 rounded-sm text-left transition-all duration-300 flex items-start gap-3 cursor-pointer shadow-xs group"
            >
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-full group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold text-[#111827]">
                  <span>STRIPE PCI-DSS LEVEL 1 PAYMENT ENCRYPTION</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                  Direct client-side tokenization with 256-bit AES banking-grade transaction architecture.
                </p>
                <span className="text-[10px] font-mono text-indigo-700 font-medium hover:underline inline-block mt-1">
                  View Payment Safeguards &rarr;
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono tracking-widest text-gray-500">
            <div>
              © PARK AVENUE MENSWEAR. ALL RIGHTS RESERVED.
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
              <button 
                onClick={() => {
                  setActiveView('terms');
                  navigateTo('/terms');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#936B34] transition-colors cursor-pointer"
              >
                TERMS &amp; CONDITIONS
              </button>
              <button 
                onClick={() => {
                  setActiveView('return-policy');
                  navigateTo('/returns');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#936B34] transition-colors cursor-pointer"
              >
                RETURN POLICY
              </button>
              <button 
                onClick={() => {
                  setActiveView('login-policy');
                  navigateTo('/login-policy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-emerald-700 transition-colors cursor-pointer"
              >
                LOGIN POLICY
              </button>
              <button 
                onClick={() => setLegalModalType('payment-encryption')}
                className="hover:text-indigo-700 transition-colors cursor-pointer"
              >
                PAYMENT SECURITY
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Legal & Security Policy Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </>
  );
};
