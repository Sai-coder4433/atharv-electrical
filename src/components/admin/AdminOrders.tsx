import React, { useState } from 'react';
import {
  Search,
  Eye,
  CheckCircle2,
  X,
  Clock,
  PhoneCall,
  Mail,
  MapPin,
  Store,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, storeSettings } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Simplified allowed order statuses as required in Section 22
  const allowedStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Completed',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchCust = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.includes(q);
      if (!matchNum && !matchCust && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process customer orders, update statuses, and view invoice amounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Customer Name or Phone..."
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', ...allowedStatuses].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{ord.customerName}</p>
                      <p className="text-[11px] text-gray-500">{ord.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[220px] truncate">
                      {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-[#168A45]'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.paymentStatus} · {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                          ord.status === 'Completed'
                            ? 'bg-green-50 border-green-200 text-[#168A45]'
                            : ord.status === 'Cancelled'
                            ? 'bg-red-50 border-red-200 text-[#D92D20]'
                            : 'bg-orange-50 border-orange-200 text-[#FF6A00]'
                        }`}
                      >
                        {allowedStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        title="View Full Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal (Section 23) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Order Details Record
                </span>
                <h3 className="text-base font-bold text-gray-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Payment Bar */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                    setSelectedOrder((prev) => (prev ? { ...prev, status: e.target.value as OrderStatus } : null));
                  }}
                  className="font-bold py-1 px-2.5 rounded-lg border bg-white text-gray-900"
                >
                  {allowedStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">Payment:</span>
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    selectedOrder.paymentStatus === 'Paid'
                      ? 'bg-green-100 text-[#168A45]'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                </span>
              </div>
            </div>

            {/* Customer Information (Section 23) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-2xl text-xs border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[11px]">Customer Name</span>
                  <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Phone Number</span>
                  <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-[#FF6A00]" />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Email</span>
                  <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-[#FF6A00]" />
                    <span>{selectedOrder.customerEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Address */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Customer Delivery Address
              </h4>
              <div className="p-3.5 bg-gray-50 rounded-2xl text-xs border border-gray-200 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedOrder.deliveryAddress.houseBuilding}, {selectedOrder.deliveryAddress.street}
                  </p>
                  <p className="text-gray-600">
                    {selectedOrder.deliveryAddress.area}, {selectedOrder.deliveryAddress.city} —{' '}
                    {selectedOrder.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Location (Section 23 & 45: Manik Chowk, Chakan, India) */}
            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center gap-2 text-xs text-gray-700">
              <Store className="w-4 h-4 text-[#FF6A00] shrink-0" />
              <span>
                Fulfilling Store Location: <strong>Manik Chowk, Chakan, India</strong>
              </span>
            </div>

            {/* Order Items (Product, Variant, Quantity, Price) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.mainImage || item.product.images[0]}
                        alt={item.product.name}
                        className="w-10 h-10 object-contain rounded-lg border p-1 bg-white shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          SKU: {item.product.sku} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-gray-400">₹{item.unitPrice} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#168A45] font-semibold">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                <span>Total Amount</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
