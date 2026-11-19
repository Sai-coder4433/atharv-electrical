import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { CustomerAuthModal } from './components/customer/CustomerAuthModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { Footer } from './components/customer/Footer';
import { MessageCircle, CheckCircle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Product } from './types';
import { STORE_LOCATION_DATA } from './data/demoData';

/**
 * Protected Route for Admin Panel
 * Strictly verifies that the authenticated user possesses verified custom claim `admin: true`.
 * If unauthenticated or unauthorized, immediately redirects to /admin/login.
 */
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !authUser.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Root /admin redirect helper
 * Redirects to /admin/dashboard if already verified, or /admin/login if not.
 */
const AdminRootRedirect: React.FC = () => {
  const { authUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Connecting to Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (authUser?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
};

/**
 * Customer View Wrapper with responsive headers, footers, modals and drawers.
 */
interface CustomerViewWrapperProps {
  view: string;
}

const CustomerViewWrapper: React.FC<CustomerViewWrapperProps> = ({ view }) => {
  const {
    customerView,
    setCustomerView,
    selectedProductId,
    setSelectedProductId,
    products,
  } = useApp();

  const navigate = useNavigate();
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);

  // Synchronize router view with AppContext customerView
  useEffect(() => {
    if (view && view !== customerView) {
      setCustomerView(view);
    }
  }, [view, customerView, setCustomerView]);

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
        {view === 'home' && (
          <HomePage onOpenProductDetail={(prod) => setActiveDetailProduct(prod)} />
        )}
        {view === 'shop' && (
          <ShopListing onOpenProductDetail={(prod) => setActiveDetailProduct(prod)} />
        )}
        {view === 'checkout' && <CheckoutModal />}
        {(view === 'orders' || view === 'order-tracking') && <OrderTrackingView />}
        {view === 'account' && <CustomerAccountView />}
        {view === 'wishlist' && <CustomerAccountView />}
        {view === 'offers' && <OffersView />}
        {view === 'brands' && <BrandsView />}
        {view === 'location' && <StoreLocationView />}
      </main>

      {/* 3. Customer Footer */}
      <Footer />

      {/* 4. Bottom Mobile Navigation */}
      <BottomMobileNavigation />

      {/* 5. Cart Slide-Out Drawer */}
      <CartDrawer />

      {/* 6. Product Detail Modal */}
      {currentModalProduct && (
        <ProductDetailModal product={currentModalProduct} onClose={handleCloseDetail} />
      )}

      {/* 7. Customer Auth Modal */}
      <CustomerAuthModal />

      {/* 8. Floating WhatsApp Store Contact Trigger */}
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
    </div>
  );
};

/**
 * Toast Notification Layer
 */
const GlobalToastContainer: React.FC = () => {
  const { toasts } = useApp();

  return (
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
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRootRedirect />} />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route path="/" element={<CustomerViewWrapper view="home" />} />
          <Route path="/shop" element={<CustomerViewWrapper view="shop" />} />
          <Route path="/checkout" element={<CustomerViewWrapper view="checkout" />} />
          <Route path="/orders" element={<CustomerViewWrapper view="orders" />} />
          <Route path="/order-tracking" element={<CustomerViewWrapper view="order-tracking" />} />
          <Route path="/account" element={<CustomerViewWrapper view="account" />} />
          <Route path="/wishlist" element={<CustomerViewWrapper view="wishlist" />} />
          <Route path="/offers" element={<CustomerViewWrapper view="offers" />} />
          <Route path="/brands" element={<CustomerViewWrapper view="brands" />} />
          <Route path="/location" element={<CustomerViewWrapper view="location" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Layer */}
        <GlobalToastContainer />
      </HashRouter>
    </AppProvider>
  );
}
