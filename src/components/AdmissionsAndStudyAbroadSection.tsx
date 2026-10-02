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
    <section id="tuyen-sinh" className="relative w-full py-12 sm:py-16 bg-[#FFFFFF] border-b border-[#d1ddf5]">
      {/* Background Subtle Coordinate Lines */}
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        
        {/* Split Two Columns Layout with Center Vertical Divider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          
          {/* ========================================================
              LEFT COLUMN: TUYỂN SINH (Admissions)
             ======================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: Tuyển sinh */}
              <div className="border-b-2 border-[#003087] pb-2.5 mb-6">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  KỲ THI VÀO LỚP 10
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003087] tracking-tight uppercase">
                  Tuyển sinh
                </h2>
              </div>

              {/* Featured Item: [ẢNH TIN] + Title */}
              <div
                onClick={onOpenAdmissionModal}
                className="group cursor-pointer border border-[#d1ddf5] bg-[#f5f7fc] hover:border-[#003087] transition-all p-3.5 flex flex-col sm:flex-row gap-4 shadow-xs"
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
                    <span className="text-[10px] font-mono font-bold text-[#003087] uppercase tracking-wider bg-[#e8eef8] px-1.5 py-0.5 border border-[#c5d3ec]/40">
                      CHỈ TIÊU & QUY CHẾ
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug mt-1.5 line-clamp-3">
                      {ADMISSION_DATA.featured.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#4a5f8a] line-clamp-2">
                      {ADMISSION_DATA.featured.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#6b82b8]">
                    <span>Chỉ tiêu: {ADMISSION_DATA.featured.quota} học sinh</span>
                    <span className="font-bold text-[#003087]">Xem chi tiết →</span>
                  </div>
                </div>
              </div>

              {/* 4 Bullet Items with Sharp Polygon Chevron Arrows */}
              <div className="mt-6 space-y-3">
                {ADMISSION_DATA.bullets.map((bulletText, idx) => (
                  <div
                    key={idx}
                    onClick={onOpenAdmissionModal}
                    className="group cursor-pointer p-2.5 border border-[#d1ddf5] hover:border-[#003087] hover:bg-[#f5f7fc] transition-all flex items-start gap-3"
                  >
                    {/* Sharp Angular Polygon Arrow */}
                    <div className="mt-0.5 shrink-0 text-[#003087] group-hover:translate-x-1 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 2 L12 8 L4 14" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>

                    {/* Bullet text */}
                    <p className="text-xs sm:text-sm font-semibold text-[#1a2744] group-hover:text-[#003087] transition-colors leading-snug line-clamp-2">
                      {bulletText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-6 pt-4 border-t border-[#d1ddf5] flex flex-wrap gap-2">
              <button
                onClick={onOpenAdmissionModal}
                className="px-4 py-2 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Nộp Hồ Sơ Trực Tuyến</span>
              </button>
              <button
                onClick={onOpenAdmissionModal}
                className="px-3.5 py-2 bg-white hover:bg-[#f5f7fc] border border-[#c5d3ec] text-[#1a2744] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#003087]" />
                <span>Tải Mẫu Đơn Đăng Ký</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              VERTICAL DIVIDER LINE (Between Tuyển sinh & Du học)
             ======================================================== */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#d1ddf5] -translate-x-1/2" />

          {/* ========================================================
              RIGHT COLUMN: DU HỌC (Study Abroad & International Programs)
             ======================================================== */}
          <div id="du-hoc" className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header: Du học */}
              <div className="border-b-2 border-[#003087] pb-2.5 mb-6">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  HỘI NHẬP QUỐC TẾ
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003087] tracking-tight uppercase">
                  Du học
                </h2>
              </div>

              {/* Featured Item: [ẢNH TIN] + Title */}
              <div
                onClick={onOpenStudyAbroadModal}
                className="group cursor-pointer border border-[#d1ddf5] bg-[#f5f7fc] hover:border-[#003087] transition-all p-3.5 flex flex-col sm:flex-row gap-4 shadow-xs"
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
                    <span className="text-[10px] font-mono font-bold text-[#003087] uppercase tracking-wider bg-[#e8eef8] px-1.5 py-0.5 border border-[#c5d3ec]/40">
                      HỌC BỔNG TOÀN PHẦN
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug mt-1.5 line-clamp-3">
                      {STUDY_ABROAD_DATA.featured.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#4a5f8a] line-clamp-2">
                      {STUDY_ABROAD_DATA.featured.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#6b82b8]">
                    <span>Hạn nộp: {STUDY_ABROAD_DATA.featured.deadline}</span>
                    <span className="font-bold text-[#003087]">Xem chi tiết →</span>
                  </div>
                </div>
              </div>

              {/* 4 Bullet Items with Sharp Polygon Chevron Arrows */}
              <div className="mt-6 space-y-3">
                {STUDY_ABROAD_DATA.bullets.map((bulletText, idx) => (
                  <div
                    key={idx}
                    onClick={onOpenStudyAbroadModal}
                    className="group cursor-pointer p-2.5 border border-[#d1ddf5] hover:border-[#003087] hover:bg-[#f5f7fc] transition-all flex items-start gap-3"
                  >
                    {/* Sharp Angular Polygon Arrow */}
                    <div className="mt-0.5 shrink-0 text-[#003087] group-hover:translate-x-1 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 2 L12 8 L4 14" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>

                    {/* Bullet text */}
                    <p className="text-xs sm:text-sm font-semibold text-[#1a2744] group-hover:text-[#003087] transition-colors leading-snug line-clamp-2">
                      {bulletText}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-6 pt-4 border-t border-[#d1ddf5] flex flex-wrap gap-2">
              <button
                onClick={onOpenStudyAbroadModal}
                className="px-4 py-2 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Cổng Tư Vấn Du Học</span>
              </button>
              <button
                onClick={onOpenStudyAbroadModal}
                className="px-3.5 py-2 bg-white hover:bg-[#f5f7fc] border border-[#c5d3ec] text-[#1a2744] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-[#003087]" />
                <span>Danh Sách Trường Đối Tác</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
