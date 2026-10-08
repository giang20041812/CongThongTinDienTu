import type { ContentCache } from '../cache.js';
import { query, transaction } from '../db.js';
import { HttpError, badRequest, int, jsonArray, jsonObject, localTime, str } from '../http.js';
import { isBlank, trim } from '../text.js';

const CACHE_KEY = 'timetable';
const MIN_DAY = 2;
const MAX_DAY = 8;
const MAX_PERIOD = 15;

export interface PeriodView {
  period: number;
  startTime: string;
  endTime: string;
}

export interface EntryView {
  className: string;
  grade: number;
  dayOfWeek: number;
  period: number;
  subject: string;
  teacher: string | null;
}

export interface TimetableView {
  periods: PeriodView[];
  entries: EntryView[];
}

const dayLabel = (day: number) => (day === 8 ? 'Chủ nhật' : `Thứ ${day}`);

function normalizeClassName(raw: string | null | undefined): string {
  const name = raw == null ? '' : trim(raw).replace(/[ \t\n\v\f\r]+/g, ' ');
  if (!name) throw badRequest('Tên lớp không được để trống.');
  if (name.length > 30) throw badRequest('Tên lớp tối đa 30 ký tự.');
  return name;
}

/** The grade is the leading number of the class name ("10A1" -> 10). */
function gradeOf(className: string): number {
  const match = /^(\d{1,2})/.exec(className);
  const grade = match ? Number(match[1]) : -1;
  if (grade < 1 || grade > 12) throw badRequest('Tên lớp phải bắt đầu bằng khối, ví dụ 10A1.');
  return grade;
}

function limit(value: string, max: number, field: string): string {
  const trimmed = trim(value);
  if (trimmed.length > max) throw badRequest(`${field} tối đa ${max} ký tự.`);
  return trimmed;
}

/** Weekly class timetable ("Thời khóa biểu"): period times plus one entry per class/weekday/period. */
export class TimetableService {
  constructor(private readonly cache: ContentCache) {}

  get(): Promise<TimetableView> {
    return this.cache.get(CACHE_KEY, async () => {
      const [periods, entries] = await Promise.all([
        query<PeriodView>(`SELECT period, start_time AS "startTime", end_time AS "endTime" FROM timetable_periods ORDER BY period`),
        query<EntryView>(
          `SELECT class_name AS "className", grade, day_of_week AS "dayOfWeek", period, subject, teacher
           FROM timetable_entries ORDER BY grade, class_name, day_of_week, period`,
        ),
      ]);
      return { periods, entries };
    });
  }

  /** Replaces the whole week of one class (created if new); blank cells are dropped, so an empty list removes the class. */
  async replaceClass(rawName: string, body: unknown): Promise<void> {
    const raw = body == null ? null : jsonObject(body).entries;
    const slots = raw == null ? [] : jsonArray(raw).map((slot) => {
      if (slot == null) return null;
      const s = jsonObject(slot);
      return { dayOfWeek: int(s.dayOfWeek), period: int(s.period), subject: str(s.subject), teacher: str(s.teacher) };
    });
    const className = normalizeClassName(rawName);
    const grade = gradeOf(className);

    await transaction(async (db) => {
      const known = new Set((await query<{ period: number }>(`SELECT period FROM timetable_periods`, [], db)).map((p) => p.period));
      const rows: { day: number; period: number; subject: string; teacher: string | null }[] = [];
      const seen = new Set<string>();
      for (const slot of slots) {
        if (slot == null || slot.subject == null || isBlank(slot.subject)) continue;
        const day = slot.dayOfWeek ?? -1;
        const period = slot.period ?? -1;
        if (day < MIN_DAY || day > MAX_DAY) throw badRequest(`Ngày trong tuần không hợp lệ: ${slot.dayOfWeek}`);
        if (!known.has(period)) throw badRequest(`Tiết ${slot.period} chưa được khai báo giờ học.`);
        const key = `${day}-${period}`;
        if (seen.has(key)) throw badRequest(`Trùng tiết ${period} của ${dayLabel(day)}.`);
        seen.add(key);
        rows.push({
          day,
          period,
          subject: limit(slot.subject, 100, 'Tên môn'),
          teacher: slot.teacher == null || isBlank(slot.teacher) ? null : limit(slot.teacher, 100, 'Tên giáo viên'),
        });
      }
      await db.query(`DELETE FROM timetable_entries WHERE class_name = $1`, [className]);
      if (rows.length) {
        await db.query(
          `INSERT INTO timetable_entries (class_name, grade, day_of_week, period, subject, teacher)
           SELECT $1, $2, t.day, t.period, t.subject, t.teacher
           FROM unnest($3::int[], $4::int[], $5::text[], $6::text[]) AS t(day, period, subject, teacher)`,
          [className, grade, rows.map((r) => r.day), rows.map((r) => r.period), rows.map((r) => r.subject), rows.map((r) => r.teacher)],
        );
      }
    });
    this.cache.clear();
  }

