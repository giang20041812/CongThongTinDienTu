import React from 'react';
import { ChevronRight } from 'lucide-react';
import { EduImageFrame } from './EduImageFrame';
import {
  ALL_NEWS,
  SCHOOL_SHOWCASE,
  ALL_ADMISSIONS,
  ALL_STUDY_ABROAD,
  ALL_CLUBS,
  ALL_ANNOUNCEMENTS,
} from '../data/mockData';

interface MultiCategorySectionProps {
  onSelectNews?: (id: string) => void;
  onNavigate?: (view: string) => void;
}

// ── Một category column ────────────────────────────────────────────────────────
interface CategoryColumnProps {
  headerLabel: string;
  headerColor?: string; // tailwind bg class
  featuredImage: { label: string; subLabel: string; theme: 'exam' | 'lab' | 'campus' | 'ceremony' | 'club' | 'lost' };
  featuredTitle: string;
  subItems: { title: string; date?: string }[];
  onClickFeatured?: () => void;
  onClickMore?: () => void;
  moreLabel?: string;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  headerLabel,
  headerColor = 'bg-[#003087]',
  featuredImage,
  featuredTitle,
  subItems,
  onClickFeatured,
  onClickMore,
  moreLabel = 'Xem thêm',
}) => (
  <div className="flex flex-col min-w-0">
    {/* Header bar */}
    <div className={`${headerColor} px-3 py-1.5 mb-3`}>
      <span className="text-white text-xs font-bold uppercase tracking-wider">{headerLabel}</span>
    </div>

    {/* Featured: image + title */}
    <div
      onClick={onClickFeatured}
      className="group cursor-pointer mb-3"
    >
      <div className="w-full overflow-hidden border border-[#d1ddf5] group-hover:border-[#003087] transition-colors">
        <EduImageFrame
          label={featuredImage.label}
          subLabel={featuredImage.subLabel}
          theme={featuredImage.theme}
          aspectRatio="16:9"
        />
      </div>
      <h3 className="mt-2 text-xs sm:text-[13px] font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors leading-snug line-clamp-3 uppercase">
        {featuredTitle}
      </h3>
    </div>

    {/* Sub items list */}
    <div className="flex flex-col divide-y divide-[#e8eef8] flex-1">
      {subItems.map((item, idx) => (
        <button
          key={idx}
          onClick={onClickMore}
          className="group text-left py-1.5 flex items-start gap-1.5 hover:bg-[#f5f7fc] transition-colors px-1"
        >
          <span className="mt-1 shrink-0 text-[#003087]">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M4 2 L12 8 L4 14" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-[#1a2744] group-hover:text-[#003087] transition-colors leading-snug line-clamp-2">
            {item.title}
          </span>
        </button>
      ))}
    </div>

    {/* Xem thêm */}
    <div className="mt-3 pt-2 border-t border-[#d1ddf5]">
      <button
        onClick={onClickMore}
        className="text-[11px] font-bold text-[#003087] hover:text-[#001a52] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span className="italic">» {moreLabel}</span>
      </button>
    </div>
  </div>
);

