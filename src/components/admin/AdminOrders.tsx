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
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Ban,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { InvoiceModal } from '../customer/InvoiceModal';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, processOrderRefund, setAdminView, authUser, showToast } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Request / Order Cancellation');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

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
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleRefundSubmit = async () => {
    if (!selectedOrder) return;
    setIsProcessingRefund(true);
    try {
      const paymentId = selectedOrder.cashfreePaymentId || selectedOrder.razorpayPaymentId || `pay_${selectedOrder.id}`;
      await processOrderRefund(selectedOrder.id, paymentId, selectedOrder.totalAmount, refundReason);
      setIsRefundModalOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      showToast(err.message || 'Refund processing failed', 'error');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Order Management System
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process customer orders, review Cashfree payment records, and trigger Shiprocket dispatches.
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
            placeholder="Search Order ID, Customer Name, Email or Phone..."
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
              {st} {st !== 'ALL' && `(${orders.filter((o) => o.status === st).length})`}
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
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No orders received yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                      Customer orders placed on the storefront or via Cashfree checkout will appear here in real time.
                    </p>
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
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                      {(ord.items || []).map((i) => `${i.product?.name || 'Item'} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-[#168A45]'
                            : ord.paymentStatus === 'Refunded'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.paymentStatus} · {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
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
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs inline-flex items-center gap-1"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal with Audit Trail & Full Actions */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Order Management Dossier
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Bar (Confirm, Process, Ship, Cancel, Refund) */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Workflow Actions
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#171717] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Official Tax Invoice</span>
                </button>
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#F4511E] text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Order</span>
                  </button>
                )}
                {selectedOrder.status === 'Confirmed' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Processing')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Start Processing</span>
                  </button>
                )}
                {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setAdminView('shipping');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Create Shiprocket Shipment</span>
                  </button>
                )}
                {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Completed')}
                    className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed / Delivered</span>
                  </button>
                )}
                {selectedOrder.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}
                {selectedOrder.paymentStatus === 'Paid' && (
                  <button
                    onClick={() => setIsRefundModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Initiate Refund</span>
                  </button>
                )}
              </div>
            </div>

            {/* Payment & Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Payment Verification</span>
                <p className="font-bold text-gray-900">
                  {selectedOrder.paymentMethod} ·{' '}
                  <span
                    className={
                      selectedOrder.paymentStatus === 'Paid'
                        ? 'text-green-600'
                        : selectedOrder.paymentStatus === 'Refunded'
                        ? 'text-purple-600'
                        : 'text-amber-600'
                    }
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
                {selectedOrder.cashfreePaymentId && (
                  <p className="text-[10px] text-gray-500 font-mono">CF Payment ID: {selectedOrder.cashfreePaymentId}</p>
                )}
                {selectedOrder.cashfreeOrderId && (
                  <p className="text-[10px] text-gray-500 font-mono">CF Order ID: {selectedOrder.cashfreeOrderId}</p>
                )}
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Logistics Status</span>
                <p className="font-bold text-gray-900">
                  Shipment: <span className="text-[#FF6A00]">{selectedOrder.shippingStatus || 'Not Booked'}</span>
                </p>
                {selectedOrder.awbCode ? (
                  <p className="text-[10px] text-gray-500 font-mono">AWB: {selectedOrder.awbCode} ({selectedOrder.courierPartner})</p>
                ) : (
                  <p className="text-[10px] text-gray-400">Ready for booking at Manik Chowk pickup</p>
                )}
              </div>
            </div>

            {/* Customer Information */}
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

            {/* Delivery Address */}
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

            {/* Store Fulfillment Location */}
            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center gap-2 text-xs text-gray-700">
              <Store className="w-4 h-4 text-[#FF6A00] shrink-0" />
              <span>
                Fulfillment Showroom: <strong>ATHARV ELECTRICAL · Manik Chowk, Chakan, India</strong>
              </span>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.mainImage || (item.product?.images && item.product.images[0]) || '/assets/images/hero_fan_bldc_1790620359971.jpg'}
                        alt={item.product?.name || 'Item'}
                        className="w-10 h-10 object-contain rounded-lg border p-1 bg-white shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product?.name || 'Item'}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          SKU: {item.product?.sku || 'N/A'} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-gray-400">₹{item.unitPrice} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN') || 0}</span>
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
                <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            {/* Order Activity Timeline ("WHO DID WHAT?") */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6A00]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Order Activity History & Audit Trail
                </h4>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                {/* Initial placement event */}
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      Order Placed by {selectedOrder.customerName}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Customer initiated order with payment method {selectedOrder.paymentMethod}.
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Logged Activities */}
                {(selectedOrder.activities || []).map((act, i) => (
                  <div key={act.id || i} className="flex items-start gap-3 text-xs pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {i + 2}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {act.action} · <span className="text-gray-500 font-normal">by {act.actorName}</span>
                      </p>
                      <p className="text-gray-600 text-[11px]">{act.description}</p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(act.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-700">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-base text-gray-900">Initiate Cashfree Refund</h3>
            </div>
            <p className="text-xs text-gray-600">
              Process a full refund of <strong>₹{selectedOrder.totalAmount}</strong> for Order #{selectedOrder.orderNumber} to customer {selectedOrder.customerName}.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700">Refund Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                placeholder="Reason for refunding transaction..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={isProcessingRefund}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isProcessingRefund ? 'Processing...' : 'Confirm & Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        order={selectedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
