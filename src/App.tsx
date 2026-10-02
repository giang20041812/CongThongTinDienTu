/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { HeroSlider } from './components/HeroSlider';
import { NewsAndAnnouncementsSection } from './components/NewsAndAnnouncementsSection';
import { MultiCategorySection } from './components/MultiCategorySection';
import { LostFoundBanner } from './components/LostFoundBanner';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';
import { ActiveModal, PageRoute, NewsItem, AnnouncementItem, LostItem } from './types';
import { ALL_NEWS, ALL_ANNOUNCEMENTS, ALL_ADMISSIONS, ALL_STUDY_ABROAD, ALL_CLUBS, ALL_LOST_ITEMS } from './data/mockData';
import { Search, X } from 'lucide-react';

// Dedicated Full Pages
import { NewsListPage, NewsDetailPage } from './pages/NewsPages';
import { AnnouncementListPage, AnnouncementDetailPage } from './pages/AnnouncementPages';
import { AdmissionsListPage, AdmissionDetailPage } from './pages/AdmissionsPages';
import { StudyAbroadListPage, StudyAbroadDetailPage } from './pages/StudyAbroadPages';
import { SchedulePage } from './pages/SchedulePage';
import { WorkCalendarPage } from './pages/WorkCalendarPage';
import { LostFoundListPage, LostItemDetailPage } from './pages/LostFoundPages';
import { ClubsListPage, ClubDetailPage } from './pages/ClubsPages';
import { AdminApp } from './pages/AdminPages';

