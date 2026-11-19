import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  RotateCcw,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';

export const AdminPayments: React.FC = () => {
  const { payments, orders, processOrderRefund, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Pending' | 'Failed' | 'Refunded'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Refund state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Return / Order Cancellation');
  const [isRefunding, setIsRefunding] = useState(false);

  // Aggregate payment records from Firestore payments collection + verified orders
  const orderPayments: PaymentRecord[] = orders
    .filter((o) => o.paymentStatus || o.cashfreePaymentId || o.razorpayPaymentId)
    .map((o) => ({
      id: o.cashfreePaymentId || o.razorpayPaymentId || `pay_${o.id}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      cashfreeOrderId: o.cashfreeOrderId,
      cashfreePaymentId: o.cashfreePaymentId,
      amount: o.totalAmount,
      currency: 'INR',
      status: (o.paymentStatus === 'Paid' ? 'Paid' : o.paymentStatus === 'Failed' ? 'Failed' : 'Pending') as any,
      method: o.paymentMethod,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      createdAt: o.createdAt,
    }));

  const allPayments: PaymentRecord[] = [...payments, ...orderPayments].filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const filtered = allPayments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.id?.toLowerCase().includes(q) || p.cashfreePaymentId?.toLowerCase().includes(q);
      const matchOrder = p.orderNumber?.toLowerCase().includes(q) || p.orderId?.toLowerCase().includes(q);
      const matchPhone = p.customerPhone?.includes(q);
      const matchEmail = p.customerEmail?.toLowerCase().includes(q);
      const matchName = p.customerName?.toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchPhone && !matchEmail && !matchName) return false;
    }
    return true;
  });

  const totalPaidRevenue = allPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefundedAmount = allPayments
    .filter((p) => p.status === 'Refunded')
    .reduce((sum, p) => sum + (p.refundAmount || p.amount), 0);

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setIsRefunding(true);
    try {
      await processOrderRefund(
        selectedPayment.orderId || selectedPayment.id,
        selectedPayment.id,
        selectedPayment.amount,
        refundReason
      );
      setIsRefundModalOpen(false);
      setSelectedPayment(null);
    } catch (err: any) {
      showToast(err.message || 'Refund processing failed', 'error');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Cashfree Payment Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit server-verified Cashfree gateway transactions, settlements, and initiate eligible refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Verified Collections</span>
            <span className="text-sm font-extrabold text-green-700">
              ₹{totalPaidRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          {totalRefundedAmount > 0 && (
            <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Refunds</span>
              <span className="text-sm font-extrabold text-purple-700">
                ₹{totalRefundedAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Cashfree Payment ID, Order ID or Customer..."
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'Paid', 'Pending', 'Failed', 'Refunded'] as const).map((st) => (
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

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Transaction / Payment ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Contact</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No payment transactions recorded yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                      Transactions processed through Cashfree Payments will appear here with instant server verification.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {p.cashfreePaymentId || p.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {p.orderNumber || p.orderId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{p.customerName || 'Customer'}</p>
                      <p className="text-[10px] text-gray-400">{p.customerPhone || p.customerEmail || '—'}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {p.method}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 font-mono tabular-nums">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Paid'
                            ? 'bg-green-100 text-[#168A45]'
                            : p.status === 'Refunded'
                            ? 'bg-purple-100 text-purple-700'
                            : p.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Inspection Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                  Payment Verification Dossier
                </span>
                <h3 className="font-bold text-base text-gray-900 font-mono">
                  {selectedPayment.cashfreePaymentId || selectedPayment.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Status:</span>
                  <span className="font-bold text-green-700">{selectedPayment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway Provider:</span>
                  <span className="font-bold text-gray-900">Cashfree Payments India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Amount:</span>
                  <span className="font-bold text-gray-900 font-mono">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-bold text-gray-900">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedPayment.orderNumber || selectedPayment.orderId}</span>
                </div>
              </div>

              {selectedPayment.status === 'Paid' && (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 block">Eligible for Refund</span>
                    <span className="text-[10px] text-purple-700">Amount will be credited back via original source</span>
                  </div>
                  <button
                    onClick={() => setIsRefundModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Refund
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-700">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-base text-gray-900">Process Cashfree Refund</h3>
            </div>
            <p className="text-xs text-gray-600">
              Process full refund of <strong>₹{selectedPayment.amount}</strong> for transaction <code>{selectedPayment.id}</code>.
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
                onClick={handleRefund}
                disabled={isRefunding}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : 'Confirm & Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
