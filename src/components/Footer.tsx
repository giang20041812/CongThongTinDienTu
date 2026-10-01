import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { MapPin, Mail, Phone, ExternalLink, ShieldCheck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1C1917] text-stone-300 border-t-4 border-[#991B1B] relative z-20">
      {/* Top Red Hairline Strip */}
      <div className="bg-[#7F1D1D] py-2 px-4 text-xs font-semibold text-white/90">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-200" />
            <span className="uppercase tracking-wider text-[11px]">
              CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỨC - CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN & THPT CHUYÊN CHU VĂN AN
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-200">
            Giấy phép số 104/GP-TTĐT do Sở Thông tin & Truyền thông Hà Nội cấp
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Logo + School Info (Directly from Wireframe Bottom) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4">
                {/* Logo circle matching wireframe bottom */}
                <div className="w-16 h-16 shrink-0 border-2 border-[#EF4444] bg-[#292524] flex items-center justify-center p-1 text-center shadow-md">
                  <div className="w-full h-full border border-white/20 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-[#EF4444] tracking-widest leading-none">CVA</span>
                    <span className="text-sm font-black tracking-widest text-white mt-0.5">Logo</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-tight leading-snug">
                    {SCHOOL_INFO.name}
                  </h3>
                  <div className="text-xs font-mono text-[#F87171] uppercase tracking-wider mt-0.5">
                    {SCHOOL_INFO.secondaryName}
                  </div>
                  <p className="text-xs text-stone-400 italic mt-1">
                    {SCHOOL_INFO.slogan}
                  </p>
                </div>
              </div>

              {/* School Contact Details */}
              <div className="mt-6 space-y-2.5 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <span>{SCHOOL_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span>Email: {SCHOOL_INFO.email} / {SCHOOL_INFO.officialEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span>Đường dây nóng: {SCHOOL_INFO.hotline} · Tổng đài: {SCHOOL_INFO.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] font-mono text-stone-500">
              Mã cơ quan chủ quản: GD-HN-CVA-01
            </div>
          </div>

          {/* Center Column: Quick Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#EF4444] tracking-widest border-b border-stone-800 pb-2 mb-4">
              CHUYÊN MỤC CHÍNH
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#tin-tuc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Tin tức & Sự kiện học đường
                </a>
              </li>
              <li>
                <a href="#tin-tuc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Thông báo chỉ đạo chuyên môn
                </a>
              </li>
              <li>
                <a href="#tuyen-sinh" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Tuyển sinh vào lớp 10 chuyên
                </a>
              </li>
              <li>
                <a href="#du-hoc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Chương trình du học & Học bổng
                </a>
              </li>
              <li>
                <a href="#do-that-lac" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Câu lạc bộ & Hoạt động Đoàn thanh niên
                </a>
              </li>
              <li>
                <a href="#do-that-lac" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150">
                  Góc thất lạc & Quản sinh học sinh
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: Educational System Links & Work Hours */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono font-bold uppercase text-[#EF4444] tracking-widest border-b border-stone-800 pb-2 mb-4">
              HỆ THỐNG LIÊN KẾT GIÁO DỤC
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://moet.gov.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-stone-300 hover:text-white transition-colors py-0.5 group"
                >
                  <span>Bộ Giáo dục và Đào tạo Việt Nam</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#EF4444]" />
                </a>
              </li>
              <li>
                <a
                  href="https://hanoi.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-stone-300 hover:text-white transition-colors py-0.5 group"
                >
                  <span>Sở Giáo dục và Đào tạo Hà Nội</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#EF4444]" />
                </a>
              </li>
              <li>
                <a
                  href="https://thisinh.thithptquocgia.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-stone-300 hover:text-white transition-colors py-0.5 group"
                >
                  <span>Cổng Tra cứu Điểm thi THPT Quốc Gia</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#EF4444]" />
                </a>
              </li>
              <li>
                <div className="mt-4 p-3 bg-stone-900 border border-stone-800">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase">
                    Giờ làm việc hành chính:
                  </div>
                  <div className="text-xs text-white font-medium mt-1">
                    Thứ Hai – Thứ Sáu: 07:30 - 17:00
                  </div>
                  <div className="text-xs text-stone-400">
                    Thứ Bảy: 07:30 - 11:30 (Trực chuyên môn)
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © 2026–2027 Bản quyền thuộc về Ban Giám hiệu Nhà trường & Cụm THPT Gia Lâm - Long Biên.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Thiết kế dứt khoát · Chuẩn mực giáo dục</span>
            <span>·</span>
            <span>Phiên bản số 4.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
