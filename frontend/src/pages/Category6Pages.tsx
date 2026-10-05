import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, User, Eye, Share2, Printer, ChevronRight, Bookmark, Tag } from 'lucide-react';
import { usePosts, useCategories } from '../api';
import { SCHOOL_INFO } from '../data/mockData';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface Category6ListPageProps {
  initialCategory?: string;
  onSelectNews: (id: string) => void;
  onGoHome: () => void;
}

import { fetchPosts } from '../api';

export const Category6ListPage: React.FC<Category6ListPageProps> = ({ initialCategory, onSelectNews, onGoHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data: fetchedCategories } = useCategories();
  
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSelectedCategory(initialCategory || 'all');
    setCurrentPage(1);
  }, [initialCategory]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      let catId = undefined;
      if (selectedCategory !== 'all') {
        const cat = fetchedCategories?.find((c: any) => c.name.toUpperCase() === selectedCategory.toUpperCase());
        catId = cat?.id;
      } else {
        const cat = fetchedCategories?.find((c: any) => c.displayOrder === 6);
        catId = cat?.id;
      }
      
      const res = await fetchPosts(currentPage - 1, itemsPerPage, catId, 'PUBLISHED');
      if (active) {
        setRawPosts(res.content || []);
        setTotalPages(res.totalPages || 1);
        setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [selectedCategory, currentPage, fetchedCategories]);

  const allNews = rawPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    summary: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    category: p.category?.name || 'TIN TỨC',
    date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
    views: p.views || 0,
    imageFallbackTitle: 'TIN TỨC',
    imgUrl: p.imgUrl || p.bannerUrl
  }));

  const categories = [
    { id: 'all', label: 'TẤT CẢ' },
    ...(fetchedCategories || []).map((c: any) => ({
      id: c.name,
      label: c.name.toUpperCase()
    }))
  ];

  const paginatedNews = allNews; // It's already paginated by backend!
  
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
          <button onClick={onGoHome} className="hover:text-[#0052cc] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#0052cc] font-bold">Tin tức - Sự kiện</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#0052cc] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#0052cc] font-bold">
              CỔNG THÔNG TIN BÁO CHÍ & TRUYỀN THÔNG
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
              {selectedCategory === 'all' ? 'Tin tức - Sự kiện' : selectedCategory}
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm bài viết..."
              className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-white border border-[#bfdbfe] focus:border-[#0052cc] focus:outline-none text-black"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-black" />
          </div>
        </div>

        {/* Filter Categories Removed as per user request */}

        {/* News Grid (Sharp architectural boxes) */}
        {loading ? (
           <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : paginatedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNews.map((news) => (
              <div
                key={news.id}
                onClick={() => onSelectNews(news.id)}
                className="group cursor-pointer border border-[#dbeafe] bg-white hover:border-[#0052cc] transition-all p-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#0052cc] bg-[#eef5ff] px-2 py-0.5 border border-[#bfdbfe]/40">
                      {news.category}
                    </span>
                    <span className="text-xs font-mono text-black font-semibold">
                      {news.date}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-[#0052cc] transition-colors uppercase leading-snug line-clamp-3">
                    {news.title}
                  </h3>

                  <div className="mt-3 relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {news.imgUrl ? (
                       <img src={news.imgUrl} alt={news.title} className="w-full h-full object-cover" />
                    ) : (
                      <EduImageFrame
                        label="ẢNH TIN"
                        subLabel={news.imageFallbackTitle}
                        theme="exam"
                        aspectRatio="16:9"
                      />
                    )}
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-black line-clamp-3 leading-relaxed">
                    {news.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#dbeafe] flex items-center justify-between text-xs font-semibold text-[#0052cc]">
                  <span className="text-black font-mono text-[11px] flex items-center gap-1">
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
          <div className="p-12 text-center bg-white border border-[#dbeafe] text-black text-sm">
            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-[#bfdbfe] hover:border-[#0052cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black text-xs font-bold uppercase"
            >
              Trang trước
            </button>
            <span className="text-sm font-bold text-[#0052cc] px-4">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-[#bfdbfe] hover:border-[#0052cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black text-xs font-bold uppercase"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface Category6DetailPageProps {
  newsId: string;
  onBack: () => void;
  onSelectOtherNews: (id: string) => void;
}

export const Category6DetailPage: React.FC<Category6DetailPageProps> = ({
  newsId,
  onBack,
  onSelectOtherNews,
}) => {
  const { data: rawPosts, loading } = usePosts();
  
  if (loading) return <div className="py-20 text-center text-gray-500">Đang tải dữ liệu...</div>;
  
  const allNews = rawPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    summary: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    content: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    category: p.category?.name || 'TIN TỨC',
    date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
    views: p.views || 0,
    author: p.author?.username || 'Ban biên tập',
    imageFallbackTitle: 'TIN TỨC',
    imgUrl: p.imgUrl || p.bannerUrl
  }));
  
  const news = allNews.find((item: any) => item.id === newsId) || allNews[0] || {
    id: '', title: 'Bài viết không tồn tại', category: '', date: '', author: '', views: 0, content: '', summary: ''
  };
  const relatedNews = allNews.filter((item: any) => item.id !== news.id).slice(0, 3);

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Back Button & Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#dbeafe]">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#bfdbfe] hover:border-[#0052cc] text-[#0052cc] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách tin tức</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-black">
            <span>Tin tức</span>
            <span>/</span>
            <span className="text-[#0052cc] font-bold">{news.category}</span>
          </div>
        </div>

        {/* Article Container */}
        <article className="bg-white border-2 border-[#0052cc] p-5 sm:p-8 shadow-md">
          {/* Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dbeafe] text-xs text-black font-mono">
            <div className="flex items-center gap-2">
              <span className="bg-[#0052cc] text-white px-2.5 py-0.5 font-bold uppercase text-[10px]">
                {news.category}
              </span>
              <span>Ngày đăng: {news.date}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#0052cc]" />
                {news.author}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#0052cc]" />
                {news.views.toLocaleString()} lượt đọc
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-black uppercase tracking-tight leading-tight mt-4">
            {news.title}
          </h1>

          {/* Main Visual Image Frame */}
          <div className="my-6 relative h-64 sm:h-96 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {news.imgUrl ? (
              <img src={news.imgUrl} alt={news.title} className="w-full h-full object-cover" />
            ) : (
              <EduImageFrame
                label="ẢNH TIN CHÍNH THỨC"
                subLabel={news.imageFallbackTitle}
                theme="exam"
                aspectRatio="16:9"
              />
            )}
          </div>
          <div className="mt-2 text-center text-xs font-mono text-black italic">
            Hình ảnh minh họa
          </div>

          {/* Pull Quote Excerpt */}
          <div className="p-4 bg-[#FAF8F5] border-l-4 border-[#0052cc] text-sm sm:text-base font-semibold text-black leading-relaxed italic my-6">
            "{news.summary}"
          </div>

          {/* Article Body Content */}
          <div className="text-sm sm:text-base text-black leading-loose space-y-4 whitespace-pre-line font-normal">
            {news.content}
          </div>

          {/* Signature Block */}
          <div className="mt-8 pt-6 border-t border-[#dbeafe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-black">Nguồn trích dẫn:</div>
              <div className="text-xs font-bold text-black uppercase mt-0.5">
                Văn phòng Cụm trường & Ban Giám hiệu {SCHOOL_INFO.name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#eef5ff] hover:bg-[#dbeafe] text-black text-xs font-semibold cursor-pointer border border-[#bfdbfe]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In bài viết</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        <div className="mt-10">
          <div className="border-b-2 border-[#0052cc] pb-2 mb-6 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-black uppercase tracking-wide">
              Tin Tức Liên Quan
            </h2>
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer"
            >
              Xem tất cả tin tức →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedNews.map((item: any) => (
              <div
                key={item.id}
                onClick={() => onSelectOtherNews(item.id)}
                className="group cursor-pointer border border-[#dbeafe] bg-white p-3.5 hover:border-[#0052cc] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0052cc] bg-[#eef5ff] px-2 py-0.5 border border-[#bfdbfe]/40">
                    {item.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-black group-hover:text-[#0052cc] transition-colors uppercase leading-snug line-clamp-2 mt-2">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-black line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#eef5ff] flex items-center justify-between text-[11px] font-mono text-black">
                  <span>{item.date}</span>
                  <span className="text-[#0052cc] font-semibold group-hover:underline">Chi tiết →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
