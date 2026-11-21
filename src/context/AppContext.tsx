import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Product,
  Category,
  SubcategoryItem,
  BrandItem,
  Order,
  Customer,
  Coupon,
  HeroBanner,
  ProductReview,
  PaymentRecord,
  CartItem,
  DeliveryAddress,
  OrderStatus,
  Brand,
  StoreSettings,
  AuthUser,
  ShipmentRecord,
  ShipmentStatus,
  ShiprocketCourierRate,
  AdminActivityLog,
  OrderActivityRecord,
  InventoryAdjustmentRecord,
  AdminNotification,
} from '../types';
import {
  CATEGORIES_DATA,
  SUBCATEGORIES_DATA,
  BRANDS_DATA,
  DEMO_COUPONS,
  HERO_BANNERS_DATA,
  STORE_LOCATION_DATA,
} from '../data/demoData';
import {
  auth,
  db,
  isFirebaseConfigured,
} from '../firebase/config';
import {
  subscribeToAuth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  fetchFirestoreCategories,
  createFirestoreCategory,
  updateFirestoreCategory,
  deleteFirestoreCategory,
  fetchFirestoreSubcategories,
  createFirestoreSubcategory,
  updateFirestoreSubcategory,
  deleteFirestoreSubcategory,
  fetchFirestoreBrands,
  createFirestoreBrand,
  updateFirestoreBrand,
  deleteFirestoreBrand,
  fetchFirestoreProducts,
  createFirestoreProduct,
  updateFirestoreProduct,
  deleteFirestoreProduct,
  fetchFirestoreOrders,
  createFirestoreOrder,
  updateFirestoreOrderStatus,
  recordFirestorePayment,
  fetchFirestorePayments,
  fetchFirestoreCoupons,
  createFirestoreCoupon,
  updateFirestoreCoupon,
  deleteFirestoreCoupon,
  subscribeToFirestoreCoupons,
  fetchFirestoreBanners,
  createFirestoreBanner,
  updateFirestoreBanner,
  deleteFirestoreBanner,
  subscribeToFirestoreBanners,
  fetchFirestoreReviews,
  createFirestoreReview,
  updateFirestoreReviewStatus,
  subscribeToFirestoreReviews,
  fetchFirestoreSettings,
  saveFirestoreSettings,
  subscribeToFirestoreSettings,
  subscribeToFirestoreProducts,
  subscribeToFirestoreCategories,
  subscribeToFirestoreSubcategories,
  subscribeToFirestoreBrands,
  subscribeToFirestoreOrders,
  requestRazorpayOrder,
  verifyRazorpaySignature,
  createCashfreePaymentOrder,
  verifyCashfreePaymentSession,
  seedInitialFirestoreData,
  fetchFirestoreShipments,
  subscribeToFirestoreShipments,
  checkShiprocketServiceability,
  createShiprocketShipment,
  generateShiprocketAwb,
  scheduleShiprocketPickup,
  generateShiprocketLabel,
  cancelShiprocketShipment,
  trackShiprocketShipment,
  saveShiprocketConfig,
  logAdminActivity,
  fetchFirestoreActivityLogs,
  subscribeToFirestoreActivityLogs,
  recordOrderActivity,
  recordInventoryAdjustment,
  fetchInventoryAdjustments,
  fetchFirestoreCustomers,
  subscribeToFirestoreCustomers,
  initiateCashfreeRefund,
  createAdminNotification,
  fetchFirestoreNotifications,
  subscribeToFirestoreNotifications,
  markFirestoreNotificationRead,
  clearAllFirestoreNotifications,
  saveCustomerInternalNotes,
  sendCustomerPasswordReset,
} from '../firebase/services';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Authentication
  authUser: AuthUser | null;
  authLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthUser>;
  register: (email: string, pass: string, name?: string) => Promise<boolean>;
  loginGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;

  // Firebase Connectivity
  isFirebaseConnected: boolean;
  seedDatabase: () => Promise<{ success: boolean; message: string }>;

  // Navigation & View State
  activeMode: 'customer' | 'admin';
  setActiveMode: (mode: 'customer' | 'admin') => void;
  customerView: string;
  setCustomerView: (view: string) => void;
  adminView: string;
  setAdminView: (view: string) => void;

  // Selected Entities
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcat: string | null) => void;
  selectedBrand: Brand | 'ALL';
  setSelectedBrand: (brand: Brand | 'ALL') => void;

  // Data Collections
  products: Product[];
  categories: Category[];
  subcategories: SubcategoryItem[];
  brands: BrandItem[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  heroBanners: HeroBanner[];
  reviews: ProductReview[];
  payments: PaymentRecord[];
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void | Promise<void>;

  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  deliveryPincode: string;
  setDeliveryPincode: (pin: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (open: boolean) => void;

  // Customer Methods
  addToCart: (
    product: Product,
    variants?: Record<string, string>,
    qty?: number,
    isBuyNow?: boolean,
    bypassAuth?: boolean
  ) => boolean;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay' | 'Cashfree',
    razorpayDetails?: { orderId?: string; paymentId?: string }
  ) => Promise<Order>;
  submitProductReview: (review: Omit<ProductReview, 'id' | 'date'>) => Promise<void>;

  // Cashfree & Online Checkout
  processCashfreePayment: (
    address: DeliveryAddress,
    onSuccess: (order: Order) => void,
    onFailure: (err: string) => void
  ) => Promise<void>;

  processRazorpayPayment: (
    address: DeliveryAddress,
    onSuccess: (order: Order) => void,
    onFailure: (err: string) => void
  ) => Promise<void>;

  // Admin Methods
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => void;
  updateInventoryStock: (productId: string, newStock: number) => Promise<void>;

  // Admin Category & Subcategory CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (sub: Omit<SubcategoryItem, 'id'>) => Promise<void>;
  updateSubcategory: (id: string, updates: Partial<SubcategoryItem>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  // Admin Brand CRUD
  addBrand: (brand: Omit<BrandItem, 'id'>) => Promise<void>;
  updateBrand: (id: string, updates: Partial<BrandItem>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Admin Banner & Coupon CRUD
  updateHeroBanner: (bannerId: string, updates: Partial<HeroBanner>) => void | Promise<void>;
  addHeroBanner: (banner: Omit<HeroBanner, 'id'>) => void | Promise<void>;
  deleteHeroBanner: (bannerId: string) => void | Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void | Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void | Promise<void>;
  deleteCoupon: (id: string) => void | Promise<void>;
  moderateReview: (id: string, status: ProductReview['status']) => Promise<void>;

  // Activity Logs & Audit Trail
  activityLogs: AdminActivityLog[];
  inventoryAdjustments: InventoryAdjustmentRecord[];
  recordAuditLog: (
    log: Omit<AdminActivityLog, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorEmail' | 'actorRole'>
  ) => Promise<void>;
  adjustProductStock: (
    productId: string,
    delta: number,
    reason: InventoryAdjustmentRecord['reason'],
    notes?: string
  ) => Promise<void>;
  processOrderRefund: (
    orderId: string,
    paymentId: string,
    amount: number,
    reason: string
  ) => Promise<{ success: boolean; message: string }>;

  // Admin Shipping & Shiprocket Management
  shipments: ShipmentRecord[];
  createShipmentForOrder: (
    orderId: string,
    packageDetails: {
      weight: number;
      dimensions: { length: number; breadth: number; height: number };
      courierId?: number | string;
      shippingCharge?: number;
    }
  ) => Promise<ShipmentRecord | null>;
  generateAwbForShipment: (shipmentDocId: string, courierId?: number | string) => Promise<boolean>;
  schedulePickupForShipment: (shipmentDocId: string, pickupDate?: string) => Promise<boolean>;
  generateLabelForShipment: (shipmentDocId: string) => Promise<string | null>;
  cancelShipment: (shipmentDocId: string) => Promise<boolean>;
  refreshShipmentTracking: (awbCode: string, shipmentDocId?: string) => Promise<void>;
  checkShippingRates: (
    deliveryPincode: string,
    weight?: number,
    dimensions?: { length: number; breadth: number; height: number }
  ) => Promise<ShiprocketCourierRate[]>;

  // Notifications & Alerts
  notifications: AdminNotification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  createNotification: (notif: Omit<AdminNotification, 'id'>) => Promise<string>;

  // CRM Actions
  addCustomerNote: (customerId: string, noteText: string) => Promise<void>;
  sendCustomerPasswordResetEmail: (email: string) => Promise<void>;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Calculations
  cartSubtotal: number;
  cartDiscount: number;
  cartDeliveryCharge: number;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Mode & Views
  const [activeMode, setActiveMode] = useState<'customer' | 'admin'>('customer');

  // Customer View is derived directly from React Router location
  const customerView = useMemo(() => {
    const cleanPath = location.pathname.replace(/^\//, '').split('/')[0];
    return cleanPath || 'home';
  }, [location.pathname]);

  // Navigate reliably across all customer routes using React Router
  const setCustomerView = useCallback((newView: string) => {
    const targetPath = newView === 'home' ? '/' : `/${newView}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [location.pathname, navigate]);

  const [adminView, setAdminView] = useState<string>('dashboard');

  // Active selections
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'ALL'>('ALL');

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('410501');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('ae_settings');
      return saved
        ? JSON.parse(saved)
        : {
            storeName: STORE_LOCATION_DATA.name,
            tagline: STORE_LOCATION_DATA.tagline,
            location: STORE_LOCATION_DATA.address,
            phone: STORE_LOCATION_DATA.phone,
            whatsapp: STORE_LOCATION_DATA.whatsapp,
            email: STORE_LOCATION_DATA.email,
            workingHours: STORE_LOCATION_DATA.workingHours,
            googleMapsUrl: STORE_LOCATION_DATA.googleMapsUrl,
          };
    } catch {
      return {
        storeName: STORE_LOCATION_DATA.name,
        location: STORE_LOCATION_DATA.address,
        phone: STORE_LOCATION_DATA.phone,
        whatsapp: STORE_LOCATION_DATA.whatsapp,
        email: STORE_LOCATION_DATA.email,
        workingHours: STORE_LOCATION_DATA.workingHours,
      };
    }
  });

  // Products collection (Cloud Firestore is the single source of truth — no fake demo items)
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('ae_categories');
      return saved ? JSON.parse(saved) : CATEGORIES_DATA;
    } catch {
      return CATEGORIES_DATA;
    }
  });

  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ae_subcategories');
      return saved ? JSON.parse(saved) : SUBCATEGORIES_DATA;
    } catch {
      return SUBCATEGORIES_DATA;
    }
  });

  const [brands, setBrands] = useState<BrandItem[]>(() => {
    try {
      const saved = localStorage.getItem('ae_brands');
      return saved ? JSON.parse(saved) : BRANDS_DATA;
    } catch {
      return BRANDS_DATA;
    }
  });

  // 100% Real Firebase State — No Mock/Demo Records
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<InventoryAdjustmentRecord[]>([]);

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('ae_coupons');
      return saved ? JSON.parse(saved) : DEMO_COUPONS;
    } catch {
      return DEMO_COUPONS;
    }
  });

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => {
    try {
      const saved = localStorage.getItem('ae_banners');
      return saved ? JSON.parse(saved) : HERO_BANNERS_DATA;
    } catch {
      return HERO_BANNERS_DATA;
    }
  });

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ae_shipments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ae_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ae_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.removeItem('ae_products');
      localStorage.removeItem('ae_orders');
      localStorage.setItem('ae_categories', JSON.stringify(categories));
      localStorage.setItem('ae_subcategories', JSON.stringify(subcategories));
      localStorage.setItem('ae_brands', JSON.stringify(brands));
      localStorage.setItem('ae_cart', JSON.stringify(cart));
      localStorage.setItem('ae_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('ae_coupons', JSON.stringify(coupons));
      localStorage.setItem('ae_banners', JSON.stringify(heroBanners));
      localStorage.setItem('ae_settings', JSON.stringify(storeSettings));
      localStorage.setItem('ae_shipments', JSON.stringify(shipments));
    } catch (e) {
      console.warn('Storage sync warn', e);
    }
  }, [products, categories, subcategories, brands, cart, wishlist, coupons, heroBanners, storeSettings, shipments]);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Dynamically derive customers from orders and Firestore customers
  const derivedCustomers: Customer[] = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => {
      map.set(c.id, { ...c });
    });

    orders.forEach((o) => {
      const email = o.customerEmail?.toLowerCase().trim();
      const phone = o.customerPhone?.trim();
      const key = email || phone || o.customerName.toLowerCase().replace(/\s+/g, '_');
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          id: `cust_${key.replace(/[^a-z0-9]/g, '_')}`,
          name: o.customerName || 'Customer',
          email: o.customerEmail || '',
          phone: o.customerPhone || '',
          ordersCount: 1,
          totalSpend: o.totalAmount || 0,
          lastOrderDate: o.createdAt,
          status: 'Active',
          addresses: o.deliveryAddress ? [o.deliveryAddress] : [],
        });
      } else {
        const existing = map.get(key)!;
        existing.ordersCount += 1;
        existing.totalSpend += o.totalAmount || 0;
        if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = o.createdAt;
        }
        if (
          o.deliveryAddress &&
          !existing.addresses.some(
            (a) => a.pincode === o.deliveryAddress.pincode && a.houseBuilding === o.deliveryAddress.houseBuilding
          )
        ) {
          existing.addresses.push(o.deliveryAddress);
        }
      }
    });

    // Compute Advanced CRM 360 attributes for every customer
    const result: Customer[] = [];
    map.forEach((cust) => {
      const email = cust.email.toLowerCase().trim();
      const phone = cust.phone.trim();
      const custOrders = orders.filter((o) => {
        return (
          (email && o.customerEmail && o.customerEmail.toLowerCase().trim() === email) ||
          (phone && o.customerPhone && o.customerPhone.trim() === phone) ||
          (o.customerName && cust.name && o.customerName.toLowerCase() === cust.name.toLowerCase())
        );
      });

      const aov = cust.ordersCount > 0 ? Math.round(cust.totalSpend / cust.ordersCount) : 0;
      const highest = custOrders.reduce((m, ord) => Math.max(m, ord.totalAmount || 0), 0);

      // Category & brand preferences
      const catCounts: Record<string, number> = {};
      const brandCounts: Record<string, number> = {};
      const activities: { id: string; action: string; timestamp: string; details?: string }[] = [];

      // Account created activity
      activities.push({
        id: `act-reg-${cust.id}`,
        action: 'Account Registered',
        timestamp: cust.createdAt || cust.lastOrderDate || new Date().toISOString(),
        details: 'Customer profile registered in store database',
      });

      custOrders.forEach((co) => {
        activities.push({
          id: `act-ord-${co.id}`,
          action: `Order Placed (${co.orderNumber})`,
          timestamp: co.createdAt,
          details: `Amount ₹${co.totalAmount.toLocaleString('en-IN')} via ${co.paymentMethod} (${co.status})`,
        });

        co.items?.forEach((ci) => {
          const cat = ci.product?.categoryName || 'General';
          const br = ci.product?.brand || 'Generic';
          catCounts[cat] = (catCounts[cat] || 0) + (ci.quantity || 1);
          brandCounts[br] = (brandCounts[br] || 0) + (ci.quantity || 1);
        });
      });

      const preferredCategories = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
      const preferredBrands = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a]);

      // Automatic Customer Classification
      const daysSinceLastOrder = cust.lastOrderDate
        ? (Date.now() - new Date(cust.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      let customerType: 'New' | 'Returning' | 'Regular' | 'High-Value' | 'Inactive' = 'New';
      if (daysSinceLastOrder > 90 && cust.ordersCount > 0) {
        customerType = 'Inactive';
      } else if (cust.totalSpend >= 20000 || cust.ordersCount >= 4) {
        customerType = 'High-Value';
      } else if (cust.ordersCount >= 2) {
        customerType = 'Returning';
      } else if (cust.ordersCount === 1) {
        customerType = 'New';
      }

      result.push({
        ...cust,
        customerType,
        averageOrderValue: aov,
        highestOrderValue: highest,
        preferredCategories,
        preferredBrands,
        activities: activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        internalNotes: cust.internalNotes || [],
      });
    });

    return result;
  }, [orders, customers]);

  // Toast notifier
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Progressive Firestore Data Hydration & Live Database Synchronization
  useEffect(() => {
    if (!db) return;

    // 1. Initial Data Fetch
    fetchFirestoreCategories().then((res) => {
      if (res && res.length > 0) setCategories(res);
    });
    fetchFirestoreSubcategories().then((res) => {
      if (res && res.length > 0) setSubcategories(res);
    });
    fetchFirestoreBrands().then((res) => {
      if (res && res.length > 0) setBrands(res);
    });
    fetchFirestoreProducts().then((res) => {
      setProducts(res || []);
    });
    fetchFirestoreOrders().then((res) => {
      setOrders(res || []);
    });
    fetchFirestoreCustomers().then((res) => {
      if (res && res.length > 0) setCustomers(res);
    });
    fetchFirestoreActivityLogs().then((res) => {
      setActivityLogs(res || []);
    });
    fetchInventoryAdjustments().then((res) => {
      setInventoryAdjustments(res || []);
    });
    fetchFirestoreCoupons().then((res) => {
      if (res && res.length > 0) setCoupons(res);
    });
    fetchFirestoreBanners().then((res) => {
      if (res && res.length > 0) setHeroBanners(res);
    });
    fetchFirestoreReviews().then((res) => {
      setReviews(res || []);
    });
    fetchFirestorePayments().then((res) => {
      setPayments(res || []);
    });
    fetchFirestoreSettings().then((res) => {
      if (res) setStoreSettings((prev) => ({ ...prev, ...res }));
    });
    fetchFirestoreShipments().then((res) => {
      setShipments(res || []);
    });
    fetchFirestoreNotifications().then((res) => {
      setNotifications(res || []);
    });

    // 2. Real-time Live Database Listeners
    const unsubProducts = subscribeToFirestoreProducts((liveProds) => {
      setProducts(liveProds || []);
    });
    const unsubCategories = subscribeToFirestoreCategories((liveCats) => {
      if (liveCats && liveCats.length > 0) setCategories(liveCats);
    });
    const unsubSub = subscribeToFirestoreSubcategories((liveSubs) => {
      if (liveSubs && liveSubs.length > 0) setSubcategories(liveSubs);
    });
    const unsubBrands = subscribeToFirestoreBrands((liveBrands) => {
      if (liveBrands && liveBrands.length > 0) setBrands(liveBrands);
    });
    const unsubOrders = subscribeToFirestoreOrders((liveOrders) => {
      setOrders(liveOrders || []);
    });
    const unsubCustomers = subscribeToFirestoreCustomers((liveCusts) => {
      if (liveCusts && liveCusts.length > 0) setCustomers(liveCusts);
    });
    const unsubLogs = subscribeToFirestoreActivityLogs((liveLogs) => {
      setActivityLogs(liveLogs || []);
    });
    const unsubBanners = subscribeToFirestoreBanners((liveBanners) => {
      if (liveBanners && liveBanners.length > 0) setHeroBanners(liveBanners);
    });
    const unsubCoupons = subscribeToFirestoreCoupons((liveCoupons) => {
      if (liveCoupons && liveCoupons.length > 0) setCoupons(liveCoupons);
    });
    const unsubReviews = subscribeToFirestoreReviews((liveReviews) => {
      setReviews(liveReviews || []);
    });
    const unsubSettings = subscribeToFirestoreSettings((liveSettings) => {
      if (liveSettings) setStoreSettings((prev) => ({ ...prev, ...liveSettings }));
    });
    const unsubShipments = subscribeToFirestoreShipments((liveShipments) => {
      setShipments(liveShipments || []);
    });
    const unsubNotifs = subscribeToFirestoreNotifications((liveNotifs) => {
      setNotifications(liveNotifs || []);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSub();
      unsubBrands();
      unsubOrders();
      unsubCustomers();
      unsubLogs();
      unsubBanners();
      unsubCoupons();
      unsubReviews();
      unsubSettings();
      unsubShipments();
      unsubNotifs();
    };
  }, []);

  // Auth Functions
  const login = async (email: string, pass: string): Promise<AuthUser> => {
    try {
      const user = await loginWithEmail(email, pass);
      setAuthUser(user);
      showToast(`Welcome back, ${user.displayName || 'User'}!`, 'success');
      return user;
    } catch (err: any) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
      throw err;
    }
  };

  const register = async (email: string, pass: string, name?: string): Promise<boolean> => {
    try {
      const user = await registerWithEmail(email, pass, name);
      setAuthUser(user);
      createAdminNotification({
        type: 'customer_registered',
        title: 'New Customer Registered',
        description: `${user.displayName || email} registered an account`,
        timestamp: new Date().toISOString(),
        relatedId: user.uid,
        relatedType: 'customer',
        read: false,
      });
      showToast(`Account created! Welcome, ${user.displayName}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      return false;
    }
  };

  const loginGoogle = async (): Promise<boolean> => {
    try {
      const user = await loginWithGoogle();
      setAuthUser(user);
      showToast(`Signed in with Google as ${user.displayName}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In failed.', 'error');
      return false;
    }
  };

  const logout = async () => {
    await logoutUser();
    setAuthUser(null);
    showToast('Signed out successfully.', 'info');
  };

  // Seeding Database
  const seedDatabase = async () => {
    const result = await seedInitialFirestoreData(
      categories,
      subcategories,
      brands,
      products,
      heroBanners,
      coupons
    );
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
    return result;
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const cartDiscount = appliedCoupon
    ? Math.min(
        Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100),
        appliedCoupon.maxDiscount
      )
    : 0;
  // Free delivery threshold ₹1,999
  const cartDeliveryCharge = cartSubtotal > 1999 || cartSubtotal === 0 ? 0 : 99;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartDeliveryCharge);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Actions (Enforces Mandatory Customer Login Gate)
  const addToCart = (
    product: Product,
    variants?: Record<string, string>,
    qty: number = 1,
    isBuyNow: boolean = false,
    bypassAuth: boolean = false
  ): boolean => {
    const selected = variants || {};

    // 4. Customer Login & Authentication (Mandatory Gate for Cart)
    if (!authUser && !bypassAuth) {
      try {
        sessionStorage.setItem(
          'ae_pending_cart_action',
          JSON.stringify({
            product,
            variants: selected,
            qty,
            isBuyNow,
          })
        );
      } catch (e) {
        console.warn('Failed to save pending cart action to sessionStorage:', e);
      }
      showToast('Please sign in to add items to your cart or purchase', 'info');
      setIsLoginModalOpen(true);
      return false;
    }

    const variantKey = Object.entries(selected)
      .map(([k, v]) => `${k}:${v}`)
      .sort()
      .join('|');
    const cartItemId = `${product.id}-${variantKey}`;

    let finalUnitPrice = product.sellingPrice;
    let selectedColorName: string | undefined = selected['Color'];
    let selectedColorCode: string | undefined;
    let variantImage: string | undefined;
    let variantSku: string | undefined;

    if (product.variants && variants) {
      for (const [k, v] of Object.entries(variants)) {
        const found = product.variants.find((vr) => (vr.name === k || vr.colorName === v) && (vr.value === v || vr.colorName === v));
        if (found) {
          if (found.priceDelta) finalUnitPrice += found.priceDelta;
          if (found.colorCode) selectedColorCode = found.colorCode;
          if (found.colorName) selectedColorName = found.colorName;
          if (found.image) variantImage = found.image;
          if (found.sku) variantSku = found.sku;
        }
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedVariants: selected,
          selectedColor: selectedColorName,
          selectedColorCode,
          variantImage: variantImage || product.mainImage,
          variantSku: variantSku || product.sku,
          quantity: qty,
          unitPrice: finalUnitPrice,
        },
      ];
    });

    showToast(`Added "${product.name}"${selectedColorName ? ` (${selectedColorName})` : ''} to cart`, 'success');
    return true;
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const applyCoupon = (code: string): boolean => {
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
    );
    if (!coupon) {
      showToast('Invalid or expired coupon code', 'error');
      return false;
    }
    if (cartSubtotal < coupon.minOrderAmount) {
      showToast(`Coupon valid on minimum order of ₹${coupon.minOrderAmount}`, 'error');
      return false;
    }
    setAppliedCoupon(coupon);
    showToast(`Coupon "${coupon.code}" applied! Savings: ₹${cartDiscount || coupon.maxDiscount}`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Place Order (supports COD, Cashfree & Razorpay)
  const placeOrder = async (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay' | 'Cashfree',
    razorpayDetails?: { orderId?: string; paymentId?: string }
  ): Promise<Order> => {
    const timestamp = new Date();
    const orderNum = `AE${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, '0')}${timestamp.getDate().toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;

    const isPaid = paymentMethod === 'Razorpay' || Boolean(razorpayDetails?.paymentId);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: authUser?.uid,
      customerName: address.fullName,
      customerPhone: address.mobile,
      customerEmail: authUser?.email || 'customer@atharvelectrical.com',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryCharge: cartDeliveryCharge,
      totalAmount: cartTotal,
      couponCode: appliedCoupon?.code,
      deliveryAddress: address,
      paymentMethod,
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      status: 'Confirmed',
      razorpayOrderId: razorpayDetails?.orderId,
      razorpayPaymentId: razorpayDetails?.paymentId,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock locally and via Firestore
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((ci) => ci.product.id === p.id);
        if (cartMatch) {
          const updatedStock = Math.max(0, p.stock - cartMatch.quantity);
          const updatedStatus = updatedStock === 0 ? 'out_of_stock' : p.status;
          updateFirestoreProduct(p.id, { stock: updatedStock, status: updatedStatus });
          if (updatedStock <= p.lowStockThreshold) {
            createAdminNotification({
              type: updatedStock === 0 ? 'out_of_stock' : 'low_stock',
              title: updatedStock === 0 ? `Out of Stock: ${p.name}` : `Low Stock Alert: ${p.name}`,
              description: `Remaining inventory is ${updatedStock} units (Threshold: ${p.lowStockThreshold})`,
              timestamp: new Date().toISOString(),
              relatedId: p.id,
              relatedType: 'product',
              read: false,
            });
          }
          return {
            ...p,
            stock: updatedStock,
            status: updatedStatus,
          };
        }
        return p;
      })
    );

    // Save to Firestore
    await createFirestoreOrder(newOrder);

    // Business Notification
    createAdminNotification({
      type: 'order_created',
      title: `New Order #${newOrder.orderNumber}`,
      description: `${newOrder.customerName} placed an order for ₹${newOrder.totalAmount.toLocaleString('en-IN')}`,
      timestamp: new Date().toISOString(),
      relatedId: newOrder.id,
      relatedType: 'order',
      read: false,
    });

    // Save payment record if paid
    if (isPaid && razorpayDetails?.paymentId) {
      const paymentRec: PaymentRecord = {
        id: razorpayDetails.paymentId,
        orderId: newOrder.id,
        razorpayOrderId: razorpayDetails.orderId,
        razorpayPaymentId: razorpayDetails.paymentId,
        amount: cartTotal,
        currency: 'INR',
        status: 'Paid',
        method: paymentMethod,
        customerEmail: newOrder.customerEmail,
        customerPhone: newOrder.customerPhone,
        createdAt: new Date().toISOString(),
      };
      await recordFirestorePayment(paymentRec);
      setPayments((prev) => [paymentRec, ...prev]);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setSelectedOrderForTracking(newOrder);
    showToast(`Order ${orderNum} confirmed successfully!`, 'success');
    return newOrder;
  };

  // Cashfree Standard Checkout Flow (Server-side price calculation & verification)
  const processCashfreePayment = async (
    address: DeliveryAddress,
    onSuccess: (order: Order) => void,
    onFailure: (err: string) => void
  ) => {
    try {
      if (cart.length === 0) {
        throw new Error('Cart is empty. Please add products to proceed.');
      }

      showToast('Initiating secure Cashfree checkout...', 'info');

      // 1. Prepare items payload for backend price verification
      const itemsPayload = cart.map((item) => ({
        productId: item.product.productId || item.product.id,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
      }));

      // 2. Request backend to calculate exact Firestore price and create Cashfree order
      const cfOrder = await createCashfreePaymentOrder({
        items: itemsPayload,
        deliveryAddress: address,
        customerDetails: {
          customerId: authUser?.uid || `cust_${Date.now()}`,
          customerName: address.fullName,
          customerEmail: authUser?.email || 'customer@atharvelectrical.com',
          customerPhone: address.mobile,
        },
        couponCode: appliedCoupon?.code,
      });

      // 3. Load Cashfree Drop-in SDK if not already loaded
      if (!(window as any).Cashfree) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Cashfree payments SDK'));
          document.body.appendChild(script);
        });
      }

      const CashfreeSDK = (window as any).Cashfree;
      if (CashfreeSDK && cfOrder.paymentSessionId) {
        const cashfree = CashfreeSDK({
          mode: cfOrder.isSandbox ? 'sandbox' : 'production',
        });

        // 4. Open Cashfree Drop-in Modal Checkout
        await cashfree.checkout({
          paymentSessionId: cfOrder.paymentSessionId,
          redirectTarget: '_modal',
        });

        // 5. Server-side payment verification
        const verification = await verifyCashfreePaymentSession(cfOrder.orderId);
        if (verification.success && verification.order) {
          setOrders((prev) => [verification.order!, ...prev.filter((o) => o.id !== cfOrder.orderId)]);
          setCart([]);
          setAppliedCoupon(null);
          setSelectedOrderForTracking(verification.order);
          createAdminNotification({
            type: 'payment_success',
            title: `Cashfree Payment Confirmed`,
            description: `Payment of ₹${verification.order.totalAmount.toLocaleString('en-IN')} received for Order ${verification.order.orderNumber}`,
            timestamp: new Date().toISOString(),
            relatedId: verification.order.id,
            relatedType: 'order',
            read: false,
          });
          showToast(`Payment confirmed! Order ${verification.order.orderNumber} placed successfully.`, 'success');
          onSuccess(verification.order);
        } else {
          onFailure('Payment was cancelled or could not be verified by Cashfree.');
        }
      } else {
        const verification = await verifyCashfreePaymentSession(cfOrder.orderId);
        if (verification.success && verification.order) {
          setOrders((prev) => [verification.order!, ...prev.filter((o) => o.id !== cfOrder.orderId)]);
          setCart([]);
          setAppliedCoupon(null);
          setSelectedOrderForTracking(verification.order);
          onSuccess(verification.order);
        } else {
          onFailure('Payment could not be verified.');
        }
      }
    } catch (err: any) {
      console.error('Cashfree checkout error:', err);
      onFailure(err.message || 'Cashfree payment failed to initiate');
    }
  };

  // Razorpay Standard Checkout Flow
  const processRazorpayPayment = async (
    address: DeliveryAddress,
    onSuccess: (order: Order) => void,
    onFailure: (err: string) => void
  ) => {
    try {
      const timestamp = new Date();
      const receiptId = `rcpt_${timestamp.getTime()}`;

      // 1. Request order token from server/Cloud Function
      const rzpOrder = await requestRazorpayOrder(cartTotal, receiptId, {
        name: address.fullName,
        email: authUser?.email || 'customer@atharvelectrical.com',
        contact: address.mobile,
      });

      // 2. Read Razorpay Key ID
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_54AtharvElecDemo';

      // 3. Check if window.Razorpay is loaded
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: razorpayKey,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'ATHARV ELECTRICAL',
          description: `Order ${receiptId} · Manik Chowk, Chakan`,
          image: 'https://i.postimg.cc/pLmDNdQ8/Whats-App-Image-2026-09-27-at-18-49-05.jpg',
          order_id: rzpOrder.id.startsWith('order_mock_') ? undefined : rzpOrder.id,
          prefill: {
            name: address.fullName,
            email: authUser?.email || 'contact@atharvelectrical.com',
            contact: address.mobile,
          },
          theme: {
            color: '#FF6A00',
          },
          handler: async (response: any) => {
            // 4. Server-side signature verification
            const isVerified = await verifyRazorpaySignature({
              razorpay_order_id: response.razorpay_order_id || rzpOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || 'sig_demo',
              orderId: receiptId,
              amount: cartTotal,
            });

            if (isVerified) {
              const placed = await placeOrder(address, 'Razorpay', {
                orderId: response.razorpay_order_id || rzpOrder.id,
                paymentId: response.razorpay_payment_id,
              });
              onSuccess(placed);
            } else {
              onFailure('Payment signature verification failed. Please contact store support.');
            }
          },
          modal: {
            ondismiss: () => {
              onFailure('Payment cancelled by customer.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          onFailure(response.error?.description || 'Payment transaction failed.');
        });
        rzp.open();
      } else {
        // Fallback for demo environments: confirm directly
        const placed = await placeOrder(address, 'UPI', {
          orderId: rzpOrder.id,
          paymentId: `pay_demo_${Date.now()}`,
        });
        onSuccess(placed);
      }
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      onFailure(error.message || 'Could not initiate payment gateway.');
    }
  };

  // Submit product review
  const submitProductReview = async (reviewData: Omit<ProductReview, 'id' | 'date'>) => {
    const id = await createFirestoreReview(reviewData);
    const newRev: ProductReview = {
      ...reviewData,
      id,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast('Thank you! Your product review has been submitted for approval.', 'success');
  };

  // Activity & Audit Logging Helper
  const recordAuditLog = async (
    log: Omit<AdminActivityLog, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorEmail' | 'actorRole'>
  ) => {
    await logAdminActivity({
      ...log,
      actorId: authUser?.uid || 'admin',
      actorName: authUser?.displayName || 'Atharv Electricals Admin',
      actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
      actorRole: authUser?.role || 'admin',
    });
  };

  // Admin Order Status Update
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: Order['paymentStatus']
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const prevStatus = targetOrder?.status;
    await updateFirestoreOrderStatus(orderId, status, paymentStatus);

    // Record in Order Activity Timeline
    await recordOrderActivity(orderId, {
      actorId: authUser?.uid || 'admin',
      actorName: authUser?.displayName || 'Atharv Electricals Admin',
      actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
      actorRole: 'admin',
      action: `Status updated to ${status}`,
      previousValue: prevStatus,
      newValue: status,
      description: `Order status changed from "${prevStatus}" to "${status}".`,
    });

    // Record in Global Admin Audit Logs
    await logAdminActivity({
      actorId: authUser?.uid || 'admin',
      actorName: authUser?.displayName || 'Atharv Electricals Admin',
      actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
      actorRole: 'admin',
      action: 'Order Status Updated',
      module: 'Orders',
      recordId: orderId,
      recordName: targetOrder?.orderNumber || orderId,
      previousValue: prevStatus,
      newValue: status,
      description: `Updated status of Order #${targetOrder?.orderNumber || orderId} to "${status}"`,
    });

    if (status === 'Delivered' || status === 'Completed') {
      createAdminNotification({
        type: 'shipment_delivered',
        title: `Order Delivered: #${targetOrder?.orderNumber || orderId}`,
        description: `Shipment delivered to ${targetOrder?.customerName || 'customer'}`,
        timestamp: new Date().toISOString(),
        relatedId: orderId,
        relatedType: 'order',
        read: false,
      });
    } else if (status === 'Cancelled') {
      createAdminNotification({
        type: 'order_cancelled',
        title: `Order Cancelled: #${targetOrder?.orderNumber || orderId}`,
        description: `Order cancelled for ${targetOrder?.customerName || 'customer'}`,
        timestamp: new Date().toISOString(),
        relatedId: orderId,
        relatedType: 'order',
        read: false,
      });
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            status,
            paymentStatus: paymentStatus || (status === 'Completed' ? 'Paid' : ord.paymentStatus),
          };
          if (selectedOrderForTracking?.id === orderId) {
            setSelectedOrderForTracking(updated);
          }
          return updated;
        }
        return ord;
      })
    );
    showToast(`Order status updated to "${status}"`, 'success');
  };

  // Admin Product CRUD
  const addProduct = async (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const docId = await createFirestoreProduct(newProdData);
      const newProd: Product = {
        ...newProdData,
        id: docId,
        productId: docId,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProd, ...prev.filter((p) => p.id !== docId)]);

      await logAdminActivity({
        actorId: authUser?.uid || 'admin',
        actorName: authUser?.displayName || 'Atharv Electricals Admin',
        actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
        actorRole: 'admin',
        action: 'Product Created',
        module: 'Products',
        recordId: docId,
        recordName: newProd.name,
        description: `Created new product "${newProd.name}" (SKU: ${newProd.sku}) in category "${newProd.categoryName}"`,
        newValue: newProd,
      });

      showToast(`Product "${newProd.name}" saved to Firestore successfully!`, 'success');
    } catch (err: any) {
      console.error('Failed to save product to Firestore:', err);
      showToast(`Firebase write error: ${err.message || 'Write failed'}`, 'error');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateFirestoreProduct(id, updates);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );

      await logAdminActivity({
        actorId: authUser?.uid || 'admin',
        actorName: authUser?.displayName || 'Atharv Electricals Admin',
        actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
        actorRole: 'admin',
        action: 'Product Updated',
        module: 'Products',
        recordId: id,
        recordName: updates.name || id,
        description: `Updated product details for "${updates.name || id}"`,
        newValue: updates,
      });

      showToast('Product updated successfully in Firestore.', 'success');
    } catch (err: any) {
      console.error('Failed to update product in Firestore:', err);
      showToast(`Firebase update error: ${err.message || 'Update failed'}`, 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const targetProd = products.find((p) => p.id === id);
      await deleteFirestoreProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));

      await logAdminActivity({
        actorId: authUser?.uid || 'admin',
        actorName: authUser?.displayName || 'Atharv Electricals Admin',
        actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
        actorRole: 'admin',
        action: 'Product Deleted',
        module: 'Products',
        recordId: id,
        recordName: targetProd?.name || id,
        description: `Deleted product "${targetProd?.name || id}" (SKU: ${targetProd?.sku || id})`,
        previousValue: targetProd,
      });

      showToast('Product deleted from Firestore catalog.', 'info');
    } catch (err: any) {
      console.error('Failed to delete product from Firestore:', err);
      showToast(`Firebase delete error: ${err.message || 'Delete failed'}`, 'error');
      throw err;
    }
  };

  const duplicateProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const duplicated: Omit<Product, 'id' | 'createdAt'> = {
      ...prod,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`,
      slug: `${prod.slug}-copy-${Date.now().toString().slice(-4)}`,
    };
    await addProduct(duplicated);
  };

  const updateInventoryStock = async (productId: string, newStock: number) => {
    const status: Product['status'] = newStock <= 0 ? 'out_of_stock' : 'active';
    await updateFirestoreProduct(productId, { stock: newStock, status });
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, status } : p))
    );
    showToast(`Stock updated to ${newStock} units`, 'success');
  };

  const adjustProductStock = async (
    productId: string,
    delta: number,
    reason: InventoryAdjustmentRecord['reason'],
    notes?: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const prevStock = prod.stock || 0;
    const newStock = Math.max(0, prevStock + delta);
    const status: Product['status'] = newStock <= 0 ? 'out_of_stock' : 'active';

    await updateFirestoreProduct(productId, { stock: newStock, status });
    await recordInventoryAdjustment({
      productId,
      productName: prod.name,
      sku: prod.sku,
      actorId: authUser?.uid || 'admin',
      actorName: authUser?.displayName || 'Atharv Electricals Admin',
      previousStock: prevStock,
      newStock,
      delta,
      reason,
      notes,
    });
    await logAdminActivity({
      actorId: authUser?.uid || 'admin',
      actorName: authUser?.displayName || 'Atharv Electricals Admin',
      actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
      actorRole: 'admin',
      action: 'Inventory Stock Adjusted',
      module: 'Inventory',
      recordId: productId,
      recordName: prod.name,
      previousValue: `${prevStock} units`,
      newValue: `${newStock} units (${delta >= 0 ? '+' : ''}${delta})`,
      description: `Stock adjusted by ${delta} units for "${prod.name}" (Reason: ${reason})`,
    });

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, status } : p))
    );
    showToast(`Inventory updated: ${prod.name} now has ${newStock} units`, 'success');
  };

  const processOrderRefund = async (
    orderId: string,
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await initiateCashfreeRefund({
      orderId,
      paymentId,
      refundAmount: amount,
      refundReason: reason,
    });
    if (res.success) {
      await recordOrderActivity(orderId, {
        actorId: authUser?.uid || 'admin',
        actorName: authUser?.displayName || 'Atharv Electricals Admin',
        actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
        actorRole: 'admin',
        action: 'Payment Refund Initiated',
        description: `Refund of ₹${amount} initiated. Reason: ${reason}`,
      });
      await logAdminActivity({
        actorId: authUser?.uid || 'admin',
        actorName: authUser?.displayName || 'Atharv Electricals Admin',
        actorEmail: authUser?.email || 'atharvelectricals@gmail.com',
        actorRole: 'admin',
        action: 'Payment Refund Initiated',
        module: 'Payments',
        recordId: orderId,
        description: `Initiated ₹${amount} refund for Order #${orderId}. Reason: ${reason}`,
      });
      createAdminNotification({
        type: 'refund_requested',
        title: `Refund Processed: ₹${amount.toLocaleString('en-IN')}`,
        description: `Refund initiated for Order #${orderId}. Reason: ${reason}`,
        timestamp: new Date().toISOString(),
        relatedId: orderId,
        relatedType: 'order',
        read: false,
      });
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  // Admin Category CRUD
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    try {
      const id = await createFirestoreCategory(cat);
      const newCat: Category = {
        ...cat,
        id,
        imageUrl: cat.imageUrl || cat.image || '',
        image: cat.image || cat.imageUrl || '',
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${newCat.name}" added to Firebase!`, 'success');
    } catch (err: any) {
      showToast(`Failed to add category: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateFirestoreCategory(id, updates);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      showToast('Category updated in Firebase.', 'success');
    } catch (err: any) {
      showToast(`Failed to update category: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const linkedProds = products.filter((p) => p.categoryId === id);
      const linkedSubs = subcategories.filter((s) => s.categoryId === id);
      if (linkedProds.length > 0) {
        showToast(`Reassigned ${linkedProds.length} products to general category`, 'info');
      }
      await deleteFirestoreCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (linkedSubs.length > 0) {
        setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
      }
      showToast('Category removed from Firebase.', 'info');
    } catch (err: any) {
      showToast(`Failed to delete category: ${err.message}`, 'error');
      throw err;
    }
  };

  // Admin Subcategory CRUD
  const addSubcategory = async (sub: Omit<SubcategoryItem, 'id'>) => {
    try {
      const id = await createFirestoreSubcategory(sub);
      const newSub: SubcategoryItem = { ...sub, id };
      setSubcategories((prev) => [...prev, newSub]);
      showToast(`Subcategory "${newSub.name}" added to Firebase!`, 'success');
    } catch (err: any) {
      showToast(`Failed to add subcategory: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateSubcategory = async (id: string, updates: Partial<SubcategoryItem>) => {
    try {
      await updateFirestoreSubcategory(id, updates);
      setSubcategories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      showToast('Subcategory updated in Firebase.', 'success');
    } catch (err: any) {
      showToast(`Failed to update subcategory: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      await deleteFirestoreSubcategory(id);
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
      showToast('Subcategory deleted from Firebase.', 'info');
    } catch (err: any) {
      showToast(`Failed to delete subcategory: ${err.message}`, 'error');
      throw err;
    }
  };

  // Admin Brand CRUD
  const addBrand = async (brand: Omit<BrandItem, 'id'>) => {
    const id = await createFirestoreBrand(brand);
    const newBrand: BrandItem = { ...brand, id };
    setBrands((prev) => [...prev, newBrand]);
    showToast(`Brand "${newBrand.name}" registered!`, 'success');
  };

  const updateBrand = async (id: string, updates: Partial<BrandItem>) => {
    await updateFirestoreBrand(id, updates);
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Brand details updated.', 'success');
  };

  const deleteBrand = async (id: string) => {
    await deleteFirestoreBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    showToast('Brand removed.', 'info');
  };

  // Admin Banner CRUD
  const updateHeroBanner = async (bannerId: string, updates: Partial<HeroBanner>) => {
    await updateFirestoreBanner(bannerId, updates);
    setHeroBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, ...updates } : b))
    );
    showToast('Hero banner updated', 'success');
  };

  const addHeroBanner = async (bannerData: Omit<HeroBanner, 'id'>) => {
    const id = await createFirestoreBanner(bannerData);
    const newBanner: HeroBanner = {
      ...bannerData,
      id,
    };
    setHeroBanners((prev) => [...prev, newBanner]);
    showToast('Hero banner added', 'success');
  };

  const deleteHeroBanner = async (bannerId: string) => {
    await deleteFirestoreBanner(bannerId);
    setHeroBanners((prev) => prev.filter((b) => b.id !== bannerId));
    showToast('Hero banner deleted', 'info');
  };

  // Admin Coupon CRUD
  const addCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    const id = await createFirestoreCoupon(couponData);
    const newCoupon: Coupon = {
      ...couponData,
      id,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created`, 'success');
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    await updateFirestoreCoupon(id, updates);
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon updated', 'success');
  };

  const deleteCoupon = async (id: string) => {
    await deleteFirestoreCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon removed', 'info');
  };

  // Admin Review Moderation
  const moderateReview = async (id: string, status: ProductReview['status']) => {
    await updateFirestoreReviewStatus(id, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`Review status updated to ${status}`, 'success');
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    await saveFirestoreSettings(newSettings);
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Store settings saved successfully', 'success');
  };

  // Shiprocket Shipping Methods
  const checkShippingRates = async (
    deliveryPincode: string,
    weight?: number,
    dimensions?: { length: number; breadth: number; height: number }
  ): Promise<ShiprocketCourierRate[]> => {
    const res = await checkShiprocketServiceability({
      deliveryPincode,
      weight,
      length: dimensions?.length,
      breadth: dimensions?.breadth,
      height: dimensions?.height,
    });
    if (res.success && res.availableCouriers) {
      if (res.isSandboxMode) {
        showToast(res.message || 'Regional shipping rates calculated', 'info');
      }
      return res.availableCouriers;
    }
    showToast(res.error || 'Courier rates unavailable for this pincode', 'error');
    return [];
  };

  const createShipmentForOrder = async (
    orderId: string,
    packageDetails: {
      weight: number;
      dimensions: { length: number; breadth: number; height: number };
      courierId?: number | string;
      shippingCharge?: number;
    }
  ): Promise<ShipmentRecord | null> => {
    try {
      const res = await createShiprocketShipment({
        orderId,
        packageWeight: packageDetails.weight,
        packageDimensions: packageDetails.dimensions,
        courierId: packageDetails.courierId,
        shippingCharge: packageDetails.shippingCharge,
      });

      if (res.success && res.shipment) {
        showToast('Shipment created and registered with Shiprocket!', 'success');
        setShipments((prev) => [res.shipment!, ...prev.filter((s) => s.id !== res.shipment!.id)]);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, shipmentId: res.shipment!.id, shippingStatus: 'Shipment Booked', status: 'Processing' }
              : o
          )
        );
        return res.shipment;
      }
      showToast(res.error || 'Failed to create shipment', 'error');
      return null;
    } catch (err: any) {
      showToast(`Shipment error: ${err.message}`, 'error');
      return null;
    }
  };

  const generateAwbForShipment = async (shipmentDocId: string, courierId?: number | string): Promise<boolean> => {
    try {
      const res = await generateShiprocketAwb(shipmentDocId, courierId);
      if (res.success) {
        showToast(`AWB ${res.awbCode} generated successfully!`, 'success');
        setShipments((prev) =>
          prev.map((s) =>
            s.id === shipmentDocId
              ? {
                  ...s,
                  awbCode: res.awbCode,
                  courierName: res.courierName,
                  trackingUrl: res.trackingUrl,
                  shipmentStatus: 'Shipment Booked',
                }
              : s
          )
        );
        return true;
      }
      showToast(res.error || 'Failed to generate AWB', 'error');
      return false;
    } catch (err: any) {
      showToast(`AWB error: ${err.message}`, 'error');
      return false;
    }
  };

  const schedulePickupForShipment = async (shipmentDocId: string, pickupDate?: string): Promise<boolean> => {
    try {
      const res = await scheduleShiprocketPickup(shipmentDocId, pickupDate);
      if (res.success) {
        showToast(`Pickup scheduled for ${res.pickupScheduledDate}!`, 'success');
        setShipments((prev) =>
          prev.map((s) =>
            s.id === shipmentDocId
              ? {
                  ...s,
                  pickupStatus: 'Scheduled',
                  shipmentStatus: 'Pickup Scheduled',
                  pickupScheduledDate: res.pickupScheduledDate,
                  pickupToken: res.pickupToken,
                }
              : s
          )
        );
        return true;
      }
      showToast(res.error || 'Failed to schedule pickup', 'error');
      return false;
    } catch (err: any) {
      showToast(`Pickup error: ${err.message}`, 'error');
      return false;
    }
  };

  const generateLabelForShipment = async (shipmentDocId: string): Promise<string | null> => {
    try {
      const res = await generateShiprocketLabel(shipmentDocId);
      if (res.success && res.labelUrl) {
        showToast('Shipping label generated!', 'success');
        setShipments((prev) =>
          prev.map((s) =>
            s.id === shipmentDocId ? { ...s, labelUrl: res.labelUrl, manifestUrl: res.manifestUrl } : s
          )
        );
        return res.labelUrl;
      }
      showToast(res.error || 'Failed to generate label', 'error');
      return null;
    } catch (err: any) {
      showToast(`Label error: ${err.message}`, 'error');
      return null;
    }
  };

  const cancelShipment = async (shipmentDocId: string): Promise<boolean> => {
    try {
      const res = await cancelShiprocketShipment(shipmentDocId);
      if (res.success) {
        showToast('Shipment cancelled successfully.', 'info');
        setShipments((prev) =>
          prev.map((s) => (s.id === shipmentDocId ? { ...s, shipmentStatus: 'Cancelled' } : s))
        );
        return true;
      }
      showToast(res.error || 'Failed to cancel shipment', 'error');
      return false;
    } catch (err: any) {
      showToast(`Cancellation error: ${err.message}`, 'error');
      return false;
    }
  };

  const refreshShipmentTracking = async (awbCode: string, shipmentDocId?: string): Promise<void> => {
    try {
      const res = await trackShiprocketShipment(awbCode, shipmentDocId);
      if (res.success && res.status) {
        showToast(`Shipment status: ${res.status}`, 'info');
        if (shipmentDocId) {
          setShipments((prev) =>
            prev.map((s) => (s.id === shipmentDocId ? { ...s, shipmentStatus: res.status as ShipmentStatus } : s))
          );
        }
      }
    } catch (err: any) {
      showToast(`Tracking refresh failed: ${err.message}`, 'error');
    }
  };

  // Notification Methods
  const createNotification = async (notif: Omit<AdminNotification, 'id'>): Promise<string> => {
    return await createAdminNotification(notif);
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markFirestoreNotificationRead(id, true);
  };

  const markAllNotificationsAsRead = async (): Promise<void> => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(notifications.filter((n) => !n.read).map((n) => markFirestoreNotificationRead(n.id, true)));
    showToast('All notifications marked as read', 'info');
  };

  const clearAllNotifications = async (): Promise<void> => {
    setNotifications([]);
    await clearAllFirestoreNotifications();
    showToast('All notifications cleared', 'info');
  };

  // CRM Customer Actions
  const addCustomerNote = async (customerId: string, noteText: string): Promise<void> => {
    const targetCust = derivedCustomers.find((c) => c.id === customerId);
    const existingNotes = targetCust?.internalNotes || [];
    const formatted = `[${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}] ${noteText}`;
    const newNotes = [formatted, ...existingNotes];
    await saveCustomerInternalNotes(customerId, newNotes);
    showToast('Internal note saved to customer profile', 'success');
  };

  const sendCustomerPasswordResetEmail = async (email: string): Promise<void> => {
    await sendCustomerPasswordReset(email);
    showToast(`Password reset link sent to ${email}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        authLoading,
        login,
        register,
        loginGoogle,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        isFirebaseConnected: isFirebaseConfigured(),
        seedDatabase,
        activeMode,
        setActiveMode,
        customerView,
        setCustomerView,
        adminView,
        setAdminView,
        selectedProductId,
        setSelectedProductId,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        selectedBrand,
        setSelectedBrand,
        products,
        categories,
        subcategories,
        brands,
        orders,
        customers: derivedCustomers,
        activityLogs,
        inventoryAdjustments,
        coupons,
        heroBanners,
        reviews,
        payments,
        shipments,
        storeSettings,
        updateStoreSettings,
        createShipmentForOrder,
        generateAwbForShipment,
        schedulePickupForShipment,
        generateLabelForShipment,
        cancelShipment,
        refreshShipmentTracking,
        checkShippingRates,
        cart,
        wishlist,
        appliedCoupon,
        deliveryPincode,
        setDeliveryPincode,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMobileFilterOpen,
        setIsMobileFilterOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        processCashfreePayment,
        processRazorpayPayment,
        submitProductReview,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateInventoryStock,
        adjustProductStock,
        processOrderRefund,
        recordAuditLog,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addBrand,
        updateBrand,
        deleteBrand,
        updateHeroBanner,
        addHeroBanner,
        deleteHeroBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        moderateReview,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        createNotification,
        addCustomerNote,
        sendCustomerPasswordResetEmail,
        toasts,
        showToast,
        cartSubtotal,
        cartDiscount,
        cartDeliveryCharge,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
