import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubcategoryItem } from '../../types';
import { uploadToStorage } from '../../firebase/services';

export const AdminSubcategories: React.FC = () => {
  const {
    categories,
    subcategories,
    products,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    showToast,
  } = useApp();

  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: categories[0]?.id || 'fans',
    description: '',
    image: '',
    displayOrder: 1,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingSubcategory(null);
    setFormData({
      name: '',
      slug: '',
      categoryId: selectedParentFilter !== 'ALL' ? selectedParentFilter : categories[0]?.id || 'fans',
      description: '',
      image: '',
      displayOrder: subcategories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: SubcategoryItem) => {
    setEditingSubcategory(sub);
    setFormData({
      name: sub.name,
      slug: sub.slug,
      categoryId: sub.categoryId,
      description: sub.description || '',
      image: sub.image || '',
      displayOrder: sub.displayOrder || 1,
      isActive: sub.isActive,
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToStorage(file, 'subcategories');
      setFormData((prev) => ({ ...prev, image: url }));
      showToast('Subcategory image uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Subcategory name is required', 'error');
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingSubcategory) {
      await updateSubcategory(editingSubcategory.id, {
        name: formData.name,
        slug,
        categoryId: formData.categoryId,
        description: formData.description,
        image: formData.image,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      });
    } else {
      await addSubcategory({
        name: formData.name,
        slug,
        categoryId: formData.categoryId,
        description: formData.description,
        image: formData.image,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      });
    }

    setIsModalOpen(false);
  };

  const filteredSubcategories = subcategories.filter((sub) => {
    if (selectedParentFilter !== 'ALL' && sub.categoryId !== selectedParentFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Subcategory Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage granular product classifications and assign parent categories.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subcategory</span>
        </button>
      </div>

      {/* Parent Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-gray-400 pl-2 pr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          Parent:
        </span>
        <button
          onClick={() => setSelectedParentFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedParentFilter === 'ALL'
              ? 'bg-[#171717] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Categories ({subcategories.length})
        </button>
        {categories.map((cat) => {
          const count = subcategories.filter((s) => s.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedParentFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedParentFilter === cat.id
                  ? 'bg-atharvay-gradient text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Subcategory Name</th>
                <th className="py-3 px-4">Parent Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Display Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubcategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No subcategories found for this category.
                  </td>
                </tr>
              ) : (
                filteredSubcategories.map((sub) => {
                  const parentCat = categories.find((c) => c.id === sub.categoryId);
                  const prodCount = products.filter(
                    (p) => p.subcategory?.toLowerCase() === sub.name?.toLowerCase()
                  ).length;

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                          <FolderTree className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p>{sub.name}</p>
                          {sub.description && (
                            <p className="text-[11px] text-gray-400 font-normal line-clamp-1">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-[#FF6A00] border border-orange-100 inline-flex items-center gap-1">
                          {parentCat ? parentCat.name : sub.categoryId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        /{sub.slug}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">
                        {prodCount} items
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {sub.displayOrder || 1}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateSubcategory(sub.id, { isActive: !sub.isActive })}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.isActive ? 'bg-green-100 text-[#168A45]' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {sub.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 text-gray-500 hover:text-[#FF6A00] hover:bg-orange-50 rounded-lg"
                            title="Edit Subcategory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete subcategory "${sub.name}"?`)) {
                                deleteSubcategory(sub.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Subcategory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}
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
                <label className="block font-bold text-gray-700 mb-1">Parent Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subcategory Name *</label>
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
                  placeholder="e.g. BLDC Fans, LED Bulbs, Modular Switches"
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
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subcategory Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="URL or Upload"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'disabled'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
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
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-atharvay-gradient shadow-xs hover:shadow"
                >
                  {editingSubcategory ? 'Update Subcategory' : 'Save Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