export default function App() {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/login') {
    return <AdminApp />;
  }

  const [currentRoute, setCurrentRoute] = useState<PageRoute>({ view: 'home' });
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  // Tab navigation routing handler
  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case 'trang-chu':
        setCurrentRoute({ view: 'home' });
        break;
      case 'tin-tuc':
        setCurrentRoute({ view: 'news-list' });
        break;
      case 'thong-bao':
        setCurrentRoute({ view: 'announcement-list' });
        break;
      case 'tuyen-sinh':
        setCurrentRoute({ view: 'admissions-list' });
        break;
      case 'du-hoc':
        setCurrentRoute({ view: 'study-abroad-list' });
        break;
      case 'tkb':
        setCurrentRoute({ view: 'tkb' });
        break;
      case 'lich-lam-viec':
        setCurrentRoute({ view: 'calendar' });
        break;
      case 'do-that-lac':
        setCurrentRoute({ view: 'lost-found-list' });
        break;
      default:
        setCurrentRoute({ view: 'home' });
    }
  };

  // Determine active tab ID for header indicator
  const getActiveTabId = (): string => {
    switch (currentRoute.view) {
      case 'home':
        return 'trang-chu';
      case 'news-list':
      case 'news-detail':
        return 'tin-tuc';
      case 'announcement-list':
      case 'announcement-detail':
        return 'thong-bao';
      case 'admissions-list':
      case 'admission-detail':
        return 'tuyen-sinh';
      case 'study-abroad-list':
      case 'study-abroad-detail':
        return 'du-hoc';
      case 'tkb':
        return 'tkb';
      case 'calendar':
        return 'lich-lam-viec';
      case 'lost-found-list':
      case 'lost-found-detail':
        return 'do-that-lac';
      case 'clubs-list':
      case 'club-detail':
        return 'do-that-lac';
      default:
        return 'trang-chu';
    }
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  // Search matching across articles & announcements
  const searchResults = searchQuery
    ? [
        ...ALL_NEWS.map((n) => ({ ...n, typeLabel: 'Tin tức' })),
        ...ALL_ANNOUNCEMENTS.map((a) => ({ ...a, summary: a.content, category: a.department, typeLabel: 'Thông báo' })),
      ].filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1a2744] selection:bg-[#003087] selection:text-white">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <Header
        activeTab={getActiveTabId()}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((open) => !open)}
        onOpenQuickModal={(type) => {
          if (type === 'tkb') setCurrentRoute({ view: 'tkb' });
          if (type === 'calendar') setCurrentRoute({ view: 'calendar' });
          if (type === 'reportLost') setActiveModal({ type: 'reportLost' });
        }}
      />

      {/* 2. DYNAMIC ROUTE RENDERER */}
      <main className="flex-1">
        {currentRoute.view !== 'home' && (
          <NavigationBar activeTab={getActiveTabId()} onTabChange={handleTabChange} isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(false)} onSearch={handleSearch} onOpenQuickModal={(type) => {
            if (type === 'reportLost') setActiveModal({ type: 'reportLost' });
          }} />
        )}
        {/* VIEW: HOME DASHBOARD (Direct match with Wireframe) */}
        {currentRoute.view === 'home' && (
          <>
            {/* Hero Banner Slider */}
            <HeroSlider
              onSelectSlide={(slideId) => {
                setCurrentRoute({ view: 'news-detail', id: 'news-1' });
              }}
            />

            <NavigationBar activeTab={getActiveTabId()} onTabChange={handleTabChange} isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(false)} onSearch={handleSearch} onOpenQuickModal={(type) => {
              if (type === 'reportLost') setActiveModal({ type: 'reportLost' });
            }} />

            {/* Điều hướng và điểm tin nằm ngay dưới banner */}
            {/* Section 1: Tin tức - Sự kiện & Thông báo */}
            <NewsAndAnnouncementsSection
              onSelectNews={(item) => setCurrentRoute({ view: 'news-detail', id: item.id })}
              onSelectAnnouncement={(item) => setCurrentRoute({ view: 'announcement-detail', id: item.id })}
              onSearch={handleSearch}
              onOpenQuickModal={() => setActiveModal({ type: 'reportLost' })}
            />

            {/* Section 2 + 3: Multi-category grid (Tin NhàTrường, Thanh Niên, CLB, Thông Báo, Tuyển Sinh, HSG, STEM, Du Học) */}
            <MultiCategorySection
              onSelectNews={(id) => setCurrentRoute({ view: 'news-detail', id })}
              onNavigate={(view) => {
                if (view === 'news-list') setCurrentRoute({ view: 'news-list' });
                else if (view === 'announcement-list') setCurrentRoute({ view: 'announcement-list' });
                else if (view === 'admissions-list') setCurrentRoute({ view: 'admissions-list' });
                else if (view === 'study-abroad-list') setCurrentRoute({ view: 'study-abroad-list' });
                else if (view === 'clubs-list') setCurrentRoute({ view: 'clubs-list' });
                else if (view === 'lost-found-list') setCurrentRoute({ view: 'lost-found-list' });
              }}
            />

            {/* Section 4: Góc thất lạc - full width horizontal scroll */}
            <LostFoundBanner
              onSelectLostItem={(item) => setCurrentRoute({ view: 'lost-found-detail', id: item.id })}
              onOpenReportLostModal={() => setActiveModal({ type: 'reportLost' })}
            />
          </>
        )}

        {/* VIEW: NEWS LIST */}
        {currentRoute.view === 'news-list' && (
          <NewsListPage
            onSelectNews={(id) => setCurrentRoute({ view: 'news-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: NEWS DETAIL */}
        {currentRoute.view === 'news-detail' && (
          <NewsDetailPage
            newsId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'news-list' })}
            onSelectOtherNews={(id) => setCurrentRoute({ view: 'news-detail', id })}
          />
        )}

        {/* VIEW: ANNOUNCEMENT LIST */}
        {currentRoute.view === 'announcement-list' && (
          <AnnouncementListPage
            onSelectAnnouncement={(id) => setCurrentRoute({ view: 'announcement-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: ANNOUNCEMENT DETAIL */}
        {currentRoute.view === 'announcement-detail' && (
          <AnnouncementDetailPage
            announcementId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'announcement-list' })}
          />
        )}

        {/* VIEW: ADMISSIONS LIST */}
        {currentRoute.view === 'admissions-list' && (
          <AdmissionsListPage
            onSelectAdmission={(id) => setCurrentRoute({ view: 'admission-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: ADMISSION DETAIL */}
        {currentRoute.view === 'admission-detail' && (
          <AdmissionDetailPage
            admissionId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'admissions-list' })}
          />
        )}

        {/* VIEW: STUDY ABROAD LIST */}
        {currentRoute.view === 'study-abroad-list' && (
          <StudyAbroadListPage
            onSelectProgram={(id) => setCurrentRoute({ view: 'study-abroad-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: STUDY ABROAD DETAIL */}
        {currentRoute.view === 'study-abroad-detail' && (
          <StudyAbroadDetailPage
            programId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'study-abroad-list' })}
          />
        )}

        {/* VIEW: TKB (TIMETABLE) */}
        {currentRoute.view === 'tkb' && (
          <SchedulePage onGoHome={() => setCurrentRoute({ view: 'home' })} />
        )}

        {/* VIEW: WORK CALENDAR */}
        {currentRoute.view === 'calendar' && (
          <WorkCalendarPage onGoHome={() => setCurrentRoute({ view: 'home' })} />
        )}

        {/* VIEW: LOST & FOUND LIST */}
        {currentRoute.view === 'lost-found-list' && (
          <LostFoundListPage
            onSelectLostItem={(id) => setCurrentRoute({ view: 'lost-found-detail', id })}
            onOpenReportModal={() => setActiveModal({ type: 'reportLost' })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: LOST ITEM DETAIL */}
        {currentRoute.view === 'lost-found-detail' && (
          <LostItemDetailPage
            lostItemId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'lost-found-list' })}
          />
        )}

        {/* VIEW: CLUBS LIST */}
        {currentRoute.view === 'clubs-list' && (
          <ClubsListPage
            onSelectClub={(id) => setCurrentRoute({ view: 'club-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}

        {/* VIEW: CLUB DETAIL */}
        {currentRoute.view === 'club-detail' && (
          <ClubDetailPage
            clubId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'clubs-list' })}
          />
        )}
      </main>

      {/* 3. FOOTER (With Bottom Logo, Quick Links, Ministry Links) */}
      <Footer />

      {/* 4. MODALS (Quick popups like Report Lost Item) */}
      <Modals
        modal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* 5. QUICK SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border-2 border-[#003087] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#003087]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#1a2744]">
                  Kết quả tìm kiếm cho: "{searchQuery}"
                </span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-6 h-6 flex items-center justify-center hover:bg-[#e8eef8] text-[#6b82b8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-stone-100">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      if (item.typeLabel === 'Thông báo') {
                        setCurrentRoute({ view: 'announcement-detail', id: item.id });
                      } else {
                        setCurrentRoute({ view: 'news-detail', id: item.id });
                      }
                    }}
                    className="py-3 hover:bg-[#f5f7fc] px-2 cursor-pointer transition-colors"
                  >
                    <div className="text-[11px] font-mono text-[#003087] font-bold">
                      {item.typeLabel} · {item.category} · {item.date}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#1a2744] mt-0.5 line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#4a5f8a] line-clamp-1 mt-1">
                      {item.summary}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-500">
                  Không tìm thấy bài viết nào khớp với từ khóa "{searchQuery}". Vui lòng thử từ khóa khác như "ma trận", "HSG", "tuyển sinh"...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
