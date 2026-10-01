import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Calendar, Clock, AlertCircle, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
  onOpenQuickModal: (type: 'tkb' | 'calendar' | 'reportLost') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSearch,
  onOpenQuickModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Horizontal Navigation Scroll & Drag State
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const hasDragged = useRef(false);

  const checkScrollState = () => {
    if (navContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, []);

  // Auto-scroll active tab into view when activeTab changes
  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
      setTimeout(checkScrollState, 300);
    }
  }, [activeTab]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      navContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollState, 300);
    }
  };

  // Mouse drag-to-swipe handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navContainerRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - navContainerRef.current.offsetLeft;
    scrollLeftPos.current = navContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !navContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - navContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity
    if (Math.abs(walk) > 4) {
      hasDragged.current = true;
    }
    navContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
    checkScrollState();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    checkScrollState();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsMobileMenuOpen(false);
    }
  };

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

  const handleNavItemClick = (item: typeof navItems[0]) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onTabChange(item.id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E5E0D8] relative z-40">
      {/* Top Utility Meta Strip */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE6DE] px-3 sm:px-4 py-1.5 text-xs text-[#57534E]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Slogan & Authority */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-[#991B1B] uppercase tracking-wider text-[10px] sm:text-[11px]">
              SỞ GD&ĐT HÀ NỘI
            </span>
            <span className="text-[#D6D3D1]">/</span>
            <span className="hidden sm:inline font-medium text-[#78716C] text-[11px]">
              Cổng thông tin điện tử tích hợp 2026–2027
            </span>
            <span className="sm:hidden font-medium text-[#78716C] text-[10px]">
              Cổng thông tin 2026
            </span>
          </div>

          {/* Contact Details from Wireframe */}
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-sans">
            <span className="hidden md:flex items-center gap-1.5 hover:text-[#991B1B] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#B91C1C]" />
              {SCHOOL_INFO.address}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 hover:text-[#991B1B] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#B91C1C]" />
              {SCHOOL_INFO.email}
            </span>
            <a
              href={`tel:${SCHOOL_INFO.hotline}`}
              className="flex items-center gap-1.5 font-bold text-[#991B1B]"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B91C1C]" />
              <span>{SCHOOL_INFO.hotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Branding & Search Header (Direct Match with Wireframe Top Row) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Top Row on Mobile: Brand Lockup + Mobile Menu Button */}
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => onTabChange('trang-chu')}
              className="flex items-center gap-3 sm:gap-5 cursor-pointer group"
            >
              {/* Logo Circle as requested in wireframe */}
              <div className="w-13 h-13 sm:w-18 sm:h-18 lg:w-20 lg:h-20 shrink-0 border-2 border-[#991B1B] bg-[#FAF8F5] flex flex-col items-center justify-center p-1 text-center relative group-hover:border-[#7F1D1D] shadow-xs">
                <div className="w-full h-full border border-[#B91C1C]/40 flex flex-col items-center justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#991B1B] tracking-wider leading-none">CVA</span>
                  <span className="text-xs sm:text-sm font-black tracking-widest text-[#7F1D1D] mt-0.5">Logo</span>
                  <div className="w-3 sm:w-4 h-[1.5px] bg-[#991B1B] mt-1" />
                </div>
              </div>

              {/* School Name & Slogan */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#B91C1C] uppercase tracking-wider">
                  {SCHOOL_INFO.secondaryName}
                </div>
                <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#1C1917] leading-tight mt-0.5 uppercase">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-[11px] sm:text-sm font-medium text-[#78716C] tracking-wide mt-0.5 italic line-clamp-1">
                  {SCHOOL_INFO.slogan}
                </p>
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Mở menu"
                className="w-10 h-10 border border-stone-300 bg-[#FAF9F6] text-[#991B1B] flex items-center justify-center hover:bg-[#FEF2F2] active:bg-[#991B1B] active:text-white transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Right Area: Search Bar & Fast Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 lg:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Tìm kiếm bài viết, đề thi, quy chế..."
                className={`w-full h-9 sm:h-10 pl-3 pr-10 text-xs sm:text-sm bg-[#FFFFFF] border ${
                  isSearchFocused ? 'border-[#991B1B] ring-1 ring-[#991B1B]' : 'border-[#D6D3D1]'
                } placeholder:text-[#A8A29E] focus:outline-none transition-all`}
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#78716C] hover:text-[#991B1B] hover:bg-[#FAF8F5] transition-colors"
              >
                <Search className="w-4 h-4 text-[#991B1B]" />
              </button>
            </form>

            {/* Quick Action Button: Báo Mất Đồ */}
            <button
              onClick={() => onOpenQuickModal('reportLost')}
              className="flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold tracking-wide whitespace-nowrap transition-colors border border-[#7F1D1D] shadow-xs cursor-pointer shrink-0"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Báo Mất Đồ</span>
              <span className="xs:hidden">Báo Mất</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Horizontal Navigation Bar with HORIZONTAL SWIPE & DRAG SUPPORT */}
      <nav className="bg-[#991B1B] text-white relative select-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center">
          
          {/* Left Arrow Button for Horizontal Scrolling */}
          {canScrollLeft && (
            <button
              onClick={() => scrollNav('left')}
              aria-label="Cuộn sang trái"
              className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-[#7F1D1D] via-[#7F1D1D]/90 to-transparent flex items-center justify-start pl-1 text-white hover:text-white transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 drop-shadow-sm" />
            </button>
          )}

          {/* Swipeable / Draggable Menu Track */}
          <div
            ref={navContainerRef}
            onScroll={checkScrollState}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex items-center overflow-x-auto scrollbar-none w-full border-t border-[#7F1D1D] touch-pan-x cursor-grab active:cursor-grabbing scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-active={isActive}
                  onClick={() => handleNavItemClick(item)}
                  className={`relative px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#7F1D1D] text-white'
                      : 'text-white/90 hover:bg-[#8B1A1A] hover:text-white'
                  }`}
                >
                  {item.id === 'tkb' && <Clock className="w-3.5 h-3.5 opacity-80" />}
                  {item.id === 'lich-lam-viec' && <Calendar className="w-3.5 h-3.5 opacity-80" />}
                  {item.label}
                  {/* Distinct Wireframe Underline Indicator Bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFFFFF] shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button for Horizontal Scrolling */}
          {canScrollRight && (
            <button
              onClick={() => scrollNav('right')}
              aria-label="Cuộn sang phải"
              className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-[#7F1D1D] via-[#7F1D1D]/90 to-transparent flex items-center justify-end pr-1 text-white hover:text-white transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 drop-shadow-sm" />
            </button>
          )}

        </div>
      </nav>

      {/* Mobile Drawer Menu (When Hamburger is Clicked on Phones) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-[#991B1B] shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-stone-200 bg-[#FAF9F6] flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold text-[#991B1B] uppercase tracking-wider">
              DANH MỤC ĐIỀU HƯỚNG NHANH
            </div>
            <span className="text-[11px] text-stone-500 font-mono">8 Chuyên mục</span>
          </div>
          <div className="divide-y divide-stone-100">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item)}
                className={`w-full px-4 py-3 text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#FEF2F2] text-[#991B1B] border-l-4 border-[#991B1B]'
                    : 'text-stone-800 hover:bg-[#FEF2F2] hover:text-[#991B1B]'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modern Breaking News / Date Ticker strip */}
      <div className="bg-[#FEF2F2] border-b border-[#FECACA] overflow-hidden py-1.5 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-[#991B1B] text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0">
            <span>ĐIỂM TIN</span>
          </div>
          <div className="overflow-hidden relative flex-1 text-[#991B1B] font-medium truncate text-[11px] sm:text-xs">
            <span>
              Hội đồng khảo thí cụm Gia Lâm - Long Biên công bố ma trận đề thi và khung điểm chuẩn năm học 2026–2027. Lễ Khai giảng toàn quốc diễn ra ngày 5/9/2026.
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-[#78716C] text-[11px] font-mono shrink-0">
            <span>Hà Nội: 28°C</span>
            <span>·</span>
            <span>Năm học: 2026–2027</span>
          </div>
        </div>
      </div>
    </header>
  );
};
