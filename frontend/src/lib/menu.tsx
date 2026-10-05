import React, { useMemo } from 'react';
import {
  BookOpen,
  CalendarClock,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Newspaper,
} from 'lucide-react';
import { CATEGORIES_PATH, useResource } from '../api';
import type { Category, MenuNode, PageRoute, PageType } from '../types';
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

export const PAGE_TYPE_ICONS: Record<PageType, React.ComponentType<{ className?: string }>> = {
  GROUP: LayoutGrid,
  PAGE: BookOpen,
  POST_LIST: Newspaper,
  DOCUMENT_LIST: FileText,
  SCHEDULE: CalendarClock,
  CONTACT: Mail,
  MAP: MapPin,
  FEEDBACK: MessageSquare,
  LINK: ExternalLink,
};

export const iconFor = (type: PageType) => PAGE_TYPE_ICONS[type] ?? FolderOpen;

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
