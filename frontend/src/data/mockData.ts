import {
  NewsItem,
  AnnouncementItem,
  SchoolHighlight,
  AdmissionItem,
  StudyAbroadItem,
  ClubItem,
  LostItem,
} from '../types';

export const SCHOOL_INFO = {
  name: 'THPT ĐẶNG TRẦN ĐỨC',
  secondaryName: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI',
  slogan: 'TRÍ TUỆ - NHÂN VĂN - KỶ CƯƠNG',
  address: 'Hà Nội, Việt Nam',
  email: 'thptdangtranduc@gmail.com',
  officialEmail: 'c3dangtranduc@hanoiedu.vn',
  hotline: '024 3xxx xxxx',
  phone: '024 3xxx xxxx',
  establishedYear: '1968',
  stats: [
    { label: 'Học sinh đạt giải Quốc gia & Quốc tế', value: '120+' },
    { label: 'Tỷ lệ đỗ Đại học nguyện vọng 1', value: '98.5%' },
    { label: 'Thầy cô giáo viên dạy giỏi', value: '80+' },
    { label: 'Câu lạc bộ tài năng & ngoại khóa', value: '20' },
  ],
};

export const BANNER_SLIDES = [
  {
    id: 'banner-1',
    title: 'LỄ KHAI GIẢNG NĂM HỌC MỚI 2026 – 2027',
    subtitle: 'Hòa chung không khí tưng bừng của ngày hội toàn dân đưa trẻ đến trường',
    tag: 'SỰ KIỆN NỔI BẬT',
    date: '05/09/2026',
    abstract: 'Tiếp nối truyền thống vẻ vang hơn một thế kỷ, thầy và trò nhà trường sẵn sàng bước vào chặng đường giáo dục hội nhập và bứt phá công nghệ.',
  },
  {
    id: 'banner-2',
    title: 'KỲ THI CHỌN HỌC SINH GIỎI CỤM GIA LÂM - LONG BIÊN',
    subtitle: 'Ban hành ma trận đề thi và kế hoạch tổ chức thi chuẩn hóa các bộ môn',
    tag: 'HOẠT ĐỘNG CHUYÊN MÔN',
    date: '18/09/2026',
    abstract: 'Đảm bảo tính khách quan, phân hóa cao và khuyến khích năng lực sáng tạo trong nghiên cứu khoa học kỹ thuật của thế hệ học sinh tương lai.',
  },
  {
    id: 'banner-3',
    title: 'TUYỂN SINH LỚP 10 CHUYÊN VÀ CHƯƠNG TRÌNH SONG BẰNG QUỐC TẾ',
    subtitle: 'Mở rộng cơ hội học tập tiêu chuẩn Cambridge và các học bổng danh giá',
    tag: 'TUYỂN SINH MỚI',
    date: '24/09/2026',
    abstract: 'Chương trình đào tạo toàn diện, cơ sở vật chất chuẩn quốc gia với khu thí nghiệm STEM và trung tâm khảo thí hiện đại bậc nhất Thủ đô.',
  },
];

