import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Bell, Eye, Search } from 'lucide-react';
import { FEATURED_NEWS, SECONDARY_NEWS, ANNOUNCEMENTS } from '../data/mockData';
import { NewsItem, AnnouncementItem } from '../types';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface NewsAndAnnouncementsSectionProps {
  onSelectNews: (item: NewsItem) => void;
  onSelectAnnouncement: (item: AnnouncementItem) => void;
  onSearch: (query: string) => void;
  onOpenQuickModal: () => void;
}

export const NewsAndAnnouncementsSection: React.FC<NewsAndAnnouncementsSectionProps> = ({
  onSelectNews,
  onSelectAnnouncement,
  onSearch,
  onOpenQuickModal,
}) => {
  const [activeNewsCategory, setActiveNewsCategory] = useState<'all' | 'chuyen-mon' | 'hoat-dong'>('all');
  
  // Mobile / Responsive Swipe State for News Cards
  const allNewsList: NewsItem[] = [FEATURED_NEWS, ...SECONDARY_NEWS];
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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
    setDragOffset(Math.max(-150, Math.min(150, diff * 0.8)));
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 50;
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
    setDragOffset(Math.max(-150, Math.min(150, diff * 0.8)));
  };

  const handleMouseUp = () => {
    if (isDragging && touchStartX !== null && touchCurrentX !== null) {
      const diff = touchCurrentX - touchStartX;
      const swipeThreshold = 50;
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

  const categories = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'chuyen-mon', label: 'CHUYÊN MÔN' },
    { id: 'hoat-dong', label: 'HOẠT ĐỘNG' },
  ];

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  return (
    <section id="tin-tuc" className="relative w-full py-4 sm:py-6 bg-[#FFFFFF] border-b border-[#d1ddf5] overflow-hidden">
      {/* Subtle modern background grid */}
      <BackgroundGeometricMesh variant="grid" className="opacity-70" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          
          {/* ========================================================
              LEFT COLUMN: TIN TỨC - SỰ KIỆN
             ======================================================== */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Header: Tin tức - Sự Kiện với gold underline */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2.5 mb-3 gap-3 border-b-2 border-[#003087]">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold">
                  BẢN TIN NHÀ TRƯỜNG
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003087] tracking-tight uppercase">
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
                        ? 'bg-[#003087] text-white border-[#003087]'
                        : 'bg-white text-[#1a2744] border-[#c5d3ec] hover:border-[#003087] hover:text-[#003087]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ====================================================
                1. RESPONSIVE / MOBILE 3D COVERFLOW CAROUSEL
                Active on mobile/tablet (md:hidden)
               ==================================================== */}
              <div className="md:hidden flex flex-col mb-5">
              {/* 3D Carousel Container */}
              <div
                className="relative w-full h-[470px] sm:h-[520px] flex justify-center items-center perspective-[1200px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <button onClick={prevNews} aria-label="Tin trước" className="absolute left-0 top-1/2 -translate-y-1/2 z-[60] w-9 h-12 bg-white border-2 border-[#55B9E8] text-[#003087] shadow-md hover:bg-[#55B9E8] hover:text-white transition-colors"><ChevronLeft className="w-5 h-5 mx-auto" /></button>
                <button onClick={nextNews} aria-label="Tin tiếp theo" className="absolute right-0 top-1/2 -translate-y-1/2 z-[60] w-9 h-12 bg-white border-2 border-[#55B9E8] text-[#003087] shadow-md hover:bg-[#55B9E8] hover:text-white transition-colors"><ChevronRight className="w-5 h-5 mx-auto" /></button>
                {allNewsList.map((item, idx) => {
                  const diff = (idx - activeNewsIndex + allNewsList.length) % allNewsList.length;
                  let offset = diff;
                  if (diff > Math.floor(allNewsList.length / 2)) {
                    offset = diff - allNewsList.length;
                  }

                  const baseTranslate = offset === 0 ? 0 : offset > 0 ? 75 : -75;
                  const scale = offset === 0 ? 1 : 0.85;
                  const zIndex = offset === 0 ? 30 : 20 - Math.abs(offset);
                  const isHidden = Math.abs(offset) > 1;
                  const opacity = offset === 0 ? 1 : isHidden ? 0 : 0.6;
                  const blur = offset === 0 ? 'blur(0px)' : 'blur(1.5px)';
                  
                  const currentDragOffset = offset === 0 ? dragOffset : dragOffset * 0.5;
                  const transform = `translateX(calc(${baseTranslate}% + ${currentDragOffset}px)) scale(${scale})`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (offset === 1) nextNews();
                        else if (offset === -1) prevNews();
                        else if (offset === 0) onSelectNews(item);
                      }}
                      className={`absolute w-[88%] sm:w-[70%] flex flex-col transition-all duration-500 ease-out cursor-pointer ${
                        offset === 0 
                          ? 'border-2 border-[#003087] bg-white shadow-xl' 
                          : 'border border-[#d1ddf5] bg-[#f5f7fc] shadow-md'
                      }`}
                      style={{
                        transform,
                        zIndex,
                        opacity,
                        filter: blur,
                        pointerEvents: isHidden ? 'none' : 'auto'
                      }}
                    >
                      <div className={`p-4 sm:p-5 flex flex-col h-full ${offset !== 0 && 'pointer-events-none'}`}>
                        {/* Meta Top Bar */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-widest px-2 py-0.5 uppercase transition-colors ${
                            offset === 0 ? 'bg-[#003087] text-white' : 'bg-[#e8eef8] text-[#6b82b8]'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#003087] border border-[#c5d3ec] px-2 py-0.5 bg-white/95">
                            {item.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-base sm:text-lg font-bold uppercase leading-snug line-clamp-3 transition-colors ${
                          offset === 0 ? 'text-[#1a2744]' : 'text-[#4a5f8a]'
                        }`}>
                          {item.title}
                        </h3>

                        {/* Image Slot */}
                        <div className="relative mt-4 mb-4 flex-shrink-0">
                          <EduImageFrame
                            label="ẢNH TIN"
                            subLabel={item.imageFallbackTitle || 'TIN TỨC'}
                            theme={idx % 2 === 0 ? 'exam' : 'lab'}
                            aspectRatio="16:9"
                          />
                        </div>

                        {/* Excerpt */}
                        <p className="mt-1 text-xs sm:text-sm text-[#4a5f8a] leading-relaxed font-normal line-clamp-3">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Swipe Hint Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#003087] bg-[#e8eef8] py-1.5 px-3 border border-[#c5d3ec]/40 mt-2 w-fit mx-auto">
                <span className="animate-pulse">👈 Vuốt sang trái / phải để đổi tin tức 👉</span>
              </div>

              {/* Bottom Pagination Dash Indicators */}
              <div className="mt-4 pt-4 border-t border-[#d1ddf5] flex items-center justify-between gap-3">
                
                {/* Dash Indicators */}
                <div className="flex items-center gap-1.5">
                  {allNewsList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNewsIndex(idx)}
                      aria-label={`Tin số ${idx + 1}`}
                      className={`h-2 transition-all cursor-pointer ${
                        activeNewsIndex === idx
                          ? 'w-10 bg-[#003087]'
                          : 'w-4 bg-[#c5d3ec] hover:bg-[#9aabd4]'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide Navigation Buttons */}
                <div className="hidden flex items-center gap-2">
                  <button
                    onClick={prevNews}
                    aria-label="Tin trước"
                    className="w-10 h-10 border border-[#c5d3ec] hover:border-[#003087] hover:bg-[#e8eef8] flex items-center justify-center text-[#1a2744] hover:text-[#003087] active:bg-[#003087] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextNews}
                    aria-label="Tin kế tiếp"
                    className="w-10 h-10 border border-[#c5d3ec] hover:border-[#003087] hover:bg-[#e8eef8] flex items-center justify-center text-[#1a2744] hover:text-[#003087] active:bg-[#003087] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ====================================================
                2. DESKTOP GRID LAYOUT
               ==================================================== */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-2 relative">
              
              {/* Featured News Item (md:col-span-7) */}
              <div
                onClick={() => onSelectNews(FEATURED_NEWS)}
                className="md:col-span-7 group cursor-pointer border border-[#d1ddf5] bg-[#f5f7fc] hover:border-[#003087] transition-all flex flex-col justify-between p-3 sm:p-4 shadow-xs"
              >
                <div>
                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors line-clamp-3 leading-snug uppercase">
                    {FEATURED_NEWS.title}
                  </h3>

                  {/* Big Image Slot */}
                  <div className="relative mt-2">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel="Khai giảng & Thi HSG"
                      theme="exam"
                      aspectRatio="16:9"
                    />

                    {/* Date Tag */}
                    <div className="absolute bottom-2 right-2 bg-white/95 px-2.5 py-1 text-[11px] font-mono font-bold text-[#003087] border border-[#c5d3ec] shadow-xs">
                      {FEATURED_NEWS.date}
                    </div>
                  </div>

                  {/* Excerpt Paragraph */}
                  <p className="mt-3.5 text-xs sm:text-sm text-[#4a5f8a] leading-relaxed line-clamp-4 font-normal">
                    {FEATURED_NEWS.summary}
                  </p>
                </div>

                {/* Footer read more */}
                <div className="mt-4 pt-3 border-t border-[#d1ddf5] flex items-center justify-between text-xs font-semibold text-[#003087]">
                  <span className="flex items-center gap-1.5 text-[#6b82b8] font-mono text-[11px]">
                    <Eye className="w-3.5 h-3.5" />
                    {FEATURED_NEWS.views.toLocaleString()} lượt đọc
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Đọc toàn văn <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Stacked 3 Secondary News Items (md:col-span-5) */}
              <div className="md:col-span-5 flex flex-col gap-2">
                {SECONDARY_NEWS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectNews(item)}
                    className="group cursor-pointer border border-[#d1ddf5] bg-[#FFFFFF] hover:border-[#003087] transition-all p-2.5 flex gap-3 shadow-xs"
                  >
                    {/* Thumbnail Image Slot */}
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
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1a2744] group-hover:text-[#003087] transition-colors line-clamp-3 leading-snug">
                        {item.title}
                      </h4>

                      {/* Date Badge */}
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#003087] font-semibold bg-[#e8eef8] px-1.5 py-0.5 border border-[#c5d3ec]/40">
                          {item.date}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[#9aabd4] group-hover:text-[#003087] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* View More News Button */}
                <button
                  onClick={() => onSelectNews(FEATURED_NEWS)}
                  className="w-full mt-1 py-2 text-center text-xs font-bold text-[#003087] bg-[#f5f7fc] hover:bg-[#e8eef8] border border-[#d1ddf5] hover:border-[#003087] transition-colors cursor-pointer"
                >
                  XEM THÊM TIN TỨC SỰ KIỆN →
                </button>
              </div>

            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: THÔNG BÁO
             ======================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t-2 lg:border-t-0 lg:border-l border-[#003087] pt-4 lg:pt-0 lg:pl-5">
            <div className="hidden flex items-center gap-2 mb-3">
              <form onSubmit={submitSearch} className="relative flex-1">
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm..." className="w-full h-9 pl-3 pr-9 text-xs bg-white border border-[#B8D3E2] text-[#17324D] placeholder:text-[#7895AD] focus:border-[#0B78B5] focus:ring-1 focus:ring-[#0B78B5] focus:outline-none" />
                <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 bottom-0 px-2.5 text-[#0875B1] hover:bg-[#EAF3F8] cursor-pointer"><Search className="w-4 h-4" /></button>
              </form>
              <button onClick={onOpenQuickModal} aria-label="Báo mất đồ" className="h-9 px-2.5 bg-[#0B78B5] hover:bg-[#075F91] text-white flex items-center justify-center cursor-pointer"><AlertCircle className="w-4 h-4" /></button>
            </div>
            
            {/* Header: Thông báo */}
            <div className="border-b-2 border-[#003087] pb-2.5 mb-3">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
                <Bell className="w-3 h-3" />
                VĂN BẢN CHỈ ĐẠO
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003087] tracking-tight uppercase">
                Thông báo
              </h2>
            </div>

            {/* List of 5 Announcements */}
            <div className="flex flex-col divide-y divide-[#d1ddf5]">
              {ANNOUNCEMENTS.map((ann, idx) => (
                <div
                  key={ann.id}
                  onClick={() => onSelectAnnouncement(ann)}
                  className="group cursor-pointer py-3.5 transition-colors px-2 flex flex-col justify-between"
                >
                  {/* Announcement Title */}
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1a2744] group-hover:text-[#003087] group-hover:underline transition-colors line-clamp-2 leading-snug">
                    {ann.title}
                  </h4>

                  {/* Announcement Footer: Department & Date Box */}
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#6b82b8] font-medium truncate max-w-[180px]">
                      {ann.department}
                    </span>

                    {/* Date badge */}
                    <span className="font-mono text-[11px] font-bold text-[#003087] bg-white border border-[#003087]/40 px-2 py-0.5 shadow-2xs">
                      {ann.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer of Announcement Box */}
            <div className="mt-6 pt-3 border-t border-[#d1ddf5]">
              <button
                onClick={() => onSelectAnnouncement(ANNOUNCEMENTS[0])}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#001a52]"
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
