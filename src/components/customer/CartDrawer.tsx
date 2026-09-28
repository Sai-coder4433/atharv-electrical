import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryCharge,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCustomerView,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 1999;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCustomerView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Click outside to close */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Slide-out Drawer Container */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F8F7]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF6A00]" />
            <h2 className="font-heading text-lg font-bold text-[#171717]">
              Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-[#666666] hover:text-[#171717] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Incentive Bar */}
        {cart.length > 0 && (
          <div className="px-4 py-2.5 bg-[#FFF3E6] border-b border-[#FFE0B2]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-[#171717]">
                <Truck className="w-3.5 h-3.5 text-[#FF6A00]" />
                {amountNeededForFreeDelivery === 0 ? (
                  <strong className="text-[#168A45]">You have unlocked FREE Express Delivery!</strong>
                ) : (
                  <span>Add <strong>₹{amountNeededForFreeDelivery.toLocaleString('en-IN')}</strong> more for Free Delivery</span>
                )}
              </span>
              <span className="text-[10px] font-bold text-[#FF6A00]">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FFE0B2] rounded-full overflow-hidden">
              <div
                className="h-full bg-atharvay-gradient transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#EAEAEA]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF3E6] flex items-center justify-center text-[#FF6A00]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#171717]">
                  Your cart is waiting for something useful.
                </h3>
                <p className="text-xs text-[#666666] mt-1 max-w-xs">
                  Explore energy-saving BLDC ceiling fans, LED lighting, or modular switch plates.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCustomerView('shop');
                }}
                className="px-6 py-2.5 rounded-lg text-white font-bold text-xs shadow-sm bg-atharvay-gradient"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3.5 flex gap-3">
                {/* Thumbnail */}
                <div className="w-18 h-18 rounded-lg bg-[#F8F8F7] border border-[#EAEAEA] p-1.5 shrink-0 flex items-center justify-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#929292]">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-bold text-[#171717] truncate leading-tight">
                      {item.product.name}
                    </h4>

                    {/* Variant tags */}
                    {Object.entries(item.selectedVariants).length > 0 && (
                      <p className="text-[11px] text-[#666666] mt-0.5">
                        {Object.entries(item.selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Price Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#EAEAEA] rounded-md bg-[#F8F8F7] text-xs">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-[#666666] hover:text-[#171717]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-[#666666] hover:text-[#171717]"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#171717] tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#929292] hover:text-[#D92D20] p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom: Coupon + Bill Summary + Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F8F7] space-y-3">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#168A45]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon "{appliedCoupon.code}" applied (-₹{cartDiscount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[#D92D20] font-bold text-[11px] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. ATHARV10)"
                    className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-[#171717] text-white hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#171717] tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-[#168A45]">
                  <span>Coupon Discount</span>
                  <span className="font-semibold tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping & Express Dispatch</span>
                <span className="font-semibold tabular-nums">
                  {cartDeliveryCharge === 0 ? (
                    <span className="text-[#168A45] font-bold">FREE</span>
                  ) : (
                    `₹${cartDeliveryCharge}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#171717] pt-2 border-t border-[#EAEAEA]">
                <span>Total Amount</span>
                <span className="text-base tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
              style={{
                background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#929292]">
              <ShieldCheck className="w-3 h-3 text-[#168A45]" />
              <span>Safe & Secure Indian Electrical Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
