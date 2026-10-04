# TỔNG QUAN DỰ ÁN: CỔNG THÔNG TIN ĐIỆN TỬ
File này chứa context quan trọng để hỗ trợ AI/Agent nhanh chóng nắm bắt cấu trúc dự án mà không cần scan lại toàn bộ source code.

## 1. CÔNG NGHỆ SỬ DỤNG
- **Frontend**: React (với Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Java Spring Boot (v3), Spring Data JPA, Hibernate, Liquibase, PostgreSQL.
- **Tools**: npm (cho frontend), Maven (cho backend).

## 2. CẤU TRÚC THƯ MỤC
Dự án được chia thành hai module chính nằm song song: `frontend/` và `backend/`.

### 2.1 FRONTEND (`/frontend`)
- Nằm tại `d:\CongThongTinDienTu\CongThongTinDienTu\frontend`
- **`src/App.tsx`**: File root để render toàn bộ các trang công khai (Homepage, Tin tức, Tuyển sinh...)
- **`src/pages/AdminPages.tsx`**: App riêng dành cho Quản trị viên quản lý nội dung (`/admin`). Trạng thái auth được lưu trong `sessionStorage` (key: `cva-admin`). Admin user: `admin` / `admin123`.
- **`src/api.ts`**: Cấu hình các hàm call API tới backend (Base URL: `http://localhost:8080/api`).
- **`src/data/mockData.ts` & `syncData.ts`**: Frontend ban đầu được render hoàn toàn tĩnh qua các biến mảng tĩnh trong `mockData.ts` (ví dụ: `ALL_NEWS`, `ALL_ANNOUNCEMENTS`). `syncData.ts` làm nhiệm vụ fetch dữ liệu thực từ Backend (posts, announcements, lost_found_reports) và nạp/overwrite trực tiếp vào các array này trước khi React load, từ đó tự động cấp dữ liệu động cho toàn bộ app mà không phải đập bỏ giao diện tĩnh.
- **`src/components/`**: Chứa các UI thành phần như `Header`, `Footer`, `Modals`, `NewsAndAnnouncementsSection`, v.v...

### 2.2 BACKEND (`/backend`)
- Nằm tại `d:\CongThongTinDienTu\CongThongTinDienTu\backend`
- **Package base**: `vn.edu.portal`
- **`controller/`**: Chứa các REST API controllers map với `/api/...`. Hỗ trợ CRUD đầy đủ.
  - `PostController` (`/api/posts`): Quản lý bài viết đa thể loại (Tin tức, Tuyển sinh, Câu lạc bộ, Du học, ...) phân biệt qua thuộc tính `category`.
  - `AnnouncementController` (`/api/announcements`): Quản lý thông báo văn bản.
  - `LostFoundReportController` (`/api/lost-found-reports`): Quản lý Đồ thất lạc.
  - `ScheduleController` (`/api/schedules`): Quản lý Thời khóa biểu, lịch công tác.
  - `CategoryController` (`/api/categories`): Quản lý Danh mục (NEWS, ADMISSION, CLUB, STUDY_ABROAD, ...).
- **`entity/`**: Chứa định nghĩa DB Model. **LƯU Ý:** Đã xử lý infinite recursion trong Jackson Serialization bằng Annotation `@JsonIgnore` ở `PostBlock.java` và `@JsonIgnoreProperties` ở `User`, `Category`.
- **`resources/db/changelog/`**: Chứa các cấu hình Liquibase.
  - `01-init-schema.yaml`: Khởi tạo bảng.
  - `02-seed-data.yaml`: Data mẫu bắt buộc cho Categories, User Admin, và mock items. Khi thay đổi file này, cần xoá checksum ở bảng `databasechangelog` trong postgres để Liquibase chạy lại.
- **`application.yml`**: Trỏ tới biến môi trường.
- **`.env`**: DB config cục bộ (cổng 5432, username `postgres`, password `123`).

## 3. CÁCH KHỞI CHẠY (LOCAL)
1. **Database:** Cần bật PostgreSQL, tạo database `portal_db`, username `postgres`, pass `123`.
2. **Backend:** Vào thư mục `backend`, chạy lệnh: `./mvnw spring-boot:run` (Server chạy ở port 8080).
3. **Frontend:** Vào thư mục `frontend`, chạy: `npm install` (lần đầu) và `npm run dev` (Web chạy ở port 3000 hoặc 5173 tùy Vite).

## 4. GHI CHÚ CHO AI/AGENT
- Khi cần tìm cách frontend fetch dữ liệu gì, luôn đọc `api.ts` và `syncData.ts` đầu tiên.
- Khi cần update UI Admin, vào `AdminPages.tsx`. 
- Nếu tạo API mới, đảm bảo frontend fetch API đó có xử lý catch error trả về mảng rỗng `catch(() => [])` để không làm crash `Promise.all` trong `syncData.ts` hoặc `AdminPages.tsx`.
- Lỗi "không xem được tin tức" trước đây là do Infinite Recursion ở Hibernate Proxy, hãy thận trọng khi thêm `@ManyToOne` mới. Luôn đặt cấu hình ngắt đệ quy (`@JsonIgnore` hoặc DTO object).
