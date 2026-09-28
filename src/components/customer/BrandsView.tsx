import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BrandsView: React.FC = () => {
  const { setSelectedBrand, setSelectedCategory, setCustomerView } = useApp();

  const handleSelectBrand = (brand: 'ORIENT' | 'Goldmedal') => {
    setSelectedBrand(brand);
    setSelectedCategory(null);
    setCustomerView('shop');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FFF3E6] px-3 py-1 rounded-full">
          Authorized Electrical Brands
        </span>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#171717] mt-2">
          Partnered with India's Most Trusted Electrical Brands
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 font-medium">
          ATHARV ELECTRICAL is an official channel dealer for ORIENT Electric and Goldmedal Electricals. All products include original manufacturer warranty cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand 1: ORIENT Electric */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-8 shadow-xs hover:border-[#FFB000] transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F8F8F7] border border-[#EAEAEA] flex items-center justify-center font-heading font-black text-lg text-[#171717]">
                  OR
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#171717]">
                    ORIENT Electric
                  </h2>
                  <span className="text-xs font-semibold text-[#168A45] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Authorized Dealer Channel
                  </span>
                </div>
              </div>
              <span className="text-xs bg-[#FFF3E6] text-[#FF6A00] font-bold px-2.5 py-1 rounded-full">
                Fans & Ventilation
              </span>
            </div>

            <p className="text-xs text-[#666666] mt-4 leading-relaxed">
              Orient Electric is an Indian pioneer in high-speed and BLDC ceiling fans, decorative aerodynamic fans, exhaust units, and domestic appliances. Engineered for whisper-quiet performance and maximum tropical airflow.
            </p>

            <div className="mt-5 space-y-2 text-xs text-[#171717]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6A00]" />
                <span>BEE 5-Star Energy Saver BLDC Motors</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF6A00]" />
                <span>Up to 3 Years Comprehensive On-Site Warranty</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
            <span className="text-xs text-[#929292]">Browse 15+ demo fans</span>
            <button
              onClick={() => handleSelectBrand('ORIENT')}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs flex items-center gap-1.5"
            >
              <span>Explore ORIENT Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brand 2: Goldmedal Electricals */}
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-8 shadow-xs hover:border-[#FFB000] transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F8F8F7] border border-[#EAEAEA] flex items-center justify-center font-heading font-black text-lg text-[#171717]">
                  GM
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#171717]">
                    Goldmedal Systems
                  </h2>
                  <span className="text-xs font-semibold text-[#168A45] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Authorized Dealer Channel
                  </span>
                </div>
              </div>
              <span className="text-xs bg-[#FFF3E6] text-[#FF6A00] font-bold px-2.5 py-1 rounded-full">
                Lighting & Switches
              </span>
            </div>

            <p className="text-xs text-[#666666] mt-4 leading-relaxed">
              Goldmedal is celebrated for award-winning modular switch designs, feather-touch acoustic switches, child-safe sockets, architectural LED panels, and robust circuit breakers designed for Indian home electrical requirements.
            </p>

            <div className="mt-5 space-y-2 text-xs text-[#171717]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6A00]" />
                <span>High Surge 4kV & 5kV Protected LED Panels</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF6A00]" />
                <span>10 Years Mechanical Guarantee on Switches</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
            <span className="text-xs text-[#929292]">Browse 20+ demo electricals</span>
            <button
              onClick={() => handleSelectBrand('Goldmedal')}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs flex items-center gap-1.5"
            >
              <span>Explore Goldmedal Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
