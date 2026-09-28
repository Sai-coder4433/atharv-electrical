import React, { useState } from 'react';
import { Search, User, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCustomers: React.FC = () => {
  const { customers } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered homeowners, electrical contractors, and billing accounts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone or email..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Mobile</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Primary City</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-700">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.email}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.addresses[0]?.city || 'Pune'}, {c.addresses[0]?.pincode}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono">
                    {c.ordersCount} orders
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                    ₹{c.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-[#168A45]">
                      {c.status}
                    </span>
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
