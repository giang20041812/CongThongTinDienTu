/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { HeroSection } from './components/HeroSection';
import { NewsAndAnnouncementsSection } from './components/NewsAndAnnouncementsSection';
import { MultiCategorySection } from './components/MultiCategorySection';
import { Footer } from './components/Footer';
import { SearchDialog } from './components/SearchDialog';
import { NotFound, cx } from './components/ui';
import { CATEGORIES_PATH, SETTINGS_PATH, prefetch } from './api';
import { RouterProvider, routeToPath, useRouter } from './lib/router';
import { usePageTitle } from './lib/site';
import type { PageRoute } from './types';

import { CategoryPage } from './pages/CategoryPage';
import { PostDetailPage } from './pages/PostDetailPage';

// The admin d workspace is only downloaded when someone opens /admin.
const AdminApp = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminApp })));

const HomePage: React.FC = () => {
  usePageTitle(null);
  return (
    <>
      <HeroSection />
      <NewsAndAnnouncementsSection />
      <MultiCategorySection />
    </>
  );
};

const UnknownPage: React.FC = () => {
  usePageTitle('Không tìm thấy trang');
  return <NotFound />;
};

/** Pages are resolved from the URL: menu entries by slug, posts by slug – nothing is hard-coded per section. */
const RouteView: React.FC<{ route: PageRoute | null }> = ({ route }) => {
  if (!route) return <UnknownPage />;
  switch (route.view) {
    case 'home':
      return <HomePage />;
    case 'category':
      return <CategoryPage slug={route.slug} />;
    case 'post':
      return <PostDetailPage slug={route.slug} />;
  }
};

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > 700));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cx(
        'no-print fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full bg-brand-600 text-white shadow-nav transition-all duration-500 ease-(--ease-soft) hover:bg-brand-500 sm:bottom-7 sm:right-7',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
};

const PublicSite: React.FC = () => {
  const { route } = useRouter();
  const [search, setSearch] = useState({ open: false, query: '' });

  // The menu and school info are needed by every page: request them before any section mounts.
  useEffect(() => prefetch(CATEGORIES_PATH, SETTINGS_PATH), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        setSearch({ open: true, query: '' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua điều hướng
      </a>
      <Header />
      <NavigationBar onOpenSearch={(query) => setSearch({ open: true, query: query ?? '' })} />
      <main id="main" key={route ? routeToPath(route) : '404'} className="flex-1 animate-fade-up">
        <RouteView route={route} />
      </main>
      <Footer />
      <SearchDialog open={search.open} initialQuery={search.query} onClose={() => setSearch((s) => ({ ...s, open: false }))} />
      <BackToTop />
    </div>
  );
};

export default function App() {
  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted">Đang tải trang quản trị…</div>}>
        <AdminApp />
      </Suspense>
    );
  }
  return (
    <RouterProvider>
      <PublicSite />
    </RouterProvider>
  );
}
