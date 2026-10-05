import React from 'react';
import { ChevronRight } from 'lucide-react';
import { EduImageFrame } from './EduImageFrame';
import { usePosts, useAnnouncements } from '../api';
import { motion } from 'motion/react';

interface MultiCategorySectionProps {
  onSelectNews?: (id: string) => void;
  onNavigate?: (view: string) => void;
}

interface CategoryColumnProps {
  headerLabel: string;
  featuredImage: { label: string; subLabel: string; theme: 'exam' | 'lab' | 'campus' | 'ceremony' | 'club' | 'lost'; imageUrl?: string };
  featuredTitle: string;
  subItems: { title: string; date?: string; id: string }[];
  onClickFeatured?: () => void;
  onClickMore?: () => void;
  moreLabel?: string;
  onSelectItem?: (id: string) => void;
  accentColorClass?: string;
  accentBgClass?: string;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  headerLabel,
  featuredImage,
  featuredTitle,
  subItems,
  onClickFeatured,
  onClickMore,
  moreLabel = 'Xem thêm',
  onSelectItem,
  accentColorClass = 'text-black',
  accentBgClass = 'bg-black',
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    className="flex flex-col min-w-0 bg-white glass-card hover-lift rounded-xl border border-gray-100 shadow-sm p-5 h-full overflow-hidden relative group/col"
  >
    {/* Decorative top accent line */}
    <div className={`absolute top-0 left-0 right-0 h-1.5 ${accentBgClass} opacity-80 group-hover/col:opacity-100 transition-opacity`}></div>

    {/* Header bar without blue backgrounds - using border bottom instead */}
    <div className={`border-b-2 ${accentColorClass.replace('text-', 'border-')} pb-2 mb-4 flex items-center justify-between`}>
      <span className={`${accentColorClass} font-extrabold uppercase tracking-wider text-[13px] md:text-sm`}>{headerLabel}</span>
    </div>

    {/* Featured: image + title */}
    <div
      onClick={onClickFeatured}
      className="group cursor-pointer mb-5 relative rounded-lg overflow-hidden"
    >
      <div className={`w-full overflow-hidden border border-gray-100 rounded-lg group-hover:shadow-md transition-all duration-300 mb-3`}>
        <EduImageFrame
          label={featuredImage.label}
          subLabel={featuredImage.subLabel}
          theme={featuredImage.theme}
          aspectRatio="16:9"
          imageUrl={featuredImage.imageUrl}
        />
      </div>
      <h3 className={`text-[14px] font-bold text-gray-800 ${accentColorClass.replace('text-', 'group-hover:text-')} transition-colors leading-snug line-clamp-3 uppercase`}>
        {featuredTitle}
      </h3>
    </div>

    {/* Sub items list */}
    <div className="flex flex-col divide-y divide-gray-100/50 flex-1">
      {subItems.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelectItem ? onSelectItem(item.id) : onClickMore?.()}
          className="group text-left py-2.5 flex items-start gap-2.5 transition-colors hover:bg-gray-50/50 -mx-2 px-2 rounded-lg"
        >
          <span className={`mt-0.5 shrink-0 ${accentColorClass} opacity-70 group-hover:opacity-100 transition-opacity`}>
            <ChevronRight className="w-4 h-4" />
          </span>
          <span className={`text-[13px] font-medium text-gray-700 ${accentColorClass.replace('text-', 'group-hover:text-')} transition-colors leading-snug line-clamp-2`}>
            {item.title}
          </span>
        </button>
      ))}
    </div>

    {/* Xem thêm */}
    <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
      <button
        onClick={onClickMore}
        className={`text-[12px] font-bold ${accentColorClass} hover:opacity-80 flex items-center gap-1 cursor-pointer transition-all hover:gap-2`}
      >
        <span>{moreLabel}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </motion.div>
);

