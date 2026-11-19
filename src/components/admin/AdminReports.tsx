import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminReports: React.FC = () => {
  const { orders, products, categories } = useApp();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS' | 'THIS_MONTH'>('ALL');

  // Filtered orders based on selected date range
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'ALL') return orders;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const ordTime = new Date(o.createdAt).getTime();
      if (dateFilter === 'TODAY') {
        return ordTime >= todayStart;
      }
      if (dateFilter === 'YESTERDAY') {
        return ordTime >= yesterdayStart && ordTime < todayStart;
      }
      if (dateFilter === '7DAYS') {
        return ordTime >= Date.now() - 7 * 24 * 60 * 60 * 1000;
      }
      if (dateFilter === '30DAYS') {
        return ordTime >= Date.now() - 30 * 24 * 60 * 60 * 1000;
      }
      if (dateFilter === 'THIS_MONTH') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return ordTime >= monthStart;
      }
      return true;
    });
  }, [orders, dateFilter]);

  // Aggregate Metrics based on real Firestore orders
  const grossTurnover = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const deliveryCollected = filteredOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
  const netRevenue = grossTurnover; // Actual captured revenue
  const totalOrdersCount = filteredOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(grossTurnover / totalOrdersCount) : 0;

  const totalUnitsSold = filteredOrders.reduce(
    (sum, o) => sum + (o.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 1), 0),
    0
  );

  // Category-wise performance from real orders
  const categorySales = useMemo(() => {
    const map = new Map<string, { name: string; units: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.product?.categoryName || 'General';
        if (!map.has(cat)) {
          map.set(cat, { name: cat, units: 0, revenue: 0 });
        }
        const entry = map.get(cat)!;
        entry.units += item.quantity || 1;
        entry.revenue += (item.unitPrice || 0) * (item.quantity || 1);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Product-wise performance from real orders
  const productPerformance = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sku: string; brand: string; units: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const pId = item.product?.id || 'unknown';
        if (!map.has(pId)) {
          map.set(pId, {
            id: pId,
            name: item.product?.name || 'Product',
            sku: item.product?.sku || 'N/A',
            brand: item.product?.brand || 'N/A',
            units: 0,
            revenue: 0,
          });
        }
        const entry = map.get(pId)!;
        entry.units += item.quantity || 1;
        entry.revenue += (item.unitPrice || 0) * (item.quantity || 1);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // CSV Exporters
  const downloadCSV = (content: string, filename: string) => {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'Payment Method', 'Payment Status', 'Order Status', 'Total Amount'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString('en-IN'),
      `"${o.customerName || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.paymentMethod || ''}"`,
      o.paymentStatus,
      o.status,
      o.totalAmount,
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), `atharv_orders_report_${dateFilter.toLowerCase()}.csv`);
  };

  const exportProductPerformanceCSV = () => {
    if (productPerformance.length === 0) return;
    const headers = ['Product Name', 'SKU', 'Brand', 'Units Sold', 'Total Revenue (INR)'];
    const rows = productPerformance.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.brand}"`,
      p.units,
      p.revenue,
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), `atharv_product_performance_${dateFilter.toLowerCase()}.csv`);
  };

  const exportInventoryCSV = () => {
    if (products.length === 0) return;
    const headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Selling Price (INR)', 'Stock Available', 'Low Stock Limit', 'Status'];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.categoryName || ''}"`,
      `"${p.brand}"`,
      p.sellingPrice,
      p.stock,
      p.lowStockThreshold,
      p.status || (p.stock > 0 ? 'Active' : 'Out of Stock'),
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), `atharv_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF6A00] rounded-full text-[11px] font-bold mb-1.5 border border-orange-100">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audited Business Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time turnover, margin analytics, order frequency, and inventory valuation.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-xs focus:outline-none focus:border-[#FF6A00]"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="7DAYS">Past 7 Days</option>
            <option value="30DAYS">Past 30 Days</option>
            <option value="THIS_MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Gross Sales</span>
          <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
            ₹{grossTurnover.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 block">Total order value processed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Orders</span>
          <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
            {totalOrdersCount}
          </div>
          <span className="text-[10px] text-gray-400 block">{totalUnitsSold} items purchased</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Average Order Value</span>
          <div className="text-2xl font-extrabold text-[#FF6A00] tabular-nums">
            ₹{aov.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 block">Per order average checkout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Discounts Given</span>
          <div className="text-2xl font-extrabold text-purple-600 tabular-nums">
            ₹{totalDiscount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-400 block">From coupon codes</span>
        </div>
      </div>

      {/* Export Reports Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Download Certified CSV Reports
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportOrdersCSV}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders Report (.csv)</span>
          </button>

          <button
            onClick={exportProductPerformanceCSV}
            disabled={productPerformance.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Product Performance (.csv)</span>
          </button>

          <button
            onClick={exportInventoryCSV}
            disabled={products.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span>Export Inventory Valuation (.csv)</span>
          </button>
        </div>
      </div>

      {/* 2-Column: Category Breakdown & Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Revenue by Category</h3>
              <p className="text-[11px] text-gray-400">Calculated from actual order items</p>
            </div>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>

          {categorySales.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">No category sales recorded in this period.</p>
          ) : (
            <div className="space-y-3">
              {categorySales.map((cat) => {
                const pct = grossTurnover > 0 ? Math.round((cat.revenue / grossTurnover) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-900">{cat.name}</span>
                      <span className="text-gray-700 font-mono">₹{cat.revenue.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-atharvay-gradient rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{cat.units} units sold</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Top Revenue Products</h3>
              <p className="text-[11px] text-gray-400">Ranked by actual sales volume</p>
            </div>
            <Package className="w-4 h-4 text-gray-400" />
          </div>

          {productPerformance.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">No product orders recorded in this period.</p>
          ) : (
            <div className="space-y-3">
              {productPerformance.slice(0, 5).map((p, idx) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-white font-mono font-bold text-gray-500 flex items-center justify-center shrink-0 border text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-gray-900 block">₹{p.revenue.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-gray-400">{p.units} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
