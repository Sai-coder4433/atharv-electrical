import React from 'react';
import { Layers, ChevronRight, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCategories: React.FC = () => {
  const { categories, products } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Category & Subcategory Hierarchy
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Organize electrical product classifications and navigation structures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold text-xs">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{cat.name}</h3>
                      <span className="text-[11px] text-gray-500 font-mono">/{cat.slug}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded">
                    {catProducts.length} items live
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-3">{cat.description}</p>

                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => {
                      const subCount = catProducts.filter((p) => p.subcategory === sub).length;
                      return (
                        <span
                          key={sub}
                          className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md border border-gray-200 text-xs font-medium flex items-center gap-1.5"
                        >
                          <span>{sub}</span>
                          <span className="text-[10px] text-gray-400">({subCount})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
