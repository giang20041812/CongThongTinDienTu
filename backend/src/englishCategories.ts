import { query } from './db.js';

/** English names of the default menu entries, by slug. Entries renamed or added by admins are left alone. */
export const ENGLISH_CATEGORY_NAMES: Record<string, string> = {
  'nha-truong': 'About the School',
  'tin-tuc-su-kien': 'News & Events',
  'thi-tuyen-sinh': 'Exams & Admissions',
  'hoc-sinh': 'Students',
  'hoc-tap': 'Learning',
  'cong-khai-van-ban': 'Transparency & Documents',
  'lien-he': 'Contact',

  'gioi-thieu-chung': 'General Introduction',
  'lich-su-hinh-thanh': 'History & Development',
  'ban-giam-hieu': 'Board of Management',
  'co-cau-to-chuc': 'Organizational Structure',
  'cac-to-chuyen-mon': 'Subject Departments',
  'thanh-tich-nha-truong': 'School Achievements',
  'co-so-vat-chat': 'Facilities',

  'tin-nha-truong': 'School News',
  'hoat-dong-chuyen-mon': 'Professional Activities',
  'hoat-dong-giao-duc': 'Educational Activities',
  'hoat-dong-ngoai-khoa': 'Extracurricular Activities',
  'thong-bao': 'Announcements',
  'kho-anh': 'Photo Library',

  'tuyen-sinh-lop-10': 'Grade 10 Admissions',
  'thi-tot-nghiep-thpt': 'National High School Exam',
  'tuyen-sinh-dai-hoc-cao-dang': 'University & College Admissions',
  'huong-nghiep': 'Career Guidance',
  'van-ban-huong-dan-thi': 'Exam Documents & Guidelines',

  'doan-thanh-nien': 'Youth Union',
  'cau-lac-bo': 'Clubs',
  'hoat-dong-hoc-sinh': 'Student Activities',
  'guong-mat-tieu-bieu': 'Outstanding Students',
  'tu-van-tam-ly': 'School Counseling',

  'thoi-khoa-bieu': 'Timetable',
  'tai-lieu-hoc-tap': 'Study Materials',
  'bai-giang-dien-tu': 'E-Lectures',
  'de-kiem-tra-on-tap': 'Tests & Revision',
  'hoc-va-thi-truc-tuyen': 'Online Learning & Exams',

  'cong-khai-co-so-giao-duc': 'School Disclosure',
  'bao-cao-thuong-nien': 'Annual Reports',
  'van-ban-chi-dao': 'Directive Documents',
  'ke-hoach-nha-truong': 'School Plans',
  'thu-tuc-hanh-chinh': 'Administrative Procedures',
};

/** Fills name_en for entries that have none yet; returns the entries that were updated and those still untranslated. */
export async function addEnglishCategoryNames(): Promise<{ updated: string[]; missing: string[] }> {
  const rows = await query<{ slug: string; name: string; nameEn: string | null }>(
    `SELECT slug, name, name_en AS "nameEn" FROM categories ORDER BY sort_order`,
  );
  const updated: string[] = [];
  const missing: string[] = [];
  for (const row of rows) {
    if (row.nameEn?.trim()) continue;
    const english = ENGLISH_CATEGORY_NAMES[row.slug];
    if (!english) { missing.push(`${row.name} (${row.slug})`); continue; }
    await query(`UPDATE categories SET name_en = $2 WHERE slug = $1 AND (name_en IS NULL OR name_en = '')`, [row.slug, english]);
    updated.push(`${row.name} → ${english}`);
  }
  return { updated, missing };
}