export const MultiCategorySection: React.FC<MultiCategorySectionProps> = ({
  onSelectNews,
  onNavigate,
}) => {
  const { data: posts, loading: loadingPosts } = usePosts();
  const { data: announcements, loading: loadingAnnouncements } = useAnnouncements();

  if (loadingPosts || loadingAnnouncements) {
    return <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  // Parse API data
  const schoolNews = posts.filter((p: any) => p.category?.code === 'NEWS').slice(0, 3);
  const youthActivities = posts.filter((p: any) => p.category?.code === 'YOUTH').slice(0, 3);
  const clubItems = posts.filter((p: any) => p.category?.code === 'CLUB').slice(0, 3);
  const adminAnnouncements = announcements.slice(0, 3);
  
  const admissions = posts.filter((p: any) => p.category?.code === 'ADMISSION').slice(0, 3);
  const competitions = posts.filter((p: any) => p.category?.code === 'COMPETITION').slice(0, 3);
  const science = posts.filter((p: any) => p.category?.code === 'SCIENCE').slice(0, 3);
  const studyAbroad = posts.filter((p: any) => p.category?.code === 'STUDY_ABROAD').slice(0, 3);

  // Fallbacks if data empty
  const fallbackItem = { id: '', title: 'Đang cập nhật...', summary: '' };

  return (
    <>
      {/* ──────────────── ROW 1 ─── */}
      <section className="w-full bg-[#f8f9fa] border-b border-gray-200 py-6 sm:py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            <CategoryColumn
              headerLabel="TIN NHÀ TRƯỜNG"
              featuredImage={{ label: 'TIN TỨC', subLabel: 'Nhà Trường', theme: 'campus', imageUrl: schoolNews[0]?.imgUrl || schoolNews[0]?.imageUrl }}
              featuredTitle={schoolNews[0]?.title || fallbackItem.title}
              subItems={schoolNews.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onSelectNews?.(schoolNews[0]?.id)}
              onSelectItem={(id) => onSelectNews?.(id)}
              onClickMore={() => onNavigate?.('news-list')}
              accentColorClass="text-blue-600"
              accentBgClass="bg-gradient-brand"
            />
            <CategoryColumn
              headerLabel="HOẠT ĐỘNG ĐOÀN"
              featuredImage={{ label: 'ĐOÀN HỘI', subLabel: 'Thanh Niên', theme: 'ceremony', imageUrl: youthActivities[0]?.imgUrl || youthActivities[0]?.imageUrl }}
              featuredTitle={youthActivities[0]?.title || fallbackItem.title}
              subItems={youthActivities.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onSelectNews?.(youthActivities[0]?.id)}
              onSelectItem={(id) => onSelectNews?.(id)}
              onClickMore={() => onNavigate?.('news-list')}
              accentColorClass="text-green-600"
              accentBgClass="bg-gradient-success"
            />
            <CategoryColumn
              headerLabel="CÂU LẠC BỘ"
              featuredImage={{ label: 'NGOẠI KHÓA', subLabel: 'CLB Trường', theme: 'club', imageUrl: clubItems[0]?.imgUrl || clubItems[0]?.imageUrl }}
              featuredTitle={clubItems[0]?.title || fallbackItem.title}
              subItems={clubItems.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onNavigate?.('clubs-list')}
              onSelectItem={() => onNavigate?.('clubs-list')}
              onClickMore={() => onNavigate?.('clubs-list')}
              accentColorClass="text-purple-600"
              accentBgClass="bg-gradient-purple"
            />
            <CategoryColumn
              headerLabel="THÔNG BÁO"
              featuredImage={{ label: 'THÔNG BÁO', subLabel: 'Nhà Trường', theme: 'exam', imageUrl: adminAnnouncements[0]?.imgUrl || adminAnnouncements[0]?.imageUrl }}
              featuredTitle={adminAnnouncements[0]?.title || fallbackItem.title}
              subItems={adminAnnouncements.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onNavigate?.('announcement-list')}
              onSelectItem={() => onNavigate?.('announcement-list')}
              onClickMore={() => onNavigate?.('announcement-list')}
              accentColorClass="text-red-600"
              accentBgClass="bg-gradient-to-r from-red-500 to-rose-600"
            />
          </motion.div>
        </div>
      </section>

      {/* ──────────────── ROW 2 ─── */}
      <section className="w-full bg-[#f8f9fa] border-b border-gray-200 py-6 sm:py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            <CategoryColumn
              headerLabel="TUYỂN SINH"
              featuredImage={{ label: 'TUYỂN SINH', subLabel: 'Tuyển Sinh', theme: 'exam', imageUrl: admissions[0]?.imgUrl || admissions[0]?.imageUrl }}
              featuredTitle={admissions[0]?.title || fallbackItem.title}
              subItems={admissions.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onNavigate?.('admissions-list')}
              onSelectItem={() => onNavigate?.('admissions-list')}
              onClickMore={() => onNavigate?.('admissions-list')}
              accentColorClass="text-orange-500"
              accentBgClass="bg-gradient-accent"
            />
            <CategoryColumn
              headerLabel="KỲ THI HSG"
              featuredImage={{ label: 'KỲ THI', subLabel: 'Học sinh giỏi', theme: 'exam', imageUrl: competitions[0]?.imgUrl || competitions[0]?.imageUrl }}
              featuredTitle={competitions[0]?.title || fallbackItem.title}
              subItems={competitions.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onSelectNews?.(competitions[0]?.id)}
              onSelectItem={(id) => onSelectNews?.(id)}
              onClickMore={() => onNavigate?.('news-list')}
              accentColorClass="text-teal-600"
              accentBgClass="bg-gradient-to-r from-teal-500 to-emerald-500"
            />
            <CategoryColumn
              headerLabel="NGHIÊN CỨU STEM"
              featuredImage={{ label: 'KHOA HỌC', subLabel: 'STEM', theme: 'lab', imageUrl: science[0]?.imgUrl || science[0]?.imageUrl }}
              featuredTitle={science[0]?.title || fallbackItem.title}
              subItems={science.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onSelectNews?.(science[0]?.id)}
              onSelectItem={(id) => onSelectNews?.(id)}
              onClickMore={() => onNavigate?.('news-list')}
              accentColorClass="text-pink-500"
              accentBgClass="bg-gradient-pink"
            />
            <CategoryColumn
              headerLabel="DU HỌC"
              featuredImage={{ label: 'DU HỌC', subLabel: 'Quốc Tế', theme: 'campus', imageUrl: studyAbroad[0]?.imgUrl || studyAbroad[0]?.imageUrl }}
              featuredTitle={studyAbroad[0]?.title || fallbackItem.title}
              subItems={studyAbroad.slice(1).map((n: any) => ({ title: n.title, id: n.id }))}
              onClickFeatured={() => onNavigate?.('study-abroad-list')}
              onSelectItem={() => onNavigate?.('study-abroad-list')}
              onClickMore={() => onNavigate?.('study-abroad-list')}
              accentColorClass="text-indigo-600"
              accentBgClass="bg-gradient-to-r from-indigo-500 to-blue-500"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
};

