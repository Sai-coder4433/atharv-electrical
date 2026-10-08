import React, { useState } from 'react';
import { Store, MapPin, Phone, Mail, Upload, Save, CheckCircle2 } from 'lucide-react';
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
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(form);
    showToast('Store settings saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Store Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure official brand identity, contact numbers, and store location.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6 text-xs">
        {/* Brand Name & Location */}
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
            <label className="block font-bold text-gray-700 mb-1.5">Customer-Facing Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-semibold text-gray-900"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Default: Manik Chowk, Chakan, India
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

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
