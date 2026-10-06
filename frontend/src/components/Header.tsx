import React from 'react';
import { EnvelopeSimple, MapPin, Phone } from './icons';
import { telHref, useSite } from '../lib/site';
import schoolLogo from '../assets/logo.jpg';
import { Link } from '../lib/router';
import { Container } from './ui';

const todayLabel = () => {
  const label = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  return label.charAt(0).toLocaleUpperCase('vi-VN') + label.slice(1);
};

const sloganParts = (slogan: string) =>
  slogan
    .split('-')
    .map((part) => part.trim().toLocaleLowerCase('vi-VN'))
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('vi-VN') + part.slice(1));

/**
 * Identity block: a slim utility strip and the school's logo + name, which now
 * sit above everything else instead of being overlaid on the banner photo.
 */
export const Header: React.FC = () => {
  const site = useSite();
  return (
  <header className="relative z-30 bg-white">
    <div className="brand-stripe h-1" aria-hidden="true" />

    <div className="bg-brand-950 text-[12px] text-white/75">
      <Container className="flex h-9 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate font-semibold uppercase tracking-[0.12em] text-gold-300">{site.parent_org}</span>
          <span className="hidden h-3 w-px bg-white/20 lg:block" aria-hidden="true" />
          <span className="hidden whitespace-nowrap lg:block">{todayLabel()}</span>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          {site.address && (
            <span className="hidden items-center gap-1.5 xl:flex">
              <MapPin className="size-3.5 text-gold-300" aria-hidden="true" />
              {site.address}
            </span>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 transition-colors hover:text-white sm:flex">
              <EnvelopeSimple className="size-3.5 text-gold-300" aria-hidden="true" />
              {site.email}
            </a>
          )}
          {site.hotline && (
            <a href={telHref(site.hotline)} className="flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-gold-300">
              <Phone className="size-3.5 text-gold-300" aria-hidden="true" />
              {site.hotline}
            </a>
          )}
        </div>
      </Container>
    </div>

    <div className="relative overflow-hidden border-b border-line/70">
      {/* Sun-and-sky motif borrowed from the logo, kept very faint */}
      <div className="bg-dots-brand absolute inset-y-0 right-0 w-2/3 [mask-image:linear-gradient(90deg,transparent,#000_60%)]" aria-hidden="true" />
      <div className="absolute -right-16 -top-24 size-72 rounded-full bg-gold-300/25 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-6 top-1/2 hidden h-px w-[38%] -translate-y-1/2 bg-gradient-to-l from-gold-300/0 via-gold-300/60 to-gold-300/0 lg:block" aria-hidden="true" />

      <Container className="relative flex items-center gap-6 py-4 sm:py-5">
        <Link to={{ view: 'home' }} className="group flex min-w-0 items-center gap-3 sm:gap-4" aria-label={`Trang chủ Trường ${site.school_name}`}>
          <img
            src={schoolLogo}
            alt={`Logo Trường ${site.school_name}`}
            width={92}
            height={79}
            className="h-14 w-auto shrink-0 object-contain transition-transform duration-500 ease-(--ease-soft) group-hover:scale-[1.04] sm:h-[72px] lg:h-[84px]"
          />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-500 sm:text-xs">
              {site.parent_org}
            </p>
            <p className="mt-0.5 text-[15px] font-extrabold uppercase leading-tight tracking-tight text-brand-700 min-[400px]:text-[1.05rem] sm:text-[1.65rem] lg:text-[2rem]">
              Trường {site.school_name}
            </p>
            <p className="mt-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-flame-600 sm:text-[13px]">
              <span className="hidden h-[3px] w-6 rounded-full bg-gold-400 sm:block" aria-hidden="true" />
              {sloganParts(site.slogan).join(' · ')}
            </p>
          </div>
        </Link>

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          {site.hotline && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-2.5 backdrop-blur">
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-orange-500 text-white shadow-md shadow-gold-500/30">
              <Phone className="size-[18px]" />
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Đường dây nóng</div>
              <a href={telHref(site.hotline)} className="text-[15px] font-bold text-brand-700 hover:text-brand-500">
                {site.hotline}
              </a>
            </div>
          </div>
          )}
          {site.official_email && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 py-2.5 backdrop-blur">
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-violet-600 text-white shadow-md shadow-brand-600/30">
              <EnvelopeSimple className="size-[18px]" />
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Thư điện tử</div>
              <a href={`mailto:${site.official_email}`} className="text-[14px] font-semibold text-brand-700 hover:text-brand-500">
                {site.official_email}
              </a>
            </div>
          </div>
          )}
        </div>
      </Container>
    </div>
  </header>
  );
};
