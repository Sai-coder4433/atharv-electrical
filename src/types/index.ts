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
  productId?: string;
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
  purchasePrice?: number;
  shippingCost?: number;
  otherCost?: number;
  discountPercentage: number;
  gst?: number;
  emiPerMonth?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  status?: 'active' | 'draft' | 'out_of_stock' | 'Active' | 'Draft' | 'Out of Stock';
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  mainImage?: string;
  images: string[];
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  warranty: string;
  whatsInTheBox?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: any;
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
  id?: string;
  fullName: string;
  mobile: string;
  email?: string;
  houseBuilding: string;
  apartment?: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType?: 'home' | 'office' | 'other';
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
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Razorpay' | 'Cashfree';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  status: OrderStatus;
  timeline?: OrderTimelineStep[];
  activities?: OrderActivityRecord[];
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  courierPartner?: string;
  trackingNumber?: string;
  shipmentId?: string;
  awbCode?: string;
  trackingUrl?: string;
  shippingStatus?: ShipmentStatus;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

export type ShipmentStatus =
  | 'Shipment Booked'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Undelivered'
  | 'RTO'
  | 'Cancelled';

export type PickupStatus = 'Pending' | 'Scheduled' | 'Picked Up' | 'Failed';

export interface ShipmentRecord {
  id: string; // Document ID
  internalOrderId: string;
  orderNumber: string;
  shiprocketOrderId?: number | string;
  shiprocketShipmentId?: number | string;
  awbCode?: string;
  courierName?: string;
  courierId?: number | string;
  pickupLocation: string;
  deliveryPincode: string;
  pickupPincode: string;
  packageWeight: number; // in kg
  packageDimensions: {
    length: number; // in cm
    breadth: number;
    height: number;
  };
  shippingCharge: number;
  labelUrl?: string;
  manifestUrl?: string;
  shipmentStatus: ShipmentStatus;
  pickupStatus: PickupStatus;
  pickupScheduledDate?: string;
  pickupToken?: string;
  trackingUrl?: string;
  history?: Array<{
    date: string;
    status: string;
    activity: string;
    location: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ShiprocketCourierRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
  rating: number;
  cod: number;
}

export interface ShiprocketPickupAddress {
  nickname: string;
  contactPerson: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShiprocketConfig {
  email?: string;
  password?: string;
  isEnabled?: boolean;
  isSandbox?: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId?: string;
  orderNumber?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'Created' | 'Paid' | 'Failed' | 'Refunded' | 'Pending';
  method: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id: string;
  activityId?: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  module:
    | 'Products'
    | 'Categories'
    | 'Subcategories'
    | 'Brands'
    | 'Orders'
    | 'Inventory'
    | 'Payments'
    | 'Coupons'
    | 'Banners'
    | 'Settings'
    | 'Auth'
    | 'Shipping';
  recordId?: string;
  recordName?: string;
  description: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface OrderActivityRecord {
  id: string;
  orderId: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole: 'admin' | 'customer' | 'system' | 'courier';
  action: string;
  previousValue?: string;
  newValue?: string;
  description: string;
  timestamp: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface InventoryAdjustmentRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  actorId: string;
  actorName: string;
  previousStock: number;
  newStock: number;
  delta: number;
  reason: 'Restock' | 'Correction' | 'Damage / Defect' | 'Customer Return' | 'Order Fulfilled' | 'Manual Adjustment';
  timestamp: string;
  notes?: string;
}

export interface CustomerActivityRecord {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
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
  customerType?: 'New' | 'Returning' | 'Regular' | 'High-Value' | 'Inactive';
  averageOrderValue?: number;
  highestOrderValue?: number;
  preferredCategories?: string[];
  preferredBrands?: string[];
  internalNotes?: string[];
  activities?: CustomerActivityRecord[];
  addresses: DeliveryAddress[];
  createdAt?: string;
}

export interface AdminNotification {
  id: string;
  type:
    | 'order_created'
    | 'payment_success'
    | 'payment_failed'
    | 'low_stock'
    | 'out_of_stock'
    | 'customer_registered'
    | 'order_cancelled'
    | 'refund_requested'
    | 'shipment_delivered';
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  relatedType?: 'order' | 'product' | 'customer';
  read: boolean;
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
  location: string; // Customer-facing showroom location: "Manik Chowk, Chakan, India"
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
  shiprocketPickup?: ShiprocketPickupAddress;
  shiprocketConfig?: ShiprocketConfig;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'customer' | 'admin';
  isAdmin: boolean;
}
