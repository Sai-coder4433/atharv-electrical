import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Home,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { verifyCashfreePaymentSession } from '../../firebase/services';
import { Order } from '../../types';

export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, removeCoupon, setSelectedOrderForTracking, showToast } = useApp();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'NOT_FOUND'>('PENDING');
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const verifyPayment = async (attempt: number = 0) => {
    if (!orderId) {
      setStatus('NOT_FOUND');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyCashfreePaymentSession(orderId);

      if (result.success && result.paymentStatus === 'Paid') {
        setStatus('SUCCESS');
        setOrder(result.order || null);
        setLoading(false);
        // Clear customer cart and coupon on verified payment
        clearCart();
        removeCoupon();
        if (result.order) {
          setSelectedOrderForTracking(result.order);
        }
        showToast('Payment verified successfully! Your order is confirmed.', 'success');
      } else if (result.paymentStatus === 'Failed') {
        setStatus('FAILED');
        setErrorMessage(result.message || 'Payment was not confirmed by the bank.');
        setLoading(false);
      } else {
        // Still pending or active at Cashfree
        if (attempt < 4) {
          setTimeout(() => {
            setPollCount(attempt + 1);
            verifyPayment(attempt + 1);
          }, 3000);
        } else {
          setStatus('PENDING');
          setOrder(result.order || null);
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Error verifying Cashfree payment session:', err);
      if (attempt < 3) {
        setTimeout(() => {
          setPollCount(attempt + 1);
          verifyPayment(attempt + 1);
        }, 3000);
      } else {
        setStatus('FAILED');
        setErrorMessage(err.message || 'Unable to communicate with Cashfree servers.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    verifyPayment(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="min-h-[75vh] bg-[#FDFBF9] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[#FF6A00] animate-spin" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#171717]">
                Verifying Payment with Cashfree
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto">
                Securely confirming transaction with your bank. Please do not close or refresh this window...
              </p>
              {pollCount > 0 && (
                <div className="mt-3 text-[11px] text-gray-400 font-mono">
                  Verification check {pollCount} of 4...
                </div>
              )}
            </div>
          </div>
        ) : status === 'SUCCESS' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-green-100 shadow-sm space-y-6 animate-in fade-in duration-300">
            {/* Status Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 text-[#168A45] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-[#168A45] uppercase bg-green-50 px-3 py-1 rounded-full inline-block">
                Payment Confirmed · Cashfree Production Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#171717]">
                Thank You for Your Order!
              </h1>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Your payment was received successfully. We are preparing your order for express dispatch from our Chakan showroom.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-500">Order Reference</span>
                <span className="font-mono font-bold text-gray-900">{orderId}</span>
              </div>
              {order?.cashfreePaymentId && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-500">Cashfree Transaction ID</span>
                  <span className="font-mono text-gray-800 font-semibold">{order.cashfreePaymentId}</span>
                </div>
              )}
              {order?.totalAmount && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-500">Total Paid Amount</span>
                  <span className="text-sm font-bold text-[#FF6A00]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Cashfree Gateway (Verified)
                </span>
              </div>
              {order?.deliveryAddress && (
                <div className="pt-1">
                  <span className="text-gray-500 block mb-1">Delivering To</span>
                  <p className="font-semibold text-gray-800">
                    {order.deliveryAddress.fullName} · {order.deliveryAddress.mobile}
                  </p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {order.deliveryAddress.houseBuilding}, {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                    {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* Shiprocket Fulfillment Notice */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-start gap-3 text-xs text-gray-700">
              <Truck className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900">Shiprocket Automated Dispatch</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Your shipment is being generated in our courier system. You will receive live WhatsApp and SMS updates with your AWB tracking link once dispatched.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  if (order) setSelectedOrderForTracking(order);
                  navigate('/order-tracking');
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track My Order</span>
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        ) : status === 'PENDING' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-sm space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full inline-block">
                Payment Verification Pending
              </span>
              <h1 className="text-2xl font-heading font-extrabold text-[#171717] mt-2">
                Awaiting Bank Confirmation
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Your payment for Order <strong className="font-mono">{orderId}</strong> is awaiting final confirmation from Cashfree or your issuing bank.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 text-left">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Did you complete the payment?
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                If the amount was debited from your account, your order will be automatically confirmed within a few minutes once Cashfree delivers the webhook notification.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setLoading(true);
                  verifyPayment(0);
                }}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Status Again</span>
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <span>View Order History</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-red-100 shadow-sm space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full inline-block">
                Payment Not Completed
              </span>
              <h1 className="text-2xl font-heading font-extrabold text-[#171717] mt-2">
                Payment Incomplete or Cancelled
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {errorMessage || 'The payment session was either cancelled by the user, expired, or declined by the bank.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 text-left space-y-1">
              <p className="font-semibold text-gray-800">What happened?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-500">
                <li>No funds were deducted from your account.</li>
                <li>Your selected items remain safely in your cart.</li>
                <li>You can retry with Cashfree UPI, Card, Netbanking, or choose Pay on Delivery.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/checkout')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-atharvay-gradient shadow-xs hover:shadow flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Return to Checkout & Retry</span>
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        )}

        {/* Security & Support Guarantee */}
        <div className="mt-8 pt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#168A45]" />
            <span>256-Bit SSL Encrypted · Cashfree Official Payment Partner</span>
          </div>
          <div>
            Need assistance? Store Helpline: <strong className="text-gray-700">+91 77200 36820</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
