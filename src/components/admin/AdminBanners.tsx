import React, { useState } from 'react';
import { Image as ImageIcon, Edit2, CheckCircle2, Upload, Plus, Trash2, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HeroBanner } from '../../types';
import { uploadToStorage } from '../../firebase/services';

export const AdminBanners: React.FC = () => {
  const { heroBanners, updateHeroBanner, addHeroBanner, deleteHeroBanner, showToast } = useApp();
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newBanner, setNewBanner] = useState<Omit<HeroBanner, 'id'>>({
    title: '',
    subtitle: '',
    ctaText: 'Shop Now',
    ctaLink: '',
    categoryFilter: '',
    brandFilter: '',
    brandTag: 'ATHARV EXCLUSIVE',
    image: '',
    active: true,
    order: heroBanners.length + 1,
    hideTextOverlay: false,
  });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isNew: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Auto-compressed via imageOptimizer in uploadToStorage
      const url = await uploadToStorage(file, 'banners', {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.84,
      });

      if (isNew) {
        setNewBanner((prev) => ({ ...prev, image: url }));
      } else if (editingBanner) {
        setEditingBanner((prev) => (prev ? { ...prev, image: url } : null));
      }
      showToast('Banner image compressed and uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!editingBanner.image.trim()) {
      showToast('Please provide an image for the banner slide', 'error');
      return;
    }
    updateHeroBanner(editingBanner.id, editingBanner);
    setEditingBanner(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image.trim()) {
      showToast('Please upload or enter a banner image', 'error');
      return;
    }
    if (!newBanner.title.trim()) {
      showToast('Please enter a headline title', 'error');
      return;
    }
    addHeroBanner(newBanner);
    setIsAddingNew(false);
    setNewBanner({
      title: '',
      subtitle: '',
      ctaText: 'Shop Now',
      ctaLink: '',
      categoryFilter: '',
      brandFilter: '',
      brandTag: 'ATHARV EXCLUSIVE',
      image: '',
      active: true,
      order: heroBanners.length + 2,
      hideTextOverlay: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Homepage Hero Banners & Slides
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure mobile & desktop homepage slides, promotional campaigns, and direct image uploads.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6A00] to-[#F4511E] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Slide List */}
      <div className="grid grid-cols-1 gap-4">
        {heroBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-gray-300 transition-colors"
          >
            {/* Banner Preview Thumbnail */}
            <div className="relative w-full md:w-60 h-28 sm:h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/hero_fan_bldc_1790620359971.jpg';
                }}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                Slide #{idx + 1}
              </span>
            </div>

            {/* Banner Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-[#FF6A00] bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  {banner.brandTag}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    banner.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {banner.active ? '● Active in Carousel' : '○ Disabled'}
                </span>
                {banner.hideTextOverlay && (
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                    Artwork Only (No Scrim)
                  </span>
                )}
              </div>

              <h3 className="font-heading font-bold text-base text-gray-900 leading-snug">
                {banner.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                {banner.subtitle}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs flex-wrap text-gray-500">
                <span>
                  CTA: <strong className="text-gray-800">"{banner.ctaText}"</strong>
                </span>
                <span>·</span>
                <span>
                  Target Category: <strong className="text-gray-800">{banner.categoryFilter || 'All Shop'}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <button
                onClick={() => setEditingBanner(banner)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-400 text-xs font-semibold text-gray-700 bg-white transition-colors"
              >
                Edit Content
              </button>
              <button
                onClick={() => {
                  updateHeroBanner(banner.id, { active: !banner.active });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  banner.active ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                {banner.active ? 'Disable' : 'Enable'}
              </button>
              {heroBanners.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete banner slide "${banner.title}"?`)) {
                      deleteHeroBanner(banner.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-200 flex items-center justify-between">
              <span>Edit Carousel Slide</span>
              <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                Auto-Optimized Upload
              </span>
            </h3>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              {/* Image Preview & Fast Upload */}
              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  Banner Image (Auto-Compressed for Fast Upload)
                </label>

                {editingBanner.image && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                    <img
                      src={editingBanner.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                      Live Preview
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingBanner.image}
                    onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                    required
                    placeholder="https://... or upload below"
                    className="flex-1 px-3 py-2 border rounded-xl"
                  />
                  <label className="px-3.5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Compressing...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  ⚡ Images are compressed client-side to ~100KB in 50ms for lightning-fast loading on mobile.
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  required
                  placeholder="e.g. Smart BLDC Energy Saving Fans"
                  className="w-full px-3 py-2 border rounded-xl focus:border-[#FF6A00] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  required
                  placeholder="Short, compelling description..."
                  className="w-full px-3 py-2 border rounded-xl focus:border-[#FF6A00] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Brand Tag Label</label>
                  <input
                    type="text"
                    value={editingBanner.brandTag}
                    onChange={(e) => setEditingBanner({ ...editingBanner, brandTag: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Target Category Filter</label>
                <input
                  type="text"
                  value={editingBanner.categoryFilter || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, categoryFilter: e.target.value })}
                  placeholder="e.g. fans, lights, switches, wires (leave blank for all)"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="hideTextOverlay"
                  checked={editingBanner.hideTextOverlay ?? false}
                  onChange={(e) => setEditingBanner({ ...editingBanner, hideTextOverlay: e.target.checked })}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <label htmlFor="hideTextOverlay" className="font-semibold text-gray-700 select-none cursor-pointer">
                  Hide Text Scrim (Check this if your banner image already has graphic text designed into it)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="flex-1 py-2.5 border rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 text-white font-bold rounded-xl bg-atharvay-gradient shadow-sm hover:shadow-md transition-all"
                >
                  Save Slide Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW SLIDE MODAL */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-200">
              Add New Carousel Slide
            </h3>

            <form onSubmit={handleCreateNew} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  Banner Image (Upload or URL) *
                </label>

                {newBanner.image && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
                    <img
                      src={newBanner.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBanner.image}
                    onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    required
                    placeholder="https://... or upload image"
                    className="flex-1 px-3 py-2 border rounded-xl"
                  />
                  <label className="px-3.5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Compressing...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Headline Title *</label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  required
                  placeholder="e.g. Festival Special: Orient BLDC Fans"
                  className="w-full px-3 py-2 border rounded-xl focus:border-[#FF6A00] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Subtitle Description *</label>
                <textarea
                  rows={2}
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  required
                  placeholder="Save up to 40% on 5-Star rated BLDC fans..."
                  className="w-full px-3 py-2 border rounded-xl focus:border-[#FF6A00] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={newBanner.ctaText}
                    onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-900 block mb-1">Brand Tag Label</label>
                  <input
                    type="text"
                    value={newBanner.brandTag}
                    onChange={(e) => setNewBanner({ ...newBanner, brandTag: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 border rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 text-white font-bold rounded-xl bg-atharvay-gradient shadow-sm hover:shadow-md transition-all"
                >
                  Create Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
