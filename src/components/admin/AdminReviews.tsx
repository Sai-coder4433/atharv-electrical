import React, { useState } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductReview } from '../../types';

export const AdminReviews: React.FC = () => {
  const { reviews, moderateReview, showToast } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'Approved' | 'Pending' | 'Hidden'>('ALL');

  const filtered = reviews.filter((r) => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Approve, moderate and hide verified customer feedback before public display.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
          {(['ALL', 'Approved', 'Pending', 'Hidden'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === st
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Feedback Comment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No reviews in this status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">
                      {rev.productName}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{rev.customerName}</p>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] text-[#168A45] font-bold">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-[#FF6A00] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FF6A00]" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-gray-600 italic">
                      "{rev.comment}"
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                      {rev.date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.status === 'Approved'
                            ? 'bg-green-100 text-[#168A45]'
                            : rev.status === 'Hidden'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== 'Approved' && (
                          <button
                            onClick={() => moderateReview(rev.id, 'Approved')}
                            className="p-1.5 rounded-lg text-[#168A45] hover:bg-green-50"
                            title="Approve Review"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {rev.status !== 'Hidden' && (
                          <button
                            onClick={() => moderateReview(rev.id, 'Hidden')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            title="Hide Review"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
