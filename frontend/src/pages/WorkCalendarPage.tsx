import React, { useState } from 'react';
import { useSchedules } from '../api';
import { ArrowLeft, Calendar, Clock, MapPin, User, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface WorkCalendarPageProps {
  onGoHome: () => void;
}

export const WorkCalendarPage: React.FC<WorkCalendarPageProps> = ({ onGoHome }) => {
  const [selectedWeek, setSelectedWeek] = useState(2);

  const { data: schedules, loading } = useSchedules();

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const workEvents = [1, 2, 3, 4, 5].map(dayOffset => {
    const dayNames = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    const currentDaySchedules = schedules.filter((s: any) => new Date(s.startTime).getDay() === dayOffset);
    
    let morning = { time: '08:00 - 11:30', title: 'Không có lịch công tác', chair: '-', location: '-', attendees: '-' };
    let afternoon = { time: '14:00 - 17:00', title: 'Không có lịch công tác', chair: '-', location: '-', attendees: '-' };

    currentDaySchedules.forEach((s: any) => {
       const dateObj = new Date(s.startTime);
       const hour = dateObj.getHours();
       const eventData = {
         time: `${hour.toString().padStart(2, '0')}:00 - ${new Date(s.endTime).getHours().toString().padStart(2, '0')}:00`,
         title: s.title,
         chair: s.relatedUser?.username || 'Ban Giám Hiệu',
         location: s.location || 'Phòng họp',
         attendees: s.description || 'Tất cả'
       };
       if (hour < 12) morning = eventData;
       else afternoon = eventData;
    });

    return {
      day: dayNames[dayOffset],
      date: `0${dayOffset + 4}/09/2026`,
      morning,
      afternoon
    };
  });

  return (
    <div className="w-full bg-[#F3F3F3] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
          <button onClick={onGoHome} className="hover:text-[#0875B1] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#0875B1] font-bold">Lịch Làm Việc</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#0B78B5] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#0875B1] font-bold flex items-center gap-1.5">
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
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Lịch Tuần</span>
            </button>
            <button
              onClick={() => alert('Đang tải tệp PDF Lịch Công Tác Tuần')}
              className="px-4 py-2 bg-[#0B78B5] hover:bg-[#075F91] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải PDF</span>
            </button>
          </div>
        </div>

        {/* Week Selector Bar */}
        <div className="bg-white border-2 border-[#0B78B5] p-4 mb-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              className="w-8 h-8 border border-stone-300 hover:border-[#0B78B5] hover:bg-[#EAF3F8] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold uppercase font-mono text-[#0875B1]">
              Tuần 0{selectedWeek} (Năm học 2026–2027)
            </span>
            <button
              onClick={() => setSelectedWeek(Math.min(36, selectedWeek + 1))}
              className="w-8 h-8 border border-stone-300 hover:border-[#0B78B5] hover:bg-[#EAF3F8] flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono text-black">
            Trực tuần: <span className="font-bold text-black">Hiệu phó Chuyên môn & Tổ Toán</span>
          </div>
        </div>

        {/* Days Work Events List */}
        <div className="space-y-6">
          {workEvents.map((item) => (
            <div
              key={item.day}
              className="border-2 border-[#B8D3E2] bg-white shadow-xs hover:border-[#0B78B5] transition-colors overflow-hidden"
            >
              {/* Day Header */}
              <div className="bg-[#EAF3F8] border-b border-[#B8D3E2] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-extrabold text-[#0875B1] uppercase font-mono">
                    {item.day}
                  </span>
                  <span className="text-xs font-mono text-black bg-white px-2 py-0.5 border border-stone-300">
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Day Content: Morning & Afternoon */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-xs sm:text-sm">
                
                {/* Morning Session */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EAF3F8] text-[#0875B1] font-bold font-mono px-2 py-0.5 border border-[#9DC5D8] text-[11px] uppercase">
                      BUỔI SÁNG ({item.morning.time})
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {item.morning.title}
                  </h3>

                  <div className="space-y-1 text-black text-xs pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0B78B5] shrink-0" />
                      <span>Chủ trì: <strong className="text-black">{item.morning.chair}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B78B5] shrink-0" />
                      <span>Địa điểm: <strong className="text-black">{item.morning.location}</strong></span>
                    </div>
                    <div className="text-black pt-0.5 font-sans">
                      Thành phần: {item.morning.attendees}
                    </div>
                  </div>
                </div>

                {/* Afternoon Session */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EAF3F8] text-[#0875B1] font-bold font-mono px-2 py-0.5 border border-[#9DC5D8] text-[11px] uppercase">
                      BUỔI CHIỀU ({item.afternoon.time})
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {item.afternoon.title}
                  </h3>

                  <div className="space-y-1 text-black text-xs pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0B78B5] shrink-0" />
                      <span>Chủ trì: <strong className="text-black">{item.afternoon.chair}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B78B5] shrink-0" />
                      <span>Địa điểm: <strong className="text-black">{item.afternoon.location}</strong></span>
                    </div>
                    <div className="text-black pt-0.5 font-sans">
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
