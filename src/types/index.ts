export type Brand = 'ORIENT' | 'Goldmedal' | 'Other';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  subcategories: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'sweep' | 'wattage' | 'length' | 'gauge' | 'finish';
  value: string;
  priceDelta?: number;
  sku?: string;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: Brand;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  emiPerMonth?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft' | 'out_of_stock';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  images: string[];
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  warranty: string;
  whatsInTheBox: string;
  tags: string[];
  createdAt: string;
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
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

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
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  status: OrderStatus;
  timeline: OrderTimelineStep[];
  courierPartner?: string;
  trackingNumber?: string;
  createdAt: string;
  estimatedDelivery: string;
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
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
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
  categoryFilter?: string;
  brandFilter?: string;
  image: string;
  active: boolean;
  order: number;
  brandTag: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending';
  verifiedPurchase: boolean;
}
