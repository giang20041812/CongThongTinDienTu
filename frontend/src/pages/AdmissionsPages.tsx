import React, { useState } from 'react';
import { ArrowLeft, GraduationCap, Calendar, FileText, CheckCircle2, Download, Send, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { AdmissionItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';
import { usePosts } from '../api';

interface AdmissionsListPageProps {
  onSelectAdmission: (id: string) => void;
  onGoHome: () => void;
}

export const AdmissionsListPage: React.FC<AdmissionsListPageProps> = ({
  onSelectAdmission,
  onGoHome,
}) => {
  const { data: posts, loading } = usePosts();
  const admissionsList = posts.filter((p: any) => p.category?.code === 'ADMISSION').map((p: any) => ({
    id: p.id,
    title: p.title,
    date: new Date(p.createdAt).toLocaleDateString('vi-VN'),
    deadline: 'Đang cập nhật',
    target: p.blocks?.[0]?.content || 'Khối 10',
    quota: 0,
    description: p.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    imageUrl: p.imgUrl || p.imageUrl
  }));

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(admissionsList.length / itemsPerPage) || 1;
  const paginatedAdmissions = admissionsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="dots" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
          <button onClick={onGoHome} className="hover:text-[#0052cc] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#0052cc] font-bold">Tuyển sinh 2026–2027</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#0052cc] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#0052cc] font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              CỔNG THÔNG TIN TUYỂN SINH LỚP 10
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
              Tuyển sinh Vào Lớp 10
            </h1>
          </div>

          <div className="text-xs font-mono text-black bg-white p-2.5 border border-[#bfdbfe]">
            Tổng chỉ tiêu: <span className="text-base font-bold text-[#0052cc]">750 học sinh</span> (18 Lớp Chuyên & Song bằng)
          </div>
        </div>

        {/* Timeline Key Dates Bar */}
        <div className="bg-white border-2 border-[#0052cc] p-4 sm:p-6 mb-8 shadow-xs">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0052cc] mb-4">
            MỐC THỜI GIAN TUYỂN SINH QUAN TRỌNG (DỰ KIẾN 2026)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#0052cc]">
              <div className="font-mono text-[11px] text-black">10/05 – 25/05/2026</div>
              <div className="font-bold text-black mt-1">Phát hành & Tiếp nhận hồ sơ</div>
              <div className="text-black text-[11px] mt-0.5">Trực tuyến và trực tiếp tại trường</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#0052cc]">
              <div className="font-mono text-[11px] text-black">08/06 – 09/06/2026</div>
              <div className="font-bold text-black mt-1">Thi các môn chung</div>
              <div className="text-black text-[11px] mt-0.5">Toán, Ngữ văn, Ngoại ngữ</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#0052cc]">
              <div className="font-mono text-[11px] text-black">10/06 – 11/06/2026</div>
              <div className="font-bold text-black mt-1">Thi các môn chuyên</div>
              <div className="text-black text-[11px] mt-0.5">Theo đề thi chuyên biệt của Sở</div>
            </div>
            <div className="p-3 bg-[#f5f7fc] border-l-2 border-[#0052cc]">
              <div className="font-mono text-[11px] text-black">05/07/2026</div>
              <div className="font-bold text-black mt-1">Công bố điểm chuẩn</div>
              <div className="text-black text-[11px] mt-0.5">Và tiếp nhận hồ sơ trúng tuyển</div>
            </div>
          </div>
        </div>

        {/* Admission Targets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedAdmissions.map((adm) => (
            <div
              key={adm.id}
              onClick={() => onSelectAdmission(adm.id)}
              className="group cursor-pointer border border-[#dbeafe] bg-white hover:border-[#0052cc] transition-all p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#0052cc] uppercase bg-[#eef5ff] px-2 py-0.5 border border-[#bfdbfe]/40">
                    {adm.target}
                  </span>
                  <span className="text-xs font-mono font-bold text-black">
                    Chỉ tiêu: {adm.quota} học sinh
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-[#0052cc] transition-colors uppercase leading-snug">
                  {adm.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-sm text-black leading-relaxed">
                  {adm.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#eef5ff] flex items-center justify-between text-xs font-mono text-black">
                  <span>Hạn nhận hồ sơ: {adm.deadline}</span>
                  <span className="text-[#0052cc] font-bold group-hover:underline">
                    Xem quy chế thi →
                  </span>
                </div>
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

interface AdmissionDetailPageProps {
  admissionId: string;
  onBack: () => void;
}

export const AdmissionDetailPage: React.FC<AdmissionDetailPageProps> = ({
  admissionId,
  onBack,
}) => {
  const { data: posts, loading } = usePosts();

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const rawPost = posts.find((p: any) => p.id === admissionId);
  const item = rawPost ? {
    id: rawPost.id,
    title: rawPost.title,
    date: new Date(rawPost.createdAt).toLocaleDateString('vi-VN'),
    deadline: 'Đang cập nhật',
    target: rawPost.blocks?.[0]?.content || 'Khối 10',
    quota: 0,
    description: rawPost.blocks?.find((b: any) => b.type === 'TEXT')?.content || '',
    imageUrl: rawPost.imgUrl || rawPost.imageUrl
  } : null;

  if (!item) return <div className="text-center py-20">Không tìm thấy dữ liệu.</div>;

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
            <span>Quay lại cổng tuyển sinh</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#0052cc] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-[#dbeafe] pb-3 text-xs font-mono text-black">
            <span className="font-bold text-[#0052cc] uppercase">{item.target}</span>
            <span>Chỉ tiêu tuyển sinh: {item.quota} học sinh</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-black uppercase tracking-tight leading-tight mt-3">
            {item.title}
          </h1>

          <div className="my-6 relative h-64 sm:h-96 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <EduImageFrame
                label="MA TRẬN ĐỀ THI HSG"
                subLabel={item.target}
                theme="exam"
                aspectRatio="16:9"
              />
            )}
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-black leading-relaxed">
            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide">
              1. Cấu Trúc Ma Trận Đề Thi & Hình Thức Khảo Sát
            </h2>
            <p>
              Đề thi chuyên được xây dựng theo chuẩn đánh giá năng lực của Bộ Giáo dục và Đào tạo, phân bổ tỷ lệ: 40% câu hỏi nhận biết - thông hiểu, 30% câu hỏi vận dụng và 30% câu hỏi vận dụng cao mang tính phân loại xuất sắc.
            </p>

            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide pt-2">
              2. Hồ Sơ Đăng Ký Dự Tuyển
            </h2>
            <ul className="list-disc list-inside space-y-1 text-black font-normal">
              <li>Phiếu đăng ký dự tuyển vào lớp 10 THPT chuyên (theo mẫu của Sở GD&ĐT Hà Nội);</li>
              <li>Bản sao công chứng Học bạ cấp THCS (xếp loại Giỏi 4 năm học);</li>
              <li>Bản sao Giấy chứng nhận tốt nghiệp THCS tạm thời;</li>
              <li>Bản sao công chứng Giấy khai sinh;</li>
              <li>Giấy chứng nhận học sinh đạt giải trong các kỳ thi chọn học sinh giỏi cấp Thành phố/Quốc gia (nếu có để xét diện cộng điểm hoặc tuyển thẳng).</li>
            </ul>

            <h2 className="text-base font-bold text-[#0052cc] uppercase tracking-wide pt-2">
              3. Phương Thức Nộp Hồ Sơ & Lệ Phí
            </h2>
            <p>
              Thí sinh có thể nộp hồ sơ trực tuyến qua Cổng dịch vụ công của Sở GD&ĐT Hà Nội hoặc nộp trực tiếp tại Văn phòng tuyển sinh Trường THPT Chuyên Chu Văn An (Số 59 đường Thanh Niên, Tây Hồ, Hà Nội).
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#dbeafe] flex flex-wrap gap-3">
            <button
              onClick={() => alert('Đang chuyển hướng tới Cổng Nộp Hồ Sơ Tuyển Sinh Trực Tuyến')}
              className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#0026e6] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp Hồ Sơ Trực Tuyến</span>
            </button>
            <button
              onClick={() => alert('Đang tải tệp mẫu đơn đăng ký tuyển sinh')}
              className="px-4 py-2.5 bg-[#eef5ff] hover:bg-[#dbeafe] border border-[#bfdbfe] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0052cc]" />
              <span>Tải Mẫu Đơn Đăng Ký PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
