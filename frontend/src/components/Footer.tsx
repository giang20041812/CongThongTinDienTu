import { tr } from '../lib/i18n';
import React from 'react';
import { MapPin } from './icons';
import schoolLogo from '../assets/logo.jpg';
import { Link } from '../lib/router';
import { MenuLink, useMenu } from '../lib/menu';
import { mapEmbedUrl, useSite } from '../lib/site';
import { Container } from './ui';

export const Footer: React.FC = () => {
  const site = useSite();
  const { tree } = useMenu();
  const year = new Date().getFullYear();

  return (
    <footer className="no-print relative mt-auto overflow-hidden bg-brand-950 text-white/75">
      <div className="brand-stripe h-1" aria-hidden="true" />
      <div className="absolute inset-0 bg-dots opacity-30" aria-hidden="true" />
      <div className="absolute -left-24 top-10 size-60 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 size-60 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />

      <Container className="relative grid gap-6 py-6 sm:grid-cols-2 sm:py-8 lg:grid-cols-12 lg:gap-8">
        {/* Trường & Giới thiệu */}
        <div className="lg:col-span-4">
          <Link to={{ view: 'home' }} className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-md">
              <img src={schoolLogo} alt={`${tr("Logo của Trường", "Logo of")} ${site.school_name}`} className="h-full w-full object-contain" loading="lazy" />
            </span>
            <span className="min-w-0">
              {site.parent_org && <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-300">{site.parent_org}</span>}
              <span className="mt-0.5 block truncate text-base font-extrabold uppercase leading-tight text-white">{tr("Trường", "")} {site.school_name}</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/70">
            {tr('Cổng thông tin điện tử chính thức của nhà trường – nơi cập nhật tin tức, thông báo, kế hoạch dạy học và hoạt động của thầy và trò.')}
          </p>
          {site.address && (
            <p className="mt-3 flex items-start gap-2 text-[12.5px] text-white/60">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-400" />
              <span>{site.address}</span>
            </p>
          )}
        </div>

        {/* Danh mục (2 cột) */}
        <div className="lg:col-span-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">{tr('Danh mục')}</h2>
          <span className="mt-1.5 block h-[2.5px] w-7 rounded-full bg-gradient-to-r from-gold-400 to-flame-500" aria-hidden="true" />
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            {tree.map((item) => (
              <li key={item.id} className="min-w-0">
                <MenuLink category={item} className="block truncate text-white/75 transition-colors duration-200 hover:text-gold-300">
                  {item.name}
                </MenuLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Bản đồ */}
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">{tr('Bản đồ')}</h2>
          <span className="mt-1.5 block h-[2.5px] w-7 rounded-full bg-gradient-to-r from-gold-400 to-flame-500" aria-hidden="true" />
          <div className="mt-3 h-28 overflow-hidden rounded-xl border border-white/10 bg-brand-900 sm:h-32">
            <iframe
              title={`${tr("Bản đồ", "Map")} – ${site.school_name}`}
              src={mapEmbedUrl(site)}
              className="h-full w-full border-0 opacity-90 grayscale-[25%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-1.5 py-3 text-center text-[12px] text-white/50 sm:flex-row sm:text-left">
          <p>© {year} {tr('Trường', '')} {site.school_name}. {tr('Bảo lưu mọi quyền.')}</p>
          <p>{tr('Ghi rõ nguồn khi phát hành lại thông tin từ website này.')}</p>
        </Container>
      </div>
    </footer>
  );
};
