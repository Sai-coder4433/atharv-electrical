import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  RotateCcw,
  Truck,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminFinancials: React.FC = () => {
  const { orders, products, payments } = useApp();

  const [dateFilter, setDateFilter] = useState<string>('this_month');

  // Filter orders by date
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      if (isNaN(t)) return true;
      if (dateFilter === 'today') return t >= todayStart;
      if (dateFilter === '7days') return t >= todayStart - 7 * oneDayMs;
      if (dateFilter === '30days') return t >= todayStart - 30 * oneDayMs;
      if (dateFilter === 'this_month') {
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return t >= mStart;
      }
      return true;
    });
  }, [orders, dateFilter]);

  // Aggregate Financial Figures
  const grossBilledAmount = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const totalDiscounts = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  }, [filteredOrders]);

  const totalDeliveryCharges = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
  }, [filteredOrders]);

  const totalRefunds = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === 'Refunded')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const netRealizedSales = Math.max(0, grossBilledAmount - totalDiscounts - totalRefunds);
  const gstLiability = Math.round((netRealizedSales * 18) / 118);

  // Compute Cost of Goods Sold (COGS) & Gross Profit
  const { totalCOGS, estimatedGrossProfit, marginPercent } = useMemo(() => {
    let cogs = 0;
    let profit = 0;

    filteredOrders.forEach((ord) => {
      if (ord.paymentStatus === 'Refunded' || ord.status === 'Cancelled') return;
      (ord.items || []).forEach((item) => {
        const prod = products.find((p) => p.id === (item.product?.id || item.id));
        const sellPrice = item.unitPrice || prod?.sellingPrice || 0;
        const purchaseCost = prod?.purchasePrice || Math.round(sellPrice * 0.72);
        const qty = item.quantity || 1;

        cogs += purchaseCost * qty;
        profit += (sellPrice - purchaseCost) * qty;
      });
    });

    const margin = netRealizedSales > 0 ? ((profit / netRealizedSales) * 100).toFixed(1) : '0.0';
    return { totalCOGS: cogs, estimatedGrossProfit: profit, marginPercent: margin };
  }, [filteredOrders, products, netRealizedSales]);

  // Payment method distribution
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredOrders.forEach((o) => {
      const m = o.paymentMethod || 'Cash on Delivery';
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += (o.totalAmount || 0);
    });
    return Object.entries(map).map(([method, data]) => ({ method, ...data }));
  }, [filteredOrders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
            ATHARV ELECTRICAL · Financial Controller
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Profit & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Cost of goods sold (COGS), product-level margins, GST liability, discounts, refunds and net realized profit.
          </p>
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-xs font-bold py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="this_month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Primary Financial Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Gross Billed</span>
          <p className="text-2xl font-extrabold text-gray-900">₹{grossBilledAmount.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-500">Total invoice total</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] block">Estimated COGS</span>
          <p className="text-2xl font-extrabold text-gray-900">₹{totalCOGS.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-500">Procurement purchase cost</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Estimated Gross Profit</span>
          <p className="text-2xl font-extrabold text-emerald-700">₹{estimatedGrossProfit.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Margin: ~{marginPercent}%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">Net Realized Sales</span>
          <p className="text-2xl font-extrabold text-blue-800">₹{netRealizedSales.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-gray-500">After discounts & refunds</span>
        </div>
      </div>

      {/* Tax & Deductions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">GST Collected (18%)</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">₹{gstLiability.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">Government indirect tax component included in retail sales.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Discounts Absorbed</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">₹{totalDiscounts.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">Coupons and promotional concessions given to customers.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-red-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-900">Total Refunds</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">₹{totalRefunds.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">Reversals processed back to original customer payment methods.</p>
        </div>
      </div>

      {/* Payment Gateway Settlement Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">Payment Gateway Reconciliation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentBreakdown.map((pb) => (
            <div key={pb.method} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">{pb.method}</span>
              <p className="text-xl font-extrabold text-gray-900">₹{pb.total.toLocaleString('en-IN')}</p>
              <span className="text-xs text-gray-500">{pb.count} verified transactions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
