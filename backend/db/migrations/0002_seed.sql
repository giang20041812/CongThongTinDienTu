-- Starting content of a new site: admin account, the 7-group menu, school information and lesson times
-- (former Liquibase changesets v2-03, v2-04 and v2-05).

-- Plaintext on purpose: the server hashes it on start-up. Change it right after the first login.
INSERT INTO users (username, password_hash, role) VALUES ('admin', 'admin123', 'ADMIN');

INSERT INTO categories (name, slug, page_type, sort_order) VALUES
    ('Nhà trường',          'nha-truong',        'GROUP', 0),
    ('Tin tức – Sự kiện',   'tin-tuc-su-kien',   'GROUP', 1),
    ('Thi – Tuyển sinh',    'thi-tuyen-sinh',    'GROUP', 2),
    ('Học sinh',            'hoc-sinh',          'GROUP', 3),
    ('Học tập',             'hoc-tap',           'GROUP', 4),
    ('Công khai – Văn bản', 'cong-khai-van-ban', 'GROUP', 5),
    ('Liên hệ',             'lien-he',           'GROUP', 6);

INSERT INTO categories (parent_id, name, slug, page_type, sort_order, show_on_home)
SELECT p.id, c.name, c.slug, c.page_type, c.sort_order, c.show_on_home
FROM (VALUES
    ('nha-truong', 'Giới thiệu chung',                 'gioi-thieu-chung',      'PAGE',      0, FALSE),
    ('nha-truong', 'Lịch sử hình thành và phát triển', 'lich-su-hinh-thanh',    'PAGE',      1, FALSE),
    ('nha-truong', 'Ban Giám hiệu',                    'ban-giam-hieu',         'PAGE',      2, FALSE),
    ('nha-truong', 'Cơ cấu tổ chức',                   'co-cau-to-chuc',        'PAGE',      3, FALSE),
    ('nha-truong', 'Các tổ chuyên môn',                'cac-to-chuyen-mon',     'PAGE',      4, FALSE),
    ('nha-truong', 'Thành tích nhà trường',            'thanh-tich-nha-truong', 'POST_LIST', 5, TRUE),
    ('nha-truong', 'Cơ sở vật chất',                   'co-so-vat-chat',        'PAGE',      6, FALSE),

    ('tin-tuc-su-kien', 'Tin nhà trường',       'tin-nha-truong',       'POST_LIST',     0, TRUE),
    ('tin-tuc-su-kien', 'Hoạt động chuyên môn', 'hoat-dong-chuyen-mon', 'POST_LIST',     1, TRUE),
    ('tin-tuc-su-kien', 'Hoạt động giáo dục',   'hoat-dong-giao-duc',   'POST_LIST',     2, FALSE),
    ('tin-tuc-su-kien', 'Hoạt động ngoại khóa', 'hoat-dong-ngoai-khoa', 'POST_LIST',     3, TRUE),
    ('tin-tuc-su-kien', 'Thông báo',            'thong-bao',            'DOCUMENT_LIST', 4, FALSE),

    ('thi-tuyen-sinh', 'Tuyển sinh lớp 10',             'tuyen-sinh-lop-10',           'POST_LIST',     0, TRUE),
    ('thi-tuyen-sinh', 'Thi tốt nghiệp THPT',           'thi-tot-nghiep-thpt',         'POST_LIST',     1, FALSE),
    ('thi-tuyen-sinh', 'Tuyển sinh Đại học – Cao đẳng', 'tuyen-sinh-dai-hoc-cao-dang', 'POST_LIST',     2, FALSE),
    ('thi-tuyen-sinh', 'Hướng nghiệp',                  'huong-nghiep',                'POST_LIST',     3, TRUE),
    ('thi-tuyen-sinh', 'Văn bản/Hướng dẫn thi',         'van-ban-huong-dan-thi',       'DOCUMENT_LIST', 4, FALSE),

    ('hoc-sinh', 'Đoàn Thanh niên',         'doan-thanh-nien',     'POST_LIST', 0, TRUE),
    ('hoc-sinh', 'Câu lạc bộ',              'cau-lac-bo',          'POST_LIST', 1, TRUE),
    ('hoc-sinh', 'Hoạt động học sinh',      'hoat-dong-hoc-sinh',  'POST_LIST', 2, FALSE),
    ('hoc-sinh', 'Gương mặt tiêu biểu',     'guong-mat-tieu-bieu', 'POST_LIST', 3, FALSE),
    ('hoc-sinh', 'Tư vấn tâm lý học đường', 'tu-van-tam-ly',       'POST_LIST', 4, FALSE),

    ('hoc-tap', 'Thời khóa biểu',        'thoi-khoa-bieu',        'SCHEDULE',      0, FALSE),
    ('hoc-tap', 'Tài liệu học tập',      'tai-lieu-hoc-tap',      'DOCUMENT_LIST', 1, FALSE),
    ('hoc-tap', 'Bài giảng điện tử',     'bai-giang-dien-tu',     'DOCUMENT_LIST', 2, FALSE),
    ('hoc-tap', 'Đề kiểm tra – Ôn tập',  'de-kiem-tra-on-tap',    'DOCUMENT_LIST', 3, FALSE),
    ('hoc-tap', 'Học và thi trực tuyến', 'hoc-va-thi-truc-tuyen', 'POST_LIST',     4, FALSE),

    ('cong-khai-van-ban', 'Công khai cơ sở giáo dục', 'cong-khai-co-so-giao-duc', 'DOCUMENT_LIST', 0, FALSE),
    ('cong-khai-van-ban', 'Báo cáo thường niên',      'bao-cao-thuong-nien',      'DOCUMENT_LIST', 1, FALSE),
    ('cong-khai-van-ban', 'Văn bản chỉ đạo',          'van-ban-chi-dao',          'DOCUMENT_LIST', 2, FALSE),
    ('cong-khai-van-ban', 'Kế hoạch nhà trường',      'ke-hoach-nha-truong',      'DOCUMENT_LIST', 3, FALSE),
    ('cong-khai-van-ban', 'Thủ tục hành chính',       'thu-tuc-hanh-chinh',       'DOCUMENT_LIST', 4, FALSE),

    ('lien-he', 'Thông tin liên hệ', 'thong-tin-lien-he', 'CONTACT',  0, FALSE),
    ('lien-he', 'Bản đồ',            'ban-do',            'MAP',      1, FALSE),
    ('lien-he', 'Góp ý – Phản hồi',  'gop-y-phan-hoi',    'FEEDBACK', 2, FALSE)
) AS c (parent_slug, name, slug, page_type, sort_order, show_on_home)
JOIN categories p ON p.slug = c.parent_slug;

