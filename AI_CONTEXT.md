# TỔNG QUAN DỰ ÁN: CỔNG THÔNG TIN ĐIỆN TỬ
File này chứa context quan trọng để hỗ trợ AI/Agent nhanh chóng nắm bắt cấu trúc dự án mà không cần scan lại toàn bộ source code.

## 1. CÔNG NGHỆ SỬ DỤNG
- **Frontend**: React (với Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js (≥ 20.19) + Express 5 + TypeScript, thư viện `pg` nối thẳng PostgreSQL (Supabase). Không ORM.
- **Lưu tệp**: Cloudinary (qua lớp `backend/src/storage`, đổi nhà cung cấp được).
- **Tools**: npm workspaces (một `package.json` + một `package-lock.json` ở gốc repo cho cả hai module).
- **Chạy thành 1 app Node**: server Express trả `/api/*` và phục vụ luôn bản build React (`frontend/dist`) – để deploy 1 lần lên Vibe Hosting (Mắt Bão, Nhân Hòa…), nơi không chạy được Java. Bản Spring Boot cũ đã bỏ (API giữ nguyên từng trường JSON).

## 2. CẤU TRÚC THƯ MỤC
Dự án gồm hai workspace nằm song song: `frontend/` và `backend/`; `package.json` gốc điều phối (`dev`, `build`, `start`).

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
- Trang chủ: banner = 1 ảnh cố định `src/assets/realbanner.png` (mảng `BANNERS` trong `HeroSection.tsx`; thêm ảnh vào mảng thì tự thành slider), tin mới (`type=POST_LIST`), thông báo – văn bản (`type=DOCUMENT_LIST`), cột “Chuyên mục nổi bật” = đầu mục có `showOnHome`, “Thư viện ảnh” (`PhotoGallerySection.tsx`) = ảnh mới nhất của bài đã đăng (`/api/posts/photos`, tối đa 2 ảnh/bài, bấm ảnh mở bài).
- **`src/pages/AdminPages.tsx`**: Tổng quan · Đầu mục & menu · Bài viết & văn bản · Thời khóa biểu (lưới nhập theo lớp, giờ tiết, ghi chú) · Góp ý · Thông tin trường. Token lưu `sessionStorage` (`portal-admin-token`).
- **Thiết kế**: token màu theo logo trong `src/index.css` (`brand` #0A4AA0, `gold` #F8C108, `flame` #E8192A); font Be Vietnam Pro.

### 2.2 BACKEND (`/backend`)
- **Cấu trúc `src/`**: `server.ts` (khởi động: migration → băm mật khẩu dạng chữ → listen `PORT`), `app.ts` (ghép Express: `/api` + phục vụ `frontend/dist`), `config.ts` (biến môi trường), `db.ts` (pool `pg`, `transaction()`), `migrations.ts`, `security.ts` (token, mật khẩu, giới hạn đăng nhập/góp ý, luật quyền), `http.ts` (lỗi → JSON, đọc body kiểu Jackson), `text.ts` (slug, chữ không dấu, tóm tắt, `localNow()`), `cache.ts`, `services/` (categories, posts, timetable), `routes/` (mỗi file = 1 controller cũ), `storage/`, `multipart.ts`, `cli.ts` (`migrate`).
- **JSON trả về giống hệt bản Java** (tên trường, thứ tự, định dạng ngày): SQL tự đặt alias camelCase; bài viết dùng `PostSummary` (không có blocks) và `PostDetail` (kèm blocks, attachments) trong `services/posts.ts`.
- **API** (GET công khai; ghi cần token admin – xem `requiresAdmin` trong `security.ts`):
  - `GET /api/categories` (khách: mục hiển thị; admin: tất cả), `GET /by-slug/{slug}`, `POST`, `PUT /{id}`, `PUT /order` (`[{id,parentId,sortOrder}]`), `DELETE /{id}?moveTo=` (bắt buộc khi mục còn bài).
  - `GET /api/posts?category=&descendants=&type=POST_LIST,DOCUMENT_LIST&q=&status=&pinned=&page=&size=` (phân trang, tìm không dấu qua cột `search_text`), `GET /by-slug/{slug}`, `GET /photos?limit=` (ảnh bìa + ảnh trong bài, mới nhất trước, ≤ 24), `GET /{id}` (admin), `POST /{id}/views`, `POST/PUT/DELETE`.
  - `POST /api/feedback` (công khai, giới hạn 5 lần/30 phút/IP, có honeypot) · `GET/PUT/DELETE /api/feedback` (admin).
  - `GET/PUT /api/settings`, `POST /api/upload` (ảnh ≤ 5MB), `POST /api/upload/file` (tài liệu ≤ 10MB, Cloudinary raw), `/api/auth/*`, `/api/users`.
  - `GET /api/timetable` (`{periods, entries}`, công khai, cache), `PUT /api/timetable/classes/{lớp}` (`{entries:[{dayOfWeek, period, subject, teacher}]}` – thay cả tuần của lớp), `DELETE /api/timetable/classes/{lớp}`, `PUT /api/timetable/periods`.
- **`services/`**: `CategoryService` (luật cây: 2 cấp, mục con không là GROUP, slug duy nhất/không dành riêng, không đổi thành GROUP/LINK khi còn bài), `PostService`, `TimetableService`; `cache.ts` = `ContentCache` (cache RAM cho dữ liệu công khai, xoá sau mỗi thao tác ghi; lượt xem cố ý không xoá cache).
- **Schema = file SQL trong `backend/db/migrations/`** (`0001_schema.sql`, `0002_seed.sql`: menu 7 nhóm/35 mục, tài khoản `admin/admin123` – được băm khi khởi động, đổi ngay – thông tin trường, 10 tiết học), ghi nhận ở bảng `schema_migrations`. Tự chạy khi khởi động (`DB_MIGRATE_ON_START`) hoặc `npm run db:migrate`. DB cũ do Liquibase/Java tạo được nhận nguyên trạng (chỉ đánh dấu 0001/0002 đã chạy); bảng `databasechangelog*` còn lại không còn dùng. Thay đổi schema = **thêm file mới** `000N_ten.sql`, không sửa file đã chạy.
- **RLS** (`0003_rls.sql`): mọi bảng `public` bật Row Level Security, **không có policy**, và thu hồi mọi quyền của `anon`/`authenticated` → Data API của Supabase (PostgREST, anon key) không đọc/ghi được gì. Backend vẫn đọc/ghi bình thường vì kết nối bằng role chủ bảng (`postgres`, có BYPASSRLS) – đừng đổi sang role khác không phải chủ bảng. Bảng mới thì thêm `ALTER TABLE ten ENABLE ROW LEVEL SECURITY;` trong chính migration tạo bảng. Không thêm policy cho `anon` trừ khi frontend gọi Supabase trực tiếp.
- **Triển khai VPS** (`deploy/`): `setup-vps.sh` (cài lần đầu: Node 22, Nginx, ufw, user `portal`, systemd `portal.service` với `HOST=127.0.0.1 PORT=8080`), `deploy.sh` (= lệnh `sudo portal-deploy [rollback]`: mỗi bản ở `/srv/portal/releases/<thời điểm>`, `/srv/portal/current` là symlink, `.env` dùng chung ở `/srv/portal/shared/.env`). File trong `deploy/` và `*.sh` luôn LF (`.gitattributes`).
- **Biến môi trường**: xem `backend/.env.example` (`DATABASE_URL` hoặc `DB_*`, `APP_AUTH_SECRET`, `CLOUDINARY_*`, `APP_CORS_ORIGINS`, `APP_TIMEZONE`...). File `.env` chỉ dùng trên máy; giá trị đặt trên hosting luôn được ưu tiên.

### 2.3 DỮ LIỆU MẪU
- `scripts/seed_sample_data.py` (chỉ dùng thư viện chuẩn Python, gọi REST API): mô tả 42 đầu mục, ~116 bài (đủ mọi đầu mục, có bài nháp/ẩn, đủ để thử phân trang), PDF đính kèm (tải lên Cloudinary **1 lần** rồi dùng chung link), TKB 12 lớp, 5 góp ý, giờ làm việc, ghi chú TKB.
- Chạy: `python scripts/seed_sample_data.py --api http://localhost:8080/api --pdf <tệp.pdf>` (hoặc `--pdf-url <link đã có>`). Từ chối chạy khi đã có bài viết, trừ khi `--force`.

## 3. CÁCH KHỞI CHẠY (LOCAL)
1. **Cài đặt:** ở gốc repo chạy `npm install` (một lần cho cả frontend lẫn backend).
2. **Database:** PostgreSQL cục bộ (vd. database `portal_db`, user `postgres`, pass `123`, hoặc `docker compose up db`) hoặc Supabase. Khai báo trong `backend/.env` (chép từ `backend/.env.example`). Lần chạy đầu tự tạo bảng + dữ liệu menu.
3. **Chạy dev:** `npm run dev` ở gốc repo – API ở http://localhost:8080 (tự nạp lại khi sửa code), web ở http://localhost:3000 (Vite proxy `/api` về 8080).
4. **Chạy như production:** `npm run build` rồi `npm start` → một server ở `PORT` (mặc định 8080) phục vụ cả web lẫn API.
5. **Kiểm tra:** `npm run lint` (TypeScript cả hai module), `npm test` (unit test backend).

## 4. GHI CHÚ CHO AI/AGENT
- Khi cần biết frontend lấy dữ liệu gì, đọc `src/api.ts`, `src/lib/menu.tsx` và `src/lib/content.ts` trước.
- Thêm một kiểu trang mới = thêm giá trị vào `PAGE_TYPES` (`backend/src/services/categories.ts`) và `PageType` (`frontend/src/types/index.ts`), một nhánh trong `CategoryPage.tsx` và nhãn trong `lib/menu.tsx`.
- Khi cần update UI Admin, vào `AdminPages.tsx`.
- DB ở xa (~250ms/round-trip tới Supabase): mỗi endpoint trả JSON chỉ nên tốn 1 truy vấn – nạp quan hệ bằng JOIN/`json_agg` (xem `SELECT_DETAIL`, `search()` trong `services/posts.ts`), danh sách không nạp `blocks`, tránh truy vấn trong vòng lặp.
- Mọi thao tác ghi nhiều câu lệnh phải nằm trong `transaction()` (db.ts) và gọi `cache.clear()` sau khi xong.
- Chỉ dùng truy vấn có tham số `$1…` không đặt `name` (prepared statement không tên) – pooler Supabase (cổng 6543, transaction mode) không giữ được prepared statement có tên.
- Cột DATE/TIME/TIMESTAMP được trả nguyên dạng chữ (`2026-10-08T07:30:00`, không múi giờ) – đừng chuyển sang `Date` của JS. "Bây giờ" dùng `localNow()` (múi giờ `APP_TIMEZONE`).
- Lỗi nghiệp vụ: `throw badRequest('…')` / `conflict('…')` / `notFound()` (http.ts) → JSON `{message}`; Express 5 tự bắt lỗi của handler async.
- Trạng thái nội dung luôn là mã `PUBLISHED` / `DRAFT` / `HIDDEN`. Đầu mục bị ẩn (`visible=false`) thì bài của nó cũng không hiển thị công khai.
- Không bao giờ commit `.env` (hosting có thể gửi mã nguồn cho AI bên ngoài phân tích lỗi deploy).
