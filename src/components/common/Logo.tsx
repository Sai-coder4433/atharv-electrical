import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  // Responsive height classes maintaining exact original aspect ratio
  const imgHeightClass =
    size === 'sm'
      ? 'h-8 sm:h-9'
      : size === 'lg'
      ? 'h-12 sm:h-14'
      : 'h-10 sm:h-11 md:h-12';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official ATHARV ELECTRICAL Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="https://i.postimg.cc/pLmDNdQ8/Whats-App-Image-2026-09-27-at-18-49-05.jpg"
          alt="ATHARV ELECTRICAL"
          className={`${imgHeightClass} w-auto object-contain rounded-md shadow-xs`}
          loading="eager"
        />
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-heading font-black tracking-tight ${
            size === 'sm'
              ? 'text-sm sm:text-base'
              : size === 'lg'
              ? 'text-xl sm:text-2xl'
              : 'text-base sm:text-lg md:text-xl'
          } ${isDark ? 'text-white' : 'text-[#171717]'}`}
        >
          ATHARV ELECTRICAL
        </span>
        <span
          className={`font-semibold tracking-wider uppercase mt-0.5 ${
            size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[11px]' : 'text-[10px]'
          } ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
        >
          Chakan · Pune
        </span>
      </div>
    </div>
  );
};