export const ALL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '05/09/2026',
    category: 'CHUYÊN MÔN',
    imageFallbackTitle: 'HỘI THI HSG CỤM THPT HÀ NỘI',
    summary:
      'Sáng ngày 5/9/2026, hòa chung không khí tưng bừng của ngày hội toàn dân đưa trẻ đến trường, Trường THPT Chuyên Chu Văn An long trọng tổ chức Lễ Khai giảng năm học 2026–2027. Trong tiết thu Hà Nội trong trẻo, sân trường rợp sắc cờ đỏ thắm...',
    content: `Sáng ngày 5/9/2026, hòa chung không khí tưng bừng của ngày hội toàn dân đưa trẻ đến trường trên cả nước, Trường long trọng tổ chức Lễ Khai giảng năm học 2026–2027.

Ban Giám hiệu nhà trường cùng Hội đồng cụm trường THPT Gia Lâm - Long Biên đã chính thức công bố cấu trúc ma trận đề thi và hướng dẫn ôn tập chi tiết môn Tin học cùng các môn khoa học trọng điểm năm học 2023–2024 và định hướng phát triển năng lực số năm 2026–2027.

Đặc biệt, kỳ thi năm nay chú trọng kiểm tra năng lực tư duy thuật toán, ứng dụng trí tuệ nhân tạo và xử lý dữ liệu thực tế, khuyến khích học sinh chủ động nghiên cứu và phát triển phẩm chất cá nhân toàn diện. Ban Chuyên môn yêu cầu các trường trực thuộc cụm nghiêm túc triển khai bồi dưỡng học sinh giỏi theo đúng kế hoạch liên tịch.`,
    author: 'Ban Giám Hiệu & Tổ Chuyên Môn',
    views: 2450,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-2',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '03/09/2026',
    category: 'CHUYÊN MÔN',
    imageFallbackTitle: 'MA TRẬN ĐỀ THI HSG TIN HỌC',
    summary: 'Hướng dẫn chuẩn hóa cấu trúc đề thi, tỷ lệ phân bố câu hỏi vận dụng cao và quy chế coi thi bảo mật.',
    content: 'Tổ Tin học đã hoàn tất thẩm định ma trận đề thi học sinh giỏi cấp Cụm, bổ sung phần thực hành lập trình giải quyết bài toán tối ưu trên nền tảng chấm tự động. Hệ thống thi trực tuyến đảm bảo giám sát camera kép và ghi nhận nhật ký thao tác chống gian lận.',
    author: 'Tổ Tin học - Công nghệ',
    views: 1820,
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-3',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TOÁN...',
    date: '01/09/2026',
    category: 'HỌC THUẬT',
    imageFallbackTitle: 'KHOA HỌC & OLYMPIAD TOÁN',
    summary: 'Phổ biến ngân hàng câu hỏi định hướng năng lực và bài tập hình học tổ hợp mở rộng.',
    content: 'Ban chuyên môn Toán học thông báo thời gian nộp chuyên đề và danh sách học sinh tham gia bồi dưỡng đội tuyển chính thức. Đội tuyển năm nay đặt mục tiêu giành ít nhất 15 giải Nhất và 25 giải Nhì cấp Thành phố.',
    author: 'Tổ Toán - Thống kê',
    views: 1540,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-4',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN VẬT LÝ...',
    date: '28/08/2026',
    category: 'THỰC NGHIỆM',
    imageFallbackTitle: 'PHÒNG THÍ NGHIỆM VẬT LÝ STEM',
    summary: 'Yêu cầu thí nghiệm thực hành đo đạc chính xác và đánh giá sai số trong khuôn khổ kỳ thi.',
    content: 'Kỳ thi thí nghiệm thực hành Vật lý sẽ diễn ra tại phòng Lab STEM tầng 3 nhà A với hệ thống cảm biến kỹ thuật số hiện đại. Mỗi thí sinh có 45 phút thực hiện thao tác đo điện trở vi mạch và vẽ đồ thị dao động tắt dần.',
    author: 'Tổ Vật lý - Kỹ thuật',
    views: 1290,
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-5',
    title: 'CHƯƠNG TRÌNH GIAO LƯU HỌC THUẬT VÀ TRAO ĐỔI VĂN HÓA VỚI ĐẠI HỌC QUỐC GIA SINGAPORE (NUS)',
    date: '24/08/2026',
    category: 'HỢP TÁC',
    imageFallbackTitle: 'HỘI NGHỊ GIAO LƯU QUỐC TẾ',
    summary: 'Đoàn học sinh chuyên Lý và Tin tham gia chương trình thực tập hè khoa học dữ liệu và robot tự hành tại Singapore.',
    content: 'Chuyến đi 14 ngày mở ra cơ hội trải nghiệm các phòng nghiên cứu vi điện tử hàng đầu Châu Á, đồng thời kết nối học sinh trường với mạng lưới cựu học sinh CVA đang công tác tại các tập đoàn công nghệ lớn.',
    author: 'Tổ Hợp tác Quốc tế',
    views: 980,
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'news-6',
    title: 'LỄ TUYÊN DƯƠNG HỌC SINH ĐẠT THỦ KHOA, Á KHOA KỲ THI TỐT NGHIỆP THPT TOÀN QUỐC 2026',
    date: '20/08/2026',
    category: 'PHONG TRÀO',
    imageFallbackTitle: 'VINH DANH THỦ KHOA XUẤT SẮC',
    summary: 'Nhà trường tự hào ghi nhận 4 thủ khoa khối A00, B00, D01 và hàng chục học sinh đạt điểm 10 tuyệt đối các môn.',
    content: 'Hội Khuyến học và Ban Giám hiệu đã trao tặng học bổng Chu Văn An trị giá 500 triệu đồng cùng bằng khen danh dự cho các em học sinh có thành tích xuất sắc nhất khóa 2023–2026.',
    author: 'Hội Khuyến học Nhà trường',
    views: 3120,
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bea5aad139f4?auto=format&fit=crop&q=80&w=800'
  },
];

