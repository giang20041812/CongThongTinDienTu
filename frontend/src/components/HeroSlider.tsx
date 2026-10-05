import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import schoolLogo from '../assets/logo.jpg';
import banner1 from '../assets/bannger.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.png';
import { motion, AnimatePresence } from 'motion/react';

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
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-[#F3F3F3] border-b border-[#B8D3E2] overflow-hidden select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
        <div className="relative overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent z-10 pointer-events-none"></div>
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSlide}
              src={banners[currentSlide]} 
              alt={`Banner trường ${currentSlide + 1}`} 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover" 
            />
          </AnimatePresence>

          <div className="absolute left-3 top-3 sm:left-6 sm:top-6 z-20 flex items-center gap-3 sm:gap-5 glass-card px-4 py-3 sm:px-6 sm:py-4 rounded-xl hover-lift">
            <img src={schoolLogo} alt="Logo trường" className="w-14 h-14 sm:w-20 sm:h-20 object-contain rounded-lg bg-white p-1" />
            <div className="sr-only sm:not-sr-only">
              <div className="text-[10px] sm:text-xs font-bold text-[#ff9900] uppercase tracking-wider">{SCHOOL_INFO.secondaryName}</div>
              <h1 className="text-sm sm:text-lg md:text-2xl font-extrabold tracking-tight text-gradient leading-tight uppercase drop-shadow-sm">{SCHOOL_INFO.name}</h1>
            </div>
          </div>

          <button onClick={prevSlide} aria-label="Ảnh trước" className="absolute z-20 left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm hover:bg-[#0052cc] text-[#0052cc] hover:text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110">
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 ml-[-2px]" />
          </button>
          <button onClick={nextSlide} aria-label="Ảnh tiếp theo" className="absolute z-20 right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 backdrop-blur-sm hover:bg-[#0052cc] text-[#0052cc] hover:text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110">
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 mr-[-2px]" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center gap-2 px-4 py-2 glass-card rounded-full">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Chuyển ảnh ${index + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === index
                    ? 'w-10 bg-gradient-brand shadow-md'
                    : 'w-3 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
