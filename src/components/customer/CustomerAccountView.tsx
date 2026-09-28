import React, { useState } from 'react';
import {
  Package,
  Heart,
  MapPin,
  User,
  PhoneCall,
  Mail,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { DeliveryAddress } from '../../types';

export const CustomerAccountView: React.FC = () => {
  const {
    orders,
    wishlist,
    products,
    customers,
    setSelectedOrderForTracking,
    setCustomerView,
    deliveryPincode,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile' | 'support'>('orders');

  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([
    {
      fullName: 'Rajesh Sharma',
      mobile: '9823045678',
      houseBuilding: 'Flat 402, Rohan Viti',
      street: 'Pashan-Sus Road',
      area: 'Baner',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: deliveryPincode || '411045',
      isDefault: true,
    },
    {
      fullName: 'Rajesh Sharma (Office)',
      mobile: '9823045678',
      houseBuilding: 'Cabin 3, TechHub Plaza',
      street: 'Senapati Bapat Road',
      area: 'Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411016',
      isDefault: false,
    },
  ]);

  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<DeliveryAddress>({
    fullName: '',
    mobile: '',
    houseBuilding: '',
    street: '',
    area: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '',
    isDefault: false,
  });

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));
  const currentCustomer = customers[0];

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.mobile || !newAddr.pincode) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    setSavedAddresses((prev) => [...prev, newAddr]);
    setIsAddAddressModalOpen(false);
    showToast('New delivery address saved!', 'success');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Profile Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-7 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
            }}
          >
            RS
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-[#171717]">
              {currentCustomer.name}
            </h1>
            <p className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
              <span>{currentCustomer.email}</span>
              <span>·</span>
              <span>{currentCustomer.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8F8F7] px-3.5 py-2 rounded-xl text-center border border-[#EAEAEA]">
            <span className="text-[10px] uppercase font-bold text-[#929292]">Total Orders</span>
            <p className="text-sm font-extrabold text-[#171717]">{orders.length}</p>
          </div>
          <div className="bg-[#FFF3E6] px-3.5 py-2 rounded-xl text-center border border-[#FFE0B2]">
            <span className="text-[10px] uppercase font-bold text-[#FF6A00]">Wishlist</span>
            <p className="text-sm font-extrabold text-[#FF6A00]">{wishlist.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#EAEAEA] pb-2 mb-6">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: savedAddresses.length },
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'support', label: 'Customer Care & Support', icon: PhoneCall },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-atharvay-gradient text-white shadow-xs'
                  : 'bg-[#F8F8F7] text-[#666666] hover:text-[#171717]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
              <Package className="w-10 h-10 text-[#929292] mx-auto mb-2" />
              <h3 className="font-heading font-bold text-base text-[#171717]">No orders yet.</h3>
              <p className="text-xs text-[#666666] mt-1">Start shopping from our verified electrical catalog.</p>
              <button
                onClick={() => setCustomerView('shop')}
                className="mt-4 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-lg"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs hover:border-[#FFB000] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#EAEAEA] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#171717]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-green-100 text-[#168A45]'
                            : 'bg-[#FFF3E6] text-[#FF6A00]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-[#171717] tabular-nums">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrderForTracking(ord);
                        setCustomerView('order-tracking');
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-atharvay-gradient shadow-xs flex items-center gap-1.5"
                    >
                      <span>Track Status</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="mt-3 divide-y divide-[#F8F8F7]">
                  {ord.items.map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.images[0]}
                          alt={it.product.name}
                          className="w-10 h-10 object-cover rounded bg-[#F8F8F7] border border-[#EAEAEA]"
                        />
                        <div>
                          <p className="font-semibold text-[#171717] line-clamp-1">{it.product.name}</p>
                          <p className="text-[11px] text-[#666666]">
                            Qty: {it.quantity} · {it.product.brand}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#171717] tabular-nums">
                        ₹{(it.unitPrice * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
              <Heart className="w-10 h-10 text-[#929292] mx-auto mb-2" />
              <h3 className="font-heading font-bold text-base text-[#171717]">Save products you love.</h3>
              <p className="text-xs text-[#666666] mt-1">Tap the heart icon on any fan, light or modular switch.</p>
              <button
                onClick={() => setCustomerView('shop')}
                className="mt-4 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-lg"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddAddressModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((addr, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs relative"
              >
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-[#FF6A00] bg-[#FFF3E6] px-2 py-0.5 rounded">
                    Default Address
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#FF6A00]" />
                  <h4 className="text-xs font-bold text-[#171717]">{addr.fullName}</h4>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {addr.houseBuilding}, {addr.street}<br />
                  {addr.area}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
                <p className="text-xs font-semibold text-[#171717] mt-3">
                  Mobile: +91 {addr.mobile}
                </p>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {isAddAddressModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA]">
                <h3 className="font-heading font-bold text-base text-[#171717] pb-3 border-b border-[#EAEAEA]">
                  Add Delivery Address
                </h3>
                <form onSubmit={handleAddNewAddress} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={newAddr.mobile}
                      onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">House / Flat / Building</label>
                    <input
                      type="text"
                      value={newAddr.houseBuilding}
                      onChange={(e) => setNewAddr({ ...newAddr, houseBuilding: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-[#171717] block mb-1">City</label>
                      <input
                        type="text"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#171717] block mb-1">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressModalOpen(false)}
                      className="flex-1 py-2 rounded-lg border text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 max-w-xl">
          <h3 className="font-heading font-bold text-base text-[#171717] mb-4">
            Customer Profile Information
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#666666] block mb-1">Registered Name</label>
              <input
                type="text"
                defaultValue={currentCustomer.name}
                className="w-full px-3.5 py-2 rounded-lg border border-[#EAEAEA] bg-[#F8F8F7]"
              />
            </div>
            <div>
              <label className="font-bold text-[#666666] block mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={currentCustomer.email}
                className="w-full px-3.5 py-2 rounded-lg border border-[#EAEAEA] bg-[#F8F8F7]"
              />
            </div>
            <div>
              <label className="font-bold text-[#666666] block mb-1">Mobile Number</label>
              <input
                type="tel"
                defaultValue={currentCustomer.phone}
                className="w-full px-3.5 py-2 rounded-lg border border-[#EAEAEA] bg-[#F8F8F7]"
              />
            </div>
            <button
              onClick={() => showToast('Profile details updated', 'success')}
              className="mt-2 px-5 py-2 rounded-lg text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
            >
              Update Profile
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPPORT */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-[#171717]">
              Store Customer Support
            </h3>
            <p className="text-xs text-[#666666]">
              Have questions regarding electrical specifications, wattage calculation, or on-site warranty service? Contact our showroom team directly.
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="tel:+917720036820"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F8F7] font-semibold text-[#171717] hover:bg-[#FFF3E6]"
              >
                <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
                <span>Call +91 77200 36820</span>
              </a>
              <a
                href="mailto:contact@atharvelectrical.com"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F8F7] font-semibold text-[#171717] hover:bg-[#FFF3E6]"
              >
                <Mail className="w-4 h-4 text-[#FF6A00]" />
                <span>contact@atharvelectrical.com</span>
              </a>
            </div>
          </div>
          <div className="bg-[#FFFCF9] rounded-2xl border border-[#FFE0B2] p-6 space-y-3">
            <h3 className="font-heading font-bold text-base text-[#171717]">
              Contractor & Electrician Assistance
            </h3>
            <p className="text-xs text-[#666666]">
              Are you an electrical contractor or architect in Pune / Mumbai? We offer bulk tier contractor discounts and direct site delivery for ongoing projects.
            </p>
            <button
              onClick={() => showToast('Inquiry submitted. Our contractor desk will call you within 2 hours.', 'success')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs"
            >
              Request Contractor Rate Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
