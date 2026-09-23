export type ProductCategory = 'Suits' | 'Dress Shirts' | 'Dress Pants' | 'Ties' | 'New Arrivals';

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  sku: string;
  collection: string;
  description: string;
  details: string[];
  fabric: string;
  fit: string;
  care: string[];
  images: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  alterationEligible?: boolean;
  totalStock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Order Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Pending' | 'Authorized' | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
  sku: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  location: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string; // e.g. PA-10245
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  createdAt?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  orderStatus: OrderStatus;
  status?: string; // convenient alias
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    postalCode?: string;
    country: string;
  };
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  timeline: OrderTimelineEvent[];
  alterationRequested?: boolean;
  alterationNotes?: string;
}

export type AlterationStatus = 
  | 'Alteration Received'
  | 'Measurement/Review'
  | 'Alteration In Progress'
  | 'Quality Check'
  | 'Ready for Pickup'
  | 'Completed'
  | 'received'
  | 'chalking_and_pinning'
  | 'cutting_and_stitching'
  | 'pressing_and_inspection'
  | 'ready_for_pickup'
  | 'completed';

export interface AlterationItem {
  name: string;
  type: string; // e.g. "Trouser Hemming", "Jacket Sleeve Adjustment", "Waist Tapering"
  specifications: string;
}

export interface AlterationHistoryEvent {
  status: AlterationStatus;
  timestamp: string;
  note: string;
}

export interface AlterationRecord {
  id: string; // e.g. ALT-2041
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AlterationItem[];
  alterationDetails: string;
  productName?: string;
  status: AlterationStatus;
  currentStep: number; // 0 to 5
  tailorAssigned: string;
  createdAt: string;
  expectedCompletion: string;
  estimatedCompletion?: string;
  completedAt?: string;
  tailorNotes: string;
  history: AlterationHistoryEvent[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tier?: string;
  measurements?: {
    chest: string;
    waist: string;
    sleeve: string;
    inseam: string;
    neck?: string;
  };
  addresses: {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }[];
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
}

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'all';

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'order_update' | 'shipment' | 'delivery' | 'alteration_update' | 'ready_for_pickup' | 'service';
  timestamp: string;
  read: boolean;
  link?: string;
  orderId?: string;
  alterationId?: string;
}

export interface FilterOptions {
  category: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  availability: 'all' | 'in_stock' | 'low_stock';
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest';
  searchQuery: string;
}
