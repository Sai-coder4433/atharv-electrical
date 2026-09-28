import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  Customer,
  Coupon,
  HeroBanner,
  ProductReview,
  CartItem,
  DeliveryAddress,
  OrderStatus,
  Brand,
} from '../types';
import {
  PRODUCTS_DATA,
  CATEGORIES_DATA,
  DEMO_ORDERS,
  DEMO_CUSTOMERS,
  DEMO_COUPONS,
  HERO_BANNERS_DATA,
  DEMO_REVIEWS,
} from '../data/demoData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
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

  // Filters
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
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  heroBanners: HeroBanner[];
  reviews: ProductReview[];

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

  // Methods
  addToCart: (product: Product, variants?: Record<string, string>, qty?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery'
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;

  // Admin Methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateInventoryStock: (productId: string, newStock: number) => void;
  updateHeroBanner: (bannerId: string, updates: Partial<HeroBanner>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;

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
  const [deliveryPincode, setDeliveryPincode] = useState('411037');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistent Collections
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ae_products');
      return saved ? JSON.parse(saved) : PRODUCTS_DATA;
    } catch {
      return PRODUCTS_DATA;
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

  const [customers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [categories] = useState<Category[]>(CATEGORIES_DATA);
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

  const [reviews] = useState<ProductReview[]>(DEMO_REVIEWS);

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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ae_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ae_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ae_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ae_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('ae_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('ae_banners', JSON.stringify(heroBanners));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [heroBanners]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
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

    // Price delta if any
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
    showToast(`Coupon "${coupon.code}" applied! You saved up to ₹${coupon.maxDiscount}`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const placeOrder = (
    address: DeliveryAddress,
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery'
  ): Order => {
    const timestamp = new Date();
    const orderNum = `AE${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, '0')}${timestamp.getDate().toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: address.fullName,
      customerPhone: address.mobile,
      customerEmail: 'customer@atharvayelectricals.com',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryCharge: cartDeliveryCharge,
      totalAmount: cartTotal,
      couponCode: appliedCoupon?.code,
      deliveryAddress: address,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      status: 'Confirmed',
      timeline: [
        {
          status: 'Pending',
          label: 'Order Placed',
          timestamp: 'Just now',
          completed: true,
          current: false,
        },
        {
          status: 'Confirmed',
          label: 'Order Confirmed by ATHARV ELECTRICAL',
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          status: 'Packed',
          label: 'Item Verification & Dispatch Prep',
          completed: false,
          current: false,
        },
        {
          status: 'Shipped',
          label: 'In Transit via Logistics Express',
          completed: false,
          current: false,
        },
        {
          status: 'Out for Delivery',
          label: 'Out for Delivery',
          completed: false,
          current: false,
        },
        {
          status: 'Delivered',
          label: 'Delivered to Customer Doorstep',
          completed: false,
          current: false,
        },
      ],
      courierPartner: 'BlueDart / ATHARV ELECTRICAL Express Delivery',
      trackingNumber: `EXP-${orderNum}`,
      createdAt: new Date().toISOString(),
      estimatedDelivery: '2–4 business days',
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((ci) => ci.product.id === p.id);
        if (cartMatch) {
          const updatedStock = Math.max(0, p.stock - cartMatch.quantity);
          return {
            ...p,
            stock: updatedStock,
            status: updatedStock === 0 ? 'out_of_stock' : p.status,
          };
        }
        return p;
      })
    );

    // Add to orders
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart and coupon
    setCart([]);
    setAppliedCoupon(null);
    setSelectedOrderForTracking(newOrder);

    showToast(`Order ${orderNum} confirmed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const nowStr = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          const statuses: OrderStatus[] = [
            'Pending',
            'Confirmed',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
          ];
          const targetIndex = statuses.indexOf(status);

          const updatedTimeline = ord.timeline.map((step) => {
            const stepIndex = statuses.indexOf(step.status);
            if (stepIndex === -1) return step;
            if (stepIndex < targetIndex) {
              return { ...step, completed: true, current: false };
            } else if (stepIndex === targetIndex) {
              return {
                ...step,
                completed: true,
                current: true,
                timestamp: step.timestamp || nowStr,
                notes: notes || step.notes,
              };
            } else {
              return { ...step, completed: false, current: false };
            }
          });

          const updatedOrder: Order = {
            ...ord,
            status,
            paymentStatus: status === 'Delivered' ? 'Paid' : ord.paymentStatus,
            timeline: updatedTimeline,
          };

          if (selectedOrderForTracking?.id === orderId) {
            setSelectedOrderForTracking(updatedOrder);
          }

          return updatedOrder;
        }
        return ord;
      })
    );
    showToast(`Order status updated to "${status}"`, 'success');
  };

  // Admin Methods
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod-cust-${Date.now()}`;
    const newProd: Product = {
      ...newProdData,
      id,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added successfully!`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog', 'info');
  };

  const updateInventoryStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const stock = Math.max(0, newStock);
          return {
            ...p,
            stock,
            status: stock === 0 ? 'out_of_stock' : p.status === 'out_of_stock' ? 'active' : p.status,
          };
        }
        return p;
      })
    );
    showToast('Stock quantity updated', 'success');
  };

  const updateHeroBanner = (bannerId: string, updates: Partial<HeroBanner>) => {
    setHeroBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, ...updates } : b))
    );
    showToast('Hero banner updated', 'success');
  };

  const addCoupon = (newCouponData: Omit<Coupon, 'id'>) => {
    const id = `c-${Date.now()}`;
    const newCoupon: Coupon = { ...newCouponData, id };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon ${newCoupon.code} created!`, 'success');
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon settings updated', 'success');
  };

  return (
    <AppContext.Provider
      value={{
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
        orders,
        customers,
        coupons,
        heroBanners,
        reviews,
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
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateInventoryStock,
        updateHeroBanner,
        addCoupon,
        updateCoupon,
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