-- Footer links: one "Name | URL" per line. Timetable notes: one per line.
INSERT INTO site_settings (setting_key, setting_value) VALUES
    ('school_name',     'THPT Đặng Trần Đức'),
    ('parent_org',      'Sở Giáo dục và Đào tạo Hà Nội'),
    ('slogan',          'Trí tuệ - Nhân văn - Kỷ cương'),
    ('address',         'Hà Nội, Việt Nam'),
    ('hotline',         '024 3xxx xxxx'),
    ('email',           'thptdangtranduc@gmail.com'),
    ('official_email',  'c3dangtranduc@hanoiedu.vn'),
    ('website',         'dtd.edu.vn'),
    ('working_hours',   ''),
    ('map_embed_url',   ''),
    ('facebook_url',    ''),
    ('useful_links',    'Bộ Giáo dục và Đào tạo | https://moet.gov.vn
Sở GD&ĐT Hà Nội | https://hanoi.edu.vn
Cổng dịch vụ công quốc gia | https://dichvucong.gov.vn'),
    ('timetable_term',  ''),
    ('timetable_notes', '');

INSERT INTO timetable_periods (period, start_time, end_time) VALUES
    (1, '07:30', '08:15'),
    (2, '08:20', '09:05'),
    (3, '09:20', '10:05'),
    (4, '10:10', '10:55'),
    (5, '11:00', '11:45'),
    (6, '13:30', '14:15'),
    (7, '14:20', '15:05'),
    (8, '15:20', '16:05'),
    (9, '16:10', '16:55'),
    (10, '17:00', '17:45');
