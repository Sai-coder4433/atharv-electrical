import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  Layers,
  Edit2,
  Clock,
  Warehouse,
  History,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, InventoryAdjustmentRecord } from '../../types';

export const AdminInventory: React.FC = () => {
  const { products, inventoryAdjustments, adjustProductStock, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [deltaInput, setDeltaInput] = useState<number>(10);
  const [reasonInput, setReasonInput] = useState<InventoryAdjustmentRecord['reason']>('Restock');
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Drawer
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const filtered = products.filter((p) => {
    if (filterType === 'LOW_STOCK' && p.stock > p.lowStockThreshold) return false;
    if (filterType === 'OUT_OF_STOCK' && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setIsSubmitting(true);
    try {
      await adjustProductStock(adjustingProduct.id, deltaInput, reasonInput, notesInput);
      setAdjustingProduct(null);
      setDeltaInput(10);
      setNotesInput('');
    } catch (err: any) {
      showToast(err.message || 'Stock adjustment failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Inventory & Warehouse Stock Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time replenishment, stock adjustment audit trail, and low stock threshold alerts.
          </p>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold shadow-xs transition-colors"
        >
          <History className="w-4 h-4 text-gray-500" />
          <span>Audit Log History ({inventoryAdjustments.length})</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product name..."
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Inventory ({products.length})
          </button>
          <button
            onClick={() => setFilterType('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              filterType === 'LOW_STOCK'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button
            onClick={() => setFilterType('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'OUT_OF_STOCK'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>Out of Stock ({outOfStockCount})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Item & Brand</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Low Stock Limit</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Warehouse className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No products in inventory.</p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                      Products added in the Products module will be tracked here for stock replenishment.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.mainImage || (p.images && p.images[0]) || '/assets/images/hero_fan_bldc_1790620359971.jpg'}
                            alt={p.name}
                            className="w-8 h-8 object-contain rounded-lg border p-0.5 bg-white shrink-0"
                          />
                          <div className="min-w-0 max-w-[220px]">
                            <p className="font-bold text-gray-900 truncate">{p.name}</p>
                            <span className="text-[10px] text-gray-500 font-medium">Brand: {p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 font-medium">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {p.categoryName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-gray-900 tabular-nums">
                        {p.stock} units
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {p.lowStockThreshold} units
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                              ? 'bg-red-100 text-red-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-[#168A45]'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setDeltaInput(10);
                              setReasonInput('Restock');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FFF3E6] hover:bg-[#FFE0B2] text-[#FF6A00] font-bold text-xs flex items-center gap-1"
                            title="Adjust or Replenish Stock"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Inventory Stock Adjustment
                </span>
                <h3 className="text-base font-bold text-gray-900 truncate max-w-xs">
                  {adjustingProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Current On-Hand Stock:</span>
                <span className="font-mono font-bold text-base text-gray-900">{adjustingProduct.stock} units</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Stock Delta Adjustment (+ to Add, - to Reduce)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeltaInput((prev) => prev - 5)}
                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    required
                    value={deltaInput}
                    onChange={(e) => setDeltaInput(Number(e.target.value))}
                    className="flex-1 py-2 px-3 text-center font-mono font-bold text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <button
                    type="button"
                    onClick={() => setDeltaInput((prev) => prev + 5)}
                    className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center"
                  >
                    +5
                  </button>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Resulting Stock will be:{' '}
                  <strong className="text-gray-900 font-mono">
                    {Math.max(0, adjustingProduct.stock + deltaInput)} units
                  </strong>
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Adjustment Reason</label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-800 focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="Restock">Restock / New Inward Shipment</option>
                  <option value="Correction">Physical Count Correction</option>
                  <option value="Damage / Defect">Damage / Defective Unit Outward</option>
                  <option value="Customer Return">Customer Return Restocked</option>
                  <option value="Manual Adjustment">Manual Showroom Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Optional Notes / Reference</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Invoice #2026-AE, physical audit"
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#F4511E] text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Warehouse Stock Audit Log
                </span>
                <h3 className="font-bold text-base text-gray-900">Historical Stock Adjustments</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inventoryAdjustments.length === 0 ? (
              <p className="text-gray-400 py-8 text-center text-xs">No stock adjustment entries recorded yet.</p>
            ) : (
              <div className="space-y-2 text-xs divide-y divide-gray-100">
                {inventoryAdjustments.map((log) => (
                  <div key={log.id} className="pt-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{log.productName}</span>
                      <span
                        className={`font-mono font-bold ${
                          log.delta > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {log.delta > 0 ? `+${log.delta}` : log.delta} units ({log.previousStock} → {log.newStock})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Reason: {log.reason} · by {log.actorName}</span>
                      <span className="font-mono text-gray-400">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-[10px] text-gray-400 italic">Notes: {log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
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
