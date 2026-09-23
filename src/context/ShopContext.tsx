import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  AlterationRecord,
  Customer,
  CustomerNotification,
  ProductCategory
} from '../types';
import {
  ProductService,
  OrderService,
  AlterationService,
  CustomerService,
  NotificationService
} from '../services/api';

export type AppView = 
  | 'home'
  | 'shop'
  | 'pdp'
  | 'cart'
  | 'checkout'
  | 'track-order'
  | 'track-alteration'
  | 'account'
  | 'admin';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
  // Navigation & UI state
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedProductId: string | null;
  navigateToProduct: (productId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => { success: boolean; message?: string };
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders & Alterations
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  currentAlteration: AlterationRecord | null;
  setCurrentAlteration: (alt: AlterationRecord | null) => void;
  lookupOrder: (idOrEmail: string) => Promise<Order | null>;
  lookupAlteration: (idOrPhone: string) => Promise<AlterationRecord | null>;
  placeNewOrder: (orderPayload: any) => Promise<Order>;

  // Notifications
  notifications: CustomerNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // User & Admin
  currentCustomer: Customer | null;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  toggleAdminMode: () => void;

  // Feedback Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Cart with localStorage sync
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pa_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist with localStorage sync
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pa_wishlist');
      return saved ? JSON.parse(saved) : ['prod-suit-01', 'prod-tie-01'];
    } catch {
      return ['prod-suit-01', 'prod-tie-01'];
    }
  });

  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Active tracking models
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentAlteration, setCurrentAlteration] = useState<AlterationRecord | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pa_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Load products, notifications & default customer on mount
  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
      showToast('Could not load products. Please check network.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifs = await NotificationService.getAll();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshNotifications();
    CustomerService.getAll().then(custs => {
      if (custs.length > 0) setCurrentCustomer(custs[0]);
    });
  }, []);

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from your Wishlist' : 'Saved to your Wishlist', 'info');
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Cart operations with inventory check
  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    const variant = product.variants.find(v => v.size === size && v.color === color);
    const availableStock = variant ? variant.stock : product.totalStock;

    if (availableStock <= 0) {
      showToast(`Size ${size} in ${color} is currently out of stock.`, 'error');
      return { success: false, message: 'Item out of stock' };
    }

    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const targetQty = currentQty + quantity;

      if (targetQty > availableStock) {
        showToast(`Only ${availableStock} units available in inventory.`, 'error');
        return { success: false, message: 'Exceeds available inventory' };
      }

      setCart(prev => prev.map((item, idx) => idx === existingIndex ? { ...item, quantity: targetQty } : item));
    } else {
      if (quantity > availableStock) {
        showToast(`Only ${availableStock} units available in inventory.`, 'error');
        return { success: false, message: 'Exceeds available inventory' };
      }

      const newItem: CartItem = {
        id: `cart-${product.id}-${size}-${color}`,
        productId: product.id,
        product,
        selectedSize: size,
        selectedColor: color,
        quantity,
        price: product.price
      };
      setCart(prev => [...prev, newItem]);
    }

    showToast(`Added ${product.name} (${size}) to Shopping Bag`, 'success');
    setIsCartOpen(true);
    return { success: true };
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast('Item removed from Shopping Bag', 'info');
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return { success: true };
    }

    const item = cart.find(i => i.id === cartItemId);
    if (!item) return { success: false };

    const variant = item.product.variants.find(
      v => v.size === item.selectedSize && v.color === item.selectedColor
    );
    const availableStock = variant ? variant.stock : item.product.totalStock;

    if (newQty > availableStock) {
      showToast(`Maximum available inventory for this size is ${availableStock}`, 'error');
      return { success: false, message: 'Exceeds stock limit' };
    }

    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    return { success: true };
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Order & Alteration lookups
  const lookupOrder = async (query: string): Promise<Order | null> => {
    const order = await OrderService.getById(query);
    setCurrentOrder(order);
    return order;
  };

  const lookupAlteration = async (query: string): Promise<AlterationRecord | null> => {
    const alt = await AlterationService.getById(query);
    setCurrentAlteration(alt);
    return alt;
  };

  const placeNewOrder = async (orderPayload: any): Promise<Order> => {
    const createdOrder = await OrderService.create(orderPayload);
    clearCart();
    await refreshProducts();
    await refreshNotifications();
    setCurrentOrder(createdOrder);
    return createdOrder;
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllNotificationsRead = async () => {
    await NotificationService.markAllAsRead();
    await refreshNotifications();
    showToast('All notifications marked as read', 'info');
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const toggleAdminMode = () => {
    if (activeView === 'admin') {
      setActiveView('home');
    } else {
      setActiveView('admin');
    }
  };

  return (
    <ShopContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProductId,
        navigateToProduct,
        selectedCategory,
        setSelectedCategory,
        isSearchOpen,
        setIsSearchOpen,
        isCartOpen,
        setIsCartOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        searchFilter,
        setSearchFilter,
        products,
        isLoadingProducts,
        refreshProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentOrder,
        setCurrentOrder,
        currentAlteration,
        setCurrentAlteration,
        lookupOrder,
        lookupAlteration,
        placeNewOrder,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        currentCustomer,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        toggleAdminMode,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
