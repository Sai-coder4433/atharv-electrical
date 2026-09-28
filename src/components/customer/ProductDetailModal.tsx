import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  Check,
  ShoppingBag,
  Zap,
  MapPin,
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    deliveryPincode,
    setCustomerView,
    showToast,
    reviews,
    products,
    setSelectedProductId,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [checkPin, setCheckPin] = useState(deliveryPincode || '410501');
  const [pinChecked, setPinChecked] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  // Group variants by type
  const variantGroups: Record<string, typeof product.variants> = {};
  if (product.variants) {
    product.variants.forEach((v) => {
      if (!variantGroups[v.name]) {
        variantGroups[v.name] = [];
      }
      variantGroups[v.name]!.push(v);
    });
  }

  // Selected state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(variantGroups).forEach(([key, list]) => {
      if (list && list.length > 0) {
        initial[key] = list[0].value;
      }
    });
    return initial;
  });

  const isWishlisted = wishlist.includes(product.id);

  // Dynamic price calculation
  let currentUnitPrice = product.sellingPrice;
  if (product.variants) {
    for (const [key, val] of Object.entries(selectedVariants)) {
      const match = product.variants.find((v) => v.name === key && v.value === val);
      if (match?.priceDelta) {
        currentUnitPrice += match.priceDelta;
      }
    }
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariants, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariants, quantity);
    onClose();
    setCustomerView('checkout');
  };

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAEAEA] overflow-hidden h-[92vh] sm:h-auto sm:max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header bar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F8F7] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#666666]">
            <span>{product.brand}</span>
            <span>/</span>
            <span>{product.categoryName}</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline font-semibold text-[#171717] truncate max-w-[200px]">
              {product.subcategory}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#666666] hover:text-[#171717] hover:bg-white transition-colors"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Answers customer questions in exact order */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 sm:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. PRODUCT IMAGES */}
            <div>
              <div className="relative aspect-square bg-[#F8F8F7] rounded-2xl overflow-hidden border border-[#EAEAEA] flex items-center justify-center p-4">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
                {product.discountPercentage > 0 && (
                  <div
                    className="absolute top-3 left-3 text-white text-xs font-extrabold px-2.5 py-1 rounded shadow-xs"
                    style={{
                      background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
                    }}
                  >
                    {product.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border-2 p-1 bg-[#F8F8F7] overflow-hidden transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#FF6A00] shadow-xs'
                          : 'border-[#EAEAEA] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column (Exact specified flow) */}
            <div className="space-y-4">
              {/* 2. Brand */}
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FFF3E6] px-2.5 py-1 rounded-md inline-block">
                {product.brand} Official Product
              </span>

              {/* 3. Product Name */}
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#171717] leading-snug">
                {product.name}
              </h1>

              {/* 4. Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-[#168A45] text-white font-bold px-2 py-0.5 rounded">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-[#666666]">
                  {product.reviewCount.toLocaleString('en-IN')} Customer Ratings
                </span>
                <span className="text-[#929292]">· SKU: {product.sku}</span>
              </div>

              {/* 5. Price & 6. Discount */}
              <div className="p-3.5 bg-[#F8F8F7] rounded-xl border border-[#EAEAEA]">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#171717] tabular-nums">
                    ₹{currentUnitPrice.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > currentUnitPrice && (
                    <span className="text-sm text-[#929292] line-through tabular-nums">
                      MRP ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#168A45]">
                    Save ₹{(product.mrp - currentUnitPrice).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] mt-1">
                  Inclusive of all taxes · Official GST invoice included
                </p>
              </div>

              {/* 7. Availability */}
              <div className="text-xs font-semibold text-[#168A45] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} units available at Chakan depot)</span>
              </div>

              {/* 8. Variant Selection */}
              {Object.entries(variantGroups).map(([groupName, variants]) => (
                <div key={groupName} className="pt-1">
                  <label className="text-xs font-bold text-[#171717] block mb-1.5">
                    Select {groupName}: <span className="font-normal text-[#666666]">{selectedVariants[groupName]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants?.map((v) => {
                      const isSelected = selectedVariants[groupName] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [groupName]: v.value }))
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? 'border-[#FF6A00] bg-[#FFF3E6] text-[#FF6A00] shadow-xs'
                              : 'border-[#EAEAEA] bg-white text-[#171717] hover:border-gray-400'
                          }`}
                        >
                          {v.value}
                          {v.priceDelta ? ` (+₹${v.priceDelta})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* 9. Quantity & Action Buttons (Desktop inline) */}
              <div className="hidden sm:flex items-center gap-3 pt-2">
                <div className="flex items-center border border-[#EAEAEA] rounded-lg bg-[#F8F8F7] p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:text-black"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:text-black"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isAdded
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'text-[#171717] bg-[#F8F8F7] hover:bg-[#FFF3E6] hover:text-[#FF6A00] border-[#EAEAEA] hover:border-[#FF8A00]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#FF6A00]" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
                  }}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3 border border-[#EAEAEA] rounded-xl hover:bg-[#F8F8F7] text-[#666666] hover:text-[#FF6A00]"
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'text-[#F4511E] fill-[#F4511E]' : ''}`} />
                </button>
              </div>

              {/* 12. Delivery / Pincode */}
              <div className="p-3 bg-white border border-[#EAEAEA] rounded-xl text-xs">
                <span className="font-bold text-[#171717] block mb-1">
                  Delivery Availability
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={checkPin}
                    onChange={(e) => {
                      setCheckPin(e.target.value.replace(/\D/g, ''));
                      setPinChecked(false);
                    }}
                    placeholder="Enter 6-digit Pincode"
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none flex-1 max-w-[160px]"
                  />
                  <button
                    onClick={() => setPinChecked(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#171717] text-white hover:bg-black"
                  >
                    Check
                  </button>
                  {pinChecked && checkPin.length === 6 && (
                    <span className="text-xs font-medium text-[#168A45] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> 2–3 Days Express Delivery
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 13. Key Features, 14. Specifications, 15. Description, 16. Warranty */}
          <div className="mt-10 border-t border-[#EAEAEA] pt-6 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#171717] mb-2">
                Product Description
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specifications */}
              <div className="bg-[#F8F8F7] rounded-xl p-4 border border-[#EAEAEA]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-3">
                  Technical Specifications
                </h4>
                <dl className="divide-y divide-[#EAEAEA] text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="py-2 flex justify-between">
                      <dt className="text-[#666666] font-medium">{key}</dt>
                      <dd className="font-semibold text-[#171717] text-right">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Warranty & In the Box */}
              <div className="space-y-4">
                <div className="bg-[#FFFCF9] rounded-xl p-4 border border-[#EAEAEA]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-1.5">
                    Warranty & Store Support
                  </h4>
                  <p className="text-xs font-semibold text-[#171717]">
                    {product.warranty}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-1">
                    ATHARV ELECTRICAL coordinates on-site service support from official brand technicians.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#EAEAEA]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-1.5">
                    What's in the Box
                  </h4>
                  <p className="text-xs text-[#666666]">
                    {product.whatsInTheBox}
                  </p>
                </div>
              </div>
            </div>

            {/* 17. Reviews */}
            <div className="border-t border-[#EAEAEA] pt-6">
              <h3 className="font-heading text-lg font-bold text-[#171717] mb-4 flex items-center justify-between">
                <span>Verified Customer Reviews</span>
                <span className="text-xs font-semibold text-[#FF6A00]">
                  {productReviews.length} reviews
                </span>
              </h3>

              {productReviews.length > 0 ? (
                <div className="space-y-3">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-[#F8F8F7] rounded-xl border border-[#EAEAEA]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#171717]">{rev.customerName}</span>
                        <span className="text-[11px] text-[#929292]">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[#FF8A00]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-[#666666] mt-1.5">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#666666] italic">
                  Be the first to review this product from ATHARV ELECTRICAL!
                </p>
              )}
            </div>

            {/* 18. Related Products */}
            {relatedProducts.length > 0 && (
              <div className="border-t border-[#EAEAEA] pt-6">
                <h3 className="font-heading text-base font-bold text-[#171717] mb-3">
                  Related Electrical Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedProductId(rel.id)}
                      className="p-3 rounded-xl border border-[#EAEAEA] hover:border-[#FF6A00] cursor-pointer bg-[#F8F8F7] flex items-center gap-3"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-[#EAEAEA]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#171717] truncate">{rel.name}</p>
                        <p className="text-[11px] font-semibold text-[#FF6A00]">₹{rel.sellingPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Mobile Bottom Action Bar (Fixed, Always Visible & Tap-Friendly on Phones) */}
        <div className="sm:hidden sticky bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-[#EAEAEA] p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.10)] select-none shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#171717] tabular-nums">
                ₹{currentUnitPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > currentUnitPrice && (
                <span className="text-xs text-[#929292] line-through tabular-nums">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-[10px] font-bold text-[#168A45] bg-[#E8F5E9] px-1.5 py-0.5 rounded">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Mobile Quantity Stepper */}
            <div className="flex items-center border border-[#EAEAEA] rounded-lg bg-[#F8F8F7] p-0.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 active:scale-90 touch-manipulation"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-7 text-center text-xs font-bold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 active:scale-90 touch-manipulation"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Large, Touch-Friendly Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs touch-manipulation ${
                isAdded
                  ? 'bg-green-50 border border-green-500 text-green-700'
                  : 'bg-[#FFF3E6] border border-[#FF8A00] text-[#FF6A00]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#FF6A00] shrink-0" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-3 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
              }}
            >
              <Zap className="w-4 h-4 fill-white shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
