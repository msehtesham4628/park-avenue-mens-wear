import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface HeroSlide {
  src: string;
  title: string;
  subtitle: string;
  category: string;
  tag: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/Hero_image_0.png',
    title: 'Autumn / Winter Sartorial Collection',
    subtitle: 'Hand-Canvassed Italian Wool Suits & Formalwear',
    category: 'Suits',
    tag: 'Bespoke Atelier'
  },
  {
    src: '/Hero_image_1.png',
    title: 'The Modern Gentleman',
    subtitle: 'Precision Tailored Blazers, Coats & Refined Layers',
    category: 'Blazers & Jackets',
    tag: 'Signature Cut'
  },
  {
    src: '/Hero_image_2.png',
    title: 'Egyptian Cotton & Silk Dresswear',
    subtitle: 'Handcrafted Collars, French Cuffs & Sartorial Shirts',
    category: 'Shirts',
    tag: 'Finest Fabrics'
  },
  {
    src: '/Hero_image_3.png',
    title: 'Hand-Finished Cashmere & Outerwear',
    subtitle: 'Pure Cashmere Overcoats & Structured Outer Layers',
    category: 'Outerwear',
    tag: 'Luxury Craft'
  },
  {
    src: '/Hero_image_4.png',
    title: 'Handcrafted Footwear & Leathercraft',
    subtitle: 'Goodyear Welted Oxford Shoes & Artisanal Brogues',
    category: 'Footwear',
    tag: 'Master Shoemaker'
  },
  {
    src: '/Hero_image_5.png',
    title: 'Signature Park Avenue Accessories',
    subtitle: 'Pure Woven Silk Ties, Pocket Squares & Sterling Accents',
    category: 'Accessories',
    tag: 'Sartorial Details'
  }
];

export const Hero: React.FC = () => {
  const { openCategoryPage } = useShop();
  const [activeImage, setActiveImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Touch swipe support for mobile and tablet
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setActiveImage((current) => (current + 1) % HERO_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveImage((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = window.setInterval(handleNext, 5500);
    return () => window.clearInterval(timer);
  }, [isHovered, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  };

  // Touch gestures for mobile & tablet
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const scrollToNext = () => {
    const el = document.getElementById('category-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  const handleSlideCta = (categoryName: string) => {
    openCategoryPage(categoryName);
  };

  const currentSlide = HERO_SLIDES[activeImage];

  return (
    <section 
      className="relative w-full bg-[#0E1118] text-white overflow-hidden select-none border-none outline-none focus:outline-none focus:ring-0"
      aria-label="Park Avenue Menswear Collection Showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="region"
    >
      {/* 
        Container with generous responsive heights:
        - Mobile: h-[540px] xs:h-[580px] sm:h-[620px]
        - Tablet: md:h-[660px] lg:h-[720px]
        - Desktop: xl:h-[760px] 2xl:h-[800px]
        Guarantees hero images fit phones beautifully without being cut off or crushed!
      */}
      <div 
        className="relative w-full h-[540px] xs:h-[580px] sm:h-[620px] md:h-[660px] lg:h-[720px] xl:h-[760px] 2xl:h-[800px] flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Background Ambient Layer: Seamless blurred backdrop from current image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={`ambient-${slide.src}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.src}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center blur-2xl opacity-40 scale-110 brightness-75 saturate-125"
              />
            </div>
          ))}
          {/* Subtle luxury vignette gradients for text readability without harsh borders */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60" />
        </div>

        {/* Foreground Image Presentation: 100% Edge-to-Edge with Zero Black Borders */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-0">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === activeImage;
            return (
              <div
                key={slide.src}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
                  isActive 
                    ? 'opacity-100 scale-100 pointer-events-auto' 
                    : 'opacity-0 scale-[0.98] pointer-events-none'
                }`}
              >
                <img
                  src={slide.src}
                  alt={`${slide.title} - ${slide.subtitle}`}
                  className="w-full h-full object-cover object-top sm:object-center select-none transition-all duration-500"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Content & Slide Meta Overlay - Tailored for Phone & Desktop */}
        <div className="absolute bottom-12 sm:bottom-16 inset-x-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-xl mx-auto space-y-1.5 sm:space-y-2 p-3 sm:p-4 bg-black/50 backdrop-blur-md border border-white/10 rounded-xs shadow-xl pointer-events-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black/60 border border-white/15 rounded-full text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.25em] text-[#E5C384]">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#936B34]" />
              <span>{currentSlide.tag}</span>
            </div>
            
            <h1 className="font-serif text-base xs:text-lg sm:text-2xl md:text-3xl text-white tracking-wide uppercase leading-tight drop-shadow-md">
              {currentSlide.title}
            </h1>
            
            <p className="text-[11px] sm:text-xs text-gray-200/90 font-light tracking-wide line-clamp-2 drop-shadow-sm">
              {currentSlide.subtitle}
            </p>

            <div className="pt-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => handleSlideCta(currentSlide.category)}
                className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-white/95 hover:bg-[#936B34] text-black hover:text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md cursor-pointer rounded-xs active:scale-95"
              >
                <span>Explore {currentSlide.category}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-3 sm:gap-4 px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === activeImage;
              return (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-1.5 sm:h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    isActive 
                      ? 'w-7 sm:w-10 bg-[#936B34] shadow-[0_0_8px_rgba(147,107,52,0.8)]' 
                      : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollToNext}
            aria-label="Scroll down to collection"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-[#936B34] text-white/80 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Scroll to collections"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
