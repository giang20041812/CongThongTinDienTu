import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, MapPin, CheckCircle, AlertCircle, Phone, Calendar, User, ShieldCheck } from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { LostItem } from '../types';
import { useLostItems } from '../api';
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

  const { data: lostItemsRaw, loading } = useLostItems();

  const lostItems = lostItemsRaw.map((d: any) => ({
    id: d.id,
    title: d.itemName,
    description: d.description,
    locationFound: d.location || 'Khu vực trường',
    dateFound: new Date(d.createdAt).toLocaleDateString('vi-VN'),
    status: d.status === 'RETURNED' ? 'claimed' : 'pending',
    itemType: 'Khác',
    finderDepartment: d.contactInfo || 'Phòng Quản sinh',
    images: [d.imageUrl, d.imageUrl] // using the same image twice for mock
  }));

  const filteredItems = lostItems.filter((item: any) => {
    const matchesStatus = filterType === 'all' || item.status === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (filter: string) => {
    setFilterType(filter);
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-black mb-6">
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
            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight uppercase mt-1">
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
            <span className="text-xs font-mono font-bold text-black uppercase">Trạng thái:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'all'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-black border-[#c5d3ec] hover:border-[#9aabd4]'
                }`}
              >
                Tất cả ({lostItems.length})
              </button>
              <button
                onClick={() => handleFilterChange('pending')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'pending'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-black border-[#c5d3ec] hover:border-[#9aabd4]'
                }`}
              >
                Chưa nhận
              </button>
              <button
                onClick={() => handleFilterChange('claimed')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
                  filterType === 'claimed'
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-black border-[#c5d3ec] hover:border-[#9aabd4]'
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
              onChange={handleSearchChange}
              placeholder="Tìm đồ đánh rơi, địa điểm..."
              className="w-full h-9 pl-3 pr-9 text-xs bg-white border border-[#c5d3ec] focus:border-[#003087] focus:outline-none"
            />
            <Search className="absolute right-2.5 top-2.5 w-4 h-4 text-black" />
          </div>
        </div>

        {/* Grid of Lost Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item: any) => (
            <div
              key={item.id}
              onClick={() => onSelectLostItem(item.id)}
              className="group cursor-pointer border border-[#d1ddf5] bg-white hover:border-[#003087] transition-all p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-black uppercase">
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

                <h3 className="relative z-10 block text-sm font-bold text-black group-hover:text-[#003087] group-hover:underline transition-colors uppercase leading-snug">
                  {item.title}
                </h3>

                {/* PHOTOS */}
                <div className="relative z-0 isolate mt-3 w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                      <EduImageFrame
                        label="ẢNH ĐỒ 1"
                        subLabel={item.images[0] || 'Hình ảnh'}
                        theme="lost"
                        aspectRatio="compact"
                        compact={true}
                        className="h-full w-full"
                      />
                      <EduImageFrame
                        label="ẢNH ĐỒ 2"
                        subLabel={item.images[1] || 'Hình ảnh'}
                        theme="lost"
                        aspectRatio="compact"
                        compact={true}
                        className="h-full w-full"
                      />
                    </div>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-black line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#e8eef8] flex items-center justify-between text-[11px] font-mono text-black">
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

interface LostItemDetailPageProps {
  lostItemId: string;
  onBack: () => void;
}

export const LostItemDetailPage: React.FC<LostItemDetailPageProps> = ({
  lostItemId,
  onBack,
}) => {
  const { data: lostItemsRaw, loading } = useLostItems();
  const [claimSent, setClaimSent] = useState(false);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  const rawItem = lostItemsRaw.find((i: any) => i.id === lostItemId) || lostItemsRaw[0];
  const item = rawItem ? {
    id: rawItem.id,
    title: rawItem.itemName,
    description: rawItem.description,
    locationFound: rawItem.location || 'Khu vực trường',
    dateFound: new Date(rawItem.createdAt).toLocaleDateString('vi-VN'),
    status: rawItem.status === 'RETURNED' ? 'claimed' : 'pending',
    itemType: 'Khác',
    finderDepartment: rawItem.contactInfo || 'Phòng Quản sinh',
    images: [rawItem.imageUrl, rawItem.imageUrl]
  } : {
    id: '', title: '', description: '', locationFound: '', dateFound: '', status: '', images: ['', ''], finderDepartment: ''
  };

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
            <span className="text-black">Mã vật phẩm: #{item.id}</span>
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

          <h1 className="relative z-10 block text-xl sm:text-2xl font-extrabold text-black uppercase tracking-tight leading-tight mt-3">
            {item.title}
          </h1>

          {/* PHOTOS */}
          <div className="my-6 w-full h-64 sm:h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
            {item.images[0] ? (
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full p-4">
                <EduImageFrame
                  label="ẢNH ĐỒ 1"
                  subLabel={item.images[0] || 'Hình ảnh'}
                  theme="lost"
                  aspectRatio="4:3"
                />
                <EduImageFrame
                  label="ẢNH ĐỒ 2"
                  subLabel={item.images[1] || 'Hình ảnh'}
                  theme="lost"
                  aspectRatio="4:3"
                />
              </div>
            )}
          </div>

          {/* Description & Verification Info */}
          <div className="bg-[#f5f7fc] border border-[#d1ddf5] p-4 space-y-2 text-xs sm:text-sm text-black">
            <div>
              <span className="font-bold text-black">Vị trí phát hiện: </span>
              <span>{item.locationFound}</span>
            </div>
            <div>
              <span className="font-bold text-black">Thời gian nhặt được: </span>
              <span>{item.dateFound}</span>
            </div>
            <div>
              <span className="font-bold text-black">Đơn vị tiếp nhận & lưu trữ: </span>
              <span className="text-[#003087] font-semibold">{item.finderDepartment}</span>
            </div>
            <div>
              <span className="font-bold text-black">Mô tả chi tiết: </span>
              <p className="mt-1 leading-relaxed text-black">{item.description}</p>
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
                <div className="text-xs text-black font-mono">
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
