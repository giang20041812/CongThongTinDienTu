import React, { useState, useEffect } from 'react';
import { PageHeading, Toolbar, SearchBox, DataTable, StatusPill, Pagination } from './components/UI';
import { Plus, X, Check } from 'lucide-react';
import { useAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api';

function AnnouncementForm({ post, onClose, onSave }: any) {
  const [title, setTitle] = useState(post?.title || '');
  const [department, setDepartment] = useState(post?.department || '');
  const [content, setContent] = useState(post?.content || '');
  const [isImportant, setIsImportant] = useState(post?.isImportant || false);

  const handleSubmit = () => {
    onSave({ title, department, content, isImportant, status: 'Đã đăng' });
  };

  return <div className="bg-white border border-[#c8ddeb] p-5 mb-4 shadow-sm">
    <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold">{post ? 'Sửa thông báo' : 'Tạo thông báo mới'}</h3><button onClick={onClose}><X size={18} className="text-[#8495a6]" /></button></div>
    <div className="grid gap-4">
      <label className="block"><span className="label-admin">Tiêu đề thông báo</span><input value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="Nhập tiêu đề" /></label>
      <label className="block"><span className="label-admin">Đơn vị phát hành</span><input value={department} onChange={e => setDepartment(e.target.value)} className="admin-input" placeholder="VD: Ban Giám Hiệu" /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} /><span>Đánh dấu là quan trọng</span></label>
      <label className="block"><span className="label-admin">Nội dung thông báo</span><textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input min-h-24" placeholder="Nhập nội dung" /></label>
    </div>
    <div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="admin-secondary">Hủy</button><button onClick={handleSubmit} className="admin-primary"><Check size={15} /> Lưu thông báo</button></div>
  </div>;
}

export function AnnouncementSection({ notify }: { notify: (msg: string, type?: 'success' | 'error') => void }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: items, totalPages, loading, refetch } = useAnnouncements(currentPage - 1, ITEMS_PER_PAGE, undefined, query);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const handleSave = async (formData: any) => {
    try {
      if (editingItem) {
        await updateAnnouncement(editingItem.id, formData);
        notify('Đã cập nhật thông báo');
      } else {
        await createAnnouncement(formData);
        notify('Đã tạo thông báo mới');
      }
      setShowForm(false);
      setEditingItem(null);
      refetch();
    } catch (e) {
      notify('Lỗi khi lưu thông báo', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await deleteAnnouncement(id);
        notify('Đã xóa thông báo');
        refetch();
      } catch (e) {
        notify('Lỗi khi xóa thông báo', 'error');
      }
    }
  };

  const handleToggle = async (item: any) => {
    try {
      await updateAnnouncement(item.id, { ...item, status: item.status === 'Đã đăng' ? 'Bản nháp' : 'Đã đăng' });
      notify('Đã cập nhật trạng thái thông báo');
      refetch();
    } catch (e) {
      notify('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  return <><PageHeading eyebrow="Thông tin điều hành" title="Quản lý thông báo" description="Đăng tải thông báo quan trọng đến học sinh, phụ huynh và giáo viên." action={<button onClick={() => { setEditingItem(null); setShowForm(!showForm); }} className="admin-primary"><Plus size={16} /> Tạo thông báo</button>} />{showForm ? <AnnouncementForm post={editingItem} onClose={() => { setShowForm(false); setEditingItem(null); }} onSave={handleSave} /> : <><Toolbar><p className="text-xs text-[#71849b]">Trang {currentPage}</p><SearchBox value={query} onChange={setQuery} placeholder="Tìm thông báo..." /></Toolbar>{loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <><DataTable headers={['Thông báo', 'Đơn vị', 'Ngày tạo', 'Trạng thái', 'Quan trọng', 'Hành động']} rows={items.map((item: any) => [<div key={`t-${item.id}`}><p className="font-bold text-sm">{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">Mã: {item.id ? item.id.substring(0,8) : ''}</p></div>, <span key={`d-${item.id}`} className="text-xs">{item.department}</span>, <span key={`date-${item.id}`} className="text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>, <button key={`btn-${item.id}`} onClick={() => handleToggle(item)}><StatusPill tone={item.status === 'Đã đăng' ? 'green' : 'gray'}>{item.status || 'Đã đăng'}</StatusPill></button>, item.isImportant ? <StatusPill key={`i-${item.id}`} tone="amber">Ưu tiên</StatusPill> : <span key={`ni-${item.id}`} className="text-xs text-[#9cacba]">—</span>, <div key={`act-${item.id}`} className="flex gap-2"><button onClick={() => { setEditingItem(item); setShowForm(true); }} className="text-xs font-bold text-[#0052cc]">Sửa</button><button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Xóa</button></div>])} /><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></>}</>}</>; 
}
