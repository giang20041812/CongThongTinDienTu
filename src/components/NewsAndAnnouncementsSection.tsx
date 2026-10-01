import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Bell, Eye } from 'lucide-react';
import { FEATURED_NEWS, SECONDARY_NEWS, ANNOUNCEMENTS } from '../data/mockData';
import { NewsItem, AnnouncementItem } from '../types';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface NewsAndAnnouncementsSectionProps {
  onSelectNews: (item: NewsItem) => void;
  onSelectAnnouncement: (item: AnnouncementItem) => void;
}

export const NewsAndAnnouncementsSection: React.FC<NewsAndAnnouncementsSectionProps> = ({
  onSelectNews,
  onSelectAnnouncement,
}) => {
  const [activeNewsCategory, setActiveNewsCategory] = useState<'all' | 'chuyen-mon' | 'hoat-dong'>('all');
  
  // Mobile / Responsive Swipe State for News Cards
  const allNewsList: NewsItem[] = [FEATURED_NEWS, ...SECONDARY_NEWS];
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const nextNews = () => {
    setActiveNewsIndex((prev) => (prev + 1) % allNewsList.length);
  };

  const prevNews = () => {
    setActiveNewsIndex((prev) => (prev - 1 + allNewsList.length) % allNewsList.length);
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentX(currentX);
    const diff = currentX - touchStartX;
    setDragOffset(Math.max(-100, Math.min(100, diff * 0.75)));
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 45;
      if (diff < -swipeThreshold) {
        nextNews();
      } else if (diff > swipeThreshold) {
        prevNews();
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  // Mouse Drag Handlers
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
        nextNews();
      } else if (diff > swipeThreshold) {
        prevNews();
      }
    }
    setIsDragging(false);
    setTouchStartX(null);
    setTouchCurrentX(null);
    setDragOffset(0);
  };

  const currentMobileNews = allNewsList[activeNewsIndex];

  const categories = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'chuyen-mon', label: 'CHUYÊN MÔN' },
    { id: 'hoat-dong', label: 'HOẠT ĐỘNG' },
  ];

  return (
    <section id="tin-tuc" className="relative w-full py-10 sm:py-14 bg-[#FFFFFF] border-b border-[#E7E2D9] overflow-hidden">
      {/* Subtle modern background grid */}
      <BackgroundGeometricMesh variant="grid" className="opacity-70" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ========================================================
              LEFT COLUMN: TIN TỨC - SỰ KIỆN (Matching Wireframe)
             ======================================================== */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Header: Tin tức - Sự Kiện with distinct double line */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#991B1B] pb-2.5 mb-6 gap-3">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold">
                  BẢN TIN NHÀ TRƯỜNG & CỤM
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                  Tin tức - Sự Kiện
                </h2>
              </div>

              {/* Functional interactive category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveNewsCategory(cat.id as any)}
                    className={`px-3 py-1.5 sm:py-1 text-xs font-semibold tracking-wider transition-colors cursor-pointer border shrink-0 ${
                      activeNewsCategory === cat.id
                        ? 'bg-[#991B1B] text-white border-[#991B1B]'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ====================================================
                1. RESPONSIVE / MOBILE CARD SWIPE CAROUSEL (Y hệt Nhà trường)
                Active on mobile/tablet (md:hidden)
               ==================================================== */}
            <div className="md:hidden flex flex-col justify-between border-2 border-[#991B1B] bg-white p-4 shadow-md relative select-none touch-pan-y mb-6">
              
              {/* Swipeable card container */}
              <div
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
                {/* Meta Top Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-white bg-[#991B1B] px-2 py-0.5 uppercase">
                    {currentMobileNews.category}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 font-semibold">
                    Tin tức 0{activeNewsIndex + 1} / 0{allNewsList.length}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectNews(currentMobileNews)}
                  className="text-base font-bold text-[#1C1917] hover:text-[#991B1B] transition-colors uppercase leading-snug cursor-pointer line-clamp-3"
                >
                  {currentMobileNews.title}
                </h3>

                {/* Image slot with wireframe "ẢNH TIN" */}
                <div
                  onClick={() => onSelectNews(currentMobileNews)}
                  className="relative mt-3 cursor-pointer group"
                >
                  <EduImageFrame
                    label="ẢNH TIN"
                    subLabel={currentMobileNews.imageFallbackTitle}
                    theme={activeNewsIndex % 2 === 0 ? 'exam' : 'lab'}
                    aspectRatio="16:9"
                  />

                  {/* Date Tag dd/mm/yy matching wireframe bottom-right */}
                  <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-0.5 text-[11px] font-mono font-bold text-[#991B1B] border border-stone-300 shadow-xs">
                    {currentMobileNews.date}
                  </div>
                </div>

                {/* Excerpt */}
                <p className="mt-3 text-xs text-stone-600 leading-relaxed font-normal line-clamp-3">
                  {currentMobileNews.summary}
                </p>
              </div>

              {/* Mobile Swipe Hint Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] py-1.5 px-3 border border-[#FCA5A5]/40 mt-3">
                <span className="animate-pulse">👈 Vuốt sang trái / phải để đổi tin tức 👉</span>
              </div>

              {/* Bottom Modern Pagination Dash Indicators matching wireframe (`---`) */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                
                {/* Dash Indicators */}
                <div className="flex items-center gap-1.5">
                  {allNewsList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNewsIndex(idx)}
                      aria-label={`Tin số ${idx + 1}`}
                      className={`h-2 transition-all cursor-pointer ${
                        activeNewsIndex === idx
                          ? 'w-8 bg-[#991B1B]'
                          : 'w-3 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevNews}
                    aria-label="Tin trước"
                    className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextNews}
                    aria-label="Tin kế tiếp"
                    className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectNews(currentMobileNews)}
                    className="px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Chi Tiết
                  </button>
                </div>

              </div>

            </div>

            {/* ====================================================
                2. DESKTOP GRID LAYOUT (Exact match with wireframe drawing)
                Active on md screens and above (hidden md:grid)
               ==================================================== */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Featured News Item (md:col-span-7) */}
              <div
                onClick={() => onSelectNews(FEATURED_NEWS)}
                className="md:col-span-7 group cursor-pointer border border-[#E7E2D9] bg-[#FAF9F6] hover:border-[#991B1B] transition-all flex flex-col justify-between p-3 sm:p-4 shadow-xs"
              >
                <div>
                  {/* Title (As in wireframe: placed on top or above image) */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors line-clamp-3 leading-snug uppercase">
                    {FEATURED_NEWS.title}
                  </h3>

                  {/* Big Image Slot with wireframe "ẢNH TIN" */}
                  <div className="relative mt-3">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel="Khai giảng & Thi HSG"
                      theme="exam"
                      aspectRatio="16:9"
                    />

                    {/* Date Tag dd/mm/yy matching wireframe bottom-right of image */}
                    <div className="absolute bottom-2 right-2 bg-white/95 px-2.5 py-1 text-[11px] font-mono font-bold text-[#991B1B] border border-stone-300 shadow-xs">
                      {FEATURED_NEWS.date}
                    </div>
                  </div>

                  {/* Excerpt Paragraph from Wireframe */}
                  <p className="mt-3.5 text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-4 font-normal">
                    {FEATURED_NEWS.summary}
                  </p>
                </div>

                {/* Footer read more */}
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-semibold text-[#991B1B]">
                  <span className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
                    <Eye className="w-3.5 h-3.5" />
                    {FEATURED_NEWS.views.toLocaleString()} lượt đọc
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Đọc toàn văn <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Stacked 3 Secondary News Items (md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col gap-3">
                {SECONDARY_NEWS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectNews(item)}
                    className="group cursor-pointer border border-[#E7E2D9] bg-[#FFFFFF] hover:border-[#991B1B] transition-all p-2.5 flex gap-3 shadow-xs"
                  >
                    {/* Thumbnail Image Slot: "ẢNH TIN" */}
                    <div className="w-24 sm:w-28 shrink-0">
                      <EduImageFrame
                        label="ẢNH TIN"
                        subLabel={item.category}
                        theme={item.id === 'news-2' ? 'lab' : 'campus'}
                        aspectRatio="4:3"
                      />
                    </div>

                    {/* Title + Date */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#991B1B] transition-colors line-clamp-3 leading-snug">
                        {item.title}
                      </h4>

                      {/* Date Badge: dd/mm/yy */}
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#991B1B] font-semibold bg-[#FEF2F2] px-1.5 py-0.5 border border-[#FCA5A5]/40">
                          {item.date}
                        </span>
                        <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-[#991B1B] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* View More News Button */}
                <button
                  onClick={() => onSelectNews(FEATURED_NEWS)}
                  className="w-full mt-1 py-2 text-center text-xs font-bold text-[#991B1B] bg-[#FAF8F5] hover:bg-[#FEF2F2] border border-stone-200 hover:border-[#991B1B] transition-colors cursor-pointer"
                >
                  XEM THÊM TIN TỨC SỰ KIỆN →
                </button>
              </div>

            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: THÔNG BÁO (Matching Wireframe)
             ======================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t-2 lg:border-t-0 lg:border-l border-[#991B1B] pt-6 lg:pt-0 lg:pl-8">
            
            {/* Header: Thông báo with distinct underline */}
            <div className="border-b-2 border-[#991B1B] pb-2.5 mb-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
                <Bell className="w-3 h-3" />
                VĂN BẢN CHỈ ĐẠO
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                Thông báo
              </h2>
            </div>

            {/* List of 5 Announcements Matching Wireframe */}
            <div className="flex flex-col divide-y divide-[#EAE6DE]">
              {ANNOUNCEMENTS.map((ann, idx) => (
                <div
                  key={ann.id}
                  onClick={() => onSelectAnnouncement(ann)}
                  className="group cursor-pointer py-3.5 hover:bg-[#FAF8F5] transition-colors px-2 flex flex-col justify-between"
                >
                  {/* Announcement Title from Wireframe */}
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#991B1B] transition-colors line-clamp-2 leading-snug">
                    {ann.title}
                  </h4>

                  {/* Announcement Footer: Department & Date Box */}
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-medium truncate max-w-[180px]">
                      {ann.department}
                    </span>

                    {/* dd/mm/yy badge exactly as boxed in wireframe */}
                    <span className="font-mono text-[11px] font-bold text-[#991B1B] bg-white border border-[#B91C1C]/40 px-2 py-0.5 shadow-2xs">
                      {ann.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer of Announcement Box */}
            <div className="mt-6 pt-3 border-t border-stone-200">
              <button
                onClick={() => onSelectAnnouncement(ANNOUNCEMENTS[0])}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#7F1D1D]"
              >
                <span>Xem Tất Cả Thông Báo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
