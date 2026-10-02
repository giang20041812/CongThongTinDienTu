import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar, User, Eye, Share2, Printer, ChevronRight, Bookmark, Tag } from 'lucide-react';
import { NewsItem } from '../types';
import { ALL_NEWS, SCHOOL_INFO } from '../data/mockData';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface NewsListPageProps {
  onSelectNews: (id: string) => void;
  onGoHome: () => void;
}

export const NewsListPage: React.FC<NewsListPageProps> = ({ onSelectNews, onGoHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'CHUYÊN MÔN', label: 'CHUYÊN MÔN' },
    { id: 'HỌC THUẬT', label: 'HỌC THUẬT' },
    { id: 'THỰC NGHIỆM', label: 'THỰC NGHIỆM' },
    { id: 'HỢP TÁC', label: 'HỢP TÁC' },
    { id: 'PHONG TRÀO', label: 'PHONG TRÀO' },
  ];

  const filteredNews = ALL_NEWS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#6b82b8] mb-6">
          <button onClick={onGoHome} className="hover:text-[#003087] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#003087] font-bold">Tin tức - Sự kiện</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#003087] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold">
              CỔNG THÔNG TIN BÁO CHÍ & TRUYỀN THÔNG
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1a2744] tracking-tight uppercase mt-1">
              Tin tức - Sự kiện
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-white border border-[#c5d3ec] focus:border-[#003087] focus:outline-none"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-[#9aabd4]" />
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#003087] text-white border-[#003087]'
                  : 'bg-white text-[#1a2744] border-[#c5d3ec] hover:border-[#9aabd4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Grid (Sharp architectural boxes) */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <div
                key={news.id}
                onClick={() => onSelectNews(news.id)}
                className="group cursor-pointer border border-[#d1ddf5] bg-white hover:border-[#003087] transition-all p-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#003087] bg-[#e8eef8] px-2 py-0.5 border border-[#c5d3ec]/40">
                      {news.category}
                    </span>
                    <span className="text-xs font-mono text-[#6b82b8] font-semibold">
                      {news.date}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug line-clamp-3">
                    {news.title}
                  </h3>

                  <div className="mt-3 relative">
                    <EduImageFrame
                      label="ẢNH TIN"
                      subLabel={news.imageFallbackTitle}
                      theme="exam"
                      aspectRatio="16:9"
                    />
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-[#4a5f8a] line-clamp-3 leading-relaxed">
                    {news.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#d1ddf5] flex items-center justify-between text-xs font-semibold text-[#003087]">
                  <span className="text-[#6b82b8] font-mono text-[11px] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {news.views.toLocaleString()} lượt đọc
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Đọc tiếp <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-[#d1ddf5] text-[#6b82b8] text-sm">
            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
};

interface NewsDetailPageProps {
  newsId: string;
  onBack: () => void;
  onSelectOtherNews: (id: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  newsId,
  onBack,
  onSelectOtherNews,
}) => {
  const news = ALL_NEWS.find((item) => item.id === newsId) || ALL_NEWS[0];
  const relatedNews = ALL_NEWS.filter((item) => item.id !== news.id).slice(0, 3);

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Back Button & Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#d1ddf5]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5d3ec] hover:border-[#003087] text-[#003087] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách tin tức</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#6b82b8]">
            <span>Tin tức</span>
            <span>/</span>
            <span className="text-[#003087] font-bold">{news.category}</span>
          </div>
        </div>

        {/* Article Container */}
        <article className="bg-white border-2 border-[#003087] p-5 sm:p-8 shadow-md">
          {/* Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#d1ddf5] text-xs text-[#6b82b8] font-mono">
            <div className="flex items-center gap-2">
              <span className="bg-[#003087] text-white px-2.5 py-0.5 font-bold uppercase text-[10px]">
                {news.category}
              </span>
              <span>Ngày đăng: {news.date}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#003087]" />
                {news.author}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#003087]" />
                {news.views.toLocaleString()} lượt đọc
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#1a2744] uppercase tracking-tight leading-tight mt-4">
            {news.title}
          </h1>

          {/* Main Visual Image Frame */}
          <div className="my-6">
            <EduImageFrame
              label="ẢNH TIN CHÍNH THỨC"
              subLabel={news.imageFallbackTitle}
              theme="exam"
              aspectRatio="16:9"
            />
            <div className="mt-2 text-center text-xs font-mono text-[#6b82b8] italic">
              Hình ảnh ghi nhận tại kỳ khảo sát học sinh giỏi cụm Gia Lâm - Long Biên năm học 2026–2027
            </div>
          </div>

          {/* Pull Quote Excerpt */}
          <div className="p-4 bg-[#FAF8F5] border-l-4 border-[#003087] text-sm sm:text-base font-semibold text-[#1a2744] leading-relaxed italic my-6">
            "{news.summary}"
          </div>

          {/* Article Body Content */}
          <div className="text-sm sm:text-base text-[#1a2744] leading-loose space-y-4 whitespace-pre-line font-normal">
            {news.content}

            <p>
              Nhà trường đề nghị các thầy cô giáo trưởng các tổ bộ môn và toàn thể học sinh thuộc các khối chuyên theo dõi sát sao lịch thi và quy chế phòng thi được niêm yết trên bảng thông báo điện tử.
            </p>
          </div>

          {/* Signature Block */}
          <div className="mt-8 pt-6 border-t border-[#d1ddf5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#6b82b8]">Nguồn trích dẫn:</div>
              <div className="text-xs font-bold text-[#1a2744] uppercase mt-0.5">
                Văn phòng Cụm trường & Ban Giám hiệu {SCHOOL_INFO.name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#e8eef8] hover:bg-[#d1ddf5] text-[#1a2744] text-xs font-semibold cursor-pointer border border-[#c5d3ec]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In bài viết</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        <div className="mt-10">
          <div className="border-b-2 border-[#003087] pb-2 mb-6 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#1a2744] uppercase tracking-wide">
              Tin Tức Liên Quan
            </h2>
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#003087] hover:underline cursor-pointer"
            >
              Xem tất cả tin tức →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedNews.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectOtherNews(item.id)}
                className="group cursor-pointer border border-[#d1ddf5] bg-white p-3.5 hover:border-[#003087] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#003087] bg-[#e8eef8] px-2 py-0.5 border border-[#c5d3ec]/40">
                    {item.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug line-clamp-2 mt-2">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#4a5f8a] line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#e8eef8] flex items-center justify-between text-[11px] font-mono text-[#6b82b8]">
                  <span>{item.date}</span>
                  <span className="text-[#003087] font-semibold group-hover:underline">Chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
