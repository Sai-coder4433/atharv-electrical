import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, Zap, Check } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const { addToCart, wishlist, toggleWishlist, setSelectedProductId, setCustomerView } = useApp();
  const [isAdded, setIsAdded] = useState(false);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      const types = Array.from(new Set(product.variants.map((v) => v.name)));
      types.forEach((type) => {
        const first = product.variants?.find((v) => v.name === type);
        if (first && first.value) initial[type] = first.value;
      });
    }
    return initial;
  });

  const isWishlisted = wishlist.includes(product.id);

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    if (onOpenDetail) {
      onOpenDetail(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedVariants, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedVariants, 1);
    setCustomerView('checkout');
  };

  // Important variant for quick selection
  const primaryVariantKey = product.variants && product.variants.length > 0 ? product.variants[0].name : null;
  const primaryVariants = primaryVariantKey
    ? product.variants?.filter((v) => v.name === primaryVariantKey).slice(0, 3)
    : [];

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-[#EAEAEA] hover:border-[#FFB000] p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      <div>
        {/* 1. Brand & Wishlist */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#666666] bg-[#F8F8F7] px-2 py-0.5 rounded border border-[#EAEAEA]">
            {product.brand}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="p-1 rounded-full text-[#929292] hover:text-[#FF6A00] transition-colors"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'text-[#F4511E] fill-[#F4511E]' : ''
              }`}
            />
          </button>
        </div>

        {/* 2. Product Image */}
        <div className="relative w-full aspect-square bg-[#F8F8F7] rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-300 group-hover:scale-108"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/src/assets/images/hero_fan_bldc_1790620359971.jpg';
            }}
          />

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div
              className="absolute top-2 left-2 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
              }}
            >
              {product.discountPercentage}% OFF
            </div>
          )}

          {/* Quick View on Hover */}
          <div className="hidden sm:flex absolute inset-0 bg-black/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
            <span className="bg-white/95 text-[#171717] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>
        </div>

        {/* 3. Product Name */}
        <h3 className="font-semibold text-xs sm:text-sm text-[#171717] group-hover:text-[#FF6A00] transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* 4. Rating */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <div className="flex items-center gap-0.5 bg-[#168A45]/10 text-[#168A45] font-bold px-1.5 py-0.5 rounded text-[10px]">
            <span>{product.rating}</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
          <span className="text-[11px] text-[#929292]">
            ({product.reviewCount})
          </span>
        </div>

        {/* 5. Important Variant Selector */}
        {primaryVariants && primaryVariants.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] text-[#929292] mr-0.5">{primaryVariantKey}:</span>
            {primaryVariants.map((vr) => (
              <button
                key={vr.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (vr.value) {
                    setSelectedVariants((prev) => ({ ...prev, [vr.name]: vr.value as string }));
                  }
                }}
                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                  selectedVariants[vr.name] === vr.value
                    ? 'border-[#FF6A00] bg-[#FFF3E6] text-[#FF6A00] font-bold'
                    : 'border-[#EAEAEA] bg-white text-[#666666]'
                }`}
              >
                {vr.value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. Pricing & Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-[#F8F8F7]">
        {/* Selling Price + MRP */}
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-[#171717] tabular-nums">
            ₹{product.sellingPrice.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-[#929292] line-through tabular-nums">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Buy Now optimized for mobile and desktop */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2 sm:py-2.5 px-1.5 sm:px-2 text-center text-[11px] sm:text-xs font-bold rounded-xl border transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 touch-manipulation select-none ${
              isAdded
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-[#F8F8F7] hover:bg-[#FFF3E6] text-[#171717] hover:text-[#FF6A00] border-[#EAEAEA] hover:border-[#FF8A00]'
            }`}
            title="Add to Cart"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="truncate">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-2 sm:py-2.5 px-1.5 sm:px-2 text-center text-[11px] sm:text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 touch-manipulation select-none"
            style={{
              background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
            }}
            title="Buy Now"
          >
            <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
