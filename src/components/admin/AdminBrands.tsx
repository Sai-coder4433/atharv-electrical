import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandItem } from '../../types';
import { uploadToStorage } from '../../firebase/services';

export const AdminBrands: React.FC = () => {
  const { brands, products, addBrand, updateBrand, deleteBrand, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logoUrl: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
      description: brand.description || '',
      isActive: brand.isActive,
    });
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadToStorage(file, 'brands');
      setFormData((prev) => ({ ...prev, logoUrl: url }));
      showToast('Brand logo uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingBrand) {
      await updateBrand(editingBrand.id, {
        name: formData.name,
        slug,
        logoUrl: formData.logoUrl,
        description: formData.description,
        isActive: formData.isActive,
      });
    } else {
      await addBrand({
        name: formData.name,
        slug,
        logoUrl: formData.logoUrl,
        description: formData.description,
        isActive: formData.isActive,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Brand Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage authorized partner brands (ORIENT, Goldmedal, etc.) and store logos.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {brands.map((brand) => {
          const brandProducts = products.filter(
            (p) => p.brand?.toLowerCase() === brand.name?.toLowerCase() || p.brandId === brand.id
          );

          return (
            <div
              key={brand.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                brand.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6A00] flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Award className="w-6 h-6 text-[#FF6A00]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{brand.name}</h3>
                      <span className="text-[11px] font-mono text-gray-400">/{brand.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      brand.isActive ? 'bg-green-100 text-[#168A45]' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {brand.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-3">{brand.description || 'Authorized partner brand.'}</p>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FF6A00] bg-orange-50 px-2.5 py-1 rounded-md">
                    {brandProducts.length} Products Linked
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => updateBrand(brand.id, { isActive: !brand.isActive })}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  {brand.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#168A45]" />
                      <span>Enable</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    className="p-1.5 text-gray-500 hover:text-[#FF6A00] hover:bg-orange-50 rounded-lg"
                    title="Edit Brand"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete brand "${brand.name}"?`)) {
                        deleteBrand(brand.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {editingBrand ? 'Edit Brand' : 'Register New Brand'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    }))
                  }
                  placeholder="e.g. ORIENT, Goldmedal, Havells"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full font-mono px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Brand Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brand description and authorized partner note..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Brand Logo (Storage / URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://... or upload file"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.isActive ? 'active' : 'disabled'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-atharvay-gradient shadow-xs hover:shadow"
                >
                  {editingBrand ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
