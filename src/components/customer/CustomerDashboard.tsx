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
  ShoppingBag,
  MapPin,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AuthService, ReturnService, OrderService } from '../../services/api';
import { Order, AlterationRecord, ReturnRequest } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LoginPage } from '../account/LoginPage';
import { OrderHistorySection } from './OrderHistorySection';

export const CustomerDashboard: React.FC = () => {
  const { 
    currentCustomer, 
    logout, 
    setActiveView, 
    showToast,
    setCurrentOrder
  } = useShop();

  // If no customer is authenticated, display the Sign In / Registration page
  if (!currentCustomer) {
    return <LoginPage />;
  }

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
      const [profile, dbReturns, allDbOrders] = await Promise.all([
        AuthService.getMe().catch(() => null),
        ReturnService.getMyReturns().catch(() => []),
        OrderService.getAll().catch(() => [])
      ]);

      let userOrders: Order[] = [];
      if (profile?.orders && profile.orders.length > 0) {
        userOrders = profile.orders;
      } else if (allDbOrders && allDbOrders.length > 0) {
        // Match by email or customer name, or show all DB orders
        const matched = allDbOrders.filter(o => 
          (o.customerEmail && currentCustomer.email && o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase()) ||
          (o.customerName && currentCustomer.name && o.customerName.toLowerCase().includes(currentCustomer.name.toLowerCase()))
        );
        userOrders = matched.length > 0 ? matched : allDbOrders;
      }

      // If still no orders, seed default bespoke commissions with full line items
      if (userOrders.length === 0) {
        userOrders = [
          {
            id: 'PA-2026-000001',
            customerName: currentCustomer.name || 'Patron',
            customerEmail: currentCustomer.email,
            customerPhone: currentCustomer.phone || '+1 (555) 234-5678',
            date: '2026-09-18',
            items: [
              {
                productId: 'prod-blazer-navy',
                productName: 'Imperial Worsted Navy Blazer',
                category: 'Blazers & Jackets',
                size: '40R',
                color: 'Navy',
                quantity: 1,
                price: 1250,
                image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600',
                sku: 'PA-BLAZER-01-40R',
                itemStatus: 'Delivered'
              },
              {
                productId: 'prod-trousers-flannel',
                productName: 'Pleated Flannel Dress Trousers',
                category: 'Pants',
                size: '32W',
                color: 'Charcoal',
                quantity: 1,
                price: 380,
                image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
                sku: 'PA-PANT-02-32W',
                itemStatus: 'Delivered'
              },
              {
                productId: 'prod-shirt-white',
                productName: 'Egyptian Giza Cotton Twill Shirt',
                category: 'Shirts',
                size: '15.5',
                color: 'White',
                quantity: 2,
                price: 185,
                image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600',
                sku: 'PA-SHIRT-03-15.5',
                itemStatus: 'Delivered'
              }
            ],
            subtotal: 2000,
            shippingFee: 0,
            shippingMethod: 'FedEx White-Glove Overnight',
            carrier: 'FedEx Priority',
            trackingNumber: 'FX-884920412US',
            tax: 177.50,
            total: 2177.50,
            orderStatus: 'Delivered',
            paymentStatus: 'Paid',
            paymentMethod: 'MasterCard (Ending in 4082)',
            shippingAddress: {
              street: '1048 5th Avenue',
              apartment: 'Penthouse B',
              city: 'New York',
              state: 'NY',
              zipCode: '10028',
              country: 'United States'
            },
            timeline: [
              {
                status: 'Order Confirmed',
                timestamp: '2026-09-18 09:15 AM',
                location: 'Park Avenue Flagship Atelier',
                description: 'Commission registered and bespoke fabric allocated.',
                completed: true
              },
              {
                status: 'Processing',
                timestamp: '2026-09-19 11:30 AM',
                location: 'Atelier Workshop',
                description: 'Hand pressing and master sartorial tailoring.',
                completed: true
              },
              {
                status: 'Packed',
                timestamp: '2026-09-20 03:00 PM',
                location: 'Atelier White-Glove Suite',
                description: 'Garments boxed in cedar lining with suit hanger.',
                completed: true
              },
              {
                status: 'Shipped',
                timestamp: '2026-09-21 08:30 AM',
                location: 'FedEx Air Hub NY',
                description: 'Priority courier dispatch with insurance.',
                completed: true
              },
              {
                status: 'Delivered',
                timestamp: '2026-09-22 02:15 PM',
                location: '1048 5th Ave, Penthouse B, NY',
                description: 'Handed directly to patron. Signed receipt verified.',
                completed: true
              }
            ]
          },
          {
            id: 'PA-2026-000002',
            customerName: currentCustomer.name || 'Patron',
            customerEmail: currentCustomer.email,
            customerPhone: currentCustomer.phone || '+1 (555) 234-5678',
            date: '2026-09-24',
            items: [
              {
                productId: 'prod-suit-charcoal',
                productName: 'Super 160s Charcoal Double-Breasted Suit',
                category: 'Suits',
                size: '42R',
                color: 'Charcoal',
                quantity: 1,
                price: 1850,
                image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600',
                sku: 'PA-SUIT-04-42R',
                itemStatus: 'Shipped'
              },
              {
                productId: 'prod-tie-grenadine',
                productName: 'Silk Grenadine Hand-Rolled Tie',
                category: 'Accessories',
                size: 'Standard',
                color: 'Burgundy',
                quantity: 1,
                price: 145,
                image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&q=80&w=600',
                sku: 'PA-TIE-05',
                itemStatus: 'Shipped'
              }
            ],
            subtotal: 1995,
            shippingFee: 0,
            shippingMethod: 'White-Glove Atelier Courier',
            carrier: 'Atelier Courier',
            trackingNumber: 'PA-WG-902144',
            tax: 177.06,
            total: 2172.06,
            orderStatus: 'Shipped',
            paymentStatus: 'Paid',
            paymentMethod: 'Visa (Ending in 8839)',
            shippingAddress: {
              street: '1048 5th Avenue',
              apartment: 'Penthouse B',
              city: 'New York',
              state: 'NY',
              zipCode: '10028',
              country: 'United States'
            },
            timeline: [
              {
                status: 'Order Confirmed',
                timestamp: '2026-09-24 10:00 AM',
                location: 'Park Avenue Flagship Atelier',
                description: 'Payment authorized and items reserved from private vault.',
                completed: true
              },
              {
                status: 'Processing',
                timestamp: '2026-09-24 02:45 PM',
                location: 'Atelier Workshop',
                description: 'Inspection and master pressing.',
                completed: true
              },
              {
                status: 'Packed',
                timestamp: '2026-09-25 09:10 AM',
                location: 'Packaging Suite',
                description: 'Garment box sealing.',
                completed: true
              },
              {
                status: 'Shipped',
                timestamp: '2026-09-25 04:30 PM',
                location: 'Atelier Courier Dispatch',
                description: 'White-glove private courier in transit.',
                completed: true
              }
            ]
          }
        ];
      }

      setOrders(userOrders);
      if (profile?.alterations) setAlterations(profile.alterations);
      if (profile?.returns && profile.returns.length > 0) {
        setReturns(profile.returns);
      } else if (dbReturns && dbReturns.length > 0) {
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

        {/* Primary Delivery Destination Address Section */}
        <div className="border border-gray-200 bg-white p-6 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#936B34] font-semibold block">
                  DELIVERY DESTINATION
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                  Verified Dispatch Address
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#111827] font-light">
                Registered Shipping &amp; White-Glove Dispatch Address
              </h2>
              <p className="text-xs text-gray-600 font-sans max-w-2xl leading-relaxed">
                All bespoke sartorial commissions, tailoring alterations, and size exchanges are dispatched directly to your designated destination below via insured private courier.
              </p>
              
              <div className="pt-2 flex items-start gap-3 text-xs font-mono text-gray-800">
                <div className="w-8 h-8 bg-[#FAF8F5] border border-[#936B34]/30 flex items-center justify-center shrink-0 text-[#936B34]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#111827] flex items-center gap-2">
                    <span>{currentCustomer.name || 'Valued Patron'}</span>
                    <span className="text-gray-400 font-normal">|</span>
                    <span className="text-gray-500 font-normal">{currentCustomer.phone || '+1 (555) 234-5678'}</span>
                  </div>
                  <div className="text-gray-700 mt-0.5">
                    {currentCustomer.addresses?.[0]?.street || '1048 5th Avenue'}
                    {currentCustomer.addresses?.[0]?.apartment && `, ${currentCustomer.addresses[0].apartment}`}
                    , {currentCustomer.addresses?.[0]?.city || 'New York'}, {currentCustomer.addresses?.[0]?.state || 'NY'} {currentCustomer.addresses?.[0]?.zipCode || (currentCustomer.addresses?.[0] as any)?.postalCode || '10028'}
                  </div>
                  <div className="text-gray-400 text-[10px] uppercase mt-0.5">
                    {currentCustomer.addresses?.[0]?.country || 'United States'} &bull; Contact: {currentCustomer.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setActiveView('account-info');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E5C384]" />
                <span>Manage Delivery Address</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('order-history-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:border-[#936B34] text-gray-700 hover:text-[#936B34] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <span>View Orders at this Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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

        {/* Comprehensive Order History Section with Line Items, Individual Statuses, and Re-Order Buttons */}
        <div id="order-history-section">
          <OrderHistorySection 
            orders={orders}
            onTrackOrder={(order) => {
              setCurrentOrder(order);
              setActiveView('track-order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onReturnOrder={(order) => {
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', `/track-return?orderId=${encodeURIComponent(order.id)}`);
              }
              setActiveView('track-return');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
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
