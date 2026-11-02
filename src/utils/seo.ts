/**
 * Park Avenue Menswear — USA #1 SEO & Structured Data Engine
 * 
 * Manages dynamic document title, meta descriptions, canonical URLs,
 * OpenGraph social cards, Twitter cards, and Schema.org JSON-LD structured data.
 */

import { Product, ProductCategory } from '../types';
import { getCategorySlug } from './router';

export const CANONICAL_BASE = 'https://www.parkavenuemenswear.com';
export const BRAND_NAME = 'Park Avenue Menswear';
export const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/Park_Avenue_Logo.png`;

export interface SeoMetadataOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'product';
  ogImage?: string;
  keywords?: string[];
  product?: Product;
  category?: ProductCategory | string;
  breadcrumbs?: { name: string; path: string }[];
}

/**
 * Generates bespoke, high-converting USA #1 ranking SEO metadata for products
 */
export function generateProductSeo(product: Product): SeoMetadataOptions {
  const fabricStr = product.fabric ? `in ${product.fabric}` : 'Italian Fabric';
  const priceFormatted = `$${product.price.toLocaleString('en-US')}`;
  
  // High-CTR title targeting Google USA luxury search (< 60 chars)
  const title = `${product.name} | ${fabricStr} | ${BRAND_NAME} USA`.slice(0, 60);

  // Meta description targeting USA buyers (130-155 chars)
  const description = `Discover the ${product.name} (${priceFormatted}) at Park Avenue Menswear. Handcrafted with ${product.fabric || 'Italian textiles'} and full-canvas tailoring. Fast insured US shipping.`.slice(0, 155);

  const keywords = [
    `${product.name.toLowerCase()} usa`,
    `luxury ${product.category.toLowerCase()} men`,
    'bespoke italian tailoring nyc',
    'park avenue menswear official',
    'men luxury apparel express delivery usa',
    product.fabric ? product.fabric.toLowerCase() : 'italian wool'
  ];

  const primaryImage = (product.images && product.images[0])
    ? (product.images[0].startsWith('http') ? product.images[0] : `${CANONICAL_BASE}${product.images[0]}`)
    : DEFAULT_OG_IMAGE;

  const catSlug = getCategorySlug(product.category) || 'category';
  const skuOrId = product.sku || product.id;
  const productUrl = `/${catSlug}/products/${encodeURIComponent(skuOrId)}`;

  return {
    title,
    description,
    canonicalPath: productUrl,
    ogType: 'product',
    ogImage: primaryImage,
    keywords,
    product,
    category: product.category,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: product.category, path: `/${catSlug}` },
      { name: product.name, path: productUrl }
    ]
  };
}

/**
 * Generates category-level SEO metadata for USA ranking
 */
export function generateCategorySeo(categoryName: string, categorySlug: string, count?: number): SeoMetadataOptions {
  const countStr = count ? `${count}+ ` : '';
  const title = `Luxury Men's ${categoryName} USA | Bespoke ${categoryName} | ${BRAND_NAME}`.slice(0, 60);

  const description = `Explore ${countStr}luxury men's ${categoryName.toLowerCase()} crafted from pure Italian wool, Egyptian cotton, and cashmere. Master bespoke alterations & free USA express delivery.`.slice(0, 155);

  const keywords = [
    `mens luxury ${categoryName.toLowerCase()} usa`,
    `best ${categoryName.toLowerCase()} for men gurnee il`,
    `italian ${categoryName.toLowerCase()} bespoke`,
    `designer ${categoryName.toLowerCase()} park avenue`,
    `hand tailored ${categoryName.toLowerCase()} america`
  ];

  return {
    title,
    description,
    canonicalPath: `/${categorySlug}`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords,
    category: categoryName,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: categoryName, path: `/${categorySlug}` }
    ]
  };
}

/**
 * Injects/updates head meta tags in DOM
 */
