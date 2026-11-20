import React from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, Clock, ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export const RefundAndCancellationPage: React.FC = () => {
  return (
    <div className="bg-[#FFFFFF] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-[#FFFCF9] border-b border-[#F0EAE1] py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-2">
              Customer Satisfaction & Assurance
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-3 font-normal leading-relaxed">
              At ATHARV ELECTRICAL, customer satisfaction is our top priority. We offer authentic brand products, transparent policies, and a smooth cancellation and refund process for all purchases made on atharvelectrical.com.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Body Content */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-10 text-xs sm:text-sm text-[#444444] leading-relaxed">
          {/* Section 1: Order Cancellation */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">1</span>
              Order Cancellation Policy
            </h2>
            <div className="bg-[#FFFDF8] border-l-4 border-[#FF8A00] p-4 rounded-r-xl">
              <p className="font-semibold text-[#171717]">
                Orders can be cancelled free of charge at any time prior to product dispatch.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Before Dispatch:</strong> If you change your mind before your package is dispatched from our Chakan warehouse, you can cancel your order directly from your Customer Account under <em>"My Orders"</em> or by calling our store helpline at <strong>+91 77200 36820</strong>. A <strong>100% full refund</strong> will be initiated immediately.</li>
              <li><strong>After Dispatch:</strong> Once an order has been shipped and an Air Waybill (AWB) has been generated with Shiprocket or our courier partners, cancellation is not possible. You may, however, request a return or replacement upon delivery in accordance with the Return Eligibility terms below.</li>
            </ul>
          </section>

          {/* Section 2: Returns & Replacements Window */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">2</span>
              7-Day Return & Replacement Guarantee
            </h2>
            <p>
              We provide a <strong>7-Day Return or Free Replacement Window</strong> from the date of package delivery under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-xs">
              <li><strong>Damaged in Transit:</strong> If the packaging or item arrives visibly broken, scratched, cracked, or physically impaired during courier transit.</li>
              <li><strong>Manufacturing Defect:</strong> If the fan motor, LED driver, switch mechanism, or appliance fails to function out of the box upon professional electrical installation.</li>
              <li><strong>Incorrect Item Received:</strong> If the model, color variant, sweep size (e.g. 1200mm vs 1400mm), or technical specification differs from what was ordered on your invoice.</li>
            </ul>
          </section>

          {/* Section 3: Return Eligibility Conditions */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">3</span>
              Return Eligibility Requirements
            </h2>
            <p>
              To ensure safe inspection and manufacturer return processing, the returned product must satisfy the following conditions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-[#171717] block">✓ Original Brand Packaging</span>
                <span className="text-gray-600">The product box, internal styrofoam, user manuals, and warranty card must be returned intact.</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-[#171717] block">✓ Complete Accessories</span>
                <span className="text-gray-600">All blades, canopy, remote controls, screws, and modular plates must be included.</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-[#171717] block">✓ Unused & Unaltered Condition</span>
                <span className="text-gray-600">Items must not show signs of physical alteration, burnt circuitry due to incorrect wiring, or deliberate damage.</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="font-bold text-[#171717] block">✓ Proof of Purchase</span>
                <span className="text-gray-600">The original GST tax invoice issued by ATHARV ELECTRICAL must be provided.</span>
              </div>
            </div>
          </section>

          {/* Section 4: Refund Processing & Timeline */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">4</span>
              Refund Mode & Timeline (5 to 7 Business Days)
            </h2>
            <p>
              Once your returned item is received at our Chakan facility, our technical team will inspect the item within <strong>24 to 48 hours</strong>. Upon verification, the refund will be initiated immediately.
            </p>
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#166534] font-bold">
                <Clock className="w-4 h-4 text-[#168A45]" />
                <span>Standard Refund Processing Timeframe</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#15803D]">
                <li><strong>Online Prepaid Payments (UPI, Cards, Net Banking via Cashfree):</strong> Refund is credited directly to the customer's original payment source within <strong>5 to 7 business days</strong>, depending on your issuing bank's settlement cycle.</li>
                <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are transferred directly to the customer's verified Indian Bank Account via NEFT/IMPS or UPI ID within <strong>3 to 5 business days</strong> of return pickup verification.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Step-by-Step Return Process */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">5</span>
              How to Request a Return or Refund
            </h2>
            <p>
              To initiate a cancellation or refund request, please follow these simple steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-xs">
              <li><strong>Contact Support:</strong> Email <strong>atharvelectricals@gmail.com</strong> or call <strong>+91 77200 36820</strong> within 7 days of package delivery.</li>
              <li><strong>Provide Details:</strong> Share your Order Number (e.g. <code>AE_...</code>), delivery address, and a brief description of the issue. For damaged items, attach clear photographs or an unboxing video.</li>
              <li><strong>Pickup Coordination:</strong> Our logistics partner will arrange a reverse pickup from your doorstep in Chakan / Pune or across India.</li>
              <li><strong>Inspection & Resolution:</strong> Once received, choose between a free express replacement dispatched immediately or a 100% full refund.</li>
            </ol>
          </section>

          {/* Dedicated Support Box */}
          <div className="bg-[#FFFCF9] border border-orange-200 rounded-2xl p-6 space-y-3 mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#FF6A00]">Dedicated Refund Support Desk</h3>
            <p className="text-xs text-[#171717]">
              Need help with a return or refund? Contact our dedicated store management team directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <a
                href="tel:+917720036820"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#171717] hover:text-[#FF6A00]"
              >
                <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
                <span>+91 77200 36820</span>
              </a>
              <a
                href="mailto:atharvelectricals@gmail.com"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#171717] hover:text-[#FF6A00]"
              >
                <Mail className="w-4 h-4 text-[#FF6A00]" />
                <span>atharvelectricals@gmail.com</span>
              </a>
            </div>
            <p className="text-[11px] text-[#666666] pt-1">
              Store Address: ATHARV ELECTRICAL · Manik Chowk, Chakan, Pune, Maharashtra — 410501, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
