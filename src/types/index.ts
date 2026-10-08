export type Brand = 'ORIENT' | 'Goldmedal' | 'Other' | string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description: string;
  image: string;
  imageUrl?: string;
  subcategories: string[];
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type?: 'color' | 'sweep' | 'wattage' | 'length' | 'gauge' | 'finish' | string;
  value?: string;
  priceDelta?: number;
  sku?: string;
  price?: number;
  stock?: number;
  image?: string;
  attributes?: Record<string, string>;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: Brand;
  brandId?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  gst?: number;
  emiPerMonth?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'Active' | 'Draft' | 'Out of Stock';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  mainImage?: string;
  images: string[];
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  warranty: string;
  whatsInTheBox?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariants: Record<string, string>;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Completed'
  | 'Cancelled'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
  notes?: string;
}

export interface DeliveryAddress {
  fullName: string;
  mobile: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  couponCode?: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: OrderStatus;
  timeline?: OrderTimelineStep[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  courierPartner?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

export interface PaymentRecord {
  id: string;
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'Created' | 'Paid' | 'Failed' | 'Refunded';
  method: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
  addresses: DeliveryAddress[];
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType?: 'percentage' | 'flat';
  discountPercentage: number;
  discountValue?: number;
  minOrderAmount: number;
  maxDiscount: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  description: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink?: string;
  categoryFilter?: string;
  brandFilter?: string;
  image: string;
  active: boolean;
  order: number;
  brandTag: string;
  hideTextOverlay?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Hidden';
  verifiedPurchase: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline?: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  logoUrl?: string;
  workingHours: string;
  googleMapsUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'customer' | 'admin';
  isAdmin: boolean;
}
