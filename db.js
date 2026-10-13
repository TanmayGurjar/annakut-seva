// Database setup (uses Node's built-in SQLite - no extra install needed)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'annakut.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

// Roles: admin > karyakar (looks after one area) > sevak (annakut sevak, works under a karyakar via parent_id)
function usersTable(name) {
  return `CREATE TABLE IF NOT EXISTS ${name} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','karyakar','sevak')),
  mandal_id INTEGER REFERENCES mandals(id),
  parent_id INTEGER REFERENCES users(id),
  active INTEGER NOT NULL DEFAULT 1,
  approved INTEGER NOT NULL DEFAULT 1,
  must_change INTEGER NOT NULL DEFAULT 0,
  sheet_token TEXT UNIQUE,
  code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);`;
}

db.exec(`
CREATE TABLE IF NOT EXISTS mandals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1
);

${usersTable('users')}

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  event_date TEXT,
  place TEXT,
  time_text TEXT,
  is_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seva_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  receipt_no INTEGER NOT NULL,
  mandal_id INTEGER NOT NULL REFERENCES mandals(id),
  devotee_name TEXT NOT NULL,
  address TEXT,
  mobile TEXT NOT NULL,
  whatsapp TEXT,
  amount INTEGER NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'cash',
  payment_ref TEXT,
  paid INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  karyakar_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT,
  UNIQUE (event_id, receipt_no)
);

CREATE TABLE IF NOT EXISTS entry_sevas (
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  seva_type_id INTEGER NOT NULL REFERENCES seva_types(id),
  amount INTEGER NOT NULL,
  PRIMARY KEY (entry_id, seva_type_id)
);

CREATE INDEX IF NOT EXISTS idx_entries_event ON entries(event_id);
CREATE INDEX IF NOT EXISTS idx_entries_mobile ON entries(mobile);
CREATE INDEX IF NOT EXISTS idx_entries_karyakar ON entries(karyakar_id);
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

const DEFAULT_PASSWORD = 'admin123';

// Upgrade older databases: users still on the default password must change it before using the app
const userCols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!userCols.includes('must_change')) {
  db.exec('ALTER TABLE users ADD COLUMN must_change INTEGER NOT NULL DEFAULT 0');
  const setFlag = db.prepare('UPDATE users SET must_change = 1 WHERE id = ?');
  db.prepare('SELECT id, password_hash FROM users').all()
    .forEach((u) => { if (verifyPassword(DEFAULT_PASSWORD, u.password_hash)) setFlag.run(u.id); });
}

// Upgrade older databases to the admin > karyakar > sevak hierarchy (SQLite needs a table rebuild for this)
const usersSql = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'").get().sql;
if (!usersSql.includes("'sevak'")) {
  db.exec('PRAGMA foreign_keys = OFF');
  db.exec(`BEGIN;
    ${usersTable('users_new')}
    INSERT INTO users_new (id, name, mobile, password_hash, role, mandal_id, active, must_change, created_at)
      SELECT id, name, mobile, password_hash, role, mandal_id, active, must_change, created_at FROM users;
    DROP TABLE users;
    ALTER TABLE users_new RENAME TO users;
    COMMIT;`);
  db.exec('PRAGMA foreign_keys = ON');
}
db.exec('CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id)');

// ---------- person codes + receipt numbers like TG-1, TG-2 ... NV-1 ----------
// Every person has a unique short code (from the initials of their name). Each entry gets
// code + that code's own running number for the festival.
const GU_LATIN = {
  'ક': 'K', 'ખ': 'K', 'ગ': 'G', 'ઘ': 'G', 'ચ': 'C', 'છ': 'C', 'જ': 'J', 'ઝ': 'Z', 'ટ': 'T', 'ઠ': 'T', 'ડ': 'D', 'ઢ': 'D',
  'ણ': 'N', 'ત': 'T', 'થ': 'T', 'દ': 'D', 'ધ': 'D', 'ન': 'N', 'પ': 'P', 'ફ': 'F', 'બ': 'B', 'ભ': 'B', 'મ': 'M', 'ય': 'Y',
  'ર': 'R', 'લ': 'L', 'વ': 'V', 'શ': 'S', 'ષ': 'S', 'સ': 'S', 'હ': 'H', 'ળ': 'L',
  'અ': 'A', 'આ': 'A', 'ઇ': 'I', 'ઈ': 'I', 'ઉ': 'U', 'ઊ': 'U', 'એ': 'E', 'ઐ': 'A', 'ઓ': 'O', 'ઔ': 'A', 'ઋ': 'R',
};
// Latin letters of a word, one per Gujarati letter (vowel signs skipped): "તન્મય" -> ["T","N","M","Y"]
const letters = (word) => [...word].map((c) => GU_LATIN[c] || (/[a-z]/i.test(c) ? c.toUpperCase() : '')).filter(Boolean);

const CODE_RE = /^[A-Z]{2,4}$/;
const codeTaken = (code, exceptId) => !!db.prepare('SELECT 1 FROM users WHERE code = ? AND id != ?').get(code, exceptId || 0);

// "તન્મય ગુર્જર" -> TG; if taken TNG, TGR ...; always unique
function makeCode(name, exceptId) {
  const words = String(name || '').trim().split(/\s+/).map(letters).filter((w) => w.length);
  if (!words.length) words.push(['X']);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : first.slice(1).length ? first.slice(1) : ['X'];
  const tries = [first[0] + last[0]];
  first.slice(1).forEach((c) => tries.push(first[0] + c + last[0]));
  last.slice(1).forEach((c) => tries.push(first[0] + last[0] + c));
  for (const c of 'ABCDEFGHJKLMNPRSTUVWYZ') tries.push(first[0] + last[0] + c);
  return tries.find((c) => CODE_RE.test(c) && !codeTaken(c, exceptId)) || `${first[0]}${last[0]}${Date.now() % 100}`;
}

// Older databases: add the code columns, give everyone a code, number existing entries per code
if (!db.prepare('PRAGMA table_info(users)').all().some((c) => c.name === 'code')) {
  db.exec('ALTER TABLE users ADD COLUMN code TEXT');
}
if (!db.prepare('PRAGMA table_info(entries)').all().some((c) => c.name === 'code')) {
  db.exec('ALTER TABLE entries ADD COLUMN code TEXT; ALTER TABLE entries ADD COLUMN seq INTEGER;');
}
db.prepare('SELECT id, name FROM users WHERE code IS NULL ORDER BY id').all()
  .forEach((u) => db.prepare('UPDATE users SET code = ? WHERE id = ?').run(makeCode(u.name, u.id), u.id));
db.prepare('SELECT e.id, e.event_id, u.code FROM entries e JOIN users u ON u.id = e.karyakar_id WHERE e.code IS NULL ORDER BY e.receipt_no')
  .all().forEach((e) => {
    const seq = db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM entries WHERE event_id = ? AND code = ?').get(e.event_id, e.code).n;
    db.prepare('UPDATE entries SET code = ?, seq = ? WHERE id = ?').run(e.code, seq, e.id);
  });
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_code ON users(code);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_code_seq ON entries(event_id, code, seq);`);

