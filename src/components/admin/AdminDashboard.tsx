import React from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    products,
    categories,
    orders,
    customers,
    updateOrderStatus,
    setSelectedOrderForTracking,
    setCustomerView,
    setActiveMode,
  } = useApp();

  // Metrics
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  // Recent Orders (5)
  const recentOrders = [...orders].slice(0, 5);

  // Top Selling Products
  const topSellingProducts = [...products]
    .filter((p) => p.isBestSeller || p.rating >= 4.7)
    .slice(0, 5);

  // Recent Customers
  const recentCustomers = [...customers].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 px-2.5 py-0.5 rounded-full">
            ATHARV ELECTRICAL · Central Admin
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2">
            Operations & Performance Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time overview of inventory, orders, customer accounts, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMode('customer');
              setCustomerView('home');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
          >
            Visit Customer Store
          </button>
        </div>
      </div>

      {/* 6 Metric Cards (Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Total Products</span>
            <span className="text-xl font-extrabold text-gray-900">{totalProducts}</span>
          </div>
        </div>

        {/* 2. Total Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Total Categories</span>
            <span className="text-xl font-extrabold text-gray-900">{totalCategories}</span>
          </div>
        </div>

        {/* 3. Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Total Orders</span>
            <span className="text-xl font-extrabold text-gray-900">{totalOrders}</span>
          </div>
        </div>

        {/* 4. Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Total Customers</span>
            <span className="text-xl font-extrabold text-gray-900">{totalCustomers}</span>
          </div>
        </div>

        {/* 5. Total Revenue */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-[#FF6A00] cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-green-50 text-[#168A45] flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Total Revenue</span>
            <span className="text-lg font-extrabold text-gray-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 6. Low Stock Products */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-amber-500 cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase block">Low Stock Alert</span>
            <span className="text-xl font-extrabold text-amber-600">{lowStockProducts.length}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-500">Live order pipeline awaiting dispatch or processing</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                  <tr key={ord.id} className="hover:bg-gray-50/60">
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
                          ord.status === 'Completed'
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
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold text-[11px]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Low Stock Products</h2>
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
              <p className="text-xs text-gray-500 py-6 text-center">All product stocks are healthy!</p>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.mainImage || p.images[0]}
                      alt={p.name}
                      className="w-9 h-9 object-contain rounded-lg border bg-white p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-amber-600 block">{p.stock} units left</span>
                    <span className="text-[10px] text-gray-400">Min: {p.lowStockThreshold}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Section: Top Selling Products & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Top Selling Products</h2>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-[#FF6A00] hover:underline"
            >
              Catalog →
            </button>
          </div>

          <div className="space-y-3">
            {topSellingProducts.map((p) => (
              <div key={p.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={p.mainImage || p.images[0]}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded-xl border p-1 bg-white shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-[#FF6A00] uppercase">{p.brand}</span>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <span className="text-[11px] text-gray-400">{p.subcategory}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">₹{p.sellingPrice.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#168A45] font-semibold">★ {p.rating} / 5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Recent Customers</h2>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-bold text-[#FF6A00] hover:underline"
            >
              Customers →
            </button>
          </div>

          <div className="space-y-3">
            {recentCustomers.map((c) => (
              <div key={c.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold text-xs shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <span className="text-[11px] text-gray-400">{c.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">
                    ₹{c.totalSpend.toLocaleString('en-IN')} spent
                  </span>
                  <span className="text-[10px] text-gray-400">{c.ordersCount} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
