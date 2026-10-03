import { AppView } from '../context/ShopContext';
import { OFFICIAL_CATEGORIES, ProductCategory } from '../types';

export interface RouteMatch {
  view: AppView;
  category?: ProductCategory;
  categorySlug?: string;
  productId?: string;
  isProductsSubpage?: boolean;
  adminTab?: string;
  subcategory?: string;
}

// Map slugs to standard Category names
export const CATEGORY_SLUG_MAP: Record<string, ProductCategory> = {
  'suits': 'Suits',
  'blazers-jackets': 'Blazers & Jackets',
  'blazers': 'Blazers & Jackets',
  'shirts': 'Shirts',
  'dress-shirts': 'Dress shirts',
  'ties': 'Ties',
  'shoes': 'Shoes',
  'shoe': 'Shoe',
  'footwear': 'Footwear',
  'accessories': 'Accessories',
  'outerwear': 'Outerwear',
  'sweaters-knitwear': 'Sweaters & Knitwear',
  'sweaters': 'Sweaters & Knitwear',
  'boots': 'Boots',
  'loafers': 'Loafers',
  'loofers': 'Loafers',
  'pants': 'Pants',
  'trousers': 'Pants',
  'jeans': 'Jeans',
  'denim': 'Jeans',
  'leather-jackets': 'Leather jackets',
  'jackets': 'Leather jackets',
  'knitwear': 'Sweaters',
  'coats': 'Coats',
  'overcoats': 'Coats',
  'polo-shirts': 'Polo shirts',
  'polos': 'Polo shirts',
  'shorts': 'Shorts',
  'new-arrivals': 'New Arrivals',
  'all': 'All',
  'shop': 'All',
  'catalogue': 'All',
  'collection': 'All'
};

export const CATEGORY_TO_SLUG: Record<string, string> = {
  'Suits': 'suits',
  'suits': 'suits',
  'Blazers & Jackets': 'blazers-jackets',
  'blazers-jackets': 'blazers-jackets',
  'Blazers': 'blazers-jackets',
  'Shirts': 'shirts',
  'shirts': 'shirts',
  'Dress shirts': 'dress-shirts',
  'Dress Shirts': 'dress-shirts',
  'dress-shirts': 'dress-shirts',
  'Ties': 'ties',
  'ties': 'ties',
  'Shoe': 'shoes',
  'Shoes': 'shoes',
  'shoes': 'shoes',
  'Footwear': 'footwear',
  'footwear': 'footwear',
  'Accessories': 'accessories',
  'accessories': 'accessories',
  'Outerwear': 'outerwear',
  'outerwear': 'outerwear',
  'Sweaters & Knitwear': 'sweaters-knitwear',
  'sweaters-knitwear': 'sweaters-knitwear',
  'Boots': 'boots',
  'boots': 'boots',
  'Loofers': 'loafers',
  'Loafers': 'loafers',
  'loafers': 'loafers',
  'Pants': 'pants',
  'pants': 'pants',
  'Dress Pants': 'pants',
  'Jeans': 'jeans',
  'jeans': 'jeans',
  'Leather jackets': 'leather-jackets',
  'Leather Jackets': 'leather-jackets',
  'leather-jackets': 'leather-jackets',
  'Sweaters': 'sweaters-knitwear',
  'sweaters': 'sweaters-knitwear',
  'Coats': 'outerwear',
  'coats': 'outerwear',
  'Polo shirts': 'polo-shirts',
  'Polo Shirts': 'polo-shirts',
  'polo-shirts': 'polo-shirts',
  'Shorts': 'shorts',
  'shorts': 'shorts',
  'New Arrivals': 'new-arrivals',
  'new-arrivals': 'new-arrivals',
  'new arrivals': 'new-arrivals',
  'All': 'all',
  'all': 'all'
};

