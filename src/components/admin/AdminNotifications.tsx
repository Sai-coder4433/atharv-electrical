import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  UserPlus,
  XCircle,
  RotateCcw,
  Truck,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminNotification } from '../../types';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setSelectedOrderForTracking,
    setAdminView,
    orders,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order_created':
        return <ShoppingBag className="w-4 h-4 text-[#FF6A00]" />;
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-[#168A45]" />;
      case 'payment_failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'customer_registered':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'order_cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refund_requested':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'shipment_delivered':
        return <Truck className="w-4 h-4 text-[#168A45]" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleAction = (n: AdminNotification) => {
    markNotificationAsRead(n.id);
    if (n.relatedType === 'order' && n.relatedId) {
      const match = orders.find((o) => o.id === n.relatedId);
      if (match) {
        setSelectedOrderForTracking(match);
        setAdminView('orders');
      }
    } else if (n.relatedType === 'product') {
      setAdminView('products');
    } else if (n.relatedType === 'customer') {
      setAdminView('crm');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              ATHARV ELECTRICAL · System Alerts
            </span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Business Notification Centre
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time triggers for incoming orders, payments, inventory alerts, and customer activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-2">
            <Bell className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No notifications to display.</p>
            <p className="text-[11px] text-gray-400">All business alerts and operational updates will appear here.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleAction(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-white border-[#FFB000] shadow-xs'
                  : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{n.description}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(n.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
