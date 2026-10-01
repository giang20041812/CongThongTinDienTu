import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Landmark } from 'lucide-react';
import { SCHOOL_SHOWCASE } from '../data/mockData';
import { SchoolHighlight } from '../types';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface SchoolShowcaseSectionProps {
  onSelectHighlight: (item: SchoolHighlight) => void;
}

export const SchoolShowcaseSection: React.FC<SchoolShowcaseSectionProps> = ({
  onSelectHighlight,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SCHOOL_SHOWCASE.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SCHOOL_SHOWCASE.length) % SCHOOL_SHOWCASE.length);
  };

  // Touch Handlers for Mobile Swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentX(currentX);
    const diff = currentX - touchStartX;
    // Dampen drag effect
    setDragOffset(Math.max(-150, Math.min(150, diff * 0.8)));
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 50; // pixels
      if (diff < -swipeThreshold) {
        nextSlide();
      } else if (diff > swipeThreshold) {
        prevSlide();
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  // Mouse Drag Handlers for Desktop Drag-to-Swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStartX(e.clientX);
    setTouchCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    setTouchCurrentX(e.clientX);
    const diff = e.clientX - touchStartX;
    setDragOffset(Math.max(-150, Math.min(150, diff * 0.8)));
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 50;
      if (diff < -swipeThreshold) {
        nextSlide();
      } else if (diff > swipeThreshold) {
        prevSlide();
      }
    }
    setIsDragging(false);
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  return (
    <section className="relative w-full py-10 sm:py-16 bg-[#F6F4EF] border-b border-[#E6E1D6] overflow-hidden">
      {/* Background Subtle Modern Dots and Schematics */}
      <BackgroundGeometricMesh variant="dots" className="opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Centered Headline from Wireframe: "Nhà trường" with accent underlines */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold">
            BẢN SẮC & TRUYỀN THỐNG
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
            Tin Nhà Trường
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
            <div className="w-8 sm:w-12 h-[2px] bg-[#991B1B]" />
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border border-[#991B1B] rotate-45 bg-[#FEF2F2]" />
            <div className="w-8 sm:w-12 h-[2px] bg-[#991B1B]" />
          </div>
        </div>

        {/* 3D Coverflow Carousel Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-[520px] sm:h-[580px] md:h-[620px] flex justify-center items-center perspective-[1200px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {SCHOOL_SHOWCASE.map((item, idx) => {
            // Calculate distance from active slide
            const diff = (idx - activeSlide + SCHOOL_SHOWCASE.length) % SCHOOL_SHOWCASE.length;
            let offset = diff;
            // E.g., if total is 3, diff=2 -> offset=-1 (left)
            if (diff > Math.floor(SCHOOL_SHOWCASE.length / 2)) {
              offset = diff - SCHOOL_SHOWCASE.length;
            }

            // Carousel calculations
            const baseTranslate = offset === 0 ? 0 : offset > 0 ? 75 : -75; // percentage of card width
            const scale = offset === 0 ? 1 : 0.85;
            const zIndex = offset === 0 ? 30 : 20 - Math.abs(offset);
            const opacity = offset === 0 ? 1 : 0.6;
            const blur = offset === 0 ? 'blur(0px)' : 'blur(1.5px)';
            
            // Drag effect is stronger on the active card
            const currentDragOffset = offset === 0 ? dragOffset : dragOffset * 0.5;
            
            const transform = `translateX(calc(${baseTranslate}% + ${currentDragOffset}px)) scale(${scale})`;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (offset === 1) nextSlide();
                  else if (offset === -1) prevSlide();
                  else if (offset === 0) onSelectHighlight(item);
                }}
                className={`absolute w-[88%] sm:w-[65%] md:w-[50%] lg:w-[42%] flex flex-col transition-all duration-500 ease-out cursor-pointer ${
                  offset === 0 
                    ? 'border-2 border-[#991B1B] bg-white shadow-xl' 
                    : 'border border-[#E2DDD3] bg-stone-50 shadow-md'
                }`}
                style={{
                  transform,
                  zIndex,
                  opacity,
                  filter: blur,
                }}
              >
                <div className={`p-4 sm:p-5 md:p-6 flex flex-col h-full ${offset !== 0 && 'pointer-events-none'}`}>
                  {/* Meta Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-widest px-2.5 py-1 uppercase transition-colors ${
                      offset === 0 ? 'bg-[#991B1B] text-white' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#991B1B] border border-stone-300 px-2 py-0.5 bg-white/95">
                      {item.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base sm:text-lg md:text-xl font-bold uppercase leading-snug line-clamp-3 transition-colors ${
                    offset === 0 ? 'text-[#1C1917]' : 'text-stone-700'
                  }`}>
                    {item.title}
                  </h3>

                  {/* Image Slot */}
                  <div className="relative mt-4 mb-4 flex-shrink-0">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel="Tiêu Điểm Nhà Trường"
                      theme={idx === 0 ? 'campus' : idx === 1 ? 'lab' : 'ceremony'}
                      aspectRatio="16:9"
                    />
                  </div>

                  {/* Excerpt */}
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Action Button for Active Slide */}
                  <div className={`mt-5 pt-4 border-t border-stone-200 transition-opacity duration-300 ${
                    offset === 0 ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="inline-flex items-center gap-1.5 text-[#991B1B] text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                      Xem Chi Tiết <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Controls / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-12 max-w-3xl mx-auto pt-4 border-t border-stone-200">
          
          {/* Dash Indicators */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            {SCHOOL_SHOWCASE.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Tin nhà trường số ${idx + 1}`}
                className={`h-2 transition-all cursor-pointer ${
                  activeSlide === idx
                    ? 'w-12 bg-[#991B1B]'
                    : 'w-4 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          {/* Directional Slide Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Xem tin trước"
                className="w-12 h-12 sm:w-10 sm:h-10 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Xem tin kế tiếp"
                className="w-12 h-12 sm:w-10 sm:h-10 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </section>
  );
};

