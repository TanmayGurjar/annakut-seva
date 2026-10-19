#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 22.04/24.04 server: Node 22, Caddy (automatic HTTPS), firewall, the app as a service.
# Run as root:  bash setup.sh yourdomain.in
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then echo "Usage: bash setup.sh yourdomain.in"; exit 1; fi
APP=/opt/annakut-seva
REPO=https://github.com/TanmayGurjar/annakut-seva.git

echo "== System updates"
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw debian-keyring debian-archive-keyring apt-transport-https gnupg

echo "== Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "== Caddy"
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
apt-get update && apt-get install -y caddy

echo "== Firewall (SSH, HTTP, HTTPS only)"
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

echo "== App"
id annakut >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin annakut
[ -d "$APP/.git" ] || git clone "$REPO" "$APP"
mkdir -p "$APP/data"
chown -R annakut:annakut "$APP"
cd "$APP" && sudo -u annakut npm ci --omit=dev --cache /tmp/annakut-npm

cp "$APP/scripts/linux/annakut.service" /etc/systemd/system/annakut.service
systemctl daemon-reload
systemctl enable --now annakut

sed "s/yourdomain.in/$DOMAIN/" "$APP/scripts/linux/Caddyfile" > /etc/caddy/Caddyfile
systemctl reload caddy

echo
echo "Done. Open https://$DOMAIN (HTTPS can take a minute the first time)."
echo "Status: systemctl status annakut    Logs: journalctl -u annakut -f"
