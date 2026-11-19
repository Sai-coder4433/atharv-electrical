import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  FileText,
  Shield,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

type DateRangeFilter = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    products,
    categories,
    orders,
    customers,
    shipments,
    setCustomerView,
    setActiveMode,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      if (isNaN(orderTime)) return true;

      switch (dateFilter) {
        case 'today':
          return orderTime >= todayStart;
        case 'yesterday':
          return orderTime >= todayStart - oneDayMs && orderTime < todayStart;
        case '7days':
          return orderTime >= todayStart - 7 * oneDayMs;
        case '30days':
          return orderTime >= todayStart - 30 * oneDayMs;
        case 'this_month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          return orderTime >= monthStart;
        }
        default:
          return true;
      }
    });
  }, [orders, dateFilter]);

  // Dynamic Metrics derived from filtered data
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === 'Paid' || o.status === 'Completed' || o.status === 'Delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const grossSales = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const pendingOrders = filteredOrders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed').length;
  const processingOrders = filteredOrders.filter((o) => o.status === 'Processing').length;
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'Cancelled').length;

  const successfulPayments = filteredOrders.filter((o) => o.paymentStatus === 'Paid').length;
  const pendingPayments = filteredOrders.filter((o) => o.paymentStatus === 'Pending').length;
  const failedPayments = filteredOrders.filter((o) => o.paymentStatus === 'Failed').length;

  // Global static stats
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  // Compute Best Selling Products from actual order items
  const bestSellers = useMemo(() => {
    const counts: Record<string, { product: (typeof products)[0]; count: number; revenue: number }> = {};
    for (const ord of filteredOrders) {
      for (const item of ord.items || []) {
        const prod = products.find((p) => p.id === (item.product?.id || item.id));
        if (prod) {
          if (!counts[prod.id]) {
            counts[prod.id] = { product: prod, count: 0, revenue: 0 };
          }
          counts[prod.id].count += item.quantity || 1;
          counts[prod.id].revenue += (item.unitPrice || prod.sellingPrice) * (item.quantity || 1);
        }
      }
    }
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    if (sorted.length > 0) return sorted.slice(0, 5);

    // Fallback if no order items: display products flagged as isBestSeller or highest rated
    return products
      .filter((p) => p.isBestSeller || p.rating >= 4.5)
      .slice(0, 5)
      .map((p) => ({ product: p, count: 0, revenue: p.sellingPrice }));
  }, [filteredOrders, products]);

  // Compute 7-day revenue trend for chart
  const weeklyTrend = useMemo(() => {
    const days: { label: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayOrders = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      });

      const dayRev = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      days.push({ label: dayLabel, revenue: dayRev, orders: dayOrders.length });
    }
    return days;
  }, [orders]);

  const maxDayRevenue = Math.max(...weeklyTrend.map((d) => d.revenue), 1000);

  // Category distribution
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id || p.categoryName === cat.name);
      return {
        id: cat.id,
        name: cat.name,
        count: catProducts.length,
      };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [categories, products]);

  // Recent 5 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              ATHARV ELECTRICAL · Manik Chowk, Chakan
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#168A45] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              Live System Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Store Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time management dashboard with live Firestore synchronization and Cashfree payment tracking.
          </p>
        </div>

        {/* Action Controls & Date Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-500 ml-2" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
              className="bg-transparent text-xs font-bold text-gray-700 py-1 px-2 border-none focus:ring-0 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          <button
            onClick={() => {
              setActiveMode('customer');
              setCustomerView('home');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow transition-all"
          >
            Visit Customer Store
          </button>
        </div>
      </div>

      {/* 2. Primary 6 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Net Revenue */}
        <div
          onClick={() => onNavigate('financials')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#168A45] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[#168A45] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Net Revenue</span>
            <span className="text-xl font-extrabold text-gray-900 block mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gray-400">Gross: ₹{grossSales.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-[#FF6A00] rounded-full">
              {pendingOrders} new
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{totalOrdersCount}</span>
            <span className="text-[10px] text-gray-400">{deliveredOrders} delivered</span>
          </div>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-500 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {totalCategories} cats
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Total Products</span>
            <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{totalProducts}</span>
            <span className="text-[10px] text-gray-400">Live in Firestore</span>
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigate('crm')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-500 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Customers</span>
            <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{totalCustomers}</span>
            <span className="text-[10px] text-gray-400">Accounts & Profiles</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {lowStockProducts.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full animate-pulse">
                Action Req.
              </span>
            )}
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Low Stock Alert</span>
            <span className="text-xl font-extrabold text-amber-600 block mt-0.5">{lowStockProducts.length}</span>
            <span className="text-[10px] text-gray-400">Below threshold</span>
          </div>
        </div>

        {/* Successful Payments */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-indigo-500 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-400">Cashfree</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Paid Orders</span>
            <span className="text-xl font-extrabold text-gray-900 block mt-0.5">{successfulPayments}</span>
            <span className="text-[10px] text-gray-400">{failedPayments} failed / {pendingPayments} pend</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Status Strip (Order Pipeline Breakdown) */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#FF6A00]" />
              Order Pipeline & Fulfillment Status
            </h2>
            <p className="text-xs text-gray-500">Live order processing stages from receipt to delivery</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6A00]">Pending Confirmation</span>
              <Clock className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{pendingOrders}</p>
            <p className="text-[11px] text-gray-500">Awaiting store review</p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600">Processing / Packed</span>
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{processingOrders}</p>
            <p className="text-[11px] text-gray-500">Ready for dispatch</p>
          </div>

          <div className="p-4 bg-green-50/60 rounded-2xl border border-green-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#168A45]">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-[#168A45]" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{deliveredOrders}</p>
            <p className="text-[11px] text-gray-500">Completed shipments</p>
          </div>

          <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600">Cancelled / Refunded</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{cancelledOrders}</p>
            <p className="text-[11px] text-gray-500">Terminated transactions</p>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Analytics & Real-Time Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Weekly Trend & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart Visualizer */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#FF6A00]" />
                  7-Day Sales & Revenue Trend
                </h3>
                <p className="text-xs text-gray-500">Actual billing figures computed from Firestore order ledger</p>
              </div>
              <button
                onClick={() => onNavigate('sales-analytics')}
                className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
              >
                <span>Sales Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4">
              <div className="flex items-end justify-between gap-3 h-48 border-b border-gray-100 pb-2">
                {weeklyTrend.map((day, idx) => {
                  const heightPercent = maxDayRevenue > 0 ? Math.min(100, Math.round((day.revenue / maxDayRevenue) * 100)) : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded shadow-xs text-center whitespace-nowrap pointer-events-none">
                        ₹{day.revenue.toLocaleString('en-IN')}
                        <br />
                        {day.orders} ords
                      </div>
                      <div
                        className="w-full max-w-[42px] bg-gradient-to-t from-[#FF6A00] to-[#FFA726] rounded-t-lg transition-all duration-300 group-hover:brightness-110 min-h-[4px]"
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />
                      <span className="text-[11px] text-gray-500 font-semibold text-center block truncate w-full">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Customer Orders</h3>
                <p className="text-xs text-gray-500">Directly synchronized with Firestore</p>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No orders received yet.</p>
                <p className="text-[11px] text-gray-400">Customer purchases will automatically stream here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">{ord.orderNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-gray-900">{ord.customerName}</p>
                          <p className="text-[11px] text-gray-400">{ord.customerPhone}</p>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Completed' || ord.status === 'Delivered'
                                ? 'bg-green-100 text-[#168A45]'
                                : ord.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-50 text-[#FF6A00]'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onNavigate('orders')}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold text-[11px] transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Inventory Alerts, Category Distribution & Fast Nav */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Stock Alert
                </h3>
                <p className="text-xs text-gray-500">Items below replenishment threshold</p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Inventory →
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-[#168A45] mx-auto" />
                  <p className="text-xs font-bold text-green-900">All product stocks are healthy!</p>
                  <p className="text-[11px] text-green-700">No items under minimum safety thresholds.</p>
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={p.mainImage || (p.images && p.images[0]) || '/assets/images/hero_fan_bldc_1790620359971.jpg'}
                        alt={p.name}
                        className="w-9 h-9 object-contain rounded-lg border bg-white p-0.5 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/hero_fan_bldc_1790620359971.jpg';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{p.name}</p>
                        <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-amber-600 block">{p.stock} left</span>
                      <span className="text-[10px] text-gray-400">Min: {p.lowStockThreshold}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Categories Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6A00]" />
                Top Categories
              </h3>
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs font-bold text-[#FF6A00] hover:underline"
              >
                View ({categories.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No categories configured yet.</p>
              ) : (
                categoryStats.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">{c.name}</span>
                      <span className="font-bold text-gray-600">{c.count} items</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF6A00] h-full rounded-full"
                        style={{
                          width: `${totalProducts > 0 ? Math.round((c.count / totalProducts) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 text-white space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB000] block">
                Quick Shortcuts
              </span>
              <h3 className="text-sm font-bold text-white mt-1">Direct Module Access</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('crm')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl text-left border border-neutral-700 transition-colors flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-[#FFB000]" />
                <span className="font-bold">CRM 360°</span>
              </button>
              <button
                onClick={() => onNavigate('sales-analytics')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl text-left border border-neutral-700 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">Sales Trends</span>
              </button>
              <button
                onClick={() => onNavigate('product-analytics')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl text-left border border-neutral-700 transition-colors flex items-center gap-2"
              >
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold">Top Products</span>
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl text-left border border-neutral-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold">CSV Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Two-Column: Top Performing Products & Real Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Top Performing Products</h3>
              <p className="text-xs text-gray-500">Ranked by volume and sales velocity</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-[#FF6A00] hover:underline"
            >
              Catalog →
            </button>
          </div>

          <div className="space-y-3">
            {bestSellers.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No products available.</div>
            ) : (
              bestSellers.map(({ product: p, count, revenue }) => (
                <div key={p.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between text-xs hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.mainImage || (p.images && p.images[0]) || '/assets/images/hero_fan_bldc_1790620359971.jpg'}
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded-xl border p-1 bg-white shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/hero_fan_bldc_1790620359971.jpg';
                      }}
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block">{p.brand}</span>
                      <p className="font-bold text-gray-900 truncate">{p.name}</p>
                      <span className="text-[11px] text-gray-400">{p.subcategory || p.categoryName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 block">₹{revenue.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{count > 0 ? `${count} sold` : `Stock: ${p.stock}`}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real Registered Customers */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Customer Accounts</h3>
              <p className="text-xs text-gray-500">Live profiles registered or placing orders</p>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-bold text-[#FF6A00] hover:underline"
            >
              All Customers ({customers.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {customers.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No customers registered yet.</div>
            ) : (
              customers.slice(0, 5).map((c) => (
                <div key={c.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between text-xs hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold text-xs shrink-0">
                      {c.name ? c.name.substring(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{c.name || 'Anonymous Customer'}</p>
                      <span className="text-[11px] text-gray-400">{c.phone || c.email || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400">{c.ordersCount} orders</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
