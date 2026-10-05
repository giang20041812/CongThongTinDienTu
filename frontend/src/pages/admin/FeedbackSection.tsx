import React, { useState, useEffect } from 'react';
import { PageHeading, Toolbar, SearchBox, StatusPill, Pagination } from './components/UI';
import { MessageSquare } from 'lucide-react';

export type FeedbackStatus = 'Chưa xử lý' | 'Đang xử lý' | 'Đã phản hồi';

export function FeedbackSection({ items, onStatus }: { items: any[]; onStatus: (id: string, status: FeedbackStatus) => void }) { 
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filtered = items.filter(item => 
    (item.name || '').toLowerCase().includes(query.toLowerCase()) || 
    (item.subject || '').toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return <><PageHeading eyebrow="Tương tác người dùng" title="Quản lý phản hồi" description="Tiếp nhận ý kiến và theo dõi tiến độ xử lý của nhà trường." /><Toolbar><div className="flex gap-2"><StatusPill tone="amber">{items.filter(i => i.status === 'Chưa xử lý').length.toString()} chưa xử lý</StatusPill><StatusPill tone="blue">{items.filter(i => i.status === 'Đang xử lý').length.toString()} đang xử lý</StatusPill></div><SearchBox value={query} onChange={setQuery} placeholder="Tìm người gửi, chủ đề..." /></Toolbar><div className="space-y-3 mb-4">{paginatedData.length > 0 ? paginatedData.map(item => <div key={item.id} className="bg-white border border-[#e3ebf3] p-5"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div className="flex gap-3"><div className="w-9 h-9 bg-[#eaf3f8] text-[#0052cc] grid place-items-center shrink-0"><MessageSquare size={16} /></div><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{item.subject}</h3><span className="text-[10px] text-[#8a9bad]">{item.id}</span></div><p className="text-xs text-[#71849b] mt-1">{item.name} · {item.date}</p><p className="text-sm text-[#4f6478] mt-3">{item.message}</p></div></div><select value={item.status} onChange={e => onStatus(item.id, e.target.value as FeedbackStatus)} className="admin-select text-xs"><option>Chưa xử lý</option><option>Đang xử lý</option><option>Đã phản hồi</option></select></div></div>) : <p className="p-10 text-center text-sm text-[#8a9bad] bg-white border border-[#e3ebf3]">Không tìm thấy dữ liệu phù hợp.</p>}</div><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></>; 
}
