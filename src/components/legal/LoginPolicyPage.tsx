import React from 'react';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  UserCheck, 
  ChevronRight, 
  ArrowLeft, 
  Database,
  Fingerprint,
  FileText
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { navigateTo } from '../../utils/router';

export const LoginPolicyPage: React.FC = () => {
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
          <span className="text-[#111827] font-semibold">LOGIN &amp; SECURITY POLICY</span>
        </nav>

        {/* Page Header Banner */}
        <div className="border-b border-gray-200 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC ARCHITECTURE &amp; ACCESS ACCORD</span>
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              BANKING-GRADE TLS 1.3 / AES-256
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#111827] font-light tracking-wide">
            Login &amp; Account Security Policy
          </h1>

          <p className="text-sm text-gray-600 font-sans max-w-2xl leading-relaxed">
            Park Avenue Menswear upholds the highest standards of data integrity and patron confidentiality. This policy outlines our encryption protocols, authentication mechanics, password protections, and role segregation principles.
          </p>
        </div>

        {/* Core Security Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-mono text-[10px] uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ZERO PLAINTEXT</span>
            </div>
            <p className="font-serif text-xl text-[#111827]">Salted Bcrypt Hashing</p>
            <p className="text-xs text-gray-500 font-sans">
              Passwords and authentication credentials are encrypted using one-way adaptive cryptographic hashes.
            </p>
          </div>

          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 font-mono text-[10px] uppercase font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>DEFAULT ROLE</span>
            </div>
            <p className="font-serif text-xl text-[#111827]">Strict Customer Role</p>
            <p className="text-xs text-gray-500 font-sans">
              All accounts default to customer role upon registration; administrative privileges require direct database authorization.
            </p>
          </div>

          <div className="p-5 bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#936B34] font-mono text-[10px] uppercase font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>SESSION SECURITY</span>
            </div>
            <p className="font-serif text-xl text-[#111827]">Cryptographic JWT</p>
            <p className="text-xs text-gray-500 font-sans">
              Stateless tokens with strict expiry, origin validation, and automatic session revocation.
            </p>
          </div>
        </div>

        {/* Deep Dive Security Accord */}
        <div className="bg-white border border-gray-200 p-6 sm:p-10 shadow-xs space-y-8 text-gray-700 text-sm leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-[#936B34]" />
              <span>1. Account Registration &amp; Role-Based Access Control (RBAC)</span>
            </h2>
            <p>
              In accordance with our zero-trust security paradigm:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Default Role:</strong> When any patron registers an account via the storefront, the account is strictly and unconditionally assigned the <span className="font-mono text-gray-900 bg-gray-100 px-1 py-0.5 rounded-xs">customer</span> role.</li>
              <li><strong>Administrative Privilege Segregation:</strong> Executive administrator privileges cannot be requested, injected, or escalated from client-side requests. Administrator status is granted solely by direct database configuration in MongoDB Atlas.</li>
              <li><strong>Staff Operations:</strong> Staff tailors, inventory coordinators, and support staff operate under strict permission boundaries logged to immutable audit records.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              <span>2. Password Encryption &amp; Salted Storage</span>
            </h2>
            <p>
              We implement industry-standard cryptographic safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Zero Plaintext Storage:</strong> Raw passwords never enter database ledgers, application log files, or communication telemetry.</li>
              <li><strong>Bcrypt Salting:</strong> Passwords are transformed with a cryptographic salt and 10-round work factor resistant to rainbow table and dictionary attacks.</li>
              <li><strong>Secure Password Reset:</strong> Self-service credential updates require verified identity authentication over encrypted channels via our <span className="font-mono text-[#936B34] font-semibold cursor-pointer hover:underline" onClick={() => { setActiveView('reset-password'); navigateTo('/reset-password'); }}>/reset-password</span> portal.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>3. Transmission Encryption &amp; Network Protections</span>
            </h2>
            <p>
              All traffic between your browser and our atelier servers is strictly forced over Transport Layer Security (TLS 1.3) with 256-bit AES encryption. Features include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Brute-Force &amp; Replay Prevention:</strong> Automated request debouncing, nonce checks, and rate limiters defend against automated login attempts.</li>
              <li><strong>Payment Isolation:</strong> Credit card details never traverse or reside on Park Avenue servers. Payment information is tokenized directly via Stripe Elements (PCI-DSS Level 1 certified).</li>
              <li><strong>Audited Ledger:</strong> Administrative operations (such as product creation, inventory adjustments, and status changes) generate permanent audit trails for transparency.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#111827] font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-700" />
              <span>4. Data Sovereignty &amp; Privacy Guarantee</span>
            </h2>
            <p>
              We honor the trust you place in our atelier:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li><strong>Zero Monetization:</strong> We never sell, lease, share, or monetize patron contact details, tailoring measurements, or browsing data to third-party advertisers.</li>
              <li><strong>Right to Deletion:</strong> Patrons may request full account deletion and measurement record purge at any time by contacting our client care concierge.</li>
              <li><strong>Notification Privacy:</strong> Direct announcements and dispatches sent by the atelier concierge are private and visible exclusively to the targeted customer account.</li>
            </ul>
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
              onClick={() => { setActiveView('terms'); navigateTo('/terms'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              TERMS OF SERVICE &rarr;
            </button>
            <button 
              onClick={() => { setActiveView('return-policy'); navigateTo('/returns'); }}
              className="hover:text-[#936B34] transition-colors cursor-pointer"
            >
              RETURN POLICY &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
