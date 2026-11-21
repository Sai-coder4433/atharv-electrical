import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Search,
  ArrowLeft,
  ShoppingBag,
  Store,
  Truck,
  ExternalLink,
  FileText,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { InvoiceModal } from './InvoiceModal';

export const OrderTrackingView: React.FC = () => {
  const { orders, setCustomerView, selectedOrderForTracking, authUser } = useApp();
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Filter orders for the user if authenticated
  const userOrders = authUser
    ? orders.filter(
        (o) =>
          o.userId === authUser.uid ||
          (o.customerEmail && authUser.email && o.customerEmail.toLowerCase() === authUser.email.toLowerCase())
      )
    : orders;

  const filteredOrders = userOrders.filter((o) => {
    if (searchOrderNumber.trim()) {
      const q = searchOrderNumber.toLowerCase();
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.awbCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Timeline Step Helper
  const getTimelineSteps = (order: Order) => {
    const current = order.status;
    const isCancelled = current === 'Cancelled';

    const baseSteps: { key: OrderStatus; label: string; desc: string }[] = [
      { key: 'Pending', label: 'Order Placed', desc: 'Order received & logged in system' },
      { key: 'Confirmed', label: 'Order Confirmed', desc: 'Payment verified & authorized' },
      { key: 'Processing', label: 'Packed at Depot', desc: 'Packed at Manik Chowk Showroom, Chakan' },
      { key: 'Shipped', label: 'Dispatched / In Transit', desc: order.courierPartner ? `Handed to ${order.courierPartner}` : 'Dispatched with express courier' },
      { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier agent on route to address' },
      { key: 'Delivered', label: 'Delivered', desc: 'Handed over to customer' },
    ];

    const statusWeight: Record<string, number> = {
      Pending: 1,
      Confirmed: 2,
      Processing: 3,
      Packed: 3,
      Shipped: 4,
      'Out for Delivery': 5,
      Delivered: 6,
      Completed: 6,
      Cancelled: -1,
    };

    const currentWeight = statusWeight[current] || 1;

    return baseSteps.map((step, idx) => {
      const stepWeight = idx + 1;
      const isDone = !isCancelled && currentWeight >= stepWeight;
      const isCurrent = !isCancelled && currentWeight === stepWeight;
      return {
        ...step,
        isDone,
        isCurrent,
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 pb-32">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <button
            onClick={() => setCustomerView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-heading text-2xl font-extrabold text-[#171717]">
            Live Order Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time fulfillment stages, courier AWB tracking, and GST tax invoices.
          </p>
        </div>

        {/* Order Number Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchOrderNumber}
            onChange={(e) => setSearchOrderNumber(e.target.value)}
            placeholder="Search Order / AWB..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-mono"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-gray-800">No Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders yet or no order matches your search query.
          </p>
          <button
            onClick={() => setCustomerView('shop')}
            className="mt-2 px-5 py-2.5 text-xs font-bold text-white bg-atharvay-gradient rounded-xl shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((ord) => {
            const steps = getTimelineSteps(ord);
            const isHighlighted = selectedOrderForTracking?.id === ord.id;

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-3xl border p-5 sm:p-7 shadow-xs space-y-6 transition-all ${
                  isHighlighted ? 'border-[#FF8A00] ring-2 ring-[#FF8A00]/20' : 'border-gray-200'
                }`}
              >
                {/* 1. Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Order ID</span>
                    <p className="font-mono font-bold text-base text-gray-900 mt-0.5">{ord.orderNumber}</p>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#FF6A00]" />
                      <span>
                        Placed on{' '}
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-[#168A45]'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ord.paymentStatus} · {ord.paymentMethod}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Delivered' || ord.status === 'Completed'
                          ? 'bg-green-100 text-[#168A45]'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-50 text-[#FF6A00]'
                      }`}
                    >
                      {ord.status}
                    </span>

                    {/* Tax Invoice Trigger */}
                    <button
                      onClick={() => {
                        setSelectedInvoiceOrder(ord);
                        setIsInvoiceOpen(true);
                      }}
                      className="px-3 py-1 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* 2. Visual Progress Timeline (Placed -> Confirmed -> Processing -> Shipped -> Out for Delivery -> Delivered) */}
                <div className="bg-[#FAF9F7] p-4 sm:p-6 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FF6A00]" />
                    <span>Fulfillment & Delivery Timeline</span>
                  </h4>

                  <div className="relative">
                    {/* Horizontal connector line on desktop */}
                    <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                      {steps.map((st, sIdx) => (
                        <div key={sIdx} className="flex flex-col items-start sm:items-center sm:text-center space-y-1.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              st.isDone
                                ? 'bg-[#168A45] text-white shadow-xs'
                                : st.isCurrent
                                ? 'bg-atharvay-gradient text-white ring-4 ring-orange-100 scale-110'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {st.isDone ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              st.isDone || st.isCurrent ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {st.label}
                          </span>
                          <p className="text-[10px] text-gray-500 leading-tight hidden sm:block">
                            {st.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Real Shiprocket AWB / Courier Live Tracking Banner */}
                {(ord.awbCode || ord.trackingNumber || ord.courierPartner) && (
                  <div className="p-4 bg-orange-50/70 border border-[#FFE0B2] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#168A45] animate-ping" />
                      <div>
                        <p className="font-bold text-gray-900">
                          Courier Partner: <span className="text-[#FF6A00]">{ord.courierPartner || 'Shiprocket Logistics'}</span>
                        </p>
                        {ord.awbCode && (
                          <p className="text-[11px] font-mono text-gray-600">
                            AWB Waybill Number: <strong>{ord.awbCode}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {ord.awbCode && (
                      <a
                        href={`https://shiprocket.co/tracking/${ord.awbCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Live Shiprocket Tracking</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* 4. Purchased Items with Color Variants */}
                <div className="divide-y divide-gray-100">
                  <span className="text-[11px] uppercase font-bold text-gray-400 block pb-2">
                    Items in Shipment ({ord.items.length})
                  </span>
                  {ord.items.map((item, idx) => {
                    const colorName =
                      item.selectedColor ||
                      item.selectedVariants?.['Color'] ||
                      Object.values(item.selectedVariants || {})[0];
                    return (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              item.variantImage ||
                              item.product.mainImage ||
                              (item.product.images && item.product.images[0]) ||
                              '/assets/images/hero_fan_bldc_1790620359971.jpg'
                            }
                            alt={item.product.name}
                            className="w-12 h-12 object-contain rounded-xl border border-gray-200 p-1 bg-white shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/hero_fan_bldc_1790620359971.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{item.product.name}</p>
                            <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 mt-0.5 flex-wrap">
                              <span>Brand: {item.product.brand}</span>
                              {colorName && (
                                <>
                                  <span>·</span>
                                  <span className="font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.2 rounded">
                                    Color: {colorName}
                                  </span>
                                </>
                              )}
                              <span>·</span>
                              <span>SKU: {item.variantSku || item.product.sku}</span>
                              <span>·</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-bold text-gray-900 shrink-0 font-mono">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 5. Delivery Address & Store Dispatch Footnote */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Delivery Destination:
                    </span>
                    <p className="font-bold text-gray-900">
                      {ord.deliveryAddress?.fullName || ord.customerName}
                    </p>
                    <p className="text-gray-600 leading-tight">
                      {ord.deliveryAddress?.houseBuilding}, {ord.deliveryAddress?.street},{' '}
                      {ord.deliveryAddress?.city} - {ord.deliveryAddress?.pincode}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Contact: +91 {ord.deliveryAddress?.mobile || ord.customerPhone}
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Total Invoice Amount:
                    </span>
                    <p className="font-extrabold text-xl text-[#FF6A00] font-mono">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Inclusive of all taxes & GST
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedInvoiceOrder(null);
        }}
      />
    </div>
  );
};
