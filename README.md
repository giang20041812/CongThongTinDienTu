# Cổng thông tin điện tử – THPT Đặng Trần Đức

Website nhà trường và trang quản trị, chạy thành **một app Node.js**:

- `frontend/` – giao diện React (Vite, TypeScript, Tailwind), build ra `frontend/dist`.
- `backend/` – API Node.js (Express 5, TypeScript) ở `/api/*`, đồng thời phục vụ bản build của frontend.
- Cơ sở dữ liệu: PostgreSQL – trên VPS (cách triển khai chính), hoặc Supabase / bất kỳ PostgreSQL nào.
- Ảnh và tệp đính kèm: ổ đĩa của VPS (`STORAGE_PROVIDER=local`) hoặc **Cloudinary**.

Không còn Java/Spring Boot: API giữ nguyên từng đường dẫn và từng trường JSON của bản cũ, dữ liệu Supabase hiện có dùng tiếp được, không cần chuyển đổi.

## Chạy trên máy

Cần Node.js ≥ 20.19 (khuyên dùng 22).

```bash
npm install                               # một lần, cho cả frontend và backend
cp backend/.env.example backend/.env      # rồi điền kết nối DB, Cloudinary
npm run dev                               # web: http://localhost:3000 · API: http://localhost:8080
```

Database cục bộ nhanh nhất: `docker compose up db` (PostgreSQL ở cổng 5432, user `postgres`, mật khẩu `password`, database `portal_db`). Lần chạy đầu, server tự tạo bảng, menu mẫu và tài khoản `admin` / `admin123` – **đổi mật khẩu ngay** (xem mục Cơ sở dữ liệu).

| Lệnh | Việc |
|---|---|
| `npm run build` | Build frontend (`frontend/dist`) và backend (`backend/dist`) |
| `npm start` | Chạy bản đã build: web + API trên cổng `PORT` (mặc định 8080) |
| `npm run lint` | Kiểm tra TypeScript cả hai phần |
| `npm test` | Unit test của backend |
| `npm run db:migrate` | Áp dụng migration mà không khởi động server |

## Triển khai lên VPS (Ubuntu 22.04/24.04)

Mọi thứ nằm trên một VPS (khuyên dùng 2 core / 2,5GB RAM / 40GB):

