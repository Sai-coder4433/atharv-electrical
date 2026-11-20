import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2, FileText, Database } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#FFFFFF] min-h-screen pb-20">
      {/* 1. Header Banner */}
      <div className="bg-[#FFFCF9] border-b border-[#F0EAE1] py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-2">
              Data Protection & Privacy Standards
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-3 font-normal leading-relaxed">
              Last updated: November 2026. At ATHARV ELECTRICAL (atharvelectrical.com), we are committed to safeguarding your personal privacy and protecting the financial information you share with us when ordering electrical products.
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
              Information We Collect
            </h2>
            <p>
              When you purchase products, register an account, or contact customer care on atharvelectrical.com, we collect the necessary details required to deliver your goods and provide customer service:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Personal Contact Information:</strong> Full name, verified mobile phone number, and email address.</li>
              <li><strong>Delivery Information:</strong> Physical delivery address (house/flat number, apartment/building, street, area, landmark, city, state, and Indian postal pincode).</li>
              <li><strong>Order History:</strong> Information regarding the products purchased, quantity, warranty registration, and tax invoices.</li>
              <li><strong>Technical Data:</strong> Browser type, operating device, and standard IP address used solely for session management and fraud prevention.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">2</span>
              Payment Security & Financial Privacy (Cashfree Gateway)
            </h2>
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl space-y-2 text-xs text-[#166534]">
              <div className="flex items-center gap-2 font-bold">
                <Lock className="w-4 h-4 text-[#168A45]" />
                <span>Zero Storage of Financial Credentials</span>
              </div>
              <p className="text-[#15803D]">
                ATHARV ELECTRICAL does <strong>NOT</strong> collect, view, or store your credit card numbers, debit card numbers, expiration dates, CVV codes, net banking passwords, or UPI MPINs on our servers.
              </p>
            </div>
            <p>
              All online payment transactions are processed through <strong>Cashfree Payments</strong>, an RBI-regulated Payment Aggregator compliant with PCI-DSS Level 1 specifications. Financial data transmission is safeguarded with <strong>256-bit bank-grade SSL encryption</strong>. Cashfree handles authorization directly with the National Payments Corporation of India (NPCI), Visa, Mastercard, RuPay, and your respective issuing bank.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">3</span>
              How We Use Your Information
            </h2>
            <p>The information we collect is strictly used for legitimate business operations:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>Processing, fulfilling, packaging, and dispatching your electrical orders.</li>
              <li>Transmitting required shipping details (name, delivery address, phone number) to logistics partners via Shiprocket to ensure doorstep delivery.</li>
              <li>Generating official GST tax invoices with brand warranty coverage.</li>
              <li>Sending order status notifications, AWB courier tracking links, and customer support communications.</li>
              <li>Preventing fraudulent orders and securing customer accounts.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">4</span>
              Third-Party Data Sharing & Non-Disclosure
            </h2>
            <p>
              <strong>We do not sell, rent, lease, or trade your personal information to any third parties or marketing agencies.</strong>
            </p>
            <p>
              Your data is shared exclusively with necessary operational service providers strictly bound by confidentiality:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li><strong>Payment Gateway:</strong> Cashfree Payments (for processing secure customer transactions).</li>
              <li><strong>Shipping Logistics:</strong> Shiprocket & authorized Indian courier networks (for parcel dispatch and delivery).</li>
              <li><strong>Cloud Infrastructure:</strong> Google Cloud & Firebase (for secure, encrypted customer database storage).</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] text-xs font-black flex items-center justify-center">5</span>
              Customer Rights & Compliance
            </h2>
            <p>
              Under the Indian Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, you have the right to access, review, modify, or request the deletion of your personal contact data stored on our website.
            </p>
            <p>
              To exercise these rights, or if you have any questions regarding our privacy practices, please contact our store administrator:
            </p>
            <div className="bg-[#FFFCF9] border border-orange-200 rounded-2xl p-5 space-y-1 mt-3">
              <p className="font-bold text-xs text-[#171717]">Privacy Officer — ATHARV ELECTRICAL</p>
              <p className="text-xs text-[#666666]">
                Manik Chowk, Chakan, Pune, Maharashtra — 410501, India<br />
                Helpline: <strong>+91 77200 36820</strong> · Email: <strong>atharvelectricals@gmail.com</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
