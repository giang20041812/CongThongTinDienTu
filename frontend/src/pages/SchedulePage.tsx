import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Clock, Info, Printer } from 'lucide-react';
import { useTimetable } from '../api';
import { splitLines, useSite } from '../lib/site';
import type { TimetableEntry, TimetablePeriod } from '../types';
import { SectionHeader, type SectionProps } from '../components/SectionHeader';
import { Container, EmptyState, ListSkeleton, Reveal, cx, secondaryButton } from '../components/ui';

export const DAY_LABELS: Record<number, string> = { 2: 'Thứ Hai', 3: 'Thứ Ba', 4: 'Thứ Tư', 5: 'Thứ Năm', 6: 'Thứ Sáu', 7: 'Thứ Bảy', 8: 'Chủ nhật' };
/** Periods after this one are the afternoon session. */
export const LAST_MORNING_PERIOD = 5;
const HIGHLIGHTED = new Set(['chào cờ', 'sinh hoạt lớp']);
const CLASS_KEY = 'tkb-class';

export const formatPeriodTime = (p?: TimetablePeriod) => (p ? `${p.startTime.slice(0, 5)} – ${p.endTime.slice(0, 5)}` : '');

/** Natural sort so "10A2" comes before "10A10". */
export const compareClassNames = (a: string, b: string) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });

const todayNumber = () => {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
};

const readStoredClass = () => {
  try {
    return localStorage.getItem(CLASS_KEY);
  } catch {
    return null;
  }
};

const Cell: React.FC<{ entry?: TimetableEntry }> = ({ entry }) =>
  entry ? (
    <div className={cx('inline-flex flex-col rounded-lg px-2.5 py-1 text-center', HIGHLIGHTED.has(entry.subject.toLowerCase()) && 'bg-gold-100')}>
      <span className={cx('text-[13px] font-semibold leading-snug', HIGHLIGHTED.has(entry.subject.toLowerCase()) ? 'text-gold-700' : 'text-ink')}>{entry.subject}</span>
      {entry.teacher && <span className="text-[11.5px] text-muted">{entry.teacher}</span>}
    </div>
  ) : (
    <span className="text-[13px] text-line">—</span>
  );

