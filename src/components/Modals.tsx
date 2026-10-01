import React, { useState } from 'react';
import { X, Calendar, User, Eye, Download, Printer, CheckCircle, Share2, AlertCircle, FileText, Send } from 'lucide-react';
import { ActiveModal, LostItem } from '../types';
import { EduImageFrame } from './EduImageFrame';

interface ModalsProps {
  modal: ActiveModal;
  onClose: () => void;
  onItemClaimed?: (id: string) => void;
  onAddNewLostItem?: (item: LostItem) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  modal,
  onClose,
  onItemClaimed,
  onAddNewLostItem,
}) => {
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    name: '',
    studentClass: '',
    itemTitle: '',
    itemType: 'Đồ dùng học tập',
    location: '',
    date: '05/09/2026',
    description: '',
    phone: '',
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      {/* Sharp Modal Container with Red Top Accent Border */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border-2 border-[#991B1B] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#991B1B] text-white border-b border-[#7F1D1D] shrink-0">
          <div className="flex items-center gap-2 pr-2">
            <span className="w-2.5 h-2.5 bg-white shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider truncate">
              {modal.type === 'news' && 'BẢN TIN CHI TIẾT'}
              {modal.type === 'announcement' && 'VĂN BẢN THÔNG BÁO CHÍNH THỨC'}
              {modal.type === 'lostItem' && 'CHI TIẾT VẬT PHẨM THẤT LẠC'}
              {modal.type === 'reportLost' && 'ĐĂNG KÝ BÁO MẤT ĐỒ'}
              {modal.type === 'tkb' && 'THỜI KHÓA BIỂU HỌC KỲ I'}
              {modal.type === 'calendar' && 'LỊCH LÀM VIỆC TUẦN CỦA BAN GIÁM HIỆU'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-[#7F1D1D] active:bg-[#601313] text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-60px)] space-y-4 sm:space-y-5 text-[#1C1917]">
          
          {/* ========================================================
              NEWS MODAL
             ======================================================== */}
          {modal.type === 'news' && (
            <div>
              <div className="flex items-center gap-3 text-xs text-stone-500 font-mono pb-2 border-b border-stone-200">
                <span className="bg-[#FEF2F2] text-[#991B1B] font-bold px-2 py-0.5 border border-[#FCA5A5]">
                  {modal.data.category}
                </span>
                <span>Ngày đăng: {modal.data.date}</span>
                <span>·</span>
                <span>{modal.data.views.toLocaleString()} lượt đọc</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] leading-tight uppercase mt-3">
                {modal.data.title}
              </h2>

              <div className="mt-4">
                <EduImageFrame
                  label="ẢNH TIN CHÍNH THỨC"
                  subLabel={modal.data.imageFallbackTitle}
                  theme="exam"
                  aspectRatio="16:9"
                />
              </div>

              <div className="mt-4 p-3 bg-[#FAF8F5] border-l-4 border-[#991B1B] text-xs sm:text-sm font-semibold text-stone-800 leading-relaxed italic">
                {modal.data.summary}
              </div>

              <div className="mt-4 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 whitespace-pre-line">
                {modal.data.content}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-700">Tác giả: {modal.data.author}</span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer border border-stone-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In bài viết</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              ANNOUNCEMENT MODAL
             ======================================================== */}
          {modal.type === 'announcement' && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-stone-500 pb-2 border-b border-stone-200">
                <span className="font-bold text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 border border-[#FCA5A5]">
                  {modal.data.department}
                </span>
                <span>Ngày ban hành: {modal.data.date}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] leading-snug uppercase mt-3">
                {modal.data.title}
              </h2>

              <div className="mt-4 p-4 bg-[#FAF9F6] border border-stone-200 space-y-3">
                <div className="text-xs font-bold text-[#991B1B] uppercase tracking-wide">
                  Nội dung chi tiết chỉ đạo:
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {modal.data.content}
                </p>
              </div>

              {/* Attachment Download */}
              <div className="mt-4 p-3.5 border border-stone-300 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#991B1B]" />
                  <div>
                    <div className="text-xs font-bold text-stone-800">
                      {modal.data.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500">
                      Định dạng PDF · Dung lượng 1.8 MB · Chữ ký số Ban Giám Hiệu
                    </div>
                  </div>
                </div>

                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Đang tải tệp: ${modal.data.fileAttachment || 'CV-MaTranDeThiHSG-Signed.pdf'}`);
                  }}
                  className="px-3 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Về</span>
                </a>
              </div>
            </div>
          )}

          {/* ========================================================
              LOST ITEM DETAIL MODAL
             ======================================================== */}
          {modal.type === 'lostItem' && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-stone-200">
                <span className="font-bold text-[#991B1B]">
                  Loại: {modal.data.itemType}
                </span>
                <span className="font-semibold text-stone-500">
                  Ngày nhặt được: {modal.data.dateFound}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] leading-snug uppercase mt-3">
                {modal.data.title}
              </h2>

              {/* Two Square Images Side by Side as Drawn in Wireframe */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <EduImageFrame
                  label="ẢNH ĐỒ 1"
                  subLabel={modal.data.images[0]}
                  theme="lost"
                  aspectRatio="1:1"
                />
                <EduImageFrame
                  label="ẢNH ĐỒ 2"
                  subLabel={modal.data.images[1]}
                  theme="lost"
                  aspectRatio="1:1"
                />
              </div>

              <div className="mt-4 p-3.5 bg-[#FAF9F6] border border-stone-200 space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-stone-700">Vị trí phát hiện: </span>
                  <span className="text-stone-900">{modal.data.locationFound}</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Mô tả đặc điểm: </span>
                  <span className="text-stone-700">{modal.data.description}</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Đơn vị lưu trữ: </span>
                  <span className="text-[#991B1B] font-medium">{modal.data.finderDepartment}</span>
                </div>
              </div>

              {/* Claim Action */}
              <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
                {claimSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 p-2.5 border border-emerald-200 w-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>Yêu cầu nhận lại đã được gửi đến Phòng Quản sinh. Vui lòng mang thẻ học sinh để đối chiếu.</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-stone-500">
                      Địa điểm nhận: Phòng Quản sinh (Nhà B, Tầng 1)
                    </span>
                    <button
                      onClick={() => {
                        setClaimSuccess(true);
                        if (onItemClaimed) onItemClaimed(modal.data.id);
                      }}
                      className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Tôi Muốn Nhận Lại Đồ
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              REPORT LOST ITEM MODAL ("Báo Mất Đồ")
             ======================================================== */}
          {modal.type === 'reportLost' && (
            <div>
              {reportSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 border-2 border-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 uppercase">
                    Đã Gửi Báo Cáo Mất Đồ Thành Công!
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                    Thông tin vật phẩm đã được chuyển đến Đội Bảo vệ và Đội Thanh niên Tình nguyện trường. Khi có học sinh nhặt được, nhà trường sẽ thông báo tới bạn.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2 bg-[#991B1B] text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Hoàn Tất
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onAddNewLostItem) {
                      onAddNewLostItem({
                        id: `lost-${Date.now()}`,
                        title: reportFormData.itemTitle,
                        itemType: reportFormData.itemType,
                        dateFound: reportFormData.date,
                        locationFound: reportFormData.location || 'Khuôn viên trường',
                        description: `Học sinh ${reportFormData.name} (${reportFormData.studentClass}) báo mất: ${reportFormData.description}. Liên hệ: ${reportFormData.phone}`,
                        finderDepartment: 'Học sinh báo thất lạc',
                        status: 'pending',
                        images: ['VẬT PHẨM BÁO MẤT', 'ẢNH THẺ LIÊN HỆ'],
                      });
                    }
                    setReportSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <p className="text-stone-600">
                    Điền thông tin đồ dùng bạn để quên hoặc đánh rơi trong khuôn viên nhà trường để Ban Quản sinh đối chiếu:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Họ và tên học sinh *
                      </label>
                      <input
                        required
                        type="text"
                        value={reportFormData.name}
                        onChange={(e) => setReportFormData({ ...reportFormData, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full h-9 px-3 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Lớp học *
                      </label>
                      <input
                        required
                        type="text"
                        value={reportFormData.studentClass}
                        onChange={(e) => setReportFormData({ ...reportFormData, studentClass: e.target.value })}
                        placeholder="11 Tin / 10 Toán 1"
                        className="w-full h-9 px-3 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Tên đồ vật thất lạc *
                      </label>
                      <input
                        required
                        type="text"
                        value={reportFormData.itemTitle}
                        onChange={(e) => setReportFormData({ ...reportFormData, itemTitle: e.target.value })}
                        placeholder="Thẻ xe, ví tiền, chìa khóa..."
                        className="w-full h-9 px-3 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        required
                        type="text"
                        value={reportFormData.phone}
                        onChange={(e) => setReportFormData({ ...reportFormData, phone: e.target.value })}
                        placeholder="0912 345 67x"
                        className="w-full h-9 px-3 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Khu vực nghi để quên
                    </label>
                    <input
                      type="text"
                      value={reportFormData.location}
                      onChange={(e) => setReportFormData({ ...reportFormData, location: e.target.value })}
                      placeholder="Phòng học, nhà đa năng, căng tin..."
                      className="w-full h-9 px-3 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Mô tả đặc điểm nhận dạng
                    </label>
                    <textarea
                      rows={3}
                      value={reportFormData.description}
                      onChange={(e) => setReportFormData({ ...reportFormData, description: e.target.value })}
                      placeholder="Màu sắc, kích thước, móc treo đặc biệt..."
                      className="w-full p-2 border border-stone-300 focus:border-[#991B1B] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Báo Cáo</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              TKB (Thời Khóa Biểu) MODAL
             ======================================================== */}
          {modal.type === 'tkb' && (
            <div>
              <div className="p-3 bg-[#FAF8F5] border border-stone-200 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#991B1B] uppercase">
                    ÁP DỤNG TỪ NGÀY 05/09/2026 (NĂM HỌC 2026–2027)
                  </div>
                  <div className="text-[11px] font-mono text-stone-500">
                    Phiên bản 1.2 · Khối Chuyên & Không Chuyên
                  </div>
                </div>
                <button
                  onClick={() => alert('Đang tải tệp PDF Thời Khóa Biểu')}
                  className="px-3 py-1.5 bg-[#991B1B] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Tải TKB
                </button>
              </div>

              {/* Structured Schedule Table */}
              <div className="overflow-x-auto border border-stone-200 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#991B1B] text-white font-bold text-center">
                      <th className="p-2 border border-[#7F1D1D]">Tiết</th>
                      <th className="p-2 border border-[#7F1D1D]">Thời gian</th>
                      <th className="p-2 border border-[#7F1D1D]">Thứ Hai</th>
                      <th className="p-2 border border-[#7F1D1D]">Thứ Ba</th>
                      <th className="p-2 border border-[#7F1D1D]">Thứ Tư</th>
                      <th className="p-2 border border-[#7F1D1D]">Thứ Năm</th>
                      <th className="p-2 border border-[#7F1D1D]">Thứ Sáu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono">
                    <tr className="hover:bg-stone-50 text-center">
                      <td className="p-2 font-bold bg-[#FAF9F6]">Tiết 1</td>
                      <td className="p-2 text-stone-500">07:30 - 08:15</td>
                      <td className="p-2 font-sans font-semibold text-[#991B1B]">Chào Cờ</td>
                      <td className="p-2 font-sans">Toán học</td>
                      <td className="p-2 font-sans">Tin học</td>
                      <td className="p-2 font-sans">Vật lý</td>
                      <td className="p-2 font-sans">Hóa học</td>
                    </tr>
                    <tr className="hover:bg-stone-50 text-center">
                      <td className="p-2 font-bold bg-[#FAF9F6]">Tiết 2</td>
                      <td className="p-2 text-stone-500">08:20 - 09:05</td>
                      <td className="p-2 font-sans">Ngữ văn</td>
                      <td className="p-2 font-sans">Toán học</td>
                      <td className="p-2 font-sans">Tin học</td>
                      <td className="p-2 font-sans">Tiếng Anh</td>
                      <td className="p-2 font-sans">Sinh học</td>
                    </tr>
                    <tr className="hover:bg-stone-50 text-center">
                      <td className="p-2 font-bold bg-[#FAF9F6]">Tiết 3</td>
                      <td className="p-2 text-stone-500">09:20 - 10:05</td>
                      <td className="p-2 font-sans">Ngữ văn</td>
                      <td className="p-2 font-sans">Tiếng Anh</td>
                      <td className="p-2 font-sans">Lịch sử</td>
                      <td className="p-2 font-sans">Địa lý</td>
                      <td className="p-2 font-sans">Tin học</td>
                    </tr>
                    <tr className="hover:bg-stone-50 text-center">
                      <td className="p-2 font-bold bg-[#FAF9F6]">Tiết 4</td>
                      <td className="p-2 text-stone-500">10:10 - 10:55</td>
                      <td className="p-2 font-sans">Vật lý</td>
                      <td className="p-2 font-sans">Hóa học</td>
                      <td className="p-2 font-sans">Thể dục</td>
                      <td className="p-2 font-sans">GDQP-AN</td>
                      <td className="p-2 font-sans font-semibold text-[#991B1B]">Sinh hoạt lớp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              CALENDAR (Lịch Làm Việc) MODAL
             ======================================================== */}
          {modal.type === 'calendar' && (
            <div>
              <div className="p-3 bg-[#FAF8F5] border border-stone-200 mb-4">
                <div className="text-xs font-bold text-[#991B1B] uppercase">
                  LỊCH CÔNG TÁC TUẦN 02 (TỪ 05/09/2026 ĐẾN 11/09/2026)
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Phê duyệt bởi: Hiệu trưởng nhà trường
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="border border-stone-200 p-3 bg-white">
                  <div className="font-bold text-[#991B1B] font-mono text-xs">
                    THỨ HAI (05/09/2026)
                  </div>
                  <div className="mt-1 font-semibold text-stone-800">
                    07:00 - 09:30: Lễ Khai giảng năm học mới 2026–2027 (Toàn trường)
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    14:00: Ban Giám hiệu họp giao ban đầu năm với các Tổ trưởng chuyên môn tại Phòng Hội đồng.
                  </div>
                </div>

                <div className="border border-stone-200 p-3 bg-white">
                  <div className="font-bold text-[#991B1B] font-mono text-xs">
                    THỨ BA (06/09/2026)
                  </div>
                  <div className="mt-1 font-semibold text-stone-800">
                    08:00: Tập huấn công tác khảo thí ma trận đề thi HSG Cụm Gia Lâm - Long Biên.
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    Chủ trì: Phó Hiệu trưởng phụ trách chuyên môn. Địa điểm: Hội trường tầng 2.
                  </div>
                </div>

                <div className="border border-stone-200 p-3 bg-white">
                  <div className="font-bold text-[#991B1B] font-mono text-xs">
                    THỨ NĂM (08/09/2026)
                  </div>
                  <div className="mt-1 font-semibold text-stone-800">
                    14:30: Tiếp đoàn chuyên gia giáo dục Quốc tế trao đổi chương trình học bổng du học.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
