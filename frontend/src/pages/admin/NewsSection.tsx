import React, { useState, useEffect } from 'react';
import { PageHeading, Toolbar, SearchBox, DataTable, StatusPill, Pagination, ImageUpload } from './components/UI';
import { Plus, X, Check } from 'lucide-react';
import { usePosts, createPost, updatePost, deletePost, fetchCategories } from '../../api';

function NewsForm({ post, onClose, onSave }: any) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [categoryId, setCategoryId] = useState(post?.category?.id || '');
  const [bannerUrl, setBannerUrl] = useState(post?.bannerUrl || '');
  const [content, setContent] = useState(post?.blocks?.[0]?.content || '');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories().then(cats => {
      setCategories(cats.content || cats);
    });
  }, []);

  const handleSubmit = () => {
    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/ /g, '-'),
      category: { id: categoryId },
      bannerUrl,
      status: 'PUBLISHED',
      blocks: [
        { type: 'text', content: content, orderIndex: 0 }
      ]
    };
    onSave(data);
  };

  return <div className="bg-white border border-[#c8ddeb] p-5 mb-4 shadow-sm">
    <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold">{post ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h3><button onClick={onClose}><X size={18} className="text-[#8495a6]" /></button></div>
    <div className="grid gap-4">
      <label className="block"><span className="label-admin">Tiêu đề bài viết</span><input value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="Nhập tiêu đề" /></label>
      <label className="block"><span className="label-admin">Đường dẫn (Slug)</span><input value={slug} onChange={e => setSlug(e.target.value)} className="admin-input" placeholder="VD: bai-viet-moi" /></label>
      <label className="block"><span className="label-admin">Chuyên mục</span>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="admin-input bg-white">
          <option value="">-- Chọn chuyên mục --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="block"><span className="label-admin">Ảnh bìa (URL)</span><ImageUpload value={bannerUrl} onChange={setBannerUrl} /></label>
      <label className="block"><span className="label-admin">Nội dung</span><textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input min-h-24" placeholder="Nhập nội dung" /></label>
    </div>
    <div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="admin-secondary">Hủy</button><button onClick={handleSubmit} className="admin-primary"><Check size={15} /> Lưu nội dung</button></div>
  </div>;
}

export function NewsSection({ notify }: { notify: (msg: string, type?: 'success' | 'error') => void }) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: posts, totalPages, loading, refetch } = usePosts(currentPage - 1, ITEMS_PER_PAGE, categoryId || undefined, undefined, query);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories(0, 100).then(cats => {
      setDynamicCategories(cats.content || cats);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryId]);

  const handleSave = async (formData: any) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
        notify('Đã cập nhật bài viết');
      } else {
        await createPost(formData);
        notify('Đã tạo bài viết mới');
      }
      setShowForm(false);
      setEditingPost(null);
      refetch();
    } catch (e) {
      notify('Lỗi khi lưu bài viết', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deletePost(id);
        notify('Đã xóa bài viết');
        refetch();
      } catch (e) {
        notify('Lỗi khi xóa bài viết', 'error');
      }
    }
  };

  return <><PageHeading eyebrow="Nội dung website" title="Quản lý bài viết" description="Tạo, chỉnh sửa và phân loại các bài viết trên cổng thông tin." action={<button onClick={() => { setEditingPost(null); setShowForm(!showForm); }} className="admin-primary"><Plus size={16} /> Thêm bài viết</button>} />{showForm && <NewsForm post={editingPost} onClose={() => { setShowForm(false); setEditingPost(null); }} onSave={handleSave} />}{!showForm && <><Toolbar><div className="flex flex-wrap gap-2"><button onClick={() => setCategoryId('')} className={`filter-chip ${categoryId === '' ? 'active' : ''}`}>Tất cả</button>{dynamicCategories.map(item => <button key={item.id} onClick={() => setCategoryId(item.id)} className={`filter-chip ${categoryId === item.id ? 'active' : ''}`}>{item.name}</button>)}</div><SearchBox value={query} onChange={setQuery} placeholder="Tìm bài viết..." /></Toolbar>{loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <><DataTable headers={['Bài viết', 'Chuyên mục', 'Ngày đăng', 'Lượt xem', 'Trạng thái', 'Hành động']} rows={posts.map((item: any) => [<div key={item.id}><p className="font-bold text-sm line-clamp-1">{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">{item.author?.username || 'admin'}</p></div>, <span key={`cat-${item.id}`} className="text-xs">{item.category?.name || 'Chưa phân loại'}</span>, <span key={`date-${item.id}`} className="text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>, <span key={`views-${item.id}`} className="text-xs">{item.views?.toLocaleString() || 0}</span>, <StatusPill key={`status-${item.id}`} tone="green">{item.status || 'Đã đăng'}</StatusPill>, <div key={`act-${item.id}`} className="flex gap-2"><button onClick={() => { setEditingPost(item); setShowForm(true); }} className="text-xs font-bold text-[#0052cc]">Sửa</button><button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Xóa</button></div>])} /><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></>}</>}</>; 
}
