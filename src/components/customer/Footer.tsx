import React from 'react';
import {
  PhoneCall,
  MapPin,
  Mail,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';
import { STORE_LOCATION_DATA } from '../../data/demoData';

export const Footer: React.FC = () => {
  const { setSelectedCategory, setCustomerView } = useApp();

  const handleCategoryNav = (catId: string) => {
    setSelectedCategory(catId);
    setCustomerView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#171717] text-white pt-14 pb-8 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* 4 Clean Columns as specified */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          {/* Column 1: ATHARV ELECTRICAL */}
          <div className="space-y-3">
            <Logo variant="dark" size="sm" />
            <p className="text-xs text-gray-400 leading-relaxed mt-2 max-w-xs">
              Electrical products for your home, office and everyday needs.
            </p>
            <div className="pt-2 text-[11px] text-gray-500">
              <span>Authorized dealer for Orient Electric & Goldmedal Systems.</span>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Shop
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => handleCategoryNav('fans')}
                  className="hover:text-white transition-colors"
                >
                  Fans
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('lights')}
                  className="hover:text-white transition-colors"
                >
                  Lights
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('switches')}
                  className="hover:text-white transition-colors"
                >
                  Switches & Sockets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('wires')}
                  className="hover:text-white transition-colors"
                >
                  Wires & Cables
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('accessories')}
                  className="hover:text-white transition-colors"
                >
                  Electrical Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="tel:+917720036820" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerView('orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerView('location');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Shipping & Dispatch
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerView('brands');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Brand Warranty
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCustomerView('location');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Store Location
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Visit Store */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Visit Store
            </h4>
            <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <p className="font-semibold text-white">ATHARV ELECTRICAL</p>
              <p>
                Shop No. 18, Ramkrishna Complex,<br />
                Opp. Indrayani Bank, Manik Chowk,<br />
                Chakan, Pune, Maharashtra – 410501
              </p>
              <p className="pt-1">
                <a
                  href="tel:+917720036820"
                  className="font-bold text-[#FF8A00] hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 77200 36820</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Simple Payment badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 ATHARV ELECTRICAL. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>UPI Payments</span>
            <span>·</span>
            <span>Credit/Debit Cards</span>
            <span>·</span>
            <span>Net Banking</span>
            <span>·</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
