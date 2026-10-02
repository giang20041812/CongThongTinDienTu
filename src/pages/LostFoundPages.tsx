import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, MapPin, CheckCircle, AlertCircle, Phone, Calendar, User, ShieldCheck } from 'lucide-react';
import { ALL_LOST_ITEMS, SCHOOL_INFO } from '../data/mockData';
import { LostItem } from '../types';
import { EduImageFrame } from '../components/EduImageFrame';
import { BackgroundGeometricMesh } from '../components/BackgroundGeometricMesh';

interface LostFoundListPageProps {
  onSelectLostItem: (id: string) => void;
  onOpenReportModal: () => void;
  onGoHome: () => void;
}

export const LostFoundListPage: React.FC<LostFoundListPageProps> = ({
  onSelectLostItem,
  onOpenReportModal,
  onGoHome,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = ALL_LOST_ITEMS.filter((item) => {
    const matchesStatus = filterType === 'all' || item.status === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="grid" className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#6b82b8] mb-6">
          <button onClick={onGoHome} className="hover:text-[#003087] transition-colors cursor-pointer">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#003087] font-bold">Góc Thất Lạc</span>
        </nav>

        {/* Page Header */}
        <div className="border-b-2 border-[#003087] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#003087] font-bold flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              BỘ PHẬN HỖ TRỢ HỌC ĐƯỜNG & QUẢN SINH
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1a2744] tracking-tight uppercase mt-1">
              Góc Thất Lạc & Tìm Đồ Rơi
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng Báo Mất Đồ</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border-2 border-[#003087] p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono font-bold text-[#1a2744] uppercase">Trạng thái:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'all'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-[#1a2744] border-[#c5d3ec] hover:border-[#9aabd4]'
                }`}
              >
                Tất cả ({ALL_LOST_ITEMS.length})
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'pending'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-[#1a2744] border-[#c5d3ec] hover:border-[#9aabd4]'
                }`}
              >
                Chưa nhận
              </button>
              <button
                onClick={() => setFilterType('claimed')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'claimed'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-[#1a2744] border-[#c5d3ec] hover:border-[#9aabd4]'
                }`}
              >
                Đã nhận lại
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm đồ đánh rơi, địa điểm..."
              className="w-full h-9 pl-3 pr-9 text-xs bg-white border border-[#c5d3ec] focus:border-[#003087] focus:outline-none"
            />
            <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-[#9aabd4]" />
          </div>
        </div>

        {/* Grid of Lost Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectLostItem(item.id)}
              className="group cursor-pointer border border-[#d1ddf5] bg-white hover:border-[#003087] transition-all p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#6b82b8] uppercase">
                    Loại: {item.itemType}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                      item.status === 'claimed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-[#e8eef8] text-[#003087] border-[#c5d3ec]'
                    }`}
                  >
                    {item.status === 'claimed' ? 'ĐÃ NHẬN LẠI' : 'CHƯA NHẬN'}
                  </span>
                </div>

                <h3 className="relative z-10 block bg-white text-sm font-bold text-[#1a2744] group-hover:text-[#003087] transition-colors uppercase leading-snug">
                  {item.title}
                </h3>

                {/* TWO COMPACT PHOTO SLOTS */}
                <div className="relative z-0 isolate grid grid-cols-2 gap-2 mt-3">
                  <div className="h-16">
                    <EduImageFrame
                      label="ẢNH ĐỒ 1"
                      subLabel={item.images[0]}
                      theme="lost"
                      aspectRatio="compact"
                      compact={true}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="h-16">
                    <EduImageFrame
                      label="ẢNH ĐỒ 2"
                      subLabel={item.images[1]}
                      theme="lost"
                      aspectRatio="compact"
                      compact={true}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-[#4a5f8a] line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#e8eef8] flex items-center justify-between text-[11px] font-mono text-[#6b82b8]">
                <span className="flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="w-3 h-3 text-[#003087] shrink-0" />
                  <span className="truncate">{item.locationFound}</span>
                </span>
                <span className="text-[#003087] font-bold group-hover:underline">
                  Chi tiết →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LostItemDetailPageProps {
  lostItemId: string;
  onBack: () => void;
}

export const LostItemDetailPage: React.FC<LostItemDetailPageProps> = ({
  lostItemId,
  onBack,
}) => {
  const item = ALL_LOST_ITEMS.find((i) => i.id === lostItemId) || ALL_LOST_ITEMS[0];
  const [claimSent, setClaimSent] = useState(false);

  return (
    <div className="w-full bg-[#f5f7fc] min-h-screen py-8 sm:py-12 relative">
      <BackgroundGeometricMesh variant="schematic" className="opacity-40" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5d3ec] hover:border-[#003087] text-[#003087] text-xs font-bold uppercase transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách đồ thất lạc</span>
          </button>
        </div>

        <div className="bg-white border-2 border-[#003087] p-6 sm:p-8 shadow-md">
          <div className="flex items-center justify-between border-b border-[#d1ddf5] pb-3 text-xs font-mono">
            <span className="text-[#6b82b8]">Mã vật phẩm: #{item.id}</span>
            <span
              className={`font-bold px-2 py-0.5 border ${
                item.status === 'claimed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-[#e8eef8] text-[#003087] border-[#c5d3ec]'
              }`}
            >
              {item.status === 'claimed' ? 'ĐÃ NHẬN LẠI' : 'CHƯA NHẬN'}
            </span>
          </div>

          <h1 className="relative z-10 block text-xl sm:text-2xl font-extrabold text-[#1a2744] uppercase tracking-tight leading-tight mt-3">
            {item.title}
          </h1>

          {/* TWO SQUARE PHOTO SLOTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <EduImageFrame
              label="ẢNH ĐỒ 1"
              subLabel={item.images[0]}
              theme="lost"
              aspectRatio="4:3"
            />
            <EduImageFrame
              label="ẢNH ĐỒ 2"
              subLabel={item.images[1]}
              theme="lost"
              aspectRatio="4:3"
            />
          </div>

          {/* Description & Verification Info */}
          <div className="bg-[#f5f7fc] border border-[#d1ddf5] p-4 space-y-2 text-xs sm:text-sm text-[#1a2744]">
            <div>
              <span className="font-bold text-[#001a52]">Vị trí phát hiện: </span>
              <span>{item.locationFound}</span>
            </div>
            <div>
              <span className="font-bold text-[#001a52]">Thời gian nhặt được: </span>
              <span>{item.dateFound}</span>
            </div>
            <div>
              <span className="font-bold text-[#001a52]">Đơn vị tiếp nhận & lưu trữ: </span>
              <span className="text-[#003087] font-semibold">{item.finderDepartment}</span>
            </div>
            <div>
              <span className="font-bold text-[#001a52]">Mô tả chi tiết: </span>
              <p className="mt-1 leading-relaxed text-[#1a2744]">{item.description}</p>
            </div>
          </div>

          {/* Claim Action Box */}
          <div className="mt-8 pt-6 border-t border-[#d1ddf5]">
            {claimSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-xs sm:text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Yêu cầu nhận lại đồ đã được gửi tới Phòng Quản sinh. Vui lòng mang theo Thẻ Học Sinh đến Nhà B Tầng 1 để nhận lại.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-[#6b82b8] font-mono">
                  Địa điểm nhận lại: <strong>Phòng Quản sinh (Nhà B, Tầng 1)</strong>
                </div>
                <button
                  onClick={() => setClaimSent(true)}
                  className="px-5 py-2.5 bg-[#003087] hover:bg-[#001a52] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Gửi Yêu Cầu Nhận Lại Đồ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
