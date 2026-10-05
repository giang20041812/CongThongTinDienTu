import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminSection } from './components/AdminLayout';
import { DashboardSection } from './DashboardSection';
import { NewsSection } from './NewsSection';
import { CategorySection } from './CategorySection';
import { AnnouncementSection } from './AnnouncementSection';
import { FeedbackSection, FeedbackStatus } from './FeedbackSection';

const feedbackSeed = [
  { id: 'FB-1024', name: 'Nguyễn Minh Anh', subject: 'Góp ý về lịch làm việc', message: 'Nên bổ sung bộ lọc theo ngày cho lịch làm việc của giáo viên.', date: '06/09/2026', status: 'Chưa xử lý' as FeedbackStatus },
  { id: 'FB-1023', name: 'Lê Hoàng Nam', subject: 'Không nhận được thông báo', message: 'Em chưa thấy thông báo đăng ký chuyên đề trên tài khoản.', date: '05/09/2026', status: 'Đang xử lý' as FeedbackStatus },
  { id: 'FB-1022', name: 'Trần Thu Hà', subject: 'Đề xuất thư viện số', message: 'Mong nhà trường bổ sung thêm tài liệu ôn thi học sinh giỏi.', date: '04/09/2026', status: 'Đã phản hồi' as FeedbackStatus },
];

export function AdminApp() { 
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('cva-admin') === 'true'); 
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [feedback, setFeedback] = useState(feedbackSeed);

  const login = () => { sessionStorage.setItem('cva-admin', 'true'); setAuthenticated(true); window.history.pushState({}, '', '/admin'); }; 
  const logout = () => { sessionStorage.removeItem('cva-admin'); setAuthenticated(false); window.history.pushState({}, '', '/admin/login'); }; 

  const notify = (message: string, type: 'success' | 'error' = 'success') => { setToast({ message, type }); window.setTimeout(() => setToast(null), 3000); };

  if (!authenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const feedbackCount = feedback.filter(f => f.status !== 'Đã phản hồi').length;

  return (
    <AdminLayout onLogout={logout} section={section} setSection={setSection} toast={toast} feedbackCount={feedbackCount}>
      {section === 'dashboard' && <DashboardSection onNavigate={setSection} feedbackCount={feedbackCount} />}
      {section === 'news' && <NewsSection notify={notify} />}
      {section === 'categories' && <CategorySection notify={notify} />}
      {section === 'announcements' && <AnnouncementSection notify={notify} />}
      {section === 'feedback' && <FeedbackSection items={feedback} onStatus={(id, status) => { setFeedback(items => items.map(item => item.id === id ? { ...item, status } : item)); notify('Đã cập nhật trạng thái phản hồi'); }} />}
    </AdminLayout>
  );
}
