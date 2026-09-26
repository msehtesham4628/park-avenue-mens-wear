import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  Check, 
  Copy, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CustomerNavHeader } from './CustomerNavHeader';
import { ReturnService } from '../../services/api';
import { ReturnRequest } from '../../types';

export const ReturnTrackingPage: React.FC = () => {
  const { currentCustomer, showToast } = useShop();

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ReturnRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    orderId: '',
    itemNames: '',
    actionType: 'Size / Fit Exchange' as ReturnRequest['actionType'],
    reason: ''
  });

  const returnSteps = [
    { num: 1, label: 'Request Submitted', desc: 'Return request received and pending team review' },
    { num: 2, label: 'Prepaid Label Sent', desc: 'Prepaid return shipping label generated and emailed' },
    { num: 3, label: 'Received at Facility', desc: 'Package arrived at our returns inspection center' },
    { num: 4, label: 'Inspection Complete', desc: 'Garment condition verified by tailoring staff' },
    { num: 5, label: 'Completed / Dispatched', desc: 'Replacement dispatched or refund processed' }
  ];

  useEffect(() => {
    loadReturns();
  }, [currentCustomer]);

  useEffect(() => {
    // Check URL parameters for prefill (e.g. ?orderId=PA-ORD-88210 or ?returnId=RET-8842)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prefillOrderId = params.get('orderId');
      if (prefillOrderId) {
        setNewForm(prev => ({ ...prev, orderId: prefillOrderId.toUpperCase() }));
        setIsNewReturnModalOpen(true);
      }
      const prefillReturnId = params.get('returnId');
      if (prefillReturnId) {
        setSearchQuery(prefillReturnId.toUpperCase());
        handleSearch(null as any, prefillReturnId.toUpperCase());
      }
    }
  }, []);

  const loadReturns = async () => {
    setIsLoading(true);
    try {
      if (currentCustomer) {
        const dbReturns = await ReturnService.getMyReturns();
        if (dbReturns && dbReturns.length > 0) {
          setReturnRequests(dbReturns);
          return;
        }
      }
      // Check local storage fallback
      const key = `pa_returns_${currentCustomer?.id || currentCustomer?.email || 'guest'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setReturnRequests(JSON.parse(saved));
      } else {
        setReturnRequests([]);
      }
    } catch {
      setReturnRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSearch = async (e: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const query = (override || searchQuery).trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    let found = returnRequests.find(r => 
      r.id.toUpperCase() === query || 
      r.orderId.toUpperCase() === query ||
      (r.trackingReturnNumber && r.trackingReturnNumber.toUpperCase() === query)
    );

    if (!found) {
      try {
        const remote = await ReturnService.getById(query);
        if (remote) {
          found = remote;
          setReturnRequests(prev => [remote, ...prev.filter(r => r.id !== remote.id)]);
        }
      } catch (_) {}
    }

    setSearchResult(found || null);
    if (!found) {
      showToast(`No return claim found for "${query}"`, 'error');
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.orderId.trim()) {
      showToast('Please enter an Order ID', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ReturnService.create({
        orderId: newForm.orderId.trim().toUpperCase(),
        customerId: currentCustomer?.id,
        customerName: currentCustomer?.name,
        customerEmail: currentCustomer?.email,
        customerPhone: currentCustomer?.phone,
        itemNames: newForm.itemNames.trim() ? [newForm.itemNames.trim()] : ['Custom Garment'],
        actionType: newForm.actionType,
        reason: newForm.reason.trim() || 'Size/fit exchange requested',
        preferredReplacement: newForm.actionType === 'Size / Fit Exchange' ? 'Direct Replacement Size' : undefined
      });

      setReturnRequests(prev => [created, ...prev.filter(r => r.id !== created.id)]);

      try {
        const key = `pa_returns_${currentCustomer?.id || currentCustomer?.email || 'guest'}`;
        localStorage.setItem(key, JSON.stringify([created, ...returnRequests]));
      } catch {
        // ignore
      }

      setIsNewReturnModalOpen(false);
      setNewForm({
        orderId: '',
        itemNames: '',
        actionType: 'Size / Fit Exchange',
        reason: ''
      });

      setSearchResult(created);
      setHasSearched(true);
      setSearchQuery(created.id);
      showToast(`Return Request #${created.id} initiated and saved to Atelier database.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit return request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      <CustomerNavHeader 
        currentPageTitle="Exchange & Return Tracking"
        currentPageSubtitle="Track active returns, request a size exchange, and access prepaid shipping labels without signing in."
        activeViewKey="track-return"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">

        {/* Tracking Lookup Box */}
        <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
                DIRECT RETURN LOOKUP
              </span>
              <h2 className="font-serif text-2xl text-[#111827] mt-0.5">
                Track a Return or Exchange
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-1">
                Enter your Return ID (e.g. RET-1234), Order ID, or Courier Tracking Number to view live status.
              </p>
            </div>

            <button
              onClick={() => setIsNewReturnModalOpen(true)}
              className="px-4 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Return / Exchange</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Enter Return ID (e.g. RET-8941), Order ID, or Return Tracking Number..."
                className="w-full bg-white border border-gray-300 pl-10 pr-4 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              LOOKUP STATUS
            </button>
          </form>
        </div>

        {/* Search Result Display */}
        {hasSearched && searchResult && (
          <div className="border-2 border-[#936B34] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 uppercase">CLAIM</span>
                  <span className="font-serif text-2xl text-[#111827] font-bold">#{searchResult.id}</span>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[#936B34]/10 text-[#936B34] font-semibold ml-2">
                    {searchResult.actionType}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  Associated Order: <strong className="text-gray-900">{searchResult.orderId}</strong> · Submitted: {searchResult.createdAt}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">CURRENT STATUS</span>
                <span className="text-sm font-serif text-emerald-700 font-semibold">{searchResult.status}</span>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="py-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block mb-4">
                RETURN PROGRESSION (STEP {searchResult.currentStep} OF 5)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {returnSteps.map((step) => {
                  const isDone = step.num < searchResult.currentStep;
                  const isCurrent = step.num === searchResult.currentStep;
                  return (
                    <div 
                      key={step.num}
                      className={`p-3 border transition-colors ${
                        isCurrent 
                          ? 'border-[#936B34] bg-[#FAF8F5]' 
                          : isDone 
                            ? 'border-emerald-200 bg-emerald-50/50' 
                            : 'border-gray-200 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          isDone 
                            ? 'bg-emerald-600 text-white' 
                            : isCurrent 
                              ? 'bg-[#936B34] text-white' 
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isDone ? '✓' : step.num}
                        </span>
                        <span className="text-xs font-serif font-medium text-gray-900 leading-tight">
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Label & Items Details */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid sm:grid-cols-2 gap-6 bg-[#FAF8F5] p-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-1">
                  ITEMS IN RETURN
                </span>
                <ul className="space-y-1">
                  {searchResult.itemNames.map((it, i) => (
                    <li key={i} className="text-xs font-serif text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#936B34] rounded-full"></span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-gray-500 font-sans mt-2">
                  Reason: <em>"{searchResult.reason}"</em>
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-1">
                  PREPAID RETURN SHIPPING LABEL
                </span>
                {searchResult.trackingReturnNumber ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-white border border-gray-300 px-2.5 py-1 text-gray-800">
                      {searchResult.trackingReturnNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(searchResult.trackingReturnNumber!, `track_${searchResult.id}`)}
                      className="px-2 py-1 bg-white border border-gray-300 text-gray-600 hover:text-[#936B34] text-xs font-mono cursor-pointer"
                      title="Copy Waybill"
                    >
                      {copiedKey === `track_${searchResult.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-sans">
                    Label will be issued upon claim approval.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User's Return Requests or Empty State */}
        <div>
          <div className="pb-3 border-b border-gray-200 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                CLAIMS &amp; EXCHANGES
              </span>
              <h2 className="font-serif text-2xl text-[#111827]">
                Your Return Requests
              </h2>
            </div>
          </div>

          {returnRequests.length > 0 ? (
            <div className="border border-gray-200 bg-white divide-y divide-gray-100">
              {returnRequests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-gray-500">
                      <span className="text-[#936B34] font-semibold">RETURN #{req.id}</span>
                      <span>·</span>
                      <span>Order #{req.orderId}</span>
                      <span>·</span>
                      <span>{req.createdAt}</span>
                    </div>

                    <h4 className="font-serif text-lg text-[#111827] mt-1">
                      {req.itemNames.join(', ')}
                    </h4>

                    <p className="text-xs text-gray-600 font-sans mt-0.5">
                      Type: <strong>{req.actionType}</strong> · Status: <span className="text-emerald-700 font-medium">{req.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSearchResult(req);
                        setHasSearched(true);
                        setSearchQuery(req.id);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      View Full Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 bg-white p-10 text-center shadow-xs">
              <RotateCcw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-serif text-xl text-[#111827]">No Return Requests Found</h3>
              <p className="text-xs text-gray-500 font-sans mt-1.5 max-w-md mx-auto leading-relaxed">
                If you need to exchange an item for a different size or submit a return, click below to start a request.
              </p>
              <button
                onClick={() => setIsNewReturnModalOpen(true)}
                className="mt-5 px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Return / Exchange</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Start New Return Modal */}
      {isNewReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
              <div>
                <h3 className="font-serif text-2xl text-[#111827]">Initiate Return or Exchange</h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">Complimentary return labels provided for size adjustments and returns.</p>
              </div>
              <button 
                onClick={() => setIsNewReturnModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  Order ID *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.orderId}
                  onChange={e => setNewForm({ ...newForm, orderId: e.target.value })}
                  placeholder="e.g. PA-1001"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.itemNames}
                  onChange={e => setNewForm({ ...newForm, itemNames: e.target.value })}
                  placeholder="e.g. Navy Suit Jacket (40R)"
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  Desired Resolution *
                </label>
                <select
                  value={newForm.actionType}
                  onChange={e => setNewForm({ ...newForm, actionType: e.target.value as any })}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                >
                  <option value="Size / Fit Exchange">Size / Fit Exchange</option>
                  <option value="Tailoring Adjustment">Tailoring Adjustment</option>
                  <option value="Store Credit">Store Credit</option>
                  <option value="Refund to Original Payment">Refund to Original Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-600 mb-1 font-semibold">
                  Reason for Return / Exchange Details
                </label>
                <textarea
                  rows={3}
                  value={newForm.reason}
                  onChange={e => setNewForm({ ...newForm, reason: e.target.value })}
                  placeholder="Please specify your sizing change or return reason..."
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#936B34]"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewReturnModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-mono uppercase tracking-wider text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
