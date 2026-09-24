import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  AlertCircle,
  Truck,
  Scissors
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';

type AuthViewMode = 'login' | 'create-account';

export const LoginPage: React.FC = () => {
  const { login, register, setActiveView, showToast, currentCustomer } = useShop();

  const [viewMode, setViewMode] = useState<AuthViewMode>('login');
  
  // Independent password visibility toggles for each field
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Create Account Form State
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [emailId, setEmailId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState('');

  // Reset the login form whenever a session is signed out.
  // This prevents the previous user's credentials/error message from remaining
  // visible when logout returns the user to the login screen.
  useEffect(() => {
    if (!currentCustomer) {
      setViewMode('login');
      setLoginUsername('');
      setLoginPassword('');
      setErrorMessage(null);
      setIsLoading(false);
      setShowLoginPassword(false);
    }
  }, [currentCustomer]);

  // Password Validation Logic:
  // "Password logic should be: One caps and one caracter and number"
  const hasCaps = /[A-Z]/.test(regPassword);
  const hasChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === reEnterPassword;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = loginUsername.trim();
    if (!identifier || !loginPassword) {
      setErrorMessage('Please provide both Username and Password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, loginPassword);
      if (res.success) {
        if (res.role === 'admin' || res.role === 'staff') {
          setActiveView('admin');
        } else {
          setActiveView('account');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res.message || 'Invalid Username or Password. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate inputs
    if (!fName.trim()) {
      setErrorMessage('Please enter your F name.');
      return;
    }
    if (!lName.trim()) {
      setErrorMessage('Please enter your L name.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Please enter a Username.');
      return;
    }
    if (!emailId.trim()) {
      setErrorMessage('Please enter your Email id.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Please enter a Password.');
      return;
    }

    // Validate Password Logic: One caps, one caracter, and number
    if (!hasCaps) {
      setErrorMessage('Password must contain at least one capital letter (A-Z).');
      return;
    }
    if (!hasChar) {
      setErrorMessage('Password must contain at least one special character (e.g. !@#$%^&*).');
      return;
    }
    if (!hasNumber) {
      setErrorMessage('Password must contain at least one number (0-9).');
      return;
    }
    if (regPassword !== reEnterPassword) {
      setErrorMessage('Password and Re-enter password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fName: fName.trim(),
        lName: lName.trim(),
        username: regUsername.trim(),
        emailId: emailId.trim(),
        password: regPassword,
        reEnterPassword: reEnterPassword
      });

      if (res.success) {
        showToast('Account created successfully! Welcome to Park Avenue Mens Wear.', 'success');
        setActiveView('account');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res.message || 'Registration could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ParkAvenueLogo variant="stacked" size="lg" />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] font-semibold">
            PARK AVENUE MENS WEAR
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#111827] tracking-tight font-normal">
            Welcome to Park Avenue Mens Wear
          </h1>
          <p className="mt-2 text-xs text-gray-500 font-mono">
            {viewMode === 'login' 
              ? 'Sign in with your username and password to access your commissions, bespoke orders, and tailor fittings.'
              : 'Create your Park Avenue Mens Wear patron account with personalized tailoring portfolio.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs font-mono space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block uppercase tracking-wider">Notice</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            </div>
          )}


          {/* ========================================================= */}
          {/* VIEW: LOGIN                                               */}
          {/* Welcome to Park Avenue Mens Wear -> Username -> Password -> Login -> Create account */}
          {/* ========================================================= */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              {/* Username Field */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1.5 font-medium">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-10 pr-3.5 py-3 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-medium">
                    Password
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">
                    {showLoginPassword ? 'Visibility: Visible' : 'Visibility: Hidden'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-10 pr-12 py-3 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                  {/* Eye Icon Button for Login Password */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 pl-2 flex items-center justify-center text-gray-400 hover:text-[#936B34] active:scale-95 focus:outline-none transition-all cursor-pointer group"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-[#936B34]" />
                    ) : (
                      <Eye className="w-4 h-4 group-hover:text-[#936B34]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] active:bg-[#7a5829] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="font-mono flex items-center gap-2">
                      <span className="animate-spin">◌</span>
                      <span>LOGGING IN...</span>
                    </span>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4 text-[#936B34]" />
                    </>
                  )}
                </button>
              </div>

              {/* Create account Toggle Button */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-mono mb-2">
                  New to Park Avenue Mens Wear?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('create-account');
                    setErrorMessage(null);
                  }}
                  className="w-full py-3 bg-white border border-gray-300 text-xs font-mono uppercase tracking-wider text-[#111827] hover:border-[#936B34] hover:text-[#936B34] hover:bg-[#F9F9F8] active:bg-gray-100 active:scale-[0.99] transition-all cursor-pointer font-semibold shadow-xs"
                >
                  Create account
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* VIEW: CREATE ACCOUNT                                      */}
          {/* F name -> L name -> Username -> Email id -> Password -> Re enter password */}
          {/* Password logic: One caps and one caracter and number       */}
          {/* ========================================================= */}
          {viewMode === 'create-account' && (
            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                <span className="font-serif text-lg text-[#111827] uppercase tracking-wide">
                  Create account
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-mono text-[#936B34] hover:text-[#7a5829] hover:underline transition-colors cursor-pointer"
                >
                  Already have an account? Login
                </button>
              </div>

              {/* F name & L name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* F name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1 font-medium">
                    F name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      placeholder="First name"
                      className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                    />
                  </div>
                </div>

                {/* L name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1 font-medium">
                    L name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={lName}
                      onChange={(e) => setLName(e.target.value)}
                      placeholder="Last name"
                      className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1 font-medium">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                </div>
              </div>

              {/* Email id */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 mb-1 font-medium">
                  Email id *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-3 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-medium">
                    Password *
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">
                    {showRegPassword ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-11 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                  {/* Eye Icon Button for Password */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center justify-center text-gray-400 hover:text-[#936B34] active:scale-95 focus:outline-none transition-all cursor-pointer group"
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4 text-[#936B34]" />
                    ) : (
                      <Eye className="w-4 h-4 group-hover:text-[#936B34]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Re enter password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 font-medium">
                    Re enter password *
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">
                    {showReEnterPassword ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showReEnterPassword ? 'text' : 'password'}
                    required
                    value={reEnterPassword}
                    onChange={(e) => setReEnterPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full bg-[#FBFBFA] border border-gray-200 pl-9 pr-11 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] focus:ring-1 focus:ring-[#936B34]/30 transition-all"
                  />
                  {/* Eye Icon Button for Re-enter Password */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowReEnterPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center justify-center text-gray-400 hover:text-[#936B34] active:scale-95 focus:outline-none transition-all cursor-pointer group"
                    title={showReEnterPassword ? 'Hide re-enter password' : 'Show re-enter password'}
                    aria-label={showReEnterPassword ? 'Hide re-enter password' : 'Show re-enter password'}
                  >
                    {showReEnterPassword ? (
                      <EyeOff className="w-4 h-4 text-[#936B34]" />
                    ) : (
                      <Eye className="w-4 h-4 group-hover:text-[#936B34]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Logic Requirements Display */}
              <div className="p-3 bg-[#F9F9F8] border border-gray-200 rounded-xs space-y-1.5 mt-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Password Logic Requirements:
                </div>
                
                {/* 1. One caps */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {hasCaps ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className={hasCaps ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    One caps (At least one capital letter A-Z)
                  </span>
                </div>

                {/* 2. One caracter (special character) */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {hasChar ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className={hasChar ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    One caracter (Special character e.g. !@#$%)
                  </span>
                </div>

                {/* 3. Number */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    Number (At least one number 0-9)
                  </span>
                </div>

                {/* Re-enter match check */}
                {reEnterPassword && (
                  <div className="flex items-center gap-2 text-xs font-mono pt-1.5 border-t border-gray-200">
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-red-600'}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#111827] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#936B34] active:bg-[#7a5829] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="font-mono flex items-center gap-2">
                      <span className="animate-spin">◌</span>
                      <span>CREATING ACCOUNT...</span>
                    </span>
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4 text-[#936B34]" />
                    </>
                  )}
                </button>
              </div>

              {/* Back to Login link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-mono text-gray-500 hover:text-[#936B34] transition-colors cursor-pointer"
                >
                  Already registered? <span className="font-semibold underline">Login</span>
                </button>
              </div>

            </form>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#936B34]" />
            <span>256-Bit SSL Encrypted · Park Avenue Mens Wear Authentication</span>
          </div>

        </div>

        {/* Quick Direct Tracking Without Login */}
        <div className="mt-8 p-5 bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-serif text-sm text-[#111827] uppercase tracking-wide">
              LOOKING FOR AN EXISTING COMMISSION OR ALTERATION?
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono mb-3.5 leading-relaxed">
            Track garment shipments or tailor alteration milestones directly with your Order ID or phone number.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveView('track-order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-2.5 px-3 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] hover:text-[#936B34] hover:bg-white active:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-[#936B34]" />
              <span>TRACK ORDER WITH ID</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('track-alteration');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-2.5 px-3 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] hover:text-[#936B34] hover:bg-white active:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <Scissors className="w-3.5 h-3.5 text-[#936B34]" />
              <span>LOOKUP TAILOR FITTING</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
