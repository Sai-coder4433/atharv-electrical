import React, { useState, useEffect } from 'react';
import {
  Package,
  Heart,
  MapPin,
  User,
  PhoneCall,
  Mail,
  ExternalLink,
  Plus,
  FileText,
  KeyRound,
  CheckCircle2,
  Lock,
  LogOut,
  AlertCircle,
  Loader2,
  Trash2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { InvoiceModal } from './InvoiceModal';
import { DeliveryAddress, Order } from '../../types';
import {
  fetchCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  lookupIndianPincode,
  updateCustomerProfileDetails,
} from '../../firebase/services';

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
    authUser,
    setIsLoginModalOpen,
    logout,
    sendCustomerPasswordResetEmail,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile' | 'support'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('ALL');

  // Customer Addresses from Firestore
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(authUser?.displayName || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // New Address Form State
  const [newAddr, setNewAddr] = useState<DeliveryAddress>({
    fullName: authUser?.displayName || '',
    mobile: '',
    houseBuilding: '',
    street: '',
    area: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: deliveryPincode || '410501',
    addressType: 'home',
    isDefault: false,
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Sync profile & fetch addresses when user changes
  useEffect(() => {
    if (authUser) {
      if (authUser.displayName) setProfileName(authUser.displayName);

      // Find customer document if exists
      const cust = customers.find(
        (c) => c.id === authUser.uid || c.email?.toLowerCase() === authUser.email?.toLowerCase()
      );
      if (cust?.phone) setProfilePhone(cust.phone);

      // Load Firestore customer addresses
      setIsLoadingAddresses(true);
      fetchCustomerAddresses(authUser.uid)
        .then((addrs) => {
          if (addrs && addrs.length > 0) {
            setSavedAddresses(addrs);
          } else {
            setSavedAddresses([]);
          }
        })
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [authUser, customers]);

  // Orders filtered for current user
  const userOrders = authUser
    ? orders.filter(
        (o) =>
          o.userId === authUser.uid ||
          (o.customerEmail && authUser.email && o.customerEmail.toLowerCase() === authUser.email.toLowerCase())
      )
    : [];

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // If user is not logged in, prompt to log in
  if (!authUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#FF6A00]">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-[#171717]">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Please sign in to view your order history, live shipment tracking, saved addresses, and download official GST tax invoices.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-md hover:brightness-105 active:scale-95 transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const initials = (authUser.displayName || authUser.email || 'AE')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setNewAddr((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const info = await lookupIndianPincode(clean);
        if (info) {
          setNewAddr((prev) => ({
            ...prev,
            city: info.city,
            state: info.state,
            area: info.area || prev.area,
          }));
        }
      } catch (err) {
        console.warn('Pincode lookup error:', err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.mobile || !newAddr.pincode || !newAddr.houseBuilding) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    try {
      const saved = await saveCustomerAddress(authUser.uid, newAddr);
      setSavedAddresses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
      setIsAddAddressModalOpen(false);
      setNewAddr({
        fullName: authUser.displayName || '',
        mobile: '',
        houseBuilding: '',
        street: '',
        area: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: deliveryPincode || '410501',
        addressType: 'home',
        isDefault: false,
      });
      showToast('New delivery address saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!addressId) return;
    try {
      await deleteCustomerAddress(authUser.uid, addressId);
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
      showToast('Address removed from address book', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId?: string) => {
    if (!addressId) return;
    try {
      await setDefaultCustomerAddress(authUser.uid, addressId);
      setSavedAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === addressId }))
      );
      showToast('Default delivery address updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update default address', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      await updateCustomerProfileDetails(profileName.trim(), profilePhone.trim());
      showToast('Profile information updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResetPassword = async () => {
    if (!authUser.email) return;
    setIsSendingReset(true);
    try {
      await sendCustomerPasswordResetEmail(authUser.email);
      showToast(`Password reset link dispatched to ${authUser.email}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send password reset email', 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32">
      {/* Top Profile Summary Banner */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-7 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold text-[#171717] truncate">
              {authUser.displayName || 'Customer Account'}
            </h1>
            <p className="text-xs text-[#666666] flex flex-wrap items-center gap-2 mt-0.5">
              <span>{authUser.email}</span>
              {profilePhone && (
                <>
                  <span>·</span>
                  <span>+91 {profilePhone}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8F8F7] px-3.5 py-2 rounded-xl text-center border border-[#EAEAEA]">
            <span className="text-[10px] uppercase font-bold text-[#929292]">Total Orders</span>
            <p className="text-sm font-extrabold text-[#171717]">{userOrders.length}</p>
          </div>
          <div className="bg-[#FFF3E6] px-3.5 py-2 rounded-xl text-center border border-[#FFE0B2]">
            <span className="text-[10px] uppercase font-bold text-[#FF6A00]">Wishlist</span>
            <p className="text-sm font-extrabold text-[#FF6A00]">{wishlist.length}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#EAEAEA] pb-2 mb-6">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: userOrders.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: savedAddresses.length },
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
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
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
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
          {/* Order Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  orderFilter === st
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          {userOrders.filter((o) => orderFilter === 'ALL' || o.status === orderFilter).length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
              <Package className="w-10 h-10 text-[#929292] mx-auto mb-2" />
              <h3 className="font-heading font-bold text-base text-[#171717]">
                {orderFilter === 'ALL' ? 'No orders placed yet.' : `No ${orderFilter} orders.`}
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                Explore our catalog of energy-saving fans, lighting, and modular switches.
              </p>
              <button
                onClick={() => setCustomerView('shop')}
                className="mt-4 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-xl shadow-xs"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            userOrders
              .filter((o) => orderFilter === 'ALL' || o.status === orderFilter)
              .map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-[#EAEAEA] p-5 shadow-xs hover:border-[#FFB000] transition-colors space-y-3.5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#EAEAEA] gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#171717]">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            ord.status === 'Delivered'
                              ? 'bg-green-100 text-[#168A45]'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-[#FFF3E6] text-[#FF6A00]'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {ord.paymentStatus} · {ord.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Placed on{' '}
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-[#171717] tabular-nums mr-2">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>

                      {/* Download Invoice Button */}
                      <button
                        onClick={() => handleOpenInvoice(ord)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
                        title="Download official GST tax invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Tax Invoice</span>
                      </button>

                      {/* Track Status Button */}
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
                  <div className="divide-y divide-[#F8F8F7]">
                    {ord.items.map((it, idx) => {
                      const colorName =
                        it.selectedColor ||
                        it.selectedVariants?.['Color'] ||
                        Object.values(it.selectedVariants || {})[0];
                      return (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                it.variantImage ||
                                it.product.mainImage ||
                                (it.product.images && it.product.images[0]) ||
                                '/assets/images/hero_fan_bldc_1790620359971.jpg'
                              }
                              alt={it.product.name}
                              className="w-12 h-12 object-contain rounded-xl bg-white border border-[#EAEAEA] p-1 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/hero_fan_bldc_1790620359971.jpg';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-[#171717] truncate">{it.product.name}</p>
                              <div className="text-[11px] text-[#666666] flex items-center gap-2 mt-0.5 flex-wrap">
                                <span>Brand: {it.product.brand}</span>
                                {colorName && (
                                  <>
                                    <span>·</span>
                                    <span className="font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.2 rounded">
                                      Color: {colorName}
                                    </span>
                                  </>
                                )}
                                <span>·</span>
                                <span>Qty: {it.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[#171717] tabular-nums shrink-0">
                            ₹{(it.unitPrice * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier / AWB info if available */}
                  {(ord.awbCode || ord.trackingNumber) && (
                    <div className="pt-2 flex items-center justify-between text-xs bg-orange-50/60 p-2.5 rounded-xl border border-orange-100">
                      <span className="text-gray-600">
                        Courier: <strong>{ord.courierPartner || 'Shiprocket Express'}</strong> · AWB:{' '}
                        <span className="font-mono font-bold text-gray-900">{ord.awbCode || ord.trackingNumber}</span>
                      </span>
                      <a
                        href={`https://shiprocket.co/tracking/${ord.awbCode || ord.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF6A00] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Live Tracking</span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-base text-[#171717]">Address Book</h3>
              <p className="text-xs text-gray-500">Manage your shipping and billing locations</p>
            </div>
            <button
              onClick={() => setIsAddAddressModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-atharvay-gradient flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {isLoadingAddresses ? (
            <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF6A00]" />
              <span>Loading saved addresses...</span>
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
              <MapPin className="w-10 h-10 text-[#929292] mx-auto mb-2" />
              <h3 className="font-heading font-bold text-base text-[#171717]">No saved addresses yet</h3>
              <p className="text-xs text-[#666666] mt-1">Add your home or project site delivery address.</p>
              <button
                onClick={() => setIsAddAddressModalOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-xl"
              >
                + Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id || `${addr.fullName}-${addr.pincode}`}
                  className={`bg-white rounded-2xl border p-5 shadow-xs relative transition-all ${
                    addr.isDefault ? 'border-[#FF8A00] bg-[#FFFCF9]' : 'border-[#EAEAEA]'
                  }`}
                >
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold text-[#FF6A00] bg-[#FFF3E6] border border-[#FFE0B2] px-2 py-0.5 rounded">
                      Default Delivery Address
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#FF6A00]" />
                    <h4 className="text-xs font-bold text-[#171717]">{addr.fullName}</h4>
                    {addr.addressType && (
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                        {addr.addressType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {addr.houseBuilding}, {addr.street}
                    <br />
                    {addr.area ? `${addr.area}, ` : ''}
                    {addr.city}, {addr.state} - <strong className="font-mono text-gray-900">{addr.pincode}</strong>
                  </p>
                  <p className="text-xs font-semibold text-[#171717] mt-3">
                    Mobile: +91 {addr.mobile}
                  </p>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Modal */}
          {isAddAddressModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in-95 duration-200">
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
                      placeholder="e.g. Atharv Porade"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={newAddr.mobile}
                      onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      required
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">PIN Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={newAddr.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        required
                        placeholder="6-digit Indian PIN Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono"
                      />
                      {pincodeLoading && (
                        <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">Flat / House / Building</label>
                    <input
                      type="text"
                      value={newAddr.houseBuilding}
                      onChange={(e) => setNewAddr({ ...newAddr, houseBuilding: e.target.value })}
                      required
                      placeholder="Flat No, Building Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#171717] block mb-1">Street / Landmark</label>
                    <input
                      type="text"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      placeholder="Near Manik Chowk, Opp. State Bank"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#171717] block mb-1">State</label>
                      <input
                        type="text"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addrDefault"
                      checked={newAddr.isDefault}
                      onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                      className="rounded text-[#FF6A00]"
                    />
                    <label htmlFor="addrDefault" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Set as default delivery address
                    </label>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
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
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 max-w-xl space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-[#171717]">
              Customer Profile Information
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your personal credentials, contact numbers, and password security.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Registered Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={authUser.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Email address is locked to your verified Firebase Authentication account.
              </span>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Mobile Contact</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 7720036820"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>

          {/* Password Security Card */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#FF6A00]" />
              <span>Password & Security</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Want to update your login password? We'll dispatch a secure reset link to your email ({authUser.email}).
            </p>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isSendingReset}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              {isSendingReset ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6A00]" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Send Password Reset Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EAEAEA]">
              <Heart className="w-10 h-10 text-[#929292] mx-auto mb-2" />
              <h3 className="font-heading font-bold text-base text-[#171717]">Save products you love</h3>
              <p className="text-xs text-[#666666] mt-1">Tap the heart icon on any fan, light or modular switch.</p>
              <button
                onClick={() => setCustomerView('shop')}
                className="mt-4 px-5 py-2 text-xs font-bold text-white bg-atharvay-gradient rounded-xl shadow-xs"
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
                className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F8F7] font-semibold text-[#171717] hover:bg-[#FFF3E6] transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
                <span>Call +91 77200 36820</span>
              </a>
              <a
                href="mailto:contact@atharvelectrical.com"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F8F7] font-semibold text-[#171717] hover:bg-[#FFF3E6] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#FF6A00]" />
                <span>contact@atharvelectrical.com</span>
              </a>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F8F7] text-[#171717]">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>Manik Chowk, Chakan, Pune, Maharashtra — 410501</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFCF9] rounded-2xl border border-[#FFE0B2] p-6 space-y-3">
            <h3 className="font-heading font-bold text-base text-[#171717]">
              Contractor & Electrician Assistance
            </h3>
            <p className="text-xs text-[#666666]">
              Are you an electrical contractor, builder, or interior architect in Pune / Mumbai? We offer bulk tier contractor discounts and direct site delivery for ongoing projects.
            </p>
            <button
              onClick={() => showToast('Inquiry submitted. Our contractor desk will call you within 2 hours.', 'success')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:brightness-105 active:scale-95 transition-all"
            >
              Request Contractor Rate Sheet
            </button>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedInvoiceOrder(null);
        }}
      />
    </div>
  );
};
