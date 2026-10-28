import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowDown, ArrowUp, CalendarClock, Check, ExternalLink, Eye, EyeOff, FileText, FolderTree, Home, ImagePlus,
  KeyRound, LayoutDashboard, LogOut, Menu, MessageSquare, Paperclip, Pencil, Pin, Plus, Search, Settings, ShieldCheck,
  Star, Trash2, Type, Upload, UserRound, X,
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { adminApi, AUTH_EXPIRED_EVENT, EMPTY_TIMETABLE, fetchAdminMe, getAdminToken, loginAdmin, logoutAdmin, type AccountDto, type AdminMe, type AdminRole } from '../api';
import { ADMIN_LOGIN_PATH, ADMIN_PATH } from '../lib/adminPath';
import { buildMenu, PAGE_TYPE_LABELS } from '../lib/menu';
import { formatFileSize } from '../lib/content';
import { DEFAULT_SITE, SETTING_FIELDS, type SiteInfo } from '../lib/site';
import type { AttachmentDto, Category, FeedbackDto, MenuNode, PageResponse, PageType, PostDetailDto, PostSummaryDto, TimetablePeriod } from '../types';
import { compareClassNames, DAY_LABELS, LAST_MORNING_PERIOD } from './SchedulePage';

type AdminSection = 'dashboard' | 'menu' | 'posts' | 'timetable' | 'feedback' | 'settings' | 'users';
type Notify = (message: string, tone?: 'ok' | 'error') => void;

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Loads data for a screen and exposes a reload; errors are reported, not thrown. */
function useLoader<T>(load: () => Promise<T>, deps: React.DependencyList, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const run = useCallback(async () => {
    setLoading(true);
    try {
      setData(await load());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Không tải được dữ liệu.'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    void run();
  }, [run]);
  return { data, loading, error, reload: run };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Credentials are verified by the backend (POST /api/auth/login); nothing is hard-coded in the bundle.
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginAdmin(username.trim(), password);
      onLogin();
    } catch (err) {
      setError(errorMessage(err, 'Không thể đăng nhập. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-[#eef4fb] flex items-center justify-center p-5 relative overflow-hidden">
    <div className="absolute -top-32 -right-28 w-96 h-96 bg-[#b9d7f2] rounded-full opacity-60" />
    <div className="absolute -bottom-48 -left-28 w-[30rem] h-[30rem] bg-[#d6e8f7] rounded-full opacity-70" />
    <div className="w-full max-w-[430px] bg-white border border-[#dce7f2] shadow-[0_24px_70px_rgba(13,55,96,.12)] relative z-10">
      <div className="h-2 bg-[#0052cc]" />
      <div className="p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-9"><div className="w-11 h-11 bg-[#0052cc] text-white grid place-items-center"><ShieldCheck size={24} /></div><div><p className="text-[10px] uppercase tracking-[.22em] text-[#0052cc] font-bold">Cổng quản trị</p><h1 className="text-xl font-extrabold text-[#17324d]">Quản trị cổng thông tin</h1></div></div>
        <h2 className="text-2xl font-extrabold text-[#17324d]">Đăng nhập hệ thống</h2>
        <p className="text-sm text-[#71849b] mt-2 mb-7">Quản lý nội dung Cổng thông tin nhà trường</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="label-admin">Tài khoản</span><div className="relative"><UserRound className="admin-input-icon" size={17} /><input value={username} onChange={e => setUsername(e.target.value)} className="admin-input pl-10" placeholder="Nhập tài khoản" autoComplete="username" /></div></label>
          <label className="block"><span className="label-admin">Mật khẩu</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" placeholder="Nhập mật khẩu" autoComplete="current-password" /></label>
          {error && <p className="text-xs text-red-600 flex gap-2 items-center"><AlertCircle size={14} />{error}</p>}
          <button disabled={submitting} className="w-full bg-[#0052cc] hover:bg-[#0026e6] disabled:opacity-60 text-white font-bold py-3.5 mt-2 transition-colors">{submitting ? 'Đang xác thực...' : 'Đăng nhập quản trị'} <span className="ml-2">→</span></button>
        </form>
        <div className="mt-7 pt-5 border-t border-[#edf1f5] text-xs text-[#8a9bad] flex justify-between"><span>Phiên đăng nhập hết hạn sau 8 giờ</span><a href="/" className="hover:text-[#0052cc]">Về cổng thông tin</a></div>
      </div>
    </div>
  </div>;
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = { PUBLISHED: 'Đã đăng', DRAFT: 'Bản nháp', HIDDEN: 'Đã ẩn' };
const FEEDBACK_LABELS: Record<FeedbackDto['status'], string> = { NEW: 'Chưa xử lý', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã xử lý' };
const holdsPosts = (type: PageType) => type !== 'GROUP' && type !== 'LINK';

function StatusPill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' | 'red' }) {
  const tones = { blue: 'bg-[#e6f2fb] text-[#0052cc]', green: 'bg-[#e4f6eb] text-[#16834c]', amber: 'bg-[#fff4dc] text-[#a76500]', gray: 'bg-[#eef1f4] text-[#6e7f91]', red: 'bg-[#fdeaea] text-[#c0392b]' };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7"><div><p className="text-[10px] tracking-[.2em] uppercase text-[#0052cc] font-extrabold mb-2">{eyebrow}</p><h2 className="text-2xl lg:text-3xl font-extrabold">{title}</h2><p className="text-sm text-[#71849b] mt-2">{description}</p></div>{action}</div>;
}

function SearchBox({ value, onChange, placeholder = 'Tìm kiếm...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="relative"><Search size={16} className="absolute left-3 top-3 text-[#8da0b3]" /><input value={value} onChange={e => onChange(e.target.value)} className="admin-input pl-9 w-full md:w-64" placeholder={placeholder} /></div>;
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-[#e3ebf3] p-3 flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">{children}</div>;
}

function Panel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose?: () => void }) {
  return <div className="bg-white border border-[#c8ddeb] p-5 mb-4 shadow-sm">
    <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold">{title}</h3>{onClose && <button type="button" onClick={onClose} aria-label="Đóng"><X size={18} className="text-[#8495a6]" /></button>}</div>
    {children}
  </div>;
}

function IconButton({ title, onClick, disabled, danger, children }: { title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`w-8 h-8 grid place-items-center border border-[#e0e8ef] bg-white disabled:opacity-30 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#536b80] hover:bg-[#eaf5fb] hover:text-[#0052cc]'}`}>{children}</button>;
}

function DataTable({ headers, rows, empty = 'Không tìm thấy dữ liệu phù hợp.' }: { headers: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return <div className="bg-white border border-[#e3ebf3] overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f8fafc] border-b border-[#e3ebf3]"><tr>{headers.map(h => <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#8092a4] font-extrabold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">{rows.length ? rows.map((row, i) => <tr key={i} className="hover:bg-[#fbfdff]">{row.map((cell, j) => <td key={j} className="px-4 py-3.5 align-middle">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="p-10 text-center text-sm text-[#8a9bad]">{empty}</td></tr>}</tbody></table></div>;
}

/** <select> of menu entries grouped by their top-level heading. */
function CategorySelect({ tree, value, onChange, onlyPostTargets, emptyLabel, allowedIds }: { tree: MenuNode[]; value: string; onChange: (id: string) => void; onlyPostTargets?: boolean; emptyLabel: string; allowedIds?: Set<string> }) {
  const allowed = (c: Category) => (!onlyPostTargets || holdsPosts(c.pageType)) && (!allowedIds || allowedIds.has(c.id));
  return <select value={value} onChange={e => onChange(e.target.value)} className="admin-select w-full bg-white">
    <option value="">{emptyLabel}</option>
    {tree.map(root => {
      const allowedChildren = root.children.filter(allowed);
      const rootAllowed = allowed(root);
      if (!rootAllowed && allowedChildren.length === 0) return null;
      return root.children.length === 0
        ? (rootAllowed ? <option key={root.id} value={root.id}>{root.name}</option> : null)
        : <optgroup key={root.id} label={root.name}>
            {rootAllowed && <option value={root.id}>{root.name} (mục cha)</option>}
            {allowedChildren.map(child => <option key={child.id} value={child.id}>{child.name}{child.visible ? '' : ' (ẩn)'}</option>)}
          </optgroup>;
    })}
  </select>;
}

/** One file (`onFile`) or, with `onFiles`, several chosen at once. */
function UploadButton({ label, accept, onFile, onFiles, busy }: { label: string; accept: string; onFile?: (file: File) => void; onFiles?: (files: File[]) => void; busy?: boolean }) {
  return <label className={`admin-secondary cursor-pointer ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
    <Upload size={14} /> {busy ? 'Đang tải lên...' : label}
    <input type="file" accept={accept} multiple={!!onFiles} className="hidden" onChange={e => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = '';
      if (onFiles) { if (files.length) onFiles(files); } else if (files[0]) onFile?.(files[0]);
    }} />
  </label>;
}

// ---------------------------------------------------------------------------
// Change password modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({ isOpen, onClose, notify, username }: { isOpen: boolean; onClose: () => void; notify: Notify; username: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      notify('Đổi mật khẩu thành công!');
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#c8ddeb] shadow-2xl overflow-hidden relative">
        <div className="h-1.5 bg-[#0052cc]" />
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#edf1f5] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#e5f2fb] text-[#0052cc] grid place-items-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#17324d] text-base">Đổi mật khẩu</h3>
                <p className="text-xs text-[#71849b]">Tài khoản: <strong className="text-[#17324d]">{username}</strong></p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8495a6] hover:text-[#17324d] p-1"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <span className="label-admin">Mật khẩu hiện tại *</span>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="admin-input pr-10"
                  placeholder="Nhập mật khẩu đang dùng"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-[#8a9bad] hover:text-[#17324d]"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <span className="label-admin">Mật khẩu mới (tối thiểu 8 ký tự) *</span>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="admin-input pr-10"
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-[#8a9bad] hover:text-[#17324d]"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <span className="label-admin">Xác nhận mật khẩu mới *</span>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="admin-input pr-10"
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-[#8a9bad] hover:text-[#17324d]"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#edf1f5] mt-5">
              <button
                type="button"
                onClick={onClose}
                className="admin-secondary"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="admin-primary disabled:opacity-60"
              >
                {submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Portal shell
// ---------------------------------------------------------------------------

function AdminPortal({ me, onLogout }: { me: AdminMe; onLogout: () => void }) {
  const isEditor = me.role === 'EDITOR';
  // Editors only get the posts screen, confined to the entry assigned to them (enforced by the API as well).
  const [section, setSection] = useState<AdminSection>(isEditor ? 'posts' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error' } | null>(null);

  const navigate = (next: AdminSection) => { setSection(next); setSidebarOpen(false); };
  const notify: Notify = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), tone === 'error' ? 5000 : 2400);
  }, []);

  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = isEditor
    ? [{ id: 'posts', label: 'Bài viết & văn bản', icon: FileText }]
    : [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'menu', label: 'Đầu mục & menu', icon: FolderTree },
        { id: 'posts', label: 'Bài viết & văn bản', icon: FileText },
        { id: 'timetable', label: 'Thời khóa biểu', icon: CalendarClock },
        { id: 'feedback', label: 'Góp ý – Phản hồi', icon: MessageSquare },
        { id: 'settings', label: 'Thông tin trường', icon: Settings },
        { id: 'users', label: 'Tài khoản', icon: UserRound },
      ];
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return <div className="min-h-screen bg-[#f5f8fb] text-[#17324d] flex">
    {sidebarOpen && <button className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />}
    <aside className={`fixed lg:sticky lg:top-0 z-30 w-[255px] h-screen shrink-0 bg-[#102b49] text-white flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-[76px] px-6 flex items-center border-b border-white/10"><div className="w-9 h-9 bg-[#0052cc] grid place-items-center mr-3"><ShieldCheck size={19} /></div><div><p className="text-[9px] tracking-[.2em] text-[#83c9ed] font-bold">CỔNG THÔNG TIN</p><p className="font-extrabold">Quản trị</p></div></div>
      <div className="px-4 pt-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#7490aa] font-bold px-3 mb-3">Không gian quản trị</p>{navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold mb-1 transition-colors ${section === item.id ? 'bg-[#0052cc] text-white' : 'text-[#b8c9d8] hover:bg-white/10'}`}><Icon size={17} /> <span className="flex-1 text-left">{item.label}</span></button>; })}</div>
      <div className="mt-auto p-4 border-t border-white/10 space-y-1">
        <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 text-sm text-[#b8c9d8] hover:text-white px-3 py-2.5"><Home size={17} /> Xem trang công khai</a>
        <button className="w-full flex items-center gap-3 text-sm text-[#b8c9d8] hover:text-white px-3 py-2.5 transition-colors" onClick={() => setChangePasswordOpen(true)}><KeyRound size={17} /> Đổi mật khẩu</button>
        <button className="w-full flex items-center gap-3 text-sm text-[#b8c9d8] hover:text-white px-3 py-2.5 transition-colors" onClick={onLogout}><LogOut size={17} /> Đăng xuất</button>
      </div>
    </aside>
    <div className="flex-1 min-w-0">
      <header className="h-[76px] bg-white border-b border-[#e5edf4] flex items-center justify-between px-5 lg:px-9">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-[#17324d]" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Menu /></button>
          <div>
            <p className="text-[11px] text-[#8495a6] first-letter:uppercase">{today}</p>
            <h1 className="font-extrabold text-lg">{navItems.find(n => n.id === section)?.label}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 text-sm">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0f4f9] rounded-sm border border-[#e1eaf2]">
            <div className="w-7 h-7 bg-[#0052cc] text-white grid place-items-center">
              <UserRound size={14} />
            </div>
            <div className="text-left">
              <p className="font-bold text-xs text-[#17324d] leading-tight">{me.username}</p>
              <p className="text-[10px] text-[#63788e] leading-tight">{isEditor ? (me.categoryName ?? 'Biên tập viên') : 'Quản trị viên'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setChangePasswordOpen(true)}
            title="Đổi mật khẩu"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 border border-[#c8ddeb] text-[#0052cc] bg-[#f4f9fd] hover:bg-[#e6f2fb] transition-colors"
          >
            <KeyRound size={14} />
            <span className="hidden md:inline">Đổi mật khẩu</span>
          </button>
        </div>
      </header>
      <main className="p-5 lg:p-9 max-w-[1400px] mx-auto">
        {!isEditor && section === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {section === 'menu' && <MenuSection notify={notify} />}
        {section === 'posts' && <PostsSection notify={notify} me={me} />}
        {section === 'timetable' && <TimetableSection notify={notify} />}
        {section === 'feedback' && <FeedbackSection notify={notify} />}
        {section === 'settings' && <SettingsSection notify={notify} />}
        {section === 'users' && <AccountsSection notify={notify} />}
      </main>
    </div>
    <ChangePasswordModal
      isOpen={changePasswordOpen}
      onClose={() => setChangePasswordOpen(false)}
      notify={notify}
      username={me.username}
    />
    {toast && <div role="status" className={`fixed bottom-6 right-6 text-white px-4 py-3 text-sm shadow-xl flex items-center gap-2 z-50 max-w-md ${toast.tone === 'error' ? 'bg-[#a93226]' : 'bg-[#17324d]'}`}>{toast.tone === 'error' ? <AlertCircle size={16} /> : <Check size={16} className="text-[#69d493]" />}{toast.message}</div>}
  </div>;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function Dashboard({ onNavigate }: { onNavigate: (s: AdminSection) => void }) {
  const { data } = useLoader(async () => {
    const [all, drafts, recent, feedback, categories] = await Promise.all([
      adminApi.posts({ size: 1 }), adminApi.posts({ size: 1, status: 'DRAFT' }), adminApi.posts({ size: 6 }), adminApi.feedback(), adminApi.categories(),
    ]);
    return { posts: all.total, drafts: drafts.total, recent: recent.items, newFeedback: feedback.filter(f => f.status === 'NEW').length, categories: categories.length };
  }, [], { posts: 0, drafts: 0, recent: [] as PostSummaryDto[], newFeedback: 0, categories: 0 });

  const cards = [
    { label: 'Bài viết & văn bản', value: data.posts, icon: FileText, action: 'posts' as AdminSection },
    { label: 'Bản nháp', value: data.drafts, icon: Pencil, action: 'posts' as AdminSection },
    { label: 'Góp ý chưa xử lý', value: data.newFeedback, icon: MessageSquare, action: 'feedback' as AdminSection },
    { label: 'Đầu mục trong menu', value: data.categories, icon: FolderTree, action: 'menu' as AdminSection },
  ];
  return <>
    <PageHeading eyebrow="Tổng quan hệ thống" title="Xin chào, quản trị viên" description="Theo dõi và điều hành nội dung cổng thông tin nhà trường." />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">{cards.map(card => { const Icon = card.icon; return <button key={card.label} onClick={() => onNavigate(card.action)} className="bg-white border border-[#e3ebf3] p-5 text-left hover:border-[#0052cc] transition-colors"><div className="w-10 h-10 grid place-items-center bg-[#e8f3fb] text-[#0052cc]"><Icon size={19} /></div><p className="text-3xl font-extrabold mt-6">{String(card.value).padStart(2, '0')}</p><p className="text-xs text-[#71849b] mt-1">{card.label}</p></button>; })}</div>
    <div className="bg-white border border-[#e3ebf3] p-5"><div className="flex justify-between items-center mb-3"><h3 className="font-extrabold">Bài viết mới cập nhật</h3><button onClick={() => onNavigate('posts')} className="text-xs font-bold text-[#0052cc]">Quản lý bài viết →</button></div>
      {data.recent.length === 0 ? <p className="text-sm text-[#8a9bad] py-4">Chưa có bài viết nào.</p> : data.recent.map(post => <div key={post.id} className="flex gap-3 py-3 border-b border-[#edf1f5] last:border-0 items-center"><div className="w-8 h-8 bg-[#eaf3f8] text-[#0052cc] grid place-items-center shrink-0"><FileText size={15} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{post.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">{post.category?.name} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</p></div><StatusPill tone={post.status === 'PUBLISHED' ? 'green' : 'gray'}>{STATUS_LABELS[post.status] ?? post.status}</StatusPill></div>)}
    </div>
  </>;
}

// ---------------------------------------------------------------------------
// Menu tree
// ---------------------------------------------------------------------------

interface CategoryDraft {
  id?: string;
  parentId: string;
  name: string;
  slug: string;
  pageType: PageType;
  visible: boolean;
  showOnHome: boolean;
  externalUrl: string;
  description: string;
}

const emptyDraft = (parentId = ''): CategoryDraft => ({ parentId, name: '', slug: '', pageType: parentId ? 'POST_LIST' : 'GROUP', visible: true, showOnHome: false, externalUrl: '', description: '' });

function CategoryForm({ draft, tree, onCancel, onSave }: { draft: CategoryDraft; tree: MenuNode[]; onCancel: () => void; onSave: (draft: CategoryDraft) => Promise<void> }) {
  const [form, setForm] = useState(draft);
  const [saving, setSaving] = useState(false);
  const hasChildren = !!draft.id && tree.some(root => root.id === draft.id && root.children.length > 0);
  const isChild = !!form.parentId;
  const set = <K extends keyof CategoryDraft>(key: K, value: CategoryDraft[K]) => setForm(current => ({ ...current, [key]: value }));
  const types = (Object.keys(PAGE_TYPE_LABELS) as PageType[]).filter(t => !(isChild && t === 'GROUP'));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return <Panel title={draft.id ? `Sửa đầu mục “${draft.name}”` : 'Thêm đầu mục'} onClose={onCancel}>
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <label className="block"><span className="label-admin">Tên hiển thị trên menu *</span><input value={form.name} onChange={e => set('name', e.target.value)} className="admin-input" placeholder="VD: Tin nhà trường" maxLength={100} required /></label>
      <label className="block"><span className="label-admin">Đường dẫn (để trống = tự tạo từ tên)</span><div className="flex items-center"><span className="text-xs text-[#8a9bad] px-2">/</span><input value={form.slug} onChange={e => set('slug', e.target.value)} className="admin-input" placeholder="tin-nha-truong" /></div></label>
      <label className="block"><span className="label-admin">Thuộc nhóm</span>
        <select value={form.parentId} disabled={hasChildren} onChange={e => { const parentId = e.target.value; setForm(current => ({ ...current, parentId, pageType: parentId && current.pageType === 'GROUP' ? 'POST_LIST' : current.pageType })); }} className="admin-select w-full bg-white disabled:bg-[#f5f8fb]">
          <option value="">— Mục cấp 1 (hiện trực tiếp trên thanh menu) —</option>
          {tree.filter(root => root.id !== draft.id).map(root => <option key={root.id} value={root.id}>{root.name}</option>)}
        </select>
        {hasChildren && <span className="text-[11px] text-[#8a9bad] mt-1 block">Mục đang có mục con nên phải ở cấp 1 (menu tối đa 2 cấp).</span>}
      </label>
      <label className="block"><span className="label-admin">Kiểu trang</span>
        <select value={form.pageType} onChange={e => set('pageType', e.target.value as PageType)} className="admin-select w-full bg-white">
          {types.map(t => <option key={t} value={t}>{PAGE_TYPE_LABELS[t]}</option>)}
        </select>
      </label>
      {form.pageType === 'LINK' && <label className="block md:col-span-2"><span className="label-admin">Địa chỉ liên kết *</span><input value={form.externalUrl} onChange={e => set('externalUrl', e.target.value)} className="admin-input" placeholder="https://..." /></label>}
      <label className="block md:col-span-2"><span className="label-admin">Mô tả ngắn (hiện dưới tiêu đề trang)</span><textarea value={form.description} onChange={e => set('description', e.target.value)} className="admin-input min-h-16" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={e => set('visible', e.target.checked)} /> Hiển thị trên website</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.showOnHome} onChange={e => set('showOnHome', e.target.checked)} /> Hiện thành cột “Chuyên mục nổi bật” trên trang chủ</label>
      <div className="md:col-span-2 flex justify-end gap-2"><button type="button" onClick={onCancel} className="admin-secondary">Hủy</button><button disabled={saving} className="admin-primary disabled:opacity-60"><Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu đầu mục'}</button></div>
    </form>
  </Panel>;
}


function MenuSection({ notify }: { notify: Notify }) {
  const { data: categories, loading, error, reload } = useLoader(() => adminApi.categories(), [], [] as Category[]);
  const tree = useMemo(() => buildMenu(categories), [categories]);
  const [editing, setEditing] = useState<CategoryDraft | null>(null);

  const save = async (draft: CategoryDraft) => {
    const body = { parentId: draft.parentId || null, name: draft.name, slug: draft.slug, pageType: draft.pageType, visible: draft.visible, showOnHome: draft.showOnHome, externalUrl: draft.externalUrl, description: draft.description };
    try {
      if (draft.id) await adminApi.updateCategory(draft.id, body);
      else await adminApi.createCategory(body);
      notify(draft.id ? 'Đã cập nhật đầu mục' : 'Đã thêm đầu mục');
      setEditing(null);
      await reload();
    } catch (err) {
      notify(errorMessage(err, 'Không lưu được đầu mục'), 'error');
    }
  };

  /** Rewrites the sort order of one sibling list (and optionally moves an entry into it). */
  const applyOrder = async (siblings: Category[], parentId: string | null, message: string) => {
    try {
      await adminApi.reorderCategories(siblings.map((c, index) => ({ id: c.id, parentId, sortOrder: index })));
      notify(message);
      await reload();
    } catch (err) {
      notify(errorMessage(err, 'Không sắp xếp được'), 'error');
    }
  };

  const move = (siblings: Category[], index: number, delta: number, parentId: string | null) => {
    const next = [...siblings];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    void applyOrder(next, parentId, 'Đã đổi thứ tự');
  };

  const changeParent = (item: Category, parentId: string) => {
    const target = parentId || null;
    const siblings = target ? tree.find(r => r.id === target)?.children ?? [] : tree;
    void applyOrder([...siblings.filter(c => c.id !== item.id), item], target, target ? 'Đã chuyển sang nhóm mới' : 'Đã đưa lên cấp 1');
  };

  const toggle = async (item: Category, key: 'visible' | 'showOnHome') => {
    try {
      await adminApi.updateCategory(item.id, { ...item, [key]: !item[key] });
      await reload();
    } catch (err) {
      notify(errorMessage(err, 'Không cập nhật được'), 'error');
    }
  };

  const toDraft = (c: Category): CategoryDraft => ({ id: c.id, parentId: c.parentId ?? '', name: c.name, slug: c.slug, pageType: c.pageType, visible: c.visible, showOnHome: c.showOnHome, externalUrl: c.externalUrl ?? '', description: c.description ?? '' });

  const Row = ({ item, siblings, index, parentId }: { item: Category; siblings: Category[]; index: number; parentId: string | null }) => {
    const isRoot = !parentId;
    const children = isRoot ? tree.find(r => r.id === item.id)?.children ?? [] : [];
    return <div className={`flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 ${isRoot ? 'bg-white' : 'bg-[#fbfdff] pl-10 border-t border-[#edf1f5]'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap"><span className={isRoot ? 'font-extrabold uppercase text-sm' : 'font-semibold text-sm'}>{item.name}</span><StatusPill tone="blue">{PAGE_TYPE_LABELS[item.pageType]}</StatusPill>{!item.visible && <StatusPill tone="gray"><EyeOff size={11} /> Đang ẩn</StatusPill>}{item.showOnHome && <StatusPill tone="amber"><Home size={11} /> Trang chủ</StatusPill>}</div>
        <p className="text-[11px] text-[#8a9bad] mt-1">/{item.slug}{item.pageType === 'LINK' && item.externalUrl ? ` → ${item.externalUrl}` : ''}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {!isRoot && <select value={parentId ?? ''} onChange={e => changeParent(item, e.target.value)} className="admin-select text-xs bg-white h-8 py-0" title="Chuyển sang nhóm khác">
          {tree.map(root => <option key={root.id} value={root.id}>Nhóm: {root.name}</option>)}
          {item.pageType !== 'GROUP' && <option value="">↑ Đưa lên cấp 1</option>}
        </select>}
        {isRoot && children.length === 0 && item.pageType !== 'GROUP' && tree.length > 1 && <select value="" onChange={e => e.target.value && changeParent(item, e.target.value)} className="admin-select text-xs bg-white h-8 py-0" title="Đưa vào nhóm">
          <option value="">Đưa vào nhóm…</option>
          {tree.filter(r => r.id !== item.id).map(root => <option key={root.id} value={root.id}>{root.name}</option>)}
        </select>}
        <IconButton title="Lên" disabled={index === 0} onClick={() => move(siblings, index, -1, parentId)}><ArrowUp size={14} /></IconButton>
        <IconButton title="Xuống" disabled={index === siblings.length - 1} onClick={() => move(siblings, index, 1, parentId)}><ArrowDown size={14} /></IconButton>
        <IconButton title={item.visible ? 'Ẩn khỏi website' : 'Hiện trên website'} onClick={() => toggle(item, 'visible')}>{item.visible ? <Eye size={14} /> : <EyeOff size={14} />}</IconButton>
        {isRoot && <IconButton title="Thêm mục con" onClick={() => setEditing(emptyDraft(item.id))}><Plus size={14} /></IconButton>}
        <IconButton title="Sửa" onClick={() => setEditing(toDraft(item))}><Pencil size={14} /></IconButton>
        {item.visible && <a href={item.pageType === 'LINK' && item.externalUrl ? item.externalUrl : `/${item.slug}`} target="_blank" rel="noopener noreferrer" title="Xem trên website" className="w-8 h-8 grid place-items-center text-[#536b80] hover:text-[#0052cc]"><ExternalLink size={14} /></a>}
      </div>
    </div>;
  };

  return <>
    <PageHeading eyebrow="Cấu trúc website" title="Đầu mục & menu" description="Menu 2 cấp được tạo từ cây đầu mục này. Đổi tên, sắp xếp, chuyển nhóm hay đổi kiểu trang đều áp dụng ngay, bài viết đi theo đầu mục." action={<button onClick={() => setEditing(emptyDraft())} className="admin-primary"><Plus size={16} /> Thêm mục cấp 1</button>} />
    {editing && <CategoryForm key={editing.id ?? `new-${editing.parentId}`} draft={editing} tree={tree} onCancel={() => setEditing(null)} onSave={save} />}
    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
    {loading && categories.length === 0 ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <div className="space-y-3">
      {tree.map((root, index) => <div key={root.id} className="border border-[#e3ebf3] overflow-hidden">
        <Row item={root} siblings={tree} index={index} parentId={null} />
        {root.children.map((child, childIndex) => <Row key={child.id} item={child} siblings={root.children} index={childIndex} parentId={root.id} />)}
      </div>)}
    </div>}
  </>;
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

interface BlockDraft { key: string; type: 'TEXT' | 'IMAGE'; content: string; imageUrl: string }

const newKey = () => Math.random().toString(36).slice(2);
const toLocalInput = (value?: string | null) => (value ? value.slice(0, 16) : '');

function PostForm({ postId, tree, categories, onClose, onSaved, notify, allowedScopeIds, canFeature }: { postId: string | null; tree: MenuNode[]; categories: Category[]; onClose: () => void; onSaved: () => void; notify: Notify; allowedScopeIds?: Set<string>; canFeature: boolean }) {
  const [loaded, setLoaded] = useState(!postId);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [pinned, setPinned] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [summary, setSummary] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [blocks, setBlocks] = useState<BlockDraft[]>([{ key: newKey(), type: 'TEXT', content: '', imageUrl: '' }]);
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [doc, setDoc] = useState({ documentNumber: '', issuer: '', issuedDate: '', recipient: '', actionRequired: '' });
  const [uploading, setUploading] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!postId && !categoryId && allowedScopeIds && allowedScopeIds.size > 0) {
      const firstValid = categories.find(c => allowedScopeIds.has(c.id) && holdsPosts(c.pageType));
      if (firstValid) setCategoryId(firstValid.id);
    }
  }, [postId, categoryId, allowedScopeIds, categories]);

  useEffect(() => {
    if (!postId) return;
    adminApi.post(postId).then((post: PostDetailDto) => {
      setTitle(post.title); setSlug(post.slug); setCategoryId(post.category?.id ?? ''); setStatus(post.status); setPinned(post.pinned); setFeatured(post.featured);
      setPublishedAt(toLocalInput(post.publishedAt)); setSummary(post.summary ?? ''); setCoverUrl(post.coverUrl ?? '');
      setBlocks(post.blocks.length ? post.blocks.map(b => ({ key: newKey(), type: b.type, content: b.content ?? '', imageUrl: b.imageUrl ?? '' })) : [{ key: newKey(), type: 'TEXT', content: '', imageUrl: '' }]);
      setAttachments(post.attachments);
      setDoc({ documentNumber: post.documentNumber ?? '', issuer: post.issuer ?? '', issuedDate: post.issuedDate ?? '', recipient: post.recipient ?? '', actionRequired: post.actionRequired ?? '' });
      setLoaded(true);
    }).catch(err => { notify(errorMessage(err, 'Không tải được bài viết'), 'error'); onClose(); });
  }, [postId]);

  const category = categories.find(c => c.id === categoryId);
  const isDocument = category?.pageType === 'DOCUMENT_LIST';
  /** Photo-library post: photos only, no text and no attached files. */
  const isGallery = category?.pageType === 'GALLERY';

  const upload = async (key: string, file: File, kind: 'image' | 'file', apply: (result: any) => void) => {
    setUploading(key);
    try {
      apply(kind === 'image' ? await adminApi.uploadImage(file) : await adminApi.uploadFile(file));
    } catch (err) {
      notify(errorMessage(err, 'Tải tệp lên thất bại'), 'error');
    } finally {
      setUploading('');
    }
  };

  const updateBlock = (key: string, patch: Partial<BlockDraft>) => setBlocks(list => list.map(b => (b.key === key ? { ...b, ...patch } : b)));
  const moveBlock = (index: number, delta: number) => setBlocks(list => { const next = [...list]; const [item] = next.splice(index, 1); next.splice(index + delta, 0, item); return next; });

  /** Moves a photo past the next/previous photo, skipping any (hidden) text blocks in between. */
  const moveImage = (key: string, delta: number) => setBlocks(list => {
    const images = list.filter(b => b.type === 'IMAGE');
    const from = images.findIndex(b => b.key === key);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= images.length) return list;
    const next = [...list];
    const a = list.indexOf(images[from]);
    const b = list.indexOf(images[to]);
    [next[a], next[b]] = [next[b], next[a]];
    return next;
  });

  /** Uploads the chosen photos one after another; each becomes an image block (failures are reported, the rest go on). */
  const uploadPhotos = async (files: File[]) => {
    setUploading('gallery');
    let failed = 0;
    try {
      for (const file of files) {
        try {
          const { url } = await adminApi.uploadImage(file);
          setBlocks(list => [...list, { key: newKey(), type: 'IMAGE', content: '', imageUrl: url }]);
        } catch (err) {
          failed++;
          notify(`${file.name}: ${errorMessage(err, 'Tải ảnh lên thất bại')}`, 'error');
        }
      }
    } finally {
      setUploading('');
    }
    if (files.length - failed > 0) notify(`Đã tải lên ${files.length - failed} ảnh`);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return notify('Vui lòng nhập tiêu đề', 'error');
    if (!categoryId) return notify('Vui lòng chọn đầu mục', 'error');
    const sent = isGallery ? blocks.filter(b => b.type === 'IMAGE' && b.imageUrl.trim()) : blocks;
    if (isGallery && sent.length === 0 && !coverUrl.trim()) return notify('Bài viết trong Kho ảnh cần ít nhất một ảnh', 'error');
    const body = {
      title, slug, categoryId, status, pinned, summary, coverUrl,
      // Only an admin picks the home-slider posts; an editor's request leaves the flag as it is.
      ...(canFeature ? { featured } : {}),
      publishedAt: publishedAt ? `${publishedAt}:00` : null,
      blocks: sent.map(b => ({ type: b.type, content: b.type === 'TEXT' ? b.content : null, imageUrl: b.type === 'IMAGE' ? b.imageUrl : null })),
      attachments: isGallery ? [] : attachments,
      documentNumber: doc.documentNumber, issuer: doc.issuer, issuedDate: doc.issuedDate || null, recipient: doc.recipient, actionRequired: doc.actionRequired,
    };
    setSaving(true);
    try {
      if (postId) await adminApi.updatePost(postId, body);
      else await adminApi.createPost(body);
      notify(postId ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết');
      onSaved();
    } catch (err) {
      notify(errorMessage(err, 'Không lưu được bài viết'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <Panel title="Đang tải bài viết..." onClose={onClose}><p className="text-sm text-[#8a9bad]">Vui lòng chờ…</p></Panel>;

  return <Panel title={postId ? 'Sửa bài viết' : 'Tạo bài viết mới'} onClose={onClose}>
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2"><span className="label-admin">Tiêu đề *</span><input value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="Nhập tiêu đề" maxLength={500} /></label>
        <label className="block"><span className="label-admin">Đầu mục *</span><CategorySelect tree={tree} value={categoryId} onChange={setCategoryId} onlyPostTargets emptyLabel="— Chọn đầu mục —" allowedIds={allowedScopeIds} />
          {category && <span className="text-[11px] text-[#8a9bad] mt-1 block">Kiểu trang: {PAGE_TYPE_LABELS[category.pageType]}{category.pageType === 'PAGE' ? ' – bài mới nhất/được ghim sẽ là nội dung của trang' : ''}</span>}
        </label>
        <label className="block"><span className="label-admin">Đường dẫn (để trống = tự tạo)</span><input value={slug} onChange={e => setSlug(e.target.value)} className="admin-input" placeholder="vd: le-khai-giang-2026" /></label>
        <label className="block"><span className="label-admin">Trạng thái</span><select value={status} onChange={e => setStatus(e.target.value)} className="admin-select w-full bg-white">{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block"><span className="label-admin">Ngày đăng (để trống = bây giờ)</span><input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="admin-input" /></label>
        <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} /> Ghim lên đầu / đánh dấu quan trọng</label>
        {canFeature && <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> <Star size={14} className="text-[#a76500]" /> Hiện trên slide trang chủ (sau ảnh banner)</label>}
        <label className="block md:col-span-2"><span className="label-admin">{isGallery ? 'Mô tả ngắn (không bắt buộc)' : 'Tóm tắt (để trống = lấy đoạn đầu nội dung)'}</span><textarea value={summary} onChange={e => setSummary(e.target.value)} className="admin-input min-h-16" /></label>
        <div className="md:col-span-2"><span className="label-admin">{isGallery ? 'Ảnh bìa (để trống = ảnh đầu tiên của album)' : 'Ảnh bìa'}</span><div className="flex flex-col sm:flex-row gap-2"><input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="admin-input flex-1" placeholder="https://... hoặc tải ảnh lên" /><UploadButton label="Tải ảnh" accept="image/*" busy={uploading === 'cover'} onFile={file => upload('cover', file, 'image', r => setCoverUrl(r.url))} /></div>{coverUrl && <img src={coverUrl} alt="" className="mt-2 h-28 object-cover border border-[#e3ebf3]" />}</div>
      </div>

      {isDocument && <fieldset className="grid gap-4 md:grid-cols-2 border border-[#e3ebf3] p-4"><legend className="px-2 text-xs font-extrabold text-[#0052cc]">Thông tin văn bản</legend>
        <label className="block"><span className="label-admin">Số hiệu</span><input value={doc.documentNumber} onChange={e => setDoc({ ...doc, documentNumber: e.target.value })} className="admin-input" placeholder="VD: 12/TB-THPT" /></label>
        <label className="block"><span className="label-admin">Ngày ban hành</span><input type="date" value={doc.issuedDate} onChange={e => setDoc({ ...doc, issuedDate: e.target.value })} className="admin-input" /></label>
        <label className="block"><span className="label-admin">Đơn vị ban hành</span><input value={doc.issuer} onChange={e => setDoc({ ...doc, issuer: e.target.value })} className="admin-input" placeholder="VD: Ban Giám hiệu" /></label>
        <label className="block"><span className="label-admin">Đối tượng thực hiện</span><input value={doc.recipient} onChange={e => setDoc({ ...doc, recipient: e.target.value })} className="admin-input" /></label>
        <label className="block md:col-span-2"><span className="label-admin">Yêu cầu thực hiện</span><textarea value={doc.actionRequired} onChange={e => setDoc({ ...doc, actionRequired: e.target.value })} className="admin-input min-h-16" /></label>
      </fieldset>}

      {isGallery ? <div><span className="label-admin">Ảnh trong album ({blocks.filter(b => b.type === 'IMAGE' && b.imageUrl).length})</span>
        <p className="text-[11px] text-[#8a9bad] mb-2">Bài viết trong Kho ảnh chỉ chứa ảnh. Có thể chọn nhiều ảnh cùng lúc.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{blocks.filter(b => b.type === 'IMAGE').map((block, index, images) => <div key={block.key} className="border border-[#e3ebf3] bg-[#fbfdff]">
          {block.imageUrl ? <img src={block.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" /> : <div className="aspect-[4/3] grid place-items-center text-[11px] text-[#8a9bad]">Chưa có ảnh</div>}
          <div className="flex items-center justify-between gap-1 p-1.5">
            <div className="flex gap-1"><IconButton title="Lùi lên trước" disabled={index === 0} onClick={() => moveImage(block.key, -1)}><ArrowUp size={13} /></IconButton><IconButton title="Lùi xuống sau" disabled={index === images.length - 1} onClick={() => moveImage(block.key, 1)}><ArrowDown size={13} /></IconButton></div>
            <div className="flex gap-1">{block.imageUrl && <IconButton title="Đặt làm ảnh bìa" onClick={() => setCoverUrl(block.imageUrl)}><Star size={13} className={coverUrl === block.imageUrl ? 'text-[#a76500]' : ''} /></IconButton>}<IconButton title="Xoá ảnh" danger onClick={() => setBlocks(list => list.filter(b => b.key !== block.key))}><X size={13} /></IconButton></div>
          </div>
        </div>)}</div>
        <div className="flex flex-wrap gap-2 mt-3"><UploadButton label="Tải nhiều ảnh lên" accept="image/*" busy={uploading === 'gallery'} onFiles={uploadPhotos} /><button type="button" className="admin-secondary" onClick={() => { const url = window.prompt('Dán đường dẫn ảnh (https://...)'); if (url?.trim()) setBlocks(list => [...list, { key: newKey(), type: 'IMAGE', content: '', imageUrl: url.trim() }]); }}><Plus size={14} /> Thêm bằng đường dẫn</button></div>
      </div> : <>
      <div><span className="label-admin">Nội dung</span>
        <div className="space-y-3">{blocks.map((block, index) => <div key={block.key} className="border border-[#e3ebf3] p-3 bg-[#fbfdff]">
          <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-[#536b80] flex items-center gap-1">{block.type === 'TEXT' ? <><Type size={12} /> Đoạn văn</> : <><ImagePlus size={12} /> Hình ảnh</>}</span><div className="flex gap-1"><IconButton title="Lên" disabled={index === 0} onClick={() => moveBlock(index, -1)}><ArrowUp size={13} /></IconButton><IconButton title="Xuống" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)}><ArrowDown size={13} /></IconButton><IconButton title="Xoá khối" danger onClick={() => setBlocks(list => list.filter(b => b.key !== block.key))}><X size={13} /></IconButton></div></div>
          {block.type === 'TEXT'
            ? <RichTextEditor initial={block.content} onChange={html => updateBlock(block.key, { content: html })} placeholder="Nhập nội dung. Bôi đen chữ rồi dùng thanh công cụ để in đậm, in nghiêng, gạch dưới hoặc gắn liên kết." />
            : <div className="flex flex-col sm:flex-row gap-2"><input value={block.imageUrl} onChange={e => updateBlock(block.key, { imageUrl: e.target.value })} className="admin-input flex-1" placeholder="https://..." /><UploadButton label="Tải ảnh" accept="image/*" busy={uploading === block.key} onFile={file => upload(block.key, file, 'image', r => updateBlock(block.key, { imageUrl: r.url }))} /></div>}
          {block.type === 'IMAGE' && block.imageUrl && <img src={block.imageUrl} alt="" className="mt-2 h-28 object-cover border border-[#e3ebf3]" />}
        </div>)}</div>
        <div className="flex gap-2 mt-3"><button type="button" onClick={() => setBlocks(list => [...list, { key: newKey(), type: 'TEXT', content: '', imageUrl: '' }])} className="admin-secondary"><Type size={14} /> Thêm đoạn văn</button><button type="button" onClick={() => setBlocks(list => [...list, { key: newKey(), type: 'IMAGE', content: '', imageUrl: '' }])} className="admin-secondary"><ImagePlus size={14} /> Thêm ảnh</button></div>
      </div>

      <div><span className="label-admin">Tệp đính kèm</span>
        {attachments.length > 0 && <ul className="space-y-2 mb-3">{attachments.map((file, index) => <li key={`${file.url}-${index}`} className="flex items-center gap-2 border border-[#e3ebf3] p-2 bg-white">
          <Paperclip size={14} className="text-[#8a9bad] shrink-0" />
          <input value={file.name} onChange={e => setAttachments(list => list.map((f, i) => (i === index ? { ...f, name: e.target.value } : f)))} className="admin-input flex-1 py-1.5" />
          <span className="text-[11px] text-[#8a9bad] whitespace-nowrap">{formatFileSize(file.sizeBytes)}</span>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[#536b80] hover:text-[#0052cc]" title="Mở tệp"><ExternalLink size={14} /></a>
          <IconButton title="Gỡ tệp" danger onClick={() => setAttachments(list => list.filter((_, i) => i !== index))}><X size={13} /></IconButton>
        </li>)}</ul>}
        <div className="flex flex-wrap gap-2"><UploadButton label="Tải tệp lên (PDF, Word, Excel… ≤ 10MB)" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.txt,.zip,.rar" busy={uploading === 'attachment'} onFile={file => upload('attachment', file, 'file', r => setAttachments(list => [...list, r]))} /><button type="button" className="admin-secondary" onClick={() => { const url = window.prompt('Dán đường dẫn tệp (https://...)'); if (url) setAttachments(list => [...list, { name: decodeURIComponent(url.split('/').pop() || 'Tệp đính kèm'), url }]); }}><Plus size={14} /> Thêm bằng đường dẫn</button></div>
      </div>
      </>}

      <div className="flex justify-end gap-2 border-t border-[#edf1f5] pt-4"><button type="button" onClick={onClose} className="admin-secondary">Hủy</button><button disabled={saving || !!uploading} className="admin-primary disabled:opacity-60"><Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu bài viết'}</button></div>
    </form>
  </Panel>;
}

function PostsSection({ notify, me }: { notify: Notify; me?: AdminMe }) {
  const { data: categories } = useLoader(() => adminApi.categories(), [], [] as Category[]);
  const tree = useMemo(() => buildMenu(categories), [categories]);
  const [filter, setFilter] = useState({ category: '', status: '', q: '' });
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<{ id: string | null } | null>(null);

  const allowedScopeIds = useMemo(() => {
    if (me?.role !== 'EDITOR' || !me.categoryId) return undefined;
    const own = categories.find(c => c.id === me.categoryId);
    if (!own) return new Set<string>([me.categoryId]);
    const set = new Set<string>([own.id]);
    categories.forEach(c => {
      if (c.parentId === own.id) set.add(c.id);
    });
    return set;
  }, [categories, me]);

  useEffect(() => { const t = window.setTimeout(() => { setFilter(f => ({ ...f, q: query })); setPage(0); }, 350); return () => window.clearTimeout(t); }, [query]);
  const slugOf = (id: string) => categories.find(c => c.id === id)?.slug;
  const { data, loading, error, reload } = useLoader<PageResponse<PostSummaryDto>>(
    () => adminApi.posts({ category: filter.category ? slugOf(filter.category) : undefined, status: filter.status || undefined, q: filter.q, page, size: 20 }),
    [filter, page, categories],
    { items: [], page: 0, size: 20, total: 0, totalPages: 0 },
  );

  const canFeature = me?.role !== 'EDITOR';
  const toggleFeatured = async (post: PostSummaryDto) => {
    try { await adminApi.updatePost(post.id, { featured: !post.featured }); notify(post.featured ? 'Đã gỡ khỏi slide trang chủ' : 'Đã đưa lên slide trang chủ'); await reload(); } catch (err) { notify(errorMessage(err, 'Không cập nhật được'), 'error'); }
  };

  const toggleStatus = async (post: PostSummaryDto) => {
    try { await adminApi.updatePost(post.id, { status: post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }); await reload(); } catch (err) { notify(errorMessage(err, 'Không cập nhật được'), 'error'); }
  };

  if (form) return <PostForm postId={form.id} tree={tree} categories={categories} notify={notify} onClose={() => setForm(null)} onSaved={() => { setForm(null); void reload(); }} allowedScopeIds={allowedScopeIds} canFeature={me?.role !== 'EDITOR'} />;

  return <>
    <PageHeading eyebrow="Nội dung website" title="Bài viết & văn bản" description="Mọi nội dung (tin, trang giới thiệu, thông báo, văn bản, tài liệu) đều là bài viết thuộc một đầu mục." action={<button onClick={() => setForm({ id: null })} className="admin-primary"><Plus size={16} /> Thêm bài viết</button>} />
    <Toolbar>
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="sm:w-72"><CategorySelect tree={tree} value={filter.category} onChange={id => { setFilter(f => ({ ...f, category: id })); setPage(0); }} emptyLabel={allowedScopeIds ? "Tất cả đầu mục được phân quyền" : "Tất cả đầu mục"} allowedIds={allowedScopeIds} /></div>
        <select value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(0); }} className="admin-select bg-white sm:w-44"><option value="">Mọi trạng thái</option>{Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Tìm tiêu đề, số hiệu..." />
    </Toolbar>
    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
    {loading && data.items.length === 0 ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <DataTable
      headers={['Bài viết', 'Đầu mục', 'Ngày đăng', 'Lượt xem', 'Trạng thái', 'Hành động']}
      rows={data.items.map(item => [
        <div><p className="font-bold text-sm line-clamp-1 flex items-center gap-1.5">{item.pinned && <Pin size={12} className="text-[#a76500] shrink-0" />}{item.featured && <span title="Đang hiện trên slide trang chủ" className="shrink-0"><Star size={12} className="text-[#a76500] fill-[#f8c108]" /></span>}{item.title}</p><p className="text-[11px] text-[#8a9bad] mt-1">{item.documentNumber ? `Số ${item.documentNumber} · ` : ''}{item.author || 'admin'}{item.attachmentCount ? ` · ${item.attachmentCount} tệp` : ''}</p></div>,
        <span className="text-xs">{item.category?.name}</span>,
        <span className="text-xs whitespace-nowrap">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : ''}</span>,
        <span className="text-xs">{item.views.toLocaleString('vi-VN')}</span>,
        <button onClick={() => toggleStatus(item)} title="Bấm để đổi Đã đăng / Bản nháp"><StatusPill tone={item.status === 'PUBLISHED' ? 'green' : 'gray'}>{STATUS_LABELS[item.status] ?? item.status}</StatusPill></button>,
        <div className="flex gap-3 whitespace-nowrap">{item.status === 'PUBLISHED' && <a href={`/bai-viet/${item.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#536b80]">Xem</a>}{canFeature && item.status === 'PUBLISHED' && <button onClick={() => toggleFeatured(item)} title="Bật/tắt hiện trên slide trang chủ" className="text-xs font-bold text-[#a76500]">{item.featured ? 'Gỡ slide' : 'Lên slide'}</button>}<button onClick={() => setForm({ id: item.id })} className="text-xs font-bold text-[#0052cc]">Sửa</button></div>,
      ])}
    />}
    {data.totalPages > 1 && <div className="flex items-center justify-between mt-4 text-xs text-[#71849b]"><span>Tổng {data.total} bài · trang {page + 1}/{data.totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="admin-secondary disabled:opacity-40">← Trước</button><button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="admin-secondary disabled:opacity-40">Sau →</button></div></div>}
  </>;
}

// ---------------------------------------------------------------------------
// Accounts (admin only): editors manage the posts of assigned menu entries
// ---------------------------------------------------------------------------

function AccountsSection({ notify }: { notify: Notify }) {
  const { data: categories } = useLoader(() => adminApi.categories(), [], [] as Category[]);
  const { data: accounts, loading, error, reload } = useLoader(() => adminApi.users(), [], [] as AccountDto[]);
  const tree = useMemo(() => buildMenu(categories), [categories]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<{ id: string | null; username: string; password: string; role: AdminRole; categoryId: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const getCategoryLabel = (id: string | null) => {
    if (!id) return '—';
    const cat = categories.find(c => c.id === id);
    if (!cat) return '—';
    if (cat.parentId) {
      const parent = categories.find(c => c.id === cat.parentId);
      return `${parent ? `${parent.name} > ` : ''}${cat.name}`;
    }
    const hasChildren = categories.some(c => c.parentId === cat.id);
    return hasChildren ? `${cat.name} (toàn bộ mục con)` : cat.name;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(a =>
      a.username.toLowerCase().includes(q) ||
      (a.categoryId && getCategoryLabel(a.categoryId).toLowerCase().includes(q)) ||
      (a.role === 'ADMIN' ? 'quản trị viên admin' : 'biên tập viên editor').includes(q)
    );
  }, [accounts, query, categories]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const categoryId = form.role === 'EDITOR' ? form.categoryId || null : null;
      if (form.id) {
        await adminApi.updateUser(form.id, {
          username: form.username.trim(),
          role: form.role,
          categoryId,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        });
        notify('Đã cập nhật tài khoản');
      } else {
        await adminApi.createUser({
          username: form.username.trim(),
          password: form.password.trim(),
          role: form.role,
          categoryId,
        });
        notify('Đã tạo tài khoản mới thành công');
      }
      setForm(null);
      await reload();
    } catch (err) {
      notify(errorMessage(err, 'Không lưu được tài khoản'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (account: AccountDto) => {
    if (!window.confirm(`Xóa tài khoản "${account.username}"?`)) return;
    try {
      await adminApi.deleteUser(account.id);
      notify('Đã xóa tài khoản');
      await reload();
    } catch (err) {
      notify(errorMessage(err, 'Không xóa được tài khoản (tài khoản đã đăng bài không thể xóa)'), 'error');
    }
  };

  return <>
    <PageHeading
      eyebrow="Quản lý người dùng & phân quyền"
      title="Tài khoản hệ thống"
      description="Tạo và phân quyền quản trị theo từng đầu mục hoặc toàn quyền hệ thống. Mọi tài khoản đều có thể tự đổi mật khẩu cá nhân."
      action={<button onClick={() => setForm({ id: null, username: '', password: '', role: 'EDITOR', categoryId: '' })} className="admin-primary"><Plus size={16} /> Thêm tài khoản mới</button>}
    />
    {form && <Panel title={form.id ? `Chỉnh sửa tài khoản: ${form.username}` : 'Thêm tài khoản mới'} onClose={() => setForm(null)}>
      <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="label-admin">Tên đăng nhập *</span>
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            className="admin-input"
            autoComplete="off"
            placeholder="vd: giaovien_toan, bientap_tintuc"
            required
          />
        </label>
        <label className="block">
          <span className="label-admin">{form.id ? 'Đổi mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu ban đầu (tối thiểu 8 ký tự) *'}</span>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="admin-input"
            autoComplete="new-password"
            placeholder={form.id ? 'Nhập nếu muốn đổi mật khẩu cho user này' : 'Nhập mật khẩu ít nhất 8 ký tự'}
            required={!form.id}
          />
        </label>
        <label className="block">
          <span className="label-admin">Vai trò tài khoản *</span>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value as AdminRole })}
            className="admin-select w-full bg-white"
          >
            <option value="EDITOR">Biên tập viên (quản lý theo đầu mục)</option>
            <option value="ADMIN">Quản trị viên (toàn quyền hệ thống)</option>
          </select>
        </label>
        {form.role === 'EDITOR' && (
          <label className="block">
            <span className="label-admin">Phân quyền đầu mục quản lý *</span>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="admin-select w-full bg-white font-medium"
              required
            >
              <option value="">— Chọn đầu mục phụ trách —</option>
              {tree.map(root => (
                <optgroup key={root.id} label={`📁 Nhóm: ${root.name}`}>
                  <option value={root.id} className="font-bold">
                    📁 {root.name} {root.children.length > 0 ? '(Quản lý mục này và toàn bộ mục con)' : ''}
                  </option>
                  {root.children.map(child => (
                    <option key={child.id} value={child.id}>
                      &nbsp;&nbsp;&nbsp;&nbsp;↳ {child.name} {child.visible ? '' : ' (đang ẩn)'}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="text-[11px] text-[#71849b] mt-1 block">
              Biên tập viên chỉ xem và đăng/sửa bài viết thuộc đầu mục này (và các mục con nếu có).
            </span>
          </label>
        )}
        <div className="sm:col-span-2 flex gap-2 pt-2 border-t border-[#edf1f5]">
          <button disabled={saving} className="admin-primary disabled:opacity-60">
            {saving ? 'Đang lưu...' : (form.id ? 'Cập nhật tài khoản' : 'Tạo tài khoản')}
          </button>
          <button type="button" onClick={() => setForm(null)} className="admin-secondary">
            Hủy
          </button>
        </div>
      </form>
    </Panel>}

    <Toolbar>
      <div className="flex items-center gap-2 text-xs text-[#71849b]">
        <span>Tổng số: <strong className="text-[#17324d]">{filtered.length}</strong> tài khoản</span>
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Tìm tài khoản, đầu mục..." />
    </Toolbar>

    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
    {loading && accounts.length === 0 ? (
      <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p>
    ) : (
      <DataTable
        headers={['Tên đăng nhập', 'Vai trò', 'Đầu mục được phân quyền', 'Ngày tạo', 'Hành động']}
        rows={filtered.map(a => [
          <div>
            <p className="font-bold text-sm text-[#17324d] flex items-center gap-1.5">
              <UserRound size={14} className="text-[#0052cc]" />
              {a.username}
            </p>
          </div>,
          <StatusPill tone={a.role === 'ADMIN' ? 'blue' : 'green'}>
            {a.role === 'ADMIN' ? 'Quản trị viên' : 'Biên tập viên'}
          </StatusPill>,
          <div className="text-xs">
            {a.role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 text-[#0052cc] font-semibold bg-[#e6f2fb] px-2 py-0.5">
                <ShieldCheck size={12} /> Toàn bộ hệ thống
              </span>
            ) : (
              <span className="font-medium text-[#2c3e50] bg-[#f0f4f9] px-2 py-0.5 border border-[#d8e3ed]">
                {getCategoryLabel(a.categoryId)}
              </span>
            )}
          </div>,
          <span className="text-xs text-[#8a9bad] whitespace-nowrap">
            {a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : '—'}
          </span>,
          <div className="flex gap-3 whitespace-nowrap">
            <button
              onClick={() => setForm({ id: a.id, username: a.username, password: '', role: a.role === 'EDITOR' ? 'EDITOR' : 'ADMIN', categoryId: a.categoryId ?? '' })}
              className="text-xs font-bold text-[#0052cc] hover:underline flex items-center gap-1"
            >
              <Pencil size={12} /> Sửa / Đổi MK
            </button>
            <button
              onClick={() => remove(a)}
              className="text-xs font-bold text-[#a93226] hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} /> Xóa
            </button>
          </div>,
        ])}
      />
    )}
  </>;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

function FeedbackSection({ notify }: { notify: Notify }) {
  const { data: items, loading, error, reload } = useLoader(() => adminApi.feedback(), [], [] as FeedbackDto[]);
  const [statusFilter, setStatusFilter] = useState<'' | FeedbackDto['status']>('');
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const filtered = items.filter(item => (!statusFilter || item.status === statusFilter)
    && `${item.fullName} ${item.subject ?? ''} ${item.content} ${item.email ?? ''}`.toLowerCase().includes(query.toLowerCase()));

  const update = async (item: FeedbackDto, body: { status?: string; note?: string }, message: string) => {
    try { await adminApi.updateFeedback(item.id, body); notify(message); await reload(); } catch (err) { notify(errorMessage(err, 'Không cập nhật được'), 'error'); }
  };
  const remove = async (item: FeedbackDto) => {
    if (!window.confirm('Xoá góp ý này?')) return;
    try { await adminApi.deleteFeedback(item.id); notify('Đã xoá góp ý'); await reload(); } catch (err) { notify(errorMessage(err, 'Không xoá được'), 'error'); }
  };

  return <>
    <PageHeading eyebrow="Tương tác người dùng" title="Góp ý – Phản hồi" description="Ý kiến gửi từ trang “Góp ý – Phản hồi” trên website." />
    <Toolbar>
      <div className="flex gap-2 flex-wrap">{([['', 'Tất cả'], ['NEW', FEEDBACK_LABELS.NEW], ['IN_PROGRESS', FEEDBACK_LABELS.IN_PROGRESS], ['RESOLVED', FEEDBACK_LABELS.RESOLVED]] as const).map(([value, label]) => <button key={value} onClick={() => setStatusFilter(value)} className={`filter-chip ${statusFilter === value ? 'active' : ''}`}>{label} ({value ? items.filter(i => i.status === value).length : items.length})</button>)}</div>
      <SearchBox value={query} onChange={setQuery} placeholder="Tìm người gửi, nội dung..." />
    </Toolbar>
    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
    {loading && items.length === 0 ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : filtered.length === 0 ? <p className="p-10 text-center text-sm text-[#8a9bad] bg-white border border-[#e3ebf3]">Chưa có góp ý phù hợp.</p> : <div className="space-y-3">{filtered.map(item => <div key={item.id} className="bg-white border border-[#e3ebf3] p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-3 min-w-0"><div className="w-9 h-9 bg-[#eaf3f8] text-[#0052cc] grid place-items-center shrink-0"><MessageSquare size={16} /></div><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-bold text-sm">{item.subject || '(Không có tiêu đề)'}</h3><StatusPill tone={item.status === 'NEW' ? 'amber' : item.status === 'IN_PROGRESS' ? 'blue' : 'green'}>{FEEDBACK_LABELS[item.status]}</StatusPill></div><p className="text-xs text-[#71849b] mt-1">{item.fullName}{item.email ? ` · ${item.email}` : ''}{item.phone ? ` · ${item.phone}` : ''} · {new Date(item.createdAt).toLocaleString('vi-VN')}</p><p className="text-sm text-[#4f6478] mt-3 whitespace-pre-line">{item.content}</p></div></div>
        <div className="flex gap-2 shrink-0"><select value={item.status} onChange={e => update(item, { status: e.target.value }, 'Đã cập nhật trạng thái')} className="admin-select text-xs bg-white">{Object.entries(FEEDBACK_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><IconButton title="Xoá" danger onClick={() => remove(item)}><Trash2 size={14} /></IconButton></div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2"><input value={notes[item.id] ?? item.note ?? ''} onChange={e => setNotes(n => ({ ...n, [item.id]: e.target.value }))} className="admin-input flex-1" placeholder="Ghi chú xử lý (chỉ quản trị viên thấy)" /><button onClick={() => update(item, { note: notes[item.id] ?? item.note ?? '' }, 'Đã lưu ghi chú')} className="admin-secondary">Lưu ghi chú</button></div>
    </div>)}</div>}
  </>;
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

function SettingsSection({ notify }: { notify: Notify }) {
  const { data, loading } = useLoader(() => adminApi.settings(), [], {} as Record<string, string>);
  const [form, setForm] = useState<Partial<SiteInfo>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { const next: Partial<SiteInfo> = {}; SETTING_FIELDS.forEach(f => { next[f.key] = data[f.key] ?? DEFAULT_SITE[f.key]; }); setForm(next); }, [data]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try { await adminApi.updateSettings(form as Record<string, string>); notify('Đã lưu thông tin trường'); } catch (err) { notify(errorMessage(err, 'Không lưu được'), 'error'); } finally { setSaving(false); }
  };

  return <>
    <PageHeading eyebrow="Cấu hình" title="Thông tin trường" description="Hiển thị ở đầu trang, chân trang, trang Liên hệ và Bản đồ." />
    {loading ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <form onSubmit={submit} className="bg-white border border-[#e3ebf3] p-5 grid gap-4 md:grid-cols-2">
      {SETTING_FIELDS.map(field => <label key={field.key} className={`block ${field.wide ? 'md:col-span-2' : ''}`}><span className="label-admin">{field.label}</span>
        {field.multiline
          ? <textarea value={form[field.key] ?? ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="admin-input min-h-24 font-mono text-xs" />
          : <input value={form[field.key] ?? ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="admin-input" />}
        {field.hint && <span className="text-[11px] text-[#8a9bad] mt-1 block">{field.hint}</span>}
      </label>)}
      <div className="md:col-span-2 flex justify-end"><button disabled={saving} className="admin-primary disabled:opacity-60"><Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
    </form>}
  </>;
}

// ---------------------------------------------------------------------------
// Timetable
// ---------------------------------------------------------------------------

type Grid = Record<string, { subject: string; teacher: string }>;
const WEEK = [2, 3, 4, 5, 6, 7];
const gradeOf = (name: string) => Number(/^(\d{1,2})/.exec(name.trim())?.[1] ?? NaN);

function TimetableSection({ notify }: { notify: Notify }) {
  const { data, loading, error, reload } = useLoader(() => adminApi.timetable(), [], EMPTY_TIMETABLE);
  const settings = useLoader(() => adminApi.settings(), [], {} as Record<string, string>);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [grid, setGrid] = useState<Grid>({});
  const [newClass, setNewClass] = useState('');
  const [saving, setSaving] = useState(false);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [info, setInfo] = useState({ term: '', notes: '' });

  const saved = useMemo(() => Array.from(new Set(data.entries.map(e => e.className))), [data.entries]);
  const classes = useMemo(() => Array.from(new Set([...saved, ...drafts])).sort((a, b) => gradeOf(a) - gradeOf(b) || compareClassNames(a, b)), [saved, drafts]);
  const grades = useMemo(() => Array.from(new Set(classes.map(gradeOf))), [classes]);

  useEffect(() => { if (!selected && classes.length) setSelected(classes[0]); }, [classes, selected]);
  useEffect(() => {
    const next: Grid = {};
    data.entries.filter(e => e.className === selected).forEach(e => { next[`${e.dayOfWeek}-${e.period}`] = { subject: e.subject, teacher: e.teacher ?? '' }; });
    setGrid(next);
  }, [selected, data.entries]);
  useEffect(() => setPeriods(data.periods.map(p => ({ ...p, startTime: p.startTime.slice(0, 5), endTime: p.endTime.slice(0, 5) }))), [data.periods]);
  useEffect(() => setInfo({ term: settings.data.timetable_term ?? '', notes: settings.data.timetable_notes ?? '' }), [settings.data]);

  const days = Object.keys(grid).some(k => k.startsWith('8-')) ? [...WEEK, 8] : WEEK;
  const setCell = (key: string, patch: Partial<Grid[string]>) => setGrid(g => ({ ...g, [key]: { ...(g[key] ?? { subject: '', teacher: '' }), ...patch } }));

  const saveClass = async () => {
    const entries = Object.entries(grid)
      .filter(([, v]) => v.subject.trim())
      .map(([key, v]) => { const [day, period] = key.split('-').map(Number); return { dayOfWeek: day, period, subject: v.subject.trim(), teacher: v.teacher.trim() }; });
    if (entries.length === 0) return notify('Lớp chưa có tiết học nào để lưu', 'error');
    setSaving(true);
    try {
      await adminApi.saveTimetableClass(selected, entries);
      setDrafts(d => d.filter(c => c !== selected));
      notify(`Đã lưu thời khóa biểu lớp ${selected}`);
      await reload();
    } catch (err) { notify(errorMessage(err, 'Không lưu được thời khóa biểu'), 'error'); } finally { setSaving(false); }
  };

  const removeClass = async () => {
    if (!window.confirm(`Xoá toàn bộ thời khóa biểu lớp ${selected}?`)) return;
    try {
      if (saved.includes(selected)) await adminApi.deleteTimetableClass(selected);
      setDrafts(d => d.filter(c => c !== selected));
      setSelected('');
      notify('Đã xoá lớp');
      await reload();
    } catch (err) { notify(errorMessage(err, 'Không xoá được lớp'), 'error'); }
  };

  const addClass = () => {
    const name = newClass.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const grade = gradeOf(name);
    if (!(grade >= 1 && grade <= 12)) return notify('Tên lớp phải bắt đầu bằng khối, ví dụ 10A5', 'error');
    if (classes.includes(name)) return notify('Lớp đã tồn tại', 'error');
    setDrafts(d => [...d, name]);
    setSelected(name);
    setNewClass('');
  };

  const copyFrom = (source: string) => {
    if (!source) return;
    const next: Grid = {};
    data.entries.filter(e => e.className === source).forEach(e => { next[`${e.dayOfWeek}-${e.period}`] = { subject: e.subject, teacher: e.teacher ?? '' }; });
    setGrid(next);
    notify(`Đã chép từ lớp ${source} – nhớ bấm Lưu`);
  };

  const savePeriods = async () => {
    try { await adminApi.saveTimetablePeriods(periods); notify('Đã lưu giờ học'); await reload(); } catch (err) { notify(errorMessage(err, 'Không lưu được giờ học'), 'error'); }
  };
  const saveInfo = async () => {
    try { await adminApi.updateSettings({ timetable_term: info.term, timetable_notes: info.notes }); notify('Đã lưu thông tin thời khóa biểu'); } catch (err) { notify(errorMessage(err, 'Không lưu được'), 'error'); }
  };

  return <>
    <PageHeading eyebrow="Học tập" title="Thời khóa biểu" description="Nhập thời khóa biểu theo lớp. Trang “Thời khóa biểu” trên website hiển thị đúng dữ liệu này." />
    {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
    {loading && data.periods.length === 0 ? <p className="p-5 text-center text-sm text-[#8a9bad]">Đang tải dữ liệu...</p> : <div className="grid gap-5 xl:grid-cols-[230px_1fr]">
      <div className="bg-white border border-[#e3ebf3] p-4 h-fit">
        <p className="label-admin">Lớp ({classes.length})</p>
        {grades.map(g => <div key={g} className="mb-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8092a4] mb-1.5">Khối {g}</p><div className="flex flex-wrap gap-1.5">{classes.filter(c => gradeOf(c) === g).map(c => <button key={c} onClick={() => setSelected(c)} className={`filter-chip ${selected === c ? 'active' : ''}`}>{c}{saved.includes(c) ? '' : ' *'}</button>)}</div></div>)}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#edf1f5]"><input value={newClass} onChange={e => setNewClass(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addClass(); }} className="admin-input py-1.5" placeholder="VD: 10A5" maxLength={30} /><button type="button" onClick={addClass} className="admin-secondary px-3" title="Thêm lớp" aria-label="Thêm lớp"><Plus size={14} /></button></div>
        <p className="text-[11px] text-[#8a9bad] mt-2">Lớp có dấu * chưa được lưu.</p>
      </div>

      <div className="min-w-0 space-y-5">
        {selected ? <div className="bg-white border border-[#e3ebf3] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-extrabold">Lớp {selected}</h3>
            <div className="flex flex-wrap gap-2">
              <select value="" onChange={e => copyFrom(e.target.value)} className="admin-select text-xs bg-white"><option value="">Sao chép từ lớp…</option>{saved.filter(c => c !== selected).map(c => <option key={c} value={c}>{c}</option>)}</select>
              <button type="button" onClick={removeClass} className="admin-secondary !text-red-600"><Trash2 size={14} /> Xoá lớp</button>
              <button type="button" disabled={saving} onClick={saveClass} className="admin-primary disabled:opacity-60"><Check size={15} /> {saving ? 'Đang lưu...' : 'Lưu thời khóa biểu'}</button>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left">
            <thead><tr className="bg-[#f8fafc]"><th className="px-2 py-2 text-[10px] uppercase text-[#8092a4] font-extrabold w-24">Tiết</th>{days.map(d => <th key={d} className="px-2 py-2 text-[10px] uppercase text-[#8092a4] font-extrabold">{DAY_LABELS[d]}</th>)}</tr></thead>
            <tbody>{periods.map(p => <React.Fragment key={p.period}>
              {p.period === LAST_MORNING_PERIOD + 1 && <tr><td colSpan={days.length + 1} className="px-2 pt-4 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0052cc]">Buổi chiều</td></tr>}
              <tr className="border-t border-[#edf1f5]"><td className="px-2 py-1.5 align-top"><p className="text-xs font-bold">Tiết {p.period}</p><p className="text-[10px] text-[#8a9bad]">{p.startTime}–{p.endTime}</p></td>
                {days.map(d => { const key = `${d}-${p.period}`; const cell = grid[key]; return <td key={d} className="px-1 py-1 align-top"><input value={cell?.subject ?? ''} onChange={e => setCell(key, { subject: e.target.value })} className="admin-input py-1 px-2 text-xs font-semibold" placeholder="Môn" maxLength={100} aria-label={`Môn – ${DAY_LABELS[d]}, tiết ${p.period}`} /><input value={cell?.teacher ?? ''} onChange={e => setCell(key, { teacher: e.target.value })} className="admin-input py-1 px-2 text-[11px] mt-1" placeholder="Giáo viên" maxLength={100} aria-label={`Giáo viên – ${DAY_LABELS[d]}, tiết ${p.period}`} /></td>; })}
              </tr>
            </React.Fragment>)}</tbody>
          </table></div>
        </div> : <p className="bg-white border border-[#e3ebf3] p-10 text-center text-sm text-[#8a9bad]">Thêm một lớp để bắt đầu nhập thời khóa biểu.</p>}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="bg-white border border-[#e3ebf3] p-4">
            <h3 className="font-extrabold mb-3">Giờ học các tiết</h3>
            <div className="space-y-1.5">{periods.map((p, index) => <div key={p.period} className="flex items-center gap-2"><span className="text-xs font-bold w-14 shrink-0">Tiết {p.period}</span><input type="time" value={p.startTime} onChange={e => setPeriods(list => list.map((x, i) => (i === index ? { ...x, startTime: e.target.value } : x)))} className="admin-input py-1" /><span className="text-xs text-[#8a9bad]">–</span><input type="time" value={p.endTime} onChange={e => setPeriods(list => list.map((x, i) => (i === index ? { ...x, endTime: e.target.value } : x)))} className="admin-input py-1" /></div>)}</div>
            <div className="flex flex-wrap gap-2 mt-3"><button type="button" className="admin-secondary" onClick={() => setPeriods(list => [...list, { period: (list.at(-1)?.period ?? 0) + 1, startTime: '17:50', endTime: '18:35' }])}><Plus size={14} /> Thêm tiết</button><button type="button" className="admin-secondary disabled:opacity-40" disabled={periods.length <= 1} onClick={() => setPeriods(list => list.slice(0, -1))}><X size={14} /> Bỏ tiết cuối</button><button type="button" onClick={savePeriods} className="admin-primary"><Check size={15} /> Lưu giờ học</button></div>
          </div>
          <div className="bg-white border border-[#e3ebf3] p-4">
            <h3 className="font-extrabold mb-3">Thông tin hiển thị</h3>
            <label className="block"><span className="label-admin">Học kỳ / thời gian áp dụng</span><input value={info.term} onChange={e => setInfo({ ...info, term: e.target.value })} className="admin-input" placeholder="VD: Học kỳ I · Năm học 2026 – 2027 · Áp dụng từ 05/10/2026" /></label>
            <label className="block mt-3"><span className="label-admin">Ghi chú (mỗi dòng một ý)</span><textarea value={info.notes} onChange={e => setInfo({ ...info, notes: e.target.value })} className="admin-input min-h-28" /></label>
            <div className="flex justify-end mt-3"><button type="button" onClick={saveInfo} className="admin-primary"><Check size={15} /> Lưu thông tin</button></div>
          </div>
        </div>
      </div>
    </div>}
  </>;
}

// ---------------------------------------------------------------------------

export function AdminApp() {
  // undefined = checking the stored token, null = signed out.
  const [me, setMe] = useState<AdminMe | null | undefined>(() => (getAdminToken() ? undefined : null));
  const refresh = useCallback(() => { void fetchAdminMe().then(setMe); }, []);
  const login = () => { window.history.pushState({}, '', ADMIN_PATH); setMe(undefined); refresh(); };
  const logout = () => { logoutAdmin(); setMe(null); window.history.pushState({}, '', ADMIN_LOGIN_PATH); };
  useEffect(() => {
    // Drop back to the login screen when the token is missing, expired or rejected by the API.
    if (getAdminToken()) refresh();
    const onExpired = () => setMe(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [refresh]);
  if (me === undefined) return <div className="grid min-h-screen place-items-center text-sm text-[#71849b]">Đang kiểm tra phiên đăng nhập…</div>;
  return me ? <AdminPortal me={me} onLogout={logout} /> : <AdminLogin onLogin={login} />;
}
