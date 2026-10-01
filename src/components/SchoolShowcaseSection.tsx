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
  const [activeTabMobile, setActiveTabMobile] = useState<'main' | 'history' | 'facilities'>('main');

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
    setDragOffset(Math.max(-100, Math.min(100, diff * 0.75)));
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 45; // pixels
      if (diff < -swipeThreshold) {
        // Swiped left -> next slide
        nextSlide();
      } else if (diff > swipeThreshold) {
        // Swiped right -> prev slide
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
    setDragOffset(Math.max(-100, Math.min(100, diff * 0.75)));
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 45;
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

  const current = SCHOOL_SHOWCASE[activeSlide];

  return (
    <section className="relative w-full py-10 sm:py-16 bg-[#F6F4EF] border-b border-[#E6E1D6] overflow-hidden">
      {/* Background Subtle Modern Dots and Schematics */}
      <BackgroundGeometricMesh variant="dots" className="opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Centered Headline from Wireframe: "Nhà trường" with accent underlines */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold">
            BẢN SẮC & TRUYỀN THỐNG
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
            Nhà trường
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
            <div className="w-8 sm:w-12 h-[2px] bg-[#991B1B]" />
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border border-[#991B1B] rotate-45 bg-[#FEF2F2]" />
            <div className="w-8 sm:w-12 h-[2px] bg-[#991B1B]" />
          </div>

          {/* Mobile Tab Switcher: Quick access on phones */}
          <div className="flex sm:hidden items-center justify-center gap-1 mt-4 p-1 bg-[#EAE6DE] border border-stone-300">
            <button
              onClick={() => setActiveTabMobile('main')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTabMobile === 'main' ? 'bg-[#991B1B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Tiêu điểm
            </button>
            <button
              onClick={() => setActiveTabMobile('history')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTabMobile === 'history' ? 'bg-[#991B1B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Truyền thống
            </button>
            <button
              onClick={() => setActiveTabMobile('facilities')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTabMobile === 'facilities' ? 'bg-[#991B1B] text-white shadow-xs' : 'text-stone-700'
              }`}
            >
              Cơ sở vật chất
            </button>
          </div>
        </div>

        {/* 3-Column Layout from Wireframe:
            Left Column Box | Center Main Highlight (Swipeable) | Right Column Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* ========================================================
              LEFT COLUMN: TRUYỀN THỐNG & ĐỘI NGŨ
             ======================================================== */}
          <div
            className={`lg:col-span-3 flex-col justify-between border border-[#E2DDD3] bg-white p-4 sm:p-5 shadow-xs ${
              activeTabMobile === 'history' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            <div>
              <div className="w-8 sm:w-9 h-8 sm:h-9 bg-[#FEF2F2] border border-[#B91C1C] flex items-center justify-center text-[#991B1B] mb-3 sm:mb-4">
                <Landmark className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase text-[#991B1B] tracking-wider">
                LỊCH SỬ HƠN 115 NĂM
              </span>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[#1C1917] uppercase mt-1 leading-snug">
                Nơi Hội Tụ Tinh Hoa & Khát Vọng Tri Thức
              </h3>

              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                Tự hào là chiếc nôi đào tạo nhiều thế hệ lãnh đạo, nhà khoa học và nhân tài ưu tú của đất nước. Tinh thần hiếu học và kỷ cương luôn được gìn giữ qua từng thế hệ.
              </p>

              {/* Key Metric Blocks */}
              <div className="mt-4 sm:mt-6 border-t border-stone-200 pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                <div className="bg-[#FAF9F6] p-2 sm:p-2.5 border-l-2 border-[#991B1B]">
                  <div className="text-[11px] sm:text-xs font-semibold text-stone-500">Năm thành lập</div>
                  <div className="text-base sm:text-lg font-bold text-[#991B1B] font-mono">1908</div>
                </div>
                <div className="bg-[#FAF9F6] p-2 sm:p-2.5 border-l-2 border-[#991B1B]">
                  <div className="text-[11px] sm:text-xs font-semibold text-stone-500">Huân chương độc lập</div>
                  <div className="text-xs sm:text-sm font-bold text-stone-800">Hạng Nhất & Anh Hùng Lao Động</div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 border-t border-stone-200">
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-500 block">
                Chu Văn An · Bưởi · Thăng Long
              </span>
            </div>
          </div>

          {/* ========================================================
              CENTER COLUMN: MAIN HIGHLIGHT (SWIPEABLE / VUỐT ĐỂ ĐỔI TIN)
             ======================================================== */}
          <div
            className={`lg:col-span-6 flex-col justify-between border-2 border-[#991B1B] bg-white p-4 sm:p-6 shadow-md relative select-none touch-pan-y ${
              activeTabMobile === 'main' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {/* Interactive Swipe Area with Touch and Mouse events */}
            <div
              ref={containerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
              style={{
                transform: `translateX(${dragOffset}px)`,
              }}
            >
              {/* Slide Meta Top Bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-white bg-[#991B1B] px-2 py-0.5 uppercase">
                  {current.tag}
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-stone-500 font-semibold">
                  Tiêu điểm 0{activeSlide + 1} / 0{SCHOOL_SHOWCASE.length}
                </span>
              </div>

              {/* Title (On top as drawn in wireframe) */}
              <h3
                onClick={() => onSelectHighlight(current)}
                className="text-sm sm:text-lg md:text-xl font-bold text-[#1C1917] hover:text-[#991B1B] transition-colors uppercase leading-snug cursor-pointer"
              >
                {current.title}
              </h3>

              {/* Center Image Slot with Wireframe "ẢNH TIN" */}
              <div
                onClick={() => onSelectHighlight(current)}
                className="relative mt-3 sm:mt-4 cursor-pointer group pointer-events-auto"
              >
                <EduImageFrame
                  label="ẢNH TIN"
                  subLabel="Tiêu Điểm Nhà Trường"
                  theme={activeSlide === 0 ? 'campus' : activeSlide === 1 ? 'lab' : 'ceremony'}
                  aspectRatio="16:9"
                />

                {/* Date Tag dd/mm/yy matching wireframe bottom-right */}
                <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-mono font-bold text-[#991B1B] border border-stone-300 shadow-xs">
                  {current.date}
                </div>
              </div>

              {/* Excerpt Paragraph from Wireframe */}
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {current.summary}
              </p>
            </div>

            {/* Mobile Swipe Hint Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] py-1.5 px-3 border border-[#FCA5A5]/40 mt-3 sm:hidden">
              <span className="animate-pulse">👈 Vuốt sang trái / phải để đổi tin 👉</span>
            </div>

            {/* Bottom Modern Pagination Dash Indicators matching wireframe (`---`) */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              
              {/* Dash Indicators (Clickable on desktop & mobile) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {SCHOOL_SHOWCASE.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Tin nhà trường số ${idx + 1}`}
                    className={`h-2.5 sm:h-2 transition-all cursor-pointer ${
                      activeSlide === idx
                        ? 'w-10 sm:w-12 bg-[#991B1B]'
                        : 'w-4 sm:w-5 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
                ))}
              </div>

              {/* Directional Slide Navigation Buttons (Touch Friendly: min 40px) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    aria-label="Xem tin trước"
                    className="w-10 h-10 sm:w-8 sm:h-8 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Xem tin kế tiếp"
                    className="w-10 h-10 sm:w-8 sm:h-8 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectHighlight(current)}
                  className="px-4 py-2 sm:px-3 sm:py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] active:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Xem Chi Tiết
                </button>
              </div>

            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: CƠ SỞ VẬT CHẤT & THÀNH TÍCH
             ======================================================== */}
          <div
            className={`lg:col-span-3 flex-col justify-between border border-[#E2DDD3] bg-white p-4 sm:p-5 shadow-xs ${
              activeTabMobile === 'facilities' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            <div>
              <div className="w-8 sm:w-9 h-8 sm:h-9 bg-[#FEF2F2] border border-[#B91C1C] flex items-center justify-center text-[#991B1B] mb-3 sm:mb-4">
                <Award className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase text-[#991B1B] tracking-wider">
                CHẤT LƯỢNG HÀNG ĐẦU
              </span>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[#1C1917] uppercase mt-1 leading-snug">
                Môi Trường Giáo Dục Đẳng Cấp Quốc Tế
              </h3>

              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                Khuôn viên xanh rợp bóng cây cổ thụ bên bờ Hồ Tây lịch sử kết hợp hệ thống phòng thí nghiệm STEM đạt chuẩn khảo thí quốc tế Cambridge.
              </p>

              {/* Key Statistics */}
              <div className="mt-4 sm:mt-6 border-t border-stone-200 pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                <div className="bg-[#FAF9F6] p-2 sm:p-2.5 border-l-2 border-[#991B1B]">
                  <div className="text-[11px] sm:text-xs font-semibold text-stone-500">Tỷ lệ tốt nghiệp THPT</div>
                  <div className="text-base sm:text-lg font-bold text-[#991B1B] font-mono">100%</div>
                </div>
                <div className="bg-[#FAF9F6] p-2 sm:p-2.5 border-l-2 border-[#991B1B]">
                  <div className="text-[11px] sm:text-xs font-semibold text-stone-500">Giải HSG Quốc Gia mỗi năm</div>
                  <div className="text-xs sm:text-sm font-bold text-stone-800">50 – 70 Giải thưởng lớn</div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 border-t border-stone-200">
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-500 block">
                Chuẩn Quốc Gia Mức Độ 2
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
