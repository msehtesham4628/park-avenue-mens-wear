import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Scissors, 
  Truck, 
  Ruler, 
  Sparkles, 
  MapPin, 
  Check, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  ShieldCheck, 
  RotateCcw, 
  Flame, 
  Clock, 
  ArrowRight,
  Maximize2,
  X,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { MediaPlaceholder } from '../common/MediaPlaceholder';
import { ParkAvenueLogo } from '../brand/ParkAvenueLogo';
import { SizeGuideModal } from './SizeGuideModal';
import { estimateTaxAndShipmentByZip, ZipTaxAndShipmentEstimate } from '../../services/taxEngine';
import { Product } from '../../types';
import { extractProductColors } from '../../utils/colorUtils';
import { ProductService } from '../../services/api';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProductId, 
    products, 
    isLoadingProducts,
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    setActiveView,
    setSelectedCategory,
    navigateToProduct,
    currentCustomer,
    showToast
  } = useShop();

  const [remoteProduct, setRemoteProduct] = useState<Product | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);

  // Flexible local product matching with strict prioritized matching
  const localMatch = useMemo(() => {
    if (!selectedProductId || !products || products.length === 0) return null;
    let clean = selectedProductId.trim();
    try {
      clean = decodeURIComponent(clean).trim();
    } catch (_) {}
    const lower = clean.toLowerCase();

    // 1. Exact ID, _id, or productId match (highest priority)
    const byId = products.find(p => 
      (p.id && p.id.toLowerCase() === lower) ||
      ((p as any)._id && String((p as any)._id).toLowerCase() === lower) ||
      ((p as any).productId && String((p as any).productId).toLowerCase() === lower)
    );
    if (byId) return byId;

    // 2. Exact SKU match
    const bySku = products.find(p => p.sku && p.sku.toLowerCase() === lower);
    if (bySku) return bySku;

    // 3. Exact slug match
    const bySlug = products.find(p => (p as any).slug && String((p as any).slug).toLowerCase() === lower);
    if (bySlug) return bySlug;

    // 4. Slugified name fallback
    const byName = products.find(p => 
      p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === lower
    );
    return byName || null;
  }, [products, selectedProductId]);

  // Fetch product from remote API if not found in current local array
  useEffect(() => {
    if (!selectedProductId) {
      setRemoteProduct(null);
      return;
    }
    if (localMatch) {
      setRemoteProduct(null);
      return;
    }

    let active = true;
    setIsFetchingProduct(true);
    ProductService.getById(selectedProductId)
      .then(res => {
        if (active && res) {
          setRemoteProduct(res);
        }
      })
      .catch(err => {
        console.warn('[PDP] Remote product lookup warning:', err);
      })
      .finally(() => {
        if (active) {
          setIsFetchingProduct(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedProductId, localMatch]);

  // If a specific selectedProductId was requested:
  // ONLY display that exact product (local or remote). NEVER fall back to products[0]!
  const product: Product | null = useMemo(() => {
    if (selectedProductId) {
      return localMatch || remoteProduct || null;
    }
    // Only if no product was selected, use the first available product
    return products.length > 0 ? products[0] : null;
  }, [selectedProductId, localMatch, remoteProduct, products]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    specifications: true,
    tailoring: false,
    returns: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Gift options state
  const [isGiftOptionEnabled, setIsGiftOptionEnabled] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // Delivery ZIP Code, Tax & Shipment Estimator state
  const [zipInput, setZipInput] = useState('');
  const [zipEstimate, setZipEstimate] = useState<ZipTaxAndShipmentEstimate | null>(null);
  const [selectedShippingSpeed, setSelectedShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [zipError, setZipError] = useState('');
  const [isCalculatingZip, setIsCalculatingZip] = useState(false);

  // Sticky bottom action bar visibility on mobile
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      const firstAvailableVariant = product.variants?.find(v => v.stock > 0) || product.variants?.[0];
      if (firstAvailableVariant) {
        setSelectedSize(firstAvailableVariant.size);
        setSelectedColor(firstAvailableVariant.color);
      } else {
        setSelectedSize('38R');
        setSelectedColor('Navy');
      }
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  // Observer for sticky bottom bar using lightweight IntersectionObserver
  useEffect(() => {
    if (!mainActionsRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when main actions are scrolled out of view
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(mainActionsRef.current);
    return () => observer.disconnect();
  }, []);

  // Safe variables and calculations
  const originalPrice = product ? (product.originalPrice || Math.round(product.price * 1.35)) : 0;
  const discountPercent = product ? Math.max(10, Math.round(((originalPrice - product.price) / (originalPrice || 1)) * 100)) : 0;

  // Variants & Options (Strictly Hook order compliant)
  const allSizes = useMemo(() => {
    if (!product) return ['38R', '40R', '42R', '44R'];
    return Array.from(new Set(product.variants?.map(v => v.size) || ['38R', '40R', '42R', '44R']));
  }, [product]);

  const extractedColors = useMemo(() => {
    if (!product) return [];
    return extractProductColors(product);
  }, [product]);

  const allColors = useMemo(() => extractedColors.map(c => c.name), [extractedColors]);

  const currentSize = selectedSize || allSizes[0] || 'Standard';
  const currentColor = selectedColor || allColors[0] || 'Midnight Navy';

  const matchedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants?.find(
      v => v.size === currentSize && (v.color || '').toLowerCase() === currentColor.toLowerCase()
    ) || product.variants?.find(v => v.size === currentSize);
  }, [product, currentSize, currentColor]);

  const availableStock = matchedVariant ? matchedVariant.stock : (product?.totalStock ?? 12);
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 3;
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Category image fallback mapping
  const categoryImageMap: Record<string, string> = {
    'Suits': '/Suits_image.png',
    'Blazers & Jackets': '/Blazers_jackets_image.png',
    'Shirts': '/Shirts_image.png',
    'Dress Shirts': '/Shirts_image.png',
    'Pants': '/Pants_image.png',
    'Dress Pants': '/Pants_image.png',
    'Jeans': '/Pants_image.png',
    'Outerwear': '/Outwear_image.png',
    'Coats': '/Outwear_image.png',
    'Leather jackets': '/Blazers_jackets_image.png',
    'Sweaters & Knitwear': '/Sweaters_kintwear_image.png',
    'Sweaters': '/Sweaters_kintwear_image.png',
    'Polo shirts': '/Shirts_image.png',
    'Footwear': '/Footwear_image.png',
    'Shoe': '/Footwear_image.png',
    'Boots': '/Footwear_image.png',
    'Loofers': '/Footwear_image.png',
    'Accessories': '/Accessories_image.png',
    'Ties': '/Accessories_image.png',
    'Shorts': '/Shorts_image.png'
  };

  const primaryImage = product
    ? (product.colorImages?.[currentColor]?.[0] || product.images?.[0] || categoryImageMap[product.category] || '/Suits_image.png')
    : '/Suits_image.png';

  // Dynamically resolve view angles from productViews, images, or client uploads
  const resolvedViews = useMemo(() => {
    if (!product) return [];
    const list: { type: string; label: string; url: string; sub: string; isPdf?: boolean }[] = [];
    const pv = product.productViews;

    // 1. Front View (Primary)
    const frontUrl = pv?.front || product.colorImages?.[currentColor]?.[0] || product.images?.[0] || categoryImageMap[product.category] || '/Suits_image.png';
    if (frontUrl) {
      list.push({ type: 'front', label: 'Front View', url: frontUrl, sub: 'Front Silhouette & Lapels' });
    }

    // 2. Back View
    const backUrl = pv?.back || product.images?.[1] || '';
    if (backUrl) {
      list.push({ type: 'back', label: 'Back View', url: backUrl, sub: 'Rear Drape & Tailored Vents' });
    }

    // 3. Left View
    const leftUrl = pv?.left || product.images?.[2] || '';
    if (leftUrl) {
      list.push({ type: 'left', label: 'Left View', url: leftUrl, sub: 'Left Profile & Sleeve Pitch' });
    }

    // 4. Right View
    const rightUrl = pv?.right || product.images?.[3] || '';
    if (rightUrl) {
      list.push({ type: 'right', label: 'Right View', url: rightUrl, sub: 'Right Profile & Stance' });
    }

    // 5. Detail / Fabric View
    const detailUrl = pv?.detail || product.images?.[4] || '';
    if (detailUrl) {
      list.push({ type: 'detail', label: 'Detail View', url: detailUrl, sub: 'Textile Weave & Stitching' });
    }

    // If fewer than 4 views exist, provide standard angles
    if (list.length < 4) {
      const fallbacks = [
        { type: 'back', label: 'Back View', sub: 'Rear Silhouette' },
        { type: 'left', label: 'Left View', sub: 'Profile Angle' },
        { type: 'right', label: 'Right View', sub: 'Sartorial Finish' }
      ];
      for (const fb of fallbacks) {
        if (!list.some(v => v.type === fb.type)) {
          list.push({ type: fb.type, label: fb.label, url: frontUrl, sub: fb.sub });
        }
      }
    }

    return list.slice(0, 5);
  }, [product, currentColor]);

  const currentDisplayImage = resolvedViews[activeImageIndex]?.url || primaryImage;

  // Delivery ZIP Code Tax & Shipment Handler (Synchronized with Dashboard)
  const handleCalculateTaxAndShipment = (overrideZip?: string) => {
    if (!product) return;
    setZipError('');
    const targetZip = (overrideZip !== undefined ? overrideZip : zipInput).trim();
    const cleanZip = targetZip.replace(/\D/g, '').slice(0, 5);

    if (!cleanZip || cleanZip.length < 5) {
      setZipError('Please enter a valid 5-digit US ZIP code (e.g. 10001, 90210, 75001).');
      setZipEstimate(null);
      return;
    }

    setIsCalculatingZip(true);

    const result = estimateTaxAndShipmentByZip(cleanZip, product.price, quantity, product.shippingCharge);

    setTimeout(() => {
      setIsCalculatingZip(false);
      if (result) {
        setZipEstimate(result);
        setZipInput(cleanZip);
      } else {
        setZipError(`ZIP code "${cleanZip}" could not be mapped to a US delivery territory.`);
        setZipEstimate(null);
      }
    }, 180);
  };

  // Keep live estimate synced if price, quantity, product.shippingCharge, or Dashboard rates change
  useEffect(() => {
    if (!product) return;
    const refreshEstimate = () => {
      if (zipEstimate?.zip) {
        const refreshed = estimateTaxAndShipmentByZip(zipEstimate.zip, product.price, quantity, product.shippingCharge);
        if (refreshed) {
          setZipEstimate(refreshed);
        }
      }
    };

    window.addEventListener('pa_rates_updated', refreshEstimate);
    window.addEventListener('storage', refreshEstimate);
    return () => {
      window.removeEventListener('pa_rates_updated', refreshEstimate);
      window.removeEventListener('storage', refreshEstimate);
    };
  }, [product?.price, product?.shippingCharge, quantity, zipEstimate?.zip]);

  useEffect(() => {
    if (!product) return;
    if (zipEstimate?.zip) {
      const refreshed = estimateTaxAndShipmentByZip(zipEstimate.zip, product.price, quantity, product.shippingCharge);
      if (refreshed) {
        setZipEstimate(refreshed);
      }
    }
  }, [product?.price, product?.shippingCharge, quantity]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, currentSize, currentColor, quantity);
    showToast(`Added ${product.name} (${currentSize} • ${currentColor}) to your bag.`, 'success');
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Park Avenue — ${product.name}`,
          text: `Check out ${product.name} on Park Avenue Menswear`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share not supported
      }
    }
    navigator.clipboard.writeText(shareUrl);
    showToast('Product link copied to clipboard!', 'success');
  };

  // Complementary products for Complete the Look
  const complementaryProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && p.category !== product.category)
      .slice(0, 4);
  }, [products, product?.id, product?.category]);

  if (isFetchingProduct || (isLoadingProducts && !product)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-white text-[#111827] px-4 py-20">
        <div className="max-w-md w-full border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 text-center flex flex-col items-center shadow-lg">
          <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-semibold">
            PARK AVENUE ATELIER
          </span>
          <h2 className="font-serif text-xl sm:text-2xl text-[#111827] uppercase tracking-wider mb-3 font-light">
            RETRIEVING GARMENT SPECIFICATIONS
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed">
            Consulting private tailoring archive...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-white text-[#111827] px-4 py-20">
        <div className="max-w-md w-full border border-gray-200 bg-[#F9F9F8] p-8 sm:p-12 text-center flex flex-col items-center shadow-2xl">
          <ParkAvenueLogo variant="mark" size="md" className="w-12 h-12 mb-6" />
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#936B34] mb-3 block font-medium">
            PARK AVENUE MENSWEAR
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider mb-4 font-light">
            {selectedProductId ? 'GARMENT NOT FOUND' : 'NO PRODUCT SELECTED'}
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono leading-relaxed mb-8">
            {selectedProductId 
              ? `We could not locate garment "${selectedProductId}" in our current catalogue. It may be part of an exclusive archive or private commission.`
              : 'Please choose a garment from our collections catalog to view complete tailoring details.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => setActiveView('shop')}
              className="flex-1 px-6 py-3.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#7A5726] transition-colors cursor-pointer shadow-md"
            >
              EXPLORE READY-TO-WEAR
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 text-xs font-mono tracking-widest uppercase hover:border-[#936B34] hover:text-[#936B34] transition-colors cursor-pointer"
            >
              RETURN TO SALON
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] pb-24">
      
      {/* Top Breadcrumb & Share Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <nav className="text-[11px] font-mono uppercase tracking-wider text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => setActiveView('home')} 
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              HOME
            </button>
            <span className="text-gray-300">/</span>
            <button 
              onClick={() => {
                setSelectedCategory(product.category);
                setActiveView('shop');
              }} 
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              {product.category.toUpperCase()}
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-[#936B34] font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-500 hover:text-[#111827] transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Share garment"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">SHARE</span>
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-1.5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono ${
                isWishlisted ? 'text-[#936B34]' : 'text-gray-500 hover:text-[#111827]'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#936B34]' : ''}`} />
              <span className="hidden sm:inline">{isWishlisted ? 'SAVED' : 'WISHLIST'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* LEFT: Image Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Primary Main Image Frame */}
            <div className="relative aspect-[3/4] bg-[#F8F9FA] overflow-hidden border border-gray-200 group">
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={`${product.name} - ${resolvedViews[activeImageIndex]?.label || 'view'}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setIsZoomModalOpen(true)}
                />
              ) : (
                <MediaPlaceholder
                  label="PARK AVENUE ATELIER"
                  category={product.category}
                  aspectRatio="auto"
                  className="w-full h-full min-h-[460px]"
                  subtext={resolvedViews[activeImageIndex]?.label || product.name}
                />
              )}

              {/* Floating Badge Overlays */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                {product.isNewArrival && (
                  <span className="text-[9px] uppercase tracking-[0.25em] font-mono font-semibold text-white bg-[#111827] px-2.5 py-1 shadow-md">
                    NEW ARRIVAL
                  </span>
                )}
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-medium text-[#111827] bg-white/95 backdrop-blur-xs px-2.5 py-0.5 border border-gray-200 shadow-xs">
                  {product.category.toUpperCase()}
                </span>
                {resolvedViews[activeImageIndex] && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold text-[#936B34] bg-white/95 backdrop-blur-xs px-2.5 py-1 border border-[#936B34]/30 shadow-xs">
                    {resolvedViews[activeImageIndex].label}
                  </span>
                )}
              </div>

              {/* Image Counter Badge */}
              <div className="absolute bottom-3 right-3 z-10 bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 tracking-wider">
                0{activeImageIndex + 1} / 0{resolvedViews.length}
              </div>

              {/* Tap to Zoom prompt button */}
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute bottom-3 left-3 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 shadow-md transition-all cursor-pointer"
                title="Inspect high resolution"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Angle Thumbnails Strip (3 to 5 Views) */}
            <div className={`grid grid-cols-${Math.min(resolvedViews.length, 5)} gap-2 sm:gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(resolvedViews.length, 5)}, minmax(0, 1fr))` }}>
              {resolvedViews.map((view, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[3/4] bg-[#F8F9FA] border p-1 sm:p-1.5 text-center flex flex-col items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
                    activeImageIndex === idx
                      ? 'border-[#936B34] ring-2 ring-[#936B34]/40 bg-[#F0F2F5]'
                      : 'border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-400'
                  }`}
                >
                  <div className="w-full h-full relative overflow-hidden bg-gray-100">
                    {view.url ? (
                      <img 
                        src={view.url} 
                        alt={view.label} 
                        className={`w-full h-full object-cover transition-opacity ${activeImageIndex === idx ? 'opacity-100' : 'opacity-80'}`} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1">
                        <span className="font-mono text-[10px] text-[#936B34] font-semibold">0{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-1 pb-0.5 text-center bg-white/90">
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-gray-800 font-semibold block truncate">
                      {view.label}
                    </span>
                  </div>

                  {activeImageIndex === idx && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-[#936B34]" />
                  )}
                </button>
              ))}
            </div>

            {/* Atelier Craftsmanship Quality Guarantee (Anti-AI Slop luxury provenance) */}
            <div className="p-4 sm:p-5 bg-[#F9F9F8] border border-gray-200 mt-6 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#111827] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#936B34] font-semibold">
                    ATELIER SARTORIAL EXCELLENCE
                  </span>
                </div>
                <p className="font-serif text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;Each garment undergoes 14 hand checkpoints by our master tailors before dispatch, verifying canvas structure, lapel roll, and seamless fabric alignment.&rdquo;
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details & Purchase Module (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Brand, Title & SKU */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-mono">
                <span className="font-bold tracking-[0.25em] text-[#936B34] uppercase">
                  PARK AVENUE
                </span>
                <span className="text-[11px] text-gray-400">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl text-[#111827] font-normal leading-tight uppercase mb-2">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price Row (Selling Price, MRP Strikethrough, Discount % & Tax Note) */}
            <div className="pb-4 border-b border-gray-200 space-y-1.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-semibold tabular-nums text-[#111827]">
                  ${product.price.toLocaleString()}
                </span>
                {originalPrice > product.price && (
                  <span className="text-base text-gray-400 line-through tabular-nums">
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>

              {/* Shipment Charge Tag (Synced with Dashboard Product Settings) */}
              <div className="flex items-center justify-between p-2.5 bg-[#FBFBFA] border border-gray-200 mt-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#936B34]" />
                  <span className="text-gray-600">Shipment Charge:</span>
                </div>
                <strong className={product.shippingCharge === 0 ? 'text-emerald-700 font-semibold' : 'text-[#111827] font-semibold'}>
                  {product.shippingCharge === 0 
                    ? 'Free Shipping (Insured)' 
                    : `+$${product.shippingCharge !== undefined ? product.shippingCharge : 15}.00 Insured Ground`}
                </strong>
              </div>
            </div>

            {/* Real-time Social Proof Banner (As shown in screenshot) */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-950 font-mono">
              <Flame className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
              <span>
                <strong>201 people</strong> viewed this in the past 24 hours
              </span>
            </div>

            {/* Color Selector */}
            {extractedColors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span>COLOR:</span>
                    <strong className="text-[#111827] font-semibold tracking-wide uppercase">{currentColor}</strong>
                  </span>
                  <span className="text-[#936B34] text-[11px] font-medium font-mono">
                    {extractedColors.length} {extractedColors.length === 1 ? 'shade' : 'shades available'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {extractedColors.map(colorItem => {
                    const isSelected = colorItem.name.toLowerCase() === currentColor.toLowerCase();
                    return (
                      <button
                        key={colorItem.name}
                        type="button"
                        onClick={() => setSelectedColor(colorItem.name)}
                        className={`group px-3.5 py-2 text-xs font-mono border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[#936B34] bg-white text-[#111827] font-semibold ring-2 ring-[#936B34]/40 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-[#F9F9F8]'
                        }`}
                        title={colorItem.name}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full shrink-0 border transition-transform ${
                            colorItem.isLight ? 'border-gray-400 shadow-2xs' : 'border-black/20'
                          } ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                          style={{ backgroundColor: colorItem.hex }}
                        />
                        <span className="tracking-wide">{colorItem.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#936B34]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector with Size Guide Link */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>SELECT SIZE: <strong className="text-[#111827] font-semibold">{currentSize}</strong></span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#936B34] hover:text-[#111827] flex items-center gap-1 cursor-pointer font-semibold underline underline-offset-2"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>SIZE GUIDE</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {allSizes.map(size => {
                  const variant = product.variants?.find(v => v.size === size);
                  const isAvailable = variant ? variant.stock > 0 : true;
                  const isSelected = size === currentSize;

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`py-2.5 text-xs font-mono border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#111827] bg-[#111827] text-white font-bold shadow-xs'
                          : !isAvailable
                          ? 'border-gray-200 text-gray-300 line-through bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 text-gray-700 hover:border-black/50 bg-[#F9F9F8]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Stock Status Indicator */}
              <div className="text-xs font-mono pt-1">
                {isOutOfStock ? (
                  <span className="text-red-600 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Currently Out of Stock for {currentSize}
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Hurry, Only {availableStock} left in stock!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock — Ready to dispatch in 24 hours
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-mono uppercase text-gray-500">QUANTITY:</span>
              <div className="flex items-center border border-gray-300 bg-[#F9F9F8]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-mono font-semibold text-[#111827]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Action Buttons (Anchored and Ref'd for Sticky Header) */}
            <div ref={mainActionsRef} className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-6 text-xs uppercase tracking-[0.25em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-[#111827] hover:bg-[#936B34] text-white active:scale-[0.99]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-5 py-4 border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-mono tracking-wider uppercase ${
                    isWishlisted
                      ? 'border-[#936B34] bg-[#936B34]/15 text-[#936B34]'
                      : 'border-gray-300 text-gray-700 hover:border-[#111827] bg-[#F9F9F8]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#936B34]' : ''}`} />
                  <span className="hidden sm:inline">WISHLIST</span>
                </button>
              </div>
            </div>

            {/* DELIVERY & TAX SHIPMENT CALCULATOR THROUGH ZIPCODE */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#936B34]" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#111827] font-bold">
                    DELIVERY &amp; TAX SHIPMENT CALCULATOR
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase text-gray-500 bg-white border border-gray-200 px-2 py-0.5">
                  LIVE ZIPCODE RATES
                </span>
              </div>

              <p className="text-[11px] text-gray-500 font-sans">
                Enter your 5-digit US ZIP code to calculate real-time insured shipment carrier rates, estimated delivery schedule, and destination state sales tax.
              </p>

              {/* ZIP Code Input Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCalculateTaxAndShipment();
                }} 
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={5}
                    value={zipInput}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, '').slice(0, 5);
                      setZipInput(clean);
                      if (clean.length === 5) {
                        setZipError('');
                        handleCalculateTaxAndShipment(clean);
                      }
                    }}
                    placeholder="Enter 5-digit US ZIP Code (e.g. 10001, 90210, 75001)"
                    className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#111827] placeholder:text-gray-400"
                  />
                  {zipInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setZipInput('');
                        setZipEstimate(null);
                        setZipError('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-mono"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isCalculatingZip}
                  className="px-5 py-2.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isCalculatingZip ? 'CALCULATING...' : 'CALCULATE'}
                </button>
              </form>

              {/* Quick ZIP Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-mono uppercase text-gray-400 mr-1">Popular:</span>
                {[
                  { label: 'New York (10001)', zip: '10001' },
                  { label: 'Beverly Hills (90210)', zip: '90210' },
                  { label: 'Dallas (75001)', zip: '75001' },
                  { label: 'Miami (33101)', zip: '33101' },
                  { label: 'Seattle (98101)', zip: '98101' }
                ].map((chip) => (
                  <button
                    key={chip.zip}
                    type="button"
                    onClick={() => {
                      setZipInput(chip.zip);
                      handleCalculateTaxAndShipment(chip.zip);
                    }}
                    className={`text-[10px] font-mono px-2 py-0.5 border transition-colors cursor-pointer ${
                      zipEstimate?.zip === chip.zip
                        ? 'border-[#936B34] bg-[#936B34]/10 text-[#936B34] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {zipError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{zipError}</span>
                </div>
              )}

              {/* Live Tax and Shipment Results for ZIP Code */}
              {zipEstimate && (
                <div className="p-4 bg-white border border-gray-200 space-y-3.5 text-xs font-mono shadow-xs">
                  {/* Destination & Service Status */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div>
                      <span className="text-gray-500 text-[11px] block">DELIVERY DESTINATION:</span>
                      <strong className="text-[#111827] text-sm font-semibold">
                        {zipEstimate.stateName} ({zipEstimate.stateCode}) · ZIP {zipEstimate.zip}
                      </strong>
                    </div>
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 font-semibold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      DISPATCH ACTIVE
                    </span>
                  </div>

                  {/* Shipment Methods Calculated for this ZIP Code */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">
                      CALCULATED SHIPMENT RATES FOR ZIP {zipEstimate.zip}:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Standard Insured Delivery */}
                      <div
                        onClick={() => setSelectedShippingSpeed('standard')}
                        className={`p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedShippingSpeed === 'standard'
                            ? 'border-[#111827] bg-[#F9F9F8] ring-1 ring-[#111827]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#111827]">
                            <Truck className="w-3.5 h-3.5 text-[#936B34]" />
                            <span>Standard Insured</span>
                          </div>
                          <span className={`text-xs font-semibold ${zipEstimate.standardShippingFee === 0 ? 'text-emerald-700' : 'text-[#111827]'}`}>
                            {zipEstimate.standardShippingFee === 0 ? 'FREE' : `$${zipEstimate.standardShippingFee.toFixed(2)}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 font-sans">
                          {zipEstimate.standardShippingCarrier}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-700">
                          <span>Est. Arrival:</span>
                          <strong className="text-[#111827]">{zipEstimate.standardDeliveryDate}</strong>
                        </div>
                      </div>

                      {/* Express Priority Air */}
                      <div
                        onClick={() => setSelectedShippingSpeed('express')}
                        className={`p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedShippingSpeed === 'express'
                            ? 'border-[#111827] bg-[#F9F9F8] ring-1 ring-[#111827]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#111827]">
                            <Clock className="w-3.5 h-3.5 text-[#936B34]" />
                            <span>Express Air Priority</span>
                          </div>
                          <span className="text-xs font-semibold text-[#111827]">
                            +${zipEstimate.expressShippingFee.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 font-sans">
                          {zipEstimate.expressShippingCarrier}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-700">
                          <span>Est. Arrival:</span>
                          <strong className="text-[#111827]">{zipEstimate.expressDeliveryDate}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statutory State Sales Tax Details Calculated for ZIP */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#936B34]" />
                        <span>Statutory Sales Tax for {zipEstimate.stateName} ({zipEstimate.taxRateFormatted}):</span>
                      </span>
                      <strong className="text-[#936B34]">
                        {zipEstimate.isTaxExempt ? 'Exempt / $0.00' : `+$${zipEstimate.estimatedTax.toFixed(2)}`}
                      </strong>
                    </div>

                    {zipEstimate.notes && (
                      <div className="text-[10px] text-gray-500 font-sans italic bg-gray-50 p-2 border border-gray-100">
                        {zipEstimate.notes}
                      </div>
                    )}
                  </div>

                  {/* Full Order & Tax Shipment Breakdown to ZIP */}
                  <div className="pt-3 border-t border-gray-200 bg-[#FBFBFA] p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-gray-600 text-[11px]">
                      <span>Garment Subtotal ({quantity} {quantity === 1 ? 'item' : 'items'}):</span>
                      <span>${(product.price * quantity).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-[11px]">
                      <span>
                        Shipment ({selectedShippingSpeed === 'express' ? 'Express Air' : 'Standard Ground'} to {zipEstimate.zip}):
                      </span>
                      <span className={selectedShippingSpeed === 'standard' && zipEstimate.standardShippingFee === 0 ? 'text-emerald-700 font-semibold' : ''}>
                        {selectedShippingSpeed === 'express' 
                          ? `+$${zipEstimate.expressShippingFee.toFixed(2)}` 
                          : (zipEstimate.standardShippingFee === 0 ? 'FREE' : `+$${zipEstimate.standardShippingFee.toFixed(2)}`)}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-600 text-[11px]">
                      <span>Sales Tax ({zipEstimate.stateCode}):</span>
                      <span>{zipEstimate.isTaxExempt ? '$0.00' : `+$${zipEstimate.estimatedTax.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between items-baseline font-bold text-[#111827] pt-2 border-t border-gray-200 text-sm">
                      <span>ESTIMATED TOTAL DELIVERED:</span>
                      <span className="text-[#936B34] text-base">
                        ${selectedShippingSpeed === 'express' ? zipEstimate.totalWithExpress.toFixed(2) : zipEstimate.totalWithStandard.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Assurance Badges - NO COD */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 text-[11px] font-mono text-gray-600">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#936B34] shrink-0" />
                  <span>15 Days Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#936B34] shrink-0" />
                  <span>100% Genuine Atelier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#936B34] shrink-0" />
                  <span>Insured Courier Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#936B34] shrink-0" />
                  <span>Master Tailoring Guarantee</span>
                </div>
              </div>
            </div>

            {/* GIFTING & PERSONALIZED MESSAGE (Screenshot 2 & 3) */}
            <div className="border border-gray-200 bg-[#F9F9F8] p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGiftOptionEnabled(!isGiftOptionEnabled)}>
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-[#936B34]" />
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#111827] font-bold">
                      GIFTING &amp; LUXURY PACKAGING
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans">
                      Add complimentary presentation packaging &amp; handwritten card
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isGiftOptionEnabled}
                  onChange={(e) => setIsGiftOptionEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#111827] focus:ring-[#936B34] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {isGiftOptionEnabled && (
                <div className="pt-3 border-t border-gray-200 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-600 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={giftRecipient}
                      onChange={(e) => setGiftRecipient(e.target.value)}
                      placeholder="e.g. Alexander Hamilton"
                      className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#111827]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-mono uppercase text-gray-600">
                        Personalized Handwritten Note
                      </label>
                      <span className="text-[10px] font-mono text-gray-400">
                        {giftMessage.length} / 200
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Enter your personalized congratulatory note..."
                      className="w-full bg-white border border-gray-300 p-2.5 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#111827]"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 p-2 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Complimentary signature black magnetic box &amp; wax-sealed card attached.</span>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS & SPECIFICATIONS ACCORDIONS (Screenshot 3 & 4) */}
            <div className="border border-gray-200 divide-y divide-gray-200">
              
              {/* Accordion 1: Product Description */}
              <div>
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full p-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-[#111827] font-bold">
                    PRODUCT DESCRIPTION &amp; HIGHLIGHTS
                  </span>
                  {openSections.description ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.description && (
                  <div className="p-4 pt-1 bg-white space-y-3.5 text-xs text-gray-600 leading-relaxed">
                    <p className="font-light">
                      {product.description || 'Expertly structured from certified premium natural fibers, this piece exhibits impeccable sartorial balance, a flattering silhouette, and hand-finished pick stitching across all primary seams.'}
                    </p>

                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-mono uppercase text-[#111827] font-semibold block">
                        KEY HIGHLIGHTS
                      </span>
                      <ul className="space-y-1.5 text-xs font-sans text-gray-700">
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#936B34] shrink-0 mt-0.5" />
                          <span>Constructed with genuine floating interior canvas for natural body-contouring drape.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#936B34] shrink-0 mt-0.5" />
                          <span>Natural horn / mother-of-pearl buttons with reinforced cross-stitching.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#936B34] shrink-0 mt-0.5" />
                          <span>Breathable, wrinkle-resistant luxury weave designed for all-day comfort.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#936B34] shrink-0 mt-0.5" />
                          <span>Handcrafted by master artisans adhering to century-old sartorial standards.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Product Specifications Table */}
              <div>
                <button
                  onClick={() => toggleSection('specifications')}
                  className="w-full p-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-[#111827] font-bold">
                    GARMENT SPECIFICATIONS
                  </span>
                  {openSections.specifications ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.specifications && (
                  <div className="p-4 pt-1 bg-white">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-mono">
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Fit</span>
                        <strong className="text-[#111827]">{product.fit || 'Tailored Slim Fit'}</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Fabric</span>
                        <strong className="text-[#111827]">{product.fabric || 'Superfine Natural Fiber Blend'}</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Pattern</span>
                        <strong className="text-[#111827]">Solid / Micro-Texture</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Collar / Lapel</span>
                        <strong className="text-[#111827]">Notched / Spread Standard</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Sleeve</span>
                        <strong className="text-[#111827]">Full Length / Mitered Cuffs</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Occasion</span>
                        <strong className="text-[#111827]">Formal / Evening / Executive</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Hemline</span>
                        <strong className="text-[#111827]">Curved Tail Hem</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Wash Care</span>
                        <strong className="text-[#111827]">Professional Dry Clean Only</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Country of Origin</span>
                        <strong className="text-[#111827]">Handcrafted in Atelier (USA)</strong>
                      </div>
                      <div className="border-b border-gray-100 pb-2">
                        <span className="text-gray-400 block text-[10px] uppercase">Style Code / SKU</span>
                        <strong className="text-[#936B34]">{product.sku}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Master Tailoring & Alteration Guarantee */}
              <div>
                <button
                  onClick={() => toggleSection('tailoring')}
                  className="w-full p-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-[#111827] font-bold">
                    MASTER TAILORING &amp; ALTERATIONS
                  </span>
                  {openSections.tailoring ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.tailoring && (
                  <div className="p-4 pt-1 bg-white space-y-2 text-xs text-gray-600 leading-relaxed font-light">
                    <p>
                      Every Park Avenue garment order includes complimentary master tailor consultation. Sleeve shortening/lengthening and trouser inseam hemming can be requested online or at any flagship boutique.
                    </p>
                    <p className="font-mono text-[11px] text-[#936B34]">
                      Track your alteration progress anytime via the Track Alteration portal with your Alteration ID.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Insured Shipment & Return Policy */}
              <div>
                <button
                  onClick={() => toggleSection('returns')}
                  className="w-full p-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-[#111827] font-bold">
                    INSURED SHIPMENT &amp; 15-DAY RETURNS
                  </span>
                  {openSections.returns ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.returns && (
                  <div className="p-4 pt-1 bg-white space-y-2 text-xs text-gray-600 leading-relaxed font-light">
                    <p>
                      <strong>Atelier Courier Dispatch:</strong> All garments are packaged in breathable cedar travel covers and dispatched via insured FedEx or UPS with dedicated tracking number assigned upon quality inspection.
                    </p>
                    <p>
                      <strong>Return &amp; Exchange Guarantee:</strong> We accept complimentary returns and size exchanges within 15 days of delivery. Items must remain in their original unworn condition with atelier security seals intact.
                    </p>
                    <p className="font-mono text-[11px] text-[#936B34]">
                      Complimentary reverse courier pickup will be coordinated directly from your residence upon submitting a return request.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* COMPLETE THE LOOK / SIMILAR RECOMMENDATIONS (Screenshot 4) */}
        {complementaryProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-10 border-t border-gray-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#936B34] block mb-1 font-semibold">
                  CURATED SARTORIAL WARDROBE
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] uppercase tracking-wider font-light">
                  COMPLETE THE LOOK
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-mono uppercase tracking-widest text-gray-600 hover:text-[#111827] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto font-medium"
              >
                <span>VIEW FULL CATALOG</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {complementaryProducts.map((comp) => {
                const compImg = comp.images?.[0] || categoryImageMap[comp.category];
                return (
                  <div
                    key={comp.id}
                    onClick={() => navigateToProduct(comp.sku || comp.id, comp.category)}
                    className="group bg-white border border-gray-200 hover:border-[#111827] transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                  >
                    <div className="relative aspect-[3/4] bg-[#F8F9FA] overflow-hidden">
                      {compImg ? (
                        <img
                          src={compImg}
                          alt={comp.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <MediaPlaceholder
                          label="PARK AVENUE"
                          category={comp.category}
                          aspectRatio="auto"
                          className="w-full h-full"
                          subtext={comp.name}
                        />
                      )}
                      <div className="absolute top-2.5 left-2.5 bg-white/90 px-2 py-0.5 text-[9px] font-mono uppercase text-gray-700 tracking-wider">
                        {comp.category}
                      </div>
                    </div>
                    <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
                      <div>
                        <h4 className="font-serif text-sm text-[#111827] font-normal uppercase group-hover:text-[#936B34] transition-colors line-clamp-1">
                          {comp.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {comp.fabric || 'Superfine Natural Fiber'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-semibold font-mono text-[#111827]">
                          ${comp.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-[#936B34] uppercase tracking-wider group-hover:underline">
                          VIEW STYLING
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM ACTION BAR ON MOBILE (Smooth Peter England Mobile Experience) */}
      <div 
        className={`fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 p-3 sm:hidden transition-transform duration-300 shadow-2xl ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-[#111827] block tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-mono truncate block">
              {currentSize} • {currentColor}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="px-5 py-2.5 bg-[#111827] text-white hover:bg-[#936B34] text-xs font-mono uppercase tracking-widest font-bold shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10 cursor-pointer"
            aria-label="Close zoom modal"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-hidden flex items-center justify-center">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              />
            ) : (
              <div className="w-96 h-96 bg-gray-900 border border-gray-700 flex items-center justify-center text-white font-mono text-sm">
                HIGH RESOLUTION ATELIER MASTER
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
};
