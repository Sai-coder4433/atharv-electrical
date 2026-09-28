import React, { useState } from 'react';
import { Tag, Plus, X, Trash2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, showToast } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMinOrder, setNewMinOrder] = useState(1999);
  const [newMaxDisc, setNewMaxDisc] = useState(1000);
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    addCoupon({
      code: newCode.trim().toUpperCase(),
      discountPercentage: Number(newDiscount),
      minOrderAmount: Number(newMinOrder),
      maxDiscount: Number(newMaxDisc),
      expiryDate: '2026-12-31',
      usageLimit: 500,
      usageCount: 0,
      active: true,
      description: newDesc || `${newDiscount}% OFF on orders above ₹${newMinOrder}`,
    });

    setIsAddOpen(false);
    setNewCode('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage checkout promo codes and minimum spend criteria.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-atharvay-gradient shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base font-bold text-gray-900 tracking-wider">
                  {c.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-[#168A45]">
                  {c.discountPercentage}% OFF
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{c.description}</p>
              <div className="text-[11px] text-gray-500 space-y-1 font-mono">
                <p>Min Order: ₹{c.minOrderAmount.toLocaleString('en-IN')}</p>
                <p>Max Discount: ₹{c.maxDiscount.toLocaleString('en-IN')}</p>
                <p>Used: {c.usageCount} times</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${c.active ? 'text-[#168A45]' : 'text-gray-400'}`}>
                {c.active ? '● Active' : '○ Inactive'}
              </span>
              <button
                onClick={() => updateCoupon(c.id, { active: !c.active })}
                className="text-xs font-semibold text-gray-700 hover:text-black hover:underline"
              >
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">Create New Coupon Code</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. DIWALI2026"
                  className="w-full px-3 py-2 border rounded-lg uppercase font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-900 block mb-1">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  value={newMaxDisc}
                  onChange={(e) => setNewMaxDisc(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-gray-900 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Flat 10% off for first-time home buyers"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 border rounded-lg text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white font-bold rounded-lg bg-atharvay-gradient shadow-xs"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
