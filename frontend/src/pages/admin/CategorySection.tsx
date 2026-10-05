import React, { useState, useEffect } from 'react';
import { PageHeading, Toolbar, SearchBox, DataTable, Pagination } from './components/UI';
import { Plus, X, Check } from 'lucide-react';
import { useCategories, createCategory, updateCategory, deleteCategory } from '../../api';

function CategoryForm({ category, onClose, onSave }: any) {
  const [name, setName] = useState(category?.name || '');
  const [code, setCode] = useState(category?.code || '');
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder || 0);

  const handleSubmit = () => {
    onSave({ name, code, displayOrder: parseInt(displayOrder) || 0 });
  };

  return <div className="bg-white border border-[#c8ddeb] p-5 mb-4 shadow-sm">
    <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold">{category ? 'Sửa chuyên mục' : 'Tạo chuyên mục mới'}</h3><button onClick={onClose}><X size={18} className="text-[#8495a6]" /></button></div>
    <div className="grid gap-4">
      <label className="block"><span className="label-admin">Mã chuyên mục</span><input value={code} onChange={e => setCode(e.target.value)} className="admin-input" placeholder="VD: TIN_TUC" /></label>
      <label className="block"><span className="label-admin">Tên chuyên mục</span><input value={name} onChange={e => setName(e.target.value)} className="admin-input" placeholder="Nhập tên" /></label>
      <label className="block"><span className="label-admin">Thứ tự hiển thị (Trang chủ)</span><input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="admin-input" placeholder="1 đến 10 (0 để ẩn)" /></label>
    </div>
    <div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="admin-secondary">Hủy</button><button onClick={handleSubmit} className="admin-primary"><Check size={15} /> Lưu chuyên mục</button></div>
  </div>;
}

export function CategorySection({ notify }: { notify: (msg: string, type?: 'success' | 'error') => void }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: categories, totalPages, loading, refetch } = useCategories(currentPage - 1, ITEMS_PER_PAGE, query);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const handleSave = async (formData: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        notify('Đã cập nhật chuyên mục');
      } else {
        await createCategory(formData);
        notify('Đã tạo chuyên mục mới');
      }
      setShowForm(false);
      setEditingCategory(null);
      refetch();
    } catch (e) {
      notify('Lỗi khi lưu chuyên mục', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuyên mục này? Các bài viết trong chuyên mục có thể bị ảnh hưởng.')) {
      try {
        await deleteCategory(id);
        notify('Đã xóa chuyên mục');
        refetch();
      } catch (e) {
        notify('Lỗi khi xóa chuyên mục', 'error');
      }
    }
  };

  return <><PageHeading eyebrow="Phân loại nội dung" title="Quản lý chuyên mục bài viết" description="Tạo và chỉnh sửa các danh mục bài viết trên hệ thống." action={<button onClick={() => { setEditingCategory(null); setShowForm(!showForm); }} className="admin-primary"><Plus size={16} /> Thêm chuyên mục</button>} />{showForm && <CategoryForm category={editingCategory} onClose={() => { setShowForm(false); setEditingCategory(null); }} onSave={handleSave} />}{!showForm && <><Toolbar><p className="text-xs text-[#71849b]">Trang {currentPage}</p><SearchBox value={query} onChange={setQuery} placeholder="Tìm chuyên mục..." /></Toolbar>{loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <><DataTable headers={['Mã', 'Tên chuyên mục', 'Thứ tự hiển thị', 'Hành động']} rows={categories.map((item: any) => [<span key={`code-${item.id}`} className="text-xs font-mono">{item.code}</span>, <div key={`name-${item.id}`}><p className="font-bold text-sm">{item.name}</p></div>, <span key={`order-${item.id}`} className="text-xs">{item.displayOrder > 0 ? `Vị trí ${item.displayOrder}` : 'Ẩn'}</span>, <div key={`act-${item.id}`} className="flex gap-2"><button onClick={() => { setEditingCategory(item); setShowForm(true); }} className="text-xs font-bold text-[#0052cc]">Sửa</button><button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Xóa</button></div>])} /><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></>}</>}</>; 
}
