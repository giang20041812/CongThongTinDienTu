import React from 'react';
import { setLang, t, useLang, type Lang } from '../lib/i18n';
import { cx } from './ui';

const OPTIONS: Lang[] = ['vi', 'en'];

/** VI / EN toggle; the choice is persisted and re-renders the whole app. */
export const LanguageSwitcher: React.FC = () => {
  const lang = useLang();
  return (
    <div role="group" aria-label={t('language')} className="flex items-center overflow-hidden rounded-full border border-white/25 text-[11px] font-bold">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={cx('px-2 py-0.5 uppercase transition-colors', lang === option ? 'bg-gold-300 text-brand-950' : 'text-white/80 hover:text-white')}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
