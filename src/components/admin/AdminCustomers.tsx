import React, { useState } from 'react';
import {
  Search,
  User,
  MapPin,
  ShoppingBag,
  DollarSign,
  PhoneCall,
  Mail,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Order } from '../../types';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, setAdminView } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Get customer specific orders
  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerEmail?.toLowerCase() === selectedCustomer.email?.toLowerCase() ||
          o.customerPhone === selectedCustomer.phone
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage registered homeowners, electrical contractors, order histories, and delivery profiles.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone or email..."
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-bold text-gray-500">
          Total Customers: {customers.length}
        </span>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Primary Address</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No customers registered yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                      Customers who register accounts or place orders on the storefront will appear here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.email || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate">
                      {c.addresses[0]?.city ? `${c.addresses[0].city}, ${c.addresses[0].pincode}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-blue-600">
                      {c.ordersCount} orders
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 tabular-nums font-mono">
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Customer Profile
                </span>
                <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Lifetime Purchases</span>
                <p className="text-lg font-extrabold text-[#FF6A00] font-mono mt-0.5">
                  ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-gray-500">{selectedCustomer.ordersCount} total orders</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Account Status</span>
                <p className="text-base font-bold text-green-700 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedCustomer.status}</span>
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[11px]">
                Contact Information
              </h4>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-gray-800">
                  <PhoneCall className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span className="font-semibold">{selectedCustomer.phone || 'Phone not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800">
                  <Mail className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span className="font-semibold">{selectedCustomer.email || 'Email not provided'}</span>
                </div>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[11px]">
                Saved Delivery Addresses ({selectedCustomer.addresses.length})
              </h4>
              {selectedCustomer.addresses.length === 0 ? (
                <p className="text-gray-400 p-3 bg-gray-50 rounded-xl text-center">No delivery address saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-900">{addr.fullName} · {addr.mobile}</p>
                        <p className="text-gray-600 mt-0.5">
                          {addr.houseBuilding}, {addr.street}, {addr.area}, {addr.city} — {addr.pincode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[11px]">
                Purchase History ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-gray-400 p-3 bg-gray-50 rounded-xl text-center">No past orders found for this account.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-gray-900">{ord.orderNumber}</span>
                        <p className="text-[10px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 font-mono">₹{ord.totalAmount}</span>
                        <span className="block text-[10px] text-[#FF6A00] font-bold">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
