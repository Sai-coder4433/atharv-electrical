import React, { useState } from 'react';
import { Store, MapPin, Phone, Mail, Upload, Save, CheckCircle2, Truck, Key, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uploadToStorage } from '../../firebase/services';

export const AdminStoreSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings, showToast } = useApp();

  const [form, setForm] = useState({
    storeName: storeSettings.storeName || 'ATHARV ELECTRICAL',
    location: storeSettings.location || 'Manik Chowk, Chakan, India',
    phone: storeSettings.phone || '+91 77200 36820',
    whatsapp: storeSettings.whatsapp || '+917720036820',
    email: storeSettings.email || 'contact@atharvelectrical.com',
    workingHours: storeSettings.workingHours || 'Monday - Sunday: 9:30 AM to 9:00 PM (Open all 7 Days)',
    logoUrl: storeSettings.logoUrl || 'https://i.postimg.cc/pLmDNdQ8/Whats-App-Image-2026-09-27-at-18-49-05.jpg',
    // Section 17: Separate Shiprocket Verified Pickup Address
    shiprocketPickup: {
      nickname: storeSettings.shiprocketPickup?.nickname || 'Atharv Electrical Depot',
      contactPerson: storeSettings.shiprocketPickup?.contactPerson || 'Atharv Dispatch Manager',
      phone: storeSettings.shiprocketPickup?.phone || '7720036820',
      email: storeSettings.shiprocketPickup?.email || 'dispatch@atharvelectrical.com',
      addressLine1: storeSettings.shiprocketPickup?.addressLine1 || 'Station Road, Near Manik Chowk',
      addressLine2: storeSettings.shiprocketPickup?.addressLine2 || 'Opp Central Bank',
      city: storeSettings.shiprocketPickup?.city || 'Chakan',
      state: storeSettings.shiprocketPickup?.state || 'Maharashtra',
      pincode: storeSettings.shiprocketPickup?.pincode || '410501',
    },
    // Shiprocket API Configuration
    shiprocketConfig: {
      email: storeSettings.shiprocketConfig?.email || '',
      password: storeSettings.shiprocketConfig?.password || '',
      isEnabled: storeSettings.shiprocketConfig?.isEnabled !== false,
      isSandbox: storeSettings.shiprocketConfig?.isSandbox || false,
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToStorage(file, 'store');
      setForm((prev) => ({ ...prev, logoUrl: url }));
      showToast('Store logo updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Logo upload failed', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(form);
    showToast('Store settings & Shiprocket pickup details saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Store & Logistics Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure official brand identity, customer storefront showroom, and verified Shiprocket pickup depot.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Card 1: Official Showroom Identity & Customer Location */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Store className="w-4 h-4 text-[#FF6A00]" />
            <h2 className="font-bold text-sm text-gray-900">Showroom Brand & Customer-Facing Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Official Brand Name</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm((prev) => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-bold text-gray-900"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Customer-facing brand: ATHARV ELECTRICAL
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Customer-Facing Showroom Address *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-semibold text-gray-900"
              />
              <span className="text-[11px] text-[#FF6A00] mt-1 block font-semibold">
                Permanent Customer Showroom: Manik Chowk, Chakan, India
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Showroom Working Hours</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm((prev) => ({ ...prev, workingHours: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Logo preview and URL */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <label className="block font-bold text-gray-800">Store Logo</label>
            <div className="flex items-center gap-4">
              <img
                src={form.logoUrl}
                alt="ATHARV ELECTRICAL Logo"
                className="h-14 w-auto object-contain rounded-lg border p-1 bg-white"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
                <label className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Shiprocket Verified Pickup Address (Section 17) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF6A00]" />
              <h2 className="font-bold text-sm text-gray-900">Shiprocket Verified Pickup Address</h2>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              Couriers pick packages up from this address
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Pickup Location Nickname *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.nickname}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, nickname: e.target.value },
                  }))
                }
                placeholder="e.g. Atharv Electrical Depot"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Must match Shiprocket pickup name</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Dispatch Contact Person *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.contactPerson}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, contactPerson: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Dispatch Phone *</label>
              <input
                type="tel"
                required
                value={form.shiprocketPickup.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, phone: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Pickup Address (Building & Street) *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.addressLine1}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, addressLine1: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Landmark / Area</label>
              <input
                type="text"
                value={form.shiprocketPickup.addressLine2 || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, addressLine2: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.city}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, city: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.state}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, state: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Verified Pickup Pincode *</label>
              <input
                type="text"
                required
                value={form.shiprocketPickup.pincode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketPickup: { ...prev.shiprocketPickup, pincode: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Shiprocket API Credentials (Section 8: Never exposed in client code) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Key className="w-4 h-4 text-[#FF6A00]" />
            <div>
              <h2 className="font-bold text-sm text-gray-900">Shiprocket API Credentials</h2>
              <p className="text-[11px] text-gray-400">
                Securely processed by Cloud Functions backend (Section 8)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Shiprocket Registered Email</label>
              <input
                type="email"
                value={form.shiprocketConfig.email || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketConfig: { ...prev.shiprocketConfig, email: e.target.value },
                  }))
                }
                placeholder="merchant@shiprocket.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Shiprocket Password</label>
              <input
                type="password"
                value={form.shiprocketConfig.password || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shiprocketConfig: { ...prev.shiprocketConfig, password: e.target.value },
                  }))
                }
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isSandbox"
              checked={form.shiprocketConfig.isSandbox || false}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  shiprocketConfig: { ...prev.shiprocketConfig, isSandbox: e.target.checked },
                }))
              }
              className="rounded text-[#FF6A00] focus:ring-[#FF6A00]"
            />
            <label htmlFor="isSandbox" className="font-semibold text-gray-700 text-xs">
              Enable Sandbox Mode (Test/Development Mode with simulated courier responses)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
