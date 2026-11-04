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

/** English short descriptions by slug; only applied to entries that already have a Vietnamese description. */
export const ENGLISH_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'nha-truong': 'General information about the school.',
  'tin-tuc-su-kien': 'The latest news, events and announcements of the school.',
  'thi-tuyen-sinh': 'Information on exams and admissions.',
  'hoc-sinh': 'Activities and life of our students.',
  'hoc-tap': 'Timetables, study materials and learning resources.',
  'cong-khai-van-ban': 'Public disclosures and official documents of the school.',
  'lien-he': 'How to get in touch with the school.',
  'gioi-thieu-chung': 'An overview of the school.',
  'lich-su-hinh-thanh': "The school's history, from its founding to today.",
  'ban-giam-hieu': "The school's Board of Management.",
  'co-cau-to-chuc': 'The organizational structure of the school.',
  'cac-to-chuyen-mon': "The school's subject departments.",
  'thanh-tich-nha-truong': 'Achievements of the school, its teachers and students.',
  'co-so-vat-chat': 'Classrooms, laboratories and other school facilities.',
  'tin-nha-truong': 'The latest news from the school.',
  'hoat-dong-chuyen-mon': 'Professional and teaching activities of the school.',
  'hoat-dong-giao-duc': 'Educational activities of the school.',
  'hoat-dong-ngoai-khoa': 'Extracurricular activities of teachers and students.',
  'thong-bao': 'Official announcements from the school.',
  'kho-anh': 'Photos of the activities of teachers and students.',
  'tuyen-sinh-lop-10': 'Information on Grade 10 admissions.',
  'thi-tot-nghiep-thpt': 'Information on the national high school graduation exam.',
  'tuyen-sinh-dai-hoc-cao-dang': 'Information on university and college admissions.',
  'huong-nghiep': 'Career guidance for students.',
  'van-ban-huong-dan-thi': 'Documents and guidelines for exams.',
  'doan-thanh-nien': 'Activities of the school Youth Union and its chapters.',
  'cau-lac-bo': 'Academic, arts, sports and skills clubs for students.',
  'hoat-dong-hoc-sinh': 'Emulation movements and collective activities of students.',
  'guong-mat-tieu-bieu': 'Students who excel in study, training and community activities.',
  'tu-van-tam-ly': "Information and articles supporting students' mental health.",
  'thoi-khoa-bieu': 'Class timetables of the school.',
  'tai-lieu-hoc-tap': 'Study materials for students.',
  'bai-giang-dien-tu': 'E-lectures from our teachers.',
  'de-kiem-tra-on-tap': 'Tests and revision materials.',
  'hoc-va-thi-truc-tuyen': 'Online learning and exam resources.',
  'cong-khai-co-so-giao-duc': "Public disclosure of the school's educational information.",
  'bao-cao-thuong-nien': 'Annual reports of the school.',
  'van-ban-chi-dao': 'Directive documents from higher authorities and the school.',
  'ke-hoach-nha-truong': "The school's plans and programmes.",
  'thu-tuc-hanh-chinh': 'Administrative procedures and forms.',
};

/** Fills name_en for entries that have none yet; returns the entries that were updated and those still untranslated. */
export async function addEnglishCategoryNames(): Promise<{ updated: string[]; missing: string[] }> {
  const rows = await query<{ slug: string; name: string; nameEn: string | null; description: string | null; descriptionEn: string | null }>(
    `SELECT slug, name, name_en AS "nameEn", description, description_en AS "descriptionEn" FROM categories ORDER BY sort_order`,
  );
  const updated: string[] = [];
  const missing: string[] = [];
  for (const row of rows) {
    if (!row.nameEn?.trim()) {
      const english = ENGLISH_CATEGORY_NAMES[row.slug];
      if (!english) missing.push(`${row.name} (${row.slug})`);
      else {
        await query(`UPDATE categories SET name_en = $2 WHERE slug = $1 AND (name_en IS NULL OR name_en = '')`, [row.slug, english]);
        updated.push(`${row.name} → ${english}`);
      }
    }
    if (row.description?.trim() && !row.descriptionEn?.trim()) {
      const english = ENGLISH_CATEGORY_DESCRIPTIONS[row.slug];
      if (!english) missing.push(`mô tả của ${row.name} (${row.slug})`);
      else {
        await query(`UPDATE categories SET description_en = $2 WHERE slug = $1 AND (description_en IS NULL OR description_en = '')`, [row.slug, english]);
        updated.push(`mô tả ${row.name} → ${english}`);
      }
    }
  }
  return { updated, missing };
}
