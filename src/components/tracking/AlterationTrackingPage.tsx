import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';

export const AlterationTrackingPage: React.FC = () => {
  const { currentAlteration, lookupAlteration, setActiveView } = useShop();
  const [alterationId, setAlterationId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alterationId.trim() && !phoneNumber.trim()) return;
    setIsSearching(true);
    await lookupAlteration(alterationId.trim() || phoneNumber.trim());
    setIsSearching(false);
    setHasSearched(true);
  };

  const steps = [
    { key: 'received', label: 'Garment Received & Inspected' },
    { key: 'chalking_and_pinning', label: 'Chalking & Silhouette Pinning' },
    { key: 'cutting_and_stitching', label: 'Hand Cutting & Basting' },
    { key: 'pressing_and_inspection', label: 'Steam Pressing & Balance Check' },
    { key: 'ready_for_pickup', label: 'Ready for Salon Pickup or Dispatch' }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const rank: Record<string, number> = {
      received: 0,
      chalking_and_pinning: 1,
      cutting_and_stitching: 2,
      pressing_and_inspection: 3,
      ready_for_pickup: 4,
      completed: 5
    };
    const cRank = rank[currentStatus] ?? 0;
    const tRank = rank[stepKey] ?? 0;

    if (cRank > tRank) return 'completed';
    if (cRank === tRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] pt-10 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Exact Header Specifications */}
        <div className="py-8 text-center max-w-xl mx-auto space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#8C6D3B] block font-medium">
            PARK AVENUE MENSWEAR
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#111111] uppercase tracking-wide font-light">
            TRACK YOUR ALTERATION
          </h1>
          <p className="text-xs text-[#666666] uppercase tracking-widest font-mono leading-relaxed">
            Monitor the exact craftsmanship phase of your bespoke suit, trouser hemming, or waist adjustment at our atelier.
          </p>
        </div>

        {/* Dual Input Form: Alteration ID & Phone Number */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 border border-black/10 bg-[#FAF9F6] p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 font-medium">
              ALTERATION ID
            </label>
            <input
              type="text"
              value={alterationId}
              onChange={(e) => setAlterationId(e.target.value)}
              placeholder="e.g. PA-ALT-501"
              className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-[#111111] placeholder-[#888888] font-mono focus:outline-none focus:border-[#8C6D3B]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 font-medium">
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +1 (212) 555-0199"
              className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-[#111111] placeholder-[#888888] font-mono focus:outline-none focus:border-[#8C6D3B]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 bg-[#111111] hover:bg-[#8C6D3B] text-white font-semibold text-xs uppercase tracking-[0.25em] transition-all disabled:opacity-50 cursor-pointer shadow-md active:bg-[#7A5726] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSearching ? 'SEARCHING ATELIER ARCHIVE...' : 'TRACK ALTERATION'}
            </button>
          </div>
        </form>

        {/* Alteration Status or Exact Required Empty State */}
        {currentAlteration ? (
          <div className="border border-black/10 bg-[#FAF9F6] p-6 sm:p-10 space-y-8 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D3B] block mb-1 font-medium">
                  ALTERATION COMMISSION #{currentAlteration.id}
                </span>
                <h2 className="font-serif text-2xl text-[#111111] uppercase font-light">
                  {currentAlteration.productName || (currentAlteration as any).item?.name || 'Park Avenue Garment'}
                </h2>
                <div className="text-xs text-[#666666] font-mono mt-1">
                  Client: {currentAlteration.customerName} · Assigned Tailor: {currentAlteration.tailorAssigned || 'Master Tailor Giovanni'}
                </div>
              </div>

              <div className="text-right font-mono text-xs text-[#666666]">
                <div className="text-[#8C6D3B] uppercase tracking-wider font-semibold">
                  STATUS: {(currentAlteration.status || 'Alteration Received').replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="mt-1">
                  Est. Completion: {new Date(currentAlteration.estimatedCompletion || (currentAlteration as any).targetCompletionDate || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#666666]">
                ATELIER BENCHMARK PROGRESS
              </h3>

              <div className="space-y-3">
                {steps.map((st, idx) => {
                  const sStatus = getStepStatus(st.key, (currentAlteration.status || 'received').toLowerCase().replace(/\s+/g, '_'));
                  return (
                    <div 
                      key={st.key}
                      className={`p-4 border flex items-center justify-between transition-colors ${
                        sStatus === 'completed'
                          ? 'border-[#8C6D3B]/50 bg-[#8C6D3B]/10 text-[#111111]'
                          : sStatus === 'current'
                          ? 'border-[#111111] bg-white text-[#111111] shadow-xs'
                          : 'border-black/5 bg-[#FAF9F6] text-[#888888]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#8C6D3B] font-medium">0{idx + 1}</span>
                        <span className="font-serif text-sm tracking-wide uppercase">{st.label}</span>
                      </div>
                      <div className="font-mono text-xs uppercase text-[#8C6D3B] font-medium">
                        {sStatus === 'completed' ? '✓ Completed' : sStatus === 'current' ? '● In Progress' : 'Upcoming'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specifications / Alteration Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/10">
              <div className="p-4 bg-white border border-black/5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-[#8C6D3B] block font-medium">ALTERATION SCOPE</span>
                <p className="text-xs text-[#111111] font-light">
                  {currentAlteration.alterationDetails ? currentAlteration.alterationDetails.toUpperCase() : (currentAlteration.items?.[0]?.type || 'HEMMING & SLEEVE BREAK')}
                </p>
                <p className="text-[11px] text-[#666666] mt-1 font-mono">
                  {currentAlteration.tailorNotes || 'Full floating canvas preservation and tailored waist suppression.'}
                </p>
              </div>

              <div className="p-4 bg-white border border-black/5 space-y-1 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-[#8C6D3B] block font-medium">COMMISSION SALON</span>
                <p className="text-xs text-[#111111] font-light">
                  PARK AVENUE BESPOKE ATELIER
                </p>
                <p className="text-[11px] text-[#666666] mt-1 font-mono">
                  Master Tailoring &amp; Hand-Finishing Division
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-black/10 bg-[#FAF9F6] py-16 px-6 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-12 h-12 mb-4 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-base text-[#8C6D3B] tracking-widest bg-white shadow-xs">
              PA
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8C6D3B] mb-2 block font-medium">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl text-[#111111] uppercase tracking-wider mb-3 font-light">
              {hasSearched ? 'NO ALTERATIONS FOUND' : 'ATELIER ALTERATION STATUS'}
            </h3>

            <p className="text-xs text-[#666666] max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
              {hasSearched 
                ? 'No alteration commission matched the provided ID or Phone Number. Please check your fitting card receipt.'
                : 'Enter your Alteration ID or Phone Number above to review the master tailor bench status.'}
            </p>

            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-3.5 bg-white border border-black/20 hover:border-[#8C6D3B] text-xs uppercase tracking-[0.2em] text-[#111111] hover:text-[#8C6D3B] transition-colors cursor-pointer shadow-xs font-semibold"
            >
              EXPLORE MENSWEAR
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
