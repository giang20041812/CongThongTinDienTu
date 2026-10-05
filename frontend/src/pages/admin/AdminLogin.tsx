import React, { useState, FormEvent } from 'react';
import { ShieldCheck, UserRound, AlertCircle } from 'lucide-react';

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
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
      <div className="h-2 bg-[#0052cc]" />
      <div className="p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-9"><div className="w-11 h-11 bg-[#0052cc] text-white grid place-items-center"><ShieldCheck size={24} /></div><div><p className="text-[10px] uppercase tracking-[.22em] text-[#0052cc] font-bold">Cổng quản trị</p><h1 className="text-xl font-extrabold text-[#17324d]">CVA Admin</h1></div></div>
        <h2 className="text-2xl font-extrabold text-[#17324d]">Đăng nhập hệ thống</h2>
        <p className="text-sm text-[#71849b] mt-2 mb-7">Quản lý nội dung Cổng thông tin nhà trường</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="label-admin">Tài khoản</span><div className="relative"><UserRound className="admin-input-icon" size={17} /><input value={username} onChange={e => setUsername(e.target.value)} className="admin-input pl-10" placeholder="Nhập tài khoản" /></div></label>
          <label className="block"><span className="label-admin">Mật khẩu</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" placeholder="Nhập mật khẩu" /></label>
          {error && <p className="text-xs text-red-600 flex gap-2 items-center"><AlertCircle size={14} />{error}</p>}
          <button className="w-full bg-[#0052cc] hover:bg-[#0026e6] text-white font-bold py-3.5 mt-2 transition-colors">Đăng nhập quản trị <span className="ml-2">→</span></button>
        </form>
        <div className="mt-7 pt-5 border-t border-[#edf1f5] text-xs text-[#8a9bad] flex justify-between"><span>Demo: admin / admin123</span><a href="/" className="hover:text-[#0052cc]">Về cổng thông tin</a></div>
      </div>
    </div>
  </div>;
}
