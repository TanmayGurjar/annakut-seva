# જમોને જમાડું રે – Annakut Seva App

Seva collection app for the yearly Annakutotsav at BAPS Shri Swaminarayan Mandir, Porbandar.

## Run it

```
cd C:\Users\Hp\annakut-seva
npm install        (first time only)
npm start
```
Open http://localhost:3000

First login: **mobile `9999999999` / password `admin123`**. The app makes you set a new password before you can do anything else.
To use your own number from the start, delete the `data` folder and run:
`$env:ADMIN_MOBILE="98xxxxxxxx"; $env:ADMIN_PASSWORD="yourpass"; npm start`

## Who does what

| Role | Can do |
|---|---|
| **Admin** (you) | Dashboard, all entries, edit/delete, Excel export, add karyakars, mandals, seva/thal list, create each year's event |
| **Karyakar** (one area, e.g. Narsang Tekri) | Add seva entries; see/edit their own **and their annakut sevaks'** entries; add/approve annakut sevaks; team summary + Google Sheets |
| **Annakut Sevak** (works under one karyakar) | Registers from the login page ("નોંધણી કરો"), can log in once their karyakar approves. Adds entries, sees/edits **only their own**, sends WhatsApp receipts |

## Receipt numbers: TG-1, TG-2 … NV-1

Every person has a unique short **code** made from the initials of their name (તન્મય ગુર્જર → **TG**, નિલેશભાઇ વિસાવાડીયા → **NV**).
If two names give the same code, the second gets 3 letters (e.g. **BVP**). Admin / karyakar can change a code (2–4 English letters).
Each entry's receipt is the code of whoever entered it plus their own running number: **TG-1, TG-2 …**, starting again from 1 each festival.
Search works with or without the dash (`TG-12` or `tg12`). The code tells you the person, and through their karyakar, the area.

Only the admin creates karyakars. Annakut sevaks either register themselves (karyakar approves under **👥 મારી ટીમ**) or are added directly by their karyakar.

## Summary in Google Sheets

Dashboard (admin) and **👥 મારી ટીમ** (karyakar) show a team summary: each karyakar, their annakut sevaks, entries, amount, pending amount and a count for every seva (બેકરી / ફરસાણ / મિષ્ટાન ...), with a team total row. Filter by one seva with the dropdown.

- **Download:** "⬇ સારાંશ" / "⬇ બધી એન્ટ્રી" → upload the file to Google Drive → "Open with Google Sheets".
- **Live sheet (once the app is online):** "લાઈવ લિંક બનાવો" gives a formula like `=IMPORTDATA("https://<site>/sheets/<secret>/summary.csv")`.
  Paste it in cell A1 of a new Google Sheet and it keeps itself updated (Google refreshes about every hour). Add `?seva_type_id=2` to the link for one seva only.
  Keep the link secret; "નવી લિંક" makes the old one stop working.

## Pages

- `login.html`: login for everyone
- `app.html`: karyakar entry form + "my entries"
- `admin.html`: admin panel
- `receipt.html?id=`: printable receipt

## Setup each year

1. Admin → **ઉત્સવ** → create a new event (e.g. "અન્નકૂટોત્સવ 2026"), set the date, tick "ચાલુ".
   Last year's data stays saved and still shows on the ઉત્સવ tab.
2. **સેવા/થાળ**: update the amounts if they changed.
3. **મંડળ**: add the Porbandar areas.
4. **કાર્યકર**: add each karyakar (name, mobile, password, mandal). Share the link and their password.

## Files

```
server.js      API + login/roles
db.js          database tables + first-run setup
public/        screens (HTML/CSS/JS, no build step)
data/          annakut.db  ← ALL YOUR DATA. Back this folder up.
data/backups/  automatic daily copies (last 30 days)
```

## Safety built in

