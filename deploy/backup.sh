#!/usr/bin/env bash
# Backup hằng đêm (portal-backup.timer, 2:30 giờ VN). Chạy tay: sudo systemctl start portal-backup
# Xem kết quả: journalctl -u portal-backup -n 20
#   - DB: pg_dump vào /srv/portal/backups (giữ 14 ngày), chép lên Google Drive (giữ 90 ngày).
#   - Ảnh/tệp: chép các tệp mới lên Google Drive. Tệp tải lên không bao giờ bị sửa hay xoá nên chỉ cần chép thêm.
# Google Drive = rclone remote "gdrive" (tạo bằng rclone config, xem README); đổi nơi lưu bằng biến BACKUP_REMOTE.
set -euo pipefail

APP_DIR=/srv/portal
BACKUP_DIR=$APP_DIR/backups
REMOTE=${BACKUP_REMOTE:-gdrive:portal-backup}
KEEP_LOCAL_DAYS=14
KEEP_REMOTE_DAYS=90

db_url=$(sed -n 's/^DATABASE_URL=//p' "$APP_DIR/shared/.env")
dump="$BACKUP_DIR/db-$(date +%Y%m%d-%H%M).dump"
pg_dump --dbname="$db_url" --format=custom --file="$dump.part"
mv "$dump.part" "$dump"
find "$BACKUP_DIR" -name 'db-*.dump' -mtime +"$KEEP_LOCAL_DAYS" -delete
echo "DB: $dump ($(du -h "$dump" | cut -f1))"

if ! rclone listremotes | grep -qx "${REMOTE%%:*}:"; then
  echo "!! Chưa nối Google Drive (rclone remote \"${REMOTE%%:*}\"): bản backup chỉ nằm trên VPS. Xem README." >&2
  exit 1
fi
rclone copy "$dump" "$REMOTE/db"
rclone delete "$REMOTE/db" --min-age "${KEEP_REMOTE_DAYS}d"
rclone copy "$APP_DIR/shared/uploads" "$REMOTE/uploads"
echo "Đã chép lên $REMOTE: DB và $(find "$APP_DIR/shared/uploads" -type f | wc -l) tệp ảnh/đính kèm."
