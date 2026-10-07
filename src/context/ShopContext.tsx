import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
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
  NotificationService,
  AuthService
} from '../services/api';
import { 
  parseRoute, 
  buildUrl, 
  navigateTo, 
  getCategorySlug,
  CATEGORY_TO_SLUG, 
  CATEGORY_SLUG_MAP 
} from '../utils/router';

export type AppView = 
  | 'home'
  | 'welcome'
  | 'shop'
  | 'category'
  | 'categories'
  | 'pdp'
  | 'cart'
  | 'checkout'
  | 'track-order'
  | 'track-alteration'
  | 'account'
  | 'customer-dashboard'
  | 'account-info'
  | 'reset-password'
  | 'track-return'
  | 'terms'
  | 'return-policy'
  | 'login-policy'
  | 'login'
  | 'staff-login'
  | 'admin'
  | 'dashboard';

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
  navigateToProduct: (productId: string, category?: string) => void;
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedCategory: (cat: string, subcat?: string) => void;
  setSelectedSubcategory: (subcat: string) => void;
  openCategoryPage: (category: string, subcategory?: string) => void;
  openCategoriesIndex: () => void;
  isProductsSubpage: boolean;
  setIsProductsSubpage: (val: boolean) => void;
  navigateToUrl: (url: string) => void;
  entryPath: string;
  continueFromWelcome: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;

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
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

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
  dismissNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // User & Admin & Auth
  currentCustomer: Customer | null;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  toggleAdminMode: () => void;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string; role?: string }>;
  register: (data: { 
    fName?: string; 
    lName?: string; 
    firstName?: string; 
    lastName?: string; 
    username: string; 
    email?: string; 
    emailId?: string; 
    password: string; 
    reEnterPassword?: string; 
    phone?: string; 
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;

  // Payment Gateway Visibility (Temporary Suspension)
  isPaymentGatewayHidden: boolean;
  setIsPaymentGatewayHidden: (hidden: boolean) => void;
  togglePaymentGateway: () => void;

  // Feedback Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Helper to extract all valid identifiable IDs for a product catalog
const getCatalogProductIds = (productList: Product[]): Set<string> => {
  const ids = new Set<string>();
  for (const p of productList) {
    if (p.id) ids.add(p.id);
    if ((p as any).productId) ids.add((p as any).productId);
    if ((p as any)._id) ids.add(String((p as any)._id));
    if (p.sku) ids.add(p.sku);
  }
  return ids;
};

// Known legacy/seed dummy IDs that should never count as valid wishlist items
const LEGACY_FAKE_PRODUCT_IDS = new Set([
  'prod-suit-01',
  'prod-tie-01',
  'prod-suit-db-01',
  'prod-trousers-flannel',
  'PA-SUIT-001',
  'PA-SUIT-002',
  'PA-SUIT-003',
  'PA-BLZ-001',
  'PA-SHIRT-001',
  'PA-SUIT-BLK-001',
  'PA-SUIT-NVY-001',
  'PA-SHIRT-WHT-001',
  'prod-1',
  'prod-2',
  'prod-3',
  'prod-4',
  'prod-5'
]);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialPath = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname + window.location.search;
  }, []);

  const initialRoute = useMemo(() => parseRoute(initialPath), [initialPath]);

  // Show the welcome screen for every direct website entry and remember
  // the URL the visitor originally requested (/, /suits, /shop, etc.).
  const [entryPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname + window.location.search;
    sessionStorage.setItem('pa_entry_path', path);
    return path;
  });

  const [adminTab, setAdminTabState] = useState<string>(initialRoute.adminTab || 'dashboard');
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    if (initialRoute.view === 'admin' || initialRoute.view === 'dashboard') {
      return 'admin';
    }
    if (initialRoute.view === 'welcome') {
      return 'welcome';
    }
    if (initialRoute.view === 'home') {
      try {
        const seen = sessionStorage.getItem('pa_welcome_seen');
        if (!seen) {
          sessionStorage.setItem('pa_welcome_seen', '1');
          return 'welcome';
        }
      } catch (_) {}
      return 'home';
    }
    // Direct product, category, cart, and account links should never be delayed by welcome screen
    return initialRoute.view;
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialRoute.productId || null);
  const [selectedCategory, setSelectedCategoryState] = useState<string>(initialRoute.category || 'All');
  const [selectedSubcategory, setSelectedSubcategoryState] = useState<string>('All');
  const [isProductsSubpage, setIsProductsSubpage] = useState<boolean>(initialRoute.isProductsSubpage || false);

  const setAdminTab = useCallback((tab: string) => {
    setAdminTabState(tab);
    const clean = tab.toLowerCase();
    let target = '/admin';
    if (clean === 'products' || clean === 'product') {
      target = '/admin/product';
    } else if (clean === 'erp-reports' || clean === 'erp' || clean === 'tally') {
      target = '/admin/erp';
    } else if (clean && clean !== 'dashboard') {
      target = `/admin/${clean}`;
    }
    navigateTo(target);
  }, []);

  const setSelectedCategory = useCallback((cat: string, subcat: string = 'All') => {
    setSelectedCategoryState(cat);
    setSelectedSubcategoryState(subcat);
  }, []);

  const setSelectedSubcategory = useCallback((subcat: string) => {
    setSelectedSubcategoryState(subcat);
  }, []);

  const openCategoryPage = useCallback((category: string, subcategory: string = 'All') => {
    setSelectedCategoryState(category);
    setSelectedSubcategoryState(subcategory);
    setIsProductsSubpage(false);
    setActiveViewState('category');
    const slug = getCategorySlug(category);
    const url = (slug && slug !== 'all') ? `/${slug}` : '/categories';
    navigateTo(url);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  const openCategoriesIndex = useCallback(() => {
    setSelectedCategoryState('All');
    setSelectedSubcategoryState('All');
    setIsProductsSubpage(false);
    setActiveViewState('categories');
    navigateTo('/categories');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

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

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      return AuthService.getCurrentUser();
    } catch {
      return null;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const stored = AuthService.getCurrentUser();
      return !!(stored && (stored.role === 'admin' || stored.role === 'staff'));
    } catch {
      return false;
    }
  });

  // Wishlist with customer-isolated localStorage persistence and catalog integrity
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = AuthService.getCurrentUser();
      const userKey = (stored?.email || stored?.id || 'guest').toLowerCase().trim();
      const saved = localStorage.getItem(`pa_wishlist_${userKey}`) || localStorage.getItem('pa_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            id => typeof id === 'string' && id.trim().length > 0 && !LEGACY_FAKE_PRODUCT_IDS.has(id.trim())
          );
          if (cleaned.length !== parsed.length) {
            try {
              localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify(cleaned));
              localStorage.setItem('pa_wishlist', JSON.stringify(cleaned));
            } catch {}
          }
          return cleaned;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Client notifications with customer-isolated persistent cache
  const [notifications, setNotifications] = useState<CustomerNotification[]>(() => {
    try {
      const stored = AuthService.getCurrentUser();
      const customerKey = (stored?.email || stored?.id || 'guest').toLowerCase().trim();
      const cached = localStorage.getItem(`pa_notifications_${customerKey}`) || localStorage.getItem('park_avenue_notifications');
      const readSaved = localStorage.getItem(`pa_read_${customerKey}`);
      const readIds: string[] = readSaved ? JSON.parse(readSaved) : [];
      if (cached) {
        const parsed: CustomerNotification[] = JSON.parse(cached);
        return parsed.map(n => ({
          ...n,
          read: Boolean(n.read || readIds.includes(n.id))
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active tracking models
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentAlteration, setCurrentAlteration] = useState<AlterationRecord | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Payment Gateway Visibility (Default: true -> payment hidden temporarily)
  const [isPaymentGatewayHidden, setIsPaymentGatewayHiddenState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pa_payment_gateway_hidden');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const setIsPaymentGatewayHidden = useCallback((hidden: boolean) => {
    setIsPaymentGatewayHiddenState(hidden);
    try {
      localStorage.setItem('pa_payment_gateway_hidden', hidden ? 'true' : 'false');
    } catch (_) {}
  }, []);

  const togglePaymentGateway = useCallback(() => {
    setIsPaymentGatewayHiddenState(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pa_payment_gateway_hidden', next ? 'true' : 'false');
      } catch (_) {}
      return next;
    });
  }, []);

  const continueFromWelcome = useCallback(() => {
    const rawDest = sessionStorage.getItem('pa_entry_path') || '/';
    sessionStorage.removeItem('pa_entry_path');
    try {
      sessionStorage.setItem('pa_welcome_seen', '1');
    } catch (_) {}
    const dest = (rawDest === '/welcome' || rawDest === '') ? '/' : rawDest;
    const match = parseRoute(dest);
    const targetView = (match.view === 'welcome') ? 'home' : match.view;
    
    setActiveViewState(targetView);
    if (match.category) {
      setSelectedCategoryState(match.category);
    }
    if (match.productId) {
      setSelectedProductId(match.productId);
    }
    if (match.adminTab) {
      setAdminTabState(match.adminTab);
    }
    setIsProductsSubpage(!!match.isProductsSubpage);

    navigateTo(dest === '/welcome' ? '/' : dest);
  }, []);

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

  // Load customer's isolated wishlist whenever currentCustomer changes
  useEffect(() => {
    const userKey = (currentCustomer?.email || currentCustomer?.id || 'guest').toLowerCase().trim();
    try {
      const saved = localStorage.getItem(`pa_wishlist_${userKey}`) || localStorage.getItem('pa_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            id => typeof id === 'string' && id.trim().length > 0 && !LEGACY_FAKE_PRODUCT_IDS.has(id.trim())
          );
          if (products.length > 0) {
            const validIds = getCatalogProductIds(products);
            const verified = cleaned.filter(id => validIds.has(id));
            setWishlist(verified);
            try {
              localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify(verified));
              localStorage.setItem('pa_wishlist', JSON.stringify(verified));
            } catch {}
            return;
          }
          setWishlist(cleaned);
          return;
        }
      }
      setWishlist([]);
    } catch {
      setWishlist([]);
    }
  }, [currentCustomer, products]);

  // Sync wishlist to localStorage per customer
  useEffect(() => {
    const userKey = (currentCustomer?.email || currentCustomer?.id || 'guest').toLowerCase().trim();
    try {
      localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify(wishlist));
      localStorage.setItem('pa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, currentCustomer]);

  // Automatically sanitize wishlist against active product catalog once products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const validProductIds = getCatalogProductIds(products);
      setWishlist(prev => {
        const cleaned = prev.filter(id => validProductIds.has(id));
        if (cleaned.length !== prev.length) {
          const userKey = (currentCustomer?.email || currentCustomer?.id || 'guest').toLowerCase().trim();
          try {
            localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify(cleaned));
            localStorage.setItem('pa_wishlist', JSON.stringify(cleaned));
          } catch {}
          return cleaned;
        }
        return prev;
      });
    }
  }, [products, currentCustomer]);

  // Compute true valid wishlist count (only counts products that actually exist in the active catalog)
  const wishlistCount = useMemo(() => {
    if (!products || products.length === 0) return 0;
    const validIds = getCatalogProductIds(products);
    return wishlist.filter(id => validIds.has(id)).length;
  }, [wishlist, products]);

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
      const email = currentCustomer?.email;
      const username = (currentCustomer as any)?.username;
      const customerId = currentCustomer?.id || (currentCustomer as any)?.customerId;
      const notifs = await NotificationService.getAll({ email, username, customerId });
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [currentCustomer]);

  useEffect(() => {
    refreshProducts();
    refreshNotifications();
    
    // Check existing stored authentication session
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setCurrentCustomer(storedUser);
      if (storedUser.role === 'admin' || storedUser.role === 'staff') {
        setIsAdminLoggedIn(true);
      }
    }
  }, []);

  // Listen to browser Back/Forward navigation and route events
  useEffect(() => {
    const handlePopOrCustom = () => {
      const match = parseRoute(window.location.pathname);
      setActiveViewState(match.view);
      if (match.category) {
        setSelectedCategoryState(match.category);
      }
      if (match.productId) {
        setSelectedProductId(match.productId);
      }
      if (match.adminTab) {
        setAdminTabState(match.adminTab);
      }
      setIsProductsSubpage(!!match.isProductsSubpage);
    };

    window.addEventListener('popstate', handlePopOrCustom);
    window.addEventListener('parkavenue:routechange', handlePopOrCustom);
    return () => {
      window.removeEventListener('popstate', handlePopOrCustom);
      window.removeEventListener('parkavenue:routechange', handlePopOrCustom);
    };
  }, []);

  const setActiveView = (view: AppView) => {
    setActiveViewState(view);
    const url = buildUrl({
      view,
      category: selectedCategory,
      productId: selectedProductId || undefined,
      isProductsSubpage,
      adminTab
    });
    navigateTo(url);
  };

  const navigateToProduct = (productIdOrSku: string, category?: string) => {
    const clean = (productIdOrSku || '').trim();
    const matched = products.find(p => 
      (p.sku && p.sku.toLowerCase() === clean.toLowerCase()) ||
      (p.id && p.id.toLowerCase() === clean.toLowerCase()) ||
      ((p as any).productId && String((p as any).productId).toLowerCase() === clean.toLowerCase()) ||
      ((p as any)._id && String((p as any)._id).toLowerCase() === clean.toLowerCase())
    );

    const canonicalSku = matched?.sku || clean;
    const resolvedCategory = category || matched?.category || (selectedCategory !== 'All' ? selectedCategory : undefined);

    setSelectedProductId(canonicalSku);
    if (resolvedCategory && resolvedCategory !== 'All') {
      setSelectedCategoryState(resolvedCategory);
    }
    setActiveViewState('pdp');
    const url = buildUrl({
      view: 'pdp',
      category: resolvedCategory,
      productId: canonicalSku
    });
    navigateTo(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToUrl = (url: string) => {
    navigateTo(url);
  };

  const login = async (usernameOrEmail: string, password: string) => {
    const result = await AuthService.login(usernameOrEmail, password);
    if (result.success && result.customer) {
      setCurrentCustomer(result.customer);
      if (result.customer.role === 'admin' || result.customer.role === 'staff') {
        setIsAdminLoggedIn(true);
      }
      showToast(result.message || `Welcome to Park Avenue Mens Wear, ${result.customer.name || 'Patron'}!`, 'success');
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pa_checkout_return') === '1') {
        sessionStorage.removeItem('pa_checkout_return');
        setActiveViewState('cart');
        navigateTo('/cart');
      }
      return { success: true, role: result.customer.role };
    } else {
      showToast(result.message || 'Authentication failed. Please verify credentials.', 'error');
      return { success: false, message: result.message };
    }
  };

  const register = async (data: { 
    fName?: string; 
    lName?: string; 
    firstName?: string; 
    lastName?: string; 
    username: string; 
    email?: string; 
    emailId?: string; 
    password: string; 
    reEnterPassword?: string; 
    phone?: string; 
  }) => {
    const result = await AuthService.register(data);
    if (result.success && result.customer) {
      setCurrentCustomer(result.customer);
      showToast('Account created successfully. Welcome to Park Avenue Mens Wear!', 'success');
      return { success: true };
    } else {
      showToast(result.message || 'Registration failed.', 'error');
      return { success: false, message: result.message };
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentCustomer(null);
    setIsAdminLoggedIn(false);
    showToast('Signed out of Park Avenue session.', 'info');
    setActiveView('login');
  };

  const toggleWishlist = (productId: string) => {
    if (!productId) return;
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from your Wishlist' : 'Saved to your Wishlist', 'info');
      const userKey = (currentCustomer?.email || currentCustomer?.id || 'guest').toLowerCase().trim();
      try {
        localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify(next));
        localStorage.setItem('pa_wishlist', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const isInWishlist = (productId: string) => {
    if (!productId) return false;
    return wishlist.includes(productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    const userKey = (currentCustomer?.email || currentCustomer?.id || 'guest').toLowerCase().trim();
    try {
      localStorage.setItem(`pa_wishlist_${userKey}`, JSON.stringify([]));
      localStorage.setItem('pa_wishlist', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('Your wishlist has been cleared', 'info');
  };

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
    const email = currentCustomer?.email;
    const customerId = currentCustomer?.id || (currentCustomer as any)?.customerId;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await NotificationService.markAsRead(id, { email, customerId });
    await refreshNotifications();
  };

  const markAllNotificationsRead = async () => {
    const email = currentCustomer?.email;
    const customerId = currentCustomer?.id || (currentCustomer as any)?.customerId;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await NotificationService.markAllAsRead({ email, customerId });
    await refreshNotifications();
    showToast('All notifications marked as read', 'info');
  };

  const dismissNotification = async (id: string) => {
    const email = currentCustomer?.email;
    const username = (currentCustomer as any)?.username;
    const customerId = currentCustomer?.id || (currentCustomer as any)?.customerId;
    setNotifications(prev => prev.filter(n => n.id !== id));
    await NotificationService.dismissNotification(id, { email, username, customerId });
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
        selectedSubcategory,
        setSelectedCategory,
        setSelectedSubcategory,
        openCategoryPage,
        openCategoriesIndex,
        isProductsSubpage,
        setIsProductsSubpage,
        navigateToUrl,
        entryPath,
        continueFromWelcome,
        isSearchOpen,
        setIsSearchOpen,
        isCartOpen,
        setIsCartOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        searchFilter,
        setSearchFilter,
        adminTab,
        setAdminTab,
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
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
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
        dismissNotification,
        refreshNotifications,
        currentCustomer,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        toggleAdminMode,
        login,
        register,
        logout,
        isPaymentGatewayHidden,
        setIsPaymentGatewayHidden,
        togglePaymentGateway,
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
