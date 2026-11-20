import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  CheckCircle2,
  Building,
  Store,
  Navigation,
} from 'lucide-react';
import { STORE_LOCATION_DATA } from '../../data/demoData';
import { useApp } from '../../context/AppContext';

export const ContactUsPage: React.FC = () => {
  const { showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Product Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in your name, contact phone and inquiry message.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Inquiry sent successfully! Our Chakan store team will contact you shortly.', 'success');
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen pb-20">
      {/* 1. Page Header */}
      <div className="bg-[#FFFCF9] border-b border-[#F0EAE1] py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] block mb-2">
              Customer Support & Store Information
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Contact Us
            </h1>
            <p className="text-sm sm:text-base text-[#666666] mt-3 font-normal leading-relaxed">
              Have questions about our Orient Electric & Goldmedal products, bulk orders, or existing shipments? Our dedicated team at Manik Chowk, Chakan is here to assist you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Official Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAEAEA] p-6 sm:p-7 shadow-xs space-y-6">
              <h2 className="text-lg font-heading font-bold text-[#171717] pb-3 border-b border-[#F0F0F0] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#FF6A00]" />
                Official Store & Showroom
              </h2>

              {/* Physical Location */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#666666]">Store Address</h3>
                  <p className="text-sm font-semibold text-[#171717] mt-1 leading-snug">
                    ATHARV ELECTRICAL
                  </p>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Manik Chowk, Chakan, Pune, Maharashtra — 410501, India
                  </p>
                  <a
                    href={STORE_LOCATION_DATA.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00] hover:text-[#F4511E] mt-2 group"
                  >
                    <span>View on Google Maps</span>
                    <Navigation className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Phone Helpline */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-[#F8F8F8]">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#666666]">Customer Helpline</h3>
                  <a
                    href="tel:+917720036820"
                    className="text-sm font-bold text-[#171717] hover:text-[#FF6A00] block mt-1 transition-colors"
                  >
                    +91 77200 36820
                  </a>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Voice calls & store inquiries (9:30 AM - 9:00 PM)
                  </p>
                </div>
              </div>

              {/* Email Support */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-[#F8F8F8]">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#666666]">Official Email</h3>
                  <a
                    href="mailto:atharvelectricals@gmail.com"
                    className="text-sm font-bold text-[#171717] hover:text-[#FF6A00] block mt-1 transition-colors"
                  >
                    atharvelectricals@gmail.com
                  </a>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Order confirmation, refund & cancellation support
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-[#F8F8F8]">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#666666]">Showroom Timings</h3>
                  <p className="text-sm font-semibold text-[#171717] mt-1">
                    Monday to Sunday: 9:30 AM – 9:00 PM
                  </p>
                  <p className="text-xs text-[#168A45] font-semibold mt-0.5">
                    Open all 7 days with live product demonstrations
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Quick Chat */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#166534]">Instant WhatsApp Support</h3>
                <p className="text-xs text-[#15803D] mt-0.5">Chat directly with our showroom team in Chakan</p>
              </div>
              <a
                href={`https://wa.me/${STORE_LOCATION_DATA.whatsapp}?text=Hi%20ATHARV%20ELECTRICAL,%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat Now</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Contact & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#EAEAEA] p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-heading font-extrabold text-[#171717]">
                Send Us a Message
              </h2>
              <p className="text-xs text-[#666666] mt-1.5">
                Fill in the details below and we will get back to you within 2-4 business hours.
              </p>

              {isSubmitted ? (
                <div className="mt-8 p-8 text-center bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
                  <h3 className="text-base font-bold text-[#166534]">Thank you for reaching out!</h3>
                  <p className="text-xs text-[#15803D] max-w-md mx-auto">
                    Your inquiry has been logged. Our customer service representative from ATHARV ELECTRICAL will contact you via phone or email shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-white text-[#166534] border border-[#BBF7D0] rounded-xl text-xs font-bold hover:bg-[#DCFCE7] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Your Full Name <span className="text-[#F4511E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Patil"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Mobile Number <span className="text-[#F4511E]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171717] mb-1.5">
                        Inquiry Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none bg-white transition-all"
                      >
                        <option value="Product Inquiry">Product Inquiry & Pricing</option>
                        <option value="Order Status">Order Status & Tracking</option>
                        <option value="Cancellation / Refund">Cancellation & Refund Request</option>
                        <option value="Warranty / Service">Brand Warranty Support</option>
                        <option value="Bulk Contractor Order">Bulk / Commercial Supply</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1.5">
                      Message / Requirement Details <span className="text-[#F4511E]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your product inquiry, order query, or cancellation requirement..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] focus:border-[#FF6A00] focus:outline-none transition-all resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
                    }}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Customer Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Store Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-[#FFFCF9] border border-orange-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#FF6A00] shrink-0" />
                <span className="text-xs font-semibold text-[#171717]">100% Genuine Orient & Goldmedal</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FFFCF9] border border-orange-100 flex items-center gap-3">
                <Building className="w-5 h-5 text-[#FF6A00] shrink-0" />
                <span className="text-xs font-semibold text-[#171717]">Physical Store in Manik Chowk</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FFFCF9] border border-orange-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#168A45] shrink-0" />
                <span className="text-xs font-semibold text-[#171717]">GST Registered & Tax Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
