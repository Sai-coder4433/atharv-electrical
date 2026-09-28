import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Search,
  ArrowLeft,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    setCustomerView,
  } = useApp();

  const [searchOrderNumber, setSearchOrderNumber] = useState('');

  // Default to selected order, or most recent order
  const activeOrder: Order | undefined =
    selectedOrderForTracking || (orders.length > 0 ? orders[0] : undefined);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === searchOrderNumber.trim().toUpperCase() ||
        o.id === searchOrderNumber.trim()
    );
    if (found) {
      setSelectedOrderForTracking(found);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <button
            onClick={() => setCustomerView('orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#171717] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <h1 className="font-heading text-2xl font-extrabold text-[#171717]">
            Live Order Tracking
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Real-time fulfillment updates from ATHARV ELECTRICAL Chakan warehouse.
          </p>
        </div>

        {/* Order Number Search Bar */}
        <form onSubmit={handleSearchOrder} className="flex gap-2">
          <input
            type="text"
            value={searchOrderNumber}
            onChange={(e) => setSearchOrderNumber(e.target.value)}
            placeholder="Search Order (e.g. AE20260928001)"
            className="text-xs px-3.5 py-2 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none uppercase font-mono w-48 sm:w-60"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#171717] rounded-lg hover:bg-black flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {!activeOrder ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#666666]">No order selected to track.</p>
          <button
            onClick={() => setCustomerView('shop')}
            className="mt-3 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-lg"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#929292]">
                  Order ID
                </span>
                <h2 className="font-mono text-base font-bold text-[#171717]">
                  {activeOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#666666]">
                  Placed on {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#929292]">
                  Current Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      activeOrder.status === 'Delivered'
                        ? 'bg-green-100 text-[#168A45]'
                        : activeOrder.status === 'Cancelled'
                        ? 'bg-red-100 text-[#D92D20]'
                        : 'bg-[#FFF3E6] text-[#FF6A00]'
                    }`}
                  >
                    {activeOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Courier & Transit Details */}
            {activeOrder.courierPartner && (
              <div className="mt-4 p-3 bg-[#F8F8F7] rounded-xl border border-[#EAEAEA] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-[#FF6A00]" />
                  <div>
                    <span className="font-semibold text-[#171717]">{activeOrder.courierPartner}</span>
                    <p className="text-[11px] text-[#666666]">AWB Tracking: <strong className="font-mono text-[#171717]">{activeOrder.trackingNumber}</strong></p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[11px] text-[#666666]">
                  <span>Estimated Delivery Date:</span>
                  <p className="font-bold text-[#168A45]">{activeOrder.estimatedDelivery}</p>
                </div>
              </div>
            )}

            {/* Step Timeline */}
            <div className="mt-8 px-2 sm:px-6">
              <div className="relative">
                {activeOrder.timeline.map((step, idx) => {
                  const isLast = idx === activeOrder.timeline.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-4 pb-8 last:pb-0">
                      {/* Vertical line connector */}
                      {!isLast && (
                        <div
                          className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                            step.completed ? 'bg-[#FF6A00]' : 'bg-[#EAEAEA]'
                          }`}
                        />
                      )}

                      {/* Icon Node */}
                      <div
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          step.completed
                            ? 'bg-[#168A45] text-white shadow-xs'
                            : step.current
                            ? 'bg-atharvay-gradient text-white ring-4 ring-[#FFF3E6]'
                            : 'bg-[#F8F8F7] border border-[#EAEAEA] text-[#929292]'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : step.current ? (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#D4D4D4]" />
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 -mt-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <h4
                            className={`text-xs font-bold ${
                              step.completed || step.current
                                ? 'text-[#171717]'
                                : 'text-[#929292]'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {step.timestamp && (
                            <span className="text-[11px] text-[#929292]">
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                        {step.notes && (
                          <p className="text-[11px] text-[#FF6A00] mt-0.5 font-medium">
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Address & Order Items Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-xs font-bold text-[#171717]">
                <MapPin className="w-4 h-4 text-[#FF6A00]" />
                <span>Delivery Address</span>
              </div>
              <div className="text-xs text-[#666666] mt-3 space-y-1">
                <p className="font-bold text-[#171717]">{activeOrder.deliveryAddress.fullName}</p>
                <p>{activeOrder.deliveryAddress.houseBuilding}, {activeOrder.deliveryAddress.street}</p>
                <p>{activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state} - {activeOrder.deliveryAddress.pincode}</p>
                <p className="font-medium text-[#171717] pt-1">Phone: +91 {activeOrder.deliveryAddress.mobile}</p>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA] text-xs font-bold text-[#171717]">
                <Package className="w-4 h-4 text-[#FF6A00]" />
                <span>Package Contents ({activeOrder.items.length} products)</span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-44 overflow-y-auto">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <p className="font-semibold text-[#171717] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#666666]">
                        Qty: {item.quantity} · {item.product.brand}
                      </p>
                    </div>
                    <span className="font-bold text-[#171717] tabular-nums shrink-0">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#EAEAEA] flex justify-between text-xs font-bold text-[#171717]">
                <span>Total Paid ({activeOrder.paymentMethod}):</span>
                <span>₹{activeOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Need Assistance */}
          <div className="p-4 bg-[#FFFCF9] border border-[#FFE0B2] rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#171717]">Questions regarding your consignment?</span>
              <p className="text-[11px] text-[#666666]">Our Chakan showroom team is here to assist with dispatch & tracking.</p>
            </div>
            <a
              href="tel:+917720036820"
              className="px-3.5 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-[#171717] font-bold text-xs flex items-center gap-1.5 hover:border-[#FF6A00]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
