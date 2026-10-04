import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import schoolLogo from '../assets/logo.jpg';
import banner1 from '../assets/bannger.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.png';

const banners = [banner1, banner2, banner3];

interface HeroSliderProps {
  onSelectSlide: (slideId: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0].clientX);
    setTouchCurrentX(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => setTouchCurrentX(event.touches[0].clientX);

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const distance = touchCurrentX - touchStartX;
      if (distance < -40) nextSlide();
      if (distance > 40) prevSlide();
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  const currentTheme = currentSlide === 0 ? 'campus' : currentSlide === 1 ? 'exam' : 'lab';

  return (
    <section
      className="relative w-full bg-[#F3F3F3] border-b border-[#B8D3E2] overflow-hidden select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
        <div className="relative overflow-hidden border border-[#B8D3E2] bg-white shadow-sm">
          <img src={banners[currentSlide]} alt={`Banner trường ${currentSlide + 1}`} className="w-full h-auto max-h-[500px] object-cover transition-opacity duration-500" />

          <div className="absolute left-3 top-3 sm:left-5 sm:top-5 z-10 flex items-center gap-2 sm:gap-4 bg-white/90 px-3 py-2 sm:px-5 sm:py-3 shadow-sm">
            <img src={schoolLogo} alt="Logo trường" className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
            <div className="sr-only sm:not-sr-only">
              <div className="text-[10px] sm:text-xs font-semibold text-black uppercase tracking-wider">{SCHOOL_INFO.secondaryName}</div>
              <h1 className="text-sm sm:text-lg md:text-2xl font-extrabold tracking-tight text-black leading-tight uppercase">{SCHOOL_INFO.name}</h1>
            </div>
          </div>

          <button onClick={prevSlide} aria-label="Ảnh trước" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#0B78B5]/90 hover:bg-[#075F91] text-white flex items-center justify-center cursor-pointer">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button onClick={nextSlide} aria-label="Ảnh tiếp theo" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#0B78B5]/90 hover:bg-[#075F91] text-white flex items-center justify-center cursor-pointer">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-white/85 rounded-sm">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Chuyển ảnh ${index + 1}`}
                className={`h-2 transition-all cursor-pointer ${
                  currentSlide === index
                    ? 'w-10 bg-[#003087]'
                    : 'w-4 bg-[#c5d3ec] hover:bg-[#9aabd4]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
