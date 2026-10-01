import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, FileText } from 'lucide-react';
import { BANNER_SLIDES } from '../data/mockData';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface HeroSliderProps {
  onSelectSlide: (slideId: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectSlide }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

  const slideDuration = 6000; // 6 seconds

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, slideDuration);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  // Touch handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      if (diff < -40) {
        nextSlide();
      } else if (diff > 40) {
        prevSlide();
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  const current = BANNER_SLIDES[currentSlide];

  return (
    <section
      className="relative w-full bg-[#1C1917] text-white border-b border-[#292524] overflow-hidden select-none touch-pan-y"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Animated Architectural Schematic Canvas */}
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      {/* Hero Visual Area ("1 VÀI ẢNH BANNER ĐẰNG SAU") */}
      <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] max-w-7xl mx-auto px-4 py-6 sm:py-10 flex flex-col justify-between z-10">
        
        {/* Top Wireframe Reference Tag & Slide Counter */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#DC2626]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-stone-300">
              CỔNG THÔNG TIN GIÁO DỤC ĐIỆN TỬ
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs text-stone-400">
            <span className="text-white font-bold text-sm">0{currentSlide + 1}</span>
            <span>/</span>
            <span>0{BANNER_SLIDES.length}</span>
          </div>
        </div>

        {/* Center Main Slide Content with Graphic Framing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center my-4 sm:my-6">
          
          {/* Left Text Block */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Tag / Category */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="bg-[#991B1B] text-white px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border-l-2 border-white">
                {current.tag}
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-stone-400">
                {current.date}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight uppercase max-w-2xl">
              {current.title}
            </h2>

            {/* Subtitle */}
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-stone-300 font-medium leading-relaxed max-w-xl">
              {current.subtitle}
            </p>

            {/* Abstract (Hidden on smallest mobile for cleanliness) */}
            <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg hidden md:block">
              {current.abstract}
            </p>

            {/* Action Buttons (Touch Friendly) */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => onSelectSlide(current.id)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all border border-[#EF4444]/40 shadow-xs cursor-pointer"
              >
                <span>Xem Chi Tiết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#tin-tuc"
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all border border-white/20 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-stone-300" />
                <span>Xem Tin Cụm Trường</span>
              </a>
            </div>
          </div>

          {/* Right Visual Frame: High Quality Architectural Educational Composition */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="border border-white/20 p-1.5 sm:p-2 bg-stone-900/60 shadow-xl">
              <EduImageFrame
                label="ẢNH BANNER ĐẰNG SAU"
                subLabel={current.tag}
                theme={currentSlide === 0 ? 'campus' : currentSlide === 1 ? 'exam' : 'lab'}
                aspectRatio="16:9"
                className="border-white/30"
              />
              
              {/* Sleek Metadata Bar underneath image */}
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-stone-400">
                <span>Văn phòng Ban Giám Hiệu</span>
                <span>Năm học 2026–2027</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Modern Slider Navigation Bar (Matching Wireframe Indicators `------`) */}
        <div className="border-t border-white/10 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Modern Slide Indicators (Dash progress bars) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {BANNER_SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className="group relative flex-1 sm:w-24 h-2.5 sm:h-2 bg-white/20 hover:bg-white/30 transition-all overflow-hidden cursor-pointer"
                  aria-label={`Slide ${idx + 1}`}
                >
                  {/* Dynamic Progress Fill if Active */}
                  <div
                    className={`h-full bg-[#EF4444] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Directional Controls (Sharp geometric buttons: touch friendly) */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <span className="text-[11px] font-mono text-stone-400 sm:hidden">
              Vuốt để đổi banner
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Slide trước"
                className="w-10 h-10 sm:w-9 sm:h-9 border border-white/20 hover:border-[#EF4444] bg-stone-900/80 hover:bg-[#991B1B] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Slide kế tiếp"
                className="w-10 h-10 sm:w-9 sm:h-9 border border-white/20 hover:border-[#EF4444] bg-stone-900/80 hover:bg-[#991B1B] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
