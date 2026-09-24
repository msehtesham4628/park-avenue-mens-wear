export type ProductCategory =
  | 'Suits'
  | 'Dress shirts'
  | 'Dress Shirts'
  | 'Ties'
  | 'Shoe'
  | 'Shoes'
  | 'Boots'
  | 'Loofers'
  | 'Loafers'
  | 'Pants'
  | 'Dress Pants'
  | 'Jeans'
  | 'Leather jackets'
  | 'Leather Jackets'
  | 'Sweaters'
  | 'Coats'
  | 'Polo shirts'
  | 'Polo Shirts'
  | 'Shorts'
  | 'New Arrivals'
  | 'All';

export interface CategoryItem {
  id: string;
  name: string;
  queryValue: ProductCategory;
  description: string;
  iconName?: string;
  tagline?: string;
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Collections', queryValue: 'All', description: 'Explore the complete Park Avenue Sartorial vault' },
  { id: 'suits', name: 'Suits', queryValue: 'Suits', description: 'Double-breasted and two-piece suits hand-cut from Super 150s-180s wool' },
  { id: 'dress-shirts', name: 'Dress Shirts', queryValue: 'Dress shirts', description: 'Tailored from Egyptian Giza 87 and Sea Island cotton' },
  { id: 'ties', name: 'Ties', queryValue: 'Ties', description: 'Handcrafted Grenadine and 7-fold silk neckwear from Como' },
  { id: 'shoe', name: 'Shoe', queryValue: 'Shoe', description: 'Goodyear-welted Oxford and Derby leather dress shoes' },
  { id: 'boots', name: 'Boots', queryValue: 'Boots', description: 'Balmoral dress boots and sculpted Chelsea boots' },
  { id: 'loofers', name: 'Loofers', queryValue: 'Loofers', description: 'Hand-sewn Belgian tasselled loofers and French calf penny loofers' },
  { id: 'pants', name: 'Pants', queryValue: 'Pants', description: 'High-rise pleated trousers with side adjusters and unfinished hems' },
  { id: 'jeans', name: 'Jeans', queryValue: 'Jeans', description: 'Japanese selvedge denim tailored to sartorial trouser proportions' },
  { id: 'leather-jackets', name: 'Leather Jackets', queryValue: 'Leather jackets', description: 'Supple full-grain lambskin and burnished suede flight jackets' },
  { id: 'sweaters', name: 'Sweaters', queryValue: 'Sweaters', description: '4-ply Scottish cashmere and extra-fine Merino knitwear' },
  { id: 'coats', name: 'Coats', queryValue: 'Coats', description: 'Double-breasted overcoats in pure cashmere and camel hair' },
  { id: 'polo-shirts', name: 'Polo Shirts', queryValue: 'Polo shirts', description: 'Long and short-sleeve knit polos in Sea Island silk-cotton' },
  { id: 'shorts', name: 'Shorts', queryValue: 'Shorts', description: 'Pleated linen-cotton and tropical wool tailored walk shorts' },
  { id: 'new-arrivals', name: 'New Arrivals', queryValue: 'New Arrivals', description: 'The latest seasonal cuts from the sartorial atelier' }
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

export type PaymentStatus = 'Paid' | 'Pending' | 'Authorized' | 'Refunded' | 'Invoice';

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
