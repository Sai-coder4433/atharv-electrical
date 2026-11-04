import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, ShieldCheck, Truck, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroCarousel: React.FC = () => {
  const {
    heroBanners,
    setSelectedCategory,
    setSelectedBrand,
    setCustomerView,
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);

  const activeBanners = heroBanners.filter((b) => b.active);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const handleCtaClick = (banner: (typeof activeBanners)[0]) => {
    if (banner.categoryFilter) {
      setSelectedCategory(banner.categoryFilter);
    }
    if (banner.brandFilter) {
      setSelectedBrand(banner.brandFilter as any);
    }
    setCustomerView('shop');
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  // Touch Swipe Handlers for Mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchCurrentXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchCurrentXRef.current === null) return;
    const diff = touchStartXRef.current - touchCurrentXRef.current;
    const minSwipeDistance = 40; // minimum pixels to count as swipe

    if (diff > minSwipeDistance) {
      // Swiped Left -> Next
      handleNextSlide();
    } else if (diff < -minSwipeDistance) {
      // Swiped Right -> Prev
      handlePrevSlide();
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  return (
    <div
      className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 pt-1 sm:pt-3 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 
        Responsive Carousel Frame:
        - Mobile: h-[210px] xs:h-[235px] (comfortable height for headline + description + CTA without overflow or squishing)
        - Tablet: sm:h-[300px] sm:aspect-[2.4/1]
        - Desktop: lg:h-[380px] lg:aspect-[3/1]
      */}
      <div className="relative w-full h-[210px] xs:h-[235px] sm:h-[290px] md:h-[340px] lg:h-[390px] rounded-2xl overflow-hidden shadow-xs border border-[#EAEAEA] bg-[#F8F8F7] select-none">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentSlide;
          const isGraphicBanner = banner.hideTextOverlay;
          return (
            <div
              key={banner.id}
              onClick={() => isGraphicBanner && handleCtaClick(banner)}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isGraphicBanner ? 'cursor-pointer' : ''
              } ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* Image Backdrop */}
              <div className="absolute inset-0 bg-neutral-900/5">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-right sm:object-center transform transition-transform duration-1000 scale-100"
                />
                {/* Soft directional scrim for text legibility - perfectly tuned for mobile & desktop */}
                {!isGraphicBanner && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 sm:via-white/90 to-transparent max-w-[85%] xs:max-w-[78%] sm:max-w-xl md:max-w-2xl" />
                )}
              </div>

              {/* Slide Content Overlay */}
              {!isGraphicBanner && (
                <div className="relative h-full flex flex-col justify-center px-4 xs:px-6 sm:px-10 md:px-14 max-w-[78%] xs:max-w-[74%] sm:max-w-lg md:max-w-xl z-20">
                  {/* Brand kicker pill badge */}
                  <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50/90 border border-orange-200/60 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FF6A00] shadow-2xs">
                      <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-[#FF8A00] fill-[#FF8A00]" />
                      {banner.brandTag}
                    </span>
                  </div>

                  {/* Main Heading */}
                  <h2 className="font-heading text-sm xs:text-base sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight leading-tight sm:leading-snug">
                    {banner.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-[11px] xs:text-xs sm:text-sm text-[#555555] mt-1 sm:mt-1.5 line-clamp-2 max-w-sm sm:max-w-md font-medium leading-relaxed">
                    {banner.subtitle}
                  </p>

                  {/* CTA Button with ATHARV Gradient */}
                  <div className="mt-2.5 xs:mt-3 sm:mt-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCtaClick(banner);
                      }}
                      className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-lg xs:rounded-xl text-white font-bold text-[11px] xs:text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 group"
                      style={{
                        background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
                      }}
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Graphic Banner Indicator Pill on Mobile */}
              {isGraphicBanner && (
                <div className="absolute bottom-2.5 right-3 z-20 sm:hidden bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-medium">
                  Tap to view →
                </div>
              )}
            </div>
          );
        })}

        {/* Desktop Carousel Arrow Controls (hidden on small mobile to avoid text overlapping; mobile uses touch swipe) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevSlide();
          }}
          className="hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 backdrop-blur-xs"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextSlide();
          }}
          className="hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 backdrop-blur-xs"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Clean Indicator Dots Below Carousel */}
      <div className="flex items-center justify-center gap-1.5 pt-2 sm:pt-2.5">
        {activeBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'w-6 bg-[#FF6A00]'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Mobile Trust Strip Below Banner */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 px-1 text-center sm:hidden">
        <div className="flex items-center justify-center gap-1 py-1.5 px-1 bg-neutral-50 rounded-lg border border-neutral-100 text-[10px] text-gray-700 font-medium">
          <ShieldCheck className="w-3 h-3 text-[#FF8A00] shrink-0" />
          <span className="truncate">100% Genuine</span>
        </div>
        <div className="flex items-center justify-center gap-1 py-1.5 px-1 bg-neutral-50 rounded-lg border border-neutral-100 text-[10px] text-gray-700 font-medium">
          <Truck className="w-3 h-3 text-[#FF8A00] shrink-0" />
          <span className="truncate">Fast Delivery</span>
        </div>
        <div className="flex items-center justify-center gap-1 py-1.5 px-1 bg-neutral-50 rounded-lg border border-neutral-100 text-[10px] text-gray-700 font-medium">
          <Store className="w-3 h-3 text-[#FF8A00] shrink-0" />
          <span className="truncate">Chakan Store</span>
        </div>
      </div>
    </div>
  );
};