export const FEATURED_NEWS = ALL_NEWS[0];
export const SECONDARY_NEWS = [ALL_NEWS[1], ALL_NEWS[2], ALL_NEWS[3]];

export const ALL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '04/09/2026',
    department: 'Ban Đào tạo Cụm',
    isImportant: true,
    fileAttachment: 'CV-104-MaTranDeThiHSG-2026.pdf',
    content: 'Thông báo tới toàn thể cán bộ quản lý, giáo viên bộ môn Tin học và các em học sinh thuộc đội tuyển HSG Cụm về việc tập huấn chấm thi và địa điểm thi chính thức. Các trường gửi danh sách giám thị trước ngày 15/09/2026.',
  },
  {
    id: 'ann-2',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TOÁN...',
    date: '02/09/2026',
    department: 'Tổ Chuyên môn Toán',
    isImportant: true,
    fileAttachment: 'TB-DeToanCacTruong-Signed.pdf',
    content: 'Kế hoạch điều chỉnh thời gian thi vòng loại khảo sát năng lực môn Toán dành cho các khối lớp 10, 11 và 12. Bài khảo sát kéo dài 90 phút theo hình thức kết hợp trắc nghiệm khách quan và tự luận suy luận logic.',
  },
  {
    id: 'ann-3',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ NGOẠI NGỮ...',
    date: '31/08/2026',
    department: 'Tổ Ngoại ngữ',
    content: 'Quy định về định dạng bài thi nghe nói chuẩn quốc tế và danh sách phòng thi các bộ môn Tiếng Anh, Tiếng Pháp, Tiếng Đức. Thí sinh có mặt trước giờ thi 20 phút để kiểm tra tai nghe chuyên dụng.',
  },
  {
    id: 'ann-4',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ NGỮ VĂN...',
    date: '29/08/2026',
    department: 'Văn phòng Nhà trường',
    content: 'Kế hoạch tổ chức chuyên đề đổi mới phương pháp giảng dạy môn Ngữ văn theo chương trình Giáo dục phổ thông mới. Đề bài yêu cầu học sinh liên hệ thực tiễn xã hội và trình bày suy nghĩ cá nhân sắc sảo.',
  },
  {
    id: 'ann-5',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ KHOA HỌC TỰ NHIÊN...',
    date: '27/08/2026',
    department: 'Tổ KHTN',
    content: 'Lịch kiểm tra thiết bị hóa chất và phân công giám thị coi thi vòng cấp trường năm học 2026–2027. Đảm bảo an toàn phòng cháy chữa cháy tuyệt đối tại các phòng thí nghiệm.',
  },
  {
    id: 'ann-6',
    title: 'HƯỚNG DẪN ĐĂNG KÝ HỌC CHUYÊN ĐỀ LỰA CHỌN KHỐI 10 NĂM HỌC 2026–2027',
    date: '25/08/2026',
    department: 'Ban Giám Hiệu',
    isImportant: true,
    fileAttachment: 'HD-ChuyenDeKhoi10-2026.pdf',
    content: 'Học sinh khối 10 thực hiện đăng ký tổ hợp 3 môn học chuyên đề và cụm học tập tự chọn thông qua tài khoản định danh trên cổng thông tin nhà trường trước ngày 10/09/2026.',
  },
];

