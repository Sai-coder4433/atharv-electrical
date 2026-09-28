import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Star,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

interface ShopListingProps {
  onOpenProductDetail: (product: Product) => void;
}

export const ShopListing: React.FC<ShopListingProps> = ({
  onOpenProductDetail,
}) => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedBrand,
    setSelectedBrand,
    searchQuery,
    setSearchQuery,
    setCustomerView,
  } = useApp();

  // Filters state
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
  >('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active Category details
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCat = p.categoryName.toLowerCase().includes(q);
          const matchSub = p.subcategory.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchCat && !matchSub) return false;
        }

        // Category
        if (selectedCategory && p.categoryId !== selectedCategory) {
          return false;
        }

        // Subcategory
        if (selectedSubcategory && p.subcategory !== selectedSubcategory) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) {
          return false;
        }

        // Price
        if (p.sellingPrice > maxPrice) {
          return false;
        }

        // Rating
        if (minRating > 0 && p.rating < minRating) {
          return false;
        }

        // Stock
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.reviewCount - a.reviewCount; // 'popular'
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrand('ALL');
    setSearchQuery('');
    setMaxPrice(15000);
    setMinRating(0);
    setInStockOnly(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center text-xs text-[#666666] mb-3">
        <button
          onClick={() => {
            setCustomerView('home');
            resetFilters();
          }}
          className="hover:text-[#171717]"
        >
          Home
        </button>
        <span className="mx-2 text-[#929292]">/</span>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }}
          className={`hover:text-[#171717] ${!selectedCategory ? 'font-bold text-[#171717]' : ''}`}
        >
          Shop
        </button>
        {activeCategoryObj && (
          <>
            <span className="mx-2 text-[#929292]">/</span>
            <span className="font-semibold text-[#171717]">{activeCategoryObj.name}</span>
          </>
        )}
        {selectedSubcategory && (
          <>
            <span className="mx-2 text-[#929292]">/</span>
            <span className="font-bold text-[#FF6A00]">{selectedSubcategory}</span>
          </>
        )}
      </nav>

      {/* 2. Page Heading & Subheading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#EAEAEA] gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            {selectedSubcategory
              ? selectedSubcategory
              : activeCategoryObj
              ? activeCategoryObj.name
              : selectedBrand !== 'ALL'
              ? `${selectedBrand} Official Catalog`
              : 'All Electrical Products'}
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-2xl font-medium">
            {activeCategoryObj
              ? activeCategoryObj.description
              : 'Explore verified premium electricals from Orient Electric and Goldmedal Systems with full manufacturer warranty.'}
          </p>
        </div>

        {/* Controls: Result count & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#EAEAEA] bg-white text-[#171717]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Filters</span>
          </button>

          <span className="text-xs text-[#929292] whitespace-nowrap">
            Showing <strong>{filteredProducts.length}</strong> products
          </span>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold text-[#171717] bg-[#F8F8F7] hover:bg-white pl-3 pr-8 py-2 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#666666] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Subcategory Horizontal Chips if category is selected */}
      {activeCategoryObj && (
        <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#EAEAEA]">
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              !selectedSubcategory
                ? 'bg-atharvay-gradient text-white shadow-xs'
                : 'bg-[#F8F8F7] text-[#666666] hover:text-[#171717] border border-[#EAEAEA]'
            }`}
          >
            All {activeCategoryObj.name}
          </button>
          {activeCategoryObj.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-atharvay-gradient text-white shadow-xs'
                  : 'bg-white text-[#666666] hover:text-[#171717] border border-[#EAEAEA]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 4. Desktop Sidebar Filter + Products Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block col-span-1 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
            <h3 className="font-heading font-bold text-sm text-[#171717] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF6A00]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-[#FF6A00] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Brand Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-2.5">
              Authorized Brand
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'All Brands', value: 'ALL' },
                { label: 'ORIENT Electric', value: 'ORIENT' },
                { label: 'Goldmedal Systems', value: 'Goldmedal' },
                { label: 'ATHARV ELECTRICAL', value: 'Other' },
              ].map((b) => (
                <label
                  key={b.value}
                  className="flex items-center gap-2 cursor-pointer text-[#171717] hover:text-[#FF6A00]"
                >
                  <input
                    type="radio"
                    name="brandFilter"
                    checked={selectedBrand === b.value}
                    onChange={() => setSelectedBrand(b.value as any)}
                    className="accent-[#FF6A00]"
                  />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-2.5">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`block w-full text-left py-1 hover:text-[#FF6A00] ${
                  !selectedCategory ? 'font-bold text-[#FF6A00]' : 'text-[#666666]'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setSelectedSubcategory(null);
                    }}
                    className={`flex items-center justify-between w-full text-left py-1 hover:text-[#FF6A00] ${
                      selectedCategory === c.id ? 'font-bold text-[#FF6A00]' : 'text-[#666666]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-[#929292]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292]">
                Max Price
              </h4>
              <span className="text-xs font-bold text-[#171717] tabular-nums">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={15000}
              step={200}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FF6A00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#929292] mt-1">
              <span>₹200</span>
              <span>₹15,000+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-2.5">
              Minimum Rating
            </h4>
            <div className="space-y-1.5 text-xs">
              {[4.5, 4.0, 3.0].map((star) => (
                <label
                  key={star}
                  className="flex items-center gap-2 cursor-pointer text-[#171717] hover:text-[#FF6A00]"
                >
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={minRating === star}
                    onChange={() => setMinRating(minRating === star ? 0 : star)}
                    className="accent-[#FF6A00]"
                  />
                  <div className="flex items-center gap-1 text-[#FF8A00]">
                    <span>{star}★ & above</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171717]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-[#FF6A00]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Right Products Grid (Desktop 3 or 4 cols, Mobile 2 cols) */}
        <div className="col-span-1 md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#F8F8F7] rounded-2xl border border-[#EAEAEA]">
              <h3 className="font-heading font-bold text-base text-[#171717]">
                No electrical products match your filters
              </h3>
              <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
                Try loosening your filters or resetting the category to view our complete store inventory.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetail={onOpenProductDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <h3 className="font-heading font-bold text-sm text-[#171717]">
                  Filter Products
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#666666]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold uppercase text-[#929292] mb-2">
                  Brand
                </h4>
                {['ALL', 'ORIENT', 'Goldmedal'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b as any)}
                    className={`block w-full text-left py-1 text-xs ${
                      selectedBrand === b ? 'text-[#FF6A00] font-bold' : 'text-[#666666]'
                    }`}
                  >
                    {b === 'ALL' ? 'All Brands' : b}
                  </button>
                ))}
              </div>

              {/* Price Slider */}
              <div>
                <h4 className="text-xs font-bold uppercase text-[#929292] mb-2">
                  Max Price: ₹{maxPrice}
                </h4>
                <input
                  type="range"
                  min={200}
                  max={15000}
                  step={200}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#FF6A00]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2 text-xs font-semibold border rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
