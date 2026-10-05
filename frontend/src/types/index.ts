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
  | { view: 'category1-list'; id?: string }
  | { view: 'category1-detail'; id: string }
  | { view: 'category2-list' }
  | { view: 'category2-detail'; id: string }
  | { view: 'category3-list' }
  | { view: 'category3-detail'; id: string }
  | { view: 'category4-list' }
  | { view: 'category4-detail'; id: string }
  | { view: 'category5-list' }
  | { view: 'category5-detail'; id: string }
  | { view: 'category6-list' }
  | { view: 'category6-detail'; id: string }
  | { view: 'tkb' }
  | { view: 'calendar' };

