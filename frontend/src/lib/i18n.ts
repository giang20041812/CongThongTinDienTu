import { useSyncExternalStore } from 'react';
import { EN_MAP } from './enMap';

export type Lang = 'vi' | 'en';

const STORAGE_KEY = 'lang';
const LOCALES: Record<Lang, string> = { vi: 'vi-VN', en: 'en-US' };

/** UI dictionary. Vietnamese strings double as the fallback; add keys here as more UI gets translated. */
const DICT = {
  vi: {
    home: 'Trang chủ',
    menu: 'Danh mục',
    mainNav: 'Điều hướng chính',
    search: 'Tìm kiếm',
    searchHint: 'Tìm kiếm (Ctrl + K)',
    searchPlaceholder: 'Tìm bài viết, thông báo...',
    searchPlaceholderLong: 'Tìm kiếm bài viết, thông báo...',
    ticker: 'Điểm tin',
    welcome: 'Chào mừng quý thầy cô, phụ huynh và các em học sinh đến với cổng thông tin nhà trường.',
    closeMenu: 'Đóng menu',
    collapse: 'Thu gọn',
    open: 'Mở',
    hotline: 'Đường dây nóng',
    email: 'Thư điện tử',
    school: 'Trường',
    schoolHome: 'Trang chủ Trường',
    schoolLogo: 'Logo Trường',
    language: 'Ngôn ngữ',
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    mainNav: 'Main navigation',
    search: 'Search',
    searchHint: 'Search (Ctrl + K)',
    searchPlaceholder: 'Search posts, announcements...',
    searchPlaceholderLong: 'Search posts, announcements...',
    ticker: 'Headlines',
    welcome: 'Welcome teachers, parents and students to the school portal.',
    closeMenu: 'Close menu',
    collapse: 'Collapse',
    open: 'Open',
    hotline: 'Hotline',
    email: 'Email',
    school: '',
    schoolHome: 'Home - ',
    schoolLogo: 'Logo of ',
    language: 'Language',
  },
} as const;

export type TextKey = keyof typeof DICT.vi;

const readInitial = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return 'vi';
};

let current: Lang = readInitial();
const listeners = new Set<() => void>();
if (typeof document !== 'undefined') document.documentElement.lang = current;

export const getLang = () => current;
export const getLocale = () => LOCALES[current];
/** Picks the English text when the site is in English and a translation exists; Vietnamese otherwise. */
export const loc = <T extends string | null | undefined>(vi: T, en?: string | null): T =>
  (current === 'en' && en != null && en.trim() !== '' ? en : vi) as T;

/** Returns the text in the active language (Vietnamese by default, or English if provided). */
export const tr = (vi: string, en?: string): string => {
  if (current !== 'en') return vi;
  if (en != null && en.trim() !== '') return en;
  return EN_MAP[vi] ?? vi;
};

export const t = (key: TextKey) => DICT[current][key] ?? DICT.vi[key];

export const setLang = (lang: Lang) => {
  if (lang === current) return;
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Subscribes the component to language changes. */
export const useLang = () => useSyncExternalStore(subscribe, getLang);

