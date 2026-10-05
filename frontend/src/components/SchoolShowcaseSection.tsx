import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Landmark } from 'lucide-react';
import { SchoolHighlight } from '../types';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';
import { usePosts } from '../api';

interface SchoolShowcaseSectionProps {
  onSelectHighlight: (item: SchoolHighlight) => void;
}

export const SchoolShowcaseSection: React.FC<SchoolShowcaseSectionProps> = ({
  onSelectHighlight
}) => {
  const { data: posts, loading } = usePosts();
  const showcaseList = posts.slice(0, 3).map((p: any) => ({
    id: p.id,
    title: p.title,
    date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
    tag: p.category?.name || 'TIN NỔI BẬT',
    summary: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    stats: { label: 'Xem', value: '100+' },
    content: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    imageUrl: p.imgUrl || p.imageUrl
  }));
  const displayShowcase = showcaseList.length > 0 ? showcaseList : [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    if (displayShowcase.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % displayShowcase.length);
  };

  const prevSlide = () => {
    if (displayShowcase.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + displayShowcase.length) % displayShowcase.length);
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
    setDragOffset(Math.max(-150, Math.min(150, diff * 0.8)));
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 50;
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
    <section className="relative w-full py-10 sm:py-16 bg-transparent border-b border-[#bfdbfe] overflow-hidden">
      {/* Background Subtle Modern Dots and Schematics */}
      <BackgroundGeometricMesh variant="dots" className="opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Centered Headline */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 bg-gradient-to-r from-blue-50 via-[#EAF3F8] to-blue-50 py-4 px-6 rounded-xl border border-blue-100 shadow-sm">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#0052cc] font-bold">
            BẢN SẮC & TRUYỀN THỐNG
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
            Tin Nhà Trường
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
            <div className="w-8 sm:w-12 h-[2px] bg-[#0052cc]" />
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border border-[#ff9900] rotate-45 bg-[#ff9900]" />
            <div className="w-8 sm:w-12 h-[2px] bg-[#0052cc]" />
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
          {displayShowcase.length > 0 ? displayShowcase.map((item, idx) => {
            const diff = (idx - activeSlide + displayShowcase.length) % displayShowcase.length;
            let offset = diff;
            if (diff > Math.floor(displayShowcase.length / 2)) {
              offset = diff - displayShowcase.length;
            }

            const baseTranslate = offset === 0 ? 0 : offset > 0 ? 75 : -75;
            const scale = offset === 0 ? 1 : 0.85;
            const zIndex = offset === 0 ? 30 : 20 - Math.abs(offset);
            const opacity = offset === 0 ? 1 : 0.6;
            const blur = offset === 0 ? 'blur(0px)' : 'blur(1.5px)';
            
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
                    ? 'border-2 border-black bg-white shadow-xl' 
                    : 'border border-[#bfdbfe] bg-white shadow-md'
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
                      offset === 0 ? 'bg-[#0052cc] text-white' : 'bg-transparent text-black'
                    }`}>
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-black border border-[#bfdbfe] px-2 py-0.5 bg-white/95">
                      {item.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base sm:text-lg md:text-xl font-bold uppercase leading-snug line-clamp-3 transition-colors ${
                    offset === 0 ? 'text-black' : 'text-black'
                  }`}>
                    {item.title}
                  </h3>

                  {/* Image Slot */}
                  <div className="relative mt-4 mb-4 flex-shrink-0 h-32 sm:h-40 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <EduImageFrame
                        label="ẢNH TIN"
                        subLabel="Tiêu Điểm Nhà Trường"
                        theme={idx === 0 ? 'campus' : idx === 1 ? 'lab' : 'ceremony'}
                        aspectRatio="16:9"
                      />
                    )}
                  </div>

                  {/* Excerpt */}
                  <p className="mt-1 text-xs sm:text-sm text-black leading-relaxed font-normal line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Action Button for Active Slide */}
                  <div className={`mt-5 pt-4 border-t border-[#dbeafe] transition-opacity duration-300 ${
                    offset === 0 ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <span className="inline-flex items-center gap-1.5 text-black text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                      Xem Chi Tiết <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : <div className="text-black text-center py-20">Không có dữ liệu tiêu điểm.</div>}
        </div>

        {/* Bottom Controls / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-12 max-w-3xl mx-auto pt-4 border-t border-[#bfdbfe]">
          
          {/* Dash Indicators */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            {displayShowcase.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Tin nhà trường số ${idx + 1}`}
                className={`h-2 transition-all cursor-pointer ${
                  activeSlide === idx
                    ? 'w-12 bg-[#0052cc]'
                    : 'w-4 bg-[#bfdbfe] hover:bg-[#93c5fd]'
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
                className="w-12 h-12 sm:w-10 sm:h-10 border border-[#bfdbfe] hover:border-black hover:bg-transparent flex items-center justify-center text-black hover:text-black active:bg-[#0052cc] active:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Xem tin kế tiếp"
                className="w-12 h-12 sm:w-10 sm:h-10 border border-[#bfdbfe] hover:border-black hover:bg-transparent flex items-center justify-center text-black hover:text-black active:bg-[#0052cc] active:text-white transition-colors cursor-pointer"
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


