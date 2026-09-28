import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Warehouse,
  Users,
  Tag,
  Sliders,
  BarChart3,
  ArrowLeft,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminInventory } from './AdminInventory';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminBanners } from './AdminBanners';
import { AdminAnalytics } from './AdminAnalytics';

export const AdminLayout: React.FC = () => {
  const {
    adminView,
    setAdminView,
    setActiveMode,
    setCustomerView,
    orders,
    products,
  } = useApp();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Confirmed'
  ).length;
  const lowStockCount = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons & Deals', icon: Tag },
    { id: 'banners', label: 'Hero Banners', icon: Sliders },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* 1. Left SaaS Admin Sidebar */}
      <aside className="w-64 bg-[#171717] text-white flex flex-col justify-between shrink-0 hidden md:flex border-r border-neutral-800">
        <div>
          {/* Logo & Subtitle */}
          <div className="p-5 border-b border-neutral-800">
            <Logo variant="dark" size="sm" />
            <span className="text-[10px] font-mono text-gray-400 mt-2 block tracking-wider uppercase">
              Business Portal v2.6
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-atharvay-gradient text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch back to Store */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60">
          <button
            onClick={() => {
              setActiveMode('customer');
              setCustomerView('home');
            }}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Customer Store</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          {/* Mobile view switcher */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => {
                setActiveMode('customer');
                setCustomerView('home');
              }}
              className="p-1.5 text-gray-700 bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <span className="font-bold text-xs text-gray-900 capitalize">{adminView}</span>
          </div>

          <div className="hidden md:flex items-center text-xs text-gray-500 font-medium">
            <span>ATHARV ELECTRICAL Central Admin</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-bold capitalize">{adminView}</span>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Mobile nav dropdown if on small screen */}
            <div className="md:hidden">
              <select
                value={adminView}
                onChange={(e) => setAdminView(e.target.value)}
                className="text-xs font-bold py-1.5 px-2 bg-gray-100 rounded-lg border border-gray-300"
              >
                {navItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#FFF3E6] text-[#FF6A00] font-bold text-xs px-3 py-1.5 rounded-lg border border-[#FFE0B2]">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <span>Showroom Online · Chakan Depot</span>
            </div>

            <button
              onClick={() => {
                setActiveMode('customer');
                setCustomerView('home');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
            >
              <span>Preview Customer Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        {/* View Component Body */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {adminView === 'dashboard' && <AdminDashboard onNavigate={setAdminView} />}
          {adminView === 'orders' && <AdminOrders />}
          {adminView === 'products' && <AdminProducts />}
          {adminView === 'inventory' && <AdminInventory />}
          {adminView === 'categories' && <AdminCategories />}
          {adminView === 'customers' && <AdminCustomers />}
          {adminView === 'coupons' && <AdminCoupons />}
          {adminView === 'banners' && <AdminBanners />}
          {adminView === 'analytics' && <AdminAnalytics />}
        </main>
      </div>
    </div>
  );
};
