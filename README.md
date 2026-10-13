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
| **Karyakar** | Log in with mobile + password, add seva entries, see/edit **only their own** entries, send WhatsApp receipts |

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

## Put it online (so karyakars can use it from their phones)

- **Option A (quick, at the mandir):** run it on one laptop. Phones on the same Wi-Fi open `http://<laptop-IP>:3000`
  (find the IP with `ipconfig`).
- **Option B (internet):** deploy to a small VPS (Hostinger, DigitalOcean, AWS Lightsail, ~₹400–500/month) or to Railway/Render
  **with a persistent disk** mounted, and set `DATA_DIR` to that disk. Put it behind HTTPS (Caddy/Nginx or the host's built-in HTTPS).
  Needs Node 22.13 or newer.

## Ideas for later

- Send the WhatsApp receipt automatically (WhatsApp Business API)
- UPI QR code on the entry screen
- Prasad delivery tracking (delivered ✔ per entry)
- Hindi/English language switch
- Automatic daily backup of `data/`
