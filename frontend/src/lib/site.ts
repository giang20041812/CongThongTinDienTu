import { useEffect, useMemo } from 'react';
import { useSettingsResource } from '../api';
import { loc } from './i18n';

/** School information, editable by admins; these defaults only show until the API answers. */
export const DEFAULT_SITE = {
  school_name: 'THPT Đặng Trần Đức',
  /** English versions (optional; blank = show Vietnamese). */
  school_name_en: '',
  parent_org_en: '',
  slogan_en: '',
  address_en: '',
  working_hours_en: '',
  parent_org: 'Sở Giáo dục và Đào tạo Hà Nội',
  slogan: 'Trí tuệ - Nhân văn - Kỷ cương',
  address: '',
  hotline: '',
  email: '',
  official_email: '',
  website: '',
  working_hours: '',
  map_embed_url: '',
  facebook_url: '',
  messenger_url: '',
  /** One "Tên | https://..." per line, shown in the footer. */
  useful_links: '',
  /** Edited from the timetable admin screen. */
  timetable_term: '',
  timetable_notes: '',
};

export type SiteInfo = typeof DEFAULT_SITE;

/** Fields of the "Thông tin trường" admin form (the timetable keys live on the timetable screen). */
export const SETTING_FIELDS: { key: keyof SiteInfo; label: string; multiline?: boolean; hint?: string; wide?: boolean }[] = [
  { key: 'school_name', label: 'Tên trường' },
  { key: 'school_name_en', label: 'Tên trường (English)' },
  { key: 'address_en', label: 'Địa chỉ (English)', wide: true },
  { key: 'working_hours_en', label: 'Giờ làm việc (English)' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Địa chỉ', wide: true },
  { key: 'hotline', label: 'Đường dây nóng' },
  { key: 'working_hours', label: 'Giờ làm việc' },
  { key: 'email', label: 'Email liên hệ' },
  { key: 'official_email', label: 'Email công vụ' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'messenger_url', label: 'Messenger' },
  { key: 'map_embed_url', label: 'Link nhúng Google Maps (tuỳ chọn)', hint: 'Để trống = tự tìm theo tên trường và địa chỉ' },
  { key: 'useful_links', label: 'Liên kết ở chân trang', multiline: true, wide: true, hint: 'Mỗi dòng một liên kết: Tên | https://địa-chỉ' },
];

export const useSite = (): SiteInfo => {
  const { data } = useSettingsResource();
  return useMemo(() => {
    const merged = { ...DEFAULT_SITE };
    (Object.keys(merged) as (keyof SiteInfo)[]).forEach((key) => {
      // English text lives in the same table under "<key>_en" (e.g. school_name_en).
      const value = loc(data[key], data[`${key}_en`]);
      if (value?.trim()) merged[key] = value.trim();
    });
    // The parent organisation and slogan are no longer shown on the site.
    merged.parent_org = '';
    merged.slogan = '';
    return merged;
  }, [data]);
};

/** Sets the browser tab title: "{title} – Trường {name}", or the portal name for the home page. */
export const usePageTitle = (title?: string | null) => {
  const { school_name } = useSite();
  useEffect(() => {
    document.title = title ? `${title} – Trường ${school_name}` : `Trường ${school_name} – Cổng thông tin điện tử`;
  }, [title, school_name]);
};

/** Parses "Tên | https://..." lines; lines without a valid http(s) URL are ignored. */
export const parseLinks = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((line) => {
      const index = line.lastIndexOf('|');
      if (index < 0) return null;
      const label = line.slice(0, index).trim();
      const href = line.slice(index + 1).trim();
      return label && /^https?:\/\//i.test(href) ? { label, href } : null;
    })
    .filter((link): link is { label: string; href: string } => !!link);

export const splitLines = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** The admin's embed link when set, otherwise a Google Maps search for the school's name and address. */
export const mapEmbedUrl = (site: SiteInfo) =>
  site.map_embed_url ||
  `https://www.google.com/maps?q=${encodeURIComponent([`Trường ${site.school_name}`, site.address].filter(Boolean).join(', '))}&output=embed`;
