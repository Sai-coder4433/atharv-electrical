import React from 'react';
import { useApp } from '../../context/AppContext';

export const QuickCategorySection: React.FC = () => {
  const { categories, setSelectedCategory, setSelectedSubcategory, setSelectedBrand, setCustomerView } = useApp();

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSelectedBrand('ALL');
    setCustomerView('shop');
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-0.5 font-medium">
            Everything you need for your home & electrical projects.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setCustomerView('shop');
          }}
          className="hidden sm:inline-flex items-center text-xs font-semibold text-[#FF6A00] hover:text-[#F4511E] transition-colors"
        >
          View All Products →
        </button>
      </div>

      {/* Categories Grid (Desktop 8-cols / 4-cols, Mobile smooth horizontal scroll) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className="group cursor-pointer bg-white rounded-xl p-2.5 sm:p-3 text-center border border-[#EAEAEA] hover:border-[#FF8A00] hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between"
          >
            {/* Category Image container */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#F8F8F7] p-1 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform duration-200">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Category Name */}
            <div className="w-full">
              <h3 className="text-xs sm:text-xs font-bold text-[#171717] group-hover:text-[#FF6A00] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[10px] text-[#929292] mt-0.5 line-clamp-1 hidden sm:block">
                {cat.subcategories.length} sub-types
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
