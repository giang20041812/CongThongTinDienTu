export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  imageFallbackTitle: string;
  summary: string;
  content: string;
  author: string;
  views: number;
  imageUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  department: string;
  isImportant?: boolean;
  fileAttachment?: string;
  content: string;
}

export interface SchoolHighlight {
  id: string;
  title: string;
  date: string;
  summary: string;
  tag: string;
  stats?: { label: string; value: string };
  content: string;
  imageUrl?: string;
}

export interface AdmissionItem {
  id: string;
  title: string;
  date: string;
  deadline?: string;
  target: string;
  quota?: number;
  description: string;
  imageUrl?: string;
}

export interface StudyAbroadItem {
  id: string;
  title: string;
  country: string;
  date: string;
  scholarshipRate: string;
  deadline: string;
  description: string;
  imageUrl?: string;
}

export interface ClubItem {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  established: string;
  badgeText: string;
  recentActivity: string;
  imageUrl?: string;
}


export type ActiveModal =
  | { type: 'news'; data: NewsItem }
  | { type: 'announcement'; data: AnnouncementItem }
  | { type: 'tkb' }
  | { type: 'calendar' }
  | null;

export type PageRoute =
  | { view: 'home' }
  | { view: 'news-list' }
  | { view: 'news-detail'; id: string }
  | { view: 'announcement-list' }
  | { view: 'announcement-detail'; id: string }
  | { view: 'admissions-list' }
  | { view: 'admission-detail'; id: string }
  | { view: 'study-abroad-list' }
  | { view: 'study-abroad-detail'; id: string }
  | { view: 'tkb' }
  | { view: 'calendar' }
  | { view: 'clubs-list' }
  | { view: 'club-detail'; id: string };
