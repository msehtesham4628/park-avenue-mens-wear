import React from 'react';
import { X, Bell, CheckCheck, Truck, Scissors, Clock, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    lookupOrder,
    lookupAlteration,
    setActiveView
  } = useShop();

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = async (notif: any) => {
    await markNotificationRead(notif.id);
    if (notif.orderId) {
      await lookupOrder(notif.orderId);
      setActiveView('track-order');
      setIsNotificationsOpen(false);
    } else if (notif.alterationId) {
      await lookupAlteration(notif.alterationId);
      setActiveView('track-alteration');
      setIsNotificationsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment':
      case 'delivery':
        return <Truck className="w-4 h-4 text-[#8C6D3B]" />;
      case 'alteration_update':
      case 'ready_for_pickup':
        return <Scissors className="w-4 h-4 text-[#8C6D3B]" />;
      default:
        return <Clock className="w-4 h-4 text-[#8C6D3B]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-black/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-black/10 flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#8C6D3B]" />
              <h2 className="font-serif text-lg text-[#111111] tracking-wide">
                Client Dispatches & Updates
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#666666] hover:text-[#8C6D3B] transition-colors flex items-center gap-1 cursor-pointer font-mono"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 text-[#666666] hover:text-black transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/5 p-4 space-y-3 bg-white">
            {notifications.length === 0 ? (
              <div className="py-20 text-center text-[#666666]">
                <Bell className="w-8 h-8 text-[#8C6D3B]/40 mx-auto mb-3" />
                <p className="font-serif text-base text-[#111111]">No notifications</p>
                <p className="text-xs mt-1">Updates on your orders and alterations will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 transition-colors cursor-pointer border ${
                    notif.read
                      ? 'bg-white border-black/10 hover:bg-[#FAF9F6]'
                      : 'bg-[#FAF9F6] border-[#8C6D3B]/50 hover:border-[#8C6D3B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getIcon(notif.type)}
                      <h4 className="text-sm font-medium text-[#111111]">
                        {notif.title}
                      </h4>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8C6D3B] shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed mb-3 pl-6">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#888888] pl-6 font-mono">
                    <span>{notif.timestamp}</span>
                    {(notif.orderId || notif.alterationId) && (
                      <span className="text-[#8C6D3B] flex items-center gap-1 hover:underline">
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#FAF9F6] border-t border-black/10 text-center text-[11px] text-[#666666] font-mono">
            <span>Dispatch notifications are synchronized with SMS, Email, and WhatsApp.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
