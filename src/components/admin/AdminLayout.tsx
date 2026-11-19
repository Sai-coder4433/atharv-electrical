import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  Award,
  Warehouse,
  ShoppingBag,
  Users,
  Tag,
  Sliders,
  Star,
  CreditCard,
  Store,
  Settings,
  ArrowLeft,
  ExternalLink,
  LogOut,
  Truck,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSubcategories } from './AdminSubcategories';
import { AdminBrands } from './AdminBrands';
import { AdminInventory } from './AdminInventory';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminBanners } from './AdminBanners';
import { AdminReviews } from './AdminReviews';
import { AdminPayments } from './AdminPayments';
import { AdminStoreSettings } from './AdminStoreSettings';
import { AdminSettings } from './AdminSettings';
import { AdminShipping } from './AdminShipping';
import { AdminReports } from './AdminReports';
import { AdminActivityLogs } from './AdminActivityLogs';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminLayout: React.FC = () => {
  const {
    adminView,
    setAdminView,
    orders,
    products,
    shipments,
    authUser,
    logout,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Extract current subroute from router path (e.g., "/admin/products" -> "products")
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSubroute = pathParts[1] || adminView || 'dashboard';

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Confirmed'
  ).length;
  const lowStockCount = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  ).length;

  // 9 Professional Navigation Domains
  const navSections: NavSection[] = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PRODUCT MANAGEMENT',
      items: [
        { id: 'products', label: 'All Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'subcategories', label: 'Subcategories', icon: FolderTree },
        { id: 'brands', label: 'Brands', icon: Award },
        {
          id: 'inventory',
          label: 'Inventory Control',
          icon: Warehouse,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-900',
        },
      ],
    },
    {
      title: 'ORDER MANAGEMENT',
      items: [
        {
          id: 'orders',
          label: 'All Orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-orange-500 text-white',
        },
        {
          id: 'shipping',
          label: 'Shiprocket Shipping',
          icon: Truck,
          badge: shipments.filter((s) => s.pickupStatus === 'Pending' && s.shipmentStatus !== 'Cancelled').length || undefined,
          badgeColor: 'bg-blue-600 text-white',
        },
      ],
    },
    {
      title: 'CUSTOMER MANAGEMENT',
      items: [
        { id: 'customers', label: 'All Customers', icon: Users },
      ],
    },
    {
      title: 'PAYMENT MANAGEMENT',
      items: [
        { id: 'payments', label: 'Cashfree & Payments', icon: CreditCard },
      ],
    },
    {
      title: 'MARKETING',
      items: [
        { id: 'banners', label: 'Homepage Banners', icon: Sliders },
        { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
        { id: 'reviews', label: 'Product Reviews', icon: Star },
      ],
    },
    {
      title: 'BUSINESS REPORTS',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'ACTIVITY & SECURITY',
      items: [
        { id: 'activity-logs', label: 'Admin Activity Logs', icon: ShieldCheck },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Store Settings', icon: Store },
        { id: 'admin-settings', label: 'Admin Profile & Auth', icon: Settings },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((s) => s.items);

  const handleNavClick = (id: string) => {
    setAdminView(id);
    navigate(`/admin/${id}`);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* 1. Left SaaS Admin Sidebar */}
      <aside className="w-64 bg-[#171717] text-white flex flex-col justify-between shrink-0 hidden md:flex border-r border-neutral-800">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Logo & Subtitle */}
          <div className="p-5 border-b border-neutral-800 shrink-0">
            <Logo variant="dark" size="sm" />
            <span className="text-[10px] font-mono text-gray-400 mt-2 block tracking-wider uppercase">
              Operations Control Panel
            </span>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-3 space-y-4 flex-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    currentSubroute === item.id ||
                    (item.id === 'settings' && currentSubroute === 'store-settings');
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-atharvay-gradient text-white shadow-xs'
                          : 'text-gray-300 hover:text-white hover:bg-neutral-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
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
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions: Switch to Store & Logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 shrink-0 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Customer Store</span>
          </button>

          {authUser && (
            <button
              onClick={handleSignOut}
              className="w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          {/* Mobile view switcher */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 text-gray-700 bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <span className="font-bold text-xs text-gray-900 capitalize">{currentSubroute}</span>
          </div>

          <div className="hidden md:flex items-center text-xs text-gray-500 font-medium">
            <span>ATHARV ELECTRICAL Central Admin</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-bold capitalize">
              {allNavItems.find((n) => n.id === currentSubroute)?.label || currentSubroute}
            </span>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Mobile nav dropdown if on small screen */}
            <div className="md:hidden">
              <select
                value={currentSubroute}
                onChange={(e) => handleNavClick(e.target.value)}
                className="text-xs font-bold py-1.5 px-2 bg-gray-100 rounded-lg border border-gray-300"
              >
                {navSections.map((sec) => (
                  <optgroup key={sec.title} label={sec.title}>
                    {sec.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#FFF3E6] text-[#FF6A00] font-bold text-xs px-3 py-1.5 rounded-lg border border-[#FFE0B2]">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <span>Showroom Online · Manik Chowk, Chakan</span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
            >
              <span>Preview Customer Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Profile Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
              title={authUser?.email || 'Admin'}
              onClick={handleSignOut}
            >
              AP
            </div>
          </div>
        </header>

        {/* View Component Body */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {currentSubroute === 'dashboard' && <AdminDashboard onNavigate={handleNavClick} />}
          {currentSubroute === 'products' && <AdminProducts />}
          {currentSubroute === 'categories' && <AdminCategories />}
          {currentSubroute === 'subcategories' && <AdminSubcategories />}
          {currentSubroute === 'brands' && <AdminBrands />}
          {currentSubroute === 'inventory' && <AdminInventory />}
          {currentSubroute === 'orders' && <AdminOrders />}
          {currentSubroute === 'shipping' && <AdminShipping />}
          {currentSubroute === 'customers' && <AdminCustomers />}
          {currentSubroute === 'coupons' && <AdminCoupons />}
          {currentSubroute === 'offers' && <AdminCoupons />}
          {currentSubroute === 'banners' && <AdminBanners />}
          {currentSubroute === 'reviews' && <AdminReviews />}
          {currentSubroute === 'payments' && <AdminPayments />}
          {currentSubroute === 'reports' && <AdminReports />}
          {currentSubroute === 'activity-logs' && <AdminActivityLogs />}
          {(currentSubroute === 'settings' || currentSubroute === 'store-settings') && <AdminStoreSettings />}
          {currentSubroute === 'admin-settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
