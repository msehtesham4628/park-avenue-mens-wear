import React, { useState, useEffect } from 'react';
import { ArrowRight, Scissors } from 'lucide-react';

interface WelcomeCurtainProps {
  onComplete?: () => void;
}

export const WelcomeCurtain: React.FC<WelcomeCurtainProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if user has already entered in this session
    const hasSeen = sessionStorage.getItem('pa_welcome_seen');
    if (hasSeen === 'true') {
      setIsVisible(false);
    } else {
      startWelcomeSequence();
    }

    const handleReplay = () => {
      sessionStorage.removeItem('pa_welcome_seen');
      startWelcomeSequence();
    };

    window.addEventListener('pa_replay_welcome', handleReplay);
    return () => window.removeEventListener('pa_replay_welcome', handleReplay);
  }, []);

  const startWelcomeSequence = () => {
    setIsFadingOut(false);
    setProgress(0);
    setIsVisible(true);

    const startTime = Date.now();
    const duration = 2000; // 2.0 seconds luxury pacing

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleDismiss();
        }, 300);
      }
    }, 25);
  };

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sessionStorage.setItem('pa_welcome_seen', 'true');
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 700);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to Park Avenue Menswear"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-[#111827] transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Architectural Suiting Drafting Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle chalk pinstripe grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.8) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient warm champagne illumination */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#FAF8F5] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[300px] bg-[#936B34]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Outer framing borders */}
        <div className="absolute inset-4 sm:inset-8 border border-black/5 pointer-events-none" />
        <div className="absolute inset-6 sm:inset-10 border border-[#936B34]/25 pointer-events-none" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Atelier Crest Monogram */}
        <div className="mb-6 relative animate-in fade-in duration-700">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border border-[#936B34] bg-white shadow-xl flex items-center justify-center relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border border-[#936B34]/30 flex items-center justify-center">
              <span className="font-serif text-2xl sm:text-3xl text-[#111827] tracking-widest font-normal">
                PA
              </span>
            </div>
            {/* Corner registration ticks */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#936B34]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#936B34]" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#936B34]" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#936B34]" />
          </div>
        </div>

        {/* Brand Pre-title */}
        <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-[#936B34] mb-3">
          <span>BESPOKE SARTORIAL ATELIER</span>
          <span className="text-gray-300">·</span>
          <span>ESTABLISHED TAILORING</span>
        </div>

        {/* Primary Welcome Title */}
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#111827] font-light uppercase tracking-[0.14em] leading-tight mb-4">
          WELCOME TO<br />
          <span className="font-normal text-[#936B34]">PARK AVENUE MENSWEAR</span>
        </h1>

        {/* Supporting Brand Motto */}
        <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-[0.25em] font-sans font-light max-w-md mx-auto leading-relaxed mb-8">
          The New Standard of American Tailoring &amp; Luxury Craftsmanship
        </p>

        {/* Atelier Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-700 mb-10">
          <span className="px-3.5 py-1.5 bg-white border border-gray-200 shadow-xs">Full Canvas Suits</span>
          <span className="px-3.5 py-1.5 bg-white border border-gray-200 shadow-xs">Bespoke Alterations</span>
          <span className="px-3.5 py-1.5 bg-white border border-gray-200 shadow-xs">Flagship Atelier</span>
        </div>

        {/* Tailor's Thread Progress Line */}
        <div className="w-64 sm:w-80 mx-auto space-y-2 mb-8">
          <div className="h-[2px] w-full bg-gray-200 overflow-hidden relative">
            <div
              className="h-full bg-[#936B34] transition-all duration-75 ease-out shadow-[0_0_10px_#936B34]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#936B34] tracking-widest">
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3 h-3" />
              <span>PREPARING ATELIER</span>
            </span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Skip / Enter Immediately Button */}
        <button
          onClick={handleDismiss}
          className="group px-8 py-3.5 bg-[#111827] hover:bg-[#936B34] text-white text-xs font-mono font-semibold uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-lg"
        >
          <span>ENTER ATELIER</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>

      </div>

      {/* Bottom Legal / Origin Note */}
      <div className="absolute bottom-6 inset-x-0 text-center text-[10px] font-mono uppercase tracking-[0.25em] text-gray-400">
        PARK AVENUE MENSWEAR · BESPOKE SUITING &amp; LUXURY APPAREL
      </div>
    </div>
  );
};
