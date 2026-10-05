import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Bell, Eye, Search } from 'lucide-react';
import { usePosts, useAnnouncements } from '../api';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';
import { motion } from 'motion/react';

interface NewsAndAnnouncementsSectionProps {
  topSections: any[];
  onSelectNews: (item: any) => void;
  onSelectAnnouncement: (item: any) => void;
  onSearch: (query: string) => void;
}

export const NewsAndAnnouncementsSection: React.FC<NewsAndAnnouncementsSectionProps> = ({
  topSections,
  onSelectNews,
  onSelectAnnouncement,
  onSearch,
}) => {
  const [activeNewsCategory, setActiveNewsCategory] = useState<'all' | 'chuyen-mon' | 'hoat-dong'>('all');
  
  const { data: rawAnnouncements } = useAnnouncements();

  // topSections[0] -> News
  const rawPosts = topSections[0]?.posts || [];
  
  const newsCategoryName = topSections[0]?.category?.name || 'Tin tức - Sự Kiện';
  const announcementCategoryName = 'Thông báo';

  // Process Posts
  const allNewsList = rawPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    summary: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    category: p.category?.name || 'TIN TỨC',
    date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
    views: p.views || 0,
    imageFallbackTitle: 'TIN TỨC',
    imgUrl: p.imgUrl || p.imageUrl
  }));

  const FEATURED_NEWS = allNewsList[0] || {
    id: 'placeholder',
    title: 'Đang cập nhật...',
    summary: '',
    category: 'TIN TỨC',
    date: '',
    views: 0
  };
  const SECONDARY_NEWS = allNewsList.slice(1, 4);

  // Process Announcements
  const ANNOUNCEMENTS = rawAnnouncements.slice(0, 5).map((a: any) => ({
    id: a.id,
    title: a.title,
    department: a.department || 'Ban Giám Hiệu',
    date: new Date(a.createdAt).toLocaleDateString('vi-VN')
  }));

  // Mobile / Responsive Swipe State for News Cards
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

  if (!topSections || topSections.length === 0) {
    return <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <section id="tin-tuc" className="relative w-full py-4 sm:py-6 bg-[#FFFFFF] border-b border-[#dbeafe] overflow-hidden">
      {/* Subtle modern background grid */}
      <BackgroundGeometricMesh variant="grid" className="opacity-70" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          
          {/* ========================================================
              LEFT COLUMN: TIN TỨC - SỰ KIỆN
             ======================================================== */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 flex flex-col"
          >
            {/* Header: Tin tức - Sự Kiện với gold underline */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2.5 mb-5 gap-3 border-b-[3px] border-[#0052cc]">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#ff9900] font-bold">
                  BẢN TIN NHÀ TRƯỜNG
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gradient tracking-tight uppercase">
                  {newsCategoryName}
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
                        ? 'bg-[#0052cc] text-white border-black'
                        : 'bg-white text-black border-[#bfdbfe] hover:border-black hover:text-black'
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
                <button onClick={prevNews} aria-label="Tin trước" className="absolute left-0 top-1/2 -translate-y-1/2 z-[60] w-9 h-12 bg-white border-2 border-[#00d2ff] text-black shadow-md hover:bg-[#00d2ff] hover:text-white transition-colors"><ChevronLeft className="w-5 h-5 mx-auto" /></button>
                <button onClick={nextNews} aria-label="Tin tiếp theo" className="absolute right-0 top-1/2 -translate-y-1/2 z-[60] w-9 h-12 bg-white border-2 border-[#00d2ff] text-black shadow-md hover:bg-[#00d2ff] hover:text-white transition-colors"><ChevronRight className="w-5 h-5 mx-auto" /></button>
                {allNewsList.length > 0 && allNewsList.map((item, idx) => {
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
                          ? 'border-2 border-black bg-white shadow-xl' 
                          : 'border border-[#dbeafe] bg-white shadow-md'
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
                            offset === 0 ? 'bg-transparent text-black' : 'bg-transparent text-black'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-black border border-[#bfdbfe] px-2 py-0.5 bg-white/95">
                            {item.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-base sm:text-lg font-bold uppercase leading-snug line-clamp-3 transition-colors text-black`}>
                          {item.title}
                        </h3>

                        {/* Image Slot */}
                        <div className="relative mt-4 mb-4 flex-shrink-0 h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                          {item.imgUrl ? (
                            <img src={item.imgUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <EduImageFrame
                              label="ẢNH TIN"
                              subLabel={item.imageFallbackTitle || 'TIN TỨC'}
                              theme={idx % 2 === 0 ? 'exam' : 'lab'}
                              aspectRatio="16:9"
                            />
                          )}
                        </div>

                        {/* Excerpt */}
                        <p className="mt-1 text-xs sm:text-sm text-black leading-relaxed font-normal line-clamp-3">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Swipe Hint Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-black bg-transparent py-1.5 px-3 border border-[#bfdbfe]/40 mt-2 w-fit mx-auto">
                <span className="animate-pulse">👈 Vuốt sang trái / phải để đổi tin tức 👉</span>
              </div>

              {/* Bottom Pagination Dash Indicators */}
              <div className="mt-4 pt-4 border-t border-[#dbeafe] flex items-center justify-between gap-3">
                
                {/* Dash Indicators */}
                <div className="flex items-center gap-1.5">
                  {allNewsList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNewsIndex(idx)}
                      aria-label={`Tin số ${idx + 1}`}
                      className={`h-2 transition-all cursor-pointer ${
                        activeNewsIndex === idx
                          ? 'w-10 bg-[#0052cc]'
                          : 'w-4 bg-[#bfdbfe] hover:bg-[#93c5fd]'
                      }`}
                    />
                  ))}
                </div>

                {/* Slide Navigation Buttons */}
                <div className="hidden flex items-center gap-2">
                  <button
                    onClick={prevNews}
                    aria-label="Tin trước"
                    className="w-10 h-10 border border-[#bfdbfe] hover:border-black hover:bg-transparent flex items-center justify-center text-black hover:text-black active:bg-[#0052cc] active:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextNews}
                    aria-label="Tin kế tiếp"
                    className="w-10 h-10 border border-[#bfdbfe] hover:border-black hover:bg-transparent flex items-center justify-center text-black hover:text-black active:bg-[#0052cc] active:text-white transition-colors cursor-pointer"
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
                className="md:col-span-7 group cursor-pointer border border-gray-100 bg-white hover:border-[#0052cc] hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 shadow-sm rounded-2xl relative overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all -z-10"></div>
                
                <div>
                  {/* Title */}
                  <h3 className="text-base sm:text-[19px] font-extrabold text-gray-800 group-hover:text-[#0052cc] transition-colors line-clamp-3 leading-snug uppercase">
                    {FEATURED_NEWS.title}
                  </h3>

                  {/* Big Image Slot */}
                  <div className="relative mt-2 h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {FEATURED_NEWS.imgUrl ? (
                      <img src={FEATURED_NEWS.imgUrl} alt={FEATURED_NEWS.title} className="w-full h-full object-cover" />
                    ) : (
                      <EduImageFrame
                        label="ẢNH TIN"
                        subLabel="Khai giảng & Thi HSG"
                        theme="exam"
                        aspectRatio="16:9"
                      />
                    )}

                    {/* Date Tag */}
                    <div className="absolute bottom-2 right-2 bg-white/95 px-2.5 py-1 text-[11px] font-mono font-bold text-black border border-[#bfdbfe] shadow-xs z-10">
                      {FEATURED_NEWS.date}
                    </div>
                  </div>

                  {/* Excerpt Paragraph */}
                  <p className="mt-3.5 text-xs sm:text-sm text-black leading-relaxed line-clamp-4 font-normal">
                    {FEATURED_NEWS.summary}
                  </p>
                </div>

                {/* Footer read more */}
                <div className="mt-4 pt-3 border-t border-[#dbeafe] flex items-center justify-between text-xs font-semibold text-black">
                  <span className="flex items-center gap-1.5 text-black font-mono text-[11px]">
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
                    className="group cursor-pointer border border-gray-100 bg-white hover:border-[#ff9900] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-3 flex gap-4 shadow-sm rounded-xl"
                  >
                    {/* Thumbnail Image Slot */}
                    <div className="w-24 sm:w-28 shrink-0 h-20 sm:h-24 bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg group-hover:shadow-md transition-shadow">
                      {item.imgUrl ? (
                        <img src={item.imgUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <EduImageFrame
                          label="ẢNH TIN"
                          subLabel={item.category}
                          theme={item.id === 'news-2' ? 'lab' : 'campus'}
                          aspectRatio="4:3"
                        />
                      )}
                    </div>

                    {/* Title + Date */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-black group-hover:text-black transition-colors line-clamp-3 leading-snug">
                        {item.title}
                      </h4>

                      {/* Date Badge */}
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-black font-semibold bg-transparent px-1.5 py-0.5 border border-[#bfdbfe]/40">
                          {item.date}
                        </span>
                        <ChevronRight className="w-3 h-3 text-black group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* View More News Button */}
                <button
                  onClick={() => onSelectNews(FEATURED_NEWS)}
                  className="w-full mt-1 py-2 text-center text-xs font-bold text-black bg-transparent hover:bg-transparent border border-[#dbeafe] hover:border-black transition-colors cursor-pointer"
                >
                  XEM THÊM TIN TỨC SỰ KIỆN →
                </button>
              </div>

            </div>
            </motion.div>

          {/* ========================================================
              RIGHT COLUMN: THÔNG BÁO
             ======================================================== */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 flex flex-col justify-between border-t-2 lg:border-t-0 lg:border-l border-black pt-4 lg:pt-0 lg:pl-5"
          >
            <div className="hidden flex items-center gap-2 mb-3">
              <form onSubmit={submitSearch} className="relative flex-1">
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm..." className="w-full h-9 pl-3 pr-9 text-xs bg-white border border-[#B8D3E2] text-black placeholder:text-[#7895AD] focus:border-black focus:ring-1 focus:ring-[#0052cc] focus:outline-none" />
                <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 bottom-0 px-2.5 text-black hover:bg-[#EAF3F8] cursor-pointer"><Search className="w-4 h-4" /></button>
              </form>

            </div>
            
            {/* Header: Thông báo */}
            <div className="border-b-[3px] border-[#e63946] pb-2.5 mb-5 mt-4 lg:mt-0">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#e63946] font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                VĂN BẢN CHỈ ĐẠO
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e63946] to-[#b5179e] tracking-tight uppercase mt-1">
                {announcementCategoryName}
              </h2>
            </div>

            {/* List of 5 Announcements */}
            <div className="flex flex-col gap-3">
              {ANNOUNCEMENTS.map((ann, idx) => (
                <div
                  key={ann.id}
                  onClick={() => onSelectAnnouncement(ann)}
                  className="group cursor-pointer p-3.5 transition-all bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-[#e63946] flex flex-col justify-between hover:-translate-y-0.5"
                >
                  {/* Announcement Title */}
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#e63946] transition-colors line-clamp-2 leading-snug">
                    {ann.title}
                  </h4>

                  {/* Announcement Footer: Department & Date Box */}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-[#0052cc] font-semibold truncate max-w-[180px] bg-blue-50 px-2 py-0.5 rounded-md">
                      {ann.department}
                    </span>

                    {/* Date badge */}
                    <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                      {ann.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer of Announcement Box */}
            <div className="mt-6 pt-3 border-t border-[#dbeafe]">
              <button
                onClick={() => onSelectAnnouncement(ANNOUNCEMENTS[0])}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0052cc] hover:bg-[#0026e6] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#0026e6]"
              >
                <span>Xem Tất Cả Thông Báo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};



