import React, { useState } from 'react';
import { CheckCircle, Clock, EnvelopeSimple, FacebookLogo, GlobeHemisphereEast, MapPin, MessengerLogo, PaperPlaneTilt, Phone } from '../components/icons';
import { submitFeedback } from '../api';
import { mapEmbedUrl, telHref, useSite } from '../lib/site';
import { useMenu, MenuLink } from '../lib/menu';
import { SectionHeader, type SectionProps } from '../components/SectionHeader';
import { Container, Reveal, cx, primaryButton } from '../components/ui';

const MapFrame: React.FC<{ className?: string }> = ({ className }) => {
  const site = useSite();
  return (
    <div className={cx('overflow-hidden rounded-2xl border border-line bg-brand-50 shadow-card', className)}>
      <iframe
        title={`Bản đồ Trường ${site.school_name}`}
        src={mapEmbedUrl(site)}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

const ContactLine: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <li className="flex gap-4 py-4">
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-0.5 break-words text-[15px] font-semibold text-ink">{children}</div>
    </div>
  </li>
);

export const ContactPage: React.FC<SectionProps> = (props) => {
  const site = useSite();
  const { categories } = useMenu();
  const feedbackEntry = categories.find((c) => c.pageType === 'FEEDBACK');
  return (
    <>
      <SectionHeader {...props} />
      <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-700">{site.parent_org}</p>
            <h2 className="mt-1 text-xl font-bold uppercase text-brand-700">Trường {site.school_name}</h2>
            <ul className="mt-4 divide-y divide-line">
              {site.address && <ContactLine icon={MapPin} label="Địa chỉ">{site.address}</ContactLine>}
              {site.hotline && (
                <ContactLine icon={Phone} label="Điện thoại">
                  <a href={telHref(site.hotline)} className="hover:text-brand-600">{site.hotline}</a>
                </ContactLine>
              )}
              {(site.email || site.official_email) && (
                <ContactLine icon={EnvelopeSimple} label="Email">
                  {site.email && <a href={`mailto:${site.email}`} className="hover:text-brand-600">{site.email}</a>}
                  {site.official_email && (
                    <a
                      href={`mailto:${site.official_email}`}
                      className={cx('hover:text-brand-600', site.email && 'mt-1 block text-[14px] font-medium text-body')}
                    >
                      {site.official_email}
                    </a>
                  )}
                </ContactLine>
              )}
              {site.working_hours && <ContactLine icon={Clock} label="Giờ làm việc">{site.working_hours}</ContactLine>}
              {site.website && <ContactLine icon={GlobeHemisphereEast} label="Website">{site.website}</ContactLine>}
              {site.facebook_url && (
                <ContactLine icon={FacebookLogo} label="Facebook">
                  <a href={site.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">{site.facebook_url.replace(/^https?:\/\//, '')}</a>
                </ContactLine>
              )}
              {site.messenger_url && (
                <ContactLine icon={MessengerLogo} label="Messenger">
                  <a href={site.messenger_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Nhắn tin cho nhà trường</a>
                </ContactLine>
              )}
            </ul>
            {feedbackEntry && (
              <MenuLink category={feedbackEntry} className={cx(primaryButton, 'mt-4 w-full')}>
                <PaperPlaneTilt className="size-4" />
                Gửi góp ý cho nhà trường
              </MenuLink>
            )}
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7" delay={100}>
          <MapFrame className="h-[420px] lg:h-full lg:min-h-[480px]" />
        </Reveal>
      </Container>
    </>
  );
};

export const MapPage: React.FC<SectionProps> = (props) => {
  const site = useSite();
  return (
    <>
      <SectionHeader {...props} />
      <Container className="py-10 sm:py-12">
        <p className="mb-5 flex items-center gap-2 text-[15px] text-body">
          <MapPin className="size-5 shrink-0 text-flame-500" />
          <span>
            <b className="text-ink">Trường {site.school_name}</b>
            {site.address && ` – ${site.address}`}
          </span>
        </p>
        <MapFrame className="h-[65vh] min-h-[380px]" />
      </Container>
    </>
  );
};

const inputClass =
  'h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100';

export const FeedbackPage: React.FC<SectionProps> = (props) => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', content: '', website: '' });
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'sent'; error?: string }>({ status: 'idle' });
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.content.trim()) {
      setState({ status: 'idle', error: 'Vui lòng nhập họ tên và nội dung góp ý.' });
      return;
    }
    setState({ status: 'sending' });
    try {
      await submitFeedback(form);
      setState({ status: 'sent' });
      setForm({ fullName: '', email: '', phone: '', subject: '', content: '', website: '' });
    } catch (err) {
      setState({ status: 'idle', error: err instanceof Error ? err.message : 'Không gửi được góp ý. Vui lòng thử lại.' });
    }
  };

  return (
    <>
      <SectionHeader {...props} />
      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-card sm:p-9">
          {state.status === 'sent' ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="size-14 text-green-600" />
              <h2 className="mt-4 text-xl font-bold">Cảm ơn bạn đã gửi góp ý!</h2>
              <p className="mt-2 max-w-md text-sm text-muted">Nhà trường đã tiếp nhận và sẽ phản hồi qua thông tin liên hệ bạn cung cấp (nếu cần).</p>
              <button onClick={() => setState({ status: 'idle' })} className={cx(primaryButton, 'mt-6')}>
                Gửi góp ý khác
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <p className="text-[14px] text-body sm:col-span-2">
                Ý kiến của phụ huynh, học sinh và người dân giúp nhà trường hoàn thiện hơn. Các trường có dấu <span className="text-flame-600">*</span> là bắt buộc.
              </p>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Họ và tên <span className="text-flame-600">*</span></span>
                <input value={form.fullName} onChange={set('fullName')} maxLength={100} className={inputClass} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Email</span>
                <input type="email" value={form.email} onChange={set('email')} maxLength={150} className={inputClass} autoComplete="email" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Số điện thoại</span>
                <input type="tel" value={form.phone} onChange={set('phone')} maxLength={20} className={inputClass} autoComplete="tel" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Tiêu đề</span>
                <input value={form.subject} onChange={set('subject')} maxLength={200} className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Nội dung góp ý <span className="text-flame-600">*</span></span>
                <textarea value={form.content} onChange={set('content')} maxLength={3000} rows={6} className={cx(inputClass, 'h-auto py-3')} />
              </label>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              {state.error && <p className="text-sm font-medium text-flame-600 sm:col-span-2">{state.error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={state.status === 'sending'} className={cx(primaryButton, 'w-full disabled:opacity-60 sm:w-auto')}>
                  <PaperPlaneTilt className="size-4" />
                  {state.status === 'sending' ? 'Đang gửi...' : 'Gửi góp ý'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </>
  );
};
