#!/usr/bin/env bash
# Chép toàn bộ dữ liệu từ Supabase vào PostgreSQL của VPS – chạy bằng root, thường chỉ một lần khi chuyển sang VPS:
#   bash /root/portal-src/deploy/import-supabase.sh     (sau lần deploy đầu: sudo portal-import-supabase)
# DB trên VPS bị thay hết bằng bản của Supabase; Supabase chỉ bị đọc. Bản dump được giữ trong /srv/portal/backups.
# Ảnh/tệp vẫn trỏ về Cloudinary cho tới khi chạy "node backend/dist/cli.js import-cloudinary".
set -euo pipefail

APP_DIR=/srv/portal
ENV_FILE=$APP_DIR/shared/.env

if [ "$(id -u)" -ne 0 ]; then
  echo "Hãy chạy bằng root." >&2
  exit 1
fi
cd / # sudo -u postgres must not start in a folder it cannot read
local_url=$(sed -n 's/^DATABASE_URL=//p' "$ENV_FILE")
if [[ $local_url != *@127.0.0.1:* ]]; then
  echo "DATABASE_URL trong $ENV_FILE không trỏ vào PostgreSQL của VPS – dừng để khỏi ghi nhầm chỗ." >&2
  exit 1
fi

echo "Supabase → Connect → Session pooler (cổng 5432): chép chuỗi kết nối, thay [YOUR-PASSWORD] bằng mật khẩu DB."
read -rsp "Dán chuỗi kết nối rồi Enter (không hiện ra màn hình): " source_url
echo
if [[ $source_url != postgres://* && $source_url != postgresql://* ]]; then
  echo "Chuỗi kết nối phải bắt đầu bằng postgresql://" >&2
  exit 1
fi

posts=$(psql "$local_url" -tAc 'SELECT count(*) FROM posts' 2>/dev/null || echo 0)
if [ "$posts" != 0 ]; then
  read -rp "DB trên VPS đang có $posts bài viết và sẽ bị thay bằng dữ liệu của Supabase. Gõ YES để tiếp tục: " answer
  [ "$answer" = YES ] || { echo "Đã huỷ."; exit 1; }
fi

dump="$APP_DIR/backups/supabase-$(date +%Y%m%d-%H%M).dump"
echo "==> Tải dữ liệu từ Supabase"
# Only the app's tables: no Supabase roles, grants or functions, nor the Liquibase leftovers of the Java version.
pg_dump --dbname="$source_url" --format=custom --no-owner --no-privileges \
  --table='public.*' --exclude-table='public.databasechangelog*' --file="$dump"

echo "==> Thay dữ liệu trên VPS"
was_running=$(systemctl is-active portal || true)
systemctl stop portal 2>/dev/null || true
sudo -u postgres dropdb --if-exists --force portal
sudo -u postgres createdb -O portal portal
pg_restore --dbname="$local_url" --no-owner --no-privileges --exit-on-error "$dump"
psql "$local_url" -tAc "SELECT 'Đã chép: ' || count(*) || ' bài viết, ' || (SELECT count(*) FROM categories) || ' đầu mục, '
                          || (SELECT count(*) FROM feedbacks) || ' góp ý' FROM posts"
if [ "$was_running" = active ]; then systemctl start portal; fi
echo "==> Xong. Bản dump của Supabase giữ ở $dump"