export const ANNOUNCEMENTS = ALL_ANNOUNCEMENTS.slice(0, 5);

export const SCHOOL_SHOWCASE: SchoolHighlight[] = [
  {
    id: 'highlight-1',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '05/09/2026',
    tag: 'TRUYỀN THỐNG TRĂM NĂM',
    summary:
      'Sáng ngày 5/9/2026, hòa chung không khí tưng bừng của ngày hội toàn dân đưa trẻ đến trường, Trường THPT Chuyên Chu Văn An long trọng tổ chức Lễ Khai giảng năm học 2026–2027. Trong tiết thu Hà Nội trong trẻo, sân trường rợp sắc hoa và cờ bay rực rỡ...',
    stats: { label: 'Học sinh đạt giải', value: '100% Khối chuyên' },
    content: 'Với bề dày lịch sử vẻ vang từ năm 1908 đến nay, nhà trường luôn khẳng định vị thế dẫn đầu trong công tác bồi dưỡng nhân tài và nghiên cứu khoa học kỹ thuật cho Thủ đô.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'highlight-2',
    title: 'XÂY DỰNG KHÔNG GIAN HỌC TẬP THÔNG MINH VÀ HỆ SINH THÁI GIÁO DỤC SỐ',
    date: '01/09/2026',
    tag: 'CƠ SỞ VẬT CHẤT',
    summary: 'Hệ thống phòng học thông minh tích hợp bảng tương tác số, trung tâm dữ liệu và thư viện điện tử hơn 50.000 đầu tài liệu nghiên cứu chuẩn quốc tế.',
    stats: { label: 'Phòng học chuẩn quốc gia', value: '64 Phòng' },
    content: 'Dự án nâng cấp hệ thống hạ tầng số giúp học sinh và giáo viên kết nối trực tiếp với nguồn học liệu của các trường đại học hàng đầu thế giới.',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'highlight-3',
    title: 'ĐỘI NGŨ NHÀ GIÁO ƯU TÚ, TÂM HUYẾT VỚI SỰ NGHIỆP TRỒNG NGƯỜI',
    date: '25/08/2026',
    tag: 'ĐỘI NGŨ SƯ PHẠM',
    summary: '100% giáo viên đạt chuẩn và trên chuẩn, trong đó có nhiều tiến sĩ, thạc sĩ đầu ngành, nhà giáo ưu tú được Nhà nước phong tặng.',
    stats: { label: 'Tiến sĩ & Thạc sĩ', value: '88% Cán bộ' },
    content: 'Đội ngũ giáo viên luôn đổi mới phương pháp giảng dạy, chú trọng trang bị kỹ năng thế kỷ 21 và tư duy hội nhập toàn cầu cho học sinh.',
    imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=800'
  },
];

