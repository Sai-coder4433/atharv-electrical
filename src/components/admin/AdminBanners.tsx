import React, { useState } from 'react';
import { Image, Edit2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HeroBanner } from '../../types';

export const AdminBanners: React.FC = () => {
  const { heroBanners, updateHeroBanner, showToast } = useApp();
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    updateHeroBanner(editingBanner.id, editingBanner);
    setEditingBanner(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Homepage 3-Slide Carousel Banners
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure headline copy, promotional CTAs, and active slide priority.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {heroBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-full md:w-56 aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded">
                  Slide #{idx + 1} · {banner.brandTag}
                </span>
                <span className="text-[10px] text-gray-400">
                  {banner.active ? '● Active in Carousel' : '○ Disabled'}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                {banner.title}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">{banner.subtitle}</p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="font-semibold text-gray-800">
                  CTA Label: <strong>"{banner.ctaText}"</strong>
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">
                  Filter Target: <strong>{banner.categoryFilter || 'All'}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingBanner(banner)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 text-xs font-semibold text-gray-700 bg-white"
              >
                Edit Content
              </button>
              <button
                onClick={() => {
                  updateHeroBanner(banner.id, { active: !banner.active });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  banner.active ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                }`}
              >
                {banner.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-200">
              Edit Carousel Slide
            </h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-gray-900 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-gray-900 block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={editingBanner.ctaText}
                  onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-gray-900 block mb-1">Brand Tag Label</label>
                <input
                  type="text"
                  value={editingBanner.brandTag}
                  onChange={(e) => setEditingBanner({ ...editingBanner, brandTag: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="flex-1 py-2 border rounded-lg text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white font-bold rounded-lg bg-atharvay-gradient shadow-xs"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
