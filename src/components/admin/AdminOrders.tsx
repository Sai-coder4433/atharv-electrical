import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  Truck,
  MapPin,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
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
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process incoming orders, track dispatches, and update delivery timelines.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer or phone..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            'ALL',
            'Pending',
            'Confirmed',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status & Update</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{ord.customerName}</p>
                      <p className="text-[11px] text-gray-500">{ord.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                      {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentStatus === 'Paid' ? 'bg-green-100 text-[#168A45]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
                          ord.status === 'Delivered'
                            ? 'bg-green-50 border-green-200 text-[#168A45]'
                            : ord.status === 'Cancelled'
                            ? 'bg-red-50 border-red-200 text-[#D92D20]'
                            : 'bg-orange-50 border-orange-200 text-[#FF6A00]'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        title="View Full Order Record"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Order Details — {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Created on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="my-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">Update Fulfillment:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                  setSelectedOrder({ ...selectedOrder, status: e.target.value as OrderStatus });
                }}
                className="font-bold py-1 px-3 rounded-lg border border-gray-300 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Customer Info</span>
                <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-gray-600">Phone: +91 {selectedOrder.deliveryAddress.mobile}</p>
                <p className="text-gray-600">{selectedOrder.customerEmail}</p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Shipping Destination</span>
                <p className="text-gray-600">
                  {selectedOrder.deliveryAddress.houseBuilding}, {selectedOrder.deliveryAddress.street}<br />
                  {selectedOrder.deliveryAddress.area}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-bold text-gray-900">{item.product.name}</p>
                      <p className="text-gray-500 text-[11px]">
                        Brand: {item.product.brand} · Qty: {item.quantity} · Unit Price: ₹{item.unitPrice}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
              <span>Total Bill Amount ({selectedOrder.paymentMethod}):</span>
              <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
