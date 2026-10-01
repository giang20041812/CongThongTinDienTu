import React from 'react';
import { ArrowUpRight, GraduationCap, Globe, Download, FileCheck, CheckCircle2 } from 'lucide-react';
import { ADMISSION_DATA, STUDY_ABROAD_DATA } from '../data/mockData';
import { EduImageFrame } from './EduImageFrame';
import { BackgroundGeometricMesh } from './BackgroundGeometricMesh';

interface AdmissionsAndStudyAbroadSectionProps {
  onOpenAdmissionModal: () => void;
  onOpenStudyAbroadModal: () => void;
}

export const AdmissionsAndStudyAbroadSection: React.FC<AdmissionsAndStudyAbroadSectionProps> = ({
  onOpenAdmissionModal,
  onOpenStudyAbroadModal,
}) => {
  return (
    <section id="tuyen-sinh" className="relative w-full py-12 sm:py-16 bg-[#FFFFFF] border-b border-[#E7E2D9]">
      {/* Background Subtle Coordinate Lines */}
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Split Two Columns Layout from Wireframe with Center Vertical Divider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          {/* ========================================================
              LEFT COLUMN: TUYỂN SINH (Admissions)
             ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: Tuyển sinh with clean double underline */}
              <div className="border-b-2 border-[#991B1B] pb-2.5 mb-6">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  KỲ THI VÀO LỚP 10
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                  Tuyển sinh
                </h2>
              </div>

              {/* Featured Item: [ẢNH TIN] + Title */}
              <div
                onClick={onOpenAdmissionModal}
                className="group cursor-pointer border border-[#E7E2D9] bg-[#FAF9F6] hover:border-[#991B1B] transition-all p-3.5 flex flex-col sm:flex-row gap-4 shadow-xs"
              >
                {/* Image slot */}
                <div className="sm:w-44 shrink-0">
                  <EduImageFrame
                    label="ẢNH TIN"
                    subLabel="Tuyển sinh 2026"
                    theme="exam"
                    aspectRatio="4:3"
                  />
                </div>

                {/* Title & Description */}
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#991B1B] uppercase tracking-wider bg-[#FEF2F2] px-1.5 py-0.5 border border-[#FCA5A5]/40">
                      CHỈ TIÊU & QUY CHẾ
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug mt-1.5 line-clamp-3">
                      {ADMISSION_DATA.featured.title}
                    </h3>
                    <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                      {ADMISSION_DATA.featured.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Chỉ tiêu: {ADMISSION_DATA.featured.quota} học sinh</span>
                    <span className="font-bold text-[#991B1B]">Xem chi tiết →</span>
                  </div>
                </div>
              </div>

              {/* 4 Bullet Items with Sharp Polygon Chevron Arrows `>` (Exact Match from Wireframe) */}
              <div className="mt-6 space-y-3">
                {ADMISSION_DATA.bullets.map((bulletText, idx) => (
                  <div
                    key={idx}
                    onClick={onOpenAdmissionModal}
                    className="group cursor-pointer p-2.5 border border-[#F0ECE3] hover:border-[#991B1B] hover:bg-[#FAF9F6] transition-all flex items-start gap-3"
                  >
                    {/* Sharp Angular Polygon Arrow from Wireframe */}
                    <div className="mt-0.5 shrink-0 text-[#991B1B] group-hover:translate-x-1 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 2 L12 8 L4 14" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>

                    {/* Bullet text */}
                    <p className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#991B1B] transition-colors leading-snug line-clamp-2">
                      {bulletText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap gap-2">
              <button
                onClick={onOpenAdmissionModal}
                className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Nộp Hồ Sơ Trực Tuyến</span>
              </button>
              <button
                onClick={onOpenAdmissionModal}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>Tải Mẫu Đơn Đăng Ký</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              VERTICAL DIVIDER LINE (Drawn between Tuyển sinh & Du học)
             ======================================================== */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#E7E2D9] -translate-x-1/2" />

          {/* ========================================================
              RIGHT COLUMN: DU HỌC (Study Abroad & International Programs)
             ======================================================== */}
          <div id="du-hoc" className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: Du học with clean double underline */}
              <div className="border-b-2 border-[#991B1B] pb-2.5 mb-6">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  HỘI NHẬP QUỐC TẾ
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight uppercase">
                  Du học
                </h2>
              </div>

              {/* Featured Item: [ẢNH TIN] + Title */}
              <div
                onClick={onOpenStudyAbroadModal}
                className="group cursor-pointer border border-[#E7E2D9] bg-[#FAF9F6] hover:border-[#991B1B] transition-all p-3.5 flex flex-col sm:flex-row gap-4 shadow-xs"
              >
                {/* Image slot */}
                <div className="sm:w-44 shrink-0">
                  <EduImageFrame
                    label="ẢNH TIN"
                    subLabel="Học bổng Quốc tế"
                    theme="campus"
                    aspectRatio="4:3"
                  />
                </div>

                {/* Title & Description */}
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#991B1B] uppercase tracking-wider bg-[#FEF2F2] px-1.5 py-0.5 border border-[#FCA5A5]/40">
                      HỌC BỔNG TOÀN PHẦN
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors uppercase leading-snug mt-1.5 line-clamp-3">
                      {STUDY_ABROAD_DATA.featured.title}
                    </h3>
                    <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                      {STUDY_ABROAD_DATA.featured.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Hạn nộp: {STUDY_ABROAD_DATA.featured.deadline}</span>
                    <span className="font-bold text-[#991B1B]">Xem chi tiết →</span>
                  </div>
                </div>
              </div>

              {/* 4 Bullet Items with Sharp Polygon Chevron Arrows `>` (Exact Match from Wireframe) */}
              <div className="mt-6 space-y-3">
                {STUDY_ABROAD_DATA.bullets.map((bulletText, idx) => (
                  <div
                    key={idx}
                    onClick={onOpenStudyAbroadModal}
                    className="group cursor-pointer p-2.5 border border-[#F0ECE3] hover:border-[#991B1B] hover:bg-[#FAF9F6] transition-all flex items-start gap-3"
                  >
                    {/* Sharp Angular Polygon Arrow from Wireframe */}
                    <div className="mt-0.5 shrink-0 text-[#991B1B] group-hover:translate-x-1 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 2 L12 8 L4 14" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>

                    {/* Bullet text */}
                    <p className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#991B1B] transition-colors leading-snug line-clamp-2">
                      {bulletText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap gap-2">
              <button
                onClick={onOpenStudyAbroadModal}
                className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Cổng Tư Vấn Du Học</span>
              </button>
              <button
                onClick={onOpenStudyAbroadModal}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>Danh Sách Trường Đối Tác</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
