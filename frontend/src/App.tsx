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
import { ActiveModal, PageRoute, NewsItem, AnnouncementItem } from './types';
import { fetchPosts, fetchAnnouncements, useHomepageData, useCategories } from './api';
import { Search, X } from 'lucide-react';

// Dedicated Full Pages
import { Category1ListPage, Category1DetailPage } from './pages/Category1Pages';
import { Category2ListPage, Category2DetailPage } from './pages/Category2Pages';
import { Category3ListPage, Category3DetailPage } from './pages/Category3Pages';
import { Category4ListPage, Category4DetailPage } from './pages/Category4Pages';
import { SchedulePage } from './pages/SchedulePage';
import { WorkCalendarPage } from './pages/WorkCalendarPage';

import { Category5ListPage, Category5DetailPage } from './pages/Category5Pages';
import { Category6ListPage, Category6DetailPage } from './pages/Category6Pages';
import { AnnouncementListPage, AnnouncementDetailPage } from './pages/AnnouncementPages';
import { AdminApp } from './pages/admin';
export default function App() {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/login') {
    return <AdminApp />;
  }

  const getRouteFromPath = (path: string): PageRoute => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return { view: 'home' };
    
    if (segments[0] === 'thong-bao') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'announcement-detail', id: segments[2] };
      return { view: 'announcement-list' };
    }
    
    if (segments[0] === 'loai-tin-1') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category1-detail', id: segments[2] };
      if (segments[1]) return { view: 'category1-list', id: decodeURIComponent(segments[1]) };
      return { view: 'category1-list', id: 'all' };
    }
    
    if (segments[0] === 'loai-tin-2') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category2-detail', id: segments[2] };
      return { view: 'category2-list' };
    }
    
    if (segments[0] === 'loai-tin-3') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category3-detail', id: segments[2] };
      return { view: 'category3-list' };
    }

    if (segments[0] === 'loai-tin-4') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category4-detail', id: segments[2] };
      return { view: 'category4-list' };
    }

    if (segments[0] === 'loai-tin-5') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category5-detail', id: segments[2] };
      return { view: 'category5-list' };
    }
    
    if (segments[0] === 'loai-tin-6') {
      if (segments[1] === 'chi-tiet' && segments[2]) return { view: 'category6-detail', id: segments[2] };
      return { view: 'category6-list' };
    }

    if (segments[0] === 'tkb') return { view: 'tkb' };
    if (segments[0] === 'lich-lam-viec') return { view: 'calendar' };

    return { view: 'home' };
  };

  const [currentRouteState, setCurrentRouteState] = useState<PageRoute>(getRouteFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRouteState(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCurrentRoute = (route: PageRoute) => {
    let url = '/';
    if (route.view === 'category1-list') url = route.id && route.id !== 'all' ? `/loai-tin-1/${encodeURIComponent(route.id)}` : `/loai-tin-1`;
    else if (route.view === 'category1-detail') url = `/loai-tin-1/chi-tiet/${route.id}`;
    else if (route.view === 'category2-list') url = `/loai-tin-2`;
    else if (route.view === 'category2-detail') url = `/loai-tin-2/chi-tiet/${route.id}`;
    else if (route.view === 'category3-list') url = `/loai-tin-3`;
    else if (route.view === 'category3-detail') url = `/loai-tin-3/chi-tiet/${route.id}`;
    else if (route.view === 'category4-list') url = `/loai-tin-4`;
    else if (route.view === 'category4-detail') url = `/loai-tin-4/chi-tiet/${route.id}`;
    else if (route.view === 'category5-list') url = `/loai-tin-5`;
    else if (route.view === 'category5-detail') url = `/loai-tin-5/chi-tiet/${route.id}`;
    else if (route.view === 'category6-list') url = `/loai-tin-6`;
    else if (route.view === 'category6-detail') url = `/loai-tin-6/chi-tiet/${route.id}`;
    else if (route.view === 'tkb') url = `/tkb`;
    else if (route.view === 'calendar') url = `/lich-lam-viec`;

    if (window.location.pathname !== url) {
      window.history.pushState(null, '', url);
    }
    setCurrentRouteState(route);
  };
  
  const currentRoute = currentRouteState;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: homepageData, loading: homepageLoading } = useHomepageData();
  const { data: categories, loading: categoriesLoading } = useCategories();

  // Sync scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  const [allSearchableItems, setAllSearchableItems] = useState<any[]>([]);

  const fetchSearchData = () => {
    if (allSearchableItems.length > 0) return;
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
  };



  // Tab navigation routing handler
  const handleTabChange = (tabId: string) => {
    if (tabId.startsWith('category-')) {
      const categoryName = tabId.replace('category-', '');
      setCurrentRoute({ view: 'news-list', id: categoryName });
      return;
    }
    
    switch (tabId) {
      case 'trang-chu':
        setCurrentRoute({ view: 'home' });
        break;
      case 'thong-bao':
        setCurrentRoute({ view: 'announcement-list' });
        break;
      case 'loai-tin-1':
        setCurrentRoute({ view: 'category1-list' });
        break;
      case 'loai-tin-2':
        setCurrentRoute({ view: 'category2-list' });
        break;
      case 'loai-tin-3':
        setCurrentRoute({ view: 'category3-list' });
        break;
      case 'loai-tin-4':
        setCurrentRoute({ view: 'category4-list' });
        break;
      case 'loai-tin-5':
        setCurrentRoute({ view: 'category5-list' });
        break;
      case 'loai-tin-6':
        setCurrentRoute({ view: 'category6-list' });
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
    if (currentRoute.view === 'category1-list' && currentRoute.id && currentRoute.id !== 'all') {
      return `category-${currentRoute.id}`;
    }
    switch (currentRoute.view) {
      case 'home':
        return 'trang-chu';
      case 'announcement-list':
      case 'announcement-detail':
        return 'thong-bao';
      case 'category1-list':
      case 'category1-detail':
        return 'loai-tin-1';
      case 'category2-list':
      case 'category2-detail':
        return 'loai-tin-2';
      case 'category3-list':
      case 'category3-detail':
        return 'loai-tin-3';
      case 'category4-list':
      case 'category4-detail':
        return 'loai-tin-4';
      case 'category5-list':
      case 'category5-detail':
        return 'loai-tin-5';
      case 'category6-list':
      case 'category6-detail':
        return 'loai-tin-6';
      case 'tkb':
        return 'tkb';
      case 'calendar':
        return 'lich-lam-viec';
      default:
        return '';
    }
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      fetchSearchData();
    }
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
          }} categories={categories} categoriesLoading={categoriesLoading} />
        )}
        {/* VIEW: HOME DASHBOARD (Direct match with Wireframe) */}
        {currentRoute.view === 'home' && (
          <>
            {/* Hero Banner Slider */}
            <HeroSlider
              onSelectSlide={(slideId) => {
                setCurrentRoute({ view: 'category1-detail', id: 'news-1' });
              }}
            />

            <NavigationBar activeTab={getActiveTabId()} onTabChange={handleTabChange} isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(false)} onSearch={handleSearch} onOpenQuickModal={(type) => {
            }} categories={categories} categoriesLoading={categoriesLoading} />

            {/* Section 1: Tin tức - Sự kiện & Thông báo */}
            <NewsAndAnnouncementsSection
              topSections={homepageData?.topSections || []}
              onSelectNews={(item: any) => setCurrentRoute({ view: 'category1-detail', id: item.id })}
              onSelectAnnouncement={(item: any) => setCurrentRoute({ view: 'announcement-detail', id: item.id })}
              onSearch={handleSearch}
            />

            {/* Section 2 + 3: Multi-category grid */}
            <MultiCategorySection
              bottomSections={homepageData?.bottomSections || []}
              onSelectNews={(id: string, view?: string) => setCurrentRoute({ view: (view as any) || 'category1-detail', id })}
              onNavigate={(view: string) => {
                setCurrentRoute({ view: view as any });
              }}
            />


          </>
        )}

        {/* VIEW: ANNOUNCEMENTS */}
        {currentRoute.view === 'announcement-list' && (
          <AnnouncementListPage
            onSelectAnnouncement={(id) => setCurrentRoute({ view: 'announcement-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'announcement-detail' && currentRoute.id && (
          <AnnouncementDetailPage
            id={currentRoute.id}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
            onGoBack={() => setCurrentRoute({ view: 'announcement-list' })}
          />
        )}

        {/* VIEW: CATEGORY 1 */}
        {currentRoute.view === 'category1-list' && (
          <Category1ListPage
            initialCategory={currentRoute.id}
            onSelectNews={(id) => setCurrentRoute({ view: 'category1-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category1-detail' && (
          <Category1DetailPage
            newsId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category1-list' })}
            onSelectOtherNews={(id) => setCurrentRoute({ view: 'category1-detail', id })}
          />
        )}

        {/* VIEW: CATEGORY 2 */}
        {currentRoute.view === 'category2-list' && (
          <Category2ListPage
            onSelectAnnouncement={(id) => setCurrentRoute({ view: 'category2-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category2-detail' && (
          <Category2DetailPage
            announcementId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category2-list' })}
          />
        )}

        {/* VIEW: CATEGORY 3 */}
        {currentRoute.view === 'category3-list' && (
          <Category3ListPage
            onSelectCategory3={(id) => setCurrentRoute({ view: 'category3-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category3-detail' && (
          <Category3DetailPage
            category3Id={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category3-list' })}
          />
        )}

        {/* VIEW: CATEGORY 4 */}
        {currentRoute.view === 'category4-list' && (
          <Category4ListPage
            onSelectProgram={(id) => setCurrentRoute({ view: 'category4-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category4-detail' && (
          <Category4DetailPage
            programId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category4-list' })}
          />
        )}

        {/* VIEW: CATEGORY 5 */}
        {currentRoute.view === 'category5-list' && (
          <Category5ListPage
            onSelectClub={(id) => setCurrentRoute({ view: 'category5-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category5-detail' && (
          <Category5DetailPage
            clubId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category5-list' })}
          />
        )}

        {/* VIEW: CATEGORY 6 */}
        {currentRoute.view === 'category6-list' && (
          <Category6ListPage
            initialCategory={currentRoute.id}
            onSelectNews={(id) => setCurrentRoute({ view: 'category6-detail', id })}
            onGoHome={() => setCurrentRoute({ view: 'home' })}
          />
        )}
        {currentRoute.view === 'category6-detail' && (
          <Category6DetailPage
            newsId={currentRoute.id}
            onBack={() => setCurrentRoute({ view: 'category6-list' })}
            onSelectOtherNews={(id) => setCurrentRoute({ view: 'category6-detail', id })}
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
                        setCurrentRoute({ view: 'category2-detail', id: item.id });
                      } else {
                        setCurrentRoute({ view: 'category1-detail', id: item.id });
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