export const ALL_ADMISSIONS: AdmissionItem[] = [
  {
    id: 'adm-1',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '05/09/2026',
    deadline: '20/05/2026',
    target: 'Lớp 10 Chuyên Tin học',
    quota: 35,
    description: 'Chỉ tiêu tuyển sinh lớp 10 chuyên Tin học. Môn thi chuyên: Lập trình thuật toán trên máy tính ngôn ngữ C++ hoặc Python.',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'adm-2',
    title: 'TUYỂN SINH LỚP 10 CHUYÊN TOÁN HỌC & TOÁN ỨNG DỤNG NĂM HỌC 2026–2027',
    date: '03/09/2026',
    deadline: '20/05/2026',
    target: 'Lớp 10 Chuyên Toán 1 & Toán 2',
    quota: 70,
    description: 'Kế hoạch tuyển sinh 02 lớp chuyên Toán. Đề thi đòi hỏi tư duy hình học không gian, bất đẳng thức và số học nâng cao.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'adm-3',
    title: 'TUYỂN SINH CHƯƠNG TRÌNH SONG BẰNG TÚ TÀI ANH QUỐC CAMBRIDGE A-LEVEL',
    date: '01/09/2026',
    deadline: '15/05/2026',
    target: 'Khối Song bằng Tú tài Quốc tế',
    quota: 50,
    description: 'Đào tạo lấy bằng tú tài THPT Việt Nam và bằng tú tài Cambridge A-Level công nhận trên toàn thế giới.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'adm-4',
    title: 'TUYỂN SINH LỚP 10 CHUYÊN TIẾNG ANH & TIẾNG PHÁP NĂM HỌC 2026–2027',
    date: '28/08/2026',
    deadline: '20/05/2026',
    target: 'Khối Chuyên Ngoại ngữ',
    quota: 105,
    description: 'Đánh giá 4 kỹ năng Nghe, Nói, Đọc, Viết theo chuẩn B2 khung tham chiếu Châu Âu.',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bea5aad139f4?auto=format&fit=crop&q=80&w=800'
  },
];

export const ADMISSION_DATA = {
  featured: ALL_ADMISSIONS[0],
  bullets: [
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TOÁN...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ NGOẠI NGỮ...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ HỆ KHÔNG CHUYÊN...',
  ],
};

export const ALL_STUDY_ABROAD: StudyAbroadItem[] = [
  {
    id: 'abroad-1',
    title: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    date: '05/09/2026',
    country: 'Hoa Kỳ & Liên Minh Châu Âu',
    scholarshipRate: 'Lên tới 100% Học phí ($65,000/năm)',
    deadline: '15/11/2026',
    description: 'Chương trình liên kết học bổng chính phủ và các trường đại học top 50 thế giới dành riêng cho học sinh chuyên có thành tích xuất sắc.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'abroad-2',
    title: 'HỌC BỔNG TOÀN PHẦN CHÍNH PHỦ SINGAPORE (ASEAN SCHOLARSHIP 2026)',
    date: '02/09/2026',
    country: 'Singapore',
    scholarshipRate: 'Toàn phần vé máy bay, ăn ở & sinh hoạt phí',
    deadline: '30/10/2026',
    description: 'Dành cho học sinh khối 10 và 11 có thành tích học tập xuất sắc và vượt qua vòng thi viết luận, phỏng vấn trực tiếp.',
    imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'abroad-3',
    title: 'CHƯƠNG TRÌNH DU HỌC PHÁP & CÁC LỚP CHUYÊN SONG NGỮ TIẾNG PHÁP',
    date: '28/08/2026',
    country: 'Cộng hòa Pháp',
    scholarshipRate: 'Miễn 100% học phí công lập',
    deadline: '15/12/2026',
    description: 'Cơ hội theo học các trường lớn (Grandes Écoles) và đại học bách khoa Paris theo thỏa thuận chính phủ.',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'abroad-4',
    title: 'HỌC BỔNG TRAO ĐỔI VĂN HÓA KHOA HỌC KỸ THUẬT NHẬT BẢN (MEXT)',
    date: '20/08/2026',
    country: 'Nhật Bản',
    scholarshipRate: '145.000 Yên/tháng sinh hoạt phí',
    deadline: '20/11/2026',
    description: 'Học bổng do Bộ Giáo dục Nhật Bản cấp đào tạo ngành Khoa học máy tính và Trí tuệ nhân tạo.',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800'
  },
];

