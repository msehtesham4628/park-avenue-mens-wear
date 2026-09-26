import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  RotateCcw, 
  Truck, 
  Scissors, 
  Package, 
  ArrowRight, 
  LogOut, 
  LogIn, 
  Search,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AuthService, ReturnService } from '../../services/api';
import { Order, AlterationRecord, ReturnRequest } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const CustomerDashboard: React.FC = () => {
  const { 
    currentCustomer, 
    logout, 
    setActiveView, 
    showToast,
    setCurrentOrder
  } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [alterations, setAlterations] = useState<AlterationRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentCustomer]);

  const loadData = async () => {
    if (!currentCustomer) return;
    setIsLoading(true);
    try {
      const [profile, dbReturns] = await Promise.all([
        AuthService.getMe(),
        ReturnService.getMyReturns().catch(() => [])
      ]);
      if (profile) {
        setOrders(profile.orders || []);
        setAlterations(profile.alterations || []);
        setReturns(profile.returns && profile.returns.length > 0 ? profile.returns : (dbReturns || []));
      } else if (dbReturns) {
        setReturns(dbReturns);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickTrackQuery.trim().toUpperCase();
    if (!query) {
      showToast('Please enter an Order ID, Alteration ID, or Return ID.', 'info');
      return;
    }

    if (query.startsWith('RET-') || query.includes('RET')) {
      setActiveView('track-return');
    } else if (query.startsWith('ALT-')) {
      setActiveView('track-alteration');
    } else {
      setActiveView('track-order');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = [
    {
      view: 'account-info' as const,
      title: 'Account Information',
      desc: 'Update your contact details, primary delivery address, and custom tailoring sizing preferences.',
      icon: User,
      actionText: 'Manage Account Info',
      badge: 'Profile & Sizing'
    },
    {
      view: 'reset-password' as const,
      title: 'Password & Security',
      desc: 'Update your login password to ensure your account and order history remain protected.',
      icon: Lock,
      actionText: 'Manage Password',
      badge: 'Account Security'
    },
    {
      view: 'track-return' as const,
      title: 'Returns & Exchanges',
      desc: 'Check status of size exchanges, returns, and prepaid return shipping labels.',
      icon: RotateCcw,
      actionText: 'Track Returns',
      badge: 'Online Tracking'
    },
    {
      view: 'track-order' as const,
      title: 'Track Orders',
      desc: 'Monitor shipping dispatch, courier tracking, and estimated delivery dates.',
      icon: Truck,
      actionText: 'Track Order Status',
      badge: 'Order Lookup'
    },
    {
      view: 'track-alteration' as const,
      title: 'Track Alterations',
      desc: 'View progress on custom fittings, trouser hemming, and tailoring adjustments.',
      icon: Scissors,
      actionText: 'Track Tailoring',
      badge: 'Fitting Updates'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block mb-1">
                PARK AVENUE MENSWEAR
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-light">
                Customer Dashboard
              </h1>
              <p className="text-xs text-gray-600 font-sans mt-1">
                {currentCustomer 
                  ? `Welcome, ${currentCustomer.name || currentCustomer.email}. Access your account, orders, and services below.` 
                  : 'Welcome. Manage your customer profile, security settings, and order tracking.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {currentCustomer ? (
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:text-red-700 hover:border-red-300 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer font-medium"
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
                  className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">

        {/* Quick Tracking Tool */}
        <div className="border border-gray-200 bg-[#FAF8F5] p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#936B34] font-semibold block">
                QUICK LOOKUP
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] mt-0.5 font-light">
                Track an Order, Alteration, or Return
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span className="hidden sm:inline">Direct links:</span>
              <button
                onClick={() => {
                  setActiveView('track-order');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="underline hover:text-[#936B34] cursor-pointer"
              >
                Track Orders
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setActiveView('track-alteration');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="underline hover:text-[#936B34] cursor-pointer"
              >
                Track Alterations
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setActiveView('track-return');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="underline hover:text-[#936B34] cursor-pointer"
              >
                Returns &amp; Exchanges
              </button>
            </div>
          </div>

          <form onSubmit={handleQuickTrackSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={quickTrackQuery}
                onChange={e => setQuickTrackQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. PA-1001), Alteration ID, or Return ID..."
                className="w-full bg-white border border-gray-300 pl-10 pr-4 py-2.5 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#936B34]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              TRACK NOW
            </button>
          </form>
        </div>

        {/* Customer Account Services Grid */}
        <div>
          <div className="pb-3 border-b border-gray-200 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                SERVICES
              </span>
              <h2 className="font-serif text-2xl text-[#111827]">
                Account &amp; Order Services
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <div 
                  key={page.view} 
                  className="border border-gray-200 bg-white p-6 flex flex-col justify-between hover:border-[#936B34]/60 transition-colors group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-[#FAF8F5] border border-gray-200 flex items-center justify-center group-hover:bg-[#936B34]/10 transition-colors">
                        <Icon className="w-5 h-5 text-[#936B34]" />
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 font-semibold">
                        {page.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl text-[#111827] group-hover:text-[#936B34] transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-sans mt-2 leading-relaxed">
                      {page.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setActiveView(page.view);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-3.5 bg-[#FAF8F5] hover:bg-[#111827] text-gray-800 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer font-medium"
                    >
                      <span>{page.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                ORDER HISTORY
              </span>
              <h2 className="font-serif text-2xl text-[#111827]">
                Recent Orders
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveView('track-order');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-mono text-[#936B34] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Track Orders</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="border border-gray-200 bg-white divide-y divide-gray-100">
              {orders.map((ord, idx) => (
                <div key={ord.id || idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gray-50 border border-gray-200 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback 
                        src={ord.items?.[0]?.image || '/Suits_image.png'}
                        alt={ord.items?.[0]?.productName || 'Garment'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 text-xs font-mono text-gray-500">
                        <span className="text-[#936B34] font-semibold">ORDER #{ord.id}</span>
                        <span>·</span>
                        <span>{ord.date}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold">{ord.orderStatus}</span>
                      </div>

                      <h4 className="font-serif text-lg text-[#111827] mt-1">
                        {ord.items?.[0]?.productName || 'Park Avenue Menswear Order'}
                      </h4>

                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Carrier: {ord.carrier || 'Standard Courier'} {ord.trackingNumber ? `· Waybill: ${ord.trackingNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-bold text-[#111827]">
                      ${(ord.total || 0).toFixed(2)}
                    </span>

                    <button
                      onClick={() => {
                        setCurrentOrder(ord);
                        setActiveView('track-order');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Track Shipment
                    </button>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', `/track-return?orderId=${encodeURIComponent(ord.id)}`);
                        }
                        setActiveView('track-return');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 border border-gray-300 text-xs font-mono uppercase tracking-wider text-gray-700 hover:border-[#936B34] hover:text-[#936B34] transition-colors cursor-pointer"
                    >
                      Exchange / Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 bg-white p-10 text-center shadow-xs">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-serif text-xl text-[#111827]">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-500 font-sans mt-1.5 max-w-md mx-auto leading-relaxed">
                When you purchase suits, blazers, or custom tailoring, your order history and live courier tracking will appear here.
              </p>
              <button
                onClick={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-5 px-6 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Collection</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Returns & Exchanges Section */}
        {returns.length > 0 && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  SERVICE & EXCHANGES
                </span>
                <h2 className="font-serif text-2xl text-[#111827]">
                  Active Returns & Exchanges ({returns.length})
                </h2>
              </div>

              <button
                onClick={() => {
                  setActiveView('track-return');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-mono text-[#936B34] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Track All Returns</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="border border-gray-200 bg-white divide-y divide-gray-100">
              {returns.map((ret, idx) => (
                <div key={ret.id || idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FAF8F5] border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-6 h-6 text-[#936B34]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 text-xs font-mono text-gray-500">
                        <span className="text-[#936B34] font-semibold">CLAIM #{ret.id}</span>
                        <span>·</span>
                        <span>ORDER #{ret.orderId}</span>
                        <span>·</span>
                        <span>{ret.createdAt}</span>
                      </div>

                      <h4 className="font-serif text-lg text-[#111827] mt-1">
                        {ret.actionType}
                      </h4>

                      <p className="text-xs text-gray-500 font-sans mt-0.5">
                        Items: {ret.itemNames.join(', ')} · Reason: {ret.reason}
                      </p>

                      {ret.trackingReturnNumber && (
                        <p className="text-xs font-mono text-gray-600 mt-1">
                          Return Waybill: <span className="font-semibold text-gray-900">{ret.trackingReturnNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono uppercase tracking-wider">
                      {ret.status}
                    </span>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', `/track-return?returnId=${encodeURIComponent(ret.id)}`);
                        }
                        setActiveView('track-return');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Track Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
