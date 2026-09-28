import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MobileHeader, BottomMobileNavigation } from './components/common/MobileHeader';
import { HomePage } from './components/customer/HomePage';
import { ShopListing } from './components/customer/ShopListing';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingView } from './components/customer/OrderTrackingView';
import { CustomerAccountView } from './components/customer/CustomerAccountView';
import { OffersView } from './components/customer/OffersView';
import { BrandsView } from './components/customer/BrandsView';
import { StoreLocationView } from './components/customer/StoreLocationView';
import { Footer } from './components/customer/Footer';
import { MessageCircle, PhoneCall, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Product } from './types';
import { STORE_LOCATION_DATA } from './data/demoData';

const MainAppContent: React.FC = () => {
  const {
    customerView,
    selectedProductId,
    setSelectedProductId,
    products,
    toasts,
  } = useApp();

  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);

  // If selectedProductId changes from search or listing
  const currentModalProduct =
    activeDetailProduct || (selectedProductId ? products.find((p) => p.id === selectedProductId) || null : null);

  const handleCloseDetail = () => {
    setActiveDetailProduct(null);
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#171717]">
      {/* 1. Desktop & Mobile Headers */}
      <Header />
      <MobileHeader />

      {/* 2. Main Customer View Body */}
      <main className="flex-1 pb-16 md:pb-0">
        {customerView === 'home' && (
          <HomePage onOpenProductDetail={(prod) => setActiveDetailProduct(prod)} />
        )}
        {customerView === 'shop' && (
          <ShopListing onOpenProductDetail={(prod) => setActiveDetailProduct(prod)} />
        )}
        {customerView === 'checkout' && <CheckoutModal />}
        {(customerView === 'orders' || customerView === 'order-tracking') && (
          <OrderTrackingView />
        )}
        {(customerView === 'account' || customerView === 'wishlist') && (
          <CustomerAccountView />
        )}
        {customerView === 'offers' && <OffersView />}
        {customerView === 'brands' && <BrandsView />}
        {customerView === 'location' && <StoreLocationView />}
      </main>

      {/* 3. Customer Footer */}
      <Footer />

      {/* 4. Bottom Mobile Navigation */}
      <BottomMobileNavigation />

      {/* 5. Cart Slide-Out Drawer */}
      <CartDrawer />

      {/* 6. Product Detail Modal */}
      {currentModalProduct && (
        <ProductDetailModal
          product={currentModalProduct}
          onClose={handleCloseDetail}
        />
      )}

      {/* 7. Floating WhatsApp / Store Call Trigger */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end gap-2.5">
        <a
          href={`https://wa.me/${STORE_LOCATION_DATA.whatsapp}?text=Hi%20ATHARV%20ELECTRICAL,%20I%20have%20an%20inquiry%20regarding%20electrical%20products.`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 px-3 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          title="Chat with ATHARV ELECTRICAL on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300">
            WhatsApp Store
          </span>
        </a>
      </div>

      {/* 8. Toast Notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold bg-white animate-in slide-in-from-top-2 duration-200 max-w-sm"
            style={{
              borderColor: toast.type === 'success' ? '#C8E6C9' : toast.type === 'error' ? '#FFCDD2' : '#EAEAEA',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-[#168A45] shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#FF6A00] shrink-0" />
            )}
            <span className="text-[#171717]">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
