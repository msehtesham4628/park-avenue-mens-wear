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
        return <Truck className="w-4 h-4 text-[#936B34]" />;
      case 'alteration_update':
      case 'ready_for_pickup':
        return <Scissors className="w-4 h-4 text-[#936B34]" />;
      default:
        return <Clock className="w-4 h-4 text-[#936B34]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col text-[#F8FAFC]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#F9F9F8]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#936B34]" />
              <h2 className="font-serif text-lg text-[#111827] tracking-wide">
                Client Dispatches &amp; Updates
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-gray-500 hover:text-[#936B34] transition-colors flex items-center gap-1 cursor-pointer font-mono"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-4 space-y-3 bg-white">
            {notifications.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <Bell className="w-8 h-8 text-[#936B34]/50 mx-auto mb-3" />
                <p className="font-serif text-base text-[#111827]">No notifications</p>
                <p className="text-xs mt-1 text-gray-500">Updates on your orders and alterations will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 transition-colors cursor-pointer border ${
                    notif.read
                      ? 'bg-white border-gray-200 hover:bg-[#F9F9F8]'
                      : 'bg-[#F9F9F8] border-[#936B34]/40 hover:border-[#936B34]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getIcon(notif.type)}
                      <h4 className="text-sm font-medium text-[#111827]">
                        {notif.title}
                      </h4>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#936B34] shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 pl-6">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pl-6 font-mono">
                    <span>{notif.timestamp}</span>
                    {(notif.orderId || notif.alterationId) && (
                      <span className="text-[#936B34] flex items-center gap-1 hover:underline">
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
          <div className="p-4 bg-[#F9F9F8] border-t border-gray-200 text-center text-[11px] text-gray-500 font-mono">
            <span>Dispatch notifications are synchronized with SMS, Email, and WhatsApp.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
