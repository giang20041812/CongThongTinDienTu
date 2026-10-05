import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Download, Printer, Filter, CheckCircle } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';
import { useSchedules } from '../api';

interface SchedulePageProps {
  onGoHome: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onGoHome }) => {
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12'>('10');
  const [selectedClass, setSelectedClass] = useState<string>('10 Tin');

  const classesByGrade: Record<string, string[]> = {
    '10': ['10 Tin', '10 Toán 1', '10 Toán 2', '10 Lý', '10 Hóa', '10 Anh 1', '10 Song Bằng'],
    '11': ['11 Tin', '11 Toán 1', '11 Toán 2', '11 Lý', '11 Anh 1', '11 Văn'],
    '12': ['12 Tin', '12 Toán 1', '12 Toán 2', '12 Lý', '12 Hóa', '12 Anh 1'],
  };

  const { data: dbSchedules, loading } = useSchedules();

  const scheduleData = dbSchedules && dbSchedules.length > 0 ? [
    { period: 'Tiết 1', time: '07:30 - 08:15', mon: dbSchedules[0]?.className || 'Chào Cờ', tue: 'Toán học', wed: 'Tin học', thu: 'Vật lý', fri: 'Hóa học' },
    { period: 'Tiết 2', time: '08:20 - 09:05', mon: 'Ngữ văn', tue: 'Toán học', wed: 'Tin học', thu: 'Tiếng Anh', fri: 'Sinh học' },
    { period: 'Tiết 3', time: '09:20 - 10:05', mon: 'Ngữ văn', tue: 'Tiếng Anh', wed: 'Lịch sử', thu: 'Địa lý', fri: 'Tin học' },
    { period: 'Tiết 4', time: '10:10 - 10:55', mon: 'Vật lý', tue: 'Hóa học', wed: 'Thể dục', thu: 'GDQP-AN', fri: 'Toán học' },
    { period: 'Tiết 5', time: '11:00 - 11:45', mon: 'Tin học', tue: 'GDCD', wed: 'Công nghệ', thu: 'Tiếng Anh', fri: 'Sinh hoạt lớp' },
  ] : [
    { period: 'Tiết 1', time: '07:30 - 08:15', mon: 'Chào Cờ', tue: 'Toán học', wed: 'Tin học', thu: 'Vật lý', fri: 'Hóa học' },
    { period: 'Tiết 2', time: '08:20 - 09:05', mon: 'Ngữ văn', tue: 'Toán học', wed: 'Tin học', thu: 'Tiếng Anh', fri: 'Sinh học' },
    { period: 'Tiết 3', time: '09:20 - 10:05', mon: 'Ngữ văn', tue: 'Tiếng Anh', wed: 'Lịch sử', thu: 'Địa lý', fri: 'Tin học' },
    { period: 'Tiết 4', time: '10:10 - 10:55', mon: 'Vật lý', tue: 'Hóa học', wed: 'Thể dục', thu: 'GDQP-AN', fri: 'Toán học' },
    { period: 'Tiết 5', time: '11:00 - 11:45', mon: 'Tin học', tue: 'GDCD', wed: 'Công nghệ', thu: 'Tiếng Anh', fri: 'Sinh hoạt lớp' },
  ];

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

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
          <span className="text-[#0875B1] font-bold">Thời Khóa Biểu</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#0052cc] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#0875B1] font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              LỊCH HỌC TẬP VÀ GIẢNG DẠY CHÍNH KHÓA
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight uppercase mt-1">
              Thời Khóa Biểu Học Kỳ I (2026–2027)
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In TKB</span>
            </button>
            <button
              onClick={() => alert(`Đang tải tệp PDF Thời Khóa Biểu lớp ${selectedClass}`)}
              className="px-4 py-2 bg-[#0052cc] hover:bg-[#0026e6] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải PDF TKB</span>
            </button>
          </div>
        </div>

        {/* Filters: Grade & Class */}
        <div className="bg-white border-2 border-[#0052cc] p-5 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Grade Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-black font-mono">Khối:</span>
              <div className="flex gap-1">
                {(['10', '11', '12'] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade);
                      setSelectedClass(classesByGrade[grade][0]);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                      selectedGrade === grade
                        ? 'bg-[#0052cc] text-white border-[#0052cc]'
                        : 'bg-stone-50 text-black border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    Khối {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase text-black font-mono">Lớp:</span>
              <div className="flex flex-wrap gap-1">
                {classesByGrade[selectedGrade].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                      selectedClass === cls
                        ? 'bg-[#0875B1] text-white border-[#0875B1]'
                        : 'bg-white text-black border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-black">
            <div>
              Đang xem lịch lớp: <span className="font-bold text-[#0875B1]">{selectedClass}</span> · Phòng học: <span className="font-bold text-black">Nhà A - Phòng 302</span>
            </div>
            <div>Giáo viên chủ nhiệm: <span className="font-bold text-black">ThS. Hoàng Văn Tuấn</span></div>
          </div>
        </div>

        {/* Timetable Schedule Grid */}
        <div className="bg-white border-2 border-[#0052cc] shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#0052cc] text-white font-bold text-center border-b border-[#0026e6]">
                <th className="p-3 border-r border-[#0026e6] w-20">Tiết</th>
                <th className="p-3 border-r border-[#0026e6] w-32">Thời gian</th>
                <th className="p-3 border-r border-[#0026e6]">Thứ Hai</th>
                <th className="p-3 border-r border-[#0026e6]">Thứ Ba</th>
                <th className="p-3 border-r border-[#0026e6]">Thứ Tư</th>
                <th className="p-3 border-r border-[#0026e6]">Thứ Năm</th>
                <th className="p-3">Thứ Sáu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono text-center">
              {scheduleData.map((row) => (
                <tr key={row.period} className="hover:bg-[#F3F3F3] transition-colors">
                  <td className="p-3.5 font-bold bg-[#EAF3F8] border-r border-[#B8D3E2] text-[#0875B1]">
                    {row.period}
                  </td>
                  <td className="p-3.5 border-r border-stone-200 text-black text-xs">
                    {row.time}
                  </td>
                  <td className="p-3.5 border-r border-stone-200 font-sans font-semibold text-stone-900">
                    <span className={row.mon === 'Chào Cờ' ? 'text-[#0875B1] font-bold' : ''}>{row.mon}</span>
                  </td>
                  <td className="p-3.5 border-r border-stone-200 font-sans font-semibold text-stone-900">
                    {row.tue}
                  </td>
                  <td className="p-3.5 border-r border-stone-200 font-sans font-semibold text-stone-900">
                    {row.wed}
                  </td>
                  <td className="p-3.5 border-r border-stone-200 font-sans font-semibold text-stone-900">
                    {row.thu}
                  </td>
                  <td className="p-3.5 font-sans font-semibold text-stone-900">
                    <span className={row.fri === 'Sinh hoạt lớp' ? 'text-[#0875B1] font-bold' : ''}>{row.fri}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Footnotes */}
        <div className="mt-6 p-4 bg-white border border-stone-200 text-xs text-black space-y-1 font-mono">
          <div>* Tiết học buổi sáng bắt đầu từ 07:30, học sinh có mặt trước giờ truy bài 15 phút.</div>
          <div>* Các buổi học thực hành Tin học diễn ra tại Phòng máy Lab 1 & 2 tầng 3 nhà A.</div>
          <div>* Giờ thể dục và giáo dục quốc phòng tập trung tại Sân vận động đa năng khu B.</div>
        </div>
      </div>
    </div>
  );
};
