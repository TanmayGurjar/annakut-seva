#!/usr/bin/env bash
# Get the latest code from GitHub and restart the app (data is not touched). Run as root: bash /opt/annakut-seva/scripts/linux/update.sh
set -euo pipefail
cd /opt/annakut-seva
sudo -u annakut git pull --ff-only
sudo -u annakut npm ci --omit=dev --cache /tmp/annakut-npm
systemctl restart annakut
systemctl --no-pager status annakut | head -5
