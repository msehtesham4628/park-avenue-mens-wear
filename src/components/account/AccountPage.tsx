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
  ExternalLink
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AuthService } from '../../services/api';
import { Order, AlterationRecord } from '../../types';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';

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
    setActiveView 
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'alterations' | 'measurements'>('orders');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerAlterations, setCustomerAlterations] = useState<AlterationRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!currentCustomer) {
      setCustomerOrders([]);
      setCustomerAlterations([]);
      return;
    }

    AuthService.getMe().then(profile => {
      if (cancelled || !profile) return;
      setCustomerOrders(profile.orders);
      setCustomerAlterations(profile.alterations);
    });

    return () => { cancelled = true; };
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
                <span className="text-[10px] font-mono text-white bg-[#936B34] px-2 py-0.5 uppercase tracking-wider font-semibold">
                  PATRON PRIVATE
                </span>
              </div>
              {currentCustomer?.email && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {currentCustomer.email}
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
              <span>ORDERS</span>
            </button>

            <button
              onClick={() => setActiveView('track-alteration')}
              className="px-3.5 py-2 bg-[#F9F9F8] border border-gray-200 text-xs font-mono text-[#111827] hover:border-[#936B34] hover:text-[#936B34] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Scissors className="w-3.5 h-3.5 text-[#936B34]" />
              <span>ALTERATIONS</span>
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

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 my-6 overflow-x-auto">
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
                  ? 'border-[#936B34] text-[#936B34] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-[#111827]'
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
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO ORDERS FOUND
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
                return (
                  <div key={orderKey} className="bg-[#F9F9F8] border border-gray-200 p-6 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-base font-semibold text-[#111827] mr-3">{order.id || (order as any).orderId}</span>
                        <span className="text-gray-500">Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order as any).date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#936B34] uppercase bg-[#936B34]/15 px-2.5 py-1 border border-[#936B34]/30 font-medium">
                          {order.status || (order as any).orderStatus}
                        </span>
                        <span className="font-semibold text-[#111827] tabular-nums">
                          ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items?.map((item, idx) => {
                        const itemKey = (item as any).id || (item as any)._id || `${orderKey}-item-${item.productId || idx}-${item.size || ''}-${idx}`;
                        return (
                          <div key={itemKey} className="flex gap-3 bg-white p-3 border border-gray-100 shadow-md">
                            <div className="w-12 h-16 shrink-0 overflow-hidden">
                              <MediaPlaceholder label="PA" category="SUIT" aspectRatio="portrait" minimal className="w-full h-full p-1" />
                            </div>
                            <div className="text-xs min-w-0 font-mono">
                              <h4 className="font-serif text-[#111827] truncate uppercase">{item.productName}</h4>
                              <p className="text-gray-500 mt-0.5">Size: {item.size}</p>
                              <p className="text-[#936B34] tabular-nums mt-1 font-medium">${item.price}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    {order.trackingNumber || order.shipment?.trackingId ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111827] text-white text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                          <Truck className="w-3.5 h-3.5 text-[#936B34]" />
                          <span>{order.carrier || order.shipment?.carrier || 'Carrier'}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 text-[11px] uppercase tracking-wider">Tracking ID:</span>
                          <span className="font-semibold text-[#111827] text-xs tabular-nums bg-white px-2.5 py-1 border border-gray-200">
                            {order.trackingNumber || order.shipment?.trackingId}
                          </span>
                        </div>
                        {(order.trackingUrl || order.shipment?.trackingUrl) && (
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
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[11px]">
                        Tracking information will be available once your consignment has been dispatched.
                      </span>
                    )}

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

        {activeTab === 'wishlist' && (
          <div>
            {wishlistedProducts.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
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

        {activeTab === 'alterations' && (
          <div>
            {customerAlterations.length === 0 ? (
              <div className="border border-gray-200 bg-[#F9F9F8] py-20 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#936B34] mb-2 block font-medium">
                  PARK AVENUE MENSWEAR
                </span>
                <h3 className="font-serif text-2xl text-[#111827] uppercase tracking-wider mb-4 font-light">
                  NO ALTERATIONS FOUND
                </h3>
                <p className="text-xs text-gray-500 max-w-md uppercase tracking-widest font-mono leading-relaxed mb-6">
                  No bespoke tailoring commissions are currently open for your account.
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
                        <span className="text-[#936B34] block mb-1 font-medium">#{alt.id || (alt as any).alterationId}</span>
                        <h4 className="font-serif text-lg text-[#111827] uppercase font-light">{alt.productName || alt.items?.[0]?.name || 'Park Avenue Garment'}</h4>
                        <p className="text-gray-500 mt-1">{alt.alterationDetails || alt.items?.[0]?.type || 'Bespoke Tailoring'} · Tailor: {alt.tailorAssigned}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#936B34] uppercase block font-semibold mb-2">
                          {(alt.status || 'In Progress').replace(/_/g, ' ')}
                        </span>
                        <button
                          onClick={() => handleTrackAlteration(alt)}
                          className="px-4 py-2 border border-gray-300 hover:border-[#936B34] text-[#111827] hover:text-[#936B34] text-[11px] uppercase cursor-pointer bg-white transition-colors"
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

        {activeTab === 'measurements' && (
          <div className="border border-gray-200 bg-[#F9F9F8] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#936B34] font-mono text-xs uppercase tracking-widest font-medium">
              <Ruler className="w-4 h-4" />
              <span>ATELIER SILHOUETTE CARD</span>
            </div>
            <p className="text-xs font-mono text-gray-500 leading-relaxed">
              Your bespoke measurements are recorded in our flagship salon archive. When you order suits or dress pants, our master tailors automatically calibrate your alterations to these specifications.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 font-mono text-xs">
              <div className="p-3 bg-white border border-gray-100 shadow-md">
                <span className="text-[10px] text-gray-400 block">JACKET CHEST</span>
                <span className="text-[#111827] font-medium">40 Regular</span>
              </div>
              <div className="p-3 bg-white border border-gray-100 shadow-md">
                <span className="text-[10px] text-gray-400 block">TROUSER WAIST</span>
                <span className="text-[#111827] font-medium">32 Inches</span>
              </div>
              <div className="p-3 bg-white border border-gray-100 shadow-md">
                <span className="text-[10px] text-gray-400 block">INSEAM BREAK</span>
                <span className="text-[#111827] font-medium">32.5&quot; (Slight Break)</span>
              </div>
              <div className="p-3 bg-white border border-gray-100 shadow-md">
                <span className="text-[10px] text-gray-400 block">COLLAR SIZE</span>
                <span className="text-[#111827] font-medium">15.5 Inches</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
