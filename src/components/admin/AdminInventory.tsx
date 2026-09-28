import React, { useState } from 'react';
import { Search, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminInventory: React.FC = () => {
  const { products, updateInventoryStock } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const filtered = products.filter((p) => {
    if (filterType === 'LOW_STOCK' && p.stock > p.lowStockThreshold) return false;
    if (filterType === 'OUT_OF_STOCK' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Real-Time Electrical Inventory & Stock Control
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Maintain stock quantities across Swargate warehouse & online retail allocations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Inventory ({products.length})
          </button>
          <button
            onClick={() => setFilterType('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              filterType === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({products.filter((p) => p.stock <= p.lowStockThreshold).length})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Item & Brand</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 max-w-[240px] truncate">
                      {p.name}
                      <span className="block text-[10px] text-gray-500 font-normal">
                        Brand: {p.brand}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 font-medium">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.categoryName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-gray-900 tabular-nums">
                      {p.stock}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono">
                      {p.lowStockThreshold} units
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#D92D20]">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-[#168A45]">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateInventoryStock(p.id, Math.max(0, p.stock - 5))}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                          title="Reduce 5 units"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateInventoryStock(p.id, p.stock + 5)}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                          title="Add 5 units"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateInventoryStock(p.id, p.stock + 20)}
                          className="px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-[#168A45] font-bold text-[10px]"
                          title="Received Wholesale Batch +20"
                        >
                          +20 Batch
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