  /** False when the class had no entries. */
  async deleteClass(rawName: string): Promise<boolean> {
    const result = await query(`DELETE FROM timetable_entries WHERE class_name = $1 RETURNING 1`, [normalizeClassName(rawName)]);
    this.cache.clear();
    return result.length > 0;
  }

  /** Upserts the period times; a period can only be removed once no class uses it. */
  async replacePeriods(body: unknown): Promise<void> {
    const requested = (body == null ? [] : jsonArray(body)).map((raw) => {
      if (raw == null) return null;
      const p = jsonObject(raw);
      return { period: int(p.period) ?? 0, startTime: localTime(p.startTime), endTime: localTime(p.endTime) };
    });
    if (requested.length === 0) throw badRequest('Cần ít nhất một tiết học.');
    const byNumber = new Map<number, PeriodView>();
    for (const p of requested) {
      const period = p?.period ?? 0;
      const startTime = p?.startTime ?? null;
      const endTime = p?.endTime ?? null;
      if (period < 1 || period > MAX_PERIOD) throw badRequest(`Số tiết phải từ 1 đến ${MAX_PERIOD}.`);
      if (startTime == null || endTime == null || !(startTime < endTime)) {
        throw badRequest(`Giờ bắt đầu của tiết ${period} phải trước giờ kết thúc.`);
      }
      if (byNumber.has(period)) throw badRequest(`Tiết ${period} bị khai báo hai lần.`);
      byNumber.set(period, { period, startTime, endTime });
    }

    await transaction(async (db) => {
      const existing = (await query<{ period: number }>(`SELECT period FROM timetable_periods ORDER BY period`, [], db)).map((p) => p.period);
      const removed = existing.filter((n) => !byNumber.has(n));
      if (removed.length) {
        const classes = await query<{ className: string }>(
          `SELECT DISTINCT class_name AS "className" FROM timetable_entries WHERE period = ANY($1::int[]) ORDER BY class_name`,
          [removed],
          db,
        );
        if (classes.length) {
          throw new HttpError(
            409,
            `Không thể xoá tiết [${removed.join(', ')}] vì đang được dùng trong thời khóa biểu của lớp: ${classes.map((c) => c.className).join(', ')}.`,
          );
        }
        await db.query(`DELETE FROM timetable_periods WHERE period = ANY($1::int[])`, [removed]);
      }
      const periods = [...byNumber.values()].sort((a, b) => a.period - b.period);
      await db.query(
        `INSERT INTO timetable_periods (period, start_time, end_time)
         SELECT * FROM unnest($1::int[], $2::time[], $3::time[])
         ON CONFLICT (period) DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time`,
        [periods.map((p) => p.period), periods.map((p) => p.startTime), periods.map((p) => p.endTime)],
      );
    });
    this.cache.clear();
  }
}
