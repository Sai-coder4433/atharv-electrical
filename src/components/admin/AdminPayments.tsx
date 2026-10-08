import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, DollarSign, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminPayments: React.FC = () => {
  const { payments, orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Combined payment records from payments collection and orders with payments
  const orderPayments = orders
    .filter((o) => o.paymentStatus === 'Paid' || o.razorpayPaymentId)
    .map((o) => ({
      id: o.razorpayPaymentId || `pay_${o.id}`,
      orderId: o.orderNumber,
      razorpayOrderId: o.razorpayOrderId || `order_${o.id}`,
      razorpayPaymentId: o.razorpayPaymentId || `pay_${o.id}`,
      amount: o.totalAmount,
      currency: 'INR',
      status: o.paymentStatus as any,
      method: o.paymentMethod,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      createdAt: o.createdAt,
    }));

  const allPayments = [...payments, ...orderPayments].filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const filtered = allPayments.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.razorpayPaymentId?.toLowerCase().includes(q) ||
        p.orderId?.toLowerCase().includes(q) ||
        p.customerPhone?.includes(q) ||
        p.customerEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCapturedRevenue = allPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Razorpay Payment Records
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit server-verified Razorpay transactions and settlements.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-50 text-[#168A45] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Verified Paid</span>
            <span className="text-sm font-extrabold text-gray-900">
              ₹{totalCapturedRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Payment ID, Order ID or Contact..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Contact</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No payment logs recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {pay.razorpayPaymentId || pay.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {pay.orderId || 'Direct'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <p>{pay.customerPhone || 'N/A'}</p>
                      <p className="text-[11px] text-gray-400">{pay.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                        {pay.method || 'Razorpay'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === 'Paid'
                            ? 'bg-green-100 text-[#168A45]'
                            : pay.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(pay.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