export function getCategorySlug(categoryName: string): string {
  if (!categoryName) return 'all';
  const clean = categoryName.trim();
  if (CATEGORY_TO_SLUG[clean]) return CATEGORY_TO_SLUG[clean];
  const lower = clean.toLowerCase();
  if (CATEGORY_TO_SLUG[lower]) return CATEGORY_TO_SLUG[lower];
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Normalizes browser path or hash to clean segment array
 */
export function getPathSegments(rawPathname?: string): string[] {
  let path = rawPathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Check if hash-based routing fallback is active (e.g. #/suits/products)
  if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
    path = window.location.hash.substring(1);
  }

  // Remove leading/trailing slashes and query strings
  path = path.split('?')[0].split('#')[0];
  const cleaned = path.replace(/^\/+|\/+$/g, '');
  if (!cleaned) return [];
  return cleaned.split('/').map(seg => decodeURIComponent(seg).toLowerCase().trim());
}

/**
 * Parses current path into typed RouteMatch
 */
export function parseRoute(pathname?: string): RouteMatch {
  const segments = getPathSegments(pathname);

  if (segments.length === 0) {
    return { view: 'home' };
  }

  const firstSeg = segments[0];

  // Specific top-level routes
  switch (firstSeg) {
    case 'home':
      return { view: 'home' };

    case 'welcome':
      return { view: 'welcome' };

    case 'admin':
      if (segments.length >= 2 && segments[1]) {
        const sub = segments[1].toLowerCase();
        let adminTab = sub;
        if (sub === 'product' || sub === 'products') adminTab = 'products';
        else if (sub === 'erp' || sub === 'erp-reports' || sub === 'tally') adminTab = 'erp-reports';
        return { view: 'admin', adminTab };
      }
      return { view: 'admin', adminTab: 'dashboard' };

    case 'dashboard':
      return { view: 'admin', adminTab: 'dashboard' };

    case 'customer-dashboard':
    case 'client-dashboard':
    case 'my-dashboard':
    case 'patron':
      return { view: 'customer-dashboard' };

    case 'account-info':
    case 'my-info':
    case 'profile':
      return { view: 'account-info' };

    case 'reset-password':
    case 'change-password':
    case 'password':
      return { view: 'reset-password' };

    case 'track-return':
    case 'returns':
    case 'exchange':
    case 'return-tracking':
      return { view: 'track-return' };

    case 'account':
      return { view: 'customer-dashboard' };

    case 'cart':
      return { view: 'cart' };

    case 'checkout':
      return { view: 'cart' };

    case 'track-order':
    case 'track':
    case 'order-tracking':
      return { view: 'track-order' };

    case 'track-alteration':
    case 'alterations':
    case 'alteration-tracking':
      return { view: 'track-alteration' };

    case 'login':
    case 'signin':
    case 'auth':
      return { view: 'login' };

    case 'categories':
      return { view: 'categories' };

    case 'category':
      if (segments.length >= 2 && segments[1]) {
        const catSlug = segments[1];
        const catName = CATEGORY_SLUG_MAP[catSlug] || catSlug;
        return { view: 'category', category: catName as ProductCategory, categorySlug: catSlug };
      }
      return { view: 'categories' };

    case 'shop':
    case 'products':
    case 'catalog':
    case 'catalogue':
      if (segments.length >= 2 && segments[1] && segments[1] !== 'products' && segments[1] !== 'product') {
        // e.g. /products/prod-suit-01
        return { view: 'pdp', productId: segments[1] };
      }
      return { view: 'shop', category: 'All', categorySlug: 'all', isProductsSubpage: true };

    case 'product':
    case 'pdp':
      if (segments.length >= 2 && segments[1]) {
        return { view: 'pdp', productId: segments[1] };
      }
      return { view: 'shop', category: 'All' };
  }

  // Category routes: e.g. /suits, /suits/products, /suits/products/:id
  if (CATEGORY_SLUG_MAP[firstSeg]) {
    const categoryName = CATEGORY_SLUG_MAP[firstSeg];
    
    // Check for /:category/products/:id or /:category/product/:id
    if (segments.length >= 3 && (segments[1] === 'products' || segments[1] === 'product')) {
      return { 
        view: 'pdp', 
        category: categoryName, 
        categorySlug: firstSeg, 
        productId: segments[2] 
      };
    }

    // Check for /:category/products or /:category/product
    if (segments.length >= 2 && (segments[1] === 'products' || segments[1] === 'product')) {
      return { 
        view: 'shop', 
        category: categoryName, 
        categorySlug: firstSeg, 
        isProductsSubpage: true 
      };
    }

    // Check for /:category/:id
    if (segments.length >= 2 && segments[1] !== 'products' && segments[1] !== 'product') {
      return { 
        view: 'pdp', 
        category: categoryName, 
        categorySlug: firstSeg, 
        productId: segments[1] 
      };
    }

    // Default /:category (e.g. /suits) -> opens dedicated Category Page!
    return { 
      view: 'category', 
      category: categoryName, 
      categorySlug: firstSeg, 
      isProductsSubpage: false 
    };
  }

  // Fallback to home
  return { view: 'home' };
}

/**
 * Builds the canonical URL for a given state
 */
export function buildUrl(params: {
  view: AppView;
  category?: string;
  productId?: string;
  isProductsSubpage?: boolean;
  adminTab?: string;
}): string {
  const { view, category, productId, isProductsSubpage, adminTab } = params;

  switch (view) {
    case 'home':
      return '/';

    case 'welcome':
      return '/welcome';

    case 'admin':
    case 'dashboard':
      if (adminTab) {
        const tabLower = adminTab.toLowerCase();
        if (tabLower === 'products' || tabLower === 'product') {
          return '/admin/product';
        }
        if (tabLower === 'erp-reports' || tabLower === 'erp' || tabLower === 'tally') {
          return '/admin/erp';
        }
        if (tabLower !== 'dashboard') {
          return `/admin/${tabLower}`;
        }
      }
      return '/admin';

    case 'customer-dashboard':
      return '/customer-dashboard';

    case 'account-info':
      return '/account-info';

    case 'reset-password':
      return '/reset-password';

    case 'track-return':
      return '/track-return';

    case 'account':
      return '/customer-dashboard';

    case 'cart':
      return '/cart';

    case 'checkout':
      return '/cart';

    case 'track-order':
      return '/track-order';

    case 'track-alteration':
      return '/track-alteration';

    case 'login':
      return '/login';

    case 'pdp':
      if (productId) {
        if (category && category !== 'All' && category !== 'all') {
          const slug = getCategorySlug(category);
          return `/${slug}/products/${productId}`;
        }
        return `/product/${productId}`;
      }
      return '/shop';

    case 'categories':
      return '/categories';

    case 'category':
      if (category && category !== 'All' && category !== 'all') {
        const slug = getCategorySlug(category);
        if (slug && slug !== 'all') {
          return `/${slug}`;
        }
      }
      return '/categories';

    case 'shop':
      if (category && category !== 'All' && category !== 'all') {
        const slug = getCategorySlug(category);
        if (slug && slug !== 'all') {
          return isProductsSubpage ? `/${slug}/products` : `/${slug}`;
        }
      }
      return isProductsSubpage ? '/shop/products' : '/shop';

    default:
      return '/';
  }
}

/**
 * Navigate to a specific URL path cleanly using History API
 */
export function navigateTo(url: string, replace = false): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== url) {
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  }

  // Dispatch custom event to notify listeners immediately
  window.dispatchEvent(new CustomEvent('parkavenue:routechange', { detail: { url } }));
}
