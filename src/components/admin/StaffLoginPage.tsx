import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  UserCheck,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { navigateTo } from '../../utils/router';

export const StaffLoginPage: React.FC = () => {
  const { login, isAdminLoggedIn, setActiveView, showToast } = useShop();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      setActiveView('admin');
      navigateTo('/admin');
    }
  }, [isAdminLoggedIn, setActiveView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    if (!cleanIdentifier || !password) {
      setErrorMessage('Please enter both your staff/admin email and security password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const res = await login(cleanIdentifier, password);
      if (res.success && (res.role === 'admin' || res.role === 'staff')) {
        showToast(`Authentication verified (${res.role?.toUpperCase()}). Welcome to the Atelier & Admin Console.`, 'success');
        setActiveView('admin');
        navigateTo('/admin');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } else if (res.success) {
        setErrorMessage('Access restricted: This account does not possess administrator or staff clearance.');
        showToast('Access restricted: Staff or Administrator privileges required.', 'error');
      } else {
        setErrorMessage(res.message || 'Invalid credentials. Please verify your email/username and password.');
      }
    } catch {
      setErrorMessage('Authentication protocol error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-[#F9F9F8] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl p-7 sm:p-10 relative">
        
        {/* Atelier Security Badge */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ParkAvenueLogo variant="stacked" size="sm" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111827] text-[#936B34] text-[10px] font-mono uppercase tracking-[0.25em] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E5C384]" />
            <span>ADMIN &amp; STAFF ATELIER PORTAL</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
            ADMIN &amp; STAFF LOGIN
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-2 leading-relaxed">
            Authorized portal paths (<code className="text-[#936B34]">/admin-login</code> · <code className="text-[#936B34]">/staff-login</code>). Enter your verified credentials to access administrative controls, tailoring benches, and inventory ERP.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono">
            <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Strict credential verification · One-tap login removed for security</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* Staff / Admin Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5 font-medium">
              Administrator / Staff Email or Username *
            </label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="e.g. parkamw@admin.com or tailor"
              className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-700 mb-1.5 font-medium">
              Security Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F9F9F8] border border-gray-300 px-3.5 py-2.5 pr-10 text-xs text-[#111827] font-mono focus:border-[#936B34] focus:bg-white focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#E5C384]" />
            <span>{isAuthenticating ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE ACCESS'}</span>
          </button>

          {/* Quick Credential Assistant */}
          <div className="pt-3 border-t border-gray-100">
            <div className="bg-[#F9F9F8] border border-gray-200 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-700 font-semibold flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#936B34]" />
                  <span>Authorized Personnel Accounts</span>
                </span>
                <span className="text-[9px] font-mono text-gray-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setUsernameOrEmail('admin');
                    setPassword('Admin@2026');
                    setErrorMessage('');
                  }}
                  className="text-left p-1.5 bg-white border border-gray-200 hover:border-[#936B34] hover:bg-amber-50/40 transition-all cursor-pointer group"
                >
                  <div className="text-[9px] font-mono uppercase text-[#936B34] font-semibold">Admin (DB)</div>
                  <div className="text-[11px] font-mono text-[#111827] group-hover:text-[#936B34]">admin</div>
                  <div className="text-[8px] font-mono text-gray-400">Admin@2026</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsernameOrEmail('admin1');
                    setPassword('Admin@2026');
                    setErrorMessage('');
                  }}
                  className="text-left p-1.5 bg-white border border-gray-200 hover:border-[#936B34] hover:bg-amber-50/40 transition-all cursor-pointer group"
                >
                  <div className="text-[9px] font-mono uppercase text-[#936B34] font-semibold">Admin 1</div>
                  <div className="text-[11px] font-mono text-[#111827] group-hover:text-[#936B34]">admin1</div>
                  <div className="text-[8px] font-mono text-gray-400">Admin@2026</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsernameOrEmail('tailor');
                    setPassword('Tailor@2026');
                    setErrorMessage('');
                  }}
                  className="text-left p-1.5 bg-white border border-gray-200 hover:border-[#936B34] hover:bg-amber-50/40 transition-all cursor-pointer group"
                >
                  <div className="text-[9px] font-mono uppercase text-[#936B34] font-semibold">Staff Tailor</div>
                  <div className="text-[11px] font-mono text-[#111827] group-hover:text-[#936B34]">tailor</div>
                  <div className="text-[8px] font-mono text-gray-400">Tailor@2026</div>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Navigation Options */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveView('login');
                navigateTo('/login');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className="text-[#936B34] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patron / Customer Login (/login) &rarr;</span>
            </button>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              ERP READY
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setActiveView('home');
              navigateTo('/');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="text-gray-500 hover:text-black flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO STOREFRONT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
