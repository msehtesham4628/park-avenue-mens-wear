import React, { useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { 
  applySeoMetadata, 
  generateProductSeo, 
  generateCategorySeo, 
  CANONICAL_BASE,
  BRAND_NAME 
} from '../../utils/seo';
import { getCategorySlug } from '../../utils/router';

export const SeoHead: React.FC = () => {
  const { activeView, selectedCategory, selectedProductId, products } = useShop();

  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId || p.sku === selectedProductId)
    : null;

  useEffect(() => {
    // 1. Product Detail Page (PDP)
    if (activeView === 'pdp' && selectedProduct) {
      const seo = generateProductSeo(selectedProduct);
      applySeoMetadata(seo);
      return;
    }

    // 2. Specific Category View
    if (activeView === 'category' && selectedCategory && selectedCategory !== 'All') {
      const slug = getCategorySlug(selectedCategory);
      const catCount = products.filter(p => p.category === selectedCategory).length;
      const seo = generateCategorySeo(selectedCategory, slug, catCount);
      applySeoMetadata(seo);
      return;
    }

    // 3. Complete Categories Index
    if (activeView === 'categories') {
      applySeoMetadata({
        title: `Luxury Menswear Categories & Bespoke Collections USA | ${BRAND_NAME}`,
        description: 'Browse all Park Avenue menswear collections: Italian wool suits, Egyptian cotton dress shirts, tailored trousers, outerwear, footwear, and silk ties. Express USA shipping.',
        canonicalPath: '/categories',
        ogType: 'website',
        keywords: ['menswear categories usa', 'luxury suit collections', 'mens designer apparel', 'park avenue catalog']
      });
      return;
    }

    // 4. Shop / Catalogue View
    if (activeView === 'shop') {
      const isAll = !selectedCategory || selectedCategory === 'All';
      const catName = isAll ? 'All Collections' : selectedCategory;
      applySeoMetadata({
        title: `Shop ${catName} | Luxury Menswear USA | ${BRAND_NAME}`,
        description: `Explore ${catName.toLowerCase()} at Park Avenue Menswear. Handcrafted bespoke garments, fine Italian fabrics, and complimentary alteration services across the United States.`,
        canonicalPath: isAll ? '/shop' : `/${getCategorySlug(selectedCategory)}`,
        ogType: 'website',
        keywords: ['shop menswear usa', 'luxury mens clothing online', 'bespoke suits buy online']
      });
      return;
    }

    // 5. Track Order
    if (activeView === 'track-order') {
      applySeoMetadata({
        title: `Track Your Executive Order | ${BRAND_NAME} USA Delivery`,
        description: 'Track real-time courier shipment status, bespoke tailoring timeline, and delivery across all 50 US States with Park Avenue concierge.',
        canonicalPath: '/track-order',
        ogType: 'website'
      });
      return;
    }

    // 6. Track Alterations
    if (activeView === 'track-alteration') {
      applySeoMetadata({
        title: `Bespoke Tailoring & Alteration Progress Vault | ${BRAND_NAME}`,
        description: 'Inspect live workshop status and bench tailoring progress for your commissioned garments at Park Avenue New York atelier.',
        canonicalPath: '/track-alteration',
        ogType: 'website'
      });
      return;
    }

    // 7. Track Returns
    if (activeView === 'track-return') {
      applySeoMetadata({
        title: `Returns & Exchange Portal | ${BRAND_NAME} USA`,
        description: 'Experience effortless 30-day luxury returns and exchanges with prepaid return postage across all 50 United States.',
        canonicalPath: '/track-return',
        ogType: 'website'
      });
      return;
    }

    // 8. Admin / Dashboard (NoIndex / Protected)
    if (activeView === 'admin' || activeView === 'dashboard') {
      document.title = `Atelier Admin & Operations Portal | ${BRAND_NAME}`;
      return;
    }

    // 9. Default Homepage
    applySeoMetadata({
      title: `${BRAND_NAME} | Bespoke Tailoring & Luxury Apparel USA`,
      description: 'Explore luxury American menswear, Italian wool suits, Egyptian cotton dress shirts, tailored dress pants, and handcrafted silk ties. Master tailoring & fast US delivery.',
      canonicalPath: '/',
      ogType: 'website',
      keywords: [
        'luxury menswear usa',
        'bespoke suits nyc',
        'italian wool suits america',
        'egyptian cotton dress shirts',
        'park avenue menswear',
        'hand tailored menswear',
        'executive suits online usa'
      ]
    });
  }, [activeView, selectedCategory, selectedProduct, products]);

  return null; // Head manager component does not render markup directly into body
};
