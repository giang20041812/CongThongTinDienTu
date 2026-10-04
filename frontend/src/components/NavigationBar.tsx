import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown, Calendar, Clock, CloudSun } from 'lucide-react';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onSearch: (query: string) => void;
  onOpenQuickModal: (type: 'tkb' | 'calendar' | 'reportLost') => void;
}

const navItems = [
  { id: 'trang-chu', label: 'TRANG CHỦ' },
  { id: 'tin-tuc', label: 'TIN TỨC - SỰ KIỆN' },
  { id: 'thong-bao', label: 'THÔNG BÁO' },
  { id: 'tkb', label: 'THỜI KHÓA BIỂU' },
  { id: 'lich-lam-viec', label: 'LỊCH LÀM VIỆC' },
  { id: 'du-hoc', label: 'DU HỌC' },
  { id: 'tuyen-sinh', label: 'TUYỂN SINH' },
];

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onTabChange, isMobileMenuOpen, onToggleMobileMenu, onSearch, onOpenQuickModal }) => {
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkScrollState = () => {
    const el = navContainerRef.current;
    if (el) { setCanScrollLeft(el.scrollLeft > 5); setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5); }
  };

  useEffect(() => {
    window.addEventListener('resize', checkScrollState);
    checkScrollState();
    return () => { window.removeEventListener('resize', checkScrollState); };
  }, []);

  const scrollNav = (amount: number) => { 
    navContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' }); 
    window.setTimeout(checkScrollState, 300); 
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  return (
    <div className="sticky top-0 z-50 w-full relative">
      <div className="bg-gradient-to-b from-[#2080c3] to-[#0b63a8] text-white select-none border-t border-[#005a96] shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            className="lg:hidden shrink-0 mr-2 p-2 text-white hover:bg-white/10 rounded"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-white transition-transform ${isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition-transform ${isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
            </div>
          </button>

          <div className="flex-1 relative flex items-center overflow-hidden">
            {canScrollLeft && (
              <button onClick={() => scrollNav(-220)} aria-label="Cuộn sang trái" className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-[#0072bc] to-transparent flex items-center pl-1 hover:text-[#FFD700] cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <div ref={navContainerRef} onScroll={checkScrollState} className="flex items-end overflow-x-auto scrollbar-none w-full touch-pan-x scroll-smooth relative pt-1.5">
              {navItems.map(item => (
                <div key={item.id} className="relative group">
                  <button 
                    onClick={() => { onTabChange(item.id); if (isMobileMenuOpen) onToggleMobileMenu(); }}
                    className={`relative px-3 sm:px-5 font-bold whitespace-nowrap flex items-center justify-center gap-1 transition-colors cursor-pointer text-[12px] sm:text-[13px]
                      ${activeTab === item.id 
                        ? 'bg-white text-[#0060a0] rounded-tl-[12px] rounded-tr-[12px] pt-2.5 pb-2 sm:pt-3 sm:pb-2.5' 
                        : 'text-white hover:bg-white/10 py-2.5 sm:py-3'}
                    `}
                  >
                    {item.label}
                    {item.id !== 'trang-chu' && item.id !== 'lien-he' && (
                      <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button onClick={() => scrollNav(220)} aria-label="Cuộn sang phải" className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-[#0072bc] to-transparent flex items-center justify-end pr-1 hover:text-[#FFD700] cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search bar removed from here as it is now in the Header ticker row */}
        </div>
      </div>

      {/* Breaking News Ticker & Search Bar Row */}
      <div className="bg-white border-b border-black/10 overflow-visible py-2 px-3 sm:px-4 text-xs shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
          
          {/* Left: Date & Weather */}
          <div className="flex flex-col text-black text-[11px] font-bold shrink-0 border-r border-black/20 pr-3 justify-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <span>Hà Nội</span>
              <span>_</span>
              <span>28°C</span>
              <span>_</span>
              <CloudSun className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-[10px] text-gray-700">
              {currentTime.toLocaleDateString('vi-VN')} {currentTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>

          {/* Middle: Breaking News Ticker */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-extrabold tracking-wider uppercase shrink-0 text-red-600">
              ĐIỂM TIN
            </span>
            <div className="overflow-hidden relative flex-1 text-black font-medium text-[11px] sm:text-xs">
              <marquee className="flex items-center whitespace-nowrap pt-1">
                Trường THPT Đặng Trần Đức thông báo kế hoạch tổ chức hoạt động giáo dục trải nghiệm năm học 2026–2027. Lễ Khai giảng toàn quốc diễn ra ngày 5/9/2026.
              </marquee>
            </div>
          </div>

          {/* Right: Search Bar */}
          <div className="w-full lg:w-64 shrink-0 mt-2 lg:mt-0">
            <form onSubmit={submitSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, quy chế..."
                className="w-full h-8 pl-3 pr-8 text-xs bg-white border border-[#c5d3ec] focus:border-black focus:ring-1 focus:ring-[#003087] placeholder:text-gray-500 focus:outline-none transition-all text-black"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-[#78716C] hover:text-black transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-black shadow-lg">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { onTabChange(item.id); onToggleMobileMenu(); }} className={`w-full px-4 py-3 text-left text-sm font-bold border-b border-[#e8eef8] flex items-center justify-between ${activeTab === item.id ? 'bg-transparent text-black border-l-4 border-[#FFD700]' : 'text-[#1a2744]'}`}>
              {item.label}
              {item.id !== 'trang-chu' && item.id !== 'lien-he' && (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          ))}
          <form onSubmit={submitSearch} className="p-3 bg-gray-50">
            <div className="relative w-full">
              <input 
                value={searchQuery} 
                onChange={(event) => setSearchQuery(event.target.value)} 
                placeholder="Tìm kiếm..." 
                className="w-full h-10 pl-3 pr-10 text-sm border border-gray-300 text-black focus:outline-none" 
              />
              <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500 cursor-pointer">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

