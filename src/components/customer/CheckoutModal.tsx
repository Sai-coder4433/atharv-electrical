import React, { useState } from 'react';
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
  Check,
  ShoppingBag,
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
    processRazorpayPayment,
    setCustomerView,
    deliveryPincode,
    showToast,
    authUser,
  } = useApp();

  // 4 Simple Steps (Section 44)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1: Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: authUser?.displayName || 'Rajesh Sharma',
    mobile: '7720036820',
    email: authUser?.email || 'customer@gmail.com',
  });

  // Step 2: Address
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: authUser?.displayName || 'Rajesh Sharma',
    mobile: '7720036820',
    houseBuilding: 'Flat 302, Sai Vihar',
    street: 'Station Road',
    area: 'Near Manik Chowk',
    city: 'Chakan',
    state: 'Maharashtra',
    pincode: deliveryPincode || '410501',
    isDefault: true,
  });

  // Step 3: Payment Method
  const [paymentOption, setPaymentOption] = useState<'razorpay' | 'cod'>('razorpay');

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6A00] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#171717]">Your Cart is Empty</h2>
        <p className="text-xs text-[#666666]">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => setCustomerView('shop')}
          className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Final Order Placement
  const handleFinalSubmit = async () => {
    setIsProcessing(true);
    const finalAddress: DeliveryAddress = {
      ...address,
      fullName: customerInfo.name,
      mobile: customerInfo.mobile,
    };

    if (paymentOption === 'razorpay') {
      await processRazorpayPayment(
        finalAddress,
        (order) => {
          setIsProcessing(false);
          setConfirmedOrder(order);
          setStep(4);
        },
        (errorMsg) => {
          setIsProcessing(false);
          showToast(errorMsg || 'Razorpay checkout cancelled', 'error');
        }
      );
    } else {
      // Cash on Delivery / Store Pickup
      const order = await placeOrder(finalAddress, 'Cash on Delivery');
      setIsProcessing(false);
      setConfirmedOrder(order);
      setStep(4);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Checkout Steps Progress Bar */}
      {step !== 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-bold text-gray-500">
            <span className={step >= 1 ? 'text-[#FF6A00]' : ''}>1. Customer Info</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-[#FF6A00]' : ''}>2. Address</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-[#FF6A00]' : ''}>3. Payment & Review</span>
          </div>
        </div>
      )}

      {/* STEP 1: Customer Information (Section 44) */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider block">Step 1 of 3</span>
            <h2 className="text-xl font-heading font-extrabold text-[#171717] mt-1">Customer Information</h2>
            <p className="text-xs text-gray-500">Enter your contact details for order confirmation and receipts.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Number (for Order SMS/WhatsApp) *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerInfo.mobile}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address (for GST Invoice) *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setCustomerView('shop')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </button>
            <button
              onClick={() => {
                if (!customerInfo.name || !customerInfo.mobile) {
                  showToast('Please fill in your name and mobile number', 'error');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-1.5"
            >
              <span>Continue to Address</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Address (Section 44) */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider block">Step 2 of 3</span>
            <h2 className="text-xl font-heading font-extrabold text-[#171717] mt-1">Delivery Address</h2>
            <p className="text-xs text-gray-500">Where should we deliver your electrical order?</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">House / Flat / Building *</label>
                <input
                  type="text"
                  required
                  value={address.houseBuilding}
                  onChange={(e) => setAddress((prev) => ({ ...prev, houseBuilding: e.target.value }))}
                  placeholder="e.g. Flat 302, Sai Vihar"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Street / Landmark *</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
                  placeholder="e.g. Station Road, Opp Bank"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Area / Locality *</label>
                <input
                  type="text"
                  required
                  value={address.area}
                  onChange={(e) => setAddress((prev) => ({ ...prev, area: e.target.value }))}
                  placeholder="e.g. Near Manik Chowk"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Chakan"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="410501"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!address.houseBuilding || !address.street || !address.pincode) {
                  showToast('Please fill in complete address details', 'error');
                  return;
                }
                setStep(3);
              }}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-1.5"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment & Review (Section 44 & 25) */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider block">Step 3 of 3</span>
            <h2 className="text-xl font-heading font-extrabold text-[#171717] mt-1">Payment & Place Order</h2>
            <p className="text-xs text-gray-500">Pay securely online or choose Pay on Delivery.</p>
          </div>

          {/* Payment Method Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentOption('razorpay')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                paymentOption === 'razorpay'
                  ? 'border-[#FF6A00] bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF6A00]" />
                  Razorpay Secure Checkout
                </span>
                <span className="text-[10px] font-bold text-[#168A45] bg-green-50 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Wallets.
              </p>
            </div>

            <div
              onClick={() => setPaymentOption('cod')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                paymentOption === 'cod'
                  ? 'border-[#FF6A00] bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-700" />
                  Cash on Delivery / Pickup
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Pay in cash or UPI when delivered or upon visiting our Chakan showroom.
              </p>
            </div>
          </div>

          {/* Fulfilling Showroom Badge */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-2.5 text-xs text-gray-700">
            <Store className="w-4 h-4 text-[#FF6A00] shrink-0" />
            <span>
              Direct Showroom Fulfillment: <strong>Manik Chowk, Chakan, India</strong>
            </span>
          </div>

          {/* Order Summary Breakdown */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 mb-2">Order Summary ({cart.length} items)</h4>
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
              <span>Express Delivery</span>
              <span>{cartDeliveryCharge === 0 ? 'FREE' : `₹${cartDeliveryCharge}`}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
              <span>Final Total</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isProcessing}
              className="px-8 py-3 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isProcessing ? 'Connecting Gateway...' : `Pay ₹${cartTotal.toLocaleString('en-IN')}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER SUCCESS */}
      {step === 4 && confirmedOrder && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-50 text-[#168A45] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-heading font-extrabold text-[#171717]">
              Order Confirmed!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Thank you for shopping with <strong>ATHARV ELECTRICAL</strong>.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID:</span>
              <strong className="font-mono text-gray-900">{confirmedOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid:</span>
              <strong className="text-[#168A45]">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-bold text-[#168A45]">{confirmedOrder.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Store Depot:</span>
              <span>Manik Chowk, Chakan, India</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setCustomerView('orders')}
              className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs"
            >
              View My Orders
            </button>
            <button
              onClick={() => setCustomerView('shop')}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
