// The admin screen intentionally keeps several compact table renderers together;
// runtime data is validated at the form boundaries.
// @ts-nocheck
import { FormEvent, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle, Bell, Check, ChevronDown, FileText, LayoutDashboard, LogOut,
  Menu, MessageSquare, PackageSearch, Plus, Search, Settings, ShieldCheck,
  UserRound, X,
} from 'lucide-react';
import { ALL_LOST_ITEMS, ALL_NEWS } from '../data/mockData';
import { createPost, updatePost, deletePost, usePosts, fetchCategories, createAnnouncement, updateAnnouncement, deleteAnnouncement, useAnnouncements } from '../api';
import { useEffect } from 'react';

type AdminSection = 'dashboard' | 'news' | 'announcements' | 'feedback' | 'lost-found';
type FeedbackStatus = 'Chưa xử lý' | 'Đang xử lý' | 'Đã phản hồi';
type LostStatus = 'pending' | 'claimed';

const newsCategories = ['Tất cả', 'Tin nhà trường', 'Hoạt động học sinh', 'Học thuật', 'Tuyển sinh'];

const feedbackSeed = [
  { id: 'FB-1024', name: 'Nguyễn Minh Anh', subject: 'Góp ý về lịch làm việc', message: 'Nên bổ sung bộ lọc theo ngày cho lịch làm việc của giáo viên.', date: '06/09/2026', status: 'Chưa xử lý' as FeedbackStatus },
  { id: 'FB-1023', name: 'Lê Hoàng Nam', subject: 'Không nhận được thông báo', message: 'Em chưa thấy thông báo đăng ký chuyên đề trên tài khoản.', date: '05/09/2026', status: 'Đang xử lý' as FeedbackStatus },
  { id: 'FB-1022', name: 'Trần Thu Hà', subject: 'Đề xuất thư viện số', message: 'Mong nhà trường bổ sung thêm tài liệu ôn thi học sinh giỏi.', date: '04/09/2026', status: 'Đã phản hồi' as FeedbackStatus },
];

const announcementSeed = [
  { id: 'TB-208', title: 'Hướng dẫn đăng ký học chuyên đề khối 10', department: 'Ban Giám hiệu', date: '06/09/2026', status: 'Đã đăng', important: true },
  { id: 'TB-207', title: 'Lịch khảo sát năng lực môn Toán tháng 9', department: 'Tổ chuyên môn Toán', date: '02/09/2026', status: 'Đã đăng', important: false },
  { id: 'TB-206', title: 'Phân công trực tuần học kỳ I', department: 'Văn phòng nhà trường', date: '30/08/2026', status: 'Bản nháp', important: false },
];

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (username === 'admin' && password === 'admin123') onLogin();
    else setError('Tài khoản hoặc mật khẩu chưa đúng.');
  };

  return <div className="min-h-screen bg-[#eef4fb] flex items-center justify-center p-5 relative overflow-hidden">
    <div className="absolute -top-32 -right-28 w-96 h-96 bg-[#b9d7f2] rounded-full opacity-60" />
    <div className="absolute -bottom-48 -left-28 w-[30rem] h-[30rem] bg-[#d6e8f7] rounded-full opacity-70" />
    <div className="w-full max-w-[430px] bg-white border border-[#dce7f2] shadow-[0_24px_70px_rgba(13,55,96,.12)] relative z-10">
      <div className="h-2 bg-[#0b78b5]" />
      <div className="p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-9"><div className="w-11 h-11 bg-[#0b78b5] text-white grid place-items-center"><ShieldCheck size={24} /></div><div><p className="text-[10px] uppercase tracking-[.22em] text-[#0b78b5] font-bold">Cổng quản trị</p><h1 className="text-xl font-extrabold text-[#17324d]">CVA Admin</h1></div></div>
        <h2 className="text-2xl font-extrabold text-[#17324d]">Đăng nhập hệ thống</h2>
        <p className="text-sm text-[#71849b] mt-2 mb-7">Quản lý nội dung Cổng thông tin nhà trường</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="label-admin">Tài khoản</span><div className="relative"><UserRound className="admin-input-icon" size={17} /><input value={username} onChange={e => setUsername(e.target.value)} className="admin-input pl-10" placeholder="Nhập tài khoản" /></div></label>
          <label className="block"><span className="label-admin">Mật khẩu</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" placeholder="Nhập mật khẩu" /></label>
          {error && <p className="text-xs text-red-600 flex gap-2 items-center"><AlertCircle size={14} />{error}</p>}
          <button className="w-full bg-[#0b78b5] hover:bg-[#075f91] text-white font-bold py-3.5 mt-2 transition-colors">Đăng nhập quản trị <span className="ml-2">→</span></button>
        </form>
        <div className="mt-7 pt-5 border-t border-[#edf1f5] text-xs text-[#8a9bad] flex justify-between"><span>Demo: admin / admin123</span><a href="/" className="hover:text-[#0b78b5]">Về cổng thông tin</a></div>
      </div>
    </div>
  </div>;
}

