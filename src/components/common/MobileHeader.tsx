import React, { useState } from 'react';
import {
  Menu,
  ShoppingCart,
  Search,
  X,
  Home,
  Grid,
  FileText,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';

export const MobileHeader: React.FC = () => {
  const {
    customerView,
    setCustomerView,
    searchQuery,
    setSearchQuery,
    cartCount,
    setIsCartOpen,
    categories,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedBrand,
    deliveryPincode,
  } = useApp();

  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const handleCategoryShortcut = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    setSelectedBrand('ALL');
    setCustomerView('shop');
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-xs">
      {/* 0. Mobile Top Announcement Marquee Ticker */}
      <div className="bg-[#171717] text-white text-[11px] py-1.5 overflow-hidden border-b border-neutral-800 select-none">
        <div className="animate-marquee-infinite items-center gap-6 tracking-wide">
          {/* Loop Segment 1 */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1 text-[#FFB000] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#FFB000]" />
              100% Genuine Orient & Goldmedal
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-white font-semibold">
              Free Express Delivery on orders ₹1,999+
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <a href="tel:+917720036820" className="flex items-center gap-1 text-gray-200">
              <PhoneCall className="w-3 h-3 text-[#FF8A00]" />
              <span>Helpline: +91 77200 36820</span>
            </a>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-300">Showroom: Manik Chowk, Chakan</span>
            <span className="text-[#FF8A00] font-black">·</span>
          </div>

          {/* Loop Segment 2 (Duplicate for continuous loop) */}
          <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-1 text-[#FFB000] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#FFB000]" />
              100% Genuine Orient & Goldmedal
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-white font-semibold">
              Free Express Delivery on orders ₹1,999+
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <a href="tel:+917720036820" className="flex items-center gap-1 text-gray-200">
              <PhoneCall className="w-3 h-3 text-[#FF8A00]" />
              <span>Helpline: +91 77200 36820</span>
            </a>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-300">Showroom: Manik Chowk, Chakan</span>
            <span className="text-[#FF8A00] font-black">·</span>
          </div>
        </div>
      </div>

      {/* 1. Mobile Top Row */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsMenuDrawerOpen(true)}
          className="p-1.5 -ml-1 text-[#171717] hover:text-[#FF6A00]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => {
            setCustomerView('home');
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }}
          className="cursor-pointer"
        >
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#171717] hover:text-[#FF6A00]"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-atharvay-gradient text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Mobile Second Row: Search Bar */}
      <div className="px-4 pb-2.5">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCustomerView('shop');
              }
            }}
            placeholder="Search fans, lights, switches, wires & more..."
            className="w-full bg-[#F8F8F7] text-xs text-[#171717] placeholder-[#929292] pl-9 pr-8 py-2 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#929292] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#929292]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Mobile Category Quick Shortcuts (Horizontal Scroll) */}
      <div className="px-4 py-1.5 bg-[#FFFCF9] border-t border-[#EAEAEA] flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'fans', label: 'Fans' },
          { id: 'lights', label: 'Lights' },
          { id: 'switches', label: 'Switches' },
          { id: 'wires', label: 'Wires' },
          { id: 'mcb', label: 'Protection' },
          { id: 'accessories', label: 'Accessories' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleCategoryShortcut(item.id)}
            className="px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap rounded-md bg-white border border-[#EAEAEA] text-[#171717] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 4. Slide-Out Mobile Navigation Drawer */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-[82%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F8F7]">
                <Logo size="sm" />
                <button
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-1 text-[#666666] hover:text-[#171717]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery Pincode Indicator */}
              <div className="px-4 py-2.5 bg-[#FFF3E6] border-b border-[#FFE0B2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#171717]">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Delivering to <strong>{deliveryPincode || '410501'}</strong></span>
                </div>
                <span className="text-[10px] text-[#FF6A00] font-bold">Chakan Hub</span>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase font-bold text-[#929292] tracking-wider mb-2">
                  Shop Categories
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryShortcut(cat.id);
                      setIsMenuDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#171717] hover:text-[#FF6A00] border-b border-[#F8F8F7]"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#929292]" />
                  </button>
                ))}

                <p className="text-[10px] uppercase font-bold text-[#929292] tracking-wider mt-5 mb-2">
                  Authorized Brands
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand('ORIENT');
                    setSelectedCategory(null);
                    setCustomerView('shop');
                    setIsMenuDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#171717]"
                >
                  <span>ORIENT Electric</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Official</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBrand('Goldmedal');
                    setSelectedCategory(null);
                    setCustomerView('shop');
                    setIsMenuDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#171717]"
                >
                  <span>Goldmedal Modular</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Official</span>
                </button>

                <p className="text-[10px] uppercase font-bold text-[#929292] tracking-wider mt-5 mb-2">
                  Customer Links
                </p>
                <button
                  onClick={() => {
                    setCustomerView('offers');
                    setIsMenuDrawerOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs text-[#F4511E] font-semibold"
                >
                  🔥 Special Offers & Deals
                </button>
                <button
                  onClick={() => {
                    setCustomerView('location');
                    setIsMenuDrawerOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs text-[#171717]"
                >
                  📍 Visit Our Store (Chakan, Pune)
                </button>
                <button
                  onClick={() => {
                    setCustomerView('orders');
                    setIsMenuDrawerOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs text-[#171717]"
                >
                  📦 Track Order Status
                </button>
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F8F7] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#666666]">
                <ShieldCheck className="w-4 h-4 text-[#168A45]" />
                <span>Genuine Warranty & GST Invoices</span>
              </div>
              <a
                href="tel:+917720036820"
                className="flex items-center gap-2 text-xs text-[#171717] font-semibold"
              >
                <PhoneCall className="w-4 h-4 text-[#FF8A00]" />
                <span>+91 77200 36820</span>
              </a>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
};

// Fixed Bottom Mobile Navigation Bar
export const BottomMobileNavigation: React.FC = () => {
  const {
    customerView,
    setCustomerView,
    cartCount,
    setIsCartOpen,
    setSelectedCategory,
  } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAEAEA] py-2 px-3 flex items-center justify-around shadow-lg">
      <button
        onClick={() => {
          setCustomerView('home');
          setSelectedCategory(null);
        }}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          customerView === 'home' ? 'text-[#FF6A00]' : 'text-[#666666]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => {
          setCustomerView('shop');
          setSelectedCategory(null);
        }}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          customerView === 'shop' ? 'text-[#FF6A00]' : 'text-[#666666]'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>Categories</span>
      </button>

      <button
        onClick={() => {
          setCustomerView('shop');
        }}
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#666666]"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      <button
        onClick={() => setCustomerView('orders')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          customerView === 'orders' || customerView === 'order-tracking'
            ? 'text-[#FF6A00]'
            : 'text-[#666666]'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span>Orders</span>
      </button>

      <button
        onClick={() => setCustomerView('account')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
          customerView === 'account' ? 'text-[#FF6A00]' : 'text-[#666666]'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Account</span>
      </button>
    </nav>
  );
};