- **Nginx** đứng trước, lo HTTPS (Let's Encrypt) và phục vụ thẳng ảnh/tệp ở `/uploads`.
- **App Node** là dịch vụ systemd `portal`, chỉ nghe ở `127.0.0.1:8080`.
- **PostgreSQL 17** chỉ nghe trong máy.
- **Ảnh/tệp** nằm ở `/srv/portal/shared/uploads`. Ảnh được thu nhỏ ngay lúc tải lên thành WebP 1600/800/400px.
- **Backup** chạy mỗi đêm lúc 2:30 và đẩy lên Google Drive.

Đo thực tế: app khoảng 80MB RAM khi rảnh và 250MB khi tải nặng, Postgres khoảng 80MB. Mọi file cấu hình nằm trong `deploy/`.

**Cài lần đầu** – SSH vào VPS bằng root:

```bash
git clone https://github.com/giang20041812/CongThongTinDienTu.git /root/portal-src
bash /root/portal-src/deploy/setup-vps.sh ten-mien-cua-truong.edu.vn  # swap, Node 22, PostgreSQL, Nginx, tường lửa, dịch vụ
bash /root/portal-src/deploy/import-supabase.sh                      # chỉ khi chuyển từ Supabase sang (xem dưới)
bash /root/portal-src/deploy/deploy.sh                               # deploy lần đầu
```

`setup-vps.sh` tự tạo database, mật khẩu và `APP_AUTH_SECRET` trong `/srv/portal/shared/.env`, nên không cần điền tay. Nếu là web mới (không chuyển dữ liệu), lần chạy đầu sẽ có tài khoản `admin` / `admin123` – **đổi mật khẩu ngay**.

Sau đó ở chỗ quản lý tên miền, tạo **bản ghi A** cho `ten-mien` và `www.ten-mien`, trỏ về IP của VPS. Khi `ping ten-mien` đã ra đúng IP thì bật HTTPS: `certbot --nginx -d ten-mien -d www.ten-mien --redirect`. Chứng chỉ tự gia hạn.

**Chuyển từ Supabase + Cloudinary** (làm một lần, trong lúc đó đừng sửa nội dung ở web cũ):

1. `bash /root/portal-src/deploy/import-supabase.sh`. Script hỏi chuỗi kết nối (Supabase → **Connect** → *Session pooler*, cổng 5432) rồi chép toàn bộ bảng của app sang DB trên VPS. Supabase chỉ bị đọc, không bị sửa.
2. Deploy lần đầu như trên.
3. Chép ảnh/tệp từ Cloudinary về VPS và sửa link trong bài:
   `sudo -u portal -H bash -c 'cd /srv/portal/current && node backend/dist/cli.js import-cloudinary' && systemctl restart portal`.
   Chạy lại bao nhiêu lần cũng được: link nào đã chuyển thì bỏ qua.
4. Trỏ tên miền về VPS. Giữ Supabase và Cloudinary thêm khoảng 1 tháng làm dự phòng rồi mới xoá.

**Backup lên Google Drive** – nối một lần, chạy `rclone config` bằng root trên VPS:

1. Chọn `n` (remote mới), đặt tên **`gdrive`**, kiểu `drive`. Bỏ trống client_id/secret, chọn scope `drive.file`.
2. Khi được hỏi "Use web browser to automatically authenticate?", trả lời `n`. Trên máy tính có trình duyệt, cài [rclone](https://rclone.org/downloads/) và chạy lệnh `rclone authorize "drive" ...` mà VPS in ra. Đăng nhập Google (nên dùng tài khoản của trường), rồi dán đoạn mã nhận được vào VPS.
3. Chạy thử: `systemctl start portal-backup && journalctl -u portal-backup -n 20`.

Trên Drive sẽ có thư mục `portal-backup/db` (bản dump DB, giữ 90 ngày) và `portal-backup/uploads` (bản sao ảnh/tệp). Trên VPS cũng giữ 14 bản dump gần nhất ở `/srv/portal/backups`. Nếu chưa nối Drive, dịch vụ `portal-backup` báo lỗi (`systemctl status portal-backup`).

**Khôi phục** (VPS mới: chạy `setup-vps.sh` trước):

```bash
rclone copy gdrive:portal-backup/uploads /srv/portal/shared/uploads && chown -R portal:portal /srv/portal/shared/uploads
rclone copy gdrive:portal-backup/db/db-YYYYMMDD-HHMM.dump /tmp/
systemctl stop portal
pg_restore --clean --if-exists --no-owner --dbname="$(sed -n 's/^DATABASE_URL=//p' /srv/portal/shared/.env)" /tmp/db-YYYYMMDD-HHMM.dump
systemctl start portal
```

**Cập nhật web** sau khi push code lên `main`: `sudo portal-deploy`.

- Mỗi lần deploy, code được tải và build ở một thư mục riêng (`/srv/portal/releases/<thời điểm>`). Build hỏng thì web vẫn chạy bản cũ. Bản mới không khởi động được thì tự quay lại bản cũ.
- Web chỉ gián đoạn vài giây lúc khởi động lại.
- Quay lại bản trước: `sudo portal-deploy rollback` (giữ 3 bản gần nhất; chỉ đổi code, không gỡ migration DB).

| Việc | Lệnh |
|---|---|
| Xem log | `journalctl -u portal -f` |
| Khởi động lại (vd. sau khi sửa `.env`) | `sudo systemctl restart portal` |
| Trạng thái | `systemctl status portal nginx postgresql` |
| Backup ngay / xem lần backup tới | `sudo systemctl start portal-backup` / `systemctl list-timers portal-backup` |
| Mở DB bằng psql | `sudo -u postgres psql portal` |

## Triển khai lên Vibe Hosting (Mắt Bão, Nhân Hòa…)

1. Đẩy mã nguồn lên GitHub.
2. Tạo website mới, chọn **GitHub** và repo này, thư mục gốc của repo (không chọn `frontend/` hay `backend/`). Nền tảng tự nhận diện Node.js. Nếu phải nhập lệnh: build `npm run build`, start `npm start`. App lắng nghe cổng `PORT` do hosting cấp.
3. Khai báo **biến môi trường**:

   | Biến | Giá trị |
   |---|---|
   | `DATABASE_URL` | Supabase → **Connect** → *Transaction pooler* (cổng 6543), thay `[YOUR-PASSWORD]`. Ký tự đặc biệt trong mật khẩu phải mã hoá URL (`@` → `%40`). Có thể dùng `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` như bản Java thay cho biến này. |
   | `APP_AUTH_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự (vd. `openssl rand -base64 48`). Giữ nguyên giá trị của bản Java thì admin đang đăng nhập không bị đăng xuất. |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Lấy từ Cloudinary (giống bản Java). |
   | `APP_TIMEZONE` *(tuỳ chọn)* | Mặc định `Asia/Ho_Chi_Minh`. |

4. Deploy, rồi mở **log runtime** và kiểm tra dòng `[db] Cơ sở dữ liệu: aws-…pooler.supabase.com:6543/postgres (SSL)`. Mắt Bão có thể tự tạo một database và tự chèn biến môi trường DB cho app. Nếu log hiện máy chủ khác Supabase, app đang nối vào database rỗng của hosting: kiểm tra lại `DATABASE_URL`.
5. Gắn tên miền riêng theo hướng dẫn của hosting (bản ghi CNAME). Bật **tự deploy khi push** nếu muốn.

Lưu ý:

- Dùng Supabase thì **không cần tạo database trên hosting**; gói nhỏ nhất của Mắt Bão chỉ có 2 dịch vụ cho cả app lẫn DB.
- Muốn dữ liệu nằm ở Việt Nam: tạo PostgreSQL trên hosting và trỏ `DATABASE_URL` vào đó. Lần chạy đầu sẽ tự tạo bảng. Chuyển dữ liệu cũ bằng `pg_dump` (Supabase) và `psql` (DB mới) **trước** lần chạy đầu.
- Trang giới thiệu gói Vibe Coding của **VinaHost** chỉ nói tới việc tải lên bản build tĩnh (thư mục `dist`/`build`/`out`). Hãy hỏi họ có chạy được app Node.js không. Nếu không, web (`frontend/dist`) phải đặt ở một nơi và API ở nơi khác: build frontend với `VITE_API_URL=https://<api>/api` và thêm domain web vào `APP_CORS_ORIGINS` của API.
- **Không commit file `.env`.** Giá trị bí mật chỉ khai báo trên bảng điều khiển của hosting.

Hosting hỗ trợ Dockerfile có thể dùng `Dockerfile` ở gốc repo. Chạy thử trọn bộ trên máy: `docker compose up --build` → http://localhost.

## Cơ sở dữ liệu

- Schema nằm trong `backend/db/migrations/*.sql`. Server tự áp dụng file mới khi khởi động (tắt bằng `DB_MIGRATE_ON_START=false`) và ghi lại vào bảng `schema_migrations`. Muốn đổi schema thì **thêm file mới** `000N_ten.sql`, không sửa file đã chạy.
- **Row Level Security**: mọi bảng đều bật RLS mà không có policy, và role `anon`/`authenticated` không có quyền nào (`0003_rls.sql`). Ai có anon key cũng không đọc/ghi được dữ liệu qua API của Supabase. Website chỉ truy cập DB qua backend Node (role `postgres` là chủ bảng nên không bị RLS chặn). Vì web không dùng Data API, có thể tắt hẳn ở Supabase → *Project Settings* → *Data API*.
- Database do bản Java (Liquibase) tạo được nhận nguyên trạng, không chạy lại dữ liệu mẫu. Hai bảng `databasechangelog` và `databasechangeloglock` không còn dùng, xoá được khi không cần quay lại bản Java.
- **Đổi / quên mật khẩu admin**: trong Supabase → SQL Editor chạy
  `UPDATE users SET password_hash = 'mat-khau-moi' WHERE username = 'admin';`
  Có thể đăng nhập ngay bằng mật khẩu đó. Server tự băm lại khi đăng nhập hoặc khi khởi động.

## Ảnh và tệp đính kèm

Chọn bằng biến `STORAGE_PROVIDER`:

- **`local`** (trên VPS): tệp nằm ở `UPLOAD_DIR`, link dạng `/uploads/images/2026/10/<mã>.webp`. Ảnh được thu nhỏ ngay lúc tải lên (WebP rộng tối đa 1600px, kèm bản 800 và 400px). Giao diện tự chọn bản vừa đủ (`optimizeImage` trong `frontend/src/lib/content.ts`). **Không** dùng `local` trên hosting kiểu container (Vibe Hosting…), vì ổ đĩa ở đó bị xoá mỗi lần deploy.
- **`cloudinary`**: giống bản Java. Cloudinary thu nhỏ ảnh qua URL.

Database lưu đường dẫn tệp trong `posts.cover_url`, `post_blocks.image_url`, `post_attachments.url`. Tệp cũ vẫn mở được chừng nào kho cũ còn phục vụ. `node backend/dist/cli.js import-cloudinary` chép mọi tệp Cloudinary mà bài viết đang dùng về `UPLOAD_DIR` và sửa các link này. Muốn thêm kho khác (S3…), thêm một file cài đặt `FileStorage` cạnh `backend/src/storage/local.ts`.
