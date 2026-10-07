import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Percent,
  DollarSign,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CouponService } from '../../services/api';
import { Coupon } from '../../types';

export const CouponManagementView: React.FC = () => {
  const { showToast } = useShop();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('0');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await CouponService.getAll();
      setCoupons(data || []);
    } catch (err: any) {
      showToast('Failed to load coupons: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      showToast('Please provide a valid discount value greater than 0.', 'error');
      return;
    }

    if (discountType === 'percentage' && val > 100) {
      showToast('Percentage discount cannot exceed 100%.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await CouponService.create({
        code: cleanCode,
        description: description.trim() || undefined,
        discountType,
        discountValue: val,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive
      });

      showToast(`Coupon "${cleanCode}" created successfully!`, 'success');
      // Reset form
      setCode('');
      setDescription('');
      setDiscountValue('10');
      setMinOrderAmount('0');
      setExpiresAt('');
      setUsageLimit('');
      setIsActive(true);

      // Refresh list
      await loadCoupons();
    } catch (err: any) {
      showToast('Failed to create coupon: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    const idOrCode = coupon.id || coupon.couponId || coupon._id || coupon.code;
    const confirmDelete = window.confirm(`Are you sure you want to delete coupon "${coupon.code}"? Patrons will no longer be able to use this code.`);
    if (!confirmDelete) return;

    try {
      await CouponService.delete(idOrCode);
      setCoupons(prev => prev.filter(c => (c.id || c.couponId || c._id || c.code) !== idOrCode));
      showToast(`Coupon "${coupon.code}" deleted successfully.`, 'info');
    } catch (err: any) {
      showToast('Failed to delete coupon: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    showToast(`Copied coupon "${couponCode}" to clipboard!`, 'info');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const applyPreset = (preset: {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: string;
    minOrderAmount: string;
  }) => {
    setCode(preset.code);
    setDescription(preset.description);
    setDiscountType(preset.discountType);
    setDiscountValue(preset.discountValue);
    setMinOrderAmount(preset.minOrderAmount);
    showToast(`Loaded ${preset.code} preset`, 'info');
  };

  const activeCount = coupons.filter(c => c.isActive !== false).length;
  const percentageCount = coupons.filter(c => c.discountType === 'percentage').length;
  const fixedCount = coupons.filter(c => c.discountType === 'fixed').length;

  return (
    <div className="space-y-8 mt-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
              ATELIER PRIVILEGES &amp; COMMERCE ENGINE
            </span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              REAL-TIME VALIDATION
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] mt-1 font-light tracking-wide">
            Coupons &amp; Promotional Vouchers Management
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-1 max-w-2xl">
            Configure, issue, and manage luxury promotion codes, VIP client discount privileges, and minimum-spend vouchers validated seamlessly across the checkout gateway.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCoupons}
          className="px-3.5 py-2 bg-[#FAF8F5] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] flex items-center gap-2 cursor-pointer transition-colors shadow-2xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#936B34]' : 'text-gray-500'}`} />
          <span>REFRESH COUPONS</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-gray-500">TOTAL COUPONS</div>
          <div className="font-serif text-2xl text-[#111827] mt-1 font-normal">{coupons.length}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Configured in Atelier Ledger</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-700">ACTIVE PRIVILEGES</div>
          <div className="font-serif text-2xl text-emerald-800 mt-1 font-normal">{activeCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">Ready for Patron Checkout</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#936B34]">PERCENTAGE VOUCHERS</div>
          <div className="font-serif text-2xl text-[#936B34] mt-1 font-normal">{percentageCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">e.g. 10%, 15%, 20% Off</div>
        </div>
        <div className="border border-gray-200 bg-[#F9F9F8] p-4 shadow-2xs">
          <div className="text-[9px] font-mono uppercase tracking-widest text-indigo-700">FIXED SAVINGS</div>
          <div className="font-serif text-2xl text-indigo-900 mt-1 font-normal">{fixedCount}</div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">e.g. $50, $100 Allowances</div>
        </div>
      </div>

      {/* Main 2-Column: Creator Form on Left, Active Coupons on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Create Coupon Form (5 cols) */}
        <div className="lg:col-span-5 border border-gray-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
              COUPON GENERATOR
            </span>
            <h3 className="font-serif text-xl text-[#111827] mt-0.5 font-normal">
              Create Promotional Code
            </h3>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-gray-400 font-medium block">
              Quick Luxury Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset({
                  code: 'BESPOKE10',
                  description: '10% Welcome Atelier Privilege',
                  discountType: 'percentage',
                  discountValue: '10',
                  minOrderAmount: '0'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + 10% Welcome (BESPOKE10)
              </button>
              <button
                type="button"
                onClick={() => applyPreset({
                  code: 'VIP15',
                  description: '15% Patron Suiting Allowance ($250 min)',
                  discountType: 'percentage',
                  discountValue: '15',
                  minOrderAmount: '250'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + 15% VIP Patron ($250 min)
              </button>
              <button
                type="button"
                onClick={() => applyPreset({
                  code: 'TAILOR50',
                  description: '$50 Complimentary Alterations Gift',
                  discountType: 'fixed',
                  discountValue: '50',
                  minOrderAmount: '300'
                })}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-gray-200 hover:border-[#936B34] text-[10px] font-mono text-gray-700 hover:text-[#936B34] transition-colors cursor-pointer"
              >
                + $50 Off ($300 min)
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            {/* Coupon Code */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                Coupon Code * (e.g. BESPOKE20)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. SUMMER15 or GALA2026"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-sm font-mono uppercase tracking-wider text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-gray-400">
                  UPPERCASE
                </span>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                  Discount Type *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                >
                  <option value="percentage">Percentage (%) Off</option>
                  <option value="fixed">Fixed Dollar ($) Off</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                  {discountType === 'percentage' ? 'Percentage (e.g. 15 for 15%) *' : 'Amount in USD (e.g. 50) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    max={discountType === 'percentage' ? '100' : '10000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-gray-400">
                    {discountType === 'percentage' ? '%' : 'USD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Minimum Order Amount & Usage Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                  Min. Order Spend ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0 (No minimum)"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#936B34]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-mono uppercase text-gray-600 font-medium block mb-1">
                Description / Patron Privileges Note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Complimentary 15% VIP Spring Gala Invitation"
                className="w-full bg-[#F9F9F8] border border-gray-200 px-3 py-2 text-xs font-sans text-[#111827] focus:outline-none focus:border-[#936B34]"
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="couponIsActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-[#936B34] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="couponIsActive" className="text-xs font-mono text-gray-700 cursor-pointer select-none">
                Active &amp; Redeemable immediately at checkout
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#111827] text-[#D4AF37] hover:bg-[#936B34] hover:text-white transition-all text-xs font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'CREATING COUPON...' : 'PUBLISH COUPON VOUCHER'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Active Coupons Table & Directory (7 cols) */}
        <div className="lg:col-span-7 border border-gray-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
                ATELIER ROSTER
              </span>
              <h3 className="font-serif text-xl text-[#111827] mt-0.5 font-normal">
                Configured Coupons ({coupons.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              Validated on Cart Page
            </span>
          </div>

          {coupons.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-serif text-base text-[#111827]">No active coupons configured</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Create promotional codes using the generator on the left. Patrons can enter them in the cart to receive instant order deductions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => {
                const isCopied = copiedCode === c.code;
                const isPercentage = c.discountType === 'percentage';
                const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;

                return (
                  <div
                    key={c.id || c.couponId || c._id || c.code}
                    className="p-4 border border-gray-200 hover:border-[#936B34]/60 bg-[#FAF8F5]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Coupon Code Badge with Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          className="px-2.5 py-1 bg-white border border-gray-300 hover:border-[#936B34] text-xs font-mono font-bold tracking-wider text-[#111827] flex items-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-[#FAF8F5]"
                          title="Click to copy code"
                        >
                          <span>{c.code}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400 group-hover:text-[#936B34]" />
                          )}
                        </button>

                        {/* Discount Badge */}
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                          {isPercentage ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                        </span>

                        {/* Min Spend */}
                        {c.minOrderAmount && c.minOrderAmount > 0 ? (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-mono">
                            Min: ${c.minOrderAmount}
                          </span>
                        ) : null}

                        {/* Status */}
                        {isExpired ? (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-mono font-bold">
                            EXPIRED
                          </span>
                        ) : c.isActive === false ? (
                          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-mono">
                            PAUSED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 font-sans">
                        {c.description || `${c.discountValue}${isPercentage ? '%' : ' USD'} discount applied to order subtotal`}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 flex-wrap">
                        {c.usageLimit ? (
                          <span>Usage: {c.usedCount || 0} / {c.usageLimit}</span>
                        ) : (
                          <span>Used: {c.usedCount || 0} times</span>
                        )}
                        {c.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Delete Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c)}
                        className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                        title={`Delete coupon "${c.code}"`}
                        aria-label="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Park Avenue Atelier Commerce Suite</span>
            <span>All codes auto-convert to uppercase at checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};
