import React from 'react';
import { Calendar, Clock, BookOpen, User, Megaphone, FileText, Globe } from 'lucide-react';

interface QuickLinksSectionProps {
  onNavigate: (view: string) => void;
  onOpenQuickModal?: (type: string) => void;
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({ onNavigate, onOpenQuickModal }) => {
  const links = [
    { id: 'tkb', icon: Clock, label: 'Thời khóa biểu', color: 'bg-blue-500', action: () => onNavigate('tkb') },
    { id: 'calendar', icon: Calendar, label: 'Lịch công tác', color: 'bg-green-500', action: () => onNavigate('calendar') },
    { id: 'admissions', icon: User, label: 'Tuyển sinh 10', color: 'bg-orange-500', action: () => onNavigate('admissions-list') },
    { id: 'announcements', icon: Megaphone, label: 'Thông báo', color: 'bg-red-500', action: () => onNavigate('announcement-list') },
    { id: 'study-abroad', icon: Globe, label: 'Du học', color: 'bg-purple-500', action: () => onNavigate('study-abroad-list') },
    { id: 'documents', icon: FileText, label: 'Văn bản - Biểu mẫu', color: 'bg-teal-500', action: () => onNavigate('home') },
  ];

  return (
    <section className="w-full bg-[#f8f9fa] border-b border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={link.action}
                className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-black hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-inner ${link.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 text-center uppercase tracking-wide group-hover:text-black transition-colors">
                  {link.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};