export const STUDY_ABROAD_DATA = {
  featured: ALL_STUDY_ABROAD[0],
  bullets: [
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ DU HỌC PHÁP...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ HỌC BỔNG SINGAPORE...',
    'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ TRAO ĐỔI VĂN HÓA...',
  ],
};

export const ALL_CLUBS: ClubItem[] = [
  {
    id: 'club-1',
    name: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    category: 'STEM & CÔNG NGHỆ CAO',
    members: 140,
    established: '2016',
    badgeText: 'CLB ROBOTICS & THUẬT TOÁN CVA',
    description: 'Nơi tập hợp các bạn trẻ đam mê sáng tạo khoa học kỹ thuật, thiết kế robot tự hành, tham gia các giải đấu First Tech Challenge và Olympic Tin học.',
    recentActivity: 'Vừa đạt Giải Nhất toàn quốc cuộc thi Khoa học Kỹ thuật dành cho học sinh trung học năm 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'club-2',
    name: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    category: 'NGHỆ THUẬT & TRUYỀN THÔNG',
    members: 95,
    established: '2014',
    badgeText: 'CLB TRUYỀN THÔNG VÀ BÁO CHÍ',
    description: 'Ghi lại mọi khoảnh khắc thanh xuân dưới mái trường Bưởi, phụ trách kênh truyền thông số và bản tin học đường thường kỳ.',
    recentActivity: 'Phát hành số báo đặc biệt chào mừng năm học mới 2026–2027.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'club-3',
    name: 'NỘI DUNG THI VÀ MA TRẬN ĐỀ THI HSG CỤM TRƯỜNG THPT GIA LÂM - LONG BIÊN NĂM HỌC 2023-2024 _ MÔN TIN...',
    category: 'THỂ THAO & PHONG TRÀO',
    members: 110,
    established: '2018',
    badgeText: 'CLB BÓNG RỔ VÀ HOẠT ĐỘNG THỂ CHẤT',
    description: 'Môi trường rèn luyện sức khỏe, tinh thần kỷ luật và đoàn kết. Tổ chức giải đấu thường niên thu hút hàng trăm vận động viên.',
    recentActivity: 'Vô địch giải Bóng rổ học sinh THPT các trường nội thành Hà Nội.',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bea5aad139f4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'club-4',
    name: 'CLB TRANH BIỆN & HỘI NGHỊ MÔ PHỎNG LIÊN HỢP QUỐC (CVA MUN)',
    category: 'HỌC THUẬT & TRANH BIỆN',
    members: 85,
    established: '2015',
    badgeText: 'CLB TRANH BIỆN TIẾNG ANH',
    description: 'Rèn luyện tư duy phản biện, kỹ năng đàm phán ngoại giao và giải quyết các vấn đề khủng hoảng toàn cầu theo chuẩn quốc tế.',
    recentActivity: 'Tổ chức thành công hội nghị Chu Van An Model United Nations với 300 đại biểu.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'club-5',
    name: 'CLB TÌNH NGUYỆN XANH VÀ BẢO VỆ MÔI TRƯỜNG HỒ TÂY',
    category: 'TÌNH NGUYỆN XÃ HỘI',
    members: 130,
    established: '2012',
    badgeText: 'CLB MÔI TRƯỜNG VÀ CỘNG ĐỒNG',
    description: 'Chung tay vì cộng đồng, bảo vệ cảnh quan Hồ Tây và tổ chức các chuyến thiện nguyện vùng cao hàng năm.',
    recentActivity: 'Trồng mới 500 cây xanh và quyên góp 1.200 bộ sách giáo khoa cho học sinh khó khăn.',
    imageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&q=80&w=800'
  },
];