// ── Main Section ────────────────────────────────────────────────────────────────
export const MultiCategorySection: React.FC<MultiCategorySectionProps> = ({
  onSelectNews,
  onNavigate,
}) => {
  // Row 1 data
  const schoolNews = SCHOOL_SHOWCASE;
  const youthActivities = ALL_NEWS.filter((n) => n.category === 'PHONG TRÀO' || n.category === 'HỢP TÁC');
  const clubItems = ALL_CLUBS;
  const admissions = ALL_ADMISSIONS;
  const studyAbroad = ALL_STUDY_ABROAD;
  const competitions = ALL_NEWS.filter((n) => n.category === 'CHUYÊN MÔN' || n.category === 'HỌC THUẬT');
  const science = ALL_NEWS.filter((n) => n.category === 'THỰC NGHIỆM');
  const announcements = ALL_ANNOUNCEMENTS;

  return (
    <>
      {/* ──────────────── ROW 1: TIN NHÀ TRƯỜNG | THANH NIÊN | CLB | THÔNG BÁO ─── */}
      <section className="w-full bg-white border-b border-[#d1ddf5] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

            {/* TIN NHÀ TRƯỜNG */}
            <CategoryColumn
              headerLabel="TIN NHÀ TRƯỜNG"
              headerColor="bg-[#003087]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Nhà Trường', theme: 'campus' }}
              featuredTitle={schoolNews[0]?.title || 'Tin tức nhà trường'}
              subItems={[
                { title: schoolNews[1]?.title || 'Tin nhà trường 2' },
                { title: schoolNews[2]?.title || 'Hoạt động đặc biệt' },
              ]}
              onClickFeatured={() => onSelectNews?.('news-1')}
              onClickMore={() => onNavigate?.('news-list')}
            />

            {/* HOẠT ĐỘNG THANH NIÊN */}
            <CategoryColumn
              headerLabel="HOẠT ĐỘNG THANH NIÊN"
              headerColor="bg-[#1a56a0]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Đoàn Trường', theme: 'ceremony' }}
              featuredTitle={youthActivities[0]?.title || 'Hoạt động Đoàn trường năm học 2026-2027'}
              subItems={[
                { title: youthActivities[1]?.title || 'Chương trình tình nguyện mùa hè' },
                { title: 'Hội trại Truyền thống học sinh tiêu biểu năm học 2026' },
              ]}
              onClickFeatured={() => onSelectNews?.('news-5')}
              onClickMore={() => onNavigate?.('news-list')}
            />

            {/* HOẠT ĐỘNG CÂU LẠC BỘ */}
            <CategoryColumn
              headerLabel="HOẠT ĐỘNG CÂU LẠC BỘ"
              headerColor="bg-[#c8870a]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'CLB Trường', theme: 'club' }}
              featuredTitle={clubItems[0]?.badgeText || 'CLB Robotics & Khoa học công nghệ'}
              subItems={[
                { title: clubItems[1]?.description?.substring(0, 80) || 'CLB Nghệ thuật và Truyền thông' },
                { title: clubItems[2]?.description?.substring(0, 80) || 'CLB Thể thao và Phong trào' },
              ]}
              onClickFeatured={() => onNavigate?.('clubs-list')}
              onClickMore={() => onNavigate?.('clubs-list')}
            />

            {/* THÔNG BÁO */}
            <CategoryColumn
              headerLabel="THÔNG BÁO"
              headerColor="bg-[#6b3fa0]"
              featuredImage={{ label: 'ẢNH', subLabel: 'Thông Báo', theme: 'exam' }}
              featuredTitle={announcements[0]?.title || 'Thông báo nhà trường'}
              subItems={[
                { title: announcements[1]?.title || 'Thông báo 2' },
                { title: announcements[2]?.title || 'Thông báo 3' },
              ]}
              onClickFeatured={() => onNavigate?.('announcement-list')}
              onClickMore={() => onNavigate?.('announcement-list')}
            />

          </div>
        </div>
      </section>

      {/* ──────────────── ROW 2: TUYỂN SINH | CÁC KỲ THI HSG | NGHIÊN CỨU KHOA HỌC | DU HỌC ─── */}
      <section className="w-full bg-[#f5f7fc] border-b border-[#d1ddf5] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

            {/* TUYỂN SINH */}
            <CategoryColumn
              headerLabel="TUYỂN SINH"
              headerColor="bg-[#1d7a45]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Tuyển Sinh', theme: 'exam' }}
              featuredTitle={admissions[0]?.title || 'Tuyển sinh lớp 10 năm học 2026-2027'}
              subItems={[
                { title: admissions[1]?.title || 'Tuyển sinh chuyên Toán' },
                { title: admissions[2]?.title || 'Chương trình song bằng quốc tế' },
              ]}
              onClickFeatured={() => onNavigate?.('admissions-list')}
              onClickMore={() => onNavigate?.('admissions-list')}
            />

            {/* CÁC KỲ THI HSG - OLYMPIC */}
            <CategoryColumn
              headerLabel="CÁC KỲ THI HSG - OLYMPIC"
              headerColor="bg-[#003087]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Kỳ Thi HSG', theme: 'exam' }}
              featuredTitle={competitions[0]?.title || 'Kỳ thi học sinh giỏi cấp thành phố năm 2026'}
              subItems={[
                { title: competitions[1]?.title || 'Ma trận đề thi HSG môn Toán' },
                { title: 'Danh sách học sinh vào vòng chung kết Olympic Tin học' },
              ]}
              onClickFeatured={() => onSelectNews?.(competitions[0]?.id || 'news-1')}
              onClickMore={() => onNavigate?.('news-list')}
            />

            {/* NGHIÊN CỨU KHOA HỌC - STEM */}
            <CategoryColumn
              headerLabel="NGHIÊN CỨU KHOA HỌC - STEM"
              headerColor="bg-[#b45309]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Khoa Học STEM', theme: 'lab' }}
              featuredTitle={science[0]?.title || 'Nghiên cứu khoa học kỹ thuật dành cho học sinh'}
              subItems={[
                { title: science[1]?.title || 'Dự án STEM ứng dụng AI trong thực tiễn' },
                { title: 'Cuộc thi Sáng tạo Khoa học Kỹ thuật cấp quốc gia 2026' },
              ]}
              onClickFeatured={() => onSelectNews?.(science[0]?.id || 'news-4')}
              onClickMore={() => onNavigate?.('news-list')}
            />

            {/* DU HỌC */}
            <CategoryColumn
              headerLabel="DU HỌC"
              headerColor="bg-[#0e6896]"
              featuredImage={{ label: 'ẢNH TIN', subLabel: 'Du Học', theme: 'campus' }}
              featuredTitle={studyAbroad[0]?.title || 'Học bổng du học toàn phần năm 2026'}
              subItems={[
                { title: studyAbroad[1]?.title || 'Học bổng ASEAN Singapore' },
                { title: studyAbroad[2]?.title || 'Chương trình trao đổi với Pháp' },
              ]}
              onClickFeatured={() => onNavigate?.('study-abroad-list')}
              onClickMore={() => onNavigate?.('study-abroad-list')}
            />

          </div>
        </div>
      </section>
    </>
  );
};
