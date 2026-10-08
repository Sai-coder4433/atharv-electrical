import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '../types';
import {
  PRODUCTS_DATA,
  CATEGORIES_DATA,
  SUBCATEGORIES_DATA,
  BRANDS_DATA,
  DEMO_ORDERS,
  DEMO_CUSTOMERS,
  DEMO_COUPONS,
  HERO_BANNERS_DATA,
  DEMO_REVIEWS,
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
  fetchFirestoreBanners,
  fetchFirestoreReviews,
  createFirestoreReview,
  updateFirestoreReviewStatus,
  requestRazorpayOrder,
  verifyRazorpaySignature,
  seedInitialFirestoreData,
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
  login: (email: string, pass: string) => Promise<boolean>;
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
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

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
  addToCart: (product: Product, variants?: Record<string, string>, qty?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay',
    razorpayDetails?: { orderId?: string; paymentId?: string }
  ) => Promise<Order>;
  submitProductReview: (review: Omit<ProductReview, 'id' | 'date'>) => Promise<void>;

  // Razorpay Checkout
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
  updateHeroBanner: (bannerId: string, updates: Partial<HeroBanner>) => void;
  addHeroBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  deleteHeroBanner: (bannerId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  moderateReview: (id: string, status: ProductReview['status']) => Promise<void>;

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

  // Mode & Views
  const [activeMode, setActiveMode] = useState<'customer' | 'admin'>('customer');
  const [customerView, setCustomerView] = useState<string>('home');
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

  // Persistent Collections (with Firestore Progressive Hydration)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ae_products');
      return saved ? JSON.parse(saved) : PRODUCTS_DATA;
    } catch {
      return PRODUCTS_DATA;
    }
  });

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

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ae_orders');
      return saved ? JSON.parse(saved) : DEMO_ORDERS;
    } catch {
      return DEMO_ORDERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);

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

  const [reviews, setReviews] = useState<ProductReview[]>(DEMO_REVIEWS);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

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
      return saved ? JSON.parse(saved) : ['prod-orient-aeroquiet', 'prod-goldmedal-ultra-panel'];
    } catch {
      return [];
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ae_products', JSON.stringify(products));
      localStorage.setItem('ae_categories', JSON.stringify(categories));
      localStorage.setItem('ae_subcategories', JSON.stringify(subcategories));
      localStorage.setItem('ae_brands', JSON.stringify(brands));
      localStorage.setItem('ae_orders', JSON.stringify(orders));
      localStorage.setItem('ae_cart', JSON.stringify(cart));
      localStorage.setItem('ae_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('ae_coupons', JSON.stringify(coupons));
      localStorage.setItem('ae_banners', JSON.stringify(heroBanners));
      localStorage.setItem('ae_settings', JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('Storage sync warn', e);
    }
  }, [products, categories, subcategories, brands, orders, cart, wishlist, coupons, heroBanners, storeSettings]);

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

  // Progressive Firestore Data Hydration
  useEffect(() => {
    if (db) {
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
        if (res && res.length > 0) setProducts(res);
      });
      fetchFirestoreOrders().then((res) => {
        if (res && res.length > 0) setOrders(res);
      });
      fetchFirestoreCoupons().then((res) => {
        if (res && res.length > 0) setCoupons(res);
      });
      fetchFirestoreBanners().then((res) => {
        if (res && res.length > 0) setHeroBanners(res);
      });
      fetchFirestoreReviews().then((res) => {
        if (res && res.length > 0) setReviews(res);
      });
      fetchFirestorePayments().then((res) => {
        if (res && res.length > 0) setPayments(res);
      });
    }
  }, []);

  // Auth Functions
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const user = await loginWithEmail(email, pass);
      setAuthUser(user);
      showToast(`Welcome back, ${user.displayName}!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
      return false;
    }
  };

  const register = async (email: string, pass: string, name?: string): Promise<boolean> => {
    try {
      const user = await registerWithEmail(email, pass, name);
      setAuthUser(user);
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

  // Cart Actions
  const addToCart = (product: Product, variants?: Record<string, string>, qty: number = 1) => {
    const selected = variants || {};
    const variantKey = Object.entries(selected)
      .map(([k, v]) => `${k}:${v}`)
      .sort()
      .join('|');
    const cartItemId = `${product.id}-${variantKey}`;

    let finalUnitPrice = product.sellingPrice;
    if (product.variants && variants) {
      for (const [k, v] of Object.entries(variants)) {
        const found = product.variants.find((vr) => vr.name === k && vr.value === v);
        if (found && found.priceDelta) {
          finalUnitPrice += found.priceDelta;
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
          quantity: qty,
          unitPrice: finalUnitPrice,
        },
      ];
    });

    showToast(`Added "${product.name}" to cart`, 'success');
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

  // Place Order (supports COD & Razorpay)
  const placeOrder = async (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay',
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

  // Admin Order Status Update
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: Order['paymentStatus']
  ) => {
    await updateFirestoreOrderStatus(orderId, status, paymentStatus);
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
    const docId = await createFirestoreProduct(newProdData);
    const newProd: Product = {
      ...newProdData,
      id: docId,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added to inventory!`, 'success');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await updateFirestoreProduct(id, updates);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = async (id: string) => {
    await deleteFirestoreProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog.', 'info');
  };

  const duplicateProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const duplicated: Omit<Product, 'id' | 'createdAt'> = {
      ...prod,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY`,
      slug: `${prod.slug}-copy`,
    };
    addProduct(duplicated);
  };

  const updateInventoryStock = async (productId: string, newStock: number) => {
    const status: Product['status'] = newStock <= 0 ? 'out_of_stock' : 'active';
    await updateFirestoreProduct(productId, { stock: newStock, status });
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, status } : p))
    );
    showToast(`Stock updated to ${newStock} units`, 'success');
  };

  // Admin Category CRUD
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const id = await createFirestoreCategory(cat);
    const newCat: Category = { ...cat, id };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" added!`, 'success');
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await updateFirestoreCategory(id, updates);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Category updated.', 'success');
  };

  const deleteCategory = async (id: string) => {
    await deleteFirestoreCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted.', 'info');
  };

  // Admin Subcategory CRUD
  const addSubcategory = async (sub: Omit<SubcategoryItem, 'id'>) => {
    const id = await createFirestoreSubcategory(sub);
    const newSub: SubcategoryItem = { ...sub, id };
    setSubcategories((prev) => [...prev, newSub]);
    showToast(`Subcategory "${newSub.name}" added!`, 'success');
  };

  const updateSubcategory = async (id: string, updates: Partial<SubcategoryItem>) => {
    await updateFirestoreSubcategory(id, updates);
    setSubcategories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Subcategory updated.', 'success');
  };

  const deleteSubcategory = async (id: string) => {
    await deleteFirestoreSubcategory(id);
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
    showToast('Subcategory deleted.', 'info');
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
  const updateHeroBanner = (bannerId: string, updates: Partial<HeroBanner>) => {
    setHeroBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, ...updates } : b))
    );
    showToast('Hero banner updated', 'success');
  };

  const addHeroBanner = (bannerData: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
    };
    setHeroBanners((prev) => [...prev, newBanner]);
    showToast('Hero banner added', 'success');
  };

  const deleteHeroBanner = (bannerId: string) => {
    setHeroBanners((prev) => prev.filter((b) => b.id !== bannerId));
    showToast('Hero banner deleted', 'info');
  };

  // Admin Coupon CRUD
  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coupon-${Date.now()}`,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created`, 'success');
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon updated', 'success');
  };

  const deleteCoupon = (id: string) => {
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

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Store settings saved successfully', 'success');
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
        customers,
        coupons,
        heroBanners,
        reviews,
        payments,
        storeSettings,
        updateStoreSettings,
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
        processRazorpayPayment,
        submitProductReview,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateInventoryStock,
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
