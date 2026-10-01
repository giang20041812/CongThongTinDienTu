import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, User, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface WorkCalendarPageProps {
  onGoHome: () => void;
}

export const WorkCalendarPage: React.FC<WorkCalendarPageProps> = ({ onGoHome }) => {
  const [selectedWeek, setSelectedWeek] = useState(2);

  const workEvents = [
    {
      day: 'THỨ HAI',
      date: '05/09/2026',
      morning: {
        time: '07:00 - 09:30',
        title: 'Lễ Khai giảng năm học mới 2026–2027',
        chair: 'Ban Giám Hiệu & Hội đồng Sư phạm',
        location: 'Sân vận động trung tâm',
        attendees: 'Toàn thể cán bộ, giáo viên và học sinh các khối',
      },
      afternoon: {
        time: '14:00 - 16:30',
        title: 'Họp giao ban đầu năm với Tổ trưởng chuyên môn',
        chair: 'Hiệu trưởng',
        location: 'Phòng Hội đồng tầng 2',
        attendees: 'BGH, Bí thư Đoàn trường, 12 Tổ trưởng chuyên môn',
      },
    },
    {
      day: 'THỨ BA',
      date: '06/09/2026',
      morning: {
        time: '08:00 - 11:00',
        title: 'Tập huấn ma trận đề thi HSG Cụm Gia Lâm - Long Biên',
        chair: 'Phó Hiệu trưởng phụ trách chuyên môn',
        location: 'Hội trường Nhà Đa năng',
        attendees: 'Giáo viên bộ môn Toán, Tin học, Ngoại ngữ',
      },
      afternoon: {
        time: '14:30 - 17:00',
        title: 'Kiểm tra cơ sở vật chất phòng thí nghiệm STEM',
        chair: 'Tổ Quản trị Thiết bị',
        location: 'Tầng 3 Nhà A',
        attendees: 'Tổ Lý, Hóa, Sinh, Tin',
      },
    },
    {
      day: 'THỨ TƯ',
      date: '07/09/2026',
      morning: {
        time: '07:30 - 11:30',
        title: 'Dự giờ thao giảng chuyên đề Toán học ứng dụng',
        chair: 'Tổ trưởng Tổ Toán',
        location: 'Lớp 11 Tin, Phòng 302 Nhà A',
        attendees: 'Giáo viên Toán khối THPT',
      },
      afternoon: {
        time: '15:00 - 17:00',
        title: 'Ban Chấp hành Đoàn trường triển khai hoạt động các CLB',
        chair: 'Bí thư Đoàn trường',
        location: 'Văn phòng Đoàn TNCS',
        attendees: 'Chủ nhiệm 28 Câu lạc bộ học sinh',
      },
    },
    {
      day: 'THỨ NĂM',
      date: '08/09/2026',
      morning: {
        time: '08:30 - 11:30',
        title: 'Tiếp đoàn Chuyên gia Giáo dục Quốc tế (Đại học Cambridge)',
        chair: 'Hiệu trưởng & Tổ Đối ngoại',
        location: 'Phòng Khách đối ngoại Nhà Hiệu bộ',
        attendees: 'Ban Giám hiệu, Giáo viên phụ trách Song bằng',
      },
      afternoon: {
        time: '14:00 - 16:30',
        title: 'Tập huấn kỹ năng PCCC và an toàn trường học',
        chair: 'Công an Quận & Văn phòng trường',
        location: 'Sân trước Nhà B',
        attendees: 'Tổ Bảo vệ, cán bộ bán trú và đại diện học sinh',
      },
    },
    {
      day: 'THỨ SÁU',
      date: '09/09/2026',
      morning: {
        time: '07:30 - 11:30',
        title: 'Kiểm tra nền nếp học tập và hồ sơ giáo án tuần 1',
        chair: 'Ban Thanh tra Nhân dân',
        location: 'Văn phòng chuyên môn',
        attendees: 'Ban Giám hiệu và Ban Thanh tra',
      },
      afternoon: {
        time: '16:00 - 17:30',
        title: 'Tổng kết công tác tuần 02 và định hướng tuần 03',
        chair: 'Hiệu trưởng',
        location: 'Phòng Hội đồng',
        attendees: 'Cán bộ chủ chốt nhà trường',
      },
    },
  ];

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
          <span className="text-[#991B1B] font-bold">Lịch Làm Việc</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#991B1B] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#991B1B] font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              LỊCH CÔNG TÁC TUẦN CỦA BAN GIÁM HIỆU & CÁC TỔ CHUYÊN MÔN
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
              Lịch Làm Việc Tuần 0{selectedWeek} (05/09 – 11/09/2026)
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Lịch Tuần</span>
            </button>
            <button
              onClick={() => alert('Đang tải tệp PDF Lịch Công Tác Tuần')}
              className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải PDF</span>
            </button>
          </div>
        </div>

        {/* Week Selector Bar */}
        <div className="bg-white border-2 border-[#991B1B] p-4 mb-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              className="w-8 h-8 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold uppercase font-mono text-[#991B1B]">
              Tuần 0{selectedWeek} (Năm học 2026–2027)
            </span>
            <button
              onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))}
              className="w-8 h-8 border border-stone-300 hover:border-[#991B1B] hover:bg-[#FEF2F2] flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono text-stone-500">
            Trực tuần: <span className="font-bold text-stone-800">Hiệu phó Chuyên môn & Tổ Toán</span>
          </div>
        </div>

        {/* Days Work Events List */}
        <div className="space-y-6">
          {workEvents.map((item) => (
            <div
              key={item.day}
              className="border-2 border-[#E2DDD3] bg-white shadow-xs hover:border-[#991B1B] transition-colors overflow-hidden"
            >
              {/* Day Header */}
              <div className="bg-[#FAF8F5] border-b border-stone-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-extrabold text-[#991B1B] uppercase font-mono">
                    {item.day}
                  </span>
                  <span className="text-xs font-mono text-stone-500 bg-white px-2 py-0.5 border border-stone-300">
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Day Content: Morning & Afternoon */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-xs sm:text-sm">
                
                {/* Morning Session */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FEF2F2] text-[#991B1B] font-bold font-mono px-2 py-0.5 border border-[#FCA5A5]/40 text-[11px] uppercase">
                      BUỔI SÁNG ({item.morning.time})
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {item.morning.title}
                  </h3>

                  <div className="space-y-1 text-stone-600 text-xs pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      <span>Chủ trì: <strong className="text-stone-800">{item.morning.chair}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      <span>Địa điểm: <strong className="text-stone-800">{item.morning.location}</strong></span>
                    </div>
                    <div className="text-stone-500 pt-0.5 font-sans">
                      Thành phần: {item.morning.attendees}
                    </div>
                  </div>
                </div>

                {/* Afternoon Session */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-100 text-stone-800 font-bold font-mono px-2 py-0.5 border border-stone-300 text-[11px] uppercase">
                      BUỔI CHIỀU ({item.afternoon.time})
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {item.afternoon.title}
                  </h3>

                  <div className="space-y-1 text-stone-600 text-xs pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      <span>Chủ trì: <strong className="text-stone-800">{item.afternoon.chair}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      <span>Địa điểm: <strong className="text-stone-800">{item.afternoon.location}</strong></span>
                    </div>
                    <div className="text-stone-500 pt-0.5 font-sans">
                      Thành phần: {item.afternoon.attendees}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
