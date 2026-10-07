import React from 'react';
import { ArrowSquareOut, EnvelopeSimple, GlobeHemisphereEast, MapPin, Phone } from './icons';
import schoolLogo from '../assets/logo.jpg';
import { Link } from '../lib/router';
import { MenuLink, useMenu } from '../lib/menu';
import { mapEmbedUrl, parseLinks, telHref, useSite } from '../lib/site';
import { Container } from './ui';

export const Footer: React.FC = () => {
  const site = useSite();
  const { tree } = useMenu();
  const year = new Date().getFullYear();
  const usefulLinks = parseLinks(site.useful_links);
  const email = site.email || site.official_email;

  return (
    <footer className="no-print relative mt-auto overflow-hidden bg-brand-950 text-white/75">
      <div className="brand-stripe h-1" aria-hidden="true" />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
      <div className="absolute -left-24 top-10 size-80 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 size-72 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />

      <Container className="relative grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6 lg:py-10">
        <div className="lg:col-span-4">
          <Link to={{ view: 'home' }} className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-lg">
              <img src={schoolLogo} alt={`Logo Trường ${site.school_name}`} className="h-full w-full object-contain" loading="lazy" />
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">{site.parent_org}</span>
              <span className="mt-1 block text-lg font-extrabold uppercase leading-tight text-white">Trường {site.school_name}</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed">
            Cổng thông tin điện tử chính thức của nhà trường – nơi cập nhật tin tức, thông báo, kế hoạch dạy học và hoạt động của thầy và trò.
          </p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            {site.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-300" />
                {site.address}
              </li>
            )}
            {site.hotline && (
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-gold-300" />
                <a href={telHref(site.hotline)} className="transition-colors hover:text-white">{site.hotline}</a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-3">
                <EnvelopeSimple className="size-4 shrink-0 text-gold-300" />
                <a href={`mailto:${email}`} className="break-all transition-colors hover:text-white">{email}</a>
              </li>
            )}
            {site.website && (
              <li className="flex items-center gap-3">
                <GlobeHemisphereEast className="size-4 shrink-0 text-gold-300" />
                {site.website}
              </li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Danh mục</h2>
          <span className="mt-2 block h-[3px] w-8 rounded-full bg-gradient-to-r from-gold-400 to-flame-500" aria-hidden="true" />
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {tree.map((item) => (
              <li key={item.id}>
                <MenuLink category={item} className="transition-colors duration-300 hover:text-gold-300">
                  {item.name}
                </MenuLink>
              </li>
            ))}
          </ul>
        </div>

        {usefulLinks.length > 0 && <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Liên kết</h2>
          <span className="mt-2 block h-[3px] w-8 rounded-full bg-gradient-to-r from-gold-400 to-flame-500" aria-hidden="true" />
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {usefulLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-gold-300">
                  {link.label}
                  <ArrowSquareOut className="size-3 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        </div>}

        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Bản đồ</h2>
          <span className="mt-2 block h-[3px] w-8 rounded-full bg-gradient-to-r from-gold-400 to-flame-500" aria-hidden="true" />
          <div className="mt-4 h-40 overflow-hidden rounded-2xl border border-white/10 bg-brand-900">
            <iframe
              title={`Bản đồ Trường ${site.school_name}`}
              src={mapEmbedUrl(site)}
              className="h-full w-full border-0 opacity-90 grayscale-[30%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-center text-[12.5px] text-white/55 sm:flex-row sm:text-left">
          <p>© {year} Trường {site.school_name}. Bảo lưu mọi quyền.</p>
          <p>Ghi rõ nguồn khi phát hành lại thông tin từ website này.</p>
        </Container>
      </div>
    </footer>
  );
};