/** Class timetable from /api/timetable: pick a grade and a class, see the week by session. */
export const SchedulePage: React.FC<SectionProps> = (props) => {
  const { data, loading } = useTimetable();
  const site = useSite();
  const notes = splitLines(site.timetable_notes);

  const classes = useMemo(() => {
    const byName = new Map<string, number>();
    data.entries.forEach((e) => byName.set(e.className, e.grade));
    return Array.from(byName, ([name, grade]) => ({ name, grade })).sort((a, b) => a.grade - b.grade || compareClassNames(a.name, b.name));
  }, [data.entries]);
  const grades = useMemo(() => Array.from(new Set(classes.map((c) => c.grade))), [classes]);

  const [className, setClassName] = useState<string | null>(null);
  useEffect(() => {
    if (classes.length === 0) return;
    if (className && classes.some((c) => c.name === className)) return;
    const stored = readStoredClass();
    setClassName(classes.some((c) => c.name === stored) ? stored : classes[0].name);
  }, [classes]);

  const selectClass = (name: string) => {
    setClassName(name);
    try {
      localStorage.setItem(CLASS_KEY, name);
    } catch {
      /* storage unavailable */
    }
  };

  const current = classes.find((c) => c.name === className);
  const grade = current?.grade ?? grades[0];
  const cells = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    data.entries.filter((e) => e.className === className).forEach((e) => map.set(`${e.dayOfWeek}-${e.period}`, e));
    return map;
  }, [data.entries, className]);

  // Weekdays shown: Monday–Friday always, Saturday/Sunday only if the school teaches then.
  const days = useMemo(() => {
    const set = new Set([2, 3, 4, 5, 6]);
    data.entries.forEach((e) => set.add(e.dayOfWeek));
    return Array.from(set).sort((a, b) => a - b);
  }, [data.entries]);

  const sessions = useMemo(() => {
    const used = new Set(Array.from(cells.values()).map((e) => e.period));
    const morning = data.periods.filter((p) => p.period <= LAST_MORNING_PERIOD && (used.has(p.period) || used.size > 0));
    const afternoon = data.periods.filter((p) => p.period > LAST_MORNING_PERIOD && used.has(p.period));
    return [
      { label: 'Buổi sáng', periods: morning },
      { label: 'Buổi chiều', periods: afternoon },
    ].filter((s) => s.periods.length > 0);
  }, [cells, data.periods]);

  const today = todayNumber();
  const lessonCount = cells.size;

  return (
    <>
      <SectionHeader
        {...props}
        aside={
          <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20">
            <Printer className="size-4" />
            In thời khóa biểu
          </button>
        }
      />
      <Container className="py-10 sm:py-12">
        {loading ? (
          <ListSkeleton rows={5} />
        ) : classes.length === 0 ? (
          <EmptyState title="Chưa có thời khóa biểu" description="Thời khóa biểu sẽ được nhà trường cập nhật tại đây." />
        ) : (
          <>
            <Reveal>
              <div className="no-print rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">Khối</span>
                    <div className="inline-flex rounded-full bg-surface p-1">
                      {grades.map((g) => (
                        <button
                          key={g}
                          onClick={() => selectClass(classes.find((c) => c.grade === g)!.name)}
                          className={cx(
                            'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-300',
                            grade === g ? 'bg-brand-600 text-white shadow-sm' : 'text-body hover:text-brand-600',
                          )}
                        >
                          Khối {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex min-w-0 items-center gap-3 lg:border-l lg:border-line lg:pl-5">
                    <span className="shrink-0 text-[12px] font-semibold uppercase tracking-wider text-muted">Lớp</span>
                    <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
                      {classes
                        .filter((c) => c.grade === grade)
                        .map((c) => (
                          <button
                            key={c.name}
                            onClick={() => selectClass(c.name)}
                            className={cx(
                              'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300',
                              className === c.name ? 'border-gold-400 bg-gold-100 text-gold-700' : 'border-line bg-white text-body hover:border-brand-300 hover:text-brand-600',
                            )}
                          >
                            {c.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  Lớp <span className="text-brand-600">{className}</span>
                </h2>
                {site.timetable_term && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted">
                    <CalendarClock className="size-4 text-gold-600" />
                    {site.timetable_term}
                  </p>
                )}
              </div>
              <p className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <Clock className="size-4 text-gold-600" />
                {lessonCount} tiết / tuần
              </p>
            </div>

            {sessions.map((session) => (
              <section key={session.label} className="mt-5">
                <h3 className="mb-3 text-[14px] font-bold uppercase tracking-wider text-brand-700">{session.label}</h3>

                {/* Desktop / tablet table */}
                <Reveal className="hidden md:block">
                  <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-brand-700 text-white">
                          <th className="w-20 px-4 py-3.5 text-[12.5px] font-semibold uppercase tracking-wider">Tiết</th>
                          <th className="w-32 px-3 py-3.5 text-[12.5px] font-semibold uppercase tracking-wider">Thời gian</th>
                          {days.map((day) => (
                            <th key={day} className={cx('px-3 py-3.5 text-center text-[12.5px] font-semibold uppercase tracking-wider', day === today && 'bg-brand-500')}>
                              {DAY_LABELS[day]}
                              {day === today && <span className="ml-1.5 rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] text-brand-950">Hôm nay</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {session.periods.map((p) => (
                          <tr key={p.period} className="transition-colors hover:bg-brand-50/40">
                            <td className="px-4 py-3 text-[14px] font-bold text-brand-700">Tiết {p.period}</td>
                            <td className="px-3 py-3 text-[13px] tabular-nums text-muted">{formatPeriodTime(p)}</td>
                            {days.map((day) => (
                              <td key={day} className={cx('px-2 py-2.5 text-center', day === today && 'bg-gold-50/70')}>
                                <Cell entry={cells.get(`${day}-${p.period}`)} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Reveal>

                {/* Mobile: one card per day */}
                <div className="grid gap-4 md:hidden">
                  {days.map((day) => {
                    const lessons = session.periods.filter((p) => cells.has(`${day}-${p.period}`));
                    if (lessons.length === 0) return null;
                    return (
                      <div key={day} className={cx('overflow-hidden rounded-2xl border bg-white shadow-card', day === today ? 'border-gold-400' : 'border-line')}>
                        <div className={cx('flex items-center justify-between px-4 py-3 text-white', day === today ? 'bg-brand-600' : 'bg-brand-700')}>
                          <span className="font-semibold">{DAY_LABELS[day]}</span>
                          {day === today && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[11px] font-semibold text-brand-950">Hôm nay</span>}
                        </div>
                        <ul className="divide-y divide-line">
                          {lessons.map((p) => {
                            const entry = cells.get(`${day}-${p.period}`)!;
                            return (
                              <li key={p.period} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="w-14 shrink-0 text-[13px] font-bold text-brand-700">Tiết {p.period}</span>
                                <span className="w-24 shrink-0 text-[12px] tabular-nums text-muted">{formatPeriodTime(p)}</span>
                                <span className="min-w-0">
                                  <span className="block text-[13.5px] font-semibold text-ink">{entry.subject}</span>
                                  {entry.teacher && <span className="block text-[12px] text-muted">{entry.teacher}</span>}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {notes.length > 0 && (
              <Reveal className="mt-8">
                <div className="flex gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                  <Info className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <ul className="space-y-1.5 text-[14px] text-body">
                    {notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
            <div className="no-print mt-6 flex justify-end">
              <button onClick={() => window.print()} className={secondaryButton}>
                <Printer className="size-4" />
                In thời khóa biểu lớp {className}
              </button>
            </div>
          </>
        )}
      </Container>
    </>
  );
};
