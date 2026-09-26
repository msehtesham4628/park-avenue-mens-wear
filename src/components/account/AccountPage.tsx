import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Truck, 
  Ruler, 
  ArrowRight,
  Trash2,
  LogOut,
  LogIn,
  ShieldCheck,
  ExternalLink,
  User,
  Lock,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AuthService, CustomerService } from '../../services/api';
import { Order, AlterationRecord, Customer } from '../../types';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { getUsStateTaxRates } from '../../services/taxEngine';

interface ReturnRequest {
  id: string;
  orderId: string;
  itemNames: string[];
  actionType: 'Size / Fit Exchange' | 'Bespoke Fitting Adjustment' | 'Store Credit' | 'Refund to Original Payment';
  reason: string;
  status: 'Pending Review' | 'Approved - Prepaid Label Sent' | 'Received at Atelier' | 'Completed / Refunded';
  createdAt: string;
  trackingReturnNumber?: string;
}

export const AccountPage: React.FC = () => {
  const { 
    currentCustomer, 
    logout,
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart, 
    setCurrentOrder, 
    setCurrentAlteration,
    setActiveView,
    showToast
  } = useShop();

  type CustomerDashboardTab = 'info' | 'password' | 'orders' | 'returns' | 'alterations' | 'wishlist';
  const [activeTab, setActiveTab] = useState<CustomerDashboardTab>('orders');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerAlterations, setCustomerAlterations] = useState<AlterationRecord[]>([]);

  // My Info Form State
  const [infoForm, setInfoForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    chest: '40 Regular',
    waist: '32 Inches',
    inseam: '32.5" (Slight Break)',
    neck: '15.5 Inches',
    sleeve: '34 Inches'
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // Returns State
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<string>('');
  const [returnActionType, setReturnActionType] = useState<ReturnRequest['actionType']>('Size / Fit Exchange');
  const [returnReason, setReturnReason] = useState('');
  const [returnItemsNotes, setReturnItemsNotes] = useState('');

  // Selected Order for Full Modal View
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Load customer profile and local returns
  const loadProfile = async () => {
    if (!currentCustomer) {
      setCustomerOrders([]);
      setCustomerAlterations([]);
      return;
    }

    try {
      const profile = await AuthService.getMe();
      if (profile) {
        setCustomerOrders(profile.orders);
        setCustomerAlterations(profile.alterations);
      }
    } catch {
      // offline fallback
    }

    // Populate info form from currentCustomer
    const addr = currentCustomer.addresses?.[0] || {
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: ''
    };

    setInfoForm({
      name: currentCustomer.name || '',
      email: currentCustomer.email || '',
      phone: currentCustomer.phone || '',
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || 'NY',
      zipCode: addr.zipCode || (addr as any).postalCode || '',
      chest: currentCustomer.measurements?.chest || '40 Regular',
      waist: currentCustomer.measurements?.waist || '32 Inches',
      inseam: currentCustomer.measurements?.inseam || '32.5" (Slight Break)',
      neck: currentCustomer.measurements?.neck || '15.5 Inches',
      sleeve: currentCustomer.measurements?.sleeve || '34 Inches'
    });

    // Load saved return requests
    try {
      const saved = localStorage.getItem(`pa_returns_${currentCustomer.id || currentCustomer.email}`);
      if (saved) {
        setReturnRequests(JSON.parse(saved));
      } else {
        // Seed default sample return for rich initial state
        const initialReturns: ReturnRequest[] = [
          {
            id: 'RET-8941',
            orderId: 'PA-10245',
            itemNames: ['The Sartorial Worsted Wool Suit'],
            actionType: 'Size / Fit Exchange',
            reason: 'Trousers hemming calibration requested for half break.',
            status: 'Approved - Prepaid Label Sent',
            createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
            trackingReturnNumber: 'FEDEX-RET-891024'
          }
        ];
        setReturnRequests(initialReturns);
        localStorage.setItem(`pa_returns_${currentCustomer.id || currentCustomer.email}`, JSON.stringify(initialReturns));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentCustomer]);

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleTrackOrder = (order: Order) => {
    setCurrentOrder(order);
    setActiveView('track-order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackAlteration = (alt: AlterationRecord) => {
    setCurrentAlteration(alt);
    setActiveView('track-alteration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Patron Profile & Measurements
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    setIsSavingInfo(true);
    try {
      await CustomerService.updateProfile(currentCustomer.id, {
        name: infoForm.name.trim(),
        phone: infoForm.phone.trim(),
        addresses: [
          {
            id: 'addr-default',
            label: 'Primary Delivery Atelier',
            street: infoForm.street.trim(),
            apartment: infoForm.apartment.trim(),
            city: infoForm.city.trim(),
            state: infoForm.state.trim().toUpperCase(),
            zipCode: infoForm.zipCode.trim(),
            postalCode: infoForm.zipCode.trim(),
            country: 'United States',
            isDefault: true
          }
        ],
        measurements: {
          chest: infoForm.chest.trim(),
          waist: infoForm.waist.trim(),
          inseam: infoForm.inseam.trim(),
          neck: infoForm.neck.trim(),
          sleeve: infoForm.sleeve.trim()
        }
      });
      showToast('Patron profile and bespoke measurements saved successfully.', 'success');
      await loadProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update patron details', 'error');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    setPasswordSuccessMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 5) {
      setPasswordErrorMessage('New password must be at least 5 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await AuthService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      if (res.success) {
        setPasswordSuccessMessage('Your security password has been updated successfully.');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password updated successfully.', 'success');
      } else {
        setPasswordErrorMessage(res.message);
      }
    } catch (err: any) {
      setPasswordErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Submit Return / Exchange Request
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder) {
      showToast('Please select an order to return or exchange.', 'error');
      return;
    }

    const newReturn: ReturnRequest = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: selectedReturnOrder,
      itemNames: [returnItemsNotes.trim() || 'Selected Consignment Items'],
      actionType: returnActionType,
      reason: returnReason.trim() || 'Patron fit revision requested.',
      status: 'Pending Review',
      createdAt: new Date().toLocaleDateString(),
      trackingReturnNumber: `FEDEX-RET-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updated = [newReturn, ...returnRequests];
    setReturnRequests(updated);
    if (currentCustomer) {
      localStorage.setItem(`pa_returns_${currentCustomer.id || currentCustomer.email}`, JSON.stringify(updated));
    }

    showToast(`Return request #${newReturn.id} submitted. Prepaid insured courier label generated.`, 'success');
    setIsReturnModalOpen(false);
    setReturnReason('');
    setReturnItemsNotes('');
    setActiveTab('returns');
  };

  const openReturnModalForOrder = (orderId: string) => {
    setSelectedReturnOrder(orderId);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="py-8 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ParkAvenueLogo variant="mark" size="lg" className="w-16 h-16" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wide font-light">
                  {currentCustomer?.name || 'PARK AVENUE CLIENT'}
                </h1>
                <span className="text-[10px] font-mono text-white bg-[#936B34] px-2.5 py-0.5 uppercase tracking-wider font-semibold">
                  PATRON PRIVATE
                </span>
              </div>
              {currentCustomer?.email && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {currentCustomer.email} · Account ID: #{currentCustomer.id || 'PA-CUST-1001'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveView('track-order')}
              className="px-3.5 py-2 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] hover:text-[#936B34] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-[#936B34]" />
              <span>ORDER TRACKING</span>
            </button>

            <button
              onClick={() => setActiveView('track-alteration')}
              className="px-3.5 py-2 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] hover:text-[#936B34] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-[#936B34]" />
              <span>ALTERATION TRACKING</span>
            </button>

            {(currentCustomer?.role === 'admin' || currentCustomer?.role === 'staff') ? (
              <button
                onClick={() => {
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-[#111827] text-white text-xs font-mono hover:bg-[#936B34] flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#936B34]" />
                <span>ATELIER ADMIN CONSOLE</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-[#F9F9F8] border border-[#936B34]/40 text-xs font-mono text-[#936B34] hover:bg-[#936B34] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors font-medium"
                title="Atelier Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN PORTAL</span>
              </button>
            )}

            {currentCustomer ? (
              <button
                onClick={() => logout()}
                className="px-3.5 py-2 bg-white border border-gray-200 text-xs font-mono text-gray-600 hover:text-red-700 hover:border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveView('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-[#936B34] text-white text-xs font-mono hover:bg-[#111827] flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab navigation: My Info, Password Change, My Orders, Return & Order, Alterations, Wishlist */}
        <div className="flex items-center gap-2 border-b border-gray-200 my-6 overflow-x-auto">
          {[
            { id: 'info', label: 'MY INFO', icon: User },
            { id: 'password', label: 'PASSWORD CHANGE', icon: Lock },
            { id: 'orders', label: `MY ORDERS (${customerOrders.length})`, icon: Package },
            { id: 'returns', label: `RETURN & ORDERS (${returnRequests.length})`, icon: RotateCcw },
            { id: 'alterations', label: `ALTERATIONS (${customerAlterations.length})`, icon: Scissors },
            { id: 'wishlist', label: `WISHLIST (${wishlistedProducts.length})`, icon: Trash2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CustomerDashboardTab)}
                className={`py-3.5 px-4 text-xs uppercase tracking-wider font-mono border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'border-[#936B34] text-[#936B34] font-semibold bg-[#936B34]/5'
                    : 'border-transparent text-gray-500 hover:text-[#111827]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#936B34]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB 1: MY INFO (Personal details, delivery address, tailoring measurements)
           ========================================================================= */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            <form onSubmit={handleSaveInfo} className="space-y-8">
              {/* Section 1: Patron Identity */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <User className="w-4 h-4 text-[#936B34]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    PATRON IDENTITY &amp; CONTACT
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={infoForm.name}
                      onChange={e => setInfoForm({ ...infoForm, name: e.target.value })}
                      placeholder="e.g. Montgomery Vance"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Email Address (Primary Account)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={infoForm.email}
                      className="w-full bg-gray-100 border border-gray-300 px-3.5 py-2.5 text-xs text-gray-500 font-mono cursor-not-allowed"
                      title="Primary email tied to login credentials"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Phone Number (Courier Dispatch Updates) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={infoForm.phone}
                      onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Consignment & Delivery Address */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <Truck className="w-4 h-4 text-[#936B34]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    PRIMARY US CONSIGNMENT &amp; DELIVERY ADDRESS
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={infoForm.street}
                      onChange={e => setInfoForm({ ...infoForm, street: e.target.value })}
                      placeholder="e.g. 740 Park Avenue"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Suite / Penthouse / Apartment
                    </label>
                    <input
                      type="text"
                      value={infoForm.apartment}
                      onChange={e => setInfoForm({ ...infoForm, apartment: e.target.value })}
                      placeholder="e.g. Suite 14B"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={infoForm.city}
                      onChange={e => setInfoForm({ ...infoForm, city: e.target.value })}
                      placeholder="e.g. New York"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Destination State *
                    </label>
                    <select
                      required
                      value={infoForm.state}
                      onChange={e => setInfoForm({ ...infoForm, state: e.target.value })}
                      className="w-full bg-white border border-gray-300 px-3 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                    >
                      {Object.values(getUsStateTaxRates()).map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} ({st.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={infoForm.zipCode}
                      onChange={e => setInfoForm({ ...infoForm, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                      placeholder="10021"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Sartorial Silhouette & Measurements Card */}
              <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <Ruler className="w-4 h-4 text-[#936B34]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                    ATELIER MEASUREMENTS SILHOUETTE CARD
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  These bespoke measurements are referenced by our master tailors when preparing orders and alteration adjustments for your wardrobe.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Jacket Chest
                    </label>
                    <input
                      type="text"
                      value={infoForm.chest}
                      onChange={e => setInfoForm({ ...infoForm, chest: e.target.value })}
                      placeholder="40 Regular"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Trouser Waist
                    </label>
                    <input
                      type="text"
                      value={infoForm.waist}
                      onChange={e => setInfoForm({ ...infoForm, waist: e.target.value })}
                      placeholder="32 Inches"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Inseam Break
                    </label>
                    <input
                      type="text"
                      value={infoForm.inseam}
                      onChange={e => setInfoForm({ ...infoForm, inseam: e.target.value })}
                      placeholder="32.5 Inches (Slight Break)"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Collar Size
                    </label>
                    <input
                      type="text"
                      value={infoForm.neck}
                      onChange={e => setInfoForm({ ...infoForm, neck: e.target.value })}
                      placeholder="15.5 Inches"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                      Sleeve Length
                    </label>
                    <input
                      type="text"
                      value={infoForm.sleeve}
                      onChange={e => setInfoForm({ ...infoForm, sleeve: e.target.value })}
                      placeholder="34 Inches"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Info */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="px-8 py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingInfo ? 'SAVING CHANGES...' : 'SAVE PATRON DETAILS & MEASUREMENTS'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PASSWORD CHANGE
           ========================================================================= */}
        {activeTab === 'password' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <Lock className="w-4 h-4 text-[#936B34]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#936B34] font-semibold">
                  SECURITY &amp; PASSWORD CHANGE
                </span>
              </div>

              <p className="text-xs text-gray-600 font-sans leading-relaxed">
                Update your account password to ensure your private measurements, atelier commissions, and saved delivery addresses remain confidential.
              </p>

              {passwordSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMessage}</span>
                </div>
              )}

              {passwordErrorMessage && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordForm.oldPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-[#111827] cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min. 5 chars)"
                      className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-[#111827] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isChangingPassword ? 'AUTHENTICATING & UPDATING...' : 'UPDATE PASSWORD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MY ORDERS (Complete order history, full order view, tracking & items)
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {customerOrders.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xl">
                <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO ORDERS RECORDED
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  Online orders and atelier commissions will be tracked in your client archive here.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
                >
                  EXPLORE CATALOGUE
                </button>
              </div>
            ) : (
              customerOrders.map((order, orderIdx) => {
                const orderKey = order.id || (order as any).orderId || (order as any)._id || `ord-${orderIdx}`;
                const hasTracking = Boolean(order.trackingNumber || order.shipment?.trackingId);
                const trackingId = order.trackingNumber || order.shipment?.trackingId;

                return (
                  <div key={orderKey} className="bg-[#F9F9F8] border border-gray-200 p-6 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3 text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-[#111827]">{order.id || (order as any).orderId}</span>
                          <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 text-gray-600 uppercase">
                            ORDER ID
                          </span>
                        </div>
                        <span className="text-gray-500 text-[11px] block mt-1">
                          Consignment Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order as any).date}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[#936B34] uppercase bg-[#936B34]/15 px-3 py-1 border border-[#936B34]/30 font-semibold text-xs">
                          {order.status || (order as any).orderStatus}
                        </span>
                        <span className="font-semibold text-base text-[#111827] tabular-nums">
                          ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Dispatch & Tracking ID Status Banner */}
                    <div className={`p-3.5 border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      hasTracking ? 'bg-white border-[#936B34]/30' : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${hasTracking ? 'text-[#936B34]' : 'text-amber-700'}`} />
                        {hasTracking ? (
                          <div className="space-x-2">
                            <span className="text-gray-500 uppercase">COURIER:</span>
                            <strong className="text-[#111827]">{order.carrier || order.shipment?.carrier || 'FedEx / UPS'}</strong>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500 uppercase">TRACKING ID:</span>
                            <strong className="text-[#936B34]">{trackingId}</strong>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-amber-950 uppercase tracking-wide">
                              Pending dispatch
                            </span>
                            <span className="text-amber-800 ml-1">
                              (Tracking ID will be provided by admin once tailored &amp; packaged)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {hasTracking && (order.trackingUrl || order.shipment?.trackingUrl) && (
                          <a
                            href={order.trackingUrl || order.shipment?.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#936B34] hover:bg-[#7A5726] text-white text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-xs"
                          >
                            <span>Live Carrier Tracking</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleTrackOrder(order)}
                          className="px-3 py-1 bg-[#111827] hover:bg-[#936B34] text-white text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          TRACK CONSIGNMENT
                        </button>
                      </div>
                    </div>

                    {/* Garment Items in this Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items?.map((item, idx) => {
                        const itemKey = (item as any).id || (item as any)._id || `${orderKey}-item-${item.productId || idx}-${item.size || ''}-${idx}`;
                        return (
                          <div key={itemKey} className="flex gap-3 bg-white p-3 border border-gray-100 shadow-xs">
                            <div className="w-12 h-16 shrink-0 overflow-hidden">
                              <MediaPlaceholder label="PA" category="SUIT" aspectRatio="portrait" minimal className="w-full h-full p-1" />
                            </div>
                            <div className="text-xs min-w-0 font-mono">
                              <h4 className="font-serif text-[#111827] truncate uppercase font-medium">{item.productName}</h4>
                              <p className="text-gray-500 mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
                              <p className="text-[#936B34] tabular-nums mt-1 font-semibold">${item.price}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-black text-[#111827] text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          VIEW FULL ORDER DETAILS
                        </button>
                        <button
                          onClick={() => openReturnModalForOrder(order.id || (order as any).orderId)}
                          className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-[#936B34] hover:text-[#936B34] text-gray-700 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3 h-3 text-[#936B34]" />
                          <span>RETURN OR EXCHANGE</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="text-[#936B34] hover:text-[#111827] flex items-center gap-1 font-semibold text-xs uppercase tracking-wider cursor-pointer transition-colors ml-auto"
                      >
                        <span>TRACK CONSIGNMENT</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: RETURN & ORDERS (Request return/exchange, view return status)
           ========================================================================= */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#936B34] font-semibold block">
                  CONSIGNMENT SERVICES
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase font-light">
                  RETURN &amp; EXCHANGE ARCHIVE
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Complimentary fitting revisions, size exchanges, and full refund authorizations.
                </p>
              </div>

              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs uppercase tracking-wider font-semibold font-mono flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>REQUEST NEW RETURN / EXCHANGE</span>
              </button>
            </div>

            {returnRequests.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-16 px-6 text-center flex flex-col items-center justify-center">
                <RotateCcw className="w-10 h-10 text-gray-300 mb-4" />
                <h4 className="font-serif text-lg text-[#111827] uppercase tracking-wide">
                  NO ACTIVE RETURN REQUESTS
                </h4>
                <p className="text-xs text-gray-500 font-mono mt-1 max-w-md">
                  All your past garments have met sartorial perfection. If you need any adjustments or size exchanges, start a return request above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {returnRequests.map(ret => (
                  <div key={ret.id} className="border border-gray-200 bg-[#F9F9F8] p-5 sm:p-6 space-y-3 font-mono text-xs shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#936B34] text-sm">{ret.id}</span>
                        <span className="text-gray-500">Order: <strong>{ret.orderId}</strong></span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{ret.createdAt}</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-[#111827] text-white text-[10px] uppercase font-semibold">
                        {ret.status}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">Action Type:</span>
                        <strong className="text-[#111827]">{ret.actionType}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">Prepaid Return Courier ID:</span>
                        <strong className="text-[#936B34]">{ret.trackingReturnNumber || 'Generated upon review'}</strong>
                      </div>
                    </div>

                    <div className="bg-white p-3 border border-gray-200/60 text-xs text-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">Patron Notes / Reason:</span>
                      <p>{ret.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: BESPOKE ALTERATIONS
           ========================================================================= */}
        {activeTab === 'alterations' && (
          <div>
            {customerAlterations.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xl">
                <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO BESPOKE ALTERATIONS OPEN
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  No tailoring tickets are currently open for your account. You can request alterations when ordering or through customer concierge.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
                >
                  BROWSE ATELIER SUITS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerAlterations.map((alt, altIdx) => {
                  const altKey = alt.id || (alt as any).alterationId || (alt as any)._id || `alt-${altIdx}`;
                  return (
                    <div key={altKey} className="border border-gray-200 bg-[#F9F9F8] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs shadow-xl">
                      <div>
                        <span className="text-[#936B34] block mb-1 font-semibold text-sm">#{alt.id || (alt as any).alterationId}</span>
                        <h4 className="font-serif text-lg text-[#111827] uppercase font-light">{alt.productName || alt.items?.[0]?.name || 'Park Avenue Garment'}</h4>
                        <p className="text-gray-500 mt-1">{alt.alterationDetails || alt.items?.[0]?.type || 'Bespoke Tailoring'} · Assigned Tailor: <strong>{alt.tailorAssigned || 'Master Sartorialist'}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#936B34] uppercase block font-semibold mb-2">
                          {(alt.status || 'In Progress').replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={() => handleTrackAlteration(alt)}
                          className="px-4 py-2 border border-gray-300 hover:border-[#936B34] text-[#111827] hover:text-[#936B34] text-[11px] uppercase cursor-pointer bg-white transition-colors shadow-2xs font-semibold"
                        >
                          VIEW WORKBENCH STATUS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: WISHLIST
           ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xl">
                <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  YOUR WISHLIST IS EMPTY
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  Save pieces from our suits, shirts, and accessories collections to review anytime.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
                >
                  DISCOVER COLLECTION
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedProducts.map((product, pIdx) => {
                  const productKey = product.id || (product as any).productId || (product as any)._id || `wish-${pIdx}`;
                  return (
                    <div key={productKey} className="border border-gray-200 bg-[#F9F9F8] p-4 flex flex-col justify-between shadow-xl">
                      <div className="aspect-[3/4] mb-3 overflow-hidden bg-white">
                        <MediaPlaceholder
                          label="PARK AVENUE"
                          category={product.category}
                          aspectRatio="portrait"
                          className="w-full h-full"
                          subtext={product.name}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] font-mono text-[#936B34] uppercase font-medium">{product.category}</span>
                          <span className="text-xs font-mono text-[#111827]">${product.price.toLocaleString()}</span>
                        </div>
                        <h4 className="font-serif text-base text-[#111827] uppercase line-clamp-1 mb-4 font-light">{product.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              addToCart(product, product.variants?.[0]?.size || 'Standard', product.variants?.[0]?.color || 'Standard', 1);
                            }}
                            className="flex-1 py-2 bg-[#111827] text-white text-xs font-mono uppercase font-semibold hover:bg-[#7A5726] cursor-pointer transition-colors shadow-md"
                          >
                            ADD TO BAG
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="p-2 border border-gray-200 text-gray-500 hover:text-red-400 bg-white cursor-pointer transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL: FULL ORDER DETAILS (Showing full breakdown without clipping)
         ========================================================================= */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
          <div className="w-full max-w-3xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 sm:my-12 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#936B34] font-semibold block">
                  ORDER SPECIFICATION &amp; LEDGER
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase font-light">
                  ORDER #{viewingOrder.id || (viewingOrder as any).orderId}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-gray-400 hover:text-black font-mono text-sm px-2 py-1 cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-white border border-gray-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">CONSIGNMENT DESTINATION</span>
                <div className="font-semibold text-[#111827]">{viewingOrder.customerName}</div>
                <div className="text-gray-600">{viewingOrder.shippingAddress?.street}</div>
                <div className="text-gray-600">
                  {viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.state} {viewingOrder.shippingAddress?.zipCode || viewingOrder.shippingAddress?.postalCode}
                </div>
                <div className="text-gray-500 pt-1 text-[11px]">{viewingOrder.customerEmail} · {viewingOrder.customerPhone}</div>
              </div>

              <div className="p-4 bg-white border border-gray-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">DISPATCH &amp; TRACKING STATUS</span>
                <div className="font-semibold text-[#936B34]">
                  {viewingOrder.trackingNumber || viewingOrder.shipment?.trackingId ? 'DISPATCHED' : 'PENDING DISPATCH'}
                </div>
                <div className="text-gray-600">
                  Carrier: {viewingOrder.carrier || viewingOrder.shipment?.carrier || 'FedEx / UPS Insured'}
                </div>
                <div className="text-gray-600">
                  Tracking ID: {viewingOrder.trackingNumber || viewingOrder.shipment?.trackingId || 'Assigned by admin once tailored'}
                </div>
              </div>
            </div>

            {/* Line items list */}
            <div className="border border-gray-200 bg-white">
              <div className="p-3 bg-[#F9F9F8] border-b border-gray-200 font-mono text-xs font-semibold text-gray-700 flex justify-between">
                <span>LINE ITEMS</span>
                <span>PRICE</span>
              </div>
              <div className="divide-y divide-gray-100">
                {viewingOrder.items?.map((it, i) => (
                  <div key={i} className="p-3 sm:p-4 flex items-center justify-between text-xs font-mono">
                    <div>
                      <h5 className="font-serif text-sm text-[#111827] uppercase">{it.productName}</h5>
                      <span className="text-gray-500 text-[11px]">Size: {it.size} · Quantity: {it.quantity}</span>
                    </div>
                    <span className="font-semibold text-[#111827]">${it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 bg-white border border-gray-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${viewingOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Insured Courier Dispatch:</span>
                <span>${(viewingOrder.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>State Statutory Sales Tax:</span>
                <span>${(viewingOrder.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#111827] font-semibold pt-2 border-t border-gray-200 text-sm">
                <span>Total Amount:</span>
                <span className="text-[#936B34] text-base">${viewingOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-6 py-2.5 bg-[#111827] text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Close Order View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REQUEST NEW RETURN / EXCHANGE
         ========================================================================= */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">
          <div className="w-full max-w-xl bg-[#F9F9F8] border border-gray-200 p-6 sm:p-8 space-y-6 relative my-8 sm:my-12 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#936B34] font-semibold block">
                  ATELIER SERVICES
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase font-light">
                  RETURN OR SIZE EXCHANGE
                </h3>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  SELECT ORDER *
                </label>
                <select
                  required
                  value={selectedReturnOrder}
                  onChange={e => setSelectedReturnOrder(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                >
                  <option value="">Select order from archive</option>
                  {customerOrders.map(ord => (
                    <option key={ord.id} value={ord.id}>
                      {ord.id} · {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : (ord as any).date} (${ord.total.toFixed(2)})
                    </option>
                  ))}
                  {customerOrders.length === 0 && (
                    <option value="PA-10245">PA-10245 (Recent Consignment)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  REQUEST ACTION TYPE *
                </label>
                <select
                  value={returnActionType}
                  onChange={e => setReturnActionType(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34] cursor-pointer"
                >
                  <option value="Size / Fit Exchange">Size / Fit Exchange (Complimentary)</option>
                  <option value="Bespoke Fitting Adjustment">Bespoke Fitting Adjustment (Hemming / Sleeves)</option>
                  <option value="Store Credit">Atelier Store Credit</option>
                  <option value="Refund to Original Payment">Full Refund to Original Stripe Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  GARMENT(S) TO EXCHANGE OR RETURN *
                </label>
                <input
                  type="text"
                  required
                  value={returnItemsNotes}
                  onChange={e => setReturnItemsNotes(e.target.value)}
                  placeholder="e.g. Midnight Navy Suit Jacket 40R"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  REASON &amp; FIT SPECIFICATIONS *
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="Please describe why this item is being returned or new size specifications..."
                  className="w-full bg-white border border-gray-300 p-3 text-xs text-[#111827] font-sans focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div className="p-3 bg-white border border-gray-200 text-[11px] font-mono text-gray-600">
                ✓ Insured prepaid courier dispatch label will be provided automatically upon submission.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 text-xs font-mono uppercase hover:border-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase font-semibold transition-colors cursor-pointer"
                >
                  SUBMIT RETURN REQUEST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
