#!/usr/bin/env bash
# Cài VPS lần đầu – Ubuntu 22.04/24.04 mới tinh, chạy bằng root:
#   git clone https://github.com/giang20041812/CongThongTinDienTu.git /root/portal-src
#   bash /root/portal-src/deploy/setup-vps.sh ten-mien-cua-truong.edu.vn
# Mọi thứ nằm trên VPS: PostgreSQL 17, ảnh/tệp ở /srv/portal/shared/uploads, backup hằng đêm (đẩy lên Google Drive).
# Chạy lại nhiều lần cũng được: bước nào đã xong thì bỏ qua (không ghi đè .env, DB hay cấu hình HTTPS của certbot).
set -euo pipefail

DOMAIN=${1:?"Cách dùng: bash setup-vps.sh <tên miền, vd. thpt-abc.edu.vn>"}
HERE=$(cd "$(dirname "$0")" && pwd)
APP_DIR=/srv/portal
ENV_FILE=$APP_DIR/shared/.env
NGINX_SITE=/etc/nginx/sites-available/portal
PG_VERSION=17

if [ "$(id -u)" -ne 0 ]; then
  echo "Hãy chạy bằng root (sudo -i)." >&2
  exit 1
fi
if ! [[ $DOMAIN =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "Tên miền không hợp lệ: $DOMAIN (chỉ ghi tên miền, không có http:// hay www.)" >&2
  exit 1
fi
cd / # sudo -u postgres must not start in a folder it cannot read

echo "==> Swap 2 GB (đệm RAM cho lúc build)"
if [ -z "$(swapon --show --noheadings)" ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Cài Node.js 22, PostgreSQL $PG_VERSION, Nginx, Certbot, rclone"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git sudo openssl unzip ufw nginx certbot python3-certbot-nginx >/dev/null
if ! node -v 2>/dev/null | grep -q '^v22\.'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
if [ ! -x "/usr/lib/postgresql/$PG_VERSION/bin/postgres" ]; then
  # Official PostgreSQL repository (Ubuntu's own is older); same major version as Supabase, so its dumps restore.
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y -qq "postgresql-$PG_VERSION" >/dev/null
fi
command -v rclone >/dev/null || curl -fsSL https://rclone.org/install.sh | bash >/dev/null
# Some VPS images ship Apache on port 80, which would keep Nginx from starting.
if systemctl is-active --quiet apache2 2>/dev/null; then
  echo "    Tắt Apache (đang chiếm cổng 80)"
  systemctl disable --now apache2
fi

echo "==> Tường lửa: chỉ mở SSH, 80, 443 (PostgreSQL chỉ nghe trong máy)"
# SSH may listen on a custom port: it must stay open, or this session is the last one.
for port in 22 $(sshd -T 2>/dev/null | awk '$1 == "port" { print $2 }') 80 443; do
  ufw allow "$port/tcp" >/dev/null
done
ufw --force enable >/dev/null

echo "==> Tài khoản 'portal' và thư mục $APP_DIR"
id portal >/dev/null 2>&1 || useradd --system --create-home --home-dir /home/portal --shell /usr/sbin/nologin portal
install -d -o portal -g portal "$APP_DIR" "$APP_DIR/releases" "$APP_DIR/shared" "$APP_DIR/shared/uploads"
install -d -m 700 "$APP_DIR/backups"
if [ ! -f "$ENV_FILE" ]; then
  install -o portal -g portal -m 600 /dev/null "$ENV_FILE"
  cat > "$ENV_FILE" <<EOF
# Biến môi trường của website – chỉ root và user portal đọc được. Sửa xong: sudo systemctl restart portal
# Ý nghĩa từng biến: backend/.env.example. PORT/HOST đã đặt sẵn trong portal.service.

# PostgreSQL trên chính VPS này (setup-vps.sh tự điền).
DATABASE_URL=
APP_AUTH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
APP_TIMEZONE=Asia/Ho_Chi_Minh
# Ảnh/tệp lưu trên ổ đĩa VPS, Nginx phục vụ ở /uploads.
STORAGE_PROVIDER=local
UPLOAD_DIR=$APP_DIR/shared/uploads
EOF
fi

echo "==> PostgreSQL: database 'portal' (chỉ nghe ở 127.0.0.1)"
# Sized for a small VPS: the app needs at most DB_POOL_SIZE (10) connections.
cat > "/etc/postgresql/$PG_VERSION/main/conf.d/portal.conf" <<'EOF'
# setup-vps.sh – VPS nhỏ, chỉ một app dùng.
max_connections = 30
shared_buffers = 128MB
effective_cache_size = 512MB
EOF
systemctl restart postgresql
if [ -z "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'portal'")" ]; then
  db_password=$(openssl rand -hex 24)
  sudo -u postgres psql -q -c "CREATE ROLE portal LOGIN PASSWORD '$db_password'"
  sudo -u postgres createdb -O portal portal
  sed -i "s|^DATABASE_URL=\$|DATABASE_URL=postgresql://portal:$db_password@127.0.0.1:5432/portal|" "$ENV_FILE"
fi
if ! grep -q '^DATABASE_URL=.' "$ENV_FILE"; then
  echo "!! $ENV_FILE chưa có DATABASE_URL (role 'portal' đã có từ trước) – hãy điền tay." >&2
fi

echo "==> Dịch vụ systemd: portal (web), portal-backup (2:30 mỗi đêm)"
install -m 644 "$HERE/portal.service" "$HERE/portal-backup.service" "$HERE/portal-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable portal >/dev/null 2>&1 # started by the first deploy
systemctl enable --now portal-backup.timer >/dev/null 2>&1

echo "==> Nginx cho $DOMAIN"
# certbot adds HTTPS to this file later, so an existing one is never overwritten.
[ -f "$NGINX_SITE" ] || sed "s/TEN_MIEN/$DOMAIN/g" "$HERE/nginx-portal.conf" > "$NGINX_SITE"
ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/portal
rm -f /etc/nginx/sites-enabled/default
nginx -t -q
systemctl enable nginx >/dev/null 2>&1
systemctl restart nginx

# Wrappers rather than symlinks: they work even when a script lost its executable bit (commits from Windows).
for tool in deploy import-supabase; do
  printf '#!/bin/sh\nexec bash %s/current/deploy/%s.sh "$@"\n' "$APP_DIR" "$tool" > "/usr/local/sbin/portal-$tool"
  chmod 755 "/usr/local/sbin/portal-$tool"
done

cat <<EOF

Xong phần cài đặt. Các bước tiếp theo (README, mục "Triển khai lên VPS"):
  1. Chép dữ liệu đang có từ Supabase (bỏ qua nếu làm web mới):
       bash $HERE/import-supabase.sh
  2. Deploy lần đầu:          bash $HERE/deploy.sh
     Từ lần sau chỉ cần:      sudo portal-deploy    (quay lại bản trước: sudo portal-deploy rollback)
  3. Chép ảnh/tệp từ Cloudinary về VPS (nếu đã làm bước 1):
       sudo -u portal -H bash -c 'cd $APP_DIR/current && node backend/dist/cli.js import-cloudinary' && systemctl restart portal
  4. Trỏ tên miền về VPS: bản ghi A của $DOMAIN và www.$DOMAIN → $(hostname -I | awk '{ print $1 }')
     Khi DNS đã nhận (ping $DOMAIN ra đúng IP), bật HTTPS:
       certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect
     (không dùng www thì bỏ "-d www.$DOMAIN")
  5. Nối Google Drive cho backup: rclone config  (tạo remote tên "gdrive", xem README)
     rồi chạy thử: systemctl start portal-backup && journalctl -u portal-backup -n 20
EOF
