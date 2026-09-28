import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Building,
  Smartphone,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Store,
} from 'lucide-react';
import { DeliveryAddress, Order } from '../../types';
import { useApp } from '../../context/AppContext';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryCharge,
    cartTotal,
    placeOrder,
    setCustomerView,
    setSelectedOrderForTracking,
    deliveryPincode,
    showToast,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Address form
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: 'Rajesh Sharma',
    mobile: '7720036820',
    houseBuilding: 'Flat 302, Sai Vihar',
    street: 'Talegaon-Chakan Road',
    area: 'Near Manik Chowk',
    city: 'Chakan',
    state: 'Maharashtra',
    pincode: deliveryPincode || '410501',
    isDefault: true,
  });

  // Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'store_pickup'>('express');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery'
  >('UPI');
  const [upiId, setUpiId] = useState('rajesh@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setAddress((prev) => ({
            ...prev,
            city: 'Chakan',
            state: 'Maharashtra',
            pincode: '410501',
            area: 'Manik Chowk',
          }));
          showToast('Location updated to Chakan, Pune!', 'success');
        },
        () => {
          setAddress((prev) => ({
            ...prev,
            city: 'Chakan',
            state: 'Maharashtra',
            pincode: '410501',
            area: 'Manik Chowk',
          }));
          showToast('Defaulted to Chakan showroom area', 'info');
        }
      );
    }
  };

  const handlePlaceOrderSubmit = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const placed = placeOrder(address, paymentMethod);
      setConfirmedOrder(placed);
      setStep(4);
    }, 900);
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#171717]">Your Cart is Empty</h2>
        <p className="text-sm text-[#666666] mt-2">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => setCustomerView('shop')}
          className="mt-4 px-6 py-2.5 rounded-lg text-white font-bold text-xs bg-atharvay-gradient"
        >
          Explore Electrical Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
          Secure Electrical Checkout
        </h1>
        <div className="mt-4 flex items-center justify-between max-w-xl text-xs font-semibold">
          {[
            { num: 1, label: 'Address' },
            { num: 2, label: 'Delivery' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirmation' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= s.num
                    ? 'bg-atharvay-gradient text-white shadow-xs'
                    : 'bg-[#F8F8F7] text-[#929292] border border-[#EAEAEA]'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden sm:inline ${step >= s.num ? 'text-[#171717]' : 'text-[#929292]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Steps Container (Left) + Order Summary Sticky (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* STEP 1: Address Form */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6A00]" />
                  <h2 className="font-heading text-lg font-bold text-[#171717]">
                    1. Delivery Address (India)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs font-semibold text-[#FF6A00] hover:text-[#F4511E] flex items-center gap-1 bg-[#FFF3E6] px-2.5 py-1.5 rounded-lg border border-[#FFE0B2]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Current Location</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    required
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Mobile Number (For Delivery OTP) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#EAEAEA] bg-[#F8F8F7] text-xs text-[#666666]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={address.mobile}
                      onChange={(e) => setAddress({ ...address, mobile: e.target.value.replace(/\D/g, '') })}
                      required
                      placeholder="9823045678"
                      className="w-full text-xs px-3.5 py-2.5 rounded-r-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Flat / House No. / Building / Floor *
                  </label>
                  <input
                    type="text"
                    value={address.houseBuilding}
                    onChange={(e) => setAddress({ ...address, houseBuilding: e.target.value })}
                    required
                    placeholder="e.g. Flat 402, Rohan Viti Apartments"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Street / Society / Road *
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    required
                    placeholder="e.g. Pashan-Sus Road"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Area / Landmark *
                  </label>
                  <input
                    type="text"
                    value={address.area}
                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    required
                    placeholder="e.g. Baner / Near Fire Station"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    State *
                  </label>
                  <select
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none bg-white"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Goa">Goa</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="411045"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!address.fullName || !address.mobile || !address.pincode) {
                      showToast('Please fill in required address fields', 'error');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-3 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Continue to Delivery Options</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 pb-4 border-b border-[#EAEAEA]">
                <Truck className="w-5 h-5 text-[#FF6A00]" />
                <h2 className="font-heading text-lg font-bold text-[#171717]">
                  2. Choose Delivery Method
                </h2>
              </div>

              <div className="space-y-3 mt-5">
                {/* Express Courier */}
                <div
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    deliveryMethod === 'express'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#FF6A00] mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#171717]">
                        Express Doorstep Courier (BlueDart / Delhivery)
                      </h4>
                      <span className="text-xs font-bold text-[#168A45]">
                        {cartDeliveryCharge === 0 ? 'FREE' : `₹${cartDeliveryCharge}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Estimated 2–4 business days with live tracking and phone verification.
                    </p>
                    <p className="text-[11px] text-[#929292] mt-1">
                      Delivering to: {address.houseBuilding}, {address.area}, {address.city} - {address.pincode}
                    </p>
                  </div>
                </div>

                {/* Self Pickup at Showroom */}
                <div
                  onClick={() => setDeliveryMethod('store_pickup')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    deliveryMethod === 'store_pickup'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#FF8A00] mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#171717]">
                        Direct Showroom Pickup (ATHARV ELECTRICAL Chakan Showroom)
                      </h4>
                      <span className="text-xs font-bold text-[#168A45]">FREE</span>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Ready in 2 hours. Inspect your products live before taking delivery.
                    </p>
                    <p className="text-[11px] text-[#929292] mt-1">
                      Shop No. 18, Ramkrishna Complex, Manik Chowk, Chakan, Pune – 410501.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#666666] hover:bg-[#F8F8F7] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 pb-4 border-b border-[#EAEAEA]">
                <CreditCard className="w-5 h-5 text-[#FF6A00]" />
                <h2 className="font-heading text-lg font-bold text-[#171717]">
                  3. Select Payment Method
                </h2>
              </div>

              <div className="space-y-3 mt-5">
                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-bold text-xs text-[#171717]">
                      <Smartphone className="w-4 h-4 text-[#FF6A00]" />
                      <span>Instant UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                    </div>
                    <span className="text-[10px] bg-green-100 text-[#168A45] font-bold px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-[#FFE0B2] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#171717] block mb-1">
                          Enter UPI VPA ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="mobilenumber@upi"
                          className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#EAEAEA]">
                        <QrCode className="w-8 h-8 text-[#171717]" />
                        <span className="text-[11px] text-[#666666]">
                          Dynamic QR code simulated on confirmation.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-bold text-xs text-[#171717]">
                      <CreditCard className="w-4 h-4 text-[#FF6A00]" />
                      <span>Credit / Debit Card (Visa, MasterCard, RuPay)</span>
                    </div>
                    <span className="text-[10px] text-[#666666]">All Indian Banks</span>
                  </div>
                  {paymentMethod === 'Card' && (
                    <div className="mt-3 pt-3 border-t border-[#FFE0B2] space-y-2 text-xs">
                      <p className="text-[11px] text-[#666666]">
                        Simulated secure 128-bit encrypted card gateway. (Razorpay integration ready).
                      </p>
                    </div>
                  )}
                </div>

                {/* Net Banking */}
                <div
                  onClick={() => setPaymentMethod('Net Banking')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Net Banking'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold text-xs text-[#171717]">
                    <Building className="w-4 h-4 text-[#FF6A00]" />
                    <span>Net Banking (SBI, HDFC, ICICI, Axis, Bank of Maharashtra)</span>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#FF6A00] bg-[#FFF3E6]/30'
                      : 'border-[#EAEAEA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-bold text-xs text-[#171717]">
                      <Store className="w-4 h-4 text-[#FF6A00]" />
                      <span>Cash on Delivery (Pay cash at doorstep)</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#168A45]">Available</span>
                  </div>
                  {paymentMethod === 'Cash on Delivery' && (
                    <p className="mt-2 text-[11px] text-[#666666] pt-2 border-t border-[#FFE0B2]">
                      Please keep exact cash ready upon delivery agent arrival. You will receive an SMS OTP to confirm handover.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#666666] hover:bg-[#F8F8F7] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePlaceOrderSubmit}
                  className="px-8 py-3.5 rounded-xl text-white font-bold text-sm bg-atharvay-gradient shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Confirmation Success */}
          {step === 4 && confirmedOrder && (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-10 shadow-xs text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#168A45] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="font-heading text-2xl font-extrabold text-[#171717]">
                Order Placed Successfully!
              </h2>

              <p className="text-xs text-[#666666] mt-1">
                Thank you for choosing ATHARV ELECTRICAL. Your order has been registered in our Chakan fulfillment warehouse.
              </p>

              <div className="max-w-md mx-auto my-6 p-4 rounded-xl bg-[#F8F8F7] border border-[#EAEAEA] text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-[#EAEAEA]">
                  <span className="text-[#666666]">Order ID:</span>
                  <span className="font-bold text-[#171717] font-mono">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Estimated Delivery:</span>
                  <span className="font-semibold text-[#168A45]">2–4 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Payment Status:</span>
                  <span className="font-semibold text-[#171717]">{confirmedOrder.paymentMethod} ({confirmedOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Shipping To:</span>
                  <span className="font-medium text-[#171717] text-right truncate max-w-[220px]">
                    {confirmedOrder.deliveryAddress.houseBuilding}, {confirmedOrder.deliveryAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedOrderForTracking(confirmedOrder);
                    setCustomerView('order-tracking');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-sm"
                >
                  Track Order Status Live
                </button>
                <button
                  onClick={() => setCustomerView('shop')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#EAEAEA] font-semibold text-xs text-[#171717] hover:bg-[#F8F8F7]"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#F8F8F7] rounded-2xl border border-[#EAEAEA] p-5 sticky top-24 space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#171717] pb-3 border-b border-[#EAEAEA]">
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} items)
            </h3>

            {/* Compact items list */}
            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#EAEAEA]">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <p className="font-semibold text-[#171717] truncate">{item.product.name}</p>
                    <p className="text-[10px] text-[#666666]">
                      Qty: {item.quantity} · {item.product.brand}
                    </p>
                  </div>
                  <span className="font-bold text-[#171717] tabular-nums shrink-0">
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#EAEAEA] space-y-1.5 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#171717] tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-[#168A45]">
                  <span>Discount</span>
                  <span className="font-semibold tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-[#171717] tabular-nums">
                  {cartDeliveryCharge === 0 ? <strong className="text-[#168A45]">FREE</strong> : `₹${cartDeliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#171717] pt-2 border-t border-[#EAEAEA]">
                <span>Total Payable</span>
                <span className="tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#929292] space-y-1">
              <p className="flex items-center gap-1 text-[#168A45] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Genuine Brand Product Guarantee
              </p>
              <p>Official Tax Invoice with HSN code & GST credit generated instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
