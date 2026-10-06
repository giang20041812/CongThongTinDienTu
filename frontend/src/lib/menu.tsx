import React, { useMemo } from 'react';
import {
  ArrowSquareOut,
  BookOpenText,
  Books,
  Buildings,
  CalendarCheck,
  ChalkboardTeacher,
  ChartBar,
  ChatCircleDots,
  ClipboardText,
  Compass,
  EnvelopeSimple,
  Exam,
  FileText,
  Flag,
  FolderOpen,
  GraduationCap,
  HandHeart,
  IdentificationCard,
  Laptop,
  MapPin,
  Medal,
  MegaphoneSimple,
  Newspaper,
  Scroll,
  SealCheck,
  SquaresFour,
  Student,
  Tent,
  TreeStructure,
  Trophy,
  UsersThree,
  type IconComponent,
} from '../components/icons';
import { CATEGORIES_PATH, useResource } from '../api';
import type { Category, MenuNode, PageRoute, PageType } from '../types';
import { normalizeSearch } from './content';
import { Link } from './router';

const EMPTY: Category[] = [];

const byOrder = (a: Category, b: Category) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi');

/** Groups the flat category list into the two-level menu tree. */
export const buildMenu = (categories: Category[]): MenuNode[] => {
  const roots = categories.filter((c) => !c.parentId).sort(byOrder);
  return roots.map((root) => ({
    ...root,
    children: categories.filter((c) => c.parentId === root.id).sort(byOrder),
  }));
};

export interface Menu {
  categories: Category[];
  tree: MenuNode[];
  bySlug: Map<string, Category>;
  byId: Map<string, Category>;
  loading: boolean;
}

/** The public menu (visible entries only), shared by every component through the API cache. */
export const useMenu = (): Menu => {
  const { data, loading } = useResource<Category[]>(CATEGORIES_PATH, EMPTY);
  return useMemo(
    () => ({
      categories: data,
      tree: buildMenu(data),
      bySlug: new Map(data.map((c) => [c.slug, c])),
      byId: new Map(data.map((c) => [c.id, c])),
      loading,
    }),
    [data, loading],
  );
};

export const categoryRoute = (category: Pick<Category, 'slug'>): PageRoute => ({ view: 'category', slug: category.slug });

export const isExternal = (category: Pick<Category, 'pageType' | 'externalUrl'>) =>
  category.pageType === 'LINK' && !!category.externalUrl;

/** Top-level entry that owns a category (itself when it is top-level). */
export const rootOf = (category: Category | undefined, byId: Map<string, Category>): Category | undefined =>
  category?.parentId ? byId.get(category.parentId) ?? category : category;

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  GROUP: 'Nhóm (menu cha)',
  PAGE: 'Trang nội dung',
  POST_LIST: 'Danh sách bài viết',
  DOCUMENT_LIST: 'Danh sách văn bản',
  SCHEDULE: 'Thời khóa biểu',
  CONTACT: 'Thông tin liên hệ',
  MAP: 'Bản đồ',
  FEEDBACK: 'Góp ý – Phản hồi',
  LINK: 'Liên kết ngoài',
};

export const PAGE_TYPE_ICONS: Record<PageType, IconComponent> = {
  GROUP: SquaresFour,
  PAGE: BookOpenText,
  POST_LIST: Newspaper,
  DOCUMENT_LIST: FileText,
  SCHEDULE: CalendarCheck,
  CONTACT: EnvelopeSimple,
  MAP: MapPin,
  FEEDBACK: ChatCircleDots,
  LINK: ArrowSquareOut,
};

export const iconFor = (type: PageType) => PAGE_TYPE_ICONS[type] ?? FolderOpen;

/**
 * School vocabulary → icon, matched against the accent-free entry name (first match wins).
 * Purely cosmetic: an entry that matches nothing – or is renamed – falls back to its page-type icon.
 */
const NAME_ICONS: [RegExp, IconComponent][] = [
  [/thanh tich|khen thuong|giai thuong/, Trophy],
  [/tuyen sinh/, GraduationCap],
  [/huong nghiep/, Compass],
  [/truc tuyen|dien tu|e-learning/, Laptop],
  [/\bthi\b|kiem tra|on tap/, Exam],
  [/cau lac bo|\bclb\b/, UsersThree],
  [/doan thanh nien|doan truong|doi thieu nien/, Flag],
  [/ngoai khoa|trai nghiem|da ngoai/, Tent],
  [/chuyen mon|giao vien/, ChalkboardTeacher],
  [/tam ly|tu van/, HandHeart],
  [/tieu bieu|guong mat|vinh danh/, Medal],
  [/hoc sinh/, Student],
  [/thong bao/, MegaphoneSimple],
  [/tai lieu|hoc lieu|thu vien/, Books],
  [/lich su|truyen thong/, Scroll],
  [/co so vat chat/, Buildings],
  [/co cau|to chuc/, TreeStructure],
  [/ban giam hieu|lanh dao/, IdentificationCard],
  [/ke hoach/, ClipboardText],
  [/bao cao|thong ke/, ChartBar],
  [/cong khai/, SealCheck],
];

export const categoryIcon = (category: Pick<Category, 'name' | 'pageType'>): IconComponent => {
  const name = normalizeSearch(category.name);
  return NAME_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? iconFor(category.pageType);
};

interface MenuLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  category: Category;
}

/** Link to a menu entry: external entries open their URL in a new tab, the rest route client-side. */
export const MenuLink = React.forwardRef<HTMLAnchorElement, MenuLinkProps>(({ category, ...rest }, ref) =>
  isExternal(category) ? (
    <a ref={ref} href={category.externalUrl!} target="_blank" rel="noopener noreferrer" {...rest} />
  ) : (
    <Link ref={ref} to={categoryRoute(category)} {...rest} />
  ),
);
MenuLink.displayName = 'MenuLink';
