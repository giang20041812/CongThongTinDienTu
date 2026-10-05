import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[#e3ebf3] bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center">
        <p className="text-sm text-[#71849b]">
          Trang <span className="font-bold text-[#17324d]">{currentPage}</span> / <span className="font-bold text-[#17324d]">{totalPages}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="admin-secondary disabled:opacity-50 disabled:cursor-not-allowed text-xs py-1 px-3">Trước</button>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="admin-secondary disabled:opacity-50 disabled:cursor-not-allowed text-xs py-1 px-3">Sau</button>
      </div>
    </div>
  );
}

export function StatusPill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const tones = { blue: 'bg-[#e6f2fb] text-[#0052cc]', green: 'bg-[#e4f6eb] text-[#16834c]', amber: 'bg-[#fff4dc] text-[#a76500]', gray: 'bg-[#eef1f4] text-[#6e7f91]' };
  return <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { 
  return <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"><div><p className="text-[10px] tracking-[.2em] uppercase text-[#0052cc] font-extrabold mb-2">{eyebrow}</p><h2 className="text-2xl lg:text-3xl font-extrabold">{title}</h2><p className="text-sm text-[#71849b] mt-2">{description}</p></div>{action}</div>; 
}

export function SearchBox({ value, onChange, placeholder = 'Tìm kiếm...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) { 
  return <div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#8da0b3]" /><input value={value} onChange={e => onChange(e.target.value)} className="admin-input pl-9 w-full md:w-64" placeholder={placeholder} /></div>; 
}

export function ImageUpload({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [loading, setLoading] = React.useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { uploadImage } = await import('../../../api');
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      alert('Lỗi upload ảnh');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex gap-3 items-center">
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="admin-input flex-1" placeholder="https://... hoặc tải ảnh lên" />
      <div className="relative">
        <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <button type="button" className="admin-secondary px-4 py-2" disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải ảnh lên'}
        </button>
      </div>
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) { 
  return <div className="bg-white border border-[#e3ebf3] p-3 flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">{children}</div>; 
}

export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { 
  return <div className="bg-white border border-[#e3ebf3] overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f8fafc] border-b border-[#e3ebf3]"><tr>{headers.map(h => <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#8092a4] font-extrabold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">{rows.length ? rows.map((row, i) => <tr key={i} className="hover:bg-[#fbfdff]">{row.map((cell, j) => <td key={j} className="px-4 py-4 align-middle">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="p-10 text-center text-sm text-[#8a9bad]">Không tìm thấy dữ liệu phù hợp.</td></tr>}</tbody></table></div>; 
}
