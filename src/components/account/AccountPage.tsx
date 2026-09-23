import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Truck, 
  Ruler, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OrderService, AlterationService } from '../../services/api';
import { Order, AlterationRecord } from '../../types';
import { MediaPlaceholder } from '../common/MediaPlaceholder';

export const AccountPage: React.FC = () => {
  const { 
    currentCustomer, 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart, 
    setCurrentOrder, 
    setCurrentAlteration,
    setActiveView 
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'alterations' | 'measurements'>('orders');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerAlterations, setCustomerAlterations] = useState<AlterationRecord[]>([]);

  useEffect(() => {
    OrderService.getAll().then(orders => setCustomerOrders(orders));
    AlterationService.getAll().then(alts => setCustomerAlterations(alts));
  }, []);

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

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0E1526] border border-[#C8A97E]/50 flex items-center justify-center font-serif text-xl text-[#C8A97E] tracking-widest shadow-md">
              PA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wide font-light">
                  {currentCustomer?.name || 'PARK AVENUE CLIENT'}
                </h1>
                <span className="text-[10px] font-mono text-[#090D16] bg-[#C8A97E] px-2 py-0.5 uppercase tracking-wider font-semibold">
                  PATRON PRIVATE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {currentCustomer?.email || 'client@parkavenuemenswear.com'} · Flagship Salon Atelier Access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('track-order')}
              className="px-4 py-2.5 bg-[#0E1526] border border-white/10 text-xs font-mono text-white hover:border-[#C8A97E] hover:text-[#C8A97E] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-[#C8A97E]" />
              <span>TRACK ORDERS</span>
            </button>
            <button
              onClick={() => setActiveView('track-alteration')}
              className="px-4 py-2.5 bg-[#0E1526] border border-white/10 text-xs font-mono text-white hover:border-[#C8A97E] hover:text-[#C8A97E] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-[#C8A97E]" />
              <span>TRACK ALTERATIONS</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 my-6 overflow-x-auto">
          {[
            { id: 'orders', label: `ORDER HISTORY (${customerOrders.length})` },
            { id: 'wishlist', label: `SAVED WISHLIST (${wishlistedProducts.length})` },
            { id: 'alterations', label: `BESPOKE ALTERATIONS (${customerAlterations.length})` },
            { id: 'measurements', label: 'TAILORING SILHOUETTE CARD' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs uppercase tracking-wider font-mono border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#C8A97E] text-[#C8A97E] font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {customerOrders.length === 0 ? (
              <div className="border border-white/10 bg-[#0E1526] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <div className="w-12 h-12 mb-6 border border-[#C8A97E]/50 flex items-center justify-center font-serif text-base text-[#C8A97E] tracking-widest bg-[#090D16] shadow-md">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-4 font-light">
                  NO ORDERS FOUND
                </h3>
                <p className="text-xs text-slate-400 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  Online orders and atelier commissions will be tracked in your client archive here.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#C8A97E] text-[#090D16] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors cursor-pointer shadow-md"
                >
                  EXPLORE CATALOGUE
                </button>
              </div>
            ) : (
              customerOrders.map(order => (
                <div key={order.id} className="bg-[#0E1526] border border-white/10 p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-base font-semibold text-white mr-3">{order.id}</span>
                      <span className="text-slate-400">Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order as any).date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#C8A97E] uppercase bg-[#C8A97E]/15 px-2.5 py-1 border border-[#C8A97E]/30 font-medium">
                        {order.status || (order as any).orderStatus}
                      </span>
                      <span className="font-semibold text-white tabular-nums">
                        ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 bg-[#090D16] p-3 border border-white/5 shadow-md">
                        <div className="w-12 h-16 shrink-0 overflow-hidden">
                          <MediaPlaceholder label="PA" category="SUIT" aspectRatio="portrait" minimal className="w-full h-full p-1" />
                        </div>
                        <div className="text-xs min-w-0 font-mono">
                          <h4 className="font-serif text-white truncate uppercase">{item.productName}</h4>
                          <p className="text-slate-400 mt-0.5">Size: {item.size}</p>
                          <p className="text-[#C8A97E] tabular-nums mt-1 font-medium">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Tracking: {order.trackingNumber || 'Awaiting dispatch'}</span>
                    <button
                      onClick={() => handleTrackOrder(order)}
                      className="text-[#C8A97E] hover:text-white flex items-center gap-1 font-medium uppercase cursor-pointer transition-colors"
                    >
                      <span>TRACK CONSIGNMENT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="border border-white/10 bg-[#0E1526] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <div className="w-12 h-12 mb-6 border border-[#C8A97E]/50 flex items-center justify-center font-serif text-base text-[#C8A97E] tracking-widest bg-[#090D16] shadow-md">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-4 font-light">
                  YOUR WISHLIST IS EMPTY
                </h3>
                <p className="text-xs text-slate-400 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  Save pieces from our suits, shirts, and accessories collections to review anytime.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#C8A97E] text-[#090D16] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors cursor-pointer shadow-md"
                >
                  DISCOVER COLLECTION
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedProducts.map(product => (
                  <div key={product.id} className="border border-white/10 bg-[#0E1526] p-4 flex flex-col justify-between shadow-xl">
                    <div className="aspect-[3/4] mb-3 overflow-hidden bg-[#090D16]">
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
                        <span className="text-[10px] font-mono text-[#C8A97E] uppercase font-medium">{product.category}</span>
                        <span className="text-xs font-mono text-white">${product.price.toLocaleString()}</span>
                      </div>
                      <h4 className="font-serif text-base text-white uppercase line-clamp-1 mb-4 font-light">{product.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToCart(product, product.variants?.[0]?.size || 'Standard', product.variants?.[0]?.color || 'Standard', 1);
                          }}
                          className="flex-1 py-2 bg-[#C8A97E] text-[#090D16] text-xs font-mono uppercase font-semibold hover:bg-[#D4AF37] cursor-pointer transition-colors shadow-md"
                        >
                          ADD TO BAG
                        </button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="p-2 border border-white/10 text-slate-400 hover:text-red-400 bg-[#090D16] cursor-pointer transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'alterations' && (
          <div>
            {customerAlterations.length === 0 ? (
              <div className="border border-white/10 bg-[#0E1526] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <div className="w-12 h-12 mb-6 border border-[#C8A97E]/50 flex items-center justify-center font-serif text-base text-[#C8A97E] tracking-widest bg-[#090D16] shadow-md">
                  PA
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-4 font-light">
                  NO ALTERATIONS FOUND
                </h3>
                <p className="text-xs text-slate-400 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  No bespoke tailoring commissions are currently open for your account.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-8 py-3.5 bg-[#C8A97E] text-[#090D16] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors cursor-pointer shadow-md"
                >
                  BROWSE ATELIER SUITS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {customerAlterations.map(alt => (
                  <div key={alt.id} className="border border-white/10 bg-[#0E1526] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs shadow-xl">
                    <div>
                      <span className="text-[#C8A97E] block mb-1 font-medium">#{alt.id}</span>
                      <h4 className="font-serif text-lg text-white uppercase font-light">{alt.productName || alt.items?.[0]?.name || 'Park Avenue Garment'}</h4>
                      <p className="text-slate-400 mt-1">{alt.alterationDetails || alt.items?.[0]?.type || 'Bespoke Tailoring'} · Tailor: {alt.tailorAssigned}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#C8A97E] uppercase block font-semibold mb-2">
                        {alt.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => handleTrackAlteration(alt)}
                        className="px-4 py-2 border border-white/20 hover:border-[#C8A97E] text-white hover:text-[#C8A97E] text-[11px] uppercase cursor-pointer bg-[#090D16] transition-colors"
                      >
                        VIEW WORKBENCH STATUS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="border border-white/10 bg-[#0E1526] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#C8A97E] font-mono text-xs uppercase tracking-widest font-medium">
              <Ruler className="w-4 h-4" />
              <span>ATELIER SILHOUETTE CARD</span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Your bespoke measurements are recorded in our flagship salon archive. When you order suits or dress pants, our master tailors automatically calibrate your alterations to these specifications.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
              <div className="p-3 bg-[#090D16] border border-white/5 shadow-md">
                <span className="text-[10px] text-slate-500 block">JACKET CHEST</span>
                <span className="text-white font-medium">40 Regular</span>
              </div>
              <div className="p-3 bg-[#090D16] border border-white/5 shadow-md">
                <span className="text-[10px] text-slate-500 block">TROUSER WAIST</span>
                <span className="text-white font-medium">32 Inches</span>
              </div>
              <div className="p-3 bg-[#090D16] border border-white/5 shadow-md">
                <span className="text-[10px] text-slate-500 block">INSEAM BREAK</span>
                <span className="text-white font-medium">32.5&quot; (Slight Break)</span>
              </div>
              <div className="p-3 bg-[#090D16] border border-white/5 shadow-md">
                <span className="text-[10px] text-slate-500 block">COLLAR SIZE</span>
                <span className="text-white font-medium">15.5 Inches</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
