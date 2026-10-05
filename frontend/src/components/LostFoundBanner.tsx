import React, { useEffect, useState, useRef } from 'react';
import { Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLostItems } from '../api';
import { EduImageFrame } from './EduImageFrame';
import { motion } from 'motion/react';

interface LostFoundBannerProps {
  onSelectLostItem: (item: any) => void;
  onOpenReportLostModal: () => void;
}

export const LostFoundBanner: React.FC<LostFoundBannerProps> = ({
  onSelectLostItem,
  onOpenReportLostModal,
}) => {
  const { data: lostItems, loading } = useLostItems();
  const ALL_LOST_ITEMS = lostItems.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    itemType: item.itemType || 'KHÁC',
    dateFound: new Date(item.dateFound || item.createdAt).toLocaleDateString('vi-VN'),
    locationFound: item.locationFound || 'Trường THPT Đặng Trần Đức',
    images: ['Đồ thất lạc', 'Đồ thất lạc'],
    imgUrl: item.imgUrl || item.imageUrl
  }));

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
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="w-full bg-white border-b border-[#B8D3E2] py-5 sm:py-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-end gap-3 border-b-[3px] border-[#00a3bf] pb-2.5">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#00a3bf] font-bold block">HỖ TRỢ HỌC ĐƯỜNG</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gradient tracking-tight uppercase">Góc thất lạc</h2>
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
                  ? 'border-[#00d2ff] text-black hover:bg-[#00d2ff] hover:text-white'
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
                  ? 'border-[#00d2ff] text-black hover:bg-[#00d2ff] hover:text-white'
                  : 'border-white/20 text-white/20 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenReportLostModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d2ff] hover:bg-[#0052cc] text-white text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ml-1"
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
                className="lost-found-card flex-shrink-0 w-56 sm:w-64 bg-white border-t-[4px] border-[#00a3bf] p-4 cursor-pointer group glass-card hover-lift rounded-xl"
              >
                {/* Status badge + type */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono bg-gradient-brand text-white px-2 py-1 rounded-md uppercase tracking-wide">
                    {item.itemType}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded-md border ${
                      item.status === 'claimed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-red-50 text-red-600 border-red-200'
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
                      imageUrl={item.imgUrl}
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
                      imageUrl={item.imgUrl}
                    />
                  </div>
                </div>

                {/* Title */}
                <h4 className="relative z-10 block text-sm font-bold text-gray-800 group-hover:text-[#00a3bf] transition-colors leading-snug line-clamp-2 uppercase mt-2">
                  {item.title}
                </h4>

                {/* Location + date */}
                <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-black">
                  <MapPin className="w-3 h-3 shrink-0 text-black" />
                  <span className="truncate">{item.locationFound}</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-black">
                  Ngày nhặt: {item.dateFound}
                </div>
              </div>
            ))}

            {/* "Xem tất cả" card at end */}
            <div
              onClick={onOpenReportLostModal}
              className="flex-shrink-0 w-40 sm:w-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#00a3bf]/50 cursor-pointer hover:border-[#00a3bf] hover:bg-[#00a3bf]/5 transition-all group p-4 rounded-xl"
            >
              <Plus className="w-10 h-10 text-[#00a3bf]/60 group-hover:text-[#00a3bf] group-hover:scale-110 transition-all" />
              <span className="text-xs text-[#00a3bf]/80 group-hover:text-[#00a3bf] font-bold uppercase tracking-wide text-center transition-colors">
                Báo mất đồ hoặc xem thêm
              </span>
            </div>
          </div>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Xem đồ thất lạc trước"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto w-8 h-12 sm:w-9 flex items-center justify-center bg-white border-2 border-[#00d2ff] shadow-md transition-all ${canScrollLeft ? 'text-black hover:bg-[#00d2ff] hover:text-white' : 'text-[#9bb8c9] cursor-not-allowed'}`}
          ><ChevronLeft className="w-5 h-5" /></button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Xem đồ thất lạc tiếp theo"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto w-8 h-12 sm:w-9 flex items-center justify-center bg-white border-2 border-[#00d2ff] shadow-md transition-all ${canScrollRight ? 'text-black hover:bg-[#00d2ff] hover:text-white' : 'text-[#9bb8c9] cursor-not-allowed'}`}
          ><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Mobile hint */}
        <div className="mt-3 text-center sm:hidden">
          <span className="text-[10px] text-blue-300 font-mono animate-pulse">
            👈 Vuốt ngang để xem thêm 👉
          </span>
        </div>

      </div>
    </motion.section>
  );
};


