export type ProductCategory =
  | 'Suits'
  | 'Blazers & Jackets'
  | 'Shirts'
  | 'Pants'
  | 'Outerwear'
  | 'Sweaters & Knitwear'
  | 'Footwear'
  | 'Accessories'
  | 'Shorts'
  // Legacy product values kept for backwards compatibility with existing catalog data.
  | 'Dress shirts' | 'Dress Shirts' | 'Ties' | 'Shoe' | 'Shoes' | 'Boots'
  | 'Loofers' | 'Loafers' | 'Dress Pants' | 'Jeans' | 'Leather jackets'
  | 'Leather Jackets' | 'Sweaters' | 'Coats' | 'Polo shirts' | 'Polo Shirts'
  | 'New Arrivals' | 'All';

export interface CategoryItem {
  id: string;
  name: string;
  queryValue: ProductCategory;
  description: string;
  subcategories: string[];
}

export const PRODUCT_CATEGORY_CATALOG: CategoryItem[] = [
  { id: 'suits', name: 'Suits', queryValue: 'Suits', description: 'Suits and formal tailoring', subcategories: ['Suits', 'Dress Suits'] },
  { id: 'blazers-jackets', name: 'Blazers & Jackets', queryValue: 'Blazers & Jackets', description: 'Blazers and leather jackets', subcategories: ['Blazers', 'Leather Jackets'] },
  { id: 'shirts', name: 'Shirts', queryValue: 'Shirts', description: 'Formal and casual shirts', subcategories: ['Dress Shirts', 'Polo Shirts'] },
  { id: 'pants', name: 'Pants', queryValue: 'Pants', description: 'Tailored trousers and denim', subcategories: ['Dress Pants / Pants', 'Jeans'] },
  { id: 'outerwear', name: 'Outerwear', queryValue: 'Outerwear', description: 'Coats and outer layers', subcategories: ['Coats'] },
  { id: 'sweaters-knitwear', name: 'Sweaters & Knitwear', queryValue: 'Sweaters & Knitwear', description: 'Sweaters and knitwear', subcategories: ['Sweaters'] },
  { id: 'footwear', name: 'Footwear', queryValue: 'Footwear', description: 'Shoes and boots', subcategories: ['Shoes', 'Boots'] },
  { id: 'accessories', name: 'Accessories', queryValue: 'Accessories', description: 'Finishing accessories', subcategories: ['Ties'] },
  { id: 'shorts', name: 'Shorts', queryValue: 'Shorts', description: 'Tailored and casual shorts', subcategories: ['Shorts'] }
];

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Collections', queryValue: 'All', description: 'Explore the complete Park Avenue collection', subcategories: [] },
  ...PRODUCT_CATEGORY_CATALOG,
  { id: 'new-arrivals', name: 'New Arrivals', queryValue: 'New Arrivals', description: 'The latest arrivals', subcategories: [] }
];

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
  /** Images associated with each color when products are grouped by name. */
  colorImages?: Record<string, string[]>;
  colors?: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  alterationEligible?: boolean;
  totalStock: number;
  shippingCharge?: number;
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

export type PaymentStatus = 'Paid' | 'Pending' | 'Authorized' | 'Failed' | 'Refunded' | 'Invoice';

export interface OrderItem {
  productId: string;
  productName: string;
  category?: ProductCategory;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  image?: string;
  sku?: string;
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
  shippingMethod?: string;
  tax: number;
  total: number;
  orderStatus: OrderStatus;
  status?: string; // convenient alias
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentTransactionId?: string;
  shippingAddress?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    postalCode?: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shipment?: { carrier?: string; trackingId?: string; trackingUrl?: string; status?: string; estimatedDelivery?: string; notes?: string };
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
  | 'Cancelled'
  | 'received'
  | 'chalking_and_pinning'
  | 'cutting_and_stitching'
  | 'pressing_and_inspection'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

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
  role?: string;
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
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    postalCode?: string;
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