function StatusPill({ children, tone = 'blue' }: { children: string; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const tones = { blue: 'bg-[#e6f2fb] text-[#0b78b5]', green: 'bg-[#e4f6eb] text-[#16834c]', amber: 'bg-[#fff4dc] text-[#a76500]', gray: 'bg-[#eef1f4] text-[#6e7f91]' };
  return <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

function AdminPortal({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [newsCategory, setNewsCategory] = useState('Tất cả');
  const [feedback, setFeedback] = useState(feedbackSeed);
  const [lostItems, setLostItems] = useState(ALL_LOST_ITEMS.map(item => ({ ...item })));
  const [announcements, setAnnouncements] = useState(announcementSeed);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');

  const navigate = (next: AdminSection) => { setSection(next); setSidebarOpen(false); setQuery(''); setShowForm(false); };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };
  const filteredNews = useMemo(() => ALL_NEWS.filter(item => (newsCategory === 'Tất cả' || item.category === newsCategory) && item.title.toLowerCase().includes(query.toLowerCase())), [newsCategory, query]);
  const filteredLost = useMemo(() => lostItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase())), [lostItems, query]);

  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard }, { id: 'news', label: 'Quản lý tin tức', icon: FileText, count: ALL_NEWS.length }, { id: 'announcements', label: 'Quản lý thông báo', icon: Bell, count: announcements.length }, { id: 'feedback', label: 'Phản hồi', icon: MessageSquare, count: feedback.filter(f => f.status !== 'Đã phản hồi').length }, { id: 'lost-found', label: 'Đồ thất lạc', icon: PackageSearch, count: lostItems.filter(i => i.status === 'pending').length },
  ];

  return <div className="min-h-screen bg-[#f5f8fb] text-[#17324d] flex">
    {sidebarOpen && <button className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />}
    <aside className={`fixed lg:static z-30 w-[255px] h-screen bg-[#102b49] text-white flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-[76px] px-6 flex items-center border-b border-white/10"><div className="w-9 h-9 bg-[#0b78b5] grid place-items-center mr-3"><ShieldCheck size={19} /></div><div><p className="text-[9px] tracking-[.2em] text-[#83c9ed] font-bold">TRƯỜNG CVA</p><p className="font-extrabold">CVA Admin</p></div></div>
      <div className="px-4 pt-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#7490aa] font-bold px-3 mb-3">Không gian quản trị</p>{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold mb-1 transition-colors ${section === item.id ? 'bg-[#0b78b5] text-white' : 'text-[#b8c9d8] hover:bg-white/10'}`}><Icon size={17} /> <span className="flex-1 text-left">{item.label}</span>{item.count !== undefined && <span className={`text-[10px] px-1.5 py-0.5 ${section === item.id ? 'bg-white/20' : 'bg-white/10'}`}>{item.count}</span>}</button>; })}</div>
      <div className="mt-auto p-4 border-t border-white/10"><button className="w-full flex items-center gap-3 text-sm text-[#b8c9d8] hover:text-white px-3 py-3" onClick={onLogout}><LogOut size={17} /> Đăng xuất</button></div>
    </aside>
    <div className="flex-1 min-w-0"><header className="h-[76px] bg-white border-b border-[#e5edf4] flex items-center justify-between px-5 lg:px-9"><div className="flex items-center gap-4"><button className="lg:hidden text-[#17324d]" onClick={() => setSidebarOpen(true)}><Menu /></button><div><p className="text-[11px] text-[#8495a6]">Thứ Hai, 07 tháng 09, 2026</p><h1 className="font-extrabold text-lg">{navItems.find(n => n.id === section)?.label}</h1></div></div><div className="flex items-center gap-4"><div className="hidden sm:flex items-center gap-2 text-sm"><div className="w-8 h-8 bg-[#e5f2fb] text-[#0b78b5] grid place-items-center"><UserRound size={16} /></div><span className="font-bold">Quản trị viên</span></div><button className="text-[#71849b] hover:text-[#0b78b5]"><Settings size={18} /></button></div></header><main className="p-5 lg:p-9 max-w-[1400px] mx-auto">{section === 'dashboard' && <Dashboard onNavigate={navigate} feedbackCount={feedback.filter(f => f.status !== 'Đã phản hồi').length} lostCount={lostItems.filter(i => i.status === 'pending').length} />}{section === 'news' && <NewsSection query={query} setQuery={setQuery} category={newsCategory} setCategory={setNewsCategory} showForm={showForm} setShowForm={setShowForm} notify={notify} />}{section === 'announcements' && <AnnouncementSection query={query} setQuery={setQuery} showForm={showForm} setShowForm={setShowForm} notify={notify} />}{section === 'feedback' && <FeedbackSection items={feedback} onStatus={(id, status) => { setFeedback(items => items.map(item => item.id === id ? { ...item, status } : item)); notify('Đã cập nhật trạng thái phản hồi'); }} />}{section === 'lost-found' && <LostSection query={query} setQuery={setQuery} items={filteredLost} onStatus={(id, status) => { setLostItems(items => items.map(item => item.id === id ? { ...item, status } : item)); notify('Đã cập nhật thông tin đồ thất lạc'); }} />}</main></div>
    {toast && <div className="fixed bottom-6 right-6 bg-[#17324d] text-white px-4 py-3 text-sm shadow-xl flex items-center gap-2 z-50"><Check size={16} className="text-[#69d493]" />{toast}</div>}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"><div><p className="text-[10px] tracking-[.2em] uppercase text-[#0b78b5] font-extrabold mb-2">{eyebrow}</p><h2 className="text-2xl lg:text-3xl font-extrabold">{title}</h2><p className="text-sm text-[#71849b] mt-2">{description}</p></div>{action}</div>; }
function SearchBox({ value, onChange, placeholder = 'Tìm kiếm...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) { return <div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#8da0b3]" /><input value={value} onChange={e => onChange(e.target.value)} className="admin-input pl-9 w-full md:w-64" placeholder={placeholder} /></div>; }
function Toolbar({ children }: { children: React.ReactNode }) { return <div className="bg-white border border-[#e3ebf3] p-3 flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">{children}</div>; }
function Dashboard({ onNavigate, feedbackCount, lostCount }: { onNavigate: (s: AdminSection) => void; feedbackCount: number; lostCount: number }) { const cards = [{ label: 'Bài viết', value: '24', icon: FileText, color: 'blue', action: 'news' as AdminSection }, { label: 'Thông báo đã đăng', value: '08', icon: Bell, color: 'green', action: 'announcements' as AdminSection }, { label: 'Phản hồi chờ xử lý', value: String(feedbackCount).padStart(2, '0'), icon: MessageSquare, color: 'amber', action: 'feedback' as AdminSection }, { label: 'Đồ thất lạc mới', value: String(lostCount).padStart(2, '0'), icon: PackageSearch, color: 'purple', action: 'lost-found' as AdminSection }]; return <><PageHeading eyebrow="Tổng quan hệ thống" title="Xin chào, quản trị viên" description="Theo dõi và điều hành nội dung cổng thông tin nhà trường." /><div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">{cards.map(card => { const Icon = card.icon; return <button key={card.label} onClick={() => onNavigate(card.action)} className="bg-white border border-[#e3ebf3] p-5 text-left hover:border-[#0b78b5] transition-colors"><div className="flex justify-between items-start"><div className={`w-10 h-10 grid place-items-center ${card.color === 'blue' ? 'bg-[#e8f3fb] text-[#0b78b5]' : card.color === 'green' ? 'bg-[#e6f6ed] text-[#16834c]' : card.color === 'amber' ? 'bg-[#fff3dc] text-[#ae710c]' : 'bg-[#f0eafa] text-[#7956b3]'}`}><Icon size={19} /></div><span className="text-[10px] font-bold text-[#169354]">+12%</span></div><p className="text-3xl font-extrabold mt-6">{card.value}</p><p className="text-xs text-[#71849b] mt-1">{card.label}</p></button>; })}</div><div className="grid xl:grid-cols-[1.5fr_1fr] gap-5"><div className="bg-white border border-[#e3ebf3] p-5"><div className="flex justify-between items-center mb-5"><h3 className="font-extrabold">Hoạt động gần đây</h3><span className="text-xs text-[#0b78b5]">Hôm nay</span></div>{[['Đã xuất bản bài viết “Lễ khai giảng năm học mới”', '10 phút trước', FileText], ['Đã cập nhật trạng thái đồ thất lạc #LF-004', '35 phút trước', PackageSearch], ['Có phản hồi mới từ Nguyễn Minh Anh', '1 giờ trước', MessageSquare], ['Đã đăng thông báo “Hướng dẫn đăng ký chuyên đề”', '2 giờ trước', Bell]].map(([text, time, Icon]) => <div className="flex gap-3 py-3 border-b border-[#edf1f5] last:border-0" key={String(text)}><div className="w-8 h-8 bg-[#eaf3f8] text-[#0b78b5] grid place-items-center shrink-0"><Icon size={15} /></div><div><p className="text-sm font-semibold">{text}</p><p className="text-[11px] text-[#8a9bad] mt-1">{time}</p></div></div>)}</div><div className="bg-[#103352] text-white p-6 relative overflow-hidden"><div className="absolute -right-14 -top-14 w-44 h-44 border border-white/10 rounded-full" /><p className="text-[10px] tracking-[.18em] text-[#83c9ed] font-bold">NHẮC VIỆC</p><h3 className="text-xl font-extrabold mt-3">Cần xử lý hôm nay</h3><div className="mt-6 space-y-4"><button onClick={() => onNavigate('feedback')} className="w-full text-left flex items-center justify-between border-b border-white/15 pb-3 text-sm"><span>Phản hồi chưa xử lý</span><b>{feedbackCount}</b></button><button onClick={() => onNavigate('lost-found')} className="w-full text-left flex items-center justify-between border-b border-white/15 pb-3 text-sm"><span>Tin đồ thất lạc chờ duyệt</span><b>{lostCount}</b></button></div><button onClick={() => onNavigate('news')} className="mt-7 text-xs font-bold text-[#83c9ed]">Xem quản lý nội dung →</button></div></div></>; }

function NewsForm({ post, onClose, onSave }: any) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [categoryId, setCategoryId] = useState(post?.category?.id || '');
  const [bannerUrl, setBannerUrl] = useState(post?.bannerUrl || '');
  const [content, setContent] = useState(post?.blocks?.[0]?.content || '');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
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
      <label className="block"><span className="label-admin">Ảnh bìa (URL)</span><input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="admin-input" placeholder="https://..." /></label>
      <label className="block"><span className="label-admin">Nội dung</span><textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input min-h-24" placeholder="Nhập nội dung" /></label>
    </div>
    <div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="admin-secondary">Hủy</button><button onClick={handleSubmit} className="admin-primary"><Check size={15} /> Lưu nội dung</button></div>
  </div>;
}

function NewsSection({ query, setQuery, category, setCategory, showForm, setShowForm, notify }: any) { 
  const { data: posts, loading, refetch } = usePosts();
  const [editingPost, setEditingPost] = useState<any>(null);

  const filtered = (posts || []).filter((item: any) => 
    (category === 'Tất cả' || item.category?.name === category) && 
    (item.title || '').toLowerCase().includes(query.toLowerCase())
  );

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
      notify('Lỗi khi lưu bài viết');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deletePost(id);
        notify('Đã xóa bài viết');
        refetch();
      } catch (e) {
        notify('Lỗi khi xóa bài viết');
      }
    }
  };

  return <><PageHeading eyebrow="Nội dung website" title="Quản lý tin tức" description="Tạo, chỉnh sửa và phân loại các bài viết trên cổng thông tin." action={<button onClick={() => { setEditingPost(null); setShowForm(!showForm); }} className="admin-primary"><Plus size={16} /> Thêm bài viết</button>} />{showForm && <NewsForm post={editingPost} onClose={() => { setShowForm(false); setEditingPost(null); }} onSave={handleSave} />}{!showForm && <><Toolbar><div className="flex flex-wrap gap-2">{newsCategories.map(item => <button key={item} onClick={() => setCategory(item)} className={`filter-chip ${category === item ? 'active' : ''}`}>{item}</button>)}</div><SearchBox value={query} onChange={setQuery} placeholder="Tìm bài viết..." /></Toolbar>{loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <DataTable headers={['Bài viết', 'Chuyên mục', 'Ngày đăng', 'Lượt xem', 'Trạng thái', 'Hành động']} rows={filtered.map((item: any) => [<div><p className="font-bold text-sm line-clamp-1">{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">{item.author?.username || 'admin'}</p></div>, <span className="text-xs">{item.category?.name || 'Chưa phân loại'}</span>, <span className="text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>, <span className="text-xs">{item.views?.toLocaleString()}</span>, <StatusPill tone="green">{item.status || 'Đã đăng'}</StatusPill>, <div className="flex gap-2"><button onClick={() => { setEditingPost(item); setShowForm(true); }} className="text-xs font-bold text-[#0b78b5]">Sửa</button><button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Xóa</button></div>])} />}</>}</>; }
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

function AnnouncementSection({ query, setQuery, showForm, setShowForm, notify }: any) {
  const { data: items, loading, refetch } = useAnnouncements();
  const [editingItem, setEditingItem] = useState<any>(null);

  const filtered = (items || []).filter((item: any) => (item.title || '').toLowerCase().includes(query.toLowerCase()));

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
      notify('Lỗi khi lưu thông báo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await deleteAnnouncement(id);
        notify('Đã xóa thông báo');
        refetch();
      } catch (e) {
        notify('Lỗi khi xóa thông báo');
      }
    }
  };

  const handleToggle = async (item: any) => {
    try {
      await updateAnnouncement(item.id, { ...item, status: item.status === 'Đã đăng' ? 'Bản nháp' : 'Đã đăng' });
      notify('Đã cập nhật trạng thái thông báo');
      refetch();
    } catch (e) {
      notify('Lỗi khi cập nhật trạng thái');
    }
  };

  return <><PageHeading eyebrow="Thông tin điều hành" title="Quản lý thông báo" description="Đăng tải thông báo quan trọng đến học sinh, phụ huynh và giáo viên." action={<button onClick={() => { setEditingItem(null); setShowForm(!showForm); }} className="admin-primary"><Plus size={16} /> Tạo thông báo</button>} />{showForm ? <AnnouncementForm post={editingItem} onClose={() => { setShowForm(false); setEditingItem(null); }} onSave={handleSave} /> : <><Toolbar><p className="text-xs text-[#71849b]">Tổng cộng <b className="text-[#17324d]">{filtered.length} thông báo</b></p><SearchBox value={query} onChange={setQuery} placeholder="Tìm thông báo..." /></Toolbar>{loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <DataTable headers={['Thông báo', 'Đơn vị', 'Ngày tạo', 'Trạng thái', 'Quan trọng', 'Hành động']} rows={filtered.map((item: any) => [<div><p className="font-bold text-sm">{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">Mã: {item.id ? item.id.substring(0,8) : ''}</p></div>, <span className="text-xs">{item.department}</span>, <span className="text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>, <button onClick={() => handleToggle(item)}><StatusPill tone={item.status === 'Đã đăng' ? 'green' : 'gray'}>{item.status || 'Đã đăng'}</StatusPill></button>, item.isImportant ? <StatusPill tone="amber">Ưu tiên</StatusPill> : <span className="text-xs text-[#9cacba]">—</span>, <div className="flex gap-2"><button onClick={() => { setEditingItem(item); setShowForm(true); }} className="text-xs font-bold text-[#0b78b5]">Sửa</button><button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Xóa</button></div>])} />}</>}</>; }
function FeedbackSection({ items, onStatus }: { items: typeof feedbackSeed; onStatus: (id: string, status: FeedbackStatus) => void }) { return <><PageHeading eyebrow="Tương tác người dùng" title="Quản lý phản hồi" description="Tiếp nhận ý kiến và theo dõi tiến độ xử lý của nhà trường." /><Toolbar><div className="flex gap-2"><StatusPill tone="amber">{items.filter(i => i.status === 'Chưa xử lý').length} chưa xử lý</StatusPill><StatusPill tone="blue">{items.filter(i => i.status === 'Đang xử lý').length} đang xử lý</StatusPill></div><SearchBox value="" onChange={() => {}} placeholder="Tìm người gửi..." /></Toolbar><div className="space-y-3">{items.map(item => <div key={item.id} className="bg-white border border-[#e3ebf3] p-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div className="flex gap-3"><div className="w-9 h-9 bg-[#eaf3f8] text-[#0b78b5] grid place-items-center shrink-0"><MessageSquare size={16} /></div><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{item.subject}</h3><span className="text-[10px] text-[#8a9bad]">{item.id}</span></div><p className="text-xs text-[#71849b] mt-1">{item.name} · {item.date}</p><p className="text-sm text-[#4f6478] mt-3">{item.message}</p></div></div><select value={item.status} onChange={e => onStatus(item.id, e.target.value as FeedbackStatus)} className="admin-select text-xs"><option>Chưa xử lý</option><option>Đang xử lý</option><option>Đã phản hồi</option></select></div></div>)}</div></>; }
function LostSection({ items, query, setQuery, onStatus }: { items: typeof ALL_LOST_ITEMS; query: string; setQuery: (s: string) => void; onStatus: (id: string, status: LostStatus) => void }) { return <><PageHeading eyebrow="Tiếp nhận tài sản" title="Đồ thất lạc" description="Xác minh, cập nhật trạng thái và công khai thông tin đồ thất lạc." /><Toolbar><div className="flex gap-2"><StatusPill tone="amber">{items.filter(i => i.status === 'pending').length} chờ nhận</StatusPill><StatusPill tone="green">{items.filter(i => i.status === 'claimed').length} đã trả</StatusPill></div><SearchBox value={query} onChange={setQuery} placeholder="Tìm đồ thất lạc..." /></Toolbar><DataTable headers={['Thông tin đồ vật', 'Nơi tìm thấy', 'Ngày nhặt', 'Đơn vị giữ', 'Trạng thái', '']} rows={items.map(item => [<div><p className="font-bold text-sm">{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">{item.itemType}</p></div>, <span className="text-xs line-clamp-2">{item.locationFound}</span>, <span className="text-xs">{item.dateFound}</span>, <span className="text-xs">{item.finderDepartment}</span>, <select value={item.status} onChange={e => onStatus(item.id, e.target.value as LostStatus)} className="admin-select text-xs"><option value="pending">Chờ nhận</option><option value="claimed">Đã trả</option></select>, <button className="text-xs font-bold text-[#0b78b5]">Chi tiết</button>])} /></>; }
function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { return <div className="bg-white border border-[#e3ebf3] overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f8fafc] border-b border-[#e3ebf3]"><tr>{headers.map(h => <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#8092a4] font-extrabold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">{rows.length ? rows.map((row, i) => <tr key={i} className="hover:bg-[#fbfdff]">{row.map((cell, j) => <td key={j} className="px-4 py-4 align-middle">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="p-10 text-center text-sm text-[#8a9bad]">Không tìm thấy dữ liệu phù hợp.</td></tr>}</tbody></table></div>; }
function QuickForm({ title, fields, onClose, onSave }: { title: string; fields: string[]; onClose: () => void; onSave: () => void }) { return <div className="bg-white border border-[#c8ddeb] p-5 mb-4 shadow-sm"><div className="flex items-center justify-between mb-5"><h3 className="font-extrabold">{title}</h3><button onClick={onClose}><X size={18} className="text-[#8495a6]" /></button></div><div className="grid gap-4">{fields.map((field, index) => <label key={field} className="block"><span className="label-admin">{field}</span>{index === fields.length - 1 ? <textarea className="admin-input min-h-24" placeholder={`Nhập ${field.toLowerCase()}`} /> : <input className="admin-input" placeholder={`Nhập ${field.toLowerCase()}`} />}</label>)}</div><div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="admin-secondary">Hủy</button><button onClick={onSave} className="admin-primary"><Check size={15} /> Lưu nội dung</button></div></div>; }

export function AdminApp() { const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('cva-admin') === 'true'); const login = () => { sessionStorage.setItem('cva-admin', 'true'); setAuthenticated(true); window.history.pushState({}, '', '/admin'); }; const logout = () => { sessionStorage.removeItem('cva-admin'); setAuthenticated(false); window.history.pushState({}, '', '/admin/login'); }; return authenticated ? <AdminPortal onLogout={logout} /> : <AdminLogin onLogin={login} />; }
