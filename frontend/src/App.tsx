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

import { QuickLinksSection } from './components/QuickLinksSection';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';
import { ActiveModal, PageRoute, NewsItem, AnnouncementItem, LostItem } from './types';
import { fetchPosts, fetchAnnouncements } from './api';
import { Search, X } from 'lucide-react';

// Dedicated Full Pages
import { NewsListPage, NewsDetailPage } from './pages/NewsPages';
import { AnnouncementListPage, AnnouncementDetailPage } from './pages/AnnouncementPages';
import { AdmissionsListPage, AdmissionDetailPage } from './pages/AdmissionsPages';
import { StudyAbroadListPage, StudyAbroadDetailPage } from './pages/StudyAbroadPages';
import { SchedulePage } from './pages/SchedulePage';
import { WorkCalendarPage } from './pages/WorkCalendarPage';

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

  const [allSearchableItems, setAllSearchableItems] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetchPosts(), fetchAnnouncements()]).then(([posts, announcements]) => {
      const mappedPosts = (posts || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        summary: d.blocks?.find((b: any) => b.type === 'TEXT')?.content?.substring(0, 100) + '...' || '',
        category: d.category?.name || 'TIN TỨC',
        date: new Date(d.createdAt).toLocaleDateString('vi-VN'),
        typeLabel: 'Tin tức'
      }));
      const mappedAnnouncements = (announcements || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        summary: d.content || '',
        category: d.department || 'Ban Giám Hiệu',
        date: new Date(d.createdAt).toLocaleDateString('vi-VN'),
        typeLabel: 'Thông báo'
      }));
      setAllSearchableItems([...mappedPosts, ...mappedAnnouncements]);
    }).catch(console.error);
  }, []);



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
      case 'tkb':
        return 'tkb';
      case 'calendar':
        return 'lich-lam-viec';
      case 'study-abroad-list':
      case 'study-abroad-detail':
        return 'du-hoc';
      default:
        return '';
    }
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  // Search matching across articles & announcements
  const searchResults = searchQuery
    ? allSearchableItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-black selection:bg-[#0052cc] selection:text-white">

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
        }}
      />

      {/* 2. DYNAMIC ROUTE RENDERER */}
      <main className="flex-1">
        {currentRoute.view !== 'home' && (
          <NavigationBar activeTab={getActiveTabId()} onTabChange={handleTabChange} isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(false)} onSearch={handleSearch} onOpenQuickModal={(type) => {
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
            }} />

            {/* Điều hướng và điểm tin nằm ngay dưới banner */}
            {/* Section 1: Tin tức - Sự kiện & Thông báo */}
            {/* Quick Links Section */}
            {/* QuickLinksSection removed */}
            <NewsAndAnnouncementsSection
              onSelectNews={(item) => setCurrentRoute({ view: 'news-detail', id: item.id })}
              onSelectAnnouncement={(item) => setCurrentRoute({ view: 'announcement-detail', id: item.id })}
              onSearch={handleSearch}
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

              }}
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
          <div className="w-full max-w-xl bg-white border-2 border-[#0052cc] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#0052cc]" />
                <span className="font-bold text-xs uppercase tracking-wider text-black">
                  Kết quả tìm kiếm cho: "{searchQuery}"
                </span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-6 h-6 flex items-center justify-center hover:bg-[#eef5ff] text-black cursor-pointer"
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
                    <div className="text-[11px] font-mono text-[#0052cc] font-bold">
                      {item.typeLabel} · {item.category} · {item.date}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-black mt-0.5 line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-xs text-black line-clamp-1 mt-1">
                      {item.summary}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-black">
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



