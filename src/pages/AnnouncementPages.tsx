import React, { useState } from 'react';
import { ArrowLeft, Search, Bell, FileText, Download, Printer, CheckCircle, ShieldCheck, Calendar, Building } from 'lucide-react';
import { AnnouncementItem } from '../types';
import { ALL_ANNOUNCEMENTS, SCHOOL_INFO } from '../data/mockData';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface AnnouncementListPageProps {
  onSelectAnnouncement: (id: string) => void;
  onGoHome: () => void;
}

export const AnnouncementListPage: React.FC<AnnouncementListPageProps> = ({
  onSelectAnnouncement,
  onGoHome,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = [
    { id: 'all', label: 'TẤT CẢ VĂN BẢN' },
    { id: 'Ban Đào tạo Cụm', label: 'BAN ĐÀO TẠO CỤM' },
    { id: 'Tổ Chuyên môn Toán', label: 'TỔ TOÁN' },
    { id: 'Tổ Ngoại ngữ', label: 'TỔ NGOẠI NGỮ' },
    { id: 'Văn phòng Nhà trường', label: 'VĂN PHÒNG' },
    { id: 'Ban Giám Hiệu', label: 'BAN GIÁM HIỆU' },
  ];

  const filteredAnnouncements = ALL_ANNOUNCEMENTS.filter((item) => {
    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-6">
          <button onClick={onGoHome} className="hover:text-[#991B1B] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#991B1B] font-bold">Thông Báo</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#991B1B] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              HỆ THỐNG VĂN BẢN ĐIỀU HÀNH & CHỈ ĐẠO
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
              Thông Báo Nhà Trường
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công văn, thông báo..."
              className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-white border border-stone-300 focus:border-[#991B1B] focus:outline-none"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                selectedDept === dept.id
                  ? 'bg-[#991B1B] text-white border-[#991B1B]'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Announcements List Table */}
        <div className="bg-white border-2 border-[#991B1B] shadow-sm divide-y divide-stone-200">
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-[#FAF8F5] text-xs font-mono font-bold text-stone-700 uppercase border-b border-stone-300">
            <div className="col-span-2">Số & Ngày ban hành</div>
            <div className="col-span-6">Trích yếu nội dung thông báo</div>
            <div className="col-span-2">Đơn vị phát hành</div>
            <div className="col-span-2 text-right">Tài liệu đính kèm</div>
          </div>

          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((ann, idx) => (
              <div
                key={ann.id}
                onClick={() => onSelectAnnouncement(ann.id)}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer group items-center"
              >
                {/* Date & Number */}
                <div className="sm:col-span-2 flex items-center sm:flex-col sm:items-start justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 border border-[#FCA5A5]/40">
                    {ann.date}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    CV-{100 + idx}/TB-2026
                  </span>
                </div>

                {/* Title & Excerpt */}
                <div className="sm:col-span-6">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.isImportant && (
                      <span className="text-[9px] font-bold text-white bg-[#991B1B] px-1.5 py-0.2 uppercase font-mono">
                        KHẨN
                      </span>
                    )}
                    <span className="sm:hidden text-xs text-stone-500 font-mono">
                      {ann.department}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#1C1917] group-hover:text-[#991B1B] transition-colors leading-snug line-clamp-2">
                    {ann.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-600 line-clamp-1">
                    {ann.content}
                  </p>
                </div>

                {/* Department */}
                <div className="hidden sm:block sm:col-span-2 text-xs font-semibold text-stone-700">
                  <span className="truncate block">{ann.department}</span>
                </div>

                {/* Action / Attachment */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span className="sm:hidden text-stone-500 font-mono text-[11px]">
                    PDF (1.8 MB)
                  </span>
                  <span className="font-bold text-[#991B1B] group-hover:underline flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem văn bản →</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-stone-500 text-sm">
              Không tìm thấy thông báo nào trong chuyên mục này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AnnouncementDetailPageProps {
  announcementId: string;
  onBack: () => void;
}

export const AnnouncementDetailPage: React.FC<AnnouncementDetailPageProps> = ({
  announcementId,
  onBack,
}) => {
  const ann = ALL_ANNOUNCEMENTS.find((item) => item.id === announcementId) || ALL_ANNOUNCEMENTS[0];

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-[#991B1B] text-[#991B1B] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách thông báo</span>
          </button>
        </div>

        {/* Official Vietnamese Letterhead Container */}
        <div className="bg-white border-2 border-[#991B1B] p-6 sm:p-10 shadow-md text-stone-900">
          
          {/* Official Letterhead Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b-2 border-stone-300 text-center">
            {/* Left Header */}
            <div>
              <div className="text-xs font-bold uppercase text-stone-700">
                SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI
              </div>
              <div className="text-xs font-extrabold uppercase text-[#991B1B] mt-0.5">
                {SCHOOL_INFO.name}
              </div>
              <div className="text-[11px] font-mono text-stone-500 mt-1">
                Số: 142/TB-CVA-2026
              </div>
            </div>

            {/* Right Header: Quốc Hiệu Tiêu Ngữ */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-800">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-xs font-bold text-stone-700 mt-0.5 italic">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="w-24 h-[1px] bg-stone-400 mx-auto mt-1" />
              <div className="text-[11px] font-mono text-stone-500 mt-1">
                Hà Nội, ngày {ann.date}
              </div>
            </div>
          </div>

          {/* Announcement Main Title */}
          <div className="text-center my-8">
            <span className="text-xs font-bold font-mono tracking-widest text-[#991B1B] uppercase bg-[#FEF2F2] px-3 py-1 border border-[#FCA5A5]/40">
              VĂN BẢN CHỈ ĐẠO CHÍNH THỨC
            </span>
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#1C1917] uppercase tracking-tight leading-snug mt-3">
              {ann.title}
            </h1>
          </div>

          {/* Recipient & Metadata */}
          <div className="bg-[#FAF9F6] border border-stone-200 p-4 mb-6 text-xs sm:text-sm space-y-1.5">
            <div>
              <span className="font-bold text-stone-800">Đơn vị ban hành: </span>
              <span className="text-[#991B1B] font-semibold">{ann.department}</span>
            </div>
            <div>
              <span className="font-bold text-stone-800">Đối tượng thực hiện: </span>
              <span className="text-stone-700">Các Tổ chuyên môn, giáo viên và học sinh trực thuộc</span>
            </div>
          </div>

          {/* Official Content Body */}
          <div className="text-sm sm:text-base leading-relaxed space-y-4 text-stone-800">
            <p className="font-semibold text-stone-900">
              Kính gửi: Toàn thể Cán bộ, Giáo viên, Nhân viên và Học sinh nhà trường,
            </p>

            <p>{ann.content}</p>

            <p>
              Yêu cầu các đơn vị có liên quan nghiên cứu kỹ các văn bản hướng dẫn nghiệp vụ đính kèm, chuẩn bị đầy đủ các điều kiện cơ sở vật chất, hồ sơ dự thi và thực hiện đúng thời hạn quy định. Trong quá trình triển khai, nếu có vướng mắc phát sinh, các tổ chuyên môn kịp thời báo cáo Ban Giám hiệu qua Văn phòng trường để được hướng dẫn giải quyết.
            </p>
          </div>

          {/* Official Attachment Box */}
          <div className="mt-8 p-4 border border-stone-300 bg-[#FAF9F6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEF2F2] border border-[#B91C1C] flex items-center justify-center text-[#991B1B] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-stone-800">
                  {ann.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Tài liệu đính kèm chính thức · Dung lượng 1.8 MB · Có chữ ký số
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Đang tải tệp: ${ann.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}`)}
              className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Văn Bản PDF</span>
            </button>
          </div>

          {/* Official Signatures & Receipt */}
          <div className="mt-10 pt-6 border-t-2 border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="font-bold text-stone-800 italic">Nơi nhận:</div>
              <ul className="mt-1 list-disc list-inside text-stone-600 space-y-0.5 font-mono text-[11px]">
                <li>Sở GD&ĐT Hà Nội (để b/c);</li>
                <li>Ban Giám hiệu (chỉ đạo);</li>
                <li>Các trường trong Cụm;</li>
                <li>Lưu: VT, ĐT.</li>
              </ul>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-extrabold uppercase text-stone-800">HIỆU TRƯỞNG</div>
              <div className="text-[11px] text-stone-500 italic mt-0.5">(Đã ký số và đóng dấu)</div>

              <div className="inline-block mt-4 p-2.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-[10px] font-mono text-left">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  CHỮ KÝ SỐ HỢP LỆ
                </div>
                <div>Cơ quan: Trường THPT Chuyên Chu Văn An</div>
                <div>Thời gian ký: {ann.date} 08:30:15 GMT+7</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
