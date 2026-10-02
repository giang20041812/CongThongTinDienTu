import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { MapPin, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import schoolLogo from '../assets/logo.jpg';

export const Footer: React.FC = () => {
  const mapQuery = encodeURIComponent(`${SCHOOL_INFO.name}, ${SCHOOL_INFO.address}`);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=My%20Location&destination=${mapQuery}&travelmode=driving`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <footer className="w-full bg-[#001a52] text-[#c5d3ec] border-t-4 border-[#FFD700] relative z-20">
      {/* Top Gold Strip */}
      <div className="bg-[#003087] py-2 px-4 text-xs font-semibold text-white/90">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
            <span className="uppercase tracking-wider text-[11px]">
              CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỨC - TRƯỜNG THPT ĐẶNG TRẦN ĐỨC - SỞ GD&ĐT HÀ NỘI
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#FFD700]/80">
            Giấy phép số 104/GP-TTĐT do Sở Thông tin & Truyền thông Hà Nội cấp
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Logo + School Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4">
                {/* Logo Image */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0">
                  <img
                    src={schoolLogo}
                    alt="Logo THPT Đặng Trần Đức"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-tight leading-snug">
                    {SCHOOL_INFO.name}
                  </h3>
                  <div className="text-xs font-mono text-[#FFD700] uppercase tracking-wider mt-0.5">
                    {SCHOOL_INFO.secondaryName}
                  </div>
                  <p className="text-xs text-[#9aabd4] italic mt-1">
                    {SCHOOL_INFO.slogan}
                  </p>
                </div>
              </div>

              {/* School Contact Details */}
              <div className="mt-6 space-y-2.5 text-xs text-[#c5d3ec]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <span>{SCHOOL_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FFD700] shrink-0" />
                  <span>Email: {SCHOOL_INFO.email} / {SCHOOL_INFO.officialEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FFD700] shrink-0" />
                  <span>Điện thoại: {SCHOOL_INFO.hotline} · {SCHOOL_INFO.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#002060] text-[11px] font-mono text-[#6b82b8]">
              Mã cơ quan chủ quản: GD-HN-DTD-01 · Thành lập năm {SCHOOL_INFO.establishedYear}
            </div>
          </div>

          {/* Center Column: Quick Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-widest border-b border-[#002060] pb-2 mb-4">
              CHUYÊN MỤC CHÍNH
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#tin-tuc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Tin tức & Sự kiện học đường
                </a>
              </li>
              <li>
                <a href="#tin-tuc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Thông báo chỉ đạo chuyên môn
                </a>
              </li>
              <li>
                <a href="#tuyen-sinh" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Tuyển sinh vào lớp 10
                </a>
              </li>
              <li>
                <a href="#du-hoc" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Chương trình du học & Học bổng
                </a>
              </li>
              <li>
                <a href="#do-that-lac" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Câu lạc bộ & Hoạt động Đoàn thanh niên
                </a>
              </li>
              <li>
                <a href="#do-that-lac" className="hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150 hover:text-[#FFD700]">
                  Góc thất lạc & Quản sinh học sinh
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: Educational System Links & Work Hours */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono font-bold uppercase text-[#FFD700] tracking-widest border-b border-[#002060] pb-2 mb-4">
              HỆ THỐNG LIÊN KẾT GIÁO DỤC
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://moet.gov.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-[#c5d3ec] hover:text-white transition-colors py-0.5 group"
                >
                  <span>Bộ Giáo dục và Đào tạo Việt Nam</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6b82b8] group-hover:text-[#FFD700]" />
                </a>
              </li>
              <li>
                <a
                  href="https://hanoi.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-[#c5d3ec] hover:text-white transition-colors py-0.5 group"
                >
                  <span>Sở Giáo dục và Đào tạo Hà Nội</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6b82b8] group-hover:text-[#FFD700]" />
                </a>
              </li>
              <li>
                <a
                  href="https://thisinh.thithptquocgia.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-[#c5d3ec] hover:text-white transition-colors py-0.5 group"
                >
                  <span>Cổng Tra cứu Điểm thi THPT Quốc Gia</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6b82b8] group-hover:text-[#FFD700]" />
                </a>
              </li>
              <li>
                <div className="mt-4 p-3 bg-[#002060] border border-[#003087]">
                  <div className="text-[11px] font-semibold text-[#9aabd4] uppercase">
                    Giờ làm việc hành chính:
                  </div>
                  <div className="text-xs text-white font-medium mt-1">
                    Thứ Hai – Thứ Sáu: 07:30 - 17:00
                  </div>
                  <div className="text-xs text-[#9aabd4]">
                    Thứ Bảy: 07:30 - 11:30 (Trực chuyên môn)
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Google Maps: địa chỉ và chỉ đường tới trường */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-[#002060] pt-8">
          <div className="lg:col-span-7 min-h-64 bg-[#002060] border border-[#003087] overflow-hidden">
            <iframe
              title={`Bản đồ ${SCHOOL_INFO.name}`}
              src={mapEmbedUrl}
              className="w-full h-64 lg:h-72 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center bg-[#002060] border border-[#003087] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[#FFD700] text-xs font-mono font-bold uppercase tracking-widest">
              <MapPin className="w-4 h-4" />
              Vị trí trường
            </div>
            <h4 className="mt-3 text-lg font-extrabold text-white uppercase">Địa chỉ liên hệ</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#c5d3ec]">{SCHOOL_INFO.address}</p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-fit items-center gap-2 bg-[#FFD700] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#001a52] hover:bg-white transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Chỉ đường tới trường
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="mt-3 text-[11px] text-[#9aabd4]">Google Maps sẽ mở tuyến đường từ vị trí hiện tại của bạn.</p>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-[#002060] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b82b8]">
          <div>
            © 2026–2027 Bản quyền thuộc về Ban Giám hiệu Nhà trường THPT Đặng Trần Đức.
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
