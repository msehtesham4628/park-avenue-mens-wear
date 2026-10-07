import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Truck, 
  Scissors, 
  Clock, 
  ArrowRight,
  ShoppingBag,
  Newspaper,
  Sparkles,
  Radio,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { navigateTo } from '../../utils/router';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    lookupOrder,
    lookupAlteration,
    setActiveView,
    navigateToProduct
  } = useShop();

  const [filterTab, setFilterTab] = useState<'all' | 'product' | 'news' | 'promotion' | 'orders'>('all');

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = async (notif: any) => {
    await markNotificationRead(notif.id);

    if (notif.orderId) {
      await lookupOrder(notif.orderId);
      setActiveView('track-order');
      setIsNotificationsOpen(false);
      return;
    } 
    
    if (notif.alterationId) {
      await lookupAlteration(notif.alterationId);
      setActiveView('track-alteration');
      setIsNotificationsOpen(false);
      return;
    }

    if (notif.productId) {
      navigateToProduct(notif.productId);
      setIsNotificationsOpen(false);
      return;
    }

    if (notif.link) {
      const cleanLink = notif.link.trim();
      if (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) {
        window.open(cleanLink, '_blank');
      } else {
        navigateTo(cleanLink);
      }
      setIsNotificationsOpen(false);
      return;
    }
  };

  const getCategoryBadge = (notif: any) => {
    const cat = notif.category || notif.type;
    switch (cat) {
      case 'product':
        return { label: 'GARMENT ALERT', color: 'bg-indigo-50 text-indigo-900 border-indigo-200', icon: ShoppingBag };
      case 'news':
        return { label: 'EDITORIAL JOURNAL', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: Newspaper };
      case 'promotion':
        return { label: 'VIP PRIVILEGE', color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: Sparkles };
      case 'shipment':
      case 'delivery':
      case 'order_update':
      case 'order':
        return { label: 'ORDER DISPATCH', color: 'bg-blue-50 text-blue-900 border-blue-200', icon: Truck };
      case 'alteration_update':
      case 'ready_for_pickup':
      case 'alteration':
        return { label: 'ATELIER FITTING', color: 'bg-amber-50 text-amber-900 border-amber-200', icon: Scissors };
      default:
        return { label: 'DISPATCH', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Radio };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'all') return true;
    const cat = n.category || n.type;
    if (filterTab === 'product') return cat === 'product';
    if (filterTab === 'news') return cat === 'news';
    if (filterTab === 'promotion') return cat === 'promotion';
    if (filterTab === 'orders') return cat === 'order' || cat === 'order_update' || cat === 'shipment' || cat === 'delivery' || cat === 'alteration' || cat === 'alteration_update';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationsOpen(false)}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto sm:pl-10 justify-end pointer-events-none">
        <div className="w-full sm:w-[440px] max-w-full bg-white border-l border-gray-200 shadow-2xl flex flex-col text-[#111827] h-full h-[100dvh] pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-[#FAF8F5] shrink-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="w-4 h-4 text-[#936B34] shrink-0" />
                <h2 className="font-serif text-base sm:text-lg text-[#111827] tracking-wide font-normal truncate">
                  Alerts &amp; Dispatches
                </h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#936B34] text-white text-[9px] font-mono font-bold shrink-0">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-gray-500 hover:text-[#936B34] transition-colors flex items-center gap-1 cursor-pointer font-mono whitespace-nowrap"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xs:inline sm:inline">Mark read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1.5 -mr-1 text-gray-500 hover:text-[#111827] hover:bg-black/5 rounded-xs transition-colors cursor-pointer"
                  aria-label="Close Alerts"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'product', label: 'Garments' },
                { id: 'news', label: 'Journal' },
                { id: 'promotion', label: 'VIP Privileges' },
                { id: 'orders', label: 'Orders' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border ${
                    filterTab === tab.id
                      ? 'border-[#936B34] bg-[#936B34] text-white font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-white">
            {filteredNotifications.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <div className="w-12 h-12 bg-[#FAF8F5] border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-[#936B34]">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="font-serif text-base text-[#111827]">No dispatches found</p>
                <p className="text-xs mt-1 text-gray-400 max-w-xs mx-auto">
                  Updates on new atelier garment drops, editorial journals, and orders will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badge = getCategoryBadge(notif);
                const BadgeIcon = badge.icon;
                const isHighPriority = notif.priority === 'high' || notif.priority === 'urgent';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-4 transition-all cursor-pointer border group relative ${
                      notif.read
                        ? 'bg-white border-gray-200 hover:border-[#936B34]/60 hover:bg-[#FAF8F5]'
                        : 'bg-[#FAF8F5] border-[#936B34]/50 shadow-2xs hover:border-[#936B34]'
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {!notif.read && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#936B34]" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-2.5 h-2.5 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                        {isHighPriority && (
                          <span className="text-[9px] font-mono text-[#936B34] font-bold uppercase tracking-wider shrink-0">
                            ● PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notif.id);
                          }}
                          className="p-1 -mr-0.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-xs transition-colors cursor-pointer shrink-0"
                          title="Close / Dismiss notification"
                          aria-label="Dismiss notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-[#111827] group-hover:text-[#936B34] transition-colors font-sans mb-1 break-words">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-gray-600 leading-relaxed font-sans mb-3 line-clamp-3 break-words">
                      {notif.message}
                    </p>

                    {/* Action link if available */}
                    {(notif.link || notif.productId || notif.orderId || notif.alterationId) && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-[#936B34] font-medium">
                        <span>
                          {notif.orderId ? `View Order #${notif.orderId}` :
                           notif.alterationId ? `View Alteration #${notif.alterationId}` :
                           notif.productId ? 'Explore Garment' : 'Explore Details'}
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-[#FAF8F5] border-t border-gray-200 text-center text-[10px] text-gray-500 font-mono shrink-0">
            <span>Park Avenue Atelier Dispatches &bull; Synchronized via Concierge Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};
