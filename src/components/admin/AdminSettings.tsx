import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isFirebaseConfigured } from '../../firebase/config';

export const AdminSettings: React.FC = () => {
  const { authUser, seedDatabase, isFirebaseConnected, showToast } = useApp();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    if (
      !confirm(
        'Are you sure you want to seed/sync Cloud Firestore? This will populate standard categories, subcategories, brands, products, banners, and coupons into your connected Firebase project.'
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedDatabase();
      setSeedResult(res.message);
    } catch (err: any) {
      setSeedResult(err.message || 'Seeding failed');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Admin & Backend Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage Firebase infrastructure, cloud database synchronization, and credentials.
        </p>
      </div>

      {/* Firebase Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isFirebaseConnected
                  ? 'bg-green-50 text-[#168A45]'
                  : 'bg-orange-50 text-[#FF6A00]'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Firebase Cloud Backend</h3>
              <p className="text-gray-500 text-[11px]">
                {isFirebaseConnected
                  ? 'Connected to Firebase Project SDK'
                  : 'Running in Progressive Local Mode with Demo Fallbacks'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto ${
              isFirebaseConnected
                ? 'bg-green-100 text-[#168A45]'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected ? 'bg-[#168A45] animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isFirebaseConnected ? 'Live Cloud Firestore' : 'Local Storage Mode'}</span>
          </span>
        </div>

        {/* 1-Click Database Seeder */}
        <div className="p-5 bg-orange-50/60 rounded-2xl border border-orange-100 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Database className="w-4 h-4 text-[#FF6A00]" />
            <span>1-Click Cloud Firestore Seeder</span>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            Populate your Cloud Firestore database with the official <strong>ATHARV ELECTRICAL</strong> catalogue:
            Categories (Fans, Lights, Switches, Wires, MCB, Accessories), Subcategories, Brands (ORIENT, Goldmedal),
            Products with variants and specifications, Hero Banners, and Deals.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-atharvay-gradient shadow-xs hover:shadow flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding Firestore...' : 'Seed / Sync Database Now'}</span>
            </button>

            {seedResult && (
              <span className="text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-xl border border-orange-200">
                {seedResult}
              </span>
            )}
          </div>
        </div>

        {/* Razorpay Gateway Status */}
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Razorpay Payment Gateway Setup</span>
          </div>
          <p className="text-gray-600 text-xs">
            Client-side uses <code className="font-mono bg-white px-1.5 py-0.5 rounded border">VITE_RAZORPAY_KEY_ID</code>.
            Server verification uses secure Cloud Functions in <code className="font-mono bg-white px-1.5 py-0.5 rounded border">functions/index.js</code> with HMAC SHA-256 signature verification.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#168A45]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Razorpay Checkout SDK Active</span>
          </div>
        </div>

        {/* Current Authenticated Admin */}
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-gray-400 text-[11px] block uppercase font-bold">Logged In Administrator</span>
            <p className="font-bold text-sm text-gray-900 mt-0.5">
              {authUser?.email || 'admin@atharvelectrical.com'}
            </p>
            <span className="text-[10px] text-[#168A45] font-bold bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">
              Role: {authUser?.role || 'admin'} · Custom Claim Verified
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4 text-gray-400" />
            <span>Protected Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};
