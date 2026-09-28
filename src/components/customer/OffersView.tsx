import React from 'react';
import { Tag, Sparkles, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OffersView: React.FC = () => {
  const { coupons, applyCoupon, setCustomerView, setSelectedCategory, showToast } = useApp();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    showToast(`Coupon code ${code} copied & applied!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F4511E] bg-[#FFF3E6] px-3 py-1 rounded-full">
          Festive & Season Deals
        </span>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#171717] mt-2">
          ATHARV ELECTRICAL Offers & Deals
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 font-medium">
          Verified discount coupons and volume discounts for home owners and renovators.
        </p>
      </div>

      {/* Featured Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Banner 1: BLDC Fans */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#171717] to-[#262626] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-sm">
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6A00] text-white px-2.5 py-0.5 rounded">
              Orient BLDC Collection
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold mt-3 leading-snug">
              Up to 40% OFF on Inverter BLDC Fans
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-sm">
              Slash electricity bills by 50% with BEE 5-Star rated aerodynamic fans.
            </p>
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedCategory('fans');
                setCustomerView('shop');
              }}
              className="px-4 py-2 rounded-lg text-white font-bold text-xs bg-atharvay-gradient shadow-xs flex items-center gap-1.5"
            >
              <span>Shop BLDC Fans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-[#FFB000]">CODE: FANS2026</span>
          </div>
        </div>

        {/* Banner 2: LED Lighting */}
        <div className="relative rounded-2xl overflow-hidden bg-[#FFF3E6] border border-[#FFE0B2] p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#168A45] text-white px-2.5 py-0.5 rounded">
              Goldmedal Architectural LED
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171717] mt-3 leading-snug">
              Modern Slim Panel & COB Lights
            </h2>
            <p className="text-xs text-[#666666] mt-1 max-w-sm">
              Flicker-free high CRI illumination for living rooms and office ceilings.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedCategory('lights');
                setCustomerView('shop');
              }}
              className="px-4 py-2 rounded-lg text-white font-bold text-xs bg-[#171717] hover:bg-black shadow-xs flex items-center gap-1.5"
            >
              <span>Explore Lighting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-[#FF6A00]">CODE: LIGHTUP500</span>
          </div>
        </div>
      </div>

      {/* Active Coupons Grid */}
      <h3 className="font-heading text-lg font-bold text-[#171717] mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-[#FF6A00]" />
        <span>Available Store Coupons ({coupons.length})</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs flex flex-col justify-between hover:border-[#FFB000] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-extrabold text-[#171717] font-mono tracking-wider">
                  {c.code}
                </span>
                <span className="text-xs font-extrabold text-[#168A45] bg-green-50 px-2 py-0.5 rounded">
                  {c.discountPercentage}% OFF
                </span>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed">
                {c.description}
              </p>
              <div className="mt-3 text-[11px] text-[#929292] space-y-0.5">
                <p>Min Order: ₹{c.minOrderAmount.toLocaleString('en-IN')}</p>
                <p>Max Discount: ₹{c.maxDiscount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EAEAEA]">
              <button
                onClick={() => handleCopy(c.code)}
                className="w-full py-2 rounded-lg border border-[#EAEAEA] hover:border-[#FF6A00] text-xs font-bold text-[#171717] hover:text-[#FF6A00] bg-[#F8F8F7] flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#168A45]" />
                    <span className="text-[#168A45]">Applied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy & Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