- **Backups:** a copy of the database is saved to `data/backups/` when the app starts and every 6 hours (one file per day, last 30 kept).
  These copies are on the same computer, so also use **Admin → બધી એન્ટ્રી → ⬇ બેકઅપ** now and then and keep the file on Google Drive or a pen drive.
  To restore: stop the app, copy a backup file to `data/annakut.db` (delete `annakut.db-wal` / `-shm`), start again.
- **Login:** "Remember me" keeps a phone logged in for 90 days (renewed while used). After 5 wrong passwords for a mobile number, that number is locked for 15 minutes.
- When an admin resets a karyakar's password, or a user changes their own, their other devices are logged out.

## Put it online (this laptop, free)

Set up once (already done on this laptop):

```
winget install Cloudflare.cloudflared
powershell -ExecutionPolicy Bypass -File scripts\windows\install-autostart.ps1
```

- The app and a free **Cloudflare quick tunnel** start hidden every time you log in to Windows,
  and restart by themselves if they stop. Logs: `data\logs\server.log`, `data\logs\tunnel.log`.
- The internet link looks like `https://<random-words>.trycloudflare.com` and **changes every time the laptop restarts**.
  The current link is shown at the top of the admin dashboard (and the karyakar's "👥 મારી ટીમ" tab) with a WhatsApp share button.
  Live Google Sheet formulas contain the link too, so re-create them after a restart (or buy a domain for a fixed link).
- Keep the laptop plugged in, online and logged in to Windows during the collection days.
- Stop: `scripts\windows\stop-server.ps1` · remove auto-start: `scripts\windows\uninstall-autostart.ps1`
- Phones on the same Wi-Fi can still use `http://<laptop-IP>:3000`.
- Settings (port, extra backup folder, tunnel off): copy `settings.local.example.cmd` to `settings.local.cmd`.

## Put it online (own server + domain, fixed link)

**Buy:** a VPS (not "web/shared hosting") with Ubuntu 24.04, 1 CPU / 1 GB RAM, Mumbai region if offered
(Hostinger KVM 1, DigitalOcean, AWS Lightsail, Hetzner, ~₹400–600/month), and a domain (~₹500–1000/year).
The database is SQLite inside the app (`data/annakut.db`), so nothing else is needed.

1. **DNS:** at the domain seller add an **A record**: name `@` (or e.g. `seva`), value = the server's IP.
2. **Setup (once):** log in with `ssh root@<server-IP>` and run
   ```
   curl -fsSL https://raw.githubusercontent.com/TanmayGurjar/annakut-seva/main/scripts/linux/setup.sh -o setup.sh
   bash setup.sh yourdomain.in
   ```
   This installs Node 22, Caddy (free automatic HTTPS) and a firewall, and runs the app as a service that
   starts on boot and restarts by itself. The app listens only on `127.0.0.1:3000`; Caddy serves it on `https://yourdomain.in`.
3. **Move the data:** on the laptop stop the app (`scripts\windows\stop-server.ps1`), then
   ```
   scp -r data root@<server-IP>:/opt/annakut-seva/
   ssh root@<server-IP> "rm -f /opt/annakut-seva/data/server.pid && chown -R annakut:annakut /opt/annakut-seva/data && systemctl restart annakut"
   ```
   (Skip this to start empty: the first admin is `9999999999` / `admin123`, change it right away.)
4. **Laptop off duty:** run `scripts\windows\uninstall-autostart.ps1` so only the server collects entries.
   Re-create the live Google Sheet formulas with the new domain.

**Updating the code:** push to GitHub, then on the server `bash /opt/annakut-seva/scripts/linux/update.sh` (data is not touched).
**Status / logs:** `systemctl status annakut` · `journalctl -u annakut -f`.
**Backups:** the server keeps daily copies in `/opt/annakut-seva/data/backups/`; also download one now and then
from the admin page so a copy lives off the server.

## Ideas for later

- Send the WhatsApp receipt automatically (WhatsApp Business API)
- UPI QR code on the entry screen
- Prasad delivery tracking (delivered ✔ per entry)
- Hindi/English language switch
- Automatic daily backup of `data/`
