import React, { useState } from 'react';
import { ArrowLeft, Search, Bell, FileText, Download, Printer, CheckCircle, ShieldCheck, Calendar, Building } from 'lucide-react';
import { AnnouncementItem } from '../types';
import { SCHOOL_INFO } from '../data/mockData';
import { useAnnouncements } from '../api';
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

  const { data: dbAnnouncements, loading } = useAnnouncements();

  const formattedAnnouncements = dbAnnouncements.map((d: any) => ({
    id: d.id,
    title: d.title,
    date: new Date(d.createdAt).toLocaleDateString('vi-VN'),
    department: d.department || 'Ban Giám Hiệu',
    content: d.content || '',
    type: 'general',
    isImportant: d.isImportant
  }));

  const filteredAnnouncements = formattedAnnouncements.filter((item: any) => {
    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeptChange = (deptId: string) => {
    setSelectedDept(deptId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
          <button onClick={onGoHome} className="hover:text-[#003087] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#003087] font-bold">Thông Báo</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#003087] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              HỆ THỐNG VĂN BẢN ĐIỀU HÀNH & CHỈ ĐẠO
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
              Thông Báo Nhà Trường
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm công văn, thông báo..."
              className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-white border border-[#c5d3ec] focus:border-[#003087] focus:outline-none"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-black" />
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleDeptChange(dept.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border shrink-0 ${
                selectedDept === dept.id
                  ? 'bg-[#003087] text-white border-[#003087]'
                  : 'bg-white text-black border-[#c5d3ec] hover:border-[#9aabd4]'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Announcements List Table */}
        <div className="bg-white border-2 border-[#003087] shadow-sm divide-y divide-[#d1ddf5]">
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-[#FAF8F5] text-xs font-mono font-bold text-black uppercase border-b border-[#c5d3ec]">
            <div className="col-span-2">Số & Ngày ban hành</div>
            <div className="col-span-6">Trích yếu nội dung thông báo</div>
            <div className="col-span-2">Đơn vị phát hành</div>
            <div className="col-span-2 text-right">Tài liệu đính kèm</div>
          </div>

          {paginatedAnnouncements.length > 0 ? (
            paginatedAnnouncements.map((ann, idx) => (
              <div
                key={ann.id}
                onClick={() => onSelectAnnouncement(ann.id)}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-[#f5f7fc] transition-colors cursor-pointer group items-center"
              >
                {/* Date & Number */}
                <div className="sm:col-span-2 flex items-center sm:flex-col sm:items-start justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-[#003087] bg-[#e8eef8] px-2 py-0.5 border border-[#c5d3ec]/40">
                    {ann.date}
                  </span>
                  <span className="text-[11px] font-mono text-black">
                    CV-{100 + idx}/TB-2026
                  </span>
                </div>

                {/* Title & Excerpt */}
                <div className="sm:col-span-6">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.isImportant && (
                      <span className="text-[9px] font-bold text-white bg-[#003087] px-1.5 py-0.2 uppercase font-mono">
                        KHẨN
                      </span>
                    )}
                    <span className="sm:hidden text-xs text-black font-mono">
                      {ann.department}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-black group-hover:text-[#003087] transition-colors leading-snug line-clamp-2">
                    {ann.title}
                  </h3>
                  <p className="mt-1 text-xs text-black line-clamp-1">
                    {ann.content}
                  </p>
                </div>

                {/* Department */}
                <div className="hidden sm:block sm:col-span-2 text-xs font-semibold text-black">
                  <span className="truncate block">{ann.department}</span>
                </div>

                {/* Action / Attachment */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span className="sm:hidden text-black font-mono text-[11px]">
                    PDF (1.8 MB)
                  </span>
                  <span className="font-bold text-[#003087] group-hover:underline flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem văn bản →</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-black text-sm">
              Không tìm thấy thông báo nào trong chuyên mục này.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-[#c5d3ec] hover:border-[#003087] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black text-xs font-bold uppercase"
            >
              Trang trước
            </button>
            <span className="text-sm font-bold text-[#003087] px-4">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-[#c5d3ec] hover:border-[#003087] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black text-xs font-bold uppercase"
            >
              Trang sau
            </button>
          </div>
        )}
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
  const { data: dbAnnouncements, loading } = useAnnouncements();

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const rawAnn = dbAnnouncements.find((item: any) => item.id === announcementId) || dbAnnouncements[0];
  const ann = rawAnn ? {
    id: rawAnn.id,
    title: rawAnn.title,
    date: new Date(rawAnn.createdAt).toLocaleDateString('vi-VN'),
    department: rawAnn.department || 'Ban Giám Hiệu',
    content: rawAnn.content || '',
    type: 'general',
    fileAttachment: rawAnn.fileAttachmentName
  } : {
    id: '1', title: 'Đang tải...', date: '', department: '', content: '', type: 'general', fileAttachment: ''
  };

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5d3ec] hover:border-[#003087] text-[#003087] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách thông báo</span>
          </button>
        </div>

        {/* Official Vietnamese Letterhead Container */}
        <div className="bg-white border-2 border-[#003087] p-6 sm:p-10 shadow-md text-black">
          
          {/* Official Letterhead Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b-2 border-[#c5d3ec] text-center">
            {/* Left Header */}
            <div>
              <div className="text-xs font-bold uppercase text-black">
                SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI
              </div>
              <div className="text-xs font-extrabold uppercase text-[#003087] mt-0.5">
                {SCHOOL_INFO.name}
              </div>
              <div className="text-[11px] font-mono text-black mt-1">
                Số: 142/TB-CVA-2026
              </div>
            </div>

            {/* Right Header: Quốc Hiệu Tiêu Ngữ */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-black">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-xs font-bold text-black mt-0.5 italic">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="w-24 h-[1px] bg-[#9aabd4] mx-auto mt-1" />
              <div className="text-[11px] font-mono text-black mt-1">
                Hà Nội, ngày {ann.date}
              </div>
            </div>
          </div>

          {/* Announcement Main Title */}
          <div className="text-center my-8">
            <span className="text-xs font-bold font-mono tracking-widest text-[#003087] uppercase bg-[#e8eef8] px-3 py-1 border border-[#c5d3ec]/40">
              VĂN BẢN CHỈ ĐẠO CHÍNH THỨC
            </span>
            <h1 className="text-lg sm:text-2xl font-extrabold text-black uppercase tracking-tight leading-snug mt-3">
              {ann.title}
            </h1>
          </div>

          {/* Recipient & Metadata */}
          <div className="bg-[#f5f7fc] border border-[#d1ddf5] p-4 mb-6 text-xs sm:text-sm space-y-1.5">
            <div>
              <span className="font-bold text-black">Đơn vị ban hành: </span>
              <span className="text-[#003087] font-semibold">{ann.department}</span>
            </div>
            <div>
              <span className="font-bold text-black">Đối tượng thực hiện: </span>
              <span className="text-black">Các Tổ chuyên môn, giáo viên và học sinh trực thuộc</span>
            </div>
          </div>

          {/* Official Content Body */}
          <div className="text-sm sm:text-base leading-relaxed space-y-4 text-black">
            <p className="font-semibold text-black">
              Kính gửi: Toàn thể Cán bộ, Giáo viên, Nhân viên và Học sinh nhà trường,
            </p>

            <p>{ann.content}</p>

            <p>
              Yêu cầu các đơn vị có liên quan nghiên cứu kỹ các văn bản hướng dẫn nghiệp vụ đính kèm, chuẩn bị đầy đủ các điều kiện cơ sở vật chất, hồ sơ dự thi và thực hiện đúng thời hạn quy định. Trong quá trình triển khai, nếu có vướng mắc phát sinh, các tổ chuyên môn kịp thời báo cáo Ban Giám hiệu qua Văn phòng trường để được hướng dẫn giải quyết.
            </p>
          </div>

          {/* Official Attachment Box */}
          <div className="mt-8 p-4 border border-[#c5d3ec] bg-[#f5f7fc] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e8eef8] border border-[#003087] flex items-center justify-center text-[#003087] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-black">
                  {ann.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}
                </div>
                <div className="text-[11px] font-mono text-black">
                  Tài liệu đính kèm chính thức · Dung lượng 1.8 MB · Có chữ ký số
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Đang tải tệp: ${ann.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}`)}
              className="px-4 py-2 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Văn Bản PDF</span>
            </button>
          </div>

          {/* Official Signatures & Receipt */}
          <div className="mt-10 pt-6 border-t-2 border-[#d1ddf5] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="font-bold text-black italic">Nơi nhận:</div>
              <ul className="mt-1 list-disc list-inside text-black space-y-0.5 font-mono text-[11px]">
                <li>Sở GD&ĐT Hà Nội (để b/c);</li>
                <li>Ban Giám hiệu (chỉ đạo);</li>
                <li>Các trường trong Cụm;</li>
                <li>Lưu: VT, ĐT.</li>
              </ul>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-extrabold uppercase text-black">HIỆU TRƯỞNG</div>
              <div className="text-[11px] text-black italic mt-0.5">(Đã ký số và đóng dấu)</div>

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
