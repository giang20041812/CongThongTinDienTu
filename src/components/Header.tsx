import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Calendar, Clock, AlertCircle, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import schoolLogo from '../assets/logo.jpg';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (query: string) => void;
  onOpenQuickModal: (type: 'tkb' | 'calendar' | 'reportLost') => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSearch,
  onOpenQuickModal,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    const walk = (x - startX.current) * 1.5;
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
      if (isMobileMenuOpen) onToggleMobileMenu();
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
    if (isMobileMenuOpen) onToggleMobileMenu();
  };

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#d1ddf5] relative z-40">
      {/* Top Utility Meta Strip - Deep Navy Blue */}
      <div className="bg-[#003087] border-b border-[#001a52] px-3 sm:px-4 py-1.5 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Slogan & Authority */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-[#FFD700] uppercase tracking-wider text-[10px] sm:text-[11px]">
              SỞ GD&ĐT HÀ NỘI
            </span>
            <span className="text-white/40">/</span>
            <span className="hidden sm:inline font-medium text-white/80 text-[11px]">
              Cổng thông tin điện tử tích hợp 2026–2027
            </span>
            <span className="sm:hidden font-medium text-white/80 text-[10px]">
              Cổng thông tin 2026
            </span>
          </div>

          {/* Contact Details */}
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-sans">
            <span className="hidden md:flex items-center gap-1.5 hover:text-[#FFD700] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#FFD700]" />
              {SCHOOL_INFO.address}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 hover:text-[#FFD700] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#FFD700]" />
              {SCHOOL_INFO.email}
            </span>
            <a
              href={`tel:${SCHOOL_INFO.hotline}`}
              className="flex items-center gap-1.5 font-bold text-[#FFD700]"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD700]" />
              <span>{SCHOOL_INFO.hotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Gold Accent Bar */}
      <div className="h-[3px] gold-accent-bar" />

      {/* Main Branding & Search Header */}
      <div className="header-branding max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Top Row on Mobile: Brand Lockup + Mobile Menu Button */}
          <div className="header-brand-lockup flex items-center justify-between gap-3">
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              className="lg:hidden w-10 h-10 shrink-0 border border-[#003087] bg-[#f5f7fc] text-[#003087] flex items-center justify-center hover:bg-[#e8eef8] active:bg-[#003087] active:text-white transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div
              onClick={() => onTabChange('trang-chu')}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
            >
              {/* School Logo Image */}
              <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 shrink-0">
                <img
                  src={schoolLogo}
                  alt="Logo THPT Đặng Trần Đức"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* School Name & Slogan */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#003087] uppercase tracking-wider">
                  {SCHOOL_INFO.secondaryName}
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-[#003087] leading-tight mt-0.5 uppercase">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-[11px] sm:text-sm font-medium text-[#F0A500] tracking-wide mt-0.5 italic line-clamp-1">
                  {SCHOOL_INFO.slogan}
                </p>
              </div>
            </div>

            {/* Mobile menu button moved to the left of the logo */}
            <div className="hidden">
              <button
                onClick={onToggleMobileMenu}
                aria-label="Mở menu"
                className="w-10 h-10 border border-[#003087] bg-[#f5f7fc] text-[#003087] flex items-center justify-center hover:bg-[#e8eef8] active:bg-[#003087] active:text-white transition-colors cursor-pointer"
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
                  isSearchFocused ? 'border-[#003087] ring-1 ring-[#003087]' : 'border-[#c5d3ec]'
                } placeholder:text-[#9aabd4] focus:outline-none transition-all text-[#1a2744]`}
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#78716C] hover:text-[#003087] hover:bg-[#e8eef8] transition-colors"
              >
                <Search className="w-4 h-4 text-[#003087]" />
              </button>
            </form>

            {/* Quick Action Button: Báo Mất Đồ */}
            <button
              onClick={() => onOpenQuickModal('reportLost')}
              className="flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-semibold tracking-wide whitespace-nowrap transition-colors border border-[#001a52] shadow-xs cursor-pointer shrink-0"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Báo Mất Đồ</span>
              <span className="xs:hidden">Báo Mất</span>
            </button>
          </div>

        </div>
      </div>

      {/* Gold Accent Bar before Nav */}
      <div className="header-nav-accent h-[2px] gold-accent-bar" />

      {/* Main Horizontal Navigation Bar - Navy Blue */}
      <nav className="header-navigation bg-[#003087] text-white relative select-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center">
          
          {/* Left Arrow Button for Horizontal Scrolling */}
          {canScrollLeft && (
            <button
              onClick={() => scrollNav('left')}
              aria-label="Cuộn sang trái"
              className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-[#001a52] via-[#001a52]/90 to-transparent flex items-center justify-start pl-1 text-white hover:text-[#FFD700] transition-opacity cursor-pointer"
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
            className="flex items-center overflow-x-auto scrollbar-none w-full border-t border-[#001a52]/60 touch-pan-x cursor-grab active:cursor-grabbing scroll-smooth"
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
                      ? 'bg-[#001a52] text-[#FFD700]'
                      : 'text-white/90 hover:bg-[#002060] hover:text-white'
                  }`}
                >
                  {item.id === 'tkb' && <Clock className="w-3.5 h-3.5 opacity-80" />}
                  {item.id === 'lich-lam-viec' && <Calendar className="w-3.5 h-3.5 opacity-80" />}
                  {item.label}
                  {/* Gold Underline Indicator Bar for Active Tab */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#55B9E8] shadow-sm" />
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
              className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-[#001a52] via-[#001a52]/90 to-transparent flex items-center justify-end pr-1 text-white hover:text-[#FFD700] transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 drop-shadow-sm" />
            </button>
          )}

        </div>
      </nav>

      {/* Search and quick action row below the navigation */}
      <div className="header-search-under-nav bg-white border-b border-[#B8D3E2] px-3 sm:px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-2 sm:gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Tìm kiếm bài viết, đề thi, quy chế..."
              className={`w-full h-9 pl-3 pr-10 text-xs sm:text-sm bg-white border ${
                isSearchFocused ? 'border-[#0B78B5] ring-1 ring-[#0B78B5]' : 'border-[#B8D3E2]'
              } placeholder:text-[#7895AD] focus:outline-none transition-all text-[#17324D]`}
            />
            <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#0875B1] hover:bg-[#EAF3F8] transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <button
            onClick={() => onOpenQuickModal('reportLost')}
            className="flex items-center gap-1.5 h-9 px-3 sm:px-3.5 bg-[#0B78B5] hover:bg-[#075F91] text-white text-xs font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Báo mất đồ</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (When Hamburger is Clicked on Phones) */}
      {isMobileMenuOpen && (
        <div className="header-mobile-menu lg:hidden bg-white border-b-2 border-[#003087] shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-[#d1ddf5] bg-[#f5f7fc] flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold text-[#003087] uppercase tracking-wider">
              DANH MỤC ĐIỀU HƯỚNG NHANH
            </div>
            <span className="text-[11px] text-[#6b82b8] font-mono">8 Chuyên mục</span>
          </div>
          <div className="divide-y divide-[#e8eef8]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item)}
                className={`w-full px-4 py-3 text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#e8eef8] text-[#003087] border-l-4 border-[#FFD700]'
                    : 'text-[#1a2744] hover:bg-[#e8eef8] hover:text-[#003087]'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-[#9aabd4]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breaking News / Date Ticker strip - Gold accent */}
      <div className="header-ticker bg-[#fff8e1] border-b border-[#FFD700]/40 overflow-hidden py-1.5 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-[#003087] text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0">
            <span>ĐIỂM TIN</span>
          </div>
          <div className="overflow-hidden relative flex-1 text-[#003087] font-medium truncate text-[11px] sm:text-xs">
            <span>
              Trường THPT Đặng Trần Đức thông báo kế hoạch tổ chức hoạt động giáo dục trải nghiệm năm học 2026–2027. Lễ Khai giảng toàn quốc diễn ra ngày 5/9/2026.
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-[#6b82b8] text-[11px] font-mono shrink-0">
            <span>Hà Nội: 28°C</span>
            <span>·</span>
            <span>Năm học: 2026–2027</span>
          </div>
        </div>
      </div>
    </header>
  );
};
