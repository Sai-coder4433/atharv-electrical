import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  ShoppingBag,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  Plus,
  Zap,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Order } from '../../types';

export const AdminCRM: React.FC = () => {
  const { customers, orders, addCustomerNote, setSelectedOrderForTracking, setAdminView, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'behaviour'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');

  // Customer 360 Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');

  // 1. CRM Metrics computed from real customer & order records
  const totalCustomers = customers.length;
  const newCustomers = customers.filter((c) => c.customerType === 'New').length;
  const returningCustomers = customers.filter(
    (c) => c.customerType === 'Returning' || c.customerType === 'Regular' || c.customerType === 'High-Value'
  ).length;
  const activeCustomers = customers.filter((c) => c.status === 'Active' && c.customerType !== 'Inactive').length;
  const inactiveCustomers = customers.filter((c) => c.customerType === 'Inactive' || c.status === 'Inactive').length;

  const totalCustomerRevenue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const avgCustomerSpending = totalCustomers > 0 ? Math.round(totalCustomerRevenue / totalCustomers) : 0;
  const totalOrdersPlaced = customers.reduce((sum, c) => sum + (c.ordersCount || 0), 0);
  const avgOrdersPerCustomer = totalCustomers > 0 ? (totalOrdersPlaced / totalCustomers).toFixed(1) : '0';

  const repeatCustomersCount = customers.filter((c) => (c.ordersCount || 0) >= 2).length;
  const repeatPurchaseRate =
    totalCustomers > 0 ? ((repeatCustomersCount / totalCustomers) * 100).toFixed(1) : '0.0';

  // 2. Filtered Customers Database
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchSegment = segmentFilter === 'ALL' || c.customerType === segmentFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchSearch && matchSegment && matchStatus;
    });
  }, [customers, searchQuery, segmentFilter, statusFilter]);

  // 3. Behaviour Analytics Lists
  const topFrequentOrderers = useMemo(() => {
    return [...customers].sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0)).slice(0, 10);
  }, [customers]);

  const topSpenders = useMemo(() => {
    return [...customers].sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0)).slice(0, 10);
  }, [customers]);

  const highestAovCustomers = useMemo(() => {
    return [...customers].sort((a, b) => (b.averageOrderValue || 0) - (a.averageOrderValue || 0)).slice(0, 10);
  }, [customers]);

  const fanPurchasers = useMemo(() => {
    return customers
      .filter((c) => c.preferredCategories?.some((cat) => cat.toLowerCase().includes('fan')))
      .sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
      .slice(0, 10);
  }, [customers]);

  const lightPurchasers = useMemo(() => {
    return customers
      .filter((c) => c.preferredCategories?.some((cat) => cat.toLowerCase().includes('light')))
      .sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
      .slice(0, 10);
  }, [customers]);

  const inactiveLapsedCustomers = useMemo(() => {
    return customers
      .filter((c) => c.customerType === 'Inactive' || (c.ordersCount || 0) === 0)
      .slice(0, 10);
  }, [customers]);

  const multiCategoryBuyers = useMemo(() => {
    return customers
      .filter((c) => (c.preferredCategories?.length || 0) >= 2)
      .sort((a, b) => (b.preferredCategories?.length || 0) - (a.preferredCategories?.length || 0))
      .slice(0, 10);
  }, [customers]);

  // 4. Customer Orders for 360 Dossier
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    const email = selectedCustomer.email.toLowerCase().trim();
    const phone = selectedCustomer.phone.trim();
    return orders.filter(
      (o) =>
        (email && o.customerEmail?.toLowerCase().trim() === email) ||
        (phone && o.customerPhone?.trim() === phone) ||
        (o.customerName && selectedCustomer.name && o.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    );
  }, [selectedCustomer, orders]);

  // Export Customer CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      showToast('No customer records to export', 'error');
      return;
    }
    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Customer Type',
      'Status',
      'Total Orders',
      'Total Spend (INR)',
      'Average Order Value (INR)',
      'Last Order Date',
    ];
    const rows = filteredCustomers.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.customerType || 'New'}"`,
      `"${c.status}"`,
      c.ordersCount || 0,
      c.totalSpend || 0,
      c.averageOrderValue || 0,
      `"${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Atharv_CRM_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredCustomers.length} customer records to CSV!`, 'success');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;
    await addCustomerNote(selectedCustomer.id, newNote.trim());
    setSelectedCustomer((prev) =>
      prev
        ? {
            ...prev,
            internalNotes: [
              `[${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}] ${newNote.trim()}`,
              ...(prev.internalNotes || []),
            ],
          }
        : null
    );
    setNewNote('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              ATHARV ELECTRICAL · Enterprise CRM
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#168A45] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              Customer Intelligence Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2.5">
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track customer 360° dossiers, purchase habits, automated segmentation, and customer lifetime value.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CRM Overview
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'database' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer Database ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('behaviour')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'behaviour' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Purchase Behaviour
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. CRM OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 Primary CRM Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Total Customers</span>
              <p className="text-2xl font-extrabold text-gray-900">{totalCustomers}</p>
              <span className="text-[11px] text-gray-500">{activeCustomers} active / {inactiveCustomers} inactive</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] block">Customer Revenue</span>
              <p className="text-2xl font-extrabold text-gray-900">₹{totalCustomerRevenue.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-gray-500">From verified orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">Avg. Customer Spend</span>
              <p className="text-2xl font-extrabold text-gray-900">₹{avgCustomerSpending.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-gray-500">Lifetime value per client</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 block">Repeat Purchase Rate</span>
              <p className="text-2xl font-extrabold text-gray-900">{repeatPurchaseRate}%</p>
              <span className="text-[11px] text-gray-500">{repeatCustomersCount} returning buyers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">New Customers</span>
              <p className="text-2xl font-extrabold text-gray-900">{newCustomers}</p>
              <span className="text-[11px] text-gray-500">1 purchase made</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">Returning Customers</span>
              <p className="text-2xl font-extrabold text-gray-900">{returningCustomers}</p>
              <span className="text-[11px] text-gray-500">2 or more purchases</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 block">Orders / Customer</span>
              <p className="text-2xl font-extrabold text-gray-900">{avgOrdersPerCustomer}</p>
              <span className="text-[11px] text-gray-500">Order velocity factor</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">Inactive / Lapsed</span>
              <p className="text-2xl font-extrabold text-gray-900">{inactiveCustomers}</p>
              <span className="text-[11px] text-gray-500">&gt; 90 days without order</span>
            </div>
          </div>

          {/* Quick Segmentation Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFB000]" />
                  High-Value Customers
                </h3>
                <span className="text-xs font-bold text-[#FF6A00]">
                  {customers.filter((c) => c.customerType === 'High-Value').length} VIPs
                </span>
              </div>
              <div className="space-y-2">
                {customers
                  .filter((c) => c.customerType === 'High-Value')
                  .slice(0, 4)
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="p-3 bg-orange-50/50 hover:bg-orange-50 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <p className="text-[11px] text-gray-500">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#FF6A00] block">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-gray-400">{c.ordersCount} orders</span>
                      </div>
                    </div>
                  ))}
                {customers.filter((c) => c.customerType === 'High-Value').length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No high-value customers classified yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Top Repeat Buyers
                </h3>
                <span className="text-xs font-bold text-emerald-600">{repeatCustomersCount} Loyal</span>
              </div>
              <div className="space-y-2">
                {topFrequentOrderers.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-[11px] text-gray-500">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">{c.ordersCount} Orders</span>
                      <span className="text-[10px] text-gray-400">AOV: ₹{c.averageOrderValue || 0}</span>
                    </div>
                  </div>
                ))}
                {topFrequentOrderers.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No repeat orders recorded yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Lapsed Re-engagement Alert
                </h3>
                <span className="text-xs font-bold text-amber-600">{inactiveCustomers} Inactive</span>
              </div>
              <div className="space-y-2">
                {inactiveLapsedCustomers.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-[11px] text-gray-500">{c.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full block">
                        Lapsed
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : 'No purchases'}
                      </span>
                    </div>
                  </div>
                ))}
                {inactiveLapsedCustomers.length === 0 && (
                  <p className="text-xs text-green-600 py-4 text-center">All registered customers are active!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER DATABASE TAB */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone or ID..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="text-xs font-bold py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
              >
                <option value="ALL">All Segments</option>
                <option value="High-Value">High-Value VIPs</option>
                <option value="Returning">Returning Buyers</option>
                <option value="New">New Customers</option>
                <option value="Inactive">Inactive / Lapsed</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Customer Table */}
          {filteredCustomers.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No customers registered yet.</p>
              <p className="text-[11px] text-gray-400">Customer profiles will appear here as they register and place orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold">
                  <tr>
                    <th className="py-3 px-3">Customer Profile</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Type / Segment</th>
                    <th className="py-3 px-3">Orders</th>
                    <th className="py-3 px-3">Total Spend</th>
                    <th className="py-3 px-3">AOV</th>
                    <th className="py-3 px-3">Last Purchase</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF6A00] font-bold text-xs flex items-center justify-center shrink-0">
                            {cust.name ? cust.name.substring(0, 2).toUpperCase() : 'CU'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{cust.name || 'Anonymous'}</p>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {cust.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="text-gray-900 font-medium">{cust.phone || 'No phone'}</p>
                        <p className="text-[11px] text-gray-400">{cust.email || 'No email'}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.customerType === 'High-Value'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : cust.customerType === 'Returning'
                              ? 'bg-blue-100 text-blue-800'
                              : cust.customerType === 'Inactive'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {cust.customerType || 'New'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">{cust.ordersCount || 0}</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">
                        ₹{(cust.totalSpend || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-600">
                        ₹{(cust.averageOrderValue || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-gray-500">
                        {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString('en-IN') : 'No orders'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-3 py-1 bg-gray-100 hover:bg-[#FF6A00] hover:text-white rounded-lg text-gray-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>360° Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. PURCHASE BEHAVIOUR ANALYTICS TAB */}
      {activeTab === 'behaviour' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Spenders */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
                    Highest Lifetime Spenders
                  </h3>
                  <p className="text-xs text-gray-500">Customers driving the greatest cumulative revenue</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {topSpenders.slice(0, 5).map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border font-bold text-[10px] text-gray-500 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <span className="text-[10px] text-gray-400">{c.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400">{c.ordersCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Frequent Orderers */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    Most Frequent Orderers
                  </h3>
                  <p className="text-xs text-gray-500">Clients with highest repeat order frequency</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {topFrequentOrderers.slice(0, 5).map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border font-bold text-[10px] text-gray-500 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <span className="text-[10px] text-gray-400">{c.email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">{c.ordersCount} orders</span>
                      <span className="text-[10px] text-gray-400">Total: ₹{c.totalSpend.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fans Category Frequent Buyers */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    Top Fans Buyers
                  </h3>
                  <p className="text-xs text-gray-500">Clients with highest affinity for Fans & BLDC models</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {fanPurchasers.slice(0, 5).map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-orange-50/50 hover:bg-orange-50 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border font-bold text-[10px] text-gray-500 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <span className="text-[10px] text-gray-400">{c.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#FF6A00] block">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400">Pref: {c.preferredBrands?.[0] || 'ORIENT'}</span>
                    </div>
                  </div>
                ))}
                {fanPurchasers.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No fan purchasers recorded yet.</p>
                )}
              </div>
            </div>

            {/* Cross-Category Buyers */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    Multi-Category Buyers
                  </h3>
                  <p className="text-xs text-gray-500">Clients purchasing across Fans, Lights, Switches & Wires</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {multiCategoryBuyers.slice(0, 5).map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 bg-purple-50/50 hover:bg-purple-50 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border font-bold text-[10px] text-gray-500 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <span className="text-[10px] text-gray-400">{c.preferredCategories?.join(', ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-700 block">{c.preferredCategories?.length} Categories</span>
                      <span className="text-[10px] text-gray-400">Total: ₹{c.totalSpend.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
                {multiCategoryBuyers.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No multi-category purchasers recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INDIVIDUAL CUSTOMER 360° PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6A00] font-extrabold text-lg flex items-center justify-center">
                  {selectedCustomer.name ? selectedCustomer.name.substring(0, 2).toUpperCase() : 'CU'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedCustomer.customerType === 'High-Value'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedCustomer.customerType === 'Returning'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedCustomer.customerType || 'Customer'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedCustomer.email} · {selectedCustomer.phone} · ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Spend</span>
                <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                  ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Orders</span>
                <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                  {selectedCustomer.ordersCount} Orders
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Average Order</span>
                <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                  ₹{(selectedCustomer.averageOrderValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-2xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Highest Order</span>
                <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                  ₹{(selectedCustomer.highestOrderValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Preferred Categories & Brands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] block">
                  Preferred Categories
                </span>
                <p className="font-semibold text-gray-800">
                  {selectedCustomer.preferredCategories?.join(', ') || 'General electrical catalog'}
                </p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Preferred Brands
                </span>
                <p className="font-semibold text-gray-800">
                  {selectedCustomer.preferredBrands?.join(', ') || 'ORIENT, Goldmedal'}
                </p>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Order History</h4>
              {selectedCustomerOrders.length === 0 ? (
                <p className="text-xs text-gray-500 py-3">No orders placed by this customer yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">{ord.orderNumber}</span>
                          <span className="px-2 py-0.5 bg-orange-100 text-[#FF6A00] rounded-full text-[10px] font-bold">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')} via {ord.paymentMethod} ({ord.paymentStatus})
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="font-bold text-gray-900">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setSelectedOrderForTracking(ord);
                            setAdminView('orders');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border rounded-lg font-bold text-[10px] text-gray-700"
                        >
                          View Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal CRM Notes */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Internal CRM Notes</h4>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add private staff note (e.g. VIP bulk customer, requested fast delivery)..."
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FF6A00]"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-atharvay-gradient text-white rounded-xl text-xs font-bold shadow-xs hover:shadow disabled:opacity-50"
                >
                  Save Note
                </button>
              </form>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedCustomer.internalNotes && selectedCustomer.internalNotes.length > 0 ? (
                  selectedCustomer.internalNotes.map((note, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-950">
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No internal notes added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
