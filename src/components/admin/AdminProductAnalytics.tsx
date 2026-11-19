import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Award,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

type AnalyticsTab = 'products' | 'categories' | 'brands';
type RankingPerspective = 'quantity' | 'revenue' | 'profit' | 'frequency';
type DateRange = 'today' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'all';

export const AdminProductAnalytics: React.FC = () => {
  const { products, categories, brands, orders, setAdminView } = useApp();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('products');
  const [perspective, setPerspective] = useState<RankingPerspective>('quantity');
  const [dateRange, setDateRange] = useState<DateRange>('this_month');

  // Filter orders by date range
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

  // Compute Product Sales Metrics from Line Items
  const productMetrics = useMemo(() => {
    const stats: Record<
      string,
      {
        product: Product;
        unitsSold: number;
        totalOrders: number;
        grossSales: number;
        discounts: number;
        netSales: number;
        estimatedProfit: number;
      }
    > = {};

    // Initialize all products with 0
    products.forEach((p) => {
      stats[p.id] = {
        product: p,
        unitsSold: 0,
        totalOrders: 0,
        grossSales: 0,
        discounts: 0,
        netSales: 0,
        estimatedProfit: 0,
      };
    });

    // Aggregate from orders
    filteredOrders.forEach((o) => {
      if (o.status === 'Cancelled' || o.paymentStatus === 'Refunded') return;
      const seenInOrder = new Set<string>();

      (o.items || []).forEach((item) => {
        const prodId = item.product?.id || item.id;
        const prod = products.find((p) => p.id === prodId);
        if (prod && stats[prod.id]) {
          const qty = item.quantity || 1;
          const sellPrice = item.unitPrice || prod.sellingPrice || 0;
          const costPrice = prod.purchasePrice || Math.round(sellPrice * 0.72);
          const itemGross = sellPrice * qty;
          const itemProfit = (sellPrice - costPrice) * qty;

          stats[prod.id].unitsSold += qty;
          stats[prod.id].grossSales += itemGross;
          stats[prod.id].netSales += itemGross;
          stats[prod.id].estimatedProfit += itemProfit;

          if (!seenInOrder.has(prod.id)) {
            stats[prod.id].totalOrders += 1;
            seenInOrder.add(prod.id);
          }
        }
      });
    });

    return Object.values(stats);
  }, [products, filteredOrders]);

  // Sorted by selected ranking perspective
  const rankedProducts = useMemo(() => {
    return [...productMetrics].sort((a, b) => {
      switch (perspective) {
        case 'quantity':
          return b.unitsSold - a.unitsSold;
        case 'revenue':
          return b.netSales - a.netSales;
        case 'profit':
          return b.estimatedProfit - a.estimatedProfit;
        case 'frequency':
          return b.totalOrders - a.totalOrders;
        default:
          return b.unitsSold - a.unitsSold;
      }
    });
  }, [productMetrics, perspective]);

  // Low Performing Products & Out of Stock
  const lowPerformingProducts = useMemo(() => {
    return [...productMetrics].filter((p) => p.unitsSold === 0).slice(0, 10);
  }, [productMetrics]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock === 0);
  }, [products]);

  // 2. Category Performance
  const categoryAnalytics = useMemo(() => {
    const totalCatalogSales = productMetrics.reduce((sum, p) => sum + p.netSales, 0);

    return categories.map((cat) => {
      const catProds = productMetrics.filter(
        (pm) => pm.product.categoryId === cat.id || pm.product.categoryName === cat.name
      );
      const totalSales = catProds.reduce((sum, p) => sum + p.netSales, 0);
      const totalUnits = catProds.reduce((sum, p) => sum + p.unitsSold, 0);
      const contrib = totalCatalogSales > 0 ? ((totalSales / totalCatalogSales) * 100).toFixed(1) : '0.0';

      return {
        id: cat.id,
        name: cat.name,
        totalSales,
        totalUnits,
        contributionPercent: contrib,
        productCount: catProds.length,
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [categories, productMetrics]);

  const bestCategory = categoryAnalytics.length > 0 && categoryAnalytics[0].totalSales > 0 ? categoryAnalytics[0] : null;
  const lowestCategory = categoryAnalytics.length > 0 ? categoryAnalytics[categoryAnalytics.length - 1] : null;

  // 3. Brand Performance (ORIENT vs Goldmedal vs Others)
  const brandAnalytics = useMemo(() => {
    const brandMap: Record<string, { name: string; sales: number; units: number; ordersCount: number }> = {};

    productMetrics.forEach((pm) => {
      const bName = pm.product.brand || 'Other';
      if (!brandMap[bName]) {
        brandMap[bName] = { name: bName, sales: 0, units: 0, ordersCount: 0 };
      }
      brandMap[bName].sales += pm.netSales;
      brandMap[bName].units += pm.unitsSold;
      brandMap[bName].ordersCount += pm.totalOrders;
    });

    return Object.values(brandMap).sort((a, b) => b.sales - a.sales);
  }, [productMetrics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              ATHARV ELECTRICAL · Product & Brand Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Product, Category & Brand Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time catalog performance: differentiate most sold by quantity, highest revenue, and gross profit margin.
          </p>
        </div>

        {/* Tab & Date Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'products' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Top Products
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'categories' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Category Performance
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'brands' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Brand Performance
            </button>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="text-xs font-bold py-2 px-3 bg-white border border-gray-200 rounded-xl shadow-xs cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* 2. TAB 1: TOP SELLING PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* 4 Switchable Ranking Perspectives */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-[#FF6A00]" />
              Rank Products By:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPerspective('quantity')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  perspective === 'quantity'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1. Most Sold by Quantity
              </button>
              <button
                onClick={() => setPerspective('revenue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  perspective === 'revenue'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                2. Highest Revenue
              </button>
              <button
                onClick={() => setPerspective('profit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  perspective === 'profit'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                3. Highest Gross Profit
              </button>
              <button
                onClick={() => setPerspective('frequency')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  perspective === 'frequency'
                    ? 'bg-[#FF6A00] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                4. Most Frequently Ordered
              </button>
            </div>
          </div>

          {/* Top 10 Best Selling Products Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">
              Top 10 Best Selling Products ({perspective.toUpperCase()})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold">
                  <tr>
                    <th className="py-3 px-3">Rank & Product</th>
                    <th className="py-3 px-3">Brand & Category</th>
                    <th className="py-3 px-3">Units Sold</th>
                    <th className="py-3 px-3">Orders</th>
                    <th className="py-3 px-3">Net Sales</th>
                    <th className="py-3 px-3">Est. Profit</th>
                    <th className="py-3 px-3">Stock Available</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rankedProducts.slice(0, 10).map((pm, idx) => (
                    <tr key={pm.product.id} className="hover:bg-gray-50/70">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-gray-100 font-bold text-[10px] text-gray-600 flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <img
                            src={pm.product.mainImage || (pm.product.images && pm.product.images[0]) || '/assets/images/hero_fan_bldc_1790620359971.jpg'}
                            alt={pm.product.name}
                            className="w-10 h-10 object-contain rounded-xl border bg-white p-1 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/hero_fan_bldc_1790620359971.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{pm.product.name}</p>
                            <span className="text-[10px] text-gray-400 font-mono">SKU: {pm.product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-[#FF6A00]">{pm.product.brand}</p>
                        <p className="text-[11px] text-gray-400">{pm.product.categoryName || pm.product.subcategory}</p>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-gray-900">{pm.unitsSold} units</td>
                      <td className="py-3.5 px-3 font-semibold text-gray-700">{pm.totalOrders} orders</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">₹{pm.netSales.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">₹{pm.estimatedProfit.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className={`font-bold ${pm.product.stock <= pm.product.lowStockThreshold ? 'text-amber-600' : 'text-gray-900'}`}>
                          {pm.product.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {pm.product.stock === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : pm.product.stock <= pm.product.lowStockThreshold ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Out of Stock and Low Performing Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Out of Stock Products ({outOfStockProducts.length})
                </h4>
                <button onClick={() => setAdminView('inventory')} className="text-xs font-bold text-[#FF6A00] hover:underline">
                  Replenish →
                </button>
              </div>
              <div className="space-y-2">
                {outOfStockProducts.length === 0 ? (
                  <p className="text-xs text-green-600 py-4 text-center">No products are completely out of stock!</p>
                ) : (
                  outOfStockProducts.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-3 bg-red-50/50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                      </div>
                      <span className="font-bold text-red-600">0 in stock</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Low Performing Products ({lowPerformingProducts.length})
                </h4>
              </div>
              <div className="space-y-2">
                {lowPerformingProducts.slice(0, 5).map((pm) => (
                  <div key={pm.product.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{pm.product.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{pm.product.brand} · ₹{pm.product.sellingPrice}</span>
                    </div>
                    <span className="font-bold text-gray-400">0 units sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: CATEGORY PERFORMANCE */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-6 rounded-3xl border border-green-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Best Performing Category</span>
              {bestCategory ? (
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{bestCategory.name}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    ₹{bestCategory.totalSales.toLocaleString('en-IN')} · {bestCategory.totalUnits} Units Sold ({bestCategory.contributionPercent}%)
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No category sales recorded yet.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 rounded-3xl border border-orange-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Lowest Selling Category</span>
              {lowestCategory ? (
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{lowestCategory.name}</p>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">
                    ₹{lowestCategory.totalSales.toLocaleString('en-IN')} · {lowestCategory.totalUnits} Units Sold
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No category sales recorded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-gray-900 mb-4">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Category Name</th>
                    <th className="py-2.5 px-3">Products</th>
                    <th className="py-2.5 px-3">Units Sold</th>
                    <th className="py-2.5 px-3">Total Sales (INR)</th>
                    <th className="py-2.5 px-3 text-right">Revenue Contribution %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryAnalytics.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-3 font-bold text-gray-900">{c.name}</td>
                      <td className="py-3 px-3">{c.productCount}</td>
                      <td className="py-3 px-3 font-semibold text-gray-700">{c.totalUnits}</td>
                      <td className="py-3 px-3 font-bold text-gray-900">₹{c.totalSales.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#FF6A00]">{c.contributionPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: BRAND PERFORMANCE */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-gray-900 mb-4">Brand Performance (ORIENT vs Goldmedal vs Others)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {brandAnalytics.map((b) => (
                <div key={b.name} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] block">{b.name}</span>
                  <p className="text-2xl font-extrabold text-gray-900">₹{b.sales.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-200">
                    <span>{b.units} Units Sold</span>
                    <span>{b.ordersCount} Orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
