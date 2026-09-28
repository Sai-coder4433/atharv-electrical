import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Clock,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { orders, products, customers, updateOrderStatus, setSelectedOrderForTracking, setCustomerView, setActiveMode } = useApp();

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0) + 185000; // Simulated historical baseline
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed');
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Store Management Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time sales, order fulfillment, and electrical inventory overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-gray-900 hover:bg-black transition-colors"
          >
            + Add New Product
          </button>
          <button
            onClick={() => {
              setActiveMode('customer');
              setCustomerView('home');
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            View Customer Storefront ↗
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Total Sales (Gross)</span>
            <span className="p-1.5 rounded-lg bg-green-50 text-green-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-green-600 font-medium gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Orders Completed</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {orders.length + 138}
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            {pendingOrders.length} pending dispatch
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Active Customers</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {customers.length + 76}
          </div>
          <div className="mt-2 text-[11px] text-green-600 font-medium">
            +12 new this week
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Low Stock Alerts</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {lowStockProducts.length}
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            Action required in inventory
          </div>
        </div>
      </div>

      {/* Analytics Visualizers (Clean SaaS Bar & Donut representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Weekly Revenue Breakdown</h3>
              <p className="text-xs text-gray-500">Retail storefront + local contractor billing</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Current Week
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-gray-100">
            {[
              { day: 'Mon', val: 32400, height: '45%' },
              { day: 'Tue', val: 48900, height: '65%' },
              { day: 'Wed', val: 28500, height: '38%' },
              { day: 'Thu', val: 62000, height: '82%' },
              { day: 'Fri', val: 74500, height: '95%' },
              { day: 'Sat', val: 56200, height: '74%' },
              { day: 'Sun', val: 41000, height: '54%' },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{(d.val / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full max-w-[36px] bg-atharvay-gradient rounded-t-md transition-all group-hover:brightness-110"
                  style={{ height: d.height }}
                />
                <span className="text-[11px] font-medium text-gray-600">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Sales by Category</h3>
            <p className="text-xs text-gray-500 mb-4">Proportion of gross volume</p>

            <div className="space-y-3">
              {[
                { name: 'Fans & BLDC (Orient)', percent: 45, color: '#FF6A00' },
                { name: 'LED Lighting & Panels (Goldmedal)', percent: 28, color: '#FFB000' },
                { name: 'Modular Switches & Plates', percent: 17, color: '#171717' },
                { name: 'Copper Wires & MCBs', percent: 10, color: '#168A45' },
              ].map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{c.name}</span>
                    <span className="font-bold text-gray-900">{c.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.percent}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            Top grossing SKU: <strong>Orient Aeroquiet BLDC Fan</strong>
          </div>
        </div>
      </div>

      {/* Recent Orders Management Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-200">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-500">Click status to update fulfillment in real-time</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-[#FF6A00] hover:underline"
          >
            View All Orders ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                    <span className="text-[11px] text-gray-500">{order.deliveryAddress.city}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {order.items.length} items
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className="text-xs font-semibold py-1 px-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#FF6A00]"
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
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrderForTracking(order);
                        onNavigate('orders');
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
