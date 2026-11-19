import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  Layers,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type AnalyticsSection = 'overall' | 'monthly' | 'yearly' | 'daily_weekly';
type DateRange = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'all';

export const AdminSalesAnalytics: React.FC = () => {
  const { orders, products } = useApp();

  const [activeSection, setActiveSection] = useState<AnalyticsSection>('overall');
  const [dateRange, setDateRange] = useState<DateRange>('this_month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 1. Dynamic Date Filtering for Overall & Daily Analytics
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      if (isNaN(t)) return true;

      switch (dateRange) {
        case 'today':
          return t >= todayStart;
        case 'yesterday':
          return t >= todayStart - oneDayMs && t < todayStart;
        case '7days':
          return t >= todayStart - 7 * oneDayMs;
        case '30days':
          return t >= todayStart - 30 * oneDayMs;
        case 'this_month': {
          const mStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          return t >= mStart;
        }
        case 'last_month': {
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          return t >= lastMonthStart && t < lastMonthEnd;
        }
        case 'this_year': {
          const yStart = new Date(now.getFullYear(), 0, 1).getTime();
          return t >= yStart;
        }
        default:
          return true;
      }
    });
  }, [orders, dateRange]);

  // Overall Financial Calculations
  const grossSales = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const totalDiscounts = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  }, [filteredOrders]);

  const totalShippingRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
  }, [filteredOrders]);

  const totalRefundAmount = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === 'Refunded')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const netRevenue = Math.max(0, grossSales - totalRefundAmount);
  const netSales = Math.max(0, grossSales - totalDiscounts - totalRefundAmount);
  const gstCollected = Math.round((netSales * 18) / 118); // 18% standard electrical GST fraction

  const totalOrdersCount = filteredOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(grossSales / totalOrdersCount) : 0;

  // Estimated Gross Profit (computed when products have purchasePrice)
  const estimatedGrossProfit = useMemo(() => {
    let profit = 0;
    for (const ord of filteredOrders) {
      if (ord.paymentStatus === 'Refunded' || ord.status === 'Cancelled') continue;
      for (const item of ord.items || []) {
        const prod = products.find((p) => p.id === (item.product?.id || item.id));
        const sellPrice = item.unitPrice || prod?.sellingPrice || 0;
        const costPrice = prod?.purchasePrice || Math.round(sellPrice * 0.72); // baseline 28% margin if unrecorded
        profit += (sellPrice - costPrice) * (item.quantity || 1);
      }
    }
    return profit;
  }, [filteredOrders, products]);

  // 2. Monthly Sales Breakdown (Jan to Dec for selectedYear)
  const monthlyData = useMemo(() => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = months.map((monthName, monthIndex) => {
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === selectedYear && d.getMonth() === monthIndex;
      });

      const rev = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        month: monthName,
        short: monthName.substring(0, 3),
        revenue: rev,
        ordersCount: monthOrders.length,
        aov: monthOrders.length > 0 ? Math.round(rev / monthOrders.length) : 0,
      };
    });

    return result;
  }, [orders, selectedYear]);

  // Identify Best and Lowest Months
  const nonZeroMonths = monthlyData.filter((m) => m.revenue > 0);
  const bestMonth = nonZeroMonths.length > 0
    ? [...nonZeroMonths].sort((a, b) => b.revenue - a.revenue)[0]
    : null;
  const lowestMonth = nonZeroMonths.length > 0
    ? [...nonZeroMonths].sort((a, b) => a.revenue - b.revenue)[0]
    : null;

  const maxMonthlyRevenue = Math.max(...monthlyData.map((m) => m.revenue), 10000);

  // 3. Yearly Analytics
  const yearlyStats = useMemo(() => {
    const currentYearOrders = orders.filter((o) => new Date(o.createdAt).getFullYear() === selectedYear);
    const prevYearOrders = orders.filter((o) => new Date(o.createdAt).getFullYear() === selectedYear - 1);

    const currentYearRev = currentYearOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const prevYearRev = prevYearOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    const yoyGrowth = prevYearRev > 0
      ? (((currentYearRev - prevYearRev) / prevYearRev) * 100).toFixed(1)
      : currentYearRev > 0 ? '100.0' : '0.0';

    return {
      currentYearRev,
      prevYearRev,
      yoyGrowth,
      currentYearOrders: currentYearOrders.length,
      currentYearAov: currentYearOrders.length > 0 ? Math.round(currentYearRev / currentYearOrders.length) : 0,
    };
  }, [orders, selectedYear]);

  // 4. Daily & Weekly Peak Analysis
  const weekdayAnalysis = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const revs = [0, 0, 0, 0, 0, 0, 0];

    filteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay();
        counts[dayIdx] += 1;
        revs[dayIdx] += (o.totalAmount || 0);
      }
    });

    return days.map((dayName, idx) => ({
      day: dayName,
      orders: counts[idx],
      revenue: revs[idx],
    }));
  }, [filteredOrders]);

  const peakDay = [...weekdayAnalysis].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Section Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              ATHARV ELECTRICAL · Business Intelligence
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#168A45] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              Certified Firestore Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified fiscal reporting, monthly and yearly growth trajectories, gross margin, and revenue velocity.
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSection('overall')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSection === 'overall' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overall Sales
            </button>
            <button
              onClick={() => setActiveSection('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSection === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Analysis
            </button>
            <button
              onClick={() => setActiveSection('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSection === 'yearly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly & YoY
            </button>
            <button
              onClick={() => setActiveSection('daily_weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSection === 'daily_weekly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily & Weekly
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: OVERALL SALES DASHBOARD */}
      {activeSection === 'overall' && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Analysis Period:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_year', label: 'This Year' },
                { id: 'all', label: 'All Time' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setDateRange(filter.id as DateRange)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    dateRange === filter.id
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* 10 Core Business Financial Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Gross Sales</span>
              <p className="text-xl font-extrabold text-gray-900">₹{grossSales.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Total transaction volume</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] block">Net Revenue</span>
              <p className="text-xl font-extrabold text-gray-900">₹{netRevenue.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Less processed refunds</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Est. Gross Profit</span>
              <p className="text-xl font-extrabold text-emerald-700">₹{estimatedGrossProfit.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Margin: ~{grossSales > 0 ? ((estimatedGrossProfit / grossSales) * 100).toFixed(0) : 0}%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">Total Orders</span>
              <p className="text-xl font-extrabold text-gray-900">{totalOrdersCount}</p>
              <span className="text-[10px] text-gray-500">Fulfilled in period</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">Average Order (AOV)</span>
              <p className="text-xl font-extrabold text-gray-900">₹{averageOrderValue.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Basket size per checkout</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Total Discounts</span>
              <p className="text-xl font-extrabold text-gray-900">₹{totalDiscounts.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Promo codes & offers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">GST Collected (18%)</span>
              <p className="text-xl font-extrabold text-gray-900">₹{gstCollected.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Official tax liability</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 block">Shipping Revenue</span>
              <p className="text-xl font-extrabold text-gray-900">₹{totalShippingRevenue.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Delivery fees billed</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">Refund Amount</span>
              <p className="text-xl font-extrabold text-gray-900">₹{totalRefundAmount.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Cashfree reversals</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Net Sales</span>
              <p className="text-xl font-extrabold text-gray-900">₹{netSales.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500">Pure product turnover</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION 2: MONTHLY SALES ANALYSIS */}
      {activeSection === 'monthly' && (
        <div className="space-y-6">
          {/* Year selector & Month highlights */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">12-Month Fiscal Analysis ({selectedYear})</h2>
              <p className="text-xs text-gray-500">Actual month-by-month sales data computed from Firestore</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">Select Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                {[2026, 2025, 2024].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Best & Lowest Month Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-6 rounded-3xl border border-green-200 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Your Best Sales Month</span>
              </div>
              {bestMonth ? (
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{bestMonth.month} {selectedYear}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    ₹{bestMonth.revenue.toLocaleString('en-IN')} · {bestMonth.ordersCount} Orders
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No monthly revenue recorded for {selectedYear} yet.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 rounded-3xl border border-orange-200 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Lowest Sales Month</span>
              </div>
              {lowestMonth ? (
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{lowestMonth.month} {selectedYear}</p>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">
                    ₹{lowestMonth.revenue.toLocaleString('en-IN')} · {lowestMonth.ordersCount} Orders
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No monthly revenue recorded for {selectedYear} yet.</p>
              )}
            </div>
          </div>

          {/* Monthly Revenue Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Monthly Revenue Comparison</h3>
            <div className="pt-4">
              <div className="flex items-end justify-between gap-2 h-56 border-b border-gray-100 pb-3">
                {monthlyData.map((m) => {
                  const percent = maxMonthlyRevenue > 0 ? Math.min(100, Math.round((m.revenue / maxMonthlyRevenue) * 100)) : 0;
                  return (
                    <div key={m.short} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-700 bg-gray-100 px-1 py-0.5 rounded shadow-xs text-center whitespace-nowrap pointer-events-none">
                        ₹{m.revenue.toLocaleString('en-IN')}
                        <br />
                        {m.ordersCount} ords
                      </div>
                      <div
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#FF6A00] to-[#FFA726] rounded-t-lg transition-all duration-300 group-hover:brightness-110 min-h-[4px]"
                        style={{ height: `${Math.max(4, percent)}%` }}
                      />
                      <span className="text-[11px] text-gray-500 font-bold block">{m.short}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Data Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-gray-900 mb-4">Detailed Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Revenue (INR)</th>
                    <th className="py-2.5 px-3">Orders</th>
                    <th className="py-2.5 px-3">Average Order Value</th>
                    <th className="py-2.5 px-3 text-right">Contribution %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.map((m) => {
                    const totalYearRev = monthlyData.reduce((s, it) => s + it.revenue, 0);
                    const contrib = totalYearRev > 0 ? ((m.revenue / totalYearRev) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={m.month} className="hover:bg-gray-50/60">
                        <td className="py-3 px-3 font-bold text-gray-900">{m.month}</td>
                        <td className="py-3 px-3 font-bold text-gray-900">₹{m.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3">{m.ordersCount}</td>
                        <td className="py-3 px-3 text-gray-600">₹{m.aov.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#FF6A00]">{contrib}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION 3: YEARLY SALES & YOY GROWTH */}
      {activeSection === 'yearly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                {selectedYear} Revenue
              </span>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{yearlyStats.currentYearRev.toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-gray-500">{yearlyStats.currentYearOrders} Total Orders</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                {selectedYear - 1} Revenue
              </span>
              <p className="text-3xl font-extrabold text-gray-900">
                ₹{yearlyStats.prevYearRev.toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-gray-500">Historical Comparison Baseline</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                Year-over-Year Growth
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-6 h-6" />
                +{yearlyStats.yoyGrowth}%
              </p>
              <span className="text-xs text-gray-500">Current annual trajectory</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION 4: DAILY & WEEKLY PEAK ANALYSIS */}
      {activeSection === 'daily_weekly' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Peak Sales Days of the Week</h3>
                <p className="text-xs text-gray-500">Weekly customer purchase behavior patterns</p>
              </div>
              {peakDay && (
                <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  Peak Day: {peakDay.day}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
              {weekdayAnalysis.map((d) => (
                <div
                  key={d.day}
                  className={`p-4 rounded-2xl border text-center space-y-1 ${
                    peakDay?.day === d.day
                      ? 'bg-orange-50 border-[#FF6A00] text-gray-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{d.day.substring(0, 3)}</span>
                  <p className="text-base font-extrabold text-gray-900">₹{d.revenue.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-gray-500">{d.orders} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