// First run: create main admin, the seva list from the card, and this year's event
function seed() {
  const hasUsers = db.prepare('SELECT COUNT(*) AS c FROM users').get().c > 0;
  if (hasUsers) return;

  const adminMobile = process.env.ADMIN_MOBILE || '9999999999';
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  db.prepare('INSERT INTO users (name, mobile, password_hash, role, must_change, code) VALUES (?, ?, ?, ?, ?, ?)')
    .run('Main Admin', adminMobile, hashPassword(adminPassword), 'admin', adminPassword === DEFAULT_PASSWORD ? 1 : 0, 'MA');

  const sevas = [
    ['બેકરી થાળ', 201], ['ફરસાણ થાળ', 501], ['મિષ્ટાન થાળ', 1001],
    ['પૂર્ણ થાળ', 2501], ['અર્ધ અન્નકૂટની સેવા', 25001], ['પૂર્ણ અન્નકૂટની સેવા', 51001],
  ];
  const insSeva = db.prepare('INSERT INTO seva_types (name, amount, sort) VALUES (?, ?, ?)');
  sevas.forEach(([name, amount], i) => insSeva.run(name, amount, i + 1));

  db.prepare('INSERT INTO mandals (name) VALUES (?)').run('ખીજડી પ્લોટ');

  db.prepare('INSERT INTO events (name, event_date, place, time_text, is_active) VALUES (?, ?, ?, ?, 1)')
    .run(`અન્નકૂટોત્સવ ${new Date().getFullYear()}`, null,
      'બી.એ.પી.એસ. શ્રી સ્વામિનારાયણ મંદિર, ખીજડી પ્લોટ, પોરબંદર', 'બપોરે ૧૨.૦૦ થી સાંજે ૭.૦૦ સુધી');

  console.log(`\n  First run: admin created -> mobile ${adminMobile} / password ${adminPassword}`);
  console.log('  Please login and change this password immediately.\n');
}
seed();

// Safe copy of the whole database (works while the app is running)
function backupTo(file) {
  db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
}

// One backup file per day in data/backups, keeping the last 30 days
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const KEEP_BACKUPS = 30;
function dailyBackup() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const file = path.join(BACKUP_DIR, `annakut-${day}.db`);
    fs.rmSync(file, { force: true }); // VACUUM INTO needs a fresh file; refreshed through the day
    backupTo(file);
    fs.readdirSync(BACKUP_DIR).filter((f) => /^annakut-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort().reverse()
      .slice(KEEP_BACKUPS).forEach((f) => fs.rmSync(path.join(BACKUP_DIR, f), { force: true }));
    // Optional second copy off this disk, e.g. a Google Drive folder (set in settings.local.cmd)
    if (process.env.BACKUP_COPY_DIR) {
      fs.mkdirSync(process.env.BACKUP_COPY_DIR, { recursive: true });
      fs.copyFileSync(file, path.join(process.env.BACKUP_COPY_DIR, path.basename(file)));
    }
  } catch (e) {
    console.error('Backup failed:', e.message);
  }
}

module.exports = { db, hashPassword, verifyPassword, backupTo, dailyBackup, DATA_DIR, DEFAULT_PASSWORD, makeCode, codeTaken, CODE_RE };
