#!/usr/bin/env bash
# Đưa bản mới nhất trên GitHub lên VPS (sau khi đã chạy setup-vps.sh):
#   sudo portal-deploy             tải code, build ở thư mục riêng, rồi mới chuyển web sang bản mới
#   sudo portal-deploy rollback    quay lại bản trước
# Mỗi bản nằm ở /srv/portal/releases/<thời điểm>, /srv/portal/current trỏ tới bản đang chạy, giữ 3 bản gần nhất.
# Build hỏng thì web vẫn chạy bản cũ; bản mới khởi động không được thì tự quay lại bản cũ.
# Lưu ý: rollback chỉ đổi code, không gỡ migration DB mà bản mới đã chạy.
set -euo pipefail

APP_DIR=/srv/portal
REPO=${REPO:-https://github.com/giang20041812/CongThongTinDienTu.git}
BRANCH=${BRANCH:-main}
KEEP=3
HEALTH_URL=http://127.0.0.1:8080/api/categories

as_app() { sudo -u portal -H "$@"; }

# Renaming a symlink is atomic: requests never see a missing "current".
switch_to() {
  ln -sfn "$1" "$APP_DIR/current.new"
  mv -T "$APP_DIR/current.new" "$APP_DIR/current"
}

restart_and_check() {
  systemctl restart portal
  for _ in $(seq 1 40); do
    curl -fs -o /dev/null "$HEALTH_URL" && return 0
    sleep 1
  done
  return 1
}

deploy() {
  local release previous
  release="$APP_DIR/releases/$(date +%Y%m%d-%H%M%S)"
  previous=$(readlink -f "$APP_DIR/current" || true)

  echo "==> Tải mã nguồn ($BRANCH) vào $release"
  if ! (as_app git clone --quiet --depth 1 --branch "$BRANCH" "$REPO" "$release" &&
        as_app ln -s "$APP_DIR/shared/.env" "$release/backend/.env" &&
        cd "$release" &&
        echo "==> Cài thư viện và build" &&
        as_app npm ci --no-audit --no-fund --loglevel=error &&
        as_app npm run build); then
    rm -rf "$release"
    echo "!! Build thất bại – web vẫn chạy bản cũ." >&2
    exit 1
  fi

  echo "==> Chuyển sang bản mới"
  switch_to "$release"
  if restart_and_check; then
    echo "==> Xong: $(as_app git -C "$release" log -1 --format='%h %s')"
    # Keep the newest $KEEP releases (names sort by time).
    find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"$KEEP" | xargs -r rm -rf
    return
  fi

  echo "!! Bản mới không khởi động được. Xem log: journalctl -u portal -n 80" >&2
  if [ -d "$previous" ] && [ "$previous" != "$release" ]; then
    switch_to "$previous"
    # A release that never started is dropped, so "rollback" can only land on releases that ran.
    rm -rf "$release"
    restart_and_check && echo "!! Đã quay lại bản cũ: $previous" >&2
  fi
  exit 1
}

rollback() {
  local current target
  current=$(readlink -f "$APP_DIR/current")
  target=$(find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d | sort |
           awk -v cur="$current" '$0 == cur { print prev; exit } { prev = $0 }')
  if [ -z "$target" ]; then
    echo "Không còn bản cũ hơn $current để quay lại." >&2
    exit 1
  fi
  switch_to "$target"
  if restart_and_check; then
    echo "==> Đã quay lại $target"
  else
    echo "!! $target cũng không khởi động được. Xem log: journalctl -u portal -n 80" >&2
    exit 1
  fi
}

main() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Hãy chạy bằng sudo: sudo portal-deploy" >&2
    exit 1
  fi
  case "${1:-deploy}" in
    deploy) deploy ;;
    rollback) rollback ;;
    *) echo "Cách dùng: sudo portal-deploy [rollback]" >&2; exit 1 ;;
  esac
}

main "$@"
exit
