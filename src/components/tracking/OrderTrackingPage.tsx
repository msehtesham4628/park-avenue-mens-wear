import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Scissors
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const OrderTrackingPage: React.FC = () => {
  const { currentOrder, lookupOrder, setActiveView } = useShop();
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() && !contactInfo.trim()) return;
    setIsSearching(true);
    await lookupOrder(orderId.trim() || contactInfo.trim());
    setIsSearching(false);
    setHasSearched(true);
  };

  const steps = [
    { key: 'pending', label: 'Order Received', icon: Clock },
    { key: 'processing', label: 'Atelier Tailoring & Prep', icon: Scissors },
    { key: 'shipped', label: 'In Transit with Luxury Courier', icon: Truck },
    { key: 'delivered', label: 'Delivered & Signed', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const orderRank: Record<string, number> = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1
    };
    const currentRank = orderRank[currentStatus] ?? 0;
    const targetRank = orderRank[stepKey] ?? 0;

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
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
            TRACK YOUR ORDER
          </h1>
          <p className="text-xs text-[#666666] uppercase tracking-widest font-mono leading-relaxed">
            Enter your Order ID and associated Email or Phone Number to monitor atelier handover, hand-inspection, and priority courier dispatch.
          </p>
        </div>

        {/* Dual Input Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 border border-black/10 bg-[#FAF9F6] p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 font-medium">
              ORDER ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. PA-ORD-8821"
              className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-[#111111] placeholder-[#888888] font-mono focus:outline-none focus:border-[#8C6D3B]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 font-medium">
              EMAIL OR PHONE NUMBER
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. client@example.com or +1 (212) 555-0199"
              className="w-full bg-white border border-black/10 px-4 py-3 text-sm text-[#111111] placeholder-[#888888] font-mono focus:outline-none focus:border-[#8C6D3B]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 bg-[#111111] hover:bg-[#8C6D3B] text-white font-semibold text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSearching ? 'SEARCHING ARCHIVE...' : 'TRACK ORDER'}
            </button>
          </div>
        </form>

        {/* Order Details or Exact Required Empty State */}
        {currentOrder ? (
          <div className="border border-black/10 bg-[#FAF9F6] p-6 sm:p-10 space-y-10 shadow-sm">
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/10 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D3B] block mb-1 font-medium">
                  CONSIGNMENT #{currentOrder.id}
                </span>
                <h2 className="font-serif text-2xl text-[#111111] uppercase font-light">
                  Order Status: {currentOrder.status?.toUpperCase() || (currentOrder as any).orderStatus?.toUpperCase() || 'PROCESSING'}
                </h2>
              </div>
              <div className="text-right font-mono text-xs text-[#666666]">
                <div>Placed: {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleDateString() : (currentOrder as any).date || 'Recent'}</div>
                <div className="text-[#111111] font-semibold text-sm mt-0.5">
                  Total: ${currentOrder.total?.toLocaleString() || currentOrder.subtotal?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(step.key, (currentOrder.status || (currentOrder as any).orderStatus || 'processing').toLowerCase());
                const Icon = step.icon;

                return (
                  <div 
                    key={step.key}
                    className={`p-4 border transition-colors ${
                      stepStatus === 'completed'
                        ? 'border-[#8C6D3B]/60 bg-[#8C6D3B]/10'
                        : stepStatus === 'current'
                        ? 'border-[#111111] bg-white shadow-xs'
                        : 'border-black/5 opacity-50 bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-[#666666]">0{idx + 1}</span>
                      <Icon className={`w-4 h-4 ${stepStatus === 'completed' || stepStatus === 'current' ? 'text-[#8C6D3B]' : 'text-[#888888]'}`} />
                    </div>
                    <div className="text-xs uppercase font-serif tracking-wider text-[#111111]">
                      {step.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#8C6D3B] mt-1 uppercase font-medium">
                      {stepStatus}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Consignment Items */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#666666] mb-4">
                GARMENTS IN THIS CONSIGNMENT
              </h3>
              <div className="divide-y divide-black/5 border border-black/10 bg-white shadow-xs">
                {currentOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-20 shrink-0">
                      <MediaPlaceholder
                        label="PA"
                        category="SUIT"
                        aspectRatio="portrait"
                        minimal
                        className="w-full h-full p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-sm text-[#111111] uppercase font-light">
                        {item.productName || 'Park Avenue Garment'}
                      </h4>
                      <p className="text-xs font-mono text-[#666666] mt-0.5">
                        QTY: {item.quantity} · SIZE: {item.size || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right font-mono text-sm text-[#111111] font-semibold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Details */}
            {currentOrder.trackingNumber && (
              <div className="p-4 bg-white border border-black/10 flex items-center justify-between text-xs font-mono shadow-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8C6D3B]" />
                  <span>COURIER: DHL EXPRESS PRIORITY</span>
                </div>
                <span className="text-[#8C6D3B] font-medium">TRACKING #{currentOrder.trackingNumber}</span>
              </div>
            )}
          </div>
        ) : (
          /* Exact Required Empty State:
             PARK AVENUE MENSWEAR
             NO ORDERS FOUND */
          <div className="border border-black/10 bg-[#FAF9F6] py-20 px-6 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-12 h-12 mb-6 border border-[#8C6D3B]/40 flex items-center justify-center font-serif text-base text-[#8C6D3B] tracking-widest bg-white shadow-xs">
              PA
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8C6D3B] mb-2 block font-medium">
              PARK AVENUE MENSWEAR
            </span>

            <h3 className="font-serif text-2xl text-[#111111] uppercase tracking-wider mb-4 font-light">
              NO ORDERS FOUND
            </h3>

            <p className="text-xs text-[#666666] max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
              {hasSearched 
                ? 'No consignment record matched the provided Order ID or contact details. Please check your purchase confirmation.' 
                : 'Enter your Order ID above or place an order via checkout to view live dispatch milestones.'}
            </p>

            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-3.5 bg-white border border-black/20 hover:border-[#8C6D3B] text-xs uppercase tracking-[0.2em] text-[#111111] hover:text-[#8C6D3B] transition-colors cursor-pointer shadow-xs"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
