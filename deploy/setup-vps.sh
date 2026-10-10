#!/usr/bin/env bash
# Cài VPS lần đầu – Ubuntu 22.04/24.04 mới tinh, chạy bằng root:
#   git clone https://github.com/giang20041812/CongThongTinDienTu.git /root/portal-src
#   bash /root/portal-src/deploy/setup-vps.sh ten-mien-cua-truong.edu.vn
# Chạy lại nhiều lần cũng được: bước nào đã xong thì bỏ qua (không ghi đè .env hay cấu hình HTTPS của certbot).
set -euo pipefail

DOMAIN=${1:?"Cách dùng: bash setup-vps.sh <tên miền, vd. thpt-abc.edu.vn>"}
HERE=$(cd "$(dirname "$0")" && pwd)
APP_DIR=/srv/portal
NGINX_SITE=/etc/nginx/sites-available/portal

if [ "$(id -u)" -ne 0 ]; then
  echo "Hãy chạy bằng root (sudo -i)." >&2
  exit 1
fi
if ! [[ $DOMAIN =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "Tên miền không hợp lệ: $DOMAIN (chỉ ghi tên miền, không có http:// hay www.)" >&2
  exit 1
fi

echo "==> Swap 2 GB (đệm RAM cho lúc build)"
if [ -z "$(swapon --show --noheadings)" ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Cài Node.js 22, Nginx, Certbot, Git"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git sudo openssl ufw nginx certbot python3-certbot-nginx >/dev/null
if ! node -v 2>/dev/null | grep -q '^v22\.'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
# Some VPS images ship Apache on port 80, which would keep Nginx from starting.
if systemctl is-active --quiet apache2 2>/dev/null; then
  echo "    Tắt Apache (đang chiếm cổng 80)"
  systemctl disable --now apache2
fi

echo "==> Tường lửa: chỉ mở SSH, 80, 443"
# SSH may listen on a custom port: it must stay open, or this session is the last one.
for port in 22 $(sshd -T 2>/dev/null | awk '$1 == "port" { print $2 }') 80 443; do
  ufw allow "$port/tcp" >/dev/null
done
ufw --force enable >/dev/null

echo "==> Tài khoản 'portal' và thư mục $APP_DIR"
id portal >/dev/null 2>&1 || useradd --system --create-home --home-dir /home/portal --shell /usr/sbin/nologin portal
install -d -o portal -g portal "$APP_DIR" "$APP_DIR/releases" "$APP_DIR/shared"
if [ ! -f "$APP_DIR/shared/.env" ]; then
  install -o portal -g portal -m 600 /dev/null "$APP_DIR/shared/.env"
  cat > "$APP_DIR/shared/.env" <<EOF
# Biến môi trường của website – chỉ root và user portal đọc được. Sửa xong: sudo systemctl restart portal
# Ý nghĩa từng biến: backend/.env.example. PORT/HOST đã đặt sẵn trong portal.service.

# Supabase > Connect > Transaction pooler (cổng 6543); ký tự đặc biệt trong mật khẩu phải mã hoá URL (@ → %40).
DATABASE_URL=
APP_AUTH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
APP_TIMEZONE=Asia/Ho_Chi_Minh
EOF
fi

echo "==> Dịch vụ systemd 'portal' và Nginx cho $DOMAIN"
install -m 644 "$HERE/portal.service" /etc/systemd/system/portal.service
systemctl daemon-reload
systemctl enable portal >/dev/null 2>&1 # started by the first deploy
# certbot adds HTTPS to this file later, so an existing one is never overwritten.
[ -f "$NGINX_SITE" ] || sed "s/TEN_MIEN/$DOMAIN/g" "$HERE/nginx-portal.conf" > "$NGINX_SITE"
ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/portal
rm -f /etc/nginx/sites-enabled/default
nginx -t -q
systemctl enable nginx >/dev/null 2>&1
systemctl restart nginx

# A wrapper rather than a symlink: works even when the script lost its executable bit (commits from Windows).
printf '#!/bin/sh\nexec bash %s/current/deploy/deploy.sh "$@"\n' "$APP_DIR" > /usr/local/sbin/portal-deploy
chmod 755 /usr/local/sbin/portal-deploy

cat <<EOF

Xong phần cài đặt. Còn 3 bước:
  1. Điền DATABASE_URL và CLOUDINARY_*:  nano $APP_DIR/shared/.env
  2. Deploy lần đầu:                     bash $HERE/deploy.sh
     Từ lần sau chỉ cần:                 sudo portal-deploy    (quay lại bản trước: sudo portal-deploy rollback)
  3. Trỏ tên miền về VPS: bản ghi A của $DOMAIN và www.$DOMAIN → $(hostname -I | awk '{ print $1 }')
     Khi DNS đã nhận (ping $DOMAIN ra đúng IP), bật HTTPS:
       certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect
     (không dùng www thì bỏ "-d www.$DOMAIN")
EOF
