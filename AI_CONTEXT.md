# TỔNG QUAN DỰ ÁN: CỔNG THÔNG TIN ĐIỆN TỬ
File này chứa context quan trọng để hỗ trợ AI/Agent nhanh chóng nắm bắt cấu trúc dự án mà không cần scan lại toàn bộ source code.

## 1. CÔNG NGHỆ SỬ DỤNG
- **Frontend**: React (với Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Java Spring Boot (v4), Spring Data JPA, Hibernate, Liquibase, PostgreSQL.
- **Tools**: npm (cho frontend), Maven (cho backend).

## 2. CẤU TRÚC THƯ MỤC
Dự án được chia thành hai module chính nằm song song: `frontend/` và `backend/`.

### 2.0 MÔ HÌNH NỘI DUNG (QUAN TRỌNG)
- **Menu = cây đầu mục** (bảng `categories`, `parent_id`, tối đa **2 cấp**). Mỗi đầu mục có `page_type` quyết định cách hiển thị:
  `GROUP` (mục cha, không chứa bài) · `PAGE` (trang nội dung = bài mới nhất/được ghim của mục) · `POST_LIST` (lưới bài viết) · `DOCUMENT_LIST` (bảng văn bản: số hiệu, ngày ban hành, tệp) · `SCHEDULE` (thời khóa biểu) · `CONTACT` · `MAP` · `FEEDBACK` · `LINK` (`external_url`, không chứa bài).
- **Mọi nội dung là `posts`** gắn 1 `category_id` (tin, trang giới thiệu, thông báo, văn bản, tài liệu). Trường văn bản (`document_number`, `issuer`, `issued_date`, `recipient`, `action_required`) chỉ dùng cho `DOCUMENT_LIST`. Tệp đính kèm ở `post_attachments`. Không còn bảng `announcements`.
- Đổi tên / sắp xếp / chuyển nhóm / đổi kiểu trang chỉ là sửa `categories` – bài viết đi theo, **không có mã đầu mục nào viết cứng trong code** (đừng thêm lại kiểu `categoryCode === 'X'`).
- Khác: `feedbacks` (form Góp ý), `site_settings` (key/value: thông tin trường, `useful_links` – liên kết chân trang mỗi dòng `Tên | URL`, `timetable_term`, `timetable_notes`), `timetable_periods` + `timetable_entries` (thời khóa biểu: giờ các tiết; mỗi dòng = lớp × thứ (2–8) × tiết, khối suy ra từ tên lớp), `users`.
- **Không còn dữ liệu tĩnh ở frontend**: TKB, liên kết chân trang, gợi ý tìm kiếm (= tên đầu mục), tiêu đề trang (= tên trường trong cài đặt) đều lấy từ API.

### 2.1 FRONTEND (`/frontend`)
- **`src/lib/router.tsx`**: URL sinh từ dữ liệu: `/` · `/{slug-đầu-mục}` · `/bai-viet/{slug-bài}` (URL bài không chứa đầu mục nên chuyển mục không hỏng link). Slug dành riêng: `admin`, `api`, `bai-viet`, `tim-kiem`, `assets`, `uploads`.
- **`src/lib/menu.tsx`**: `useMenu()` (cây menu công khai từ `/api/categories`), `MenuLink`, nhãn/biểu tượng theo `PageType`.
- **`src/pages/CategoryPage.tsx`**: trang `/{slug}` – chọn giao diện theo `pageType`. `PostDetailPage.tsx`: bài viết (văn bản → bố cục công văn). `InfoPages.tsx`: Liên hệ / Bản đồ / Góp ý. `SchedulePage.tsx`: thời khóa biểu từ `/api/timetable`.
- **`src/api.ts`**: cache dùng chung (gộp request, TTL 60s). Request công khai **không** gửi token (admin xem web như khách); lỗi chỉ được giữ 5s rồi thử lại. `usePostPage({category, type, q, pinned, page, size})`, `usePost(slug)`, `useTimetable()`, `adminApi.*` cho trang quản trị.
- **`src/lib/content.ts`**: `toPostView`, định dạng ngày/tệp, `optimizeImage`. **`src/lib/site.ts`**: `useSite()` đọc `/api/settings`, `usePageTitle()`, `SETTING_FIELDS` (form “Thông tin trường”).
- **`src/components/ui.tsx`**, **`PostParts.tsx`**, **`SectionHeader.tsx`**: UI dùng chung – trang mới phải dùng lại.
- Trang chủ: banner = 1 ảnh cố định `src/assets/realbanner.png` (mảng `BANNERS` trong `HeroSection.tsx`; thêm ảnh vào mảng thì tự thành slider), tin mới (`type=POST_LIST`), thông báo – văn bản (`type=DOCUMENT_LIST`), cột “Chuyên mục nổi bật” = đầu mục có `showOnHome`.
- **`src/pages/AdminPages.tsx`**: Tổng quan · Đầu mục & menu · Bài viết & văn bản · Thời khóa biểu (lưới nhập theo lớp, giờ tiết, ghi chú) · Góp ý · Thông tin trường. Token lưu `sessionStorage` (`portal-admin-token`).
- **Thiết kế**: token màu theo logo trong `src/index.css` (`brand` #0A4AA0, `gold` #F8C108, `flame` #E8192A); font Be Vietnam Pro.

### 2.2 BACKEND (`/backend`)
- **Package base**: `vn.edu.portal`. Entity không bao giờ trả thẳng cho bài viết: dùng `dto/PostDtos` (`PostSummary` không có blocks, `PostDetail`).
- **API** (GET công khai; ghi cần token admin – xem `AdminAuthInterceptor`):
  - `GET /api/categories` (khách: mục hiển thị; admin: tất cả), `GET /by-slug/{slug}`, `POST`, `PUT /{id}`, `PUT /order` (`[{id,parentId,sortOrder}]`), `DELETE /{id}?moveTo=` (bắt buộc khi mục còn bài).
  - `GET /api/posts?category=&descendants=&type=POST_LIST,DOCUMENT_LIST&q=&status=&pinned=&page=&size=` (phân trang, tìm không dấu qua cột `search_text`), `GET /by-slug/{slug}`, `GET /{id}` (admin), `POST /{id}/views`, `POST/PUT/DELETE`.
  - `POST /api/feedback` (công khai, giới hạn 5 lần/30 phút/IP, có honeypot) · `GET/PUT/DELETE /api/feedback` (admin).
  - `GET/PUT /api/settings`, `POST /api/upload` (ảnh ≤ 5MB), `POST /api/upload/file` (tài liệu ≤ 10MB, Cloudinary raw), `/api/auth/*`, `/api/users`.
  - `GET /api/timetable` (`{periods, entries}`, công khai, cache), `PUT /api/timetable/classes/{lớp}` (`{entries:[{dayOfWeek, period, subject, teacher}]}` – thay cả tuần của lớp), `DELETE /api/timetable/classes/{lớp}`, `PUT /api/timetable/periods`.
- **`service/`**: `CategoryService` (luật cây: 2 cấp, mục con không là GROUP, slug duy nhất/không dành riêng, không đổi thành GROUP/LINK khi còn bài), `PostService`, `TimetableService`, `ContentCache` (cache RAM, xoá sau mỗi thao tác ghi).
- **Schema do Liquibase quản lý** (`resources/db/changelog/changesets/v2-*.yaml`), Hibernate chỉ `validate`. `v2-01` **xoá bảng v1 cũ** (chạy 1 lần), `v2-02` tạo schema, `v2-03` seed menu 7 nhóm/35 mục, tài khoản `admin/admin123` (được băm khi khởi động – đổi ngay) và thông tin trường; `v2-04` bỏ bảng `schedules` (Lịch làm việc), tạo bảng thời khóa biểu + giờ 10 tiết và các khoá cài đặt mới. Thay đổi schema = thêm changeset mới, **không sửa changeset đã chạy**.
- **`application.yml`**: biến môi trường (xem `backend/.env.example`: `APP_AUTH_SECRET`, `APP_CORS_ORIGINS`, `DB_PREPARE_THRESHOLD`, `LIQUIBASE_ENABLED`...).

### 2.3 DỮ LIỆU MẪU
- `scripts/seed_sample_data.py` (chỉ dùng thư viện chuẩn Python, gọi REST API): mô tả 42 đầu mục, ~116 bài (đủ mọi đầu mục, có bài nháp/ẩn, đủ để thử phân trang), PDF đính kèm (tải lên Cloudinary **1 lần** rồi dùng chung link), TKB 12 lớp, 5 góp ý, giờ làm việc, ghi chú TKB.
- Chạy: `python scripts/seed_sample_data.py --api http://localhost:8080/api --pdf <tệp.pdf>` (hoặc `--pdf-url <link đã có>`). Từ chối chạy khi đã có bài viết, trừ khi `--force`.

## 3. CÁCH KHỞI CHẠY (LOCAL)
1. **Database:** Cần bật PostgreSQL, tạo database `portal_db`, username `postgres`, pass `123`. Liquibase tự tạo bảng + dữ liệu menu ở lần chạy đầu.
2. **Backend:** Vào thư mục `backend`, chạy lệnh: `./mvnw spring-boot:run` (Server chạy ở port 8080).
3. **Frontend:** Vào thư mục `frontend`, chạy: `npm install` (lần đầu) và `npm run dev` (Web chạy ở port 3000 hoặc 5173 tùy Vite).

## 4. GHI CHÚ CHO AI/AGENT
- Khi cần biết frontend lấy dữ liệu gì, đọc `src/api.ts`, `src/lib/menu.tsx` và `src/lib/content.ts` trước.
- Thêm một kiểu trang mới = thêm giá trị vào `PageType` (Java + `types/index.ts`), một nhánh trong `CategoryPage.tsx` và nhãn trong `lib/menu.tsx`.
- Khi cần update UI Admin, vào `AdminPages.tsx`.
- Truy vấn dùng để trả JSON phải nạp sẵn quan hệ bằng `@EntityGraph` (xem `PostRepository`); danh sách không nạp `blocks`. DB ở xa (~250ms/round-trip) nên mỗi truy vấn N+1 đều rất đắt.
- Khi thêm `@ManyToOne`/`@OneToMany` mới: đặt `@JsonIgnore` hoặc DTO để ngắt đệ quy, và `@ToString.Exclude`/`@EqualsAndHashCode.Exclude` cho quan hệ hai chiều (Lombok `@Data`).
- Kết nối Supabase pooler (cổng 6543) cần `prepareThreshold=0` (đã cấu hình qua `DB_PREPARE_THRESHOLD`), nếu không sẽ lỗi ngẫu nhiên "prepared statement S_1 already exists".
- Trạng thái nội dung luôn là mã `PUBLISHED` / `DRAFT` / `HIDDEN`. Đầu mục bị ẩn (`visible=false`) thì bài của nó cũng không hiển thị công khai.
