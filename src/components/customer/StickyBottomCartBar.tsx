import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StickyBottomCartBar: React.FC = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    cartSubtotal,
    setIsCartOpen,
    customerView,
    setCustomerView,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Hide on checkout, payment-status, or admin pages, or when cart is empty
  const isHidden =
    cartCount === 0 ||
    customerView === 'checkout' ||
    customerView === 'payment-status' ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/payment-status');

  if (isHidden) return null;

  const handleOpenCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCartOpen(true);
  };

  const handleProceedCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/checkout');
    setCustomerView('checkout');
  };

  return (
    <div
      className="fixed z-35 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 bottom-[60px] lg:bottom-6 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      style={{
        filter: 'drop-shadow(0 10px 25px rgba(23, 23, 23, 0.25))',
      }}
    >
      <div
        onClick={handleOpenCart}
        className="group cursor-pointer bg-[#171717] hover:bg-black text-white rounded-2xl p-3 sm:p-3.5 border border-white/15 flex items-center justify-between gap-3 shadow-2xl transition-all duration-200 active:scale-[0.99]"
      >
        {/* Left Section: Item Count & Total */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShoppingBag className="w-5 h-5 text-[#FF8A00]" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-atharvay-gradient text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold text-gray-300">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-gray-500 text-xs">·</span>
              <span className="text-sm sm:text-base font-extrabold text-white tabular-nums tracking-tight">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
              {cartSubtotal >= 1999 ? (
                <span className="text-[#168A45] font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Free Express Delivery
                </span>
              ) : (
                <span>Add ₹{(1999 - cartSubtotal).toLocaleString('en-IN')} for Free Delivery</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Section: View Cart / Checkout Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleProceedCheckout}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-atharvay-gradient hover:brightness-110 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
