import React from 'react';
import { X, ShieldCheck, Lock, CreditCard, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'return-policy' | 'login-encryption' | 'payment-encryption' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="bg-white max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-300 shadow-2xl p-6 sm:p-8 relative text-[#111827]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'terms' && (
          <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 text-[#936B34] font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <FileText className="w-4 h-4" />
              <span>LEGAL ACCORD</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
              Terms &amp; Conditions
            </h2>
            <p className="text-gray-500 font-mono text-[11px] pb-3 border-b border-gray-200">
              Effective Date: 2026 · Park Avenue Menswear Atelier &amp; Tailoring Guild
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                1. Atelier Commission &amp; Bespoke Craftsmanship
              </h3>
              <p>
                Every garment commissioned through Park Avenue Menswear is tailored according to precise anatomical specifications, utilizing full floating horsehair canvases, Super 130s-150s worsted wools, and handcrafted silk appointments. By placing an order, patrons enter into a binding craftsmanship agreement.
              </p>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                2. Sizing, Alterations &amp; Fit Assurance
              </h3>
              <p>
                All suiting and tailored trousers include complimentary master alteration allowances. Custom alterations initiated within 30 days of receipt are honored at our private atelier or through our certified regional tailor network.
              </p>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                3. Pricing &amp; Currency
              </h3>
              <p>
                All prices are denominated in United States Dollars (USD) and inclusive of domestic luxury packaging. Park Avenue reserves the right to adjust bespoke fabric pricing based on rare heritage mill harvests (Biella and Huddersfield).
              </p>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                4. Cryptographic Security &amp; Data Integrity
              </h3>
              <p>
                Customer login credentials, tailoring measurements, and payment data are encrypted under banking-grade protocols (256-bit AES and TLS 1.3). We never sell, lease, or monetize customer data.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                UNDERSTOOD &amp; CLOSE
              </button>
            </div>
          </div>
        )}

        {type === 'return-policy' && (
          <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 text-[#936B34] font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <RotateCcw className="w-4 h-4" />
              <span>EXCHANGE &amp; CONCIERGE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
              Atelier Return Policy
            </h2>
            <p className="text-gray-500 font-mono text-[11px] pb-3 border-b border-gray-200">
              30-Day Luxury Return &amp; Fit Guarantee Window
            </p>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#FAF8F5] border border-gray-200">
                  <span className="text-[10px] font-mono uppercase text-[#936B34] font-bold block mb-1">WINDOW</span>
                  <p className="font-serif text-lg text-[#111827]">30 Days</p>
                  <p className="text-[10px] font-mono text-gray-500">From verified courier delivery date</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-gray-200">
                  <span className="text-[10px] font-mono uppercase text-[#936B34] font-bold block mb-1">SHIPPING</span>
                  <p className="font-serif text-lg text-[#111827]">Complimentary</p>
                  <p className="text-[10px] font-mono text-gray-500">Prepaid insured FedEx return label</p>
                </div>
              </div>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                1. Eligible Return Condition
              </h3>
              <p>
                Garments must be unworn, unwashed, unaltered by external non-certified third parties, with all atelier seals, silk tags, and cedar garment bags intact.
              </p>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                2. Alteration vs. Return
              </h3>
              <p>
                If the garment requires waist adjustments, sleeve adjustments, or trouser break styling, our Master Tailor Concierge provides complimentary bespoke adjustments rather than return.
              </p>

              <h3 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold">
                3. One-Click Digital Return Tracking
              </h3>
              <p>
                Initiate returns directly via our <span className="font-mono text-[#936B34]">/track-return</span> portal. A prepaid return QR code and printable label will be issued instantly upon approval.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                CLOSE RETURN POLICY
              </button>
            </div>
          </div>
        )}

        {type === 'login-encryption' && (
          <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <Lock className="w-4 h-4" />
              <span>SECURITY PROTOCOL VERIFIED</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
              256-Bit SSL Login Encryption
            </h2>
            <p className="text-gray-500 font-mono text-[11px] pb-3 border-b border-gray-200">
              End-to-End Patron Authentication Security Architecture
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
                <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>CRYPTOGRAPHIC AUTHENTICATION GUARANTEE</span>
                </div>
                <p className="text-emerald-800 text-xs">
                  All patron login sessions, passwords, and executive administrator privileges are encrypted with salted PBKDF2/Bcrypt and transmitted strictly over TLS 1.3 with 256-bit Advanced Encryption Standard (AES).
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p><strong>Zero Plaintext Storage:</strong> Passwords and API secrets are never stored or logged in plain text.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p><strong>Brute-Force &amp; Replay Protection:</strong> Automated request debouncing, nonce validation, and IP rate limits prevent credential stuffing.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p><strong>Role-Based Access Control (RBAC):</strong> Strict separation between Patron, Staff Tailor, and Atelier Administrator roles.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                VERIFIED &amp; CLOSE
              </button>
            </div>
          </div>
        )}

        {type === 'payment-encryption' && (
          <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
              <CreditCard className="w-4 h-4" />
              <span>PCI-DSS LEVEL 1 CERTIFIED</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
              Payment Encryption &amp; Security
            </h2>
            <p className="text-gray-500 font-mono text-[11px] pb-3 border-b border-gray-200">
              Stripe Bank-Grade Tokenization &amp; 256-Bit AES Safeguards
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-sm">
                <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-indigo-900 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>STRIPE LEVEL 1 PCI-DSS COMPLIANT</span>
                </div>
                <p className="text-indigo-800 text-xs">
                  Park Avenue Menswear never touches or stores raw credit card numbers. All payments are processed through Stripe Elements with direct client-side cryptographic tokenization.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <p><strong>3D Secure 2.0 (3DS):</strong> Integrated fraud protection with biometrics, SMS one-time verification, and PSD2 compliance.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <p><strong>AES-256 Bit Encryption:</strong> All transactions are transmitted using bank-grade 256-bit encrypted channels.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <p><strong>Immediate Settlement Receipts:</strong> Itemized tax invoices and order confirmation numbers are generated automatically upon successful charge.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                CONFIRMED &amp; CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