export const CLUBS_DATA = {
  featured: ALL_CLUBS[0],
  secondary: [ALL_CLUBS[1], ALL_CLUBS[2]],
};

export const ALL_LOST_ITEMS: LostItem[] = [
  {
    id: 'lost-1',
    title: 'Thẻ học sinh & Chùm chìa khóa xe',
    itemType: 'Thẻ & Chìa khóa',
    dateFound: '05/09/2026',
    locationFound: 'Sân bóng rổ khu B sau giờ khai giảng',
    description: 'Sáng ngày 5/9/2026, hòa chung không khí tưng bừng của ngày hội, tổ bảo vệ nhặt được 01 thẻ học sinh mang tên Nguyễn Văn An (Lớp 11 Tin) cùng chùm 3 chìa khóa có móc treo hình máy tính.',
    finderDepartment: 'Văn phòng Bảo vệ & Đoàn trường',
    status: 'pending',
    images: ['THẺ HỌC SINH CVA', 'CHÙM CHÌA KHÓA'],
  },
  {
    id: 'lost-2',
    title: 'Hộp bút vẽ kỹ thuật & Máy tính cầm tay Casio 580',
    itemType: 'Đồ dùng học tập',
    dateFound: '04/09/2026',
    locationFound: 'Bàn số 4 phòng Lab Tin học 2 nhà A',
    description: 'Sáng ngày 5/9/2026, hòa chung không khí chuẩn bị phòng thi, thầy phụ trách phòng máy phát hiện để quên 01 máy tính Casio fx-580VN X màu đen và hộp bút chì kim.',
    finderDepartment: 'Tổ Quản trị Phòng máy',
    status: 'pending',
    images: ['MÁY TÍNH CASIO FX', 'HỘP BÚT KỸ THUẬT'],
  },
  {
    id: 'lost-3',
    title: 'Áo khoác đồng phục & Bình giữ nhiệt kim loại',
    itemType: 'Trang phục cá nhân',
    dateFound: '03/09/2026',
    locationFound: 'Ghế đá gần gốc xà cừ cổ thụ sân trước',
    description: 'Sáng ngày 5/9/2026, hòa chung không khí tưng bừng tập duyệt nghi thức, học sinh để quên 01 áo khoác đồng phục trường size M và bình nước màu bạc.',
    finderDepartment: 'Đội Thanh niên Tình nguyện',
    status: 'claimed',
    images: ['ÁO ĐỒNG PHỤC SIZE M', 'BÌNH NƯỚC KIM LOẠI'],
  },
  {
    id: 'lost-4',
    title: 'Tai nghe Bluetooth không dây trong hộp sạc trắng',
    itemType: 'Thiết bị điện tử',
    dateFound: '02/09/2026',
    locationFound: 'Hàng ghế thứ 3 phòng Thư viện số',
    description: 'Thủ thư nhặt được 01 hộp sạc tai nghe không dây màu trắng có dán sticker hình cờ đỏ sao vàng.',
    finderDepartment: 'Thư viện Nhà trường',
    status: 'pending',
    images: ['HỘP SẠC TAI NGHE', 'STICKER NHẬN DẠNG'],
  },
  {
    id: 'lost-5',
    title: 'Tập bài tập Toán hình học & Đồng hồ đeo tay Casio',
    itemType: 'Học tập & Đồng hồ',
    dateFound: '30/08/2026',
    locationFound: 'Bục giảng phòng 204 nhà B',
    description: 'Giáo viên bộ môn Toán tìm thấy tập tài liệu ôn thi HSG chuyên đề hình học phẳng kèm đồng hồ Casio dây kim loại.',
    finderDepartment: 'Tổ Chuyên môn Toán',
    status: 'claimed',
    images: ['TẬP TÀI LIỆU TOÁN', 'ĐỒNG HỒ CASIO'],
  },
];

export const LOST_ITEMS_DATA = ALL_LOST_ITEMS.slice(0, 3);
