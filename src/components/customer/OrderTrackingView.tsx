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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const OrderTrackingView: React.FC = () => {
  const { orders, setCustomerView } = useApp();
  const [searchOrderNumber, setSearchOrderNumber] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (searchOrderNumber.trim()) {
      const q = searchOrderNumber.toLowerCase();
      return o.orderNumber?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <button
            onClick={() => setCustomerView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-heading text-2xl font-extrabold text-[#171717]">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View your purchase history, invoices, and fulfillment statuses.
          </p>
        </div>

        {/* Order Number Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchOrderNumber}
            onChange={(e) => setSearchOrderNumber(e.target.value)}
            placeholder="Search Order Number..."
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
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Order Card Header: Order ID, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Order ID</span>
                  <p className="font-mono font-bold text-sm text-gray-900 mt-0.5">{ord.orderNumber}</p>
                  <span className="text-[11px] text-gray-400">
                    Placed on{' '}
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ord.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-[#168A45]'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {ord.paymentStatus} · {ord.paymentMethod}
                  </span>

                  {/* Simple status: Order Placed, Confirmed, Processing, Completed (Section 24) */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ord.status === 'Completed'
                        ? 'bg-green-100 text-[#168A45]'
                        : ord.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-50 text-[#FF6A00]'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.mainImage || item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain rounded-xl border p-1 bg-white shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          SKU: {item.product.sku} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-gray-900">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Store Location & Total */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <Store className="w-4 h-4 text-[#FF6A00]" />
                  <span>
                    Fulfillment Depot: <strong>Manik Chowk, Chakan, India</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-gray-500 mr-2">Total Amount:</span>
                  <span className="font-extrabold text-base text-gray-900">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
