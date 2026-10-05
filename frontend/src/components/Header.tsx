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
    <header className="w-full bg-[#FFFFFF] border-b border-[#dbeafe] relative z-40">
      {/* Top Utility Meta Strip - Deep Navy Blue */}
      <div className="bg-[#0052cc] border-b border-[#0026e6] px-3 sm:px-4 py-1.5 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* Slogan & Authority */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-[#ff9900] uppercase tracking-wider text-[10px] sm:text-[11px]">
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
            <span className="hidden md:flex items-center gap-1.5 hover:text-[#ff9900] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#ff9900]" />
              {SCHOOL_INFO.address}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 hover:text-[#ff9900] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#ff9900]" />
              {SCHOOL_INFO.email}
            </span>
            <a
              href={`tel:${SCHOOL_INFO.hotline}`}
              className="flex items-center gap-1.5 font-bold text-[#ff9900]"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff9900]" />
              <span>{SCHOOL_INFO.hotline}</span>
            </a>
          </div>
        </div>
      </div>


    </header>
  );
};
