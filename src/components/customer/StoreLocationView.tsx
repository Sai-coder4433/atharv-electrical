import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  PhoneCall,
  Mail,
  Navigation,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { STORE_LOCATION_DATA } from '../../data/demoData';

export const StoreLocationView: React.FC = () => {
  const [distanceInfo, setDistanceInfo] = useState<string | null>(null);

  const calculateDistance = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat1 = pos.coords.latitude;
          const lon1 = pos.coords.longitude;
          const lat2 = STORE_LOCATION_DATA.latitude;
          const lon2 = STORE_LOCATION_DATA.longitude;

          const R = 6371; // km
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = Math.round(R * c);

          setDistanceInfo(`You are approximately ${d} km from our Chakan showroom.`);
        },
        () => {
          setDistanceInfo('Location access denied. Our showroom is situated at Manik Chowk, Chakan, Pune.');
        }
      );
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] bg-[#FFF3E6] px-3 py-1 rounded-full">
          Physical Showroom & Wholesale Depot
        </span>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#171717] mt-2">
          Visit Our Store
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 font-medium">
          Experience our live BLDC fan demonstration ceiling and interactive modular lighting studio in Chakan, Pune.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Showroom Photography & Navigation */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#EAEAEA] aspect-video">
            <img
              src="/src/assets/images/store_showroom_interior_1790620397788.jpg"
              alt="ATHARV ELECTRICAL Showroom"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
              <div className="text-white">
                <span className="text-xs font-semibold text-[#FFB000]">Chakan Showroom</span>
                <p className="font-bold text-sm sm:text-base">
                  Over 1,200+ Fans & Lighting Fixtures on Display
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#F8F8F7] rounded-2xl border border-[#EAEAEA]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">Showroom Navigation</h3>
                <p className="text-xs text-[#666666]">Locate us easily from anywhere in Pune / Maharashtra.</p>
              </div>
              <button
                onClick={calculateDistance}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#EAEAEA] text-[#171717] hover:border-[#FF6A00] flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Calculate Distance</span>
              </button>
            </div>

            {distanceInfo && (
              <p className="mt-3 text-xs font-semibold text-[#168A45] bg-green-50 p-2.5 rounded-lg border border-green-200">
                {distanceInfo}
              </p>
            )}

            {/* Exactly Specified Buttons: Get Directions, Call Store, WhatsApp Us */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={STORE_LOCATION_DATA.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <a
                href={`tel:${STORE_LOCATION_DATA.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAEAEA] font-bold text-xs text-[#171717] bg-white hover:bg-[#F8F8F7]"
              >
                <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
                <span>Call Store</span>
              </a>

              <a
                href={`https://wa.me/${STORE_LOCATION_DATA.whatsapp}?text=Hello%20ATHARV%20ELECTRICAL,%20I%20want%20to%20inquire%20about%20store%20products.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-xs hover:bg-[#1EBE5D]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Official Store Information */}
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171717]">
              ATHARV ELECTRICAL
            </h2>
            <p className="text-xs text-[#FF6A00] font-semibold mt-0.5">
              {STORE_LOCATION_DATA.tagline}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#FFF3E6] text-[#FF6A00] mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#171717] block">Address</span>
                <p className="text-[#666666] mt-0.5 leading-relaxed">
                  Shop No. 18, Ramkrishna Complex,<br />
                  Opp. Indrayani Bank, Manik Chowk,<br />
                  Chakan, Pune, Maharashtra – 410501
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#FFF3E6] text-[#FF6A00] mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#171717] block">Working Hours</span>
                <p className="text-[#666666] mt-0.5">
                  {STORE_LOCATION_DATA.workingHours}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#FFF3E6] text-[#FF6A00] mt-0.5">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#171717] block">Contact</span>
                <p className="text-[#666666] mt-0.5">
                  <a href={`tel:${STORE_LOCATION_DATA.phone}`} className="font-bold text-[#171717] hover:underline">
                    {STORE_LOCATION_DATA.phone}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#FFF3E6] text-[#FF6A00] mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#171717] block">Email</span>
                <p className="text-[#666666] mt-0.5">
                  <a href={`mailto:${STORE_LOCATION_DATA.email}`} className="text-[#FF6A00] hover:underline">
                    {STORE_LOCATION_DATA.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#929292] mb-3">
              In-Store Services & Facilities
            </h3>
            <div className="space-y-2">
              {STORE_LOCATION_DATA.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#168A45]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
