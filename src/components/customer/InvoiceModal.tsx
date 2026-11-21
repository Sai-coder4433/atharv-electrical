import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { Order } from '../../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-AE-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden px-4 sm:px-6 py-3 bg-[#171717] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
            <span className="text-xs font-bold tracking-wide">Official Customer Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-atharvay-gradient hover:brightness-110 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area (A4 Standard) */}
        <div id="printable-invoice" className="p-6 sm:p-10 overflow-y-auto font-sans text-gray-800 bg-white space-y-6">
          {/* 1. Header: Store Branding & Invoice Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-[#171717]">
                  ATHARV <span className="text-[#FF6A00]">ELECTRICAL</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Authorized Electrical Showroom & Distribution Center
              </p>
              <div className="text-[11px] text-gray-600 mt-2 space-y-0.5 leading-relaxed">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#FF6A00] shrink-0" />
                  <span>Manik Chowk, Chakan, Pune, Maharashtra — 410501, India</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#FF6A00] shrink-0" />
                  <span>Helpline: +91 77200 36820</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#FF6A00] shrink-0" />
                  <span>contact@atharvelectrical.com · www.atharvelectrical.com</span>
                </p>
                <p className="font-mono text-gray-500 pt-0.5">
                  GSTIN / Registration: 27AABCA1234F1Z9 (Maharashtra State)
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-[#FDF9F5] p-3.5 rounded-xl border border-[#FFE0B2] min-w-[210px]">
              <span className="text-[10px] uppercase font-extrabold text-[#FF6A00] tracking-wider block">
                TAX INVOICE
              </span>
              <p className="font-mono font-bold text-sm text-[#171717] mt-0.5">{invoiceNumber}</p>
              <div className="text-[11px] text-gray-600 mt-2 space-y-0.5">
                <p>Date: <strong className="text-gray-900">{invoiceDate}</strong></p>
                <p>Order No: <strong className="font-mono text-gray-900">{order.orderNumber}</strong></p>
                <p>Payment: <strong className="text-gray-900">{order.paymentMethod}</strong> ({order.paymentStatus})</p>
              </div>
            </div>
          </div>

          {/* 2. Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                Billed To & Shipped To:
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {order.deliveryAddress?.fullName || order.customerName}
              </p>
              <p className="text-gray-600 mt-1 leading-relaxed">
                {order.deliveryAddress?.houseBuilding && `${order.deliveryAddress.houseBuilding}, `}
                {order.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                {order.deliveryAddress?.area && `${order.deliveryAddress.area}, `}
                <br />
                {order.deliveryAddress?.city || 'Pune'}, {order.deliveryAddress?.state || 'Maharashtra'} -{' '}
                <strong className="font-mono text-gray-900">{order.deliveryAddress?.pincode}</strong>
              </p>
              <p className="text-gray-600 mt-2">
                Mobile: <strong className="text-gray-900">+91 {order.deliveryAddress?.mobile || order.customerPhone}</strong>
              </p>
              {order.customerEmail && (
                <p className="text-gray-500 mt-0.5">Email: {order.customerEmail}</p>
              )}
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Dispatch & Shipping Partner:
                </span>
                <p className="font-semibold text-gray-800">
                  {order.courierPartner || 'Atharv Express Depot Dispatch'}
                </p>
                {order.awbCode && (
                  <p className="text-gray-600 font-mono mt-1">
                    AWB Tracking: <strong>{order.awbCode}</strong>
                  </p>
                )}
                <p className="text-gray-500 text-[11px] mt-1">
                  Order Status: <strong className="text-[#FF6A00]">{order.status}</strong>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-[11px] text-[#168A45] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Official Genuine Electrical Supply</span>
              </div>
            </div>
          </div>

          {/* 3. Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-[#171717] text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                  <th className="py-2.5 px-3 font-bold">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-center">Color / Variant</th>
                  <th className="py-2.5 px-3 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => {
                  const colorName =
                    item.selectedColor ||
                    item.selectedVariants?.['Color'] ||
                    Object.values(item.selectedVariants || {})[0] ||
                    'Standard';
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="py-3 px-3 text-center font-mono text-gray-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{item.product.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Brand: {item.product.brand} · SKU: {item.variantSku || item.product.sku}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {colorName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Total Calculation & STRICT GST INCLUSIVITY NOTICE */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="sm:max-w-xs text-xs space-y-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <p className="font-bold">GST INCLUSIVITY CONFIRMATION:</p>
                <p className="mt-0.5">
                  All selling prices shown above are strictly <strong>inclusive of applicable GST (CGST + SGST / IGST)</strong>. No additional taxes are levied or charged on top.
                </p>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                This is a computer-generated tax invoice for retail purchases from Atharv Electrical. Retain this invoice for official brand warranty claims.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Inclusive of GST):</span>
                <span className="font-mono text-gray-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#168A45] font-semibold">
                  <span>Special Discount / Coupon:</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping & Delivery:</span>
                <span className="font-mono text-gray-900">
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-gray-900 flex justify-between text-sm font-extrabold text-[#171717]">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-base text-[#FF6A00]">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Footer Sign-off */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <div>
              <p className="font-bold text-gray-800">For ATHARV ELECTRICAL</p>
              <p className="text-[11px]">Authorized Signatory</p>
            </div>
            <p className="text-[11px] text-gray-400 text-center sm:text-right">
              Thank you for choosing Atharv Electrical — Powering Chakan & Pune with Excellence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
