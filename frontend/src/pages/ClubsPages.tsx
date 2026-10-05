import React, { useState } from 'react';
import { ArrowLeft, Users, Award, Calendar, Send, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { ClubItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';
import { usePosts } from '../api';

interface ClubsListPageProps {
  onSelectClub: (id: string) => void;
  onGoHome: () => void;
}

export const ClubsListPage: React.FC<ClubsListPageProps> = ({
  onSelectClub,
  onGoHome,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'TẤT CẢ CLB (28)' },
    { id: 'STEM & CÔNG NGHỆ CAO', label: 'STEM & CÔNG NGHỆ' },
    { id: 'NGHỆ THUẬT & TRUYỀN THÔNG', label: 'TRUYỀN THÔNG & NGHỆ THUẬT' },
    { id: 'THỂ THAO & PHONG TRÀO', label: 'THỂ THAO' },
    { id: 'HỌC THUẬT & TRANH BIỆN', label: 'TRANH BIỆN & HỌC THUẬT' },
    { id: 'TÌNH NGUYỆN XÃ HỘI', label: 'TÌNH NGUYỆN' },
  ];

  const { data: posts, loading } = usePosts();
  const clubsList = posts.filter((p: any) => p.category?.code === 'CLUB').map((p: any) => ({
    id: p.id,
    name: p.title,
    category: p.blocks?.[0]?.content || 'Câu lạc bộ',
    members: 120,
    established: '2016',
    recentActivity: 'Đang hoạt động sôi nổi',
    description: p.blocks?.[1]?.content || p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    badgeText: 'CLB HỌC ĐƯỜNG',
    imageUrl: p.imgUrl || p.imageUrl
  }));

  const filteredClubs = clubsList.filter(
    (club: any) => selectedCat === 'all' || club.category === selectedCat
  );

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);
  const paginatedClubs = filteredClubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCatChange = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
          <button onClick={onGoHome} className="hover:text-[#0052cc] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#0052cc] font-bold">Câu Lạc Bộ Học Đường</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#0052cc] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#0052cc] font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              PHONG TRÀO ĐOÀN THANH NIÊN & HOẠT ĐỘNG NGOẠI KHÓA
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
              Câu Lạc Bộ Học Sinh
            </h1>
          </div>

          <div className="text-xs font-mono text-black bg-white p-2.5 border border-[#bfdbfe]">
            Tổng số: <span className="text-base font-bold text-[#0052cc]">28 Câu lạc bộ</span> (Hơn 1.500 Đoàn viên sinh hoạt)
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCatChange(cat.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                selectedCat === cat.id
                  ? 'bg-[#0052cc] text-white border-[#0052cc]'
                  : 'bg-white text-black border-[#bfdbfe] hover:border-[#93c5fd]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Clubs Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedClubs.map((club) => (
            <div
              key={club.id}
              onClick={() => onSelectClub(club.id)}
              className="group cursor-pointer border border-[#dbeafe] bg-white hover:border-[#0052cc] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#0052cc] uppercase bg-[#eef5ff] px-2 py-0.5 border border-[#bfdbfe]/40">
                    {club.category}
                  </span>
                  <span className="text-xs font-mono text-black font-semibold">
                    {club.members} Thành viên
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-[#0052cc] transition-colors uppercase leading-snug">
                  {club.name}
                </h3>

                <div className="mt-3 relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {club.imageUrl ? (
                    <img src={club.imageUrl} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <EduImageFrame
                      label="ẢNH HOẠT ĐỘNG"
                      subLabel={club.badgeText}
                      theme="club"
                      aspectRatio="16:9"
                    />
                  )}
                </div>

                <p className="mt-3 text-xs sm:text-sm text-black line-clamp-2">
                  {club.description}
                </p>

                <div className="mt-3 p-2 bg-[#FAF8F5] border-l-2 border-[#0052cc] text-[11px] text-black line-clamp-1">
                  Thành tích: {club.recentActivity}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#eef5ff] flex items-center justify-between text-xs font-mono text-black">
                <span>Thành lập: {club.established}</span>
                <span className="text-[#0052cc] font-bold group-hover:underline">
                  Xem & Đăng ký →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
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

interface ClubDetailPageProps {
  clubId: string;
  onBack: () => void;
}

export const ClubDetailPage: React.FC<ClubDetailPageProps> = ({
  clubId,
  onBack,
}) => {
  const { data: posts, loading } = usePosts();
  const [joined, setJoined] = useState(false);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const rawPost = posts.find((p: any) => p.id === clubId);
  const club = rawPost ? {
    id: rawPost.id,
    name: rawPost.title,
    category: rawPost.blocks?.[0]?.content || 'Câu lạc bộ',
    members: 120,
    established: '2016',
    recentActivity: 'Đang hoạt động sôi nổi',
    description: rawPost.blocks?.[1]?.content || rawPost.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    badgeText: 'CLB HỌC ĐƯỜNG',
    imageUrl: rawPost.imgUrl || rawPost.imageUrl
  } : null;

  if (!club) return <div className="text-center py-20">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#bfdbfe] hover:border-[#0052cc] text-[#0052cc] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách CLB</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#0052cc] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-[#dbeafe] pb-3 text-xs font-mono text-black">
            <span className="font-bold text-[#0052cc] uppercase">{club.category}</span>
            <span>Quy mô: {club.members} Thành viên chính thức</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-black uppercase tracking-tight leading-tight mt-3">
            {club.name}
          </h1>

          <div className="my-6 relative h-64 sm:h-96 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {club.imageUrl ? (
              <img src={club.imageUrl} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <EduImageFrame
                label="ẢNH HOẠT ĐỘNG CLB"
                subLabel={club.badgeText}
                theme="club"
                aspectRatio="16:9"
              />
            )}
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-black leading-relaxed">
            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide">
              1. Giới Thiệu Chung & Mục Tiêu Hoạt Động
            </h2>
            <p>{club.description}</p>

            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide pt-2">
              2. Lịch Sinh Hoạt & Địa Điểm
            </h2>
            <div className="bg-[#f5f7fc] border border-[#dbeafe] p-3 space-y-1 font-mono text-xs">
              <div>Thời gian: Chiều Thứ Bảy hàng tuần (14:30 - 17:00)</div>
              <div>Địa điểm: Phòng Hội thảo STEM hoặc Sân bóng rổ khu B</div>
              <div>Ban Cố vấn: Thầy cô Tổ Tin học & Ban Thường vụ Đoàn trường</div>
            </div>

            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide pt-2">
              3. Đăng Ký Thành Viên Đợt Tuyển Mùa Thu 2026
            </h2>

            {joined ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Đã nộp đơn ứng tuyển thành công! Ban Chủ nhiệm CLB sẽ gửi email hẹn phỏng vấn vòng 1.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setJoined(true);
                }}
                className="bg-[#f5f7fc] border border-[#dbeafe] p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Họ và tên học sinh *</label>
                    <input
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full h-9 px-3 bg-white border border-[#bfdbfe] focus:border-[#0052cc] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Lớp học hiện tại *</label>
                    <input
                      required
                      placeholder="10 Tin / 11 Toán 1"
                      className="w-full h-9 px-3 bg-white border border-[#bfdbfe] focus:border-[#0052cc] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kinh nghiệm hoặc sở trường liên quan</label>
                  <textarea
                    rows={2}
                    placeholder="Lập trình C++, thiết kế đồ họa, viết lách, chơi nhạc cụ..."
                    className="w-full p-2 bg-white border border-[#bfdbfe] focus:border-[#0052cc] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#0026e6] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Đơn Đăng Ký Gia Nhập CLB</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
