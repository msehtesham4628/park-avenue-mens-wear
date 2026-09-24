import { AppView } from '../context/ShopContext';
import { OFFICIAL_CATEGORIES, ProductCategory } from '../types';

export interface RouteMatch {
  view: AppView;
  category?: ProductCategory;
  categorySlug?: string;
  productId?: string;
  isProductsSubpage?: boolean;
}

// Map slugs to standard Category names
export const CATEGORY_SLUG_MAP: Record<string, ProductCategory> = {
  'suits': 'Suits',
  'dress-shirts': 'Dress shirts',
  'shirts': 'Dress shirts',
  'ties': 'Ties',
  'shoes': 'Shoe',
  'shoe': 'Shoe',
  'boots': 'Boots',
  'loafers': 'Loofers',
  'loofers': 'Loofers',
  'pants': 'Pants',
  'trousers': 'Pants',
  'jeans': 'Jeans',
  'denim': 'Jeans',
  'leather-jackets': 'Leather jackets',
  'jackets': 'Leather jackets',
  'sweaters': 'Sweaters',
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
  'Dress shirts': 'dress-shirts',
  'Dress Shirts': 'dress-shirts',
  'Ties': 'ties',
  'Shoe': 'shoes',
  'Shoes': 'shoes',
  'Boots': 'boots',
  'Loofers': 'loafers',
  'Loafers': 'loafers',
  'Pants': 'pants',
  'Dress Pants': 'pants',
  'Jeans': 'jeans',
  'Leather jackets': 'leather-jackets',
  'Leather Jackets': 'leather-jackets',
  'Sweaters': 'sweaters',
  'Coats': 'coats',
  'Polo shirts': 'polo-shirts',
  'Polo Shirts': 'polo-shirts',
  'Shorts': 'shorts',
  'New Arrivals': 'new-arrivals',
  'All': 'all'
};

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
    return { view: 'welcome' };
  }

  const firstSeg = segments[0];

  // Specific top-level routes
  switch (firstSeg) {
    case 'home':
      return { view: 'home' };

    case 'welcome':
      return { view: 'welcome' };

    case 'admin':
      return { view: 'admin' };

    case 'dashboard':
      return { view: 'dashboard' };

    case 'account':
      return { view: 'account' };

    case 'cart':
      return { view: 'cart' };

    case 'checkout':
      return { view: 'checkout' };

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

    case 'shop':
    case 'products':
    case 'catalog':
    case 'catalogue':
      if (segments.length >= 2 && segments[1] && segments[1] !== 'products') {
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
    
    // Check for /:category/products/:id
    if (segments.length >= 3 && segments[1] === 'products') {
      return { 
        view: 'pdp', 
        category: categoryName, 
        categorySlug: firstSeg, 
        productId: segments[2] 
      };
    }

    // Check for /:category/products
    if (segments.length >= 2 && segments[1] === 'products') {
      return { 
        view: 'shop', 
        category: categoryName, 
        categorySlug: firstSeg, 
        isProductsSubpage: true 
      };
    }

    // Check for /:category/:id
    if (segments.length >= 2 && segments[1] !== 'products') {
      return { 
        view: 'pdp', 
        category: categoryName, 
        categorySlug: firstSeg, 
        productId: segments[1] 
      };
    }

    // Default /:category (e.g. /suits)
    return { 
      view: 'shop', 
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
}): string {
  const { view, category, productId, isProductsSubpage } = params;

  switch (view) {
    case 'home':
      return '/';

    case 'welcome':
      return '/welcome';

    case 'admin':
      return '/admin';

    case 'dashboard':
      return '/dashboard';

    case 'account':
      return '/account';

    case 'cart':
      return '/cart';

    case 'checkout':
      return '/checkout';

    case 'track-order':
      return '/track-order';

    case 'track-alteration':
      return '/track-alteration';

    case 'login':
      return '/login';

    case 'pdp':
      if (productId) {
        if (category && CATEGORY_TO_SLUG[category]) {
          const slug = CATEGORY_TO_SLUG[category];
          return `/${slug}/products/${productId}`;
        }
        return `/product/${productId}`;
      }
      return '/shop';

    case 'shop':
      if (category && category !== 'All' && CATEGORY_TO_SLUG[category]) {
        const slug = CATEGORY_TO_SLUG[category];
        return isProductsSubpage ? `/${slug}/products` : `/${slug}`;
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
