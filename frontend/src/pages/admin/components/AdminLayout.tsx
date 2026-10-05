import React, { useState } from 'react';
import { LayoutDashboard, FileText, Bell, MessageSquare, LogOut, ShieldCheck, Menu, UserRound, Settings, Check, FolderTree, XCircle } from 'lucide-react';
import { usePosts, useAnnouncements } from '../../../api';

export type AdminSection = 'dashboard' | 'news' | 'categories' | 'announcements' | 'feedback';

interface AdminLayoutProps {
  onLogout: () => void;
  section: AdminSection;
  setSection: (section: AdminSection) => void;
  children: React.ReactNode;
  toast: { message: string, type: 'success' | 'error' } | null;
  feedbackCount: number;
}

export function AdminLayout({ onLogout, section, setSection, children, toast, feedbackCount }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: posts } = usePosts();
  const { data: announcements } = useAnnouncements();

  const navItems = [
    { id: 'dashboard' as AdminSection, label: 'Tổng quan', icon: LayoutDashboard }, 
    { id: 'news' as AdminSection, label: 'Quản lý bài viết', icon: FileText, count: posts?.length || 0 }, 
    { id: 'categories' as AdminSection, label: 'Quản lý chuyên mục', icon: FolderTree },
    { id: 'announcements' as AdminSection, label: 'Quản lý thông báo', icon: Bell, count: announcements?.length || 0 }, 
    { id: 'feedback' as AdminSection, label: 'Phản hồi', icon: MessageSquare, count: feedbackCount },
  ];

  const navigate = (next: AdminSection) => { setSection(next); setSidebarOpen(false); };

  return <div className="min-h-screen bg-[#f5f8fb] text-[#17324d] flex items-start">
    {sidebarOpen && <button className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />}
    <aside className={`fixed lg:sticky lg:top-0 z-30 w-[255px] h-screen bg-[#102b49] text-white flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-[76px] px-6 flex items-center border-b border-white/10"><div className="w-9 h-9 bg-[#0052cc] grid place-items-center mr-3"><ShieldCheck size={19} /></div><div><p className="text-[9px] tracking-[.2em] text-[#83c9ed] font-bold">TRƯỜNG CVA</p><p className="font-extrabold">CVA Admin</p></div></div>
      <div className="px-4 pt-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#7490aa] font-bold px-3 mb-3">Không gian quản trị</p>{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold mb-1 transition-all duration-300 ${section === item.id ? 'bg-[#0052cc] text-white shadow-md shadow-[#0052cc]/20' : 'text-[#b8c9d8] hover:bg-white/10 hover:text-white hover:translate-x-2'}`}><Icon size={17} /> <span className="flex-1 text-left">{item.label}</span>{item.count !== undefined && <span className={`text-[10px] px-1.5 py-0.5 ${section === item.id ? 'bg-white/20' : 'bg-white/10'}`}>{item.count}</span>}</button>; })}</div>
      <div className="mt-auto p-4 border-t border-white/10"><button className="w-full flex items-center gap-3 text-sm transition-all duration-300 text-[#b8c9d8] hover:text-white hover:bg-white/10 px-3 py-3 rounded" onClick={onLogout}><LogOut size={17} /> Đăng xuất</button></div>
    </aside>
    <div className="flex-1 min-w-0"><header className="h-[76px] bg-white border-b border-[#e5edf4] flex items-center justify-between px-5 lg:px-9"><div className="flex items-center gap-4"><button className="lg:hidden text-[#17324d]" onClick={() => setSidebarOpen(true)}><Menu /></button><div><p className="text-[11px] text-[#8495a6]">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</p><h1 className="font-extrabold text-lg">{navItems.find(n => n.id === section)?.label}</h1></div></div><div className="flex items-center gap-4"><div className="hidden sm:flex items-center gap-2 text-sm"><div className="w-8 h-8 bg-[#e5f2fb] text-[#0052cc] grid place-items-center rounded"><UserRound size={16} /></div><span className="font-bold">Quản trị viên</span></div><button className="text-[#71849b] hover:text-[#0052cc] transition-colors"><Settings size={18} /></button></div></header><main className="p-5 lg:p-9 max-w-[1400px] mx-auto">{children}</main></div>
    {toast && <div className={`fixed bottom-6 right-6 text-white px-5 py-3.5 text-sm shadow-xl flex items-center gap-3 z-50 rounded transition-all transform duration-300 ease-out translate-y-0 ${toast.type === 'error' ? 'bg-[#e63946]' : 'bg-[#102b49]'}`}><div className={`grid place-items-center w-6 h-6 rounded-full ${toast.type === 'error' ? 'bg-white/20' : 'bg-[#0052cc]'}`}>{toast.type === 'error' ? <XCircle size={14} className="text-white" /> : <Check size={14} className="text-white" />}</div><span className="font-semibold">{toast.message}</span></div>}
  </div>;
}
