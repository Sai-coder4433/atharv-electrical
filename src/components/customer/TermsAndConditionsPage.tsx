import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Scale, CreditCard, Truck } from 'lucide-react';

export const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="bg-[#FFFFFF] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-[#FFFCF9] border-b border-[#F0EAE1] py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-2">
              Legal & Operational Policies
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-3 font-normal leading-relaxed">
              Last updated: November 2026. Welcome to ATHARV ELECTRICAL (accessible at atharvelectrical.com). By browsing our catalog, placing an order, or utilizing our customer portal, you agree to comply with and be bound by the following Terms and Conditions.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Body Content */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-10 text-xs sm:text-sm text-[#444444] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">1</span>
              General Information & Business Entity
            </h2>
            <p>
              This website is operated by <strong>ATHARV ELECTRICAL</strong>, an authorized dealership and retailer of premium electrical goods, with registered business premises at <strong>Manik Chowk, Chakan, Pune, Maharashtra — 410501, India</strong>.
            </p>
            <p>
              Throughout the site, the terms "we", "us", and "our" refer to ATHARV ELECTRICAL. We offer this website, including all information, tools, electrical products, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">2</span>
              Product Catalog & Indian Rupee (₹ INR) Pricing
            </h2>
            <p>
              All products listed on this website (including Orient Electric ceiling fans, BLDC smart fans, Goldmedal modular switches, LED architectural lighting, wires, cables, and distribution protection gear) are <strong>100% genuine and sourced directly from official manufacturers or their authorized national distributors</strong>.
            </p>
            <p>
              <strong>Currency & Taxes:</strong> All product prices displayed on the website are denominated in <strong>Indian National Rupees (₹ / INR)</strong>. Prices are inclusive of applicable Goods and Services Tax (GST) unless explicitly indicated otherwise on the checkout summary. A formal tax invoice compliant with Indian GST rules will accompany every delivered order.
            </p>
            <p>
              Prices and availability of products are subject to change without prior notice. In the event of an inadvertent technical error resulting in an incorrect price displayed, we reserve the right to correct the error and notify you before processing the order.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">3</span>
              Orders, Acceptance & Confirmation
            </h2>
            <p>
              When you place an order on atharvelectrical.com, you will receive an immediate on-screen confirmation and an automated email/SMS acknowledging receipt of your order with an exclusive <strong>Order Number (e.g. AE_...)</strong>.
            </p>
            <p>
              Order acceptance occurs when the products are picked, inspected for quality, and handed over to our logistics partner (Shiprocket / regional courier dispatch). We reserve the right to refuse or cancel any order for reasons including non-serviceable pincodes, suspected fraudulent payment, inventory stockouts, or pricing discrepancies. If your order is cancelled after your card/account has been charged, the full amount will be refunded immediately to your original payment method.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">4</span>
              Payment Processing & Financial Security
            </h2>
            <p>
              All online digital payments on atharvelectrical.com are processed through <strong>Cashfree Payments</strong>, a Reserve Bank of India (RBI) licensed and authorized Payment Aggregator complying with Payment Card Industry Data Security Standards (PCI-DSS Level 1).
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>Supported payment modes include UPI (Google Pay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking, and select digital wallets.</li>
              <li><strong>Zero Sensitive Storage:</strong> ATHARV ELECTRICAL does NOT collect, capture, or store your credit/debit card numbers, CVV codes, bank passwords, or UPI MPINs. All credential transmission is protected with 256-bit bank-grade SSL encryption directly to Cashfree's secure payment servers.</li>
              <li>For Cash on Delivery (COD) orders, payment must be handed over in cash or verified UPI scan upon delivery of the sealed package.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">5</span>
              Shipping, Dispatch & Delivery
            </h2>
            <p>
              We ship orders directly from our Chakan, Pune showroom and central warehouse using reliable logistics partners coordinated via Shiprocket.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Dispatch Time:</strong> Orders are dispatched within 24 to 48 hours of payment verification (excluding Sundays and national public holidays).</li>
              <li><strong>Estimated Delivery:</strong> 1-3 business days within Pune/Pimpri-Chinchwad/Maharashtra; 3-7 business days across other parts of India.</li>
              <li><strong>Free Delivery:</strong> All orders above ₹1,999 qualify for Free Express Delivery. Orders below this threshold incur nominal standard courier charges calculated transparently at checkout.</li>
              <li><strong>Live Tracking:</strong> Upon dispatch, an Air Waybill (AWB) number is generated and made visible in your customer account Order Tracking section.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">6</span>
              Brand Warranty & Product Guarantee
            </h2>
            <p>
              All electrical appliances sold through ATHARV ELECTRICAL carry the <strong>official manufacturer's pan-India brand warranty</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Orient Electric:</strong> 2 to 3 years standard manufacturer warranty on ceiling and BLDC fans (motor & electronics). On-site technician support is available via Orient customer care (+91 1800 103 6674).</li>
              <li><strong>Goldmedal Modular:</strong> Up to 10 years manufacturer warranty on mechanical switches and standard sockets; 2 years on electronic and LED accessories.</li>
              <li>The official GST tax invoice issued by ATHARV ELECTRICAL serves as valid proof of purchase for all warranty claims at authorized brand service centers across India.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">7</span>
              Governing Law & Dispute Jurisdiction
            </h2>
            <p>
              These Terms and Conditions and any separate agreements whereby we provide you electrical goods and services shall be governed by and construed in accordance with the substantive laws of <strong>India</strong>.
            </p>
            <p>
              Any disputes, controversies, or claims arising out of or in connection with the purchase of goods from atharvelectrical.com shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra, India</strong>.
            </p>
          </section>

          {/* Contact Box */}
          <div className="bg-[#FFFCF9] border border-orange-200 rounded-2xl p-6 space-y-2 mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#FF6A00]">Questions or Legal Queries</h3>
            <p className="text-xs text-[#171717]">
              If you have any questions regarding our Terms and Conditions, please contact us:
            </p>
            <p className="text-xs text-[#666666]">
              <strong>ATHARV ELECTRICAL</strong> · Manik Chowk, Chakan, Pune, Maharashtra — 410501, India<br />
              Email: <strong>atharvelectricals@gmail.com</strong> · Phone: <strong>+91 77200 36820</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
