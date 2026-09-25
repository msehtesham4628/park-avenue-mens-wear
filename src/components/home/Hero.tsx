import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HERO_IMAGES = ['/Hero_image_0.png','/Hero_image_1.png','/Hero_image_2.png','/Hero_image_3.png','/Hero_image_4.png'];

export const Hero: React.FC = () => {
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % HERO_IMAGES.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollToNext = () => {
    const el = document.getElementById('category-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[96vh] flex flex-col items-center justify-center overflow-hidden bg-[#FAF8F5] pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <img key={image} src={image} alt="Park Avenue Menswear"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === activeImage ? 'opacity-100' : 'opacity-0'}`}
            fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} />
        ))}
      </div>
      <div className="absolute bottom-16 z-10 flex items-center gap-2">
        {HERO_IMAGES.map((image, index) => (
          <button key={image} type="button" aria-label={`Show hero image ${index + 1}`} onClick={() => setActiveImage(index)}
            className={`h-1.5 transition-all duration-300 ${index === activeImage ? 'w-8 bg-[#936B34]' : 'w-2 bg-white/80'}`} />
        ))}
      </div>
      <button onClick={scrollToNext} aria-label="Scroll to collection"
        className="absolute bottom-4 z-10 w-10 h-10 rounded-full border border-gray-300 hover:border-[#936B34] bg-white/90 text-[#936B34] hover:text-black transition-all flex items-center justify-center shadow-sm cursor-pointer">
        <ChevronDown className="w-4 h-4" />
      </button>
    </section>
  );
};