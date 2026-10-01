import React, { useState } from 'react';
import { ArrowLeft, Globe, Award, Calendar, ExternalLink, CheckCircle2, Send, Clock, BookOpen } from 'lucide-react';
import { ALL_STUDY_ABROAD, SCHOOL_INFO } from '../data/mockData';
import { StudyAbroadItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface StudyAbroadListPageProps {
  onSelectProgram: (id: string) => void;
  onGoHome: () => void;
}

export const StudyAbroadListPage: React.FC<StudyAbroadListPageProps> = ({
  onSelectProgram,
  onGoHome,
}) => {
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
          <span className="text-[#991B1B] font-bold">Du Học & Học Bổng Quốc Tế</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#991B1B] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              CHƯƠNG TRÌNH HỢP TÁC & HỌC BỔNG TOÀN CẦU
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
              Du Học & Học Bổng
            </h1>
          </div>

          <div className="text-xs font-mono text-stone-600 bg-white p-2.5 border border-stone-300">
            Học bổng cao nhất: <span className="text-base font-bold text-[#991B1B]">100% Học phí</span> (Hoa Kỳ & Singapore)
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_STUDY_ABROAD.map((prog) => (
            <div
              key={prog.id}
              onClick={() => onSelectProgram(prog.id)}
              className="group cursor-pointer border border-[#E2DDD3] bg-white hover:border-[#991B1B] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#991B1B] uppercase bg-[#FEF2F2] px-2 py-0.5 border border-[#FCA5A5]/40">
                    {prog.country}
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    {prog.scholarshipRate}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug">
                  {prog.title}
                </h3>

                <div className="mt-3 relative">
                  <EduImageFrame
                    label="ẢNH TIN DU HỌC"
                    subLabel={prog.country}
                    theme="campus"
                    aspectRatio="16:9"
                  />
                </div>

                <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {prog.description}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>Hạn nộp hồ sơ: {prog.deadline}</span>
                  <span className="text-[#991B1B] font-bold group-hover:underline">
                    Xem điều kiện học bổng →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StudyAbroadDetailPageProps {
  programId: string;
  onBack: () => void;
}

export const StudyAbroadDetailPage: React.FC<StudyAbroadDetailPageProps> = ({
  programId,
  onBack,
}) => {
  const prog = ALL_STUDY_ABROAD.find((p) => p.id === programId) || ALL_STUDY_ABROAD[0];
  const [formSubmitted, setFormSubmitted] = useState(false);

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
            <span>Quay lại danh sách chương trình du học</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#991B1B] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs font-mono text-stone-500">
            <span className="font-bold text-[#991B1B] uppercase">{prog.country}</span>
            <span className="text-emerald-700 font-bold">{prog.scholarshipRate}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-[#1C1917] uppercase tracking-tight leading-tight mt-3">
            {prog.title}
          </h1>

          <div className="my-6">
            <EduImageFrame
              label="HỌC BỔNG QUỐC TẾ"
              subLabel={prog.country}
              theme="campus"
              aspectRatio="16:9"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide">
              1. Điều Kiện Ứng Tuyển Học Bổng
            </h2>
            <ul className="list-disc list-inside space-y-1 text-stone-700">
              <li>Học sinh đang theo học khối 10, 11 hoặc 12 các trường THPT tại Hà Nội;</li>
              <li>Điểm trung bình học tập GPA từ 8.5 trở lên (các môn Toán, Khoa học từ 9.0);</li>
              <li>Chứng chỉ tiếng Anh: IELTS từ 7.0 hoặc TOEFL iBT từ 90 trở lên;</li>
              <li>Có thành tích xuất sắc trong các kỳ thi học sinh giỏi, nghiên cứu khoa học kỹ thuật hoặc hoạt động lãnh đạo ngoại khóa.</li>
            </ul>

            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide pt-2">
              2. Quyền Lợi & Hỗ Trợ Từ Phía Nhà Trường
            </h2>
            <p>
              Tổ Hợp tác Quốc tế trường THPT Chuyên Chu Văn An trực tiếp thẩm định thư giới thiệu (Letter of Recommendation), hướng dẫn viết luận cá nhân và tổ chức các buổi phỏng vấn giả định (Mock Interview) với các chuyên gia giáo dục Hoa Kỳ và Châu Âu.
            </p>

            <h2 className="text-base font-bold text-[#991B1B] uppercase tracking-wide pt-2">
              3. Đăng Ký Tư Vấn Trực Tiếp 1-1
            </h2>

            {formSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Đã ghi nhận yêu cầu tư vấn! Ban Hợp tác quốc tế sẽ liên hệ với bạn trong 24 giờ làm việc.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormSubmitted(true);
                }}
                className="bg-[#FAF9F6] border border-stone-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Họ tên học sinh</label>
                    <input
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full h-9 px-3 bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Số điện thoại phụ huynh / học sinh</label>
                    <input
                      required
                      placeholder="0912 345 67x"
                      className="w-full h-9 px-3 bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Đặt Lịch Tư Vấn Hồ Sơ Du Học</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
