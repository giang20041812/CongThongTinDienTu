import React, { useState } from 'react';
import { ArrowLeft, GraduationCap, Calendar, FileText, CheckCircle2, Download, Send, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { ALL_ADMISSIONS, SCHOOL_INFO } from '../data/mockData';
import { AdmissionItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface AdmissionsListPageProps {
  onSelectAdmission: (id: string) => void;
  onGoHome: () => void;
}

export const AdmissionsListPage: React.FC<AdmissionsListPageProps> = ({
  onSelectAdmission,
  onGoHome,
}) => {
  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="dots" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#6b82b8] mb-6">
          <button onClick={onGoHome} className="hover:text-[#003087] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#003087] font-bold">Tuyển sinh 2026–2027</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#003087] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              CỔNG THÔNG TIN TUYỂN SINH LỚP 10
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1a2744] tracking-tight uppercase mt-1">
              Tuyển sinh Vào Lớp 10
            </h1>
          </div>

          <div className="text-xs font-mono text-[#4a5f8a] bg-white p-2.5 border border-[#c5d3ec]">
            Tổng chỉ tiêu: <span className="text-base font-bold text-[#003087]">750 học sinh</span> (18 Lớp Chuyên & Song bằng)
          </div>
        </div>

        {/* Timeline Key Dates Bar */}
        <div className="bg-white border-2 border-[#003087] p-4 sm:p-6 mb-8 shadow-xs">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#003087] mb-4">
            MỐC THỜI GIAN TUYỂN SINH QUAN TRỌNG (DỰ KIẾN 2026)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#003087]">
              <div className="font-mono text-[11px] text-[#6b82b8]">10/05 – 25/05/2026</div>
              <div className="font-bold text-[#1a2744] mt-1">Phát hành & Tiếp nhận hồ sơ</div>
              <div className="text-[#6b82b8] text-[11px] mt-0.5">Trực tuyến và trực tiếp tại trường</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#003087]">
              <div className="font-mono text-[11px] text-[#6b82b8]">08/06 – 09/06/2026</div>
              <div className="font-bold text-[#1a2744] mt-1">Thi các môn chung</div>
              <div className="text-[#6b82b8] text-[11px] mt-0.5">Toán, Ngữ văn, Ngoại ngữ</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#003087]">
              <div className="font-mono text-[11px] text-[#6b82b8]">10/06 – 11/06/2026</div>
              <div className="font-bold text-[#1a2744] mt-1">Thi các môn chuyên</div>
              <div className="text-[#6b82b8] text-[11px] mt-0.5">Theo đề thi chuyên biệt của Sở</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#003087]">
              <div className="font-mono text-[11px] text-[#6b82b8]">05/07/2026</div>
              <div className="font-bold text-[#1a2744] mt-1">Công bố điểm chuẩn</div>
              <div className="text-[#6b82b8] text-[11px] mt-0.5">Và tiếp nhận hồ sơ trúng tuyển</div>
            </div>
          </div>
        </div>

        {/* Admission Targets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_ADMISSIONS.map((adm) => (
            <div
              key={adm.id}
              onClick={() => onSelectAdmission(adm.id)}
              className="group cursor-pointer border border-[#d1ddf5] bg-white hover:border-[#003087] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#003087] uppercase bg-[#e8eef8] px-2 py-0.5 border border-[#c5d3ec]/40">
                    {adm.target}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1a2744]">
                    Chỉ tiêu: {adm.quota} học sinh
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug">
                  {adm.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-[#4a5f8a] leading-relaxed">
                  {adm.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#e8eef8] flex items-center justify-between text-xs font-mono text-[#6b82b8]">
                  <span>Hạn nhận hồ sơ: {adm.deadline}</span>
                  <span className="text-[#003087] font-bold group-hover:underline">
                    Xem quy chế thi →
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

interface AdmissionDetailPageProps {
  admissionId: string;
  onBack: () => void;
}

export const AdmissionDetailPage: React.FC<AdmissionDetailPageProps> = ({
  admissionId,
  onBack,
}) => {
  const item = ALL_ADMISSIONS.find((a) => a.id === admissionId) || ALL_ADMISSIONS[0];

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5d3ec] hover:border-[#003087] text-[#003087] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại cổng tuyển sinh</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#003087] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-[#d1ddf5] pb-3 text-xs font-mono text-[#6b82b8]">
            <span className="font-bold text-[#003087] uppercase">{item.target}</span>
            <span>Chỉ tiêu tuyển sinh: {item.quota} học sinh</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-[#1a2744] uppercase tracking-tight leading-tight mt-3">
            {item.title}
          </h1>

          <div className="my-6">
            <EduImageFrame
              label="MA TRẬN ĐỀ THI HSG"
              subLabel={item.target}
              theme="exam"
              aspectRatio="16:9"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#1a2744] leading-relaxed">
            <h2 className="text-base font-bold text-[#003087] uppercase tracking-wide">
              1. Cấu Trúc Ma Trận Đề Thi & Hình Thức Khảo Sát
            </h2>
            <p>
              Đề thi chuyên được xây dựng theo chuẩn đánh giá năng lực của Bộ Giáo dục và Đào tạo, phân bổ tỷ lệ: 40% câu hỏi nhận biết - thông hiểu, 30% câu hỏi vận dụng và 30% câu hỏi vận dụng cao mang tính phân loại xuất sắc.
            </p>

            <h2 className="text-base font-bold text-[#003087] uppercase tracking-wide pt-2">
              2. Hồ Sơ Đăng Ký Dự Tuyển
            </h2>
            <ul className="list-disc list-inside space-y-1 text-[#1a2744] font-normal">
              <li>Phiếu đăng ký dự tuyển vào lớp 10 THPT chuyên (theo mẫu của Sở GD&ĐT Hà Nội);</li>
              <li>Bản sao công chứng Học bạ cấp THCS (xếp loại Giỏi 4 năm học);</li>
              <li>Bản sao Giấy chứng nhận tốt nghiệp THCS tạm thời;</li>
              <li>Bản sao công chứng Giấy khai sinh;</li>
              <li>Giấy chứng nhận học sinh đạt giải trong các kỳ thi chọn học sinh giỏi cấp Thành phố/Quốc gia (nếu có để xét diện cộng điểm hoặc tuyển thẳng).</li>
            </ul>

            <h2 className="text-base font-bold text-[#003087] uppercase tracking-wide pt-2">
              3. Phương Thức Nộp Hồ Sơ & Lệ Phí
            </h2>
            <p>
              Thí sinh có thể nộp hồ sơ trực tuyến qua Cổng dịch vụ công của Sở GD&ĐT Hà Nội hoặc nộp trực tiếp tại Văn phòng tuyển sinh Trường THPT Chuyên Chu Văn An (Số 59 đường Thanh Niên, Tây Hồ, Hà Nội).
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#d1ddf5] flex flex-wrap gap-3">
            <button
              onClick={() => alert('Đang chuyển hướng tới Cổng Nộp Hồ Sơ Tuyển Sinh Trực Tuyến')}
              className="px-5 py-2.5 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Hồ Sơ Trực Tuyến</span>
            </button>
            <button
              onClick={() => alert('Đang tải tệp mẫu đơn đăng ký tuyển sinh')}
              className="px-4 py-2.5 bg-[#e8eef8] hover:bg-[#d1ddf5] border border-[#c5d3ec] text-[#1a2744] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#003087]" />
              <span>Tải Mẫu Đơn Đăng Ký PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
