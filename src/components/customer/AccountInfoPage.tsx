import React, { useState, useEffect } from 'react';
import { User, MapPin, Ruler, CheckCircle2, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CustomerService } from '../../services/api';
import { CustomerNavHeader } from './CustomerNavHeader';

export const AccountInfoPage: React.FC = () => {
  const { currentCustomer, showToast, setActiveView } = useShop();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    chest: '40 Regular',
    waist: '32 Inches',
    inseam: '32.5"',
    neck: '15.5 Inches',
    sleeve: '34 Inches'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, [currentCustomer]);

  const loadProfile = async () => {
    if (!currentCustomer) {
      setForm({
        name: '',
        email: '',
        phone: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        chest: '',
        waist: '',
        inseam: '',
        neck: '',
        sleeve: ''
      });
      return;
    }

    const addr = currentCustomer.addresses?.[0] || {
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    };

    setForm({
      name: currentCustomer.name || '',
      email: currentCustomer.email || '',
      phone: currentCustomer.phone || '',
      street: addr.street || '',
      apartment: addr.apartment || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || (addr as any).postalCode || '',
      country: addr.country || 'United States',
      chest: currentCustomer.measurements?.chest || '',
      waist: currentCustomer.measurements?.waist || '',
      inseam: currentCustomer.measurements?.inseam || '',
      neck: currentCustomer.measurements?.neck || '',
      sleeve: currentCustomer.measurements?.sleeve || ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) {
      showToast('Please sign in to save and update your account details.', 'info');
      setActiveView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');
    try {
      await CustomerService.updateProfile(currentCustomer.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        addresses: [
          {
            id: currentCustomer.addresses?.[0]?.id || 'addr-default',
            label: 'Primary Delivery Address',
            street: form.street.trim(),
            apartment: form.apartment.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
            zipCode: form.zipCode.trim(),
            postalCode: form.zipCode.trim(),
            country: form.country.trim() || 'United States',
            isDefault: true
          }
        ],
        measurements: {
          chest: form.chest.trim(),
          waist: form.waist.trim(),
          inseam: form.inseam.trim(),
          neck: form.neck.trim(),
          sleeve: form.sleeve.trim()
        }
      });
      setSuccessMessage('Your profile and sizing preferences have been successfully updated.');
      showToast('Account information saved.', 'success');
      loadProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update account details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      <CustomerNavHeader 
        currentPageTitle="Account Information & Sizing"
        currentPageSubtitle="Manage your contact details, primary delivery address, and tailored garment measurements."
        activeViewKey="account-info"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!currentCustomer && (
          <div className="bg-[#FAF8F5] border border-gray-200 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-[#111827]">Sign in to update your account</h3>
              <p className="text-xs text-gray-600 font-sans mt-0.5">
                Sign in to your Park Avenue Menswear account to view and update your saved address and custom sizing.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveView('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 mb-6 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Contact Identity */}
          <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 mb-6">
              <User className="w-4 h-4 text-[#936B34]" />
              <h2 className="font-serif text-xl text-[#111827]">
                Personal Information
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Johnathan Sterling"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!currentCustomer}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34] disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (212) 555-0123"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 mb-6">
              <MapPin className="w-4 h-4 text-[#936B34]" />
              <h2 className="font-serif text-xl text-[#111827]">
                Primary Shipping Address
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Street Address
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={e => setForm({ ...form, street: e.target.value })}
                  placeholder="e.g. 725 Park Avenue"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Apartment / Suite (Optional)
                </label>
                <input
                  type="text"
                  value={form.apartment}
                  onChange={e => setForm({ ...form, apartment: e.target.value })}
                  placeholder="e.g. Suite 4B"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. New York"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  State / Region
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. NY"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={e => setForm({ ...form, zipCode: e.target.value })}
                  placeholder="e.g. 10021"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Custom Tailoring & Sizing */}
          <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 mb-6">
              <Ruler className="w-4 h-4 text-[#936B34]" />
              <h2 className="font-serif text-xl text-[#111827]">
                Tailoring &amp; Sizing Profile
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Jacket Size
                </label>
                <input
                  type="text"
                  value={form.chest}
                  onChange={e => setForm({ ...form, chest: e.target.value })}
                  placeholder="e.g. 40 Regular"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Trouser Waist
                </label>
                <input
                  type="text"
                  value={form.waist}
                  onChange={e => setForm({ ...form, waist: e.target.value })}
                  placeholder="e.g. 32 Inches"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Trouser Inseam
                </label>
                <input
                  type="text"
                  value={form.inseam}
                  onChange={e => setForm({ ...form, inseam: e.target.value })}
                  placeholder="e.g. 32 Inches"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Shirt Collar Size
                </label>
                <input
                  type="text"
                  value={form.neck}
                  onChange={e => setForm({ ...form, neck: e.target.value })}
                  placeholder="e.g. 15.5 Inches"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-1.5 font-semibold">
                  Shirt Sleeve Length
                </label>
                <input
                  type="text"
                  value={form.sleeve}
                  onChange={e => setForm({ ...form, sleeve: e.target.value })}
                  placeholder="e.g. 34 Inches"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium disabled:opacity-50"
            >
              {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
