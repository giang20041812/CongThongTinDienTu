import React, { useState } from 'react';
import { Users, Search, Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { CLUBS_DATA, LOST_ITEMS_DATA } from '../data/mockData';
import { LostItem } from '../types';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface ClubsAndLostFoundSectionProps {
  onSelectLostItem: (item: LostItem) => void;
  onOpenReportLostModal: () => void;
}

export const ClubsAndLostFoundSection: React.FC<ClubsAndLostFoundSectionProps> = ({
  onSelectLostItem,
  onOpenReportLostModal,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [itemsList] = useState<LostItem[]>(LOST_ITEMS_DATA);

  const filteredItems = filterType === 'all'
    ? itemsList
    : itemsList.filter((item) => item.status === filterType);

  // -------------------------------------------------------------
  // 1. MOBILE RESPONSIVE SWIPE STATE FOR CLB (Câu lạc bộ)
  // -------------------------------------------------------------
  const allClubs = [CLUBS_DATA.featured, ...CLUBS_DATA.secondary];
  const [activeClubIndex, setActiveClubIndex] = useState(0);
  const [touchStartCLB, setTouchStartCLB] = useState<number | null>(null);
  const [touchCurrentCLB, setTouchCurrentCLB] = useState<number | null>(null);
  const [isDraggingCLB, setIsDraggingCLB] = useState(false);
  const [dragOffsetCLB, setDragOffsetCLB] = useState(0);

  const nextClub = () => {
    setActiveClubIndex((prev) => (prev + 1) % allClubs.length);
  };

  const prevClub = () => {
    setActiveClubIndex((prev) => (prev - 1 + allClubs.length) % allClubs.length);
  };

  const handleTouchStartCLB = (e: React.TouchEvent) => {
    setTouchStartCLB(e.touches[0].clientX);
    setTouchCurrentCLB(e.touches[0].clientX);
  };
  const handleTouchMoveCLB = (e: React.TouchEvent) => {
    if (touchStartCLB === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentCLB(currentX);
    const diff = currentX - touchStartCLB;
    setDragOffsetCLB(Math.max(-100, Math.min(100, diff * 0.75)));
  };
  const handleTouchEndCLB = () => {
    if (touchStartCLB !== null && touchCurrentCLB !== null) {
      const diff = touchCurrentCLB - touchStartCLB;
      if (diff < -45) nextClub();
      else if (diff > 45) prevClub();
    }
    setTouchStartCLB(null);
    setTouchCurrentCLB(null);
    setDragOffsetCLB(0);
  };

  const handleMouseDownCLB = (e: React.MouseEvent) => {
    setIsDraggingCLB(true);
    setTouchStartCLB(e.clientX);
    setTouchCurrentCLB(e.clientX);
  };
  const handleMouseMoveCLB = (e: React.MouseEvent) => {
    if (!isDraggingCLB || touchStartCLB === null) return;
    setTouchCurrentCLB(e.clientX);
    const diff = e.clientX - touchStartCLB;
    setDragOffsetCLB(Math.max(-100, Math.min(100, diff * 0.75)));
  };
  const handleMouseUpCLB = () => {
    if (isDraggingCLB && touchStartCLB !== null && touchCurrentCLB !== null) {
      const diff = touchCurrentCLB - touchStartCLB;
      if (diff < -45) nextClub();
      else if (diff > 45) prevClub();
    }
    setIsDraggingCLB(false);
    setTouchStartCLB(null);
    setTouchCurrentCLB(null);
    setDragOffsetCLB(0);
  };

  const currentClub = allClubs[activeClubIndex];

  // -------------------------------------------------------------
  // 2. MOBILE RESPONSIVE SWIPE STATE FOR GÓC THẤT LẠC (Lost & Found)
  // -------------------------------------------------------------
  const [activeLostIndex, setActiveLostIndex] = useState(0);
  const [touchStartLost, setTouchStartLost] = useState<number | null>(null);
  const [touchCurrentLost, setTouchCurrentLost] = useState<number | null>(null);
  const [isDraggingLost, setIsDraggingLost] = useState(false);
  const [dragOffsetLost, setDragOffsetLost] = useState(0);

  const nextLost = () => {
    setActiveLostIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevLost = () => {
    setActiveLostIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleTouchStartLost = (e: React.TouchEvent) => {
    setTouchStartLost(e.touches[0].clientX);
    setTouchCurrentLost(e.touches[0].clientX);
  };
  const handleTouchMoveLost = (e: React.TouchEvent) => {
    if (touchStartLost === null) return;
    const currentX = e.touches[0].clientX;
    setTouchCurrentLost(currentX);
    const diff = currentX - touchStartLost;
    setDragOffsetLost(Math.max(-100, Math.min(100, diff * 0.75)));
  };
  const handleTouchEndLost = () => {
    if (touchStartLost !== null && touchCurrentLost !== null) {
      const diff = touchCurrentLost - touchStartLost;
      if (diff < -45) nextLost();
      else if (diff > 45) prevLost();
    }
    setTouchStartLost(null);
    setTouchCurrentLost(null);
    setDragOffsetLost(0);
  };

  const handleMouseDownLost = (e: React.MouseEvent) => {
    setIsDraggingLost(true);
    setTouchStartLost(e.clientX);
    setTouchCurrentLost(e.clientX);
  };
  const handleMouseMoveLost = (e: React.MouseEvent) => {
    if (!isDraggingLost || touchStartLost === null) return;
    setTouchCurrentLost(e.clientX);
    const diff = e.clientX - touchStartLost;
    setDragOffsetLost(Math.max(-100, Math.min(100, diff * 0.75)));
  };
  const handleMouseUpLost = () => {
    if (isDraggingLost && touchStartLost !== null && touchCurrentLost !== null) {
      const diff = touchCurrentLost - touchStartLost;
      if (diff < -45) nextLost();
      else if (diff > 45) prevLost();
    }
    setIsDraggingLost(false);
    setTouchStartLost(null);
    setTouchCurrentLost(null);
    setDragOffsetLost(0);
  };

  const currentLost = filteredItems[activeLostIndex] || filteredItems[0];

  return (
    <section id="do-that-lac" className="relative w-full py-10 sm:py-16 bg-[#FAF9F6] border-b border-[#E6E1D6] overflow-hidden">
      {/* Background Architectural Grid */}
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Split Two Columns Layout from Wireframe */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          {/* ========================================================
              LEFT COLUMN: CLB (Clubs & Extracurriculars)
             ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: CLB with clean double underline */}
              <div className="border-b-2 border-[#991B1B] pb-2.5 mb-6 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    HOẠT ĐỘNG NGOẠI KHÓA
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                    CLB
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-stone-500">
                  28 Câu Lạc Bộ
                </span>
              </div>

              {/* ----------------------------------------------------
                  1. CLB RESPONSIVE / MOBILE CARD SWIPE CAROUSEL (Y hệt Nhà trường)
                  Active on mobile/tablet (md:hidden)
                 ---------------------------------------------------- */}
              <div className="md:hidden flex flex-col justify-between border-2 border-[#991B1B] bg-white p-4 shadow-md relative select-none touch-pan-y mb-6">
                
                {/* Swipeable container */}
                <div
                  onTouchStart={handleTouchStartCLB}
                  onTouchMove={handleTouchMoveCLB}
                  onTouchEnd={handleTouchEndCLB}
                  onMouseDown={handleMouseDownCLB}
                  onMouseMove={handleMouseMoveCLB}
                  onMouseUp={handleMouseUpCLB}
                  onMouseLeave={handleMouseUpCLB}
                  className="cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
                  style={{
                    transform: `translateX(${dragOffsetCLB}px)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-white bg-[#991B1B] px-2 py-0.5 uppercase">
                      {currentClub.category}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500 font-semibold">
                      CLB 0{activeClubIndex + 1} / 0{allClubs.length}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1C1917] hover:text-[#991B1B] transition-colors uppercase leading-snug">
                    {currentClub.name}
                  </h3>

                  <div className="relative mt-3">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel={currentClub.badgeText}
                      theme="club"
                      aspectRatio="16:9"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-0.5 text-[11px] font-mono font-bold text-[#991B1B] border border-stone-300 shadow-xs">
                      {currentClub.members} Thành viên
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-stone-600 leading-relaxed font-normal line-clamp-3">
                    {currentClub.description}
                  </p>
                </div>

                {/* Mobile Swipe Hint Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] py-1.5 px-3 border border-[#FCA5A5]/40 mt-3">
                  <span className="animate-pulse">👈 Vuốt sang trái / phải để đổi CLB 👉</span>
                </div>

                {/* Bottom Pagination Dash Indicators & Prev/Next */}
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {allClubs.map((club, idx) => (
                      <button
                        key={club.id}
                        onClick={() => setActiveClubIndex(idx)}
                        aria-label={`CLB ${idx + 1}`}
                        className={`h-2 transition-all cursor-pointer ${
                          activeClubIndex === idx
                            ? 'w-8 bg-[#991B1B]'
                            : 'w-3 bg-stone-300 hover:bg-stone-400'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevClub}
                      aria-label="CLB trước"
                      className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextClub}
                      aria-label="CLB kế tiếp"
                      className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Đăng ký tham gia: ${currentClub.badgeText}`)}
                      className="px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Đăng Ký
                    </button>
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------
                  2. CLB DESKTOP LAYOUT (Matches Wireframe drawing)
                  Active on md screens and above (hidden md:flex)
                 ---------------------------------------------------- */}
              <div className="hidden md:flex flex-col gap-5">
                
                {/* Top Big Card */}
                <div className="border border-[#E2DDD3] bg-white p-4 shadow-xs group hover:border-[#991B1B] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 border border-[#FCA5A5]/40">
                      {CLUBS_DATA.featured.category}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {CLUBS_DATA.featured.members} Thành viên
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug">
                    {CLUBS_DATA.featured.name}
                  </h3>

                  <div className="mt-3 relative">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel={CLUBS_DATA.featured.badgeText}
                      theme="club"
                      aspectRatio="16:9"
                    />
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {CLUBS_DATA.featured.description}
                  </p>
                </div>

                {/* Bottom Split into 2 Sub-Cards Side by Side (As in Wireframe) */}
                <div className="grid grid-cols-2 gap-4">
                  {CLUBS_DATA.secondary.map((subClub) => (
                    <div
                      key={subClub.id}
                      className="border border-[#E2DDD3] bg-white p-3.5 shadow-xs group hover:border-[#991B1B] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-[#991B1B] bg-[#FEF2F2] px-1.5 py-0.5 border border-[#FCA5A5]/30">
                            {subClub.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {subClub.members} TV
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug line-clamp-2">
                          {subClub.name}
                        </h4>

                        <div className="mt-2.5">
                          <EduImageFrame
                            label="ẢNH TIN"
                            subLabel={subClub.badgeText}
                            theme={subClub.id === 'club-sub-1' ? 'campus' : 'lab'}
                            aspectRatio="4:3"
                          />
                        </div>
                      </div>

                      <p className="mt-2.5 text-[11px] text-stone-600 line-clamp-2">
                        {subClub.description}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* CLB Footer Links */}
            <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                Đăng ký CLB: Tháng 9 hàng năm
              </span>
              <button
                onClick={() => alert('Cổng đăng ký CLB trực tuyến mở đến 30/09/2026')}
                className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
              >
                Đăng Ký Tham Gia CLB →
              </button>
            </div>
          </div>

          {/* ========================================================
              VERTICAL DIVIDER LINE (Between CLB & Góc thất lạc)
             ======================================================== */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#E7E2D9] -translate-x-1/2" />

          {/* ========================================================
              RIGHT COLUMN: GÓC THẤT LẠC (Lost & Found)
             ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: Góc thất lạc with clean double underline */}
              <div className="border-b-2 border-[#991B1B] pb-2.5 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    HỖ TRỢ HỌC ĐƯỜNG
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                    Góc thất lạc
                  </h2>
                </div>

                {/* Filter & Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterType(filterType === 'all' ? 'pending' : 'all')}
                    className="text-xs font-semibold px-2.5 py-1 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                  >
                    {filterType === 'all' ? 'Chưa nhận' : 'Tất cả'}
                  </button>
                  <button
                    onClick={onOpenReportLostModal}
                    className="flex items-center gap-1 px-3 py-1 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Báo Mất Đồ</span>
                  </button>
                </div>
              </div>

              {/* ----------------------------------------------------
                  1. GÓC THẤT LẠC RESPONSIVE / MOBILE CARD SWIPE CAROUSEL (Y hệt Nhà trường)
                  Active on mobile/tablet (md:hidden)
                 ---------------------------------------------------- */}
              {currentLost && (
                <div className="md:hidden flex flex-col justify-between border-2 border-[#991B1B] bg-white p-4 shadow-md relative select-none touch-pan-y mb-6">
                  
                  {/* Swipeable container */}
                  <div
                    onTouchStart={handleTouchStartLost}
                    onTouchMove={handleTouchMoveLost}
                    onTouchEnd={handleTouchEndLost}
                    onMouseDown={handleMouseDownLost}
                    onMouseMove={handleMouseMoveLost}
                    onMouseUp={handleMouseUpLost}
                    onMouseLeave={handleMouseUpLost}
                    className="cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
                    style={{
                      transform: `translateX(${dragOffsetLost}px)`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-white bg-[#991B1B] px-2 py-0.5 uppercase">
                        {currentLost.itemType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                            currentLost.status === 'claimed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
                          }`}
                        >
                          {currentLost.status === 'claimed' ? 'ĐÃ NHẬN LẠI' : 'CHƯA NHẬN'}
                        </span>
                        <span className="text-[11px] font-mono text-stone-500 font-semibold">
                          0{activeLostIndex + 1} / 0{filteredItems.length}
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectLostItem(currentLost)}
                      className="text-base font-bold text-[#1C1917] hover:text-[#991B1B] transition-colors uppercase leading-snug cursor-pointer"
                    >
                      {currentLost.title}
                    </h3>

                    {/* TWO COMPACT PHOTO SLOTS SIDE BY SIDE AS IN WIREFRAME */}
                    <div
                      onClick={() => onSelectLostItem(currentLost)}
                      className="grid grid-cols-2 gap-2 mt-3 cursor-pointer"
                    >
                      <div className="h-20">
                        <EduImageFrame
                          label="ẢNH ĐỒ 1"
                          subLabel={currentLost.images[0]}
                          theme="lost"
                          aspectRatio="compact"
                          compact={true}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="h-20">
                        <EduImageFrame
                          label="ẢNH ĐỒ 2"
                          subLabel={currentLost.images[1]}
                          theme="lost"
                          aspectRatio="compact"
                          compact={true}
                          className="h-full w-full"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-stone-600 leading-relaxed font-normal line-clamp-3">
                      {currentLost.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-[#991B1B] shrink-0" />
                        <span className="truncate">{currentLost.locationFound}</span>
                      </span>
                      <span>Ngày nhặt: {currentLost.dateFound}</span>
                    </div>
                  </div>

                  {/* Mobile Swipe Hint Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] py-1.5 px-3 border border-[#FCA5A5]/40 mt-3">
                    <span className="animate-pulse">👈 Vuốt sang trái / phải để xem đồ khác 👉</span>
                  </div>

                  {/* Bottom Pagination Dash Indicators & Prev/Next */}
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {filteredItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveLostIndex(idx)}
                          aria-label={`Vật phẩm ${idx + 1}`}
                          className={`h-2 transition-all cursor-pointer ${
                            activeLostIndex === idx
                              ? 'w-8 bg-[#991B1B]'
                              : 'w-3 bg-stone-300 hover:bg-stone-400'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevLost}
                        aria-label="Đồ trước"
                        className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextLost}
                        aria-label="Đồ kế tiếp"
                        className="w-9 h-9 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center text-stone-700 hover:text-[#991B1B] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectLostItem(currentLost)}
                        className="px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Nhận Lại
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------------------------------------------
                  2. GÓC THẤT LẠC DESKTOP LAYOUT (3 Rows with compact 2 photos side by side)
                  Active on md screens and above (hidden md:flex)
                 ---------------------------------------------------- */}
              <div className="hidden md:flex flex-col gap-3 sm:gap-3.5">
                {filteredItems.map((lostItem) => (
                  <div
                    key={lostItem.id}
                    onClick={() => onSelectLostItem(lostItem)}
                    className="group cursor-pointer border border-[#E2DDD3] bg-white hover:border-[#991B1B] transition-all p-3 shadow-xs"
                  >
                    {/* Header line of the item row: Item title & status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-xs font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase truncate">
                          {lostItem.title}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          #{lostItem.id}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border shrink-0 ${
                          lostItem.status === 'claimed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]'
                        }`}
                      >
                        {lostItem.status === 'claimed' ? 'ĐÃ NHẬN LẠI' : 'CHƯA NHẬN'}
                      </span>
                    </div>

                    {/* TWO COMPACT PHOTO SLOTS SIDE BY SIDE AS IN WIREFRAME */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1.5 max-w-[280px] sm:max-w-[320px]">
                      <div className="h-14 sm:h-18">
                        <EduImageFrame
                          label="ẢNH ĐỒ"
                          subLabel={lostItem.images[0]}
                          theme="lost"
                          aspectRatio="compact"
                          compact={true}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="h-14 sm:h-18">
                        <EduImageFrame
                          label="ẢNH ĐỒ"
                          subLabel={lostItem.images[1]}
                          theme="lost"
                          aspectRatio="compact"
                          compact={true}
                          className="h-full w-full"
                        />
                      </div>
                    </div>

                    {/* Exact Text from Wireframe under the photos */}
                    <div className="mt-2">
                      <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-2">
                        {lostItem.description}
                      </p>

                      <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-[#991B1B] shrink-0" />
                          <span className="truncate">{lostItem.locationFound}</span>
                        </span>
                        <span className="font-semibold text-[#991B1B] group-hover:underline shrink-0">
                          Xem chi tiết / Nhận lại →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note on receiving lost items */}
            <div className="mt-5 pt-3 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <span>Địa điểm nhận: Phòng Quản sinh (Nhà B, Tầng 1)</span>
              <span className="font-mono text-[#991B1B]">Hotline: 024 3823 3123</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
