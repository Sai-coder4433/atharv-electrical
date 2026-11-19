import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  ShoppingBag,
  Truck,
  Tag,
  Sparkles,
  Clock,
  Loader2,
  Check,
  AlertCircle,
  Building,
} from 'lucide-react';
import { DeliveryAddress, Order, ShiprocketCourierRate } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  fetchCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  lookupIndianPincode,
  checkShiprocketServiceability,
} from '../../firebase/services';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryCharge,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    processCashfreePayment,
    setCustomerView,
    deliveryPincode,
    setDeliveryPincode,
    showToast,
    authUser,
    setIsLoginModalOpen,
  } = useApp();

  // Steps: 1: Customer & Address, 2: Payment, 3: Order Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Customer Contact Info (Auto-populated from Firebase Auth / Profile)
  const [customerName, setCustomerName] = useState(authUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(authUser?.email || '');
  const [customerMobile, setCustomerMobile] = useState('');

  // Address Book state
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // New Address Form State
  const [addressForm, setAddressForm] = useState<DeliveryAddress>({
    fullName: authUser?.displayName || '',
    mobile: '',
    email: authUser?.email || '',
    houseBuilding: '',
    apartment: '',
    street: '',
    area: '',
    landmark: '',
    city: 'Chakan',
    state: 'Maharashtra',
    pincode: deliveryPincode || '410501',
    country: 'India',
    addressType: 'home',
    isDefault: true,
  });

  // Selected Active Address for Checkout
  const [activeAddress, setActiveAddress] = useState<DeliveryAddress>(addressForm);

  // Shiprocket Shipping State
  const [isCheckingCourier, setIsCheckingCourier] = useState(false);
  const [courierOptions, setCourierOptions] = useState<ShiprocketCourierRate[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [shippingNotice, setShippingNotice] = useState<string>('Free Express Delivery on orders above ₹999');

  // Payment Option
  const [paymentOption, setPaymentOption] = useState<'cashfree' | 'cod'>('cashfree');

  // Sync profile details when authUser changes
  useEffect(() => {
    if (authUser) {
      if (!customerName && authUser.displayName) setCustomerName(authUser.displayName);
      if (!customerEmail && authUser.email) setCustomerEmail(authUser.email);

      // Load saved customer addresses from Firestore
      fetchCustomerAddresses(authUser.uid).then((addresses) => {
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddr.id || 'default');
          setActiveAddress(defaultAddr);
          setShowNewAddressForm(false);
          if (defaultAddr.mobile) setCustomerMobile(defaultAddr.mobile);
        } else {
          setShowNewAddressForm(true);
        }
      });
    } else {
      setShowNewAddressForm(true);
    }
  }, [authUser]);

  // When delivery Pincode changes, trigger Shiprocket Serviceability & Indian Postal check
  const handlePincodeChange = async (newPincode: string) => {
    const clean = newPincode.replace(/\D/g, '').slice(0, 6);
    setAddressForm((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      setDeliveryPincode(clean);
      try {
        const info = await lookupIndianPincode(clean);
        if (info) {
          setAddressForm((prev) => ({
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

      // Check Shiprocket Serviceability
      setIsCheckingCourier(true);
      try {
        const sRes = await checkShiprocketServiceability({
          deliveryPincode: clean,
          weight: Math.max(1, cart.length * 0.8),
        });
        if (sRes.success && sRes.availableCouriers && sRes.availableCouriers.length > 0) {
          setCourierOptions(sRes.availableCouriers);
          setSelectedCourierId(sRes.availableCouriers[0].courier_company_id);
          const topCourier = sRes.availableCouriers[0];
          setShippingNotice(
            `Serviceable via ${topCourier.courier_name} · Estimated delivery in ${topCourier.etd || '2-3 business days'}`
          );
        } else {
          setShippingNotice('Verified standard delivery via Atharv Chakan depot (2-4 business days)');
        }
      } catch (err) {
        console.warn('Shiprocket check note:', err);
      } finally {
        setIsCheckingCourier(false);
      }
    }
  };

  // Select an existing address from the address book
  const handleSelectAddress = (addr: DeliveryAddress) => {
    setSelectedAddressId(addr.id || 'custom');
    setActiveAddress(addr);
    setShowNewAddressForm(false);
    if (addr.fullName) setCustomerName(addr.fullName);
    if (addr.mobile) setCustomerMobile(addr.mobile);
    if (addr.email) setCustomerEmail(addr.email);
    handlePincodeChange(addr.pincode);
  };

  // Delete address from address book
  const handleDeleteAddress = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!authUser) return;
    await deleteCustomerAddress(authUser.uid, addressId);
    const updated = savedAddresses.filter((a) => a.id !== addressId);
    setSavedAddresses(updated);
    if (selectedAddressId === addressId) {
      if (updated.length > 0) {
        handleSelectAddress(updated[0]);
      } else {
        setShowNewAddressForm(true);
        setSelectedAddressId('new');
      }
    }
    showToast('Delivery address removed', 'info');
  };

  // Set default address
  const handleSetDefaultAddress = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!authUser) return;
    await setDefaultCustomerAddress(authUser.uid, addressId);
    setSavedAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addressId }))
    );
    showToast('Default delivery address updated', 'success');
  };

  // Validate and Proceed from Step 1 to Step 2
  const handleProceedToPayment = async () => {
    let finalAddr: DeliveryAddress;

    if (showNewAddressForm || selectedAddressId === 'new') {
      const name = customerName.trim() || addressForm.fullName.trim();
      const mobile = customerMobile.trim() || addressForm.mobile.trim();
      const email = customerEmail.trim() || addressForm.email?.trim() || '';

      if (!name) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (!mobile || !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
      }
      if (!addressForm.houseBuilding.trim() || !addressForm.street.trim() || !addressForm.area.trim()) {
        showToast('Please enter flat/house number, street and area', 'error');
        return;
      }
      if (!addressForm.pincode || !/^\d{6}$/.test(addressForm.pincode.replace(/\D/g, ''))) {
        showToast('Please enter a valid 6-digit Indian PIN code', 'error');
        return;
      }

      finalAddr = {
        ...addressForm,
        fullName: name,
        mobile: mobile.replace(/\D/g, '').slice(-10),
        email,
        isDefault: setAsDefault,
      };

      if (saveToProfile && authUser) {
        try {
          const saved = await saveCustomerAddress(authUser.uid, finalAddr);
          setSavedAddresses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
          setSelectedAddressId(saved.id || 'saved');
          finalAddr = saved;
        } catch (err) {
          console.warn('Address saving note:', err);
        }
      }
    } else {
      finalAddr = {
        ...activeAddress,
        fullName: customerName || activeAddress.fullName,
        mobile: (customerMobile || activeAddress.mobile).replace(/\D/g, '').slice(-10),
        email: customerEmail || activeAddress.email || '',
      };
    }

    setActiveAddress(finalAddr);
    setStep(2);
  };

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) {
      showToast(`Coupon "${couponInput.trim().toUpperCase()}" applied successfully!`, 'success');
      setCouponInput('');
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  // GST Calculation (18% included in Indian standard pricing)
  // For Maharashtra delivery: CGST 9% + SGST 9%; Outside Maharashtra: IGST 18%
  const isMaharashtra = (activeAddress.state || 'Maharashtra').toLowerCase().includes('maharashtra');
  const gstAmount = Math.round((cartTotal * 18) / 118);
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  // Final Order Placement
  const handleFinalSubmit = async () => {
    setIsProcessing(true);

    if (paymentOption === 'cashfree') {
      await processCashfreePayment(
        activeAddress,
        (order) => {
          setIsProcessing(false);
          setConfirmedOrder(order);
          setStep(3);
        },
        (errorMsg) => {
          setIsProcessing(false);
          showToast(errorMsg || 'Cashfree payment was cancelled or could not be completed', 'error');
        }
      );
    } else {
      // Cash on Delivery
      try {
        const order = await placeOrder(activeAddress, 'Cash on Delivery');
        setIsProcessing(false);
        setConfirmedOrder(order);
        setStep(3);
      } catch (err: any) {
        setIsProcessing(false);
        showToast(err.message || 'Failed to place Cash on Delivery order', 'error');
      }
    }
  };

  // Empty cart view
  if (cart.length === 0 && step !== 3) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-heading font-extrabold text-[#171717]">Your Cart is Empty</h2>
        <p className="text-xs text-[#666666]">Add genuine electrical products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => setCustomerView('shop')}
          className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Progress Stepper */}
      {step !== 3 && (
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#FF6A00]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#FF6A00] text-white' : 'bg-gray-100 text-gray-500'}`}>
                1
              </div>
              <span>Customer & Delivery Address</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-200">
              <div className={`h-full bg-[#FF6A00] transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#FF6A00]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#FF6A00] text-white' : 'bg-gray-100 text-gray-500'}`}>
                2
              </div>
              <span>Payment & Confirmation</span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Amazon/Flipkart Layout on Desktop */}
      {step !== 3 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer Information, Address Book & Payment (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Customer Details & Delivery Address */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                {/* 1.1 Customer Contact Identity Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block">
                        Customer Contact
                      </span>
                      <h2 className="text-lg font-heading font-extrabold text-[#171717]">
                        Contact Information
                      </h2>
                    </div>
                    {authUser ? (
                      <span className="text-[11px] font-semibold text-[#168A45] bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Signed in
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="text-xs font-bold text-[#FF6A00] hover:underline"
                      >
                        Sign In for Faster Checkout
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Rajesh Sharma"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-medium"
                        />
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Mobile Number (SMS/WhatsApp) *</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={customerMobile}
                          onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-medium font-mono"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Email (GST Invoice) *</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="rajesh@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-medium"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.2 Delivery Address Book / Saved Addresses */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block">
                        Shipping Destination
                      </span>
                      <h2 className="text-lg font-heading font-extrabold text-[#171717]">
                        Delivery Address
                      </h2>
                    </div>

                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => {
                          setShowNewAddressForm(!showNewAddressForm);
                          if (!showNewAddressForm) setSelectedAddressId('new');
                        }}
                        className="text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showNewAddressForm ? 'Choose Saved Address' : '+ Add New Address'}</span>
                      </button>
                    )}
                  </div>

                  {/* Saved Address Cards */}
                  {!showNewAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-[#FF6A00] bg-orange-50/30 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-gray-400'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-xs font-bold text-gray-900">{addr.fullName}</span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {addr.addressType || 'Home'}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-50 text-[#168A45]">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {!addr.isDefault && (
                                  <button
                                    onClick={(e) => handleSetDefaultAddress(e, addr.id!)}
                                    className="text-[11px] text-gray-400 hover:text-gray-700 underline"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDeleteAddress(e, addr.id!)}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                  title="Delete address"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 mt-2 pl-6">
                              {addr.houseBuilding}, {addr.apartment ? `${addr.apartment}, ` : ''}{addr.street},{' '}
                              {addr.area}, {addr.city}, {addr.state} - <strong className="font-mono">{addr.pincode}</strong>
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1 pl-6">
                              Phone: <span className="font-mono">{addr.mobile}</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* New / Edit Address Form */}
                  {(showNewAddressForm || savedAddresses.length === 0) && (
                    <div className="space-y-3.5 text-xs pt-1">
                      {/* Address Type Selector */}
                      <div className="flex items-center gap-3 pb-2">
                        <span className="text-gray-500 font-semibold">Address Type:</span>
                        {(['home', 'office', 'other'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddressForm((prev) => ({ ...prev, addressType: type }))}
                            className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] flex items-center gap-1.5 transition-all ${
                              addressForm.addressType === type
                                ? 'bg-orange-100 text-[#FF6A00] border border-orange-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type === 'home' && <Home className="w-3 h-3" />}
                            {type === 'office' && <Briefcase className="w-3 h-3" />}
                            {type === 'other' && <Building className="w-3 h-3" />}
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Flat / House / Building Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.houseBuilding}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, houseBuilding: e.target.value }))}
                            placeholder="e.g. Flat 302, Sai Vihar Apartment"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Apartment / Building Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={addressForm.apartment || ''}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, apartment: e.target.value }))}
                            placeholder="e.g. Atharva Heights Wing B"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Street / Road Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.street}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                            placeholder="e.g. Station Road, Market Lane"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Area / Locality *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.area}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, area: e.target.value }))}
                            placeholder="e.g. Near Manik Chowk"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                            <span>Pincode *</span>
                            {pincodeLoading && <span className="text-[10px] text-orange-600 font-normal">Detecting city...</span>}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={addressForm.pincode}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            placeholder="410501"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">City / District *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                            placeholder="Chakan / Pune"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            required
                            value={addressForm.state}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                            placeholder="Maharashtra"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            value={addressForm.landmark || ''}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, landmark: e.target.value }))}
                            placeholder="e.g. Opposite State Bank of India"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            disabled
                            value="India"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Checkboxes for saving */}
                      <div className="flex flex-wrap items-center gap-5 pt-2">
                        {authUser && (
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={saveToProfile}
                              onChange={(e) => setSaveToProfile(e.target.checked)}
                              className="rounded text-[#FF6A00] focus:ring-orange-200"
                            />
                            <span>Save this address to my profile</span>
                          </label>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={setAsDefault}
                            onChange={(e) => setSetAsDefault(e.target.checked)}
                            className="rounded text-[#FF6A00] focus:ring-orange-200"
                          />
                          <span>Set as default delivery address</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Shiprocket Courier Serviceability Display */}
                  <div className="pt-2">
                    {isCheckingCourier ? (
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5 text-xs text-gray-500">
                        <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin" />
                        <span>Checking Shiprocket courier routes for pincode {addressForm.pincode}...</span>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-green-50/70 border border-green-200/80 rounded-2xl flex items-center justify-between text-xs text-[#168A45]">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 shrink-0 text-[#168A45]" />
                          <span>{shippingNotice}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 px-2 py-0.5 rounded">
                          Serviceable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Proceed to Payment Action */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => setCustomerView('shop')}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Continue Shopping</span>
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      className="px-7 py-3 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Gateway Selection (Cashfree Production + COD) */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-6 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block">
                    Step 2 of 2
                  </span>
                  <h2 className="text-lg font-heading font-extrabold text-[#171717] mt-0.5">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-gray-500">
                    All online payments are processed securely via Cashfree Production Gateway.
                  </p>
                </div>

                {/* Delivery Summary Banner */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">Delivering To:</span>
                    <strong className="text-gray-900">{activeAddress.fullName} · {activeAddress.mobile}</strong>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {activeAddress.houseBuilding}, {activeAddress.street}, {activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#FF6A00] hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-3.5">
                  {/* Option A: Cashfree Online Payment */}
                  <div
                    onClick={() => setPaymentOption('cashfree')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      paymentOption === 'cashfree'
                        ? 'border-[#FF6A00] bg-orange-50/40 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'cashfree' ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-gray-300'}`}>
                          {paymentOption === 'cashfree' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#FF6A00]" />
                          Cashfree Secure Online Payments
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#168A45] bg-green-50 px-2 py-0.5 rounded">
                        Fastest · Instant Confirmation
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 pl-6.5">
                      Pay instantly with <strong>UPI (GPay, PhonePe, Paytm)</strong>, Credit & Debit Cards, Net Banking, and Wallets.
                    </p>
                    <div className="mt-3 pl-6.5 flex flex-wrap gap-2 text-[10px] text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Google Pay</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">PhonePe</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Paytm UPI</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Visa / Mastercard / RuPay</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Net Banking (50+ Banks)</span>
                    </div>
                  </div>

                  {/* Option B: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentOption('cod')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      paymentOption === 'cod'
                        ? 'border-[#FF6A00] bg-orange-50/40 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'cod' ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-gray-300'}`}>
                          {paymentOption === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <Store className="w-4 h-4 text-gray-700" />
                          Cash on Delivery / Showroom Collection
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 pl-6.5">
                      Pay in cash or UPI when your shipment is delivered, or collect directly from our Manik Chowk, Chakan showroom.
                    </p>
                  </div>
                </div>

                {/* Showroom Direct Dispatch Guarantee */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#168A45] shrink-0" />
                  <span>
                    Fulfilled by Authorized Dealer: <strong>ATHARV ELECTRICAL · Manik Chowk, Chakan</strong>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Address</span>
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isProcessing}
                    className="px-8 py-3.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Cashfree Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{cartTotal.toLocaleString('en-IN')} with Cashfree</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary & Price Breakdown (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-heading font-extrabold text-sm text-[#171717]">
                  Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Product Mini Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-xs">
                    <img
                      src={item.product.mainImage || item.product.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} · ₹{item.unitPrice.toLocaleString('en-IN')} each
                      </p>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[10px] text-orange-600 font-medium">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input Box */}
              <div className="pt-2 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#168A45]" />
                      <div>
                        <span className="font-mono font-bold text-[#168A45] uppercase">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-green-700 block">
                          Savings: ₹{cartDiscount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter Promo Code"
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 uppercase font-mono font-semibold focus:outline-none focus:border-[#FF6A00]"
                        />
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Transparent Bill Breakdown */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#168A45] font-semibold">
                    <span>Coupon Savings</span>
                    <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Express Courier Delivery</span>
                  <span>
                    {cartDeliveryCharge === 0 ? (
                      <span className="font-bold text-[#168A45]">FREE</span>
                    ) : (
                      `₹${cartDeliveryCharge}`
                    )}
                  </span>
                </div>

                {/* GST Itemized Breakdown */}
                <div className="py-2 px-3 bg-gray-50/80 rounded-xl space-y-1 text-[11px] text-gray-500">
                  <div className="flex justify-between font-medium text-gray-700">
                    <span>GST (18% Included)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {isMaharashtra ? (
                    <>
                      <div className="flex justify-between pl-2 text-[10px]">
                        <span>CGST (9%)</span>
                        <span>₹{cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between pl-2 text-[10px]">
                        <span>SGST (9%)</span>
                        <span>₹{sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between pl-2 text-[10px]">
                      <span>IGST (18%)</span>
                      <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total Payable</span>
                  <span className="text-xl font-heading font-extrabold text-[#FF6A00]">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Store Trust Badges */}
            <div className="bg-orange-50/40 rounded-2xl p-4 border border-orange-100/70 space-y-2.5 text-[11px] text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>100% Original Brand Warranty & Official GST Invoicing</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>Express Shiprocket Dispatch from Chakan Showroom</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span>Cashfree 256-Bit Bank-Grade Payment Security</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 3: ORDER CONFIRMED VIEW */
        confirmedOrder && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-green-100 shadow-sm text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 text-[#168A45] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#168A45] uppercase bg-green-50 px-3 py-1 rounded-full inline-block">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171717] mt-2">
                Thank You for Your Order!
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                We have received your order. We are preparing genuine Orient & Goldmedal products for dispatch.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-xs text-left space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                <span className="text-gray-500">Order ID:</span>
                <strong className="font-mono text-gray-900">{confirmedOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                <span className="text-gray-500">Total Amount:</span>
                <strong className="text-sm font-bold text-[#FF6A00]">
                  ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-[#168A45]">{confirmedOrder.paymentStatus} ({confirmedOrder.paymentMethod})</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Delivering To:</span>
                <p className="font-semibold text-gray-800">
                  {confirmedOrder.deliveryAddress.fullName} · {confirmedOrder.deliveryAddress.mobile}
                </p>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  {confirmedOrder.deliveryAddress.houseBuilding}, {confirmedOrder.deliveryAddress.street},{' '}
                  {confirmedOrder.deliveryAddress.city}, {confirmedOrder.deliveryAddress.state} -{' '}
                  {confirmedOrder.deliveryAddress.pincode}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setCustomerView('order-tracking')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track My Order</span>
              </button>
              <button
                onClick={() => setCustomerView('shop')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
