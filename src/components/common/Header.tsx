import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  ShieldCheck,
  PhoneCall,
  X,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    customerView,
    setCustomerView,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedBrand,
    setSelectedProductId,
    cartCount,
    cartSubtotal,
    wishlist,
    deliveryPincode,
    setDeliveryPincode,
    setIsCartOpen,
    products,
    searchQuery,
    setSearchQuery,
    authUser,
    setActiveMode,
    setAdminView,
    setIsAdminLoginModalOpen,
    setIsLoginModalOpen,
  } = useApp();

  const [isShopMegaOpen, setIsShopMegaOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState(deliveryPincode || '410501');

  // Search filtered results for quick preview
  const searchResults =
    searchQuery.trim().length > 1
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const handleSubcategoryClick = (catId: string, subcat?: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subcat || null);
    setSelectedBrand('ALL');
    setCustomerView('shop');
    setIsShopMegaOpen(false);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.trim().length === 6) {
      setDeliveryPincode(tempPincode.trim());
      setIsPincodeModalOpen(false);
    }
  };

  const shopMegaCategories = [
    {
      id: 'fans',
      name: 'Fans',
      subcategories: ['Ceiling Fans', 'BLDC Fans', 'Exhaust Fans', 'Decorative Fans'],
    },
    {
      id: 'lights',
      name: 'Lights',
      subcategories: [
        'LED Bulbs',
        'Panel Lights',
        'Downlights',
        'Tube Lights',
        'Decorative Lights',
        'Flood Lights',
      ],
    },
    {
      id: 'switches',
      name: 'Switches & Sockets',
      subcategories: ['Modular Switches', 'Sockets', 'USB Sockets', 'Fan Regulators'],
    },
    {
      id: 'wires',
      name: 'Wires & Cables',
      subcategories: ['House Wires', 'Flexible Cables', 'Power Cables'],
    },
    {
      id: 'mcb',
      name: 'Protection & MCB',
      subcategories: ['MCB', 'RCCB', 'Distribution Boards'],
    },
    {
      id: 'accessories',
      name: 'Electrical Accessories',
      subcategories: ['Spike Guards', 'Multi Plugs', 'Lamp Holders'],
    },
    {
      id: 'decorative-lighting',
      name: 'Decorative Lighting',
      subcategories: ['Strip Lights', 'Cove Lights', 'Track Lights'],
    },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
      {/* 1. Top Announcement Marquee Ticker */}
      <div className="bg-[#171717] text-white text-xs py-2 overflow-hidden border-b border-neutral-800 select-none">
        <div className="animate-marquee-infinite items-center gap-8 text-[11px] sm:text-xs tracking-wide">
          {/* Loop Segment 1 */}
          <div className="flex items-center gap-6 shrink-0">
            <span className="flex items-center gap-1.5 text-[#FFB000] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB000]" />
              100% Genuine Orient & Goldmedal
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-white font-semibold">
              Free Express Delivery on orders ₹1,999+
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <a
              href="tel:+917720036820"
              className="flex items-center gap-1.5 text-gray-200 hover:text-white"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF8A00]" />
              <span>Store Helpline: +91 77200 36820 (Manik Chowk, Chakan)</span>
            </a>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-300">
              Showroom: Manik Chowk, Chakan, India
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-200">
              100% Original Brand Warranty & Official GST Invoicing
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
          </div>

          {/* Loop Segment 2 (Duplicate for continuous seamless scrolling) */}
          <div className="flex items-center gap-6 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-1.5 text-[#FFB000] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB000]" />
              100% Genuine Orient & Goldmedal
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-white font-semibold">
              Free Express Delivery on orders ₹1,999+
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <a
              href="tel:+917720036820"
              className="flex items-center gap-1.5 text-gray-200 hover:text-white"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF8A00]" />
              <span>Store Helpline: +91 77200 36820 (Manik Chowk, Chakan)</span>
            </a>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-300">
              Showroom: Manik Chowk, Chakan, India
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
            <span className="text-gray-200">
              100% Original Brand Warranty & Official GST Invoicing
            </span>
            <span className="text-[#FF8A00] font-black">·</span>
          </div>
        </div>
      </div>

      {/* 2. Main Desktop Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        {/* Left: Official ATHARV ELECTRICAL Logo */}
        <div
          onClick={() => {
            setCustomerView('home');
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setSelectedBrand('ALL');
          }}
          className="cursor-pointer shrink-0"
        >
          <Logo size="md" />
        </div>

        {/* Center: Simplified Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-[#171717]">
          <button
            onClick={() => {
              setCustomerView('home');
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              customerView === 'home'
                ? 'text-[#FF6A00] bg-[#FFF3E6]'
                : 'text-[#171717] hover:text-[#FF6A00]'
            }`}
          >
            Home
          </button>

          {/* Shop Mega Menu */}
          <div
            className="relative"
            onMouseEnter={() => setIsShopMegaOpen(true)}
            onMouseLeave={() => setIsShopMegaOpen(false)}
          >
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setSelectedBrand('ALL');
                setCustomerView('shop');
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                customerView === 'shop'
                  ? 'text-[#FF6A00] bg-[#FFF3E6]'
                  : 'text-[#171717] hover:text-[#FF6A00]'
              }`}
            >
              <span>Shop</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isShopMegaOpen ? 'rotate-180 text-[#FF6A00]' : ''
                }`}
              />
            </button>

            {/* Mega Menu Dropdown */}
            {isShopMegaOpen && (
              <div className="absolute left-0 top-full w-[720px] bg-white rounded-2xl shadow-2xl border border-[#EAEAEA] p-6 grid grid-cols-3 gap-6 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {shopMegaCategories.map((cat) => (
                  <div key={cat.id} className="space-y-1.5">
                    <button
                      onClick={() => handleSubcategoryClick(cat.id)}
                      className="font-bold text-xs text-[#171717] hover:text-[#FF6A00] text-left block pb-1 border-b border-[#F8F8F7]"
                    >
                      {cat.name}
                    </button>
                    <ul className="space-y-1 text-xs">
                      {cat.subcategories.map((sub) => (
                        <li key={sub}>
                          <button
                            onClick={() => handleSubcategoryClick(cat.id, sub)}
                            className="text-[#666666] hover:text-[#FF6A00] hover:translate-x-0.5 transition-all text-left block text-[11px]"
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setCustomerView('shop');
            }}
            className="px-3 py-2 rounded-lg text-[#171717] hover:text-[#FF6A00] transition-colors"
          >
            Categories
          </button>

          <button
            onClick={() => setCustomerView('offers')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              customerView === 'offers'
                ? 'text-[#FF6A00] bg-[#FFF3E6]'
                : 'text-[#171717] hover:text-[#FF6A00]'
            }`}
          >
            <span>Offers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4511E] animate-pulse" />
          </button>

          <button
            onClick={() => setCustomerView('brands')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              customerView === 'brands'
                ? 'text-[#FF6A00] bg-[#FFF3E6]'
                : 'text-[#171717] hover:text-[#FF6A00]'
            }`}
          >
            Brands
          </button>

          <button
            onClick={() => setCustomerView('location')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              customerView === 'location'
                ? 'text-[#FF6A00] bg-[#FFF3E6]'
                : 'text-[#171717] hover:text-[#FF6A00]'
            }`}
          >
            Store
          </button>
        </nav>

        {/* Right Zone: Search, Wishlist, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <div className="relative hidden md:block w-48 lg:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search products..."
              className="w-full bg-[#F8F8F7] hover:bg-white text-xs text-[#171717] placeholder-[#929292] pl-8 pr-7 py-2 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#929292] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#929292]"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Autocomplete Dropdown Preview */}
            {showSearchDropdown && searchQuery.trim().length > 1 && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-[#EAEAEA] py-2 z-50">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#EAEAEA]">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setCustomerView('shop');
                          setShowSearchDropdown(false);
                        }}
                        className="px-3 py-2 flex items-center gap-2.5 hover:bg-[#FFF3E6]/40 cursor-pointer"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-8 h-8 object-cover rounded border border-[#EAEAEA]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#171717] truncate">{prod.name}</p>
                          <p className="text-[10px] text-[#666666]">₹{prod.sellingPrice}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        setCustomerView('shop');
                        setShowSearchDropdown(false);
                      }}
                      className="p-2 text-center text-xs font-semibold text-[#FF6A00] hover:bg-[#FFF3E6] cursor-pointer"
                    >
                      View all results →
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-[#666666]">No matches found.</div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Pincode */}
          <button
            onClick={() => setIsPincodeModalOpen(true)}
            className="hidden xl:flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#171717] px-2.5 py-1.5 rounded-lg hover:bg-[#F8F8F7]"
            title="Delivery Pincode"
          >
            <MapPin className="w-4 h-4 text-[#FF6A00]" />
            <span className="font-semibold text-[#171717]">{deliveryPincode}</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setCustomerView('wishlist')}
            className={`relative p-2 text-[#666666] hover:text-[#171717] rounded-lg hover:bg-[#F8F8F7] ${
              customerView === 'wishlist' ? 'text-[#FF6A00] bg-[#FFF3E6]' : ''
            }`}
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6A00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => {
              if (authUser) {
                setCustomerView('account');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className={`flex items-center gap-1 text-xs font-semibold text-[#666666] hover:text-[#171717] px-2.5 py-2 rounded-lg hover:bg-[#F8F8F7] ${
              customerView === 'account' ? 'text-[#FF6A00] bg-[#FFF3E6]' : ''
            }`}
            title="My Account"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">{authUser ? authUser.displayName : 'Sign In'}</span>
          </button>

          {/* Admin Portal Entry */}
          <button
            onClick={() => {
              if (authUser?.isAdmin) {
                setActiveMode('admin');
                setAdminView('dashboard');
              } else {
                setIsAdminLoginModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 transition-colors border border-gray-200"
            title="ATHARV ELECTRICAL Admin Portal"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
            <span>Admin</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
            }}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#171717] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {cartSubtotal > 0 && (
              <span className="hidden md:inline pl-1 border-l border-white/30 font-bold">
                ₹{cartSubtotal.toLocaleString('en-IN')}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pincode Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EAEAEA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <h3 className="text-base font-bold text-[#171717]">Delivery Pincode</h3>
              <button onClick={() => setIsPincodeModalOpen(false)} className="text-[#929292]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#666666] mt-3">
              Enter your Indian Postal Pincode for express delivery availability from our Chakan, Pune showroom.
            </p>
            <form onSubmit={handlePincodeSubmit} className="mt-4">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 410501, 411038"
                className="w-full text-base tracking-widest text-center font-bold px-4 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-lg text-white font-semibold text-xs bg-atharvay-gradient shadow-sm"
              >
                Apply Pincode
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
