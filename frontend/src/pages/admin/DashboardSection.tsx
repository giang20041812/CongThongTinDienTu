import React from 'react';
import { PageHeading } from './components/UI';
import { AdminSection } from './components/AdminLayout';
import { FileText, Bell, MessageSquare } from 'lucide-react';
import { usePosts, useAnnouncements } from '../../api';

export function DashboardSection({ onNavigate, feedbackCount }: { onNavigate: (s: AdminSection) => void; feedbackCount: number; }) { 
  const { data: posts } = usePosts();
  const { data: announcements } = useAnnouncements();

  const postsCount = posts?.length || 0;
  const announcementsCount = announcements?.length || 0;
  const cards = [{ label: 'Bài viết', value: String(postsCount).padStart(2, '0'), icon: FileText, color: 'blue', action: 'news' as AdminSection }, { label: 'Thông báo đã đăng', value: String(announcementsCount).padStart(2, '0'), icon: Bell, color: 'green', action: 'announcements' as AdminSection }, { label: 'Phản hồi chờ xử lý', value: String(feedbackCount).padStart(2, '0'), icon: MessageSquare, color: 'amber', action: 'feedback' as AdminSection }]; 

  const recentActivities: any[] = [];
  if (posts && posts.length > 0) recentActivities.push([`Đã xuất bản bài viết “${posts[posts.length-1]?.title || 'Mới nhất'}”`, 'Gần đây', FileText]);
  if (announcements && announcements.length > 0) recentActivities.push([`Đã đăng thông báo “${announcements[announcements.length-1]?.title || 'Mới nhất'}”`, 'Gần đây', Bell]);
  recentActivities.push(['Có phản hồi mới từ người dùng', 'Hôm nay', MessageSquare]);

  return <><PageHeading eyebrow="Tổng quan hệ thống" title="Xin chào, quản trị viên" description="Theo dõi và điều hành nội dung cổng thông tin nhà trường." /><div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">{cards.map(card => { const Icon = card.icon; return <button key={card.label} onClick={() => onNavigate(card.action)} className="bg-white border border-[#e3ebf3] p-5 text-left hover:border-[#0052cc] transition-colors"><div className="flex justify-between items-start"><div className={`w-10 h-10 grid place-items-center ${card.color === 'blue' ? 'bg-[#e8f3fb] text-[#0052cc]' : card.color === 'green' ? 'bg-[#e6f6ed] text-[#16834c]' : card.color === 'amber' ? 'bg-[#fff3dc] text-[#ae710c]' : 'bg-[#f0eafa] text-[#7956b3]'}`}><Icon size={19} /></div></div><p className="text-3xl font-extrabold mt-6">{card.value}</p><p className="text-xs text-[#71849b] mt-1">{card.label}</p></button>; })}</div><div className="grid xl:grid-cols-[1.5fr_1fr] gap-5"><div className="bg-white border border-[#e3ebf3] p-5"><div className="flex justify-between items-center mb-5"><h3 className="font-extrabold">Hoạt động gần đây</h3><span className="text-xs text-[#0052cc]">Hôm nay</span></div>{recentActivities.map(([text, time, Icon]: any, i) => <div className="flex gap-3 py-3 border-b border-[#edf1f5] last:border-0" key={i}><div className="w-8 h-8 bg-[#eaf3f8] text-[#0052cc] grid place-items-center shrink-0"><Icon size={15} /></div><div><p className="text-sm font-semibold">{text}</p><p className="text-[11px] text-[#8a9bad] mt-1">{time}</p></div></div>)}</div><div className="bg-[#103352] text-white p-6 relative overflow-hidden"><div className="absolute -right-14 -top-14 w-44 h-44 border border-white/10 rounded-full" /><p className="text-[10px] tracking-[.18em] text-[#83c9ed] font-bold">NHẮC VIỆC</p><h3 className="text-xl font-extrabold mt-3">Cần xử lý hôm nay</h3><div className="mt-6 space-y-4"><button onClick={() => onNavigate('feedback')} className="w-full text-left flex items-center justify-between border-b border-white/15 pb-3 text-sm"><span>Phản hồi chưa xử lý</span><b>{feedbackCount}</b></button></div><button onClick={() => onNavigate('news')} className="mt-7 text-xs font-bold text-[#83c9ed]">Xem quản lý nội dung →</button></div></div></>; 
}
