import React, { useState } from 'react';
import { ArrowLeft, Users, Award, Calendar, Send, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { ALL_CLUBS, SCHOOL_INFO } from '../data/mockData';
import { ClubItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

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

  const filteredClubs = ALL_CLUBS.filter(
    (club) => selectedCat === 'all' || club.category === selectedCat
  );

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-6">
          <button onClick={onGoHome} className="hover:text-[#991B1B] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#991B1B] font-bold">Câu Lạc Bộ Học Đường</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#991B1B] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              PHONG TRÀO ĐOÀN THANH NIÊN & HOẠT ĐỘNG NGOẠI KHÓA
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
              Câu Lạc Bộ Học Sinh
            </h1>
          </div>

          <div className="text-xs font-mono text-stone-600 bg-white p-2.5 border border-stone-300">
            Tổng số: <span className="text-base font-bold text-[#991B1B]">28 Câu lạc bộ</span> (Hơn 1.500 Đoàn viên sinh hoạt)
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                selectedCat === cat.id
                  ? 'bg-[#991B1B] text-white border-[#991B1B]'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Clubs Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              onClick={() => onSelectClub(club.id)}
              className="group cursor-pointer border border-[#E2DDD3] bg-white hover:border-[#991B1B] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#991B1B] uppercase bg-[#FEF2F2] px-2 py-0.5 border border-[#FCA5A5]/40">
                    {club.category}
                  </span>
                  <span className="text-xs font-mono text-stone-500 font-semibold">
                    {club.members} Thành viên
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug">
                  {club.name}
                </h3>

                <div className="mt-3 relative">
                  <EduImageFrame
                    label="ẢNH HOẠT ĐỘNG"
                    subLabel={club.badgeText}
                    theme="club"
                    aspectRatio="16:9"
                  />
                </div>

                <p className="mt-3 text-xs sm:text-sm text-stone-600 line-clamp-2">
                  {club.description}
                </p>

                <div className="mt-3 p-2 bg-[#FAF8F5] border-l-2 border-[#991B1B] text-[11px] text-stone-700 line-clamp-1">
                  Thành tích: {club.recentActivity}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
                <span>Thành lập: {club.established}</span>
                <span className="text-[#991B1B] font-bold group-hover:underline">
                  Xem & Đăng ký →
                </span>
              </div>
            </div>
          ))}
        </div>
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
  const club = ALL_CLUBS.find((c) => c.id === clubId) || ALL_CLUBS[0];
  const [joined, setJoined] = useState(false);

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-[#991B1B] text-[#991B1B] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách CLB</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#991B1B] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-mono text-stone-500">
            <span className="font-bold text-[#991B1B] uppercase">{club.category}</span>
            <span>Quy mô: {club.members} Thành viên chính thức</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-[#1C1917] uppercase tracking-tight leading-tight mt-3">
            {club.name}
          </h1>

          <div className="my-6">
            <EduImageFrame
              label="ẢNH HOẠT ĐỘNG CLB"
              subLabel={club.badgeText}
              theme="club"
              aspectRatio="16:9"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide">
              1. Giới Thiệu Chung & Mục Tiêu Hoạt Động
            </h2>
            <p>{club.description}</p>

            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide pt-2">
              2. Lịch Sinh Hoạt & Địa Điểm
            </h2>
            <div className="bg-[#FAF9F6] border border-stone-200 p-3 space-y-1 font-mono text-xs">
              <div>Thời gian: Chiều Thứ Bảy hàng tuần (14:30 - 17:00)</div>
              <div>Địa điểm: Phòng Hội thảo STEM hoặc Sân bóng rổ khu B</div>
              <div>Ban Cố vấn: Thầy cô Tổ Tin học & Ban Thường vụ Đoàn trường</div>
            </div>

            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide pt-2">
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
                className="bg-[#FAF9F6] border border-stone-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Họ và tên học sinh *</label>
                    <input
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full h-9 px-3 bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Lớp học hiện tại *</label>
                    <input
                      required
                      placeholder="10 Tin / 11 Toán 1"
                      className="w-full h-9 px-3 bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kinh nghiệm hoặc sở trường liên quan</label>
                  <textarea
                    rows={2}
                    placeholder="Lập trình C++, thiết kế đồ họa, viết lách, chơi nhạc cụ..."
                    className="w-full p-2 bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
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
