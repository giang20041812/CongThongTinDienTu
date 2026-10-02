import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, Cloud, Search } from 'lucide-react';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onSearch: (query: string) => void;
  onOpenQuickModal: (type: 'tkb' | 'calendar' | 'reportLost') => void;
}

const navItems = [
  { id: 'trang-chu', label: 'Trang chủ' },
  { id: 'tin-tuc', label: 'Tin tức - Sự kiện' },
  { id: 'thong-bao', label: 'Thông Báo' },
  { id: 'tuyen-sinh', label: 'Tuyển sinh' },
  { id: 'du-hoc', label: 'Du Học' },
  { id: 'tkb', label: 'TKB' },
  { id: 'lich-lam-viec', label: 'Lịch làm việc' },
  { id: 'do-that-lac', label: 'Đồ thất lạc' },
];

function useHanoiWeather() {
  const [weather, setWeather] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m&timezone=Asia%2FBangkok');
        if (!response.ok) throw new Error('Weather request failed');
        const data = await response.json();
        if (active) setWeather(data.current?.temperature_2m ?? null);
      } catch {
        if (active) setWeather(null);
      }
    };
    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return weather;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date);
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onTabChange, isMobileMenuOpen, onToggleMobileMenu, onSearch, onOpenQuickModal }) => {
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [now, setNow] = useState(() => formatDateTime(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const weather = useHanoiWeather();

  const checkScrollState = () => {
    const el = navContainerRef.current;
    if (el) { setCanScrollLeft(el.scrollLeft > 5); setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5); }
  };
  useEffect(() => {
    const timer = window.setInterval(() => setNow(formatDateTime(new Date())), 1000);
    window.addEventListener('resize', checkScrollState);
    checkScrollState();
    return () => { window.clearInterval(timer); window.removeEventListener('resize', checkScrollState); };
  }, []);
  const scrollNav = (amount: number) => { navContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' }); window.setTimeout(checkScrollState, 300); };
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  return <div className="sticky top-0 z-50 relative">
    <div className="bg-[#003087] text-white select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center">
        {canScrollLeft && <button onClick={() => scrollNav(-220)} aria-label="Cuộn sang trái" className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-[#001a52] to-transparent flex items-center pl-1 hover:text-[#FFD700]"><ChevronLeft className="w-5 h-5" /></button>}
        <div ref={navContainerRef} onScroll={checkScrollState} className="flex items-center overflow-x-auto scrollbar-none w-full border-t border-[#001a52]/60 touch-pan-x scroll-smooth">
          {navItems.map(item => <button key={item.id} data-active={activeTab === item.id} onClick={() => { onTabChange(item.id); if (isMobileMenuOpen) onToggleMobileMenu(); }} className={`relative px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap flex items-center gap-1.5 shrink-0 ${activeTab === item.id ? 'bg-[#001a52] text-[#FFD700]' : 'text-white/90 hover:bg-[#002060]'}`}>
            {item.id === 'tkb' && <Clock className="w-3.5 h-3.5 opacity-80" />}{item.id === 'lich-lam-viec' && <Calendar className="w-3.5 h-3.5 opacity-80" />}{item.label}
            {activeTab === item.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#55B9E8] shadow-sm" />}
          </button>)}
        </div>
        {canScrollRight && <button onClick={() => scrollNav(220)} aria-label="Cuộn sang phải" className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-[#001a52] to-transparent flex items-center justify-end pr-1 hover:text-[#FFD700]"><ChevronRight className="w-5 h-5" /></button>}
      </div>
    </div>
    <div className="navigation-search-row bg-white border-b border-[#B8D3E2] px-3 sm:px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-end gap-2 sm:gap-3">
        <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm bài viết, đề thi, quy chế..." className="w-full h-9 pl-3 pr-10 text-xs sm:text-sm bg-white border border-[#B8D3E2] text-[#17324D] placeholder:text-[#7895AD] focus:border-[#0B78B5] focus:ring-1 focus:ring-[#0B78B5] focus:outline-none" />
          <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#0875B1] hover:bg-[#EAF3F8] cursor-pointer"><Search className="w-4 h-4" /></button>
        </form>
        <button onClick={() => onOpenQuickModal('reportLost')} className="flex items-center gap-1.5 h-9 px-3 sm:px-3.5 bg-[#0B78B5] hover:bg-[#075F91] text-white text-xs font-semibold tracking-wide whitespace-nowrap cursor-pointer"><AlertCircle className="w-3.5 h-3.5" /><span>Báo mất đồ</span></button>
      </div>
    </div>
    {isMobileMenuOpen && <div className="lg:hidden bg-white border-b-2 border-[#003087] shadow-lg">{navItems.map(item => <button key={item.id} onClick={() => { onTabChange(item.id); onToggleMobileMenu(); }} className={`w-full px-4 py-3 text-left text-sm font-bold border-b border-[#e8eef8] ${activeTab === item.id ? 'bg-[#e8eef8] text-[#003087] border-l-4 border-[#FFD700]' : 'text-[#1a2744]'}`}>{item.label}</button>)}</div>}
    <div className="bg-[#fff8e1] border-b border-[#FFD700]/40 overflow-hidden py-1.5 px-3 sm:px-4 text-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
        <div className="bg-[#003087] text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0">ĐIỂM TIN</div>
        <div className="overflow-hidden relative flex-1 text-[#003087] font-medium text-[11px] sm:text-xs whitespace-nowrap"><div className="animate-marquee w-max"><span className="pr-16">Trường THPT Đặng Trần Đức thông báo kế hoạch tổ chức hoạt động giáo dục trải nghiệm năm học 2026–2027. Lễ Khai giảng toàn quốc diễn ra ngày 5/9/2026.</span><span>Trường THPT Đặng Trần Đức thông báo kế hoạch tổ chức hoạt động giáo dục trải nghiệm năm học 2026–2027.</span></div></div>
        <div className="flex items-center gap-2 sm:gap-3 text-[#6b82b8] text-[10px] sm:text-[11px] font-mono shrink-0"><span className="hidden sm:inline-flex items-center gap-1"><Cloud className="w-3.5 h-3.5" />Hà Nội: {weather === null ? 'đang tải…' : `${weather}°C`}</span><span className="hidden sm:inline">·</span><span>{now}</span></div>
      </div>
    </div>
  </div>;
};
