import React from 'react';
import { ChevronRight } from 'lucide-react';
import { EduImageFrame } from './EduImageFrame';
import { usePosts, useAnnouncements } from '../api';
import { motion } from 'motion/react';

interface MultiCategorySectionProps {
  bottomSections: any[];
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
  bottomSections,
  onSelectNews,
  onNavigate,
}) => {
  if (!bottomSections || bottomSections.length === 0) {
    return <div className="py-20 text-center text-gray-500">Đang tải dữ liệu hoặc chưa có chuyên mục nào được cấu hình...</div>;
  }

  const fallbackItem = { id: '', title: 'Đang cập nhật...', summary: '' };

  const colorThemes = [
    { accentColorClass: "text-blue-600", accentBgClass: "bg-gradient-brand", theme: 'campus' },
    { accentColorClass: "text-green-600", accentBgClass: "bg-gradient-success", theme: 'ceremony' },
    { accentColorClass: "text-purple-600", accentBgClass: "bg-gradient-purple", theme: 'club' },
    { accentColorClass: "text-red-600", accentBgClass: "bg-gradient-to-r from-red-500 to-rose-600", theme: 'exam' },
    { accentColorClass: "text-orange-500", accentBgClass: "bg-gradient-accent", theme: 'exam' },
    { accentColorClass: "text-teal-600", accentBgClass: "bg-gradient-to-r from-teal-500 to-emerald-500", theme: 'exam' },
    { accentColorClass: "text-pink-500", accentBgClass: "bg-gradient-pink", theme: 'lab' },
    { accentColorClass: "text-indigo-600", accentBgClass: "bg-gradient-to-r from-indigo-500 to-blue-500", theme: 'campus' }
  ];

  return (
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
          {bottomSections.map((section, idx) => {
            const cat = section.category;
            const posts = section.posts || [];
            const featuredPost = posts[0];
            const subItems = posts.slice(1).map((n: any) => ({ title: n.title, id: n.id }));
            const colorTheme = colorThemes[idx % colorThemes.length];

            return (
              <CategoryColumn
                key={cat.id || idx}
                headerLabel={cat.name}
                featuredImage={{ 
                  label: cat.name, 
                  subLabel: 'Mới nhất', 
                  theme: colorTheme.theme as any, 
                  imageUrl: featuredPost?.imgUrl || featuredPost?.imageUrl 
                }}
                featuredTitle={featuredPost?.title || fallbackItem.title}
                subItems={subItems}
                onClickFeatured={() => onSelectNews?.(featuredPost?.id)}
                onSelectItem={(id) => onSelectNews?.(id)}
                onClickMore={() => onNavigate?.('news-list')}
                accentColorClass={colorTheme.accentColorClass}
                accentBgClass={colorTheme.accentBgClass}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

