import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Award, Store, PhoneCall, MessageCircle, MapPin } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { QuickCategorySection } from './QuickCategorySection';
import { ProductCard } from './ProductCard';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { STORE_LOCATION_DATA } from '../../data/demoData';

interface HomePageProps {
  onOpenProductDetail: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenProductDetail }) => {
  const {
    products,
    setSelectedCategory,
    setSelectedBrand,
    setCustomerView,
  } = useApp();

  // Curated collections for natural discovery
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const fansCollection = products.filter((p) => p.categoryId === 'fans').slice(0, 4);
  const lightingCollection = products.filter((p) => p.categoryId === 'lights').slice(0, 4);
  const switchesCollection = products
    .filter((p) => p.categoryId === 'switches' || p.categoryId === 'wires' || p.categoryId === 'mcb')
    .slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-16">
      {/* 2. COMPACT 3-SLIDE PROMOTIONAL CAROUSEL */}
      <section className="pt-2 sm:pt-4">
        <HeroCarousel />
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section>
        <QuickCategorySection />
      </section>

      {/* 4. BEST SELLERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
              Top Rated Products
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
              Popular products customers are choosing for their homes.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setCustomerView('shop');
            }}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      </section>

      {/* 5. FANS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
              Orient Electric
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Fans
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
              Energy-saving BLDC and high-speed fans designed for silent, powerful airflow.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('fans');
              setCustomerView('shop');
            }}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {fansCollection.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      </section>

      {/* 6. LIGHTS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
              Goldmedal LED
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Lights
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
              Architectural slim panels, spotlights, and bright battens for every room.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('lights');
              setCustomerView('shop');
            }}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {lightingCollection.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      </section>

      {/* 7. SWITCHES & ELECTRICALS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
              Modular & Wiring
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Switches & Electricals
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
              Designer modular plates, pure copper house wires, and circuit protection.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('switches');
              setCustomerView('shop');
            }}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {switchesCollection.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      </section>

      {/* 8. FEATURED BRANDS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="bg-[#F8F8F7] rounded-3xl border border-[#EAEAEA] p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
                Authorized Partners
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#171717]">
                Featured Brands
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
                100% genuine products with manufacturer warranty and direct store support.
              </p>
            </div>
            <button
              onClick={() => setCustomerView('brands')}
              className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 whitespace-nowrap"
            >
              <span>View All Brands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => {
                setSelectedBrand('ORIENT');
                setSelectedCategory(null);
                setCustomerView('shop');
              }}
              className="p-6 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#FFB000] cursor-pointer transition-all hover:shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#168A45] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Partner
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#171717] mt-1">
                  ORIENT Electric
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  BLDC Energy-Saver Fans, High-Speed Fans & Exhausts
                </p>
              </div>
              <span className="text-xs font-bold text-[#FF6A00] whitespace-nowrap">Shop Now →</span>
            </div>

            <div
              onClick={() => {
                setSelectedBrand('Goldmedal');
                setSelectedCategory(null);
                setCustomerView('shop');
              }}
              className="p-6 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#FFB000] cursor-pointer transition-all hover:shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#168A45] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Partner
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#171717] mt-1">
                  Goldmedal Systems
                </h3>
                <p className="text-xs text-[#666666] mt-1">
                  Acoustic Modular Switches, LED Panels & Safety Breakers
                </p>
              </div>
              <span className="text-xs font-bold text-[#FF6A00] whitespace-nowrap">Shop Now →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SPECIAL OFFERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4511E] block mb-1">
              Deals & Coupons
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight">
              Special Offers
            </h2>
          </div>
          <button
            onClick={() => setCustomerView('offers')}
            className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All Offers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gradient-to-r from-[#171717] to-[#2B2B2B] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6A00] text-white px-2.5 py-0.5 rounded">
                Flat 10% OFF
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold mt-3">
                Storewide Savings on Orders Above ₹1,999
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Use code <strong className="font-mono text-[#FFB000]">ATHARV10</strong> at checkout for instant discount.
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCustomerView('shop');
                }}
                className="px-4 py-2 rounded-lg text-white font-bold text-xs bg-atharvay-gradient shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFF3E6] border border-[#FFE0B2] p-6 sm:p-8 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#168A45] text-white px-2.5 py-0.5 rounded">
                Free Delivery
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171717] mt-3">
                Free Express Delivery in Pune & PCMC
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                All retail orders over ₹1,999 ship free directly from our Chakan warehouse.
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCustomerView('shop');
                }}
                className="px-4 py-2 rounded-lg text-white font-bold text-xs bg-[#171717] hover:bg-black shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. WHY ATHARV ELECTRICAL */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-1">
            Trust & Quality
          </span>
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717]">
            Why ATHARV ELECTRICAL
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-2 font-medium">
            Trusted products, genuine brands, easy shopping, and dedicated local store support.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-2.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF3E6] text-[#FF6A00] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">Trusted Products</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Every item is tested for safety, ISI certification, and long service life.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-2.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF3E6] text-[#FF6A00] flex items-center justify-center mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">Genuine Brands</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Direct factory partnerships with Orient Electric and Goldmedal Systems.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-2.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF3E6] text-[#FF6A00] flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">Easy Shopping</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Browse variants, select sizes, pay securely, and track delivery in seconds.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAEAEA] text-center space-y-2.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF3E6] text-[#FF6A00] flex items-center justify-center mx-auto">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">Local Store Support</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Visit our Chakan showroom or reach our electrician team on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* 11. STORE LOCATION */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#EAEAEA] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FFF3E6] px-3 py-1 rounded-full">
              Visit Our Store
            </span>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171717]">
              ATHARV ELECTRICAL
            </h2>
            <div className="text-xs sm:text-sm text-[#666666] leading-relaxed flex items-start gap-2 justify-center lg:justify-start">
              <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
              <span>
                Shop No. 18, Ramkrishna Complex, Opp. Indrayani Bank, Manik Chowk, Chakan, Pune, Maharashtra – 410501
              </span>
            </div>
            <p className="text-xs text-[#929292]">
              Open All 7 Days: 9:30 AM to 9:00 PM · Live BLDC Fan & LED Demo Available
            </p>
          </div>

          {/* Action Buttons as specified */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={STORE_LOCATION_DATA.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions</span>
            </a>

            <a
              href="tel:+917720036820"
              className="px-5 py-2.5 rounded-xl border border-[#EAEAEA] font-bold text-xs text-[#171717] hover:bg-[#F8F8F7] flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
              <span>Call Store</span>
            </a>

            <a
              href={`https://wa.me/${STORE_LOCATION_DATA.whatsapp}?text=Hello%20Atharv%20Electrical,%20I%20want%20to%20inquire%20about%20store%20products.`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-xs hover:bg-[#1EBE5D] flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
