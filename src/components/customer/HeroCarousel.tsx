import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap } from 'lucide-react';
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

  return (
    <div
      className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Compact Carousel Container (220-300px Desktop, 150-185px Mobile) */}
      <div className="relative h-[160px] sm:h-[220px] md:h-[280px] lg:h-[300px] w-full rounded-2xl overflow-hidden shadow-sm border border-[#EAEAEA] bg-[#F8F8F7]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image Backdrop with subtle warm tone */}
              <div className="absolute inset-0 bg-neutral-900/10">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-100"
                />
                {/* Soft directional scrim for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent max-w-xl sm:max-w-2xl" />
              </div>

              {/* Slide Content Overlay */}
              <div className="relative h-full flex flex-col justify-center px-5 sm:px-10 md:px-14 max-w-lg z-20">
                {/* Brand kicker */}
                <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                    <Zap className="w-3 h-3 text-[#FF8A00] fill-[#FF8A00]" />
                    {banner.brandTag}
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight leading-tight sm:leading-snug">
                  {banner.title}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#666666] mt-1 sm:mt-1.5 line-clamp-2 max-w-sm sm:max-w-md font-medium">
                  {banner.subtitle}
                </p>

                {/* CTA Button with ATHARV Gradient */}
                <div className="mt-3 sm:mt-5">
                  <button
                    onClick={() => handleCtaClick(banner)}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 group"
                    style={{
                      background: 'linear-gradient(135deg, #FFB000 0%, #FF8A00 38%, #FF6A00 68%, #F4511E 100%)',
                    }}
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Arrow Controls */}
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
          }
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-[#171717] shadow-sm flex items-center justify-center transition-all opacity-70 hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
          }
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-[#171717] shadow-sm flex items-center justify-center transition-all opacity-70 hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Compact Indicator Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
