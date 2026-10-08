import React from 'react';
import { MenuLink } from '../lib/menu';
import type { Category } from '../types';
import { Container, PageHeader, cx, type Crumb } from './ui';

export interface SectionProps {
  category: Category;
  parent?: Category;
  /** Children (for a top-level entry) or siblings (for a child entry), for the section tabs. */
  section: Category[];
  crumbs: Crumb[];
}

/** Navy header + tabs to the other entries of the same menu group. */
export const SectionHeader: React.FC<SectionProps & { aside?: React.ReactNode }> = ({ category, parent, section, crumbs, aside }) => (
  <>
    <PageHeader
      eyebrow={parent?.name ?? 'Cổng thông tin'}
      title={category.name}
      description={category.description ?? undefined}
      crumbs={crumbs}
      aside={aside}
    />
    {parent && section.length > 1 && (
      <div className="no-print border-b border-line bg-white">
        <Container>
          <nav aria-label={`Các mục trong ${parent.name}`} className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 py-2.5 sm:mx-0 sm:px-0">
            {section.map((item) => {
              const active = item.id === category.id;
              return (
                <MenuLink
                  key={item.id}
                  category={item}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300',
                    active ? 'bg-brand-600 text-white shadow-sm' : 'text-body hover:bg-brand-50 hover:text-brand-600',
                  )}
                >
                  {item.name}
                </MenuLink>
              );
            })}
          </nav>
        </Container>
      </div>
    )}
  </>
);

