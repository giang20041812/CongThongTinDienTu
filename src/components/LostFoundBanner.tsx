import React, { useEffect, useState, useRef } from 'react';
import { Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ALL_LOST_ITEMS } from '../data/mockData';
import { LostItem } from '../types';
import { EduImageFrame } from './EduImageFrame';

interface LostFoundBannerProps {
  onSelectLostItem: (item: LostItem) => void;
  onOpenReportLostModal: () => void;
}

export const LostFoundBanner: React.FC<LostFoundBannerProps> = ({
  onSelectLostItem,
  onOpenReportLostModal,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const didDragRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft: sl, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(sl > 5);
      setCanScrollRight(sl < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

  // Pointer drag for desktop. Touch devices keep native momentum scrolling.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !scrollRef.current) return;
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragScrollLeftRef.current = scrollRef.current.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const distance = e.clientX - dragStartXRef.current;
    if (Math.abs(distance) > 4) didDragRef.current = true;
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - distance;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const wheelDistance = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      e.preventDefault();
      e.stopPropagation();
      track.scrollLeft = Math.max(0, Math.min(maxScroll, track.scrollLeft + wheelDistance));
    };

    track.addEventListener('wheel', handleWheel, { passive: false });
    return () => track.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="w-full bg-white border-b border-[#B8D3E2] py-5 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-end gap-3 border-b-2 border-[#0B78B5] pb-2.5">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#0B78B5] font-bold block">HỖ TRỢ HỌC ĐƯỜNG</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17324D] tracking-tight uppercase">Góc thất lạc</h2>
            </div>
            <span className="hidden">
              Lướt ngang để xem tất cả đồ thất lạc
            </span>
          </div>
          <div className="lost-found-header-actions flex items-center gap-2">
            {/* Prev/Next buttons */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Xem trước"
              className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${
                canScrollLeft
                  ? 'border-[#55B9E8] text-[#0B78B5] hover:bg-[#55B9E8] hover:text-white'
                  : 'border-white/20 text-white/20 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Xem tiếp"
              className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${
                canScrollRight
                  ? 'border-[#55B9E8] text-[#0B78B5] hover:bg-[#55B9E8] hover:text-white'
                  : 'border-white/20 text-white/20 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenReportLostModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#55B9E8] hover:bg-[#0B78B5] text-white text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Báo Mất Đồ</span>
              <span className="xs:hidden">Báo</span>
            </button>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div className="relative px-0 sm:px-8">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={(e) => { if (didDragRef.current) { e.preventDefault(); e.stopPropagation(); didDragRef.current = false; } }}
            className="lost-found-track flex gap-4 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none touch-pan-x scroll-smooth overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {ALL_LOST_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectLostItem(item)}
                className="lost-found-card flex-shrink-0 w-56 sm:w-64 bg-white border-t-2 border-[#55B9E8] p-3 cursor-pointer group hover:shadow-lg transition-shadow"
              >
                {/* Status badge + type */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono bg-[#003087] text-white px-1.5 py-0.5 uppercase tracking-wide">
                    {item.itemType}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                      item.status === 'claimed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-[#e8eef8] text-[#003087] border-[#c5d3ec]'
                    }`}
                  >
                    {item.status === 'claimed' ? 'ĐÃ NHẬN' : 'CHƯA NHẬN'}
                  </span>
                </div>

                {/* Two image slots side by side */}
                <div className="relative z-0 isolate grid grid-cols-2 gap-1.5 mb-3">
                  <div className="h-16 sm:h-20">
                    <EduImageFrame
                      label="ẢNH"
                      subLabel={item.images[0]}
                      theme="lost"
                      aspectRatio="compact"
                      compact={true}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="h-16 sm:h-20">
                    <EduImageFrame
                      label="ẢNH"
                      subLabel={item.images[1]}
                      theme="lost"
                      aspectRatio="compact"
                      compact={true}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                {/* Title */}
                <h4 className="relative z-10 block text-xs font-bold text-[#1a2744] group-hover:text-[#003087] group-hover:underline transition-colors leading-snug line-clamp-2 uppercase">
                  {item.title}
                </h4>

                {/* Location + date */}
                <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-[#6b82b8]">
                  <MapPin className="w-3 h-3 shrink-0 text-[#0B78B5]" />
                  <span className="truncate">{item.locationFound}</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#9aabd4]">
                  Ngày nhặt: {item.dateFound}
                </div>
              </div>
            ))}

            {/* "Xem tất cả" card at end */}
            <div
              onClick={onOpenReportLostModal}
              className="flex-shrink-0 w-40 sm:w-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#55B9E8]/60 cursor-pointer hover:border-[#0B78B5] transition-colors group p-4"
            >
              <Plus className="w-8 h-8 text-[#0B78B5]/60 group-hover:text-[#0B78B5] transition-colors" />
              <span className="text-xs text-[#0B78B5]/70 group-hover:text-[#0B78B5] font-bold uppercase tracking-wide text-center transition-colors">
                Báo mất đồ hoặc xem thêm
              </span>
            </div>
          </div>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Xem đồ thất lạc trước"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto w-8 h-12 sm:w-9 flex items-center justify-center bg-white border-2 border-[#55B9E8] shadow-md transition-all ${canScrollLeft ? 'text-[#0B78B5] hover:bg-[#55B9E8] hover:text-white' : 'text-[#9bb8c9] cursor-not-allowed'}`}
          ><ChevronLeft className="w-5 h-5" /></button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Xem đồ thất lạc tiếp theo"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto w-8 h-12 sm:w-9 flex items-center justify-center bg-white border-2 border-[#55B9E8] shadow-md transition-all ${canScrollRight ? 'text-[#0B78B5] hover:bg-[#55B9E8] hover:text-white' : 'text-[#9bb8c9] cursor-not-allowed'}`}
          ><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Mobile hint */}
        <div className="mt-3 text-center sm:hidden">
          <span className="text-[10px] text-blue-300 font-mono animate-pulse">
            👈 Vuốt ngang để xem thêm 👉
          </span>
        </div>

      </div>
    </section>
  );
};
