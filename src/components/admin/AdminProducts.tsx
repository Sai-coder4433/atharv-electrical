import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Eye,
  X,
  Upload,
  Check,
  Package,
  Layers,
  Sparkles,
  Percent,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Brand, ProductVariant } from '../../types';
import { uploadToStorage } from '../../firebase/services';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    subcategories,
    brands,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    showToast,
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);

  // Form State (Sections 1-9)
  const [form, setForm] = useState<{
    // 1. Basic Info
    name: string;
    sku: string;
    brand: Brand;
    categoryId: string;
    subcategory: string;
    // 2. Pricing
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    gst: number;
    // 3. Inventory
    stock: number;
    lowStockThreshold: number;
    // 4. Images
    mainImage: string;
    images: string[];
    // 5. Description
    shortDescription: string;
    description: string;
    // 6. Specifications
    specifications: { key: string; value: string }[];
    warranty: string;
    // 7. Variants
    enableVariants: boolean;
    variants: ProductVariant[];
    // 8. SEO
    slug: string;
    seoTitle: string;
    seoDescription: string;
    // 9. Status
    status: 'active' | 'draft' | 'out_of_stock';
  }>({
    name: '',
    sku: '',
    brand: 'ORIENT',
    categoryId: categories[0]?.id || 'fans',
    subcategory: 'BLDC Fans',
    mrp: 5990,
    sellingPrice: 4490,
    discountPercentage: 25,
    gst: 18,
    stock: 25,
    lowStockThreshold: 5,
    mainImage: '/src/assets/images/hero_fan_bldc_1790620359971.jpg',
    images: ['/src/assets/images/hero_fan_bldc_1790620359971.jpg'],
    shortDescription: '',
    description: '',
    specifications: [
      { key: 'Motor Technology', value: 'BLDC Inverter High Torque' },
      { key: 'Power Consumption', value: '28W at Highest Speed' },
    ],
    warranty: '2 Years Comprehensive On-Site Warranty',
    enableVariants: false,
    variants: [],
    slug: '',
    seoTitle: '',
    seoDescription: '',
    status: 'active',
  });

  // Calculate discount dynamically
  const handlePriceChange = (mrpVal: number, sellVal: number) => {
    const disc = mrpVal > 0 ? Math.max(0, Math.round(((mrpVal - sellVal) / mrpVal) * 100)) : 0;
    setForm((prev) => ({
      ...prev,
      mrp: mrpVal,
      sellingPrice: sellVal,
      discountPercentage: disc,
    }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setActiveFormSection(1);
    setForm({
      name: '',
      sku: `AE-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'ORIENT',
      categoryId: categories[0]?.id || 'fans',
      subcategory: 'BLDC Fans',
      mrp: 4999,
      sellingPrice: 3799,
      discountPercentage: 24,
      gst: 18,
      stock: 20,
      lowStockThreshold: 5,
      mainImage: '/src/assets/images/hero_fan_bldc_1790620359971.jpg',
      images: ['/src/assets/images/hero_fan_bldc_1790620359971.jpg'],
      shortDescription: '',
      description: '',
      specifications: [
        { key: 'Warranty', value: '2 Years Manufacturer' },
        { key: 'Certification', value: 'ISI & BEE Star Rated' },
      ],
      warranty: '2 Years Manufacturer Warranty',
      enableVariants: false,
      variants: [],
      slug: '',
      seoTitle: '',
      seoDescription: '',
      status: 'active',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setActiveFormSection(1);
    const specsArray = prod.specifications
      ? Object.entries(prod.specifications).map(([key, value]) => ({ key, value }))
      : [];

    setForm({
      name: prod.name,
      sku: prod.sku,
      brand: prod.brand,
      categoryId: prod.categoryId,
      subcategory: prod.subcategory,
      mrp: prod.mrp,
      sellingPrice: prod.sellingPrice,
      discountPercentage: prod.discountPercentage,
      gst: prod.gst || 18,
      stock: prod.stock,
      lowStockThreshold: prod.lowStockThreshold || 5,
      mainImage: prod.mainImage || prod.images[0] || '',
      images: prod.images || [],
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      specifications: specsArray,
      warranty: prod.warranty || '2 Years',
      enableVariants: Boolean(prod.variants && prod.variants.length > 0),
      variants: prod.variants || [],
      slug: prod.slug,
      seoTitle: prod.seoTitle || prod.name,
      seoDescription: prod.seoDescription || prod.shortDescription,
      status: (prod.status?.toLowerCase() as any) || 'active',
    });
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToStorage(file, 'products');
      if (isMain) {
        setForm((prev) => ({
          ...prev,
          mainImage: url,
          images: [url, ...prev.images.filter((img) => img !== url)],
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, url],
        }));
      }
      showToast('Image uploaded successfully to Firebase Storage', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) {
      showToast('Please enter Product Name and SKU', 'error');
      return;
    }

    const catObj = categories.find((c) => c.id === form.categoryId);
    const specRecord: Record<string, string> = {};
    form.specifications.forEach((s) => {
      if (s.key.trim()) specRecord[s.key.trim()] = s.value;
    });

    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const productPayload = {
      name: form.name,
      slug,
      sku: form.sku,
      brand: form.brand,
      categoryId: form.categoryId,
      categoryName: catObj ? catObj.name : 'General',
      subcategory: form.subcategory,
      description: form.description || form.shortDescription,
      shortDescription: form.shortDescription,
      mrp: Number(form.mrp),
      sellingPrice: Number(form.sellingPrice),
      discountPercentage: Number(form.discountPercentage),
      gst: Number(form.gst),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      status: (Number(form.stock) === 0 ? 'out_of_stock' : form.status) as any,
      mainImage: form.mainImage,
      images: form.images.length > 0 ? form.images : [form.mainImage],
      specifications: specRecord,
      warranty: form.warranty,
      variants: form.enableVariants ? form.variants : [],
      seoTitle: form.seoTitle || form.name,
      seoDescription: form.seoDescription || form.shortDescription,
      rating: editingProduct?.rating || 4.8,
      reviewCount: editingProduct?.reviewCount || 1,
      tags: [form.brand, form.subcategory, catObj?.name || ''].filter(Boolean),
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsFormOpen(false);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchSub = p.subcategory?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBrand && !matchSub) return false;
    }
    if (selectedCategoryFilter !== 'ALL' && p.categoryId !== selectedCategoryFilter) return false;
    if (
      selectedSubcategoryFilter !== 'ALL' &&
      p.subcategory?.toLowerCase() !== selectedSubcategoryFilter.toLowerCase()
    )
      return false;
    if (selectedBrandFilter !== 'ALL' && p.brand !== selectedBrandFilter) return false;
    if (selectedStockFilter === 'IN_STOCK' && p.stock <= p.lowStockThreshold) return false;
    if (selectedStockFilter === 'LOW_STOCK' && (p.stock > p.lowStockThreshold || p.stock === 0))
      return false;
    if (selectedStockFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;
    if (selectedStatusFilter !== 'ALL') {
      const pStatus = p.status?.toLowerCase();
      if (pStatus !== selectedStatusFilter.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage full catalog, pricing, variants, specifications and inventory stock.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by Name, SKU, Brand, or Subcategory..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* 5 Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Subcategory */}
          <select
            value={selectedSubcategoryFilter}
            onChange={(e) => setSelectedSubcategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Subcategories</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Brand */}
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category / Subcategory</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={p.mainImage || p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-xl border border-gray-200 p-1 bg-white shrink-0"
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        <span className="text-[11px] font-mono text-gray-400 block">{p.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          {p.brand}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{p.categoryName || p.categoryId}</p>
                        <p className="text-[11px] text-gray-500">{p.subcategory}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">₹{p.sellingPrice.toLocaleString('en-IN')}</div>
                        {p.mrp > p.sellingPrice && (
                          <div className="text-[11px] text-gray-400 line-through">
                            ₹{p.mrp.toLocaleString('en-IN')} ({p.discountPercentage}% off)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className={
                              isOut
                                ? 'text-red-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-gray-900'
                            }
                          >
                            {p.stock}
                          </span>
                          {isLow && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded-full font-bold">
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'out_of_stock' || isOut
                              ? 'bg-red-100 text-red-700'
                              : p.status === 'draft'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-green-100 text-[#168A45]'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : p.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            title="View Product Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-[#FF6A00] hover:bg-orange-50 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateProduct(p.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Product"
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

      {/* 9-Section Comprehensive Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <span className="text-[11px] text-gray-400">
                  Fill in standard product fields. Synced with Cloud Firestore.
                </span>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (Sections 1-9) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-gray-100 shrink-0 text-xs font-bold text-gray-500">
              {[
                { id: 1, label: '1. Basic Info' },
                { id: 2, label: '2. Pricing' },
                { id: 3, label: '3. Inventory' },
                { id: 4, label: '4. Images' },
                { id: 5, label: '5. Descriptions' },
                { id: 6, label: '6. Specifications' },
                { id: 7, label: '7. Variants' },
                { id: 8, label: '8. SEO' },
                { id: 9, label: '9. Status' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveFormSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    activeFormSection === sec.id
                      ? 'bg-atharvay-gradient text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto py-4 text-xs space-y-4">
              {/* SECTION 1: Basic Information */}
              {activeFormSection === 1 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 1: Basic Information</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. ORIENT Aeroquiet BLDC 1200mm Ceiling Fan"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">SKU *</label>
                      <input
                        type="text"
                        required
                        value={form.sku}
                        onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                        className="w-full font-mono px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Brand *</label>
                      <select
                        value={form.brand}
                        onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value as Brand }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      >
                        {brands.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Category *</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
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
                      <label className="block font-bold text-gray-700 mb-1">Subcategory *</label>
                      <input
                        type="text"
                        value={form.subcategory}
                        onChange={(e) => setForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                        placeholder="e.g. BLDC Fans"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Pricing */}
              {activeFormSection === 2 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 2: Pricing & Taxation</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">MRP (₹) *</label>
                      <input
                        type="number"
                        required
                        value={form.mrp}
                        onChange={(e) => handlePriceChange(Number(e.target.value), form.sellingPrice)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={form.sellingPrice}
                        onChange={(e) => handlePriceChange(form.mrp, Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Calculated Discount Percentage (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          readOnly
                          value={form.discountPercentage}
                          className="w-full bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                        />
                        <span className="font-bold text-[#168A45] whitespace-nowrap">
                          {form.discountPercentage}% OFF
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">GST Rate (%)</label>
                      <select
                        value={form.gst}
                        onChange={(e) => setForm((prev) => ({ ...prev, gst: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      >
                        <option value={18}>18% (Standard Electricals)</option>
                        <option value={12}>12% (LED Fixtures)</option>
                        <option value={28}>28% (Luxury Fittings)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: Inventory */}
              {activeFormSection === 3 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 3: Inventory & Thresholds</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Stock Quantity (Units) *</label>
                      <input
                        type="number"
                        required
                        value={form.stock}
                        onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Low Stock Alert Threshold</label>
                      <input
                        type="number"
                        value={form.lowStockThreshold}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, lowStockThreshold: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Images */}
              {activeFormSection === 4 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 4: Product Images (Storage)</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Main Image URL or Upload</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.mainImage}
                        onChange={(e) => setForm((prev) => ({ ...prev, mainImage: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200"
                      />
                      <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {form.mainImage && (
                    <div className="w-24 h-24 rounded-2xl border border-gray-200 p-1 bg-white">
                      <img src={form.mainImage} alt="Main Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: Description */}
              {activeFormSection === 5 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 5: Descriptions</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Short Description (for listing cards)</label>
                    <input
                      type="text"
                      value={form.shortDescription}
                      onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="e.g. 5-Star BLDC energy saver with silent operation"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Detailed Description</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Full product overview, features, warranty guidelines..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 6: Specifications */}
              {activeFormSection === 6 && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900">Section 6: Specifications</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          specifications: [...prev.specifications, { key: '', value: '' }],
                        }))
                      }
                      className="px-2.5 py-1 text-xs font-bold text-[#FF6A00] bg-orange-50 rounded-lg hover:bg-orange-100"
                    >
                      + Add Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Specification Key (e.g. Sweep Size)"
                          value={spec.key}
                          onChange={(e) => {
                            const newSpecs = [...form.specifications];
                            newSpecs[idx].key = e.target.value;
                            setForm((prev) => ({ ...prev, specifications: newSpecs }));
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 1200 mm)"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...form.specifications];
                            newSpecs[idx].value = e.target.value;
                            setForm((prev) => ({ ...prev, specifications: newSpecs }));
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              specifications: prev.specifications.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Warranty Term</label>
                    <input
                      type="text"
                      value={form.warranty}
                      onChange={(e) => setForm((prev) => ({ ...prev, warranty: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 7: Variants */}
              {activeFormSection === 7 && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900">Section 7: Product Variants</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.enableVariants}
                        onChange={(e) => setForm((prev) => ({ ...prev, enableVariants: e.target.checked }))}
                        className="rounded text-[#FF6A00]"
                      />
                      <span className="font-bold text-gray-800">Enable Variants for Product</span>
                    </label>
                  </div>

                  {form.enableVariants && (
                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            variants: [
                              ...prev.variants,
                              {
                                id: `v-${Date.now()}`,
                                name: 'Color',
                                value: 'Matt Brown',
                                priceDelta: 0,
                                sku: `${prev.sku}-MB`,
                              },
                            ],
                          }))
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#171717] hover:bg-black"
                      >
                        + Add Variant
                      </button>

                      {form.variants.map((vr, vIdx) => (
                        <div key={vr.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Attribute (Color, Wattage, Sweep)"
                            value={vr.name}
                            onChange={(e) => {
                              const newV = [...form.variants];
                              newV[vIdx].name = e.target.value;
                              setForm((prev) => ({ ...prev, variants: newV }));
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 w-36"
                          />
                          <input
                            type="text"
                            placeholder="Option Value (e.g. 1200mm, White)"
                            value={vr.value || ''}
                            onChange={(e) => {
                              const newV = [...form.variants];
                              newV[vIdx].value = e.target.value;
                              setForm((prev) => ({ ...prev, variants: newV }));
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 w-36"
                          />
                          <input
                            type="number"
                            placeholder="Price +/- (₹)"
                            value={vr.priceDelta || 0}
                            onChange={(e) => {
                              const newV = [...form.variants];
                              newV[vIdx].priceDelta = Number(e.target.value);
                              setForm((prev) => ({ ...prev, variants: newV }));
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 w-28"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                variants: prev.variants.filter((_, i) => i !== vIdx),
                              }));
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 8: SEO */}
              {activeFormSection === 8 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 8: Search Engine Optimization</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. orient-aeroquiet-bldc-fan"
                      className="w-full font-mono px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SEO Description</label>
                    <textarea
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 9: Status */}
              {activeFormSection === 9 && (
                <div className="space-y-3.5">
                  <h4 className="font-bold text-sm text-gray-900">Section 9: Product Visibility & Status</h4>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold"
                    >
                      <option value="active">Active (Visible on Customer Store)</option>
                      <option value="draft">Draft (Hidden in Catalog)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeFormSection > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveFormSection((prev) => prev - 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                  )}
                  {activeFormSection < 9 && (
                    <button
                      type="button"
                      onClick={() => setActiveFormSection((prev) => prev + 1)}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200"
                    >
                      Next →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-bold bg-atharvay-gradient shadow-xs hover:shadow"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-mono font-bold text-gray-400">{viewingProduct.sku}</span>
              <button onClick={() => setViewingProduct(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <img
                src={viewingProduct.mainImage || viewingProduct.images[0]}
                alt={viewingProduct.name}
                className="w-20 h-20 object-contain rounded-2xl border p-1 bg-white shrink-0"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded">
                  {viewingProduct.brand}
                </span>
                <h3 className="font-bold text-base text-gray-900 mt-1">{viewingProduct.name}</h3>
                <p className="text-xs font-bold text-gray-900 mt-1">
                  ₹{viewingProduct.sellingPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-gray-400 line-through text-[11px]">
                    ₹{viewingProduct.mrp.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <p>
                <strong>Category:</strong> {viewingProduct.categoryName || viewingProduct.categoryId}
              </p>
              <p>
                <strong>Subcategory:</strong> {viewingProduct.subcategory}
              </p>
              <p>
                <strong>Stock:</strong> {viewingProduct.stock} units
              </p>
              <p>
                <strong>Status:</strong> {viewingProduct.status}
              </p>
              <p>
                <strong>Warranty:</strong> {viewingProduct.warranty}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