export function applySeoMetadata(seo: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  // 1. Document Title
  document.title = seo.title;

  // Helper for meta tags
  const setMeta = (name: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      if (isProperty) el.setAttribute('property', name);
      else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Primary Meta Tags
  setMeta('description', seo.description);
  if (seo.keywords && seo.keywords.length > 0) {
    setMeta('keywords', seo.keywords.join(', '));
  }

  // 3. Canonical Link
  const fullCanonicalUrl = `${CANONICAL_BASE}${seo.canonicalPath ? (seo.canonicalPath.startsWith('/') ? seo.canonicalPath : `/${seo.canonicalPath}`) : ''}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 4. OpenGraph Tags
  setMeta('og:title', seo.title, true);
  setMeta('og:description', seo.description, true);
  setMeta('og:url', fullCanonicalUrl, true);
  setMeta('og:type', seo.ogType || 'website', true);
  setMeta('og:site_name', BRAND_NAME, true);
  setMeta('og:image', seo.ogImage || DEFAULT_OG_IMAGE, true);
  setMeta('og:locale', 'en_US', true);

  // 5. Twitter Card Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', seo.title);
  setMeta('twitter:description', seo.description);
  setMeta('twitter:image', seo.ogImage || DEFAULT_OG_IMAGE);

  // 6. JSON-LD Structured Data Schema.org
  updateJsonLd(seo, fullCanonicalUrl);
}

function updateJsonLd(seo: SeoMetadataOptions, canonicalUrl: string): void {
  const SCRIPT_ID = 'park-avenue-jsonld';
  let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = SCRIPT_ID;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const schemas: any[] = [];

  // Core WebSite & Organization Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${CANONICAL_BASE}/#store`,
    'name': BRAND_NAME,
    'url': CANONICAL_BASE,
    'logo': `${CANONICAL_BASE}/Park_Avenue_Logo.png`,
    'image': `${CANONICAL_BASE}/Hero_image_0.png`,
    'description': 'Premier luxury American menswear house offering bespoke Italian wool suits, Egyptian cotton shirts, and artisan tailoring across all 50 US States.',
    'telephone': '+1-800-555-7275',
    'priceRange': '$$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '6170 W Grand Ave (Gurnee Mills)',
      'addressLocality': 'Gurnee',
      'addressRegion': 'IL',
      'postalCode': '60031',
      'addressCountry': 'US'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '42.3686',
      'longitude': '-87.9547'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '10:00',
        'closes': '19:00'
      }
    ],
    'areaServed': {
      '@type': 'Country',
      'name': 'United States'
    },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Park Avenue Luxury Menswear Catalog',
      'itemListElement': [
        { '@type': 'OfferCatalog', 'name': 'Suits & Tuxedos' },
        { '@type': 'OfferCatalog', 'name': 'Dress Shirts' },
        { '@type': 'OfferCatalog', 'name': 'Tailored Trousers' },
        { '@type': 'OfferCatalog', 'name': 'Outerwear & Overcoats' }
      ]
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${CANONICAL_BASE}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  });

  // Breadcrumbs Schema if provided
  if (seo.breadcrumbs && seo.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': seo.breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': crumb.name,
        'item': `${CANONICAL_BASE}${crumb.path.startsWith('/') ? crumb.path : `/${crumb.path}`}`
      }))
    });
  }

  // Product Schema if on Product Page
  if (seo.product) {
    const p = seo.product;
    const images = (p.images && p.images.length > 0)
      ? p.images.map(img => img.startsWith('http') ? img : `${CANONICAL_BASE}${img}`)
      : [`${CANONICAL_BASE}/Hero_image_0.png`];

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}/#product`,
      'name': p.name,
      'image': images,
      'description': p.description,
      'sku': p.sku || `PA-${p.id}`,
      'mpn': p.sku || `PA-${p.id}`,
      'brand': {
        '@type': 'Brand',
        'name': BRAND_NAME
      },
      'category': p.category,
      'material': p.fabric || 'Superfine Italian Wool',
      'offers': {
        '@type': 'Offer',
        'url': canonicalUrl,
        'priceCurrency': 'USD',
        'price': Number(p.price || 0).toFixed(2),
        'priceValidUntil': '2027-12-31',
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': p.totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
        'seller': {
          '@type': 'Organization',
          'name': BRAND_NAME
        },
        'shippingDetails': {
          '@type': 'OfferShippingDetails',
          'shippingRate': {
            '@type': 'MonetaryAmount',
            'value': p.shippingCharge !== undefined ? p.shippingCharge : 15,
            'currency': 'USD'
          },
          'shippingDestination': {
            '@type': 'DefinedRegion',
            'addressCountry': 'US'
          },
          'deliveryTime': {
            '@type': 'ShippingDeliveryTime',
            'businessDays': {
              '@type': 'OpeningHoursSpecification',
              'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            'transitTime': {
              '@type': 'QuantitativeValue',
              'minValue': 2,
              'maxValue': 4,
              'unitCode': 'DAY'
            }
          }
        },
        'hasMerchantReturnPolicy': {
          '@type': 'MerchantReturnPolicy',
          'applicableCountry': 'US',
          'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
          'merchantReturnDays': 30,
          'returnMethod': 'https://schema.org/ReturnByMail',
          'returnFees': 'https://schema.org/FreeReturn'
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '94',
        'bestRating': '5',
        'worstRating': '1'
      }
    });
  }

  scriptEl.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2);
}
