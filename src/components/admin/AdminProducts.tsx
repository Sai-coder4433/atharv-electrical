import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Brand } from '../../types';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form state
  const [form, setForm] = useState({
    name: '',
    sku: '',
    brand: 'ORIENT' as Brand,
    categoryId: 'fans',
    subcategory: 'BLDC Fans',
    description: '',
    shortDescription: '',
    mrp: 5000,
    sellingPrice: 3500,
    stock: 25,
    lowStockThreshold: 5,
    warranty: '2 Years Manufacturer Warranty',
    whatsInTheBox: 'Unit, Accessories, Manual',
    image: '/src/assets/images/hero_fan_bldc_1790620359971.jpg',
  });

  const filteredProducts = products.filter((p) => {
    if (selectedBrandFilter !== 'ALL' && p.brand !== selectedBrandFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      showToast('Please enter product name and SKU', 'error');
      return;
    }

    const discountPercentage = Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100);
    const catObj = categories.find((c) => c.id === form.categoryId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: form.name,
        sku: form.sku,
        brand: form.brand,
        categoryId: form.categoryId,
        categoryName: catObj ? catObj.name : 'General',
        subcategory: form.subcategory,
        description: form.description,
        shortDescription: form.shortDescription,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        discountPercentage: Math.max(0, discountPercentage),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        warranty: form.warranty,
        whatsInTheBox: form.whatsInTheBox,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        sku: form.sku,
        brand: form.brand,
        categoryId: form.categoryId,
        categoryName: catObj ? catObj.name : 'General',
        subcategory: form.subcategory,
        description: form.description || 'Premium electrical product certified for Indian domestic standards.',
        shortDescription: form.shortDescription || 'High quality electrical equipment.',
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        discountPercentage: Math.max(0, discountPercentage),
        rating: 4.8,
        reviewCount: 1,
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        status: 'active',
        images: [form.image],
        specifications: { Voltage: '230V AC 50Hz', Origin: 'Made in India' },
        warranty: form.warranty,
        whatsInTheBox: form.whatsInTheBox,
        tags: [form.brand.toLowerCase(), form.categoryId],
      });
      setIsAddModalOpen(false);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      categoryId: p.categoryId,
      subcategory: p.subcategory,
      description: p.description,
      shortDescription: p.shortDescription,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      warranty: p.warranty,
      whatsInTheBox: p.whatsInTheBox,
      image: p.images[0] || '/src/assets/images/hero_fan_bldc_1790620359971.jpg',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live electrical inventory, brands, pricing, and variant specs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Brand:</span>
          {['ALL', 'ORIENT', 'Goldmedal', 'Other'].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrandFilter(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedBrandFilter === b
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 object-contain rounded bg-gray-50 border border-gray-200 p-1"
                      />
                      <span className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-gray-600">
                    {p.sku}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800">{p.brand}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {p.categoryName} · {p.subcategory}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 tabular-nums">
                    ₹{p.sellingPrice.toLocaleString('en-IN')}
                    {p.mrp > p.sellingPrice && (
                      <span className="block text-[10px] text-gray-400 line-through">
                        ₹{p.mrp}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold tabular-nums ${
                        p.stock <= p.lowStockThreshold
                          ? 'text-[#D92D20]'
                          : 'text-gray-900'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stock > 0
                          ? 'bg-green-100 text-[#168A45]'
                          : 'bg-red-100 text-[#D92D20]'
                      }`}
                    >
                      {p.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#D92D20] hover:bg-red-50"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Electrical Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-900 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. ORIENT Aeroquiet BLDC 1200mm Ceiling Fan"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="e.g. OR-AERO-1200"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Brand *</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value as Brand })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="ORIENT">ORIENT Electric</option>
                    <option value="Goldmedal">Goldmedal Systems</option>
                    <option value="Other">ATHARV ELECTRICAL</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        categoryId: e.target.value,
                        subcategory: cat?.subcategories[0] || 'General',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Available Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-900 block mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Warranty Term</label>
                <input
                  type="text"
                  value={form.warranty}
                  onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold rounded-lg bg-atharvay-gradient shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
