const express = require('express');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const { db, hashPassword, verifyPassword, backupTo, dailyBackup, DEFAULT_PASSWORD, makeCode, codeTaken, CODE_RE } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_DAYS = 90; // "remember me": stays logged in, renewed while the app is being used
const SHORT_SESSION_HOURS = 12; // not remembered: ends when the browser closes (or after 12h)

// Older databases: remember which sessions are "remember me" ones
if (!db.prepare('PRAGMA table_info(sessions)').all().some((c) => c.name === 'remember')) {
  db.exec('ALTER TABLE sessions ADD COLUMN remember INTEGER NOT NULL DEFAULT 1');
}

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  if (isHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
const cleanMobile = (v) => String(v || '').replace(/\D/g, '').slice(-10);
const str = (v) => (v == null ? null : String(v).trim() || null);
const toInt = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);

function getCookie(req, name) {
  const found = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function activeEvent() {
  return db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY id DESC LIMIT 1').get();
}

function transaction(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

// wraps route handlers so thrown errors become JSON responses
const h = (fn) => (req, res) => {
  try { fn(req, res); } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    if (String(e.message).includes('UNIQUE')) return res.status(400).json({ error: 'આ માહિતી પહેલેથી છે (duplicate)' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };

// ---------- auth ----------
// Behind Cloudflare Tunnel / a proxy the original scheme and visitor IP come in headers
function isHttps(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}
const clientIp = (req) => String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '');

function setSessionCookie(req, res, token, remember) {
  const age = remember ? `; Max-Age=${SESSION_DAYS * 86400}` : '';
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax${isHttps(req) ? '; Secure' : ''}${age}`);
}

// Slow down password guessing: too many wrong tries locks that mobile / that device for a while
const LOCK_MINUTES = 15;
const MAX_FAILS_PER_MOBILE = 5;
const MAX_FAILS_PER_IP = 20;
const failedLogins = new Map(); // key -> { count, first }
function failCount(key) {
  const f = failedLogins.get(key);
  if (f && Date.now() - f.first > LOCK_MINUTES * 60000) { failedLogins.delete(key); return 0; }
  return f ? f.count : 0;
}
function addFail(key) {
  const f = failedLogins.get(key);
  if (f && failCount(key)) f.count++; else failedLogins.set(key, { count: 1, first: Date.now() });
}

function auth(req, res, next) {
  const token = getCookie(req, 'sid');
  const user = token && db.prepare(`
    SELECT u.id, u.name, u.mobile, u.role, u.code, u.mandal_id, u.parent_id, u.must_change, s.expires_at, s.remember FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ? AND u.active = 1 AND u.approved = 1`).get(token, Date.now());
  if (!user) return res.status(401).json({ error: 'કૃપા કરી લૉગિન કરો' });
  // Keep remembered logins alive while the app is used (renewed at most once a day)
  if (user.remember && user.expires_at - Date.now() < (SESSION_DAYS - 1) * 86400000) {
    db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?').run(Date.now() + SESSION_DAYS * 86400000, token);
    setSessionCookie(req, res, token, true);
  }
  const { expires_at, remember, ...rest } = user;
  req.user = { ...rest, must_change: !!user.must_change };
  // Still on the default password: only allowed to change it
  if (req.user.must_change && !['/me', '/me/password', '/logout'].includes(req.path)) {
    return res.status(403).json({ error: 'પહેલા નવો પાસવર્ડ સેટ કરો', mustChange: true });
  }
  next();
}
const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'ફક્ત એડમિન માટે' }));
// Admin or karyakar (karyakars only ever see their own team)
const leadOnly = (req, res, next) => (['admin', 'karyakar'].includes(req.user.role) ? next() : res.status(403).json({ error: 'ફક્ત કાર્યકર / એડમિન માટે' }));

app.post('/api/login', h((req, res) => {
  const mobile = cleanMobile(req.body.mobile);
  const keys = [`m:${mobile}`, `ip:${clientIp(req)}`];
  if (failCount(keys[0]) >= MAX_FAILS_PER_MOBILE || failCount(keys[1]) >= MAX_FAILS_PER_IP) {
    fail(429, 'ઘણા ખોટા પ્રયત્નો થયા. 15 મિનિટ પછી ફરી પ્રયત્ન કરો.');
  }
  const user = db.prepare('SELECT * FROM users WHERE mobile = ? AND active = 1').get(mobile);
  if (!user || !verifyPassword(String(req.body.password || ''), user.password_hash)) {
    keys.forEach(addFail);
    fail(401, 'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે');
  }
  failedLogins.delete(keys[0]);
  if (!user.approved) fail(403, 'તમારી નોંધણી હજુ મંજૂર થઈ નથી. તમારા કાર્યકરને જણાવો.');
  const remember = req.body.remember !== false;
  const token = crypto.randomBytes(32).toString('hex');
  const life = remember ? SESSION_DAYS * 86400000 : SHORT_SESSION_HOURS * 3600000;
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, remember) VALUES (?, ?, ?, ?)')
    .run(token, user.id, Date.now() + life, remember ? 1 : 0);
  setSessionCookie(req, res, token, remember);
  res.json({ role: user.role, name: user.name, mustChange: !!user.must_change });
}));

// For uptime monitors / the host: is the app and database alive?
app.get('/healthz', (req, res) => {
  db.prepare('SELECT 1').get();
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const token = getCookie(req, 'sid');
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

// ---------- annakut sevak self sign-up (needs approval by their karyakar or admin) ----------
app.get('/api/signup-options', (req, res) => {
  res.json({
    mandals: db.prepare('SELECT id, name FROM mandals WHERE active = 1 ORDER BY name').all(),
    karyakars: db.prepare(`SELECT id, name, mandal_id FROM users
      WHERE role = 'karyakar' AND active = 1 AND approved = 1 ORDER BY name`).all(),
  });
});

const SIGNUPS_PER_HOUR = 5;
const signups = new Map(); // ip -> [timestamps]
app.post('/api/signup', h((req, res) => {
  const ip = clientIp(req);
  const recent = (signups.get(ip) || []).filter((ts) => Date.now() - ts < 3600000);
  if (recent.length >= SIGNUPS_PER_HOUR) fail(429, 'ઘણી નોંધણી થઈ. થોડી વાર પછી પ્રયત્ન કરો.');
  const name = str(req.body.name);
  const mobile = cleanMobile(req.body.mobile);
  const password = String(req.body.password || '');
  if (!name) fail(400, 'નામ લખો');
  if (mobile.length !== 10) fail(400, 'સાચો 10 આંકડાનો મોબાઇલ નંબર લખો');
  if (password.length < 6) fail(400, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  const lead = db.prepare("SELECT id, mandal_id FROM users WHERE id = ? AND role = 'karyakar' AND active = 1 AND approved = 1")
    .get(toInt(req.body.parent_id));
  if (!lead) fail(400, 'તમારા કાર્યકર પસંદ કરો');
  if (db.prepare('SELECT 1 FROM users WHERE mobile = ?').get(mobile)) fail(400, 'આ મોબાઇલ નંબરથી પહેલેથી નોંધણી થયેલી છે');
  db.prepare(`INSERT INTO users (name, mobile, password_hash, role, mandal_id, parent_id, approved, code)
    VALUES (?, ?, ?, 'sevak', ?, ?, 0, ?)`).run(name, mobile, hashPassword(password), lead.mandal_id, lead.id, makeCode(name));
  signups.set(ip, [...recent, Date.now()]);
  res.json({ ok: true });
}));

app.use('/api', auth);

app.get('/api/me', (req, res) => res.json(req.user));

app.post('/api/me/password', h((req, res) => {
  const { current, next } = req.body;
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(String(current || ''), row.password_hash)) fail(400, 'જૂનો પાસવર્ડ ખોટો છે');
  if (!next || String(next).length < 6) fail(400, 'નવો પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  if (String(next) === DEFAULT_PASSWORD || String(next) === String(current)) fail(400, 'બીજો નવો પાસવર્ડ રાખો');
  db.prepare('UPDATE users SET password_hash = ?, must_change = 0 WHERE id = ?').run(hashPassword(String(next)), req.user.id);
  // Log out every other device that was using the old password
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(req.user.id, getCookie(req, 'sid'));
  res.json({ ok: true });
}));

// Everything the entry form needs in one call
app.get('/api/meta', (req, res) => {
  res.json({
    event: activeEvent() || null,
    mandals: db.prepare('SELECT * FROM mandals WHERE active = 1 ORDER BY name').all(),
    sevaTypes: db.prepare('SELECT * FROM seva_types WHERE active = 1 ORDER BY sort, id').all(),
  });
});

// ---------- entries ----------
function loadEntry(id) {
  const e = db.prepare(`
    SELECT e.*, m.name AS mandal_name, u.name AS karyakar_name, u.mobile AS karyakar_mobile, u.parent_id AS entered_by_parent, e.code || '-' || e.seq AS receipt,
      ev.name AS event_name, ev.event_date, ev.place AS event_place, ev.time_text AS event_time
    FROM entries e JOIN mandals m ON m.id = e.mandal_id JOIN users u ON u.id = e.karyakar_id
    JOIN events ev ON ev.id = e.event_id WHERE e.id = ?`).get(id);
  if (e) e.sevas = db.prepare(`SELECT es.seva_type_id, es.amount, st.name FROM entry_sevas es
    JOIN seva_types st ON st.id = es.seva_type_id WHERE es.entry_id = ? ORDER BY st.sort`).all(id);
  return e;
}

// entries.karyakar_id = whoever entered it (karyakar, sevak or admin).
// Admin: everything. Karyakar: own + their sevaks' entries. Sevak: only own.
function canAccess(user, entry) {
  return user.role === 'admin' || entry.karyakar_id === user.id
    || (user.role === 'karyakar' && entry.entered_by_parent === user.id);
}

// SQL condition limiting entries (alias e) to what this user may see
function scopeSql(user) {
  if (user.role === 'admin') return { sql: '1 = 1', params: [] };
  if (user.role === 'karyakar') {
    return { sql: '(e.karyakar_id = ? OR e.karyakar_id IN (SELECT id FROM users WHERE parent_id = ?))', params: [user.id, user.id] };
  }
  return { sql: 'e.karyakar_id = ?', params: [user.id] };
}

function validateEntry(body) {
  const data = {
    mandal_id: toInt(body.mandal_id),
    devotee_name: str(body.devotee_name),
    address: str(body.address),
    mobile: cleanMobile(body.mobile),
    whatsapp: body.whatsapp_same ? cleanMobile(body.mobile) : (cleanMobile(body.whatsapp) || null),
    amount: toInt(body.amount),
    payment_mode: ['cash', 'upi', 'cheque', 'pending'].includes(body.payment_mode) ? body.payment_mode : 'cash',
    payment_ref: str(body.payment_ref),
    notes: str(body.notes),
    seva_ids: Array.isArray(body.seva_ids) ? body.seva_ids.map(toInt).filter(Number.isFinite) : [],
  };
  if (!data.devotee_name) fail(400, 'નામ લખો');
  if (data.mobile.length !== 10) fail(400, 'સાચો 10 આંકડાનો મોબાઇલ નંબર લખો');
  if (data.whatsapp && data.whatsapp.length !== 10) fail(400, 'સાચો WhatsApp નંબર લખો');
  if (!db.prepare('SELECT 1 FROM mandals WHERE id = ?').get(data.mandal_id)) fail(400, 'મંડળ પસંદ કરો');
  if (!(data.amount > 0)) fail(400, 'સેવાની રકમ લખો');
  data.paid = data.payment_mode === 'pending' ? 0 : 1;
  return data;
}

function saveSevas(entryId, sevaIds) {
  db.prepare('DELETE FROM entry_sevas WHERE entry_id = ?').run(entryId);
  const ins = db.prepare('INSERT INTO entry_sevas (entry_id, seva_type_id, amount) SELECT ?, id, amount FROM seva_types WHERE id = ?');
  [...new Set(sevaIds)].forEach((sid) => ins.run(entryId, sid));
}

// Build a WHERE clause from list filters, always limited to what this user may see
function entryFilters(req) {
  const scope = scopeSql(req.user);
  const where = ['e.event_id = ?', scope.sql];
  const params = [toInt(req.query.event_id) || activeEvent()?.id || 0, ...scope.params];
  if (req.query.karyakar_id) { where.push('e.karyakar_id = ?'); params.push(toInt(req.query.karyakar_id)); }
  if (req.query.team_id) { // a karyakar together with all their sevaks
    where.push('(e.karyakar_id = ? OR e.karyakar_id IN (SELECT id FROM users WHERE parent_id = ?))');
    params.push(toInt(req.query.team_id), toInt(req.query.team_id));
  }
  if (req.query.mandal_id) { where.push('e.mandal_id = ?'); params.push(toInt(req.query.mandal_id)); }
  if (req.query.seva_type_id) { where.push('EXISTS (SELECT 1 FROM entry_sevas x WHERE x.entry_id = e.id AND x.seva_type_id = ?)'); params.push(toInt(req.query.seva_type_id)); }
  if (req.query.payment_mode) { where.push('e.payment_mode = ?'); params.push(String(req.query.payment_mode)); }
  if (req.query.q) {
    const q = `%${String(req.query.q).trim()}%`;
    // receipt search works with or without the dash: "TG-12" or "tg12"
    const r = String(req.query.q).trim().toUpperCase();
    where.push("(e.devotee_name LIKE ? OR e.mobile LIKE ? OR e.whatsapp LIKE ? OR e.code || '-' || e.seq = ? OR e.code || e.seq = ?)");
    params.push(q, q, q, r, r);
  }
  return { sql: where.join(' AND '), params };
}

const LIST_SQL = `
  SELECT e.*, m.name AS mandal_name, u.name AS karyakar_name, u.mobile AS karyakar_mobile, COALESCE(p.name, u.name) AS team_name, e.code || '-' || e.seq AS receipt,
    (SELECT group_concat(st.name, ', ') FROM entry_sevas es JOIN seva_types st ON st.id = es.seva_type_id WHERE es.entry_id = e.id) AS seva_names
  FROM entries e JOIN mandals m ON m.id = e.mandal_id JOIN users u ON u.id = e.karyakar_id LEFT JOIN users p ON p.id = u.parent_id`;

app.get('/api/entries', h((req, res) => {
  const f = entryFilters(req);
  const rows = db.prepare(`${LIST_SQL} WHERE ${f.sql} ORDER BY e.id DESC`).all(...f.params);
  res.json({ rows, total: rows.reduce((s, r) => s + r.amount, 0) });
}));

// Warn karyakar if this devotee was already entered this year (by anyone)
app.get('/api/entries/check-mobile', h((req, res) => {
  const ev = activeEvent();
  const mobile = cleanMobile(req.query.mobile);
  const rows = ev && mobile.length === 10 ? db.prepare(`SELECT e.id, e.code || '-' || e.seq AS receipt, e.devotee_name, e.amount, u.name AS karyakar_name
    FROM entries e JOIN users u ON u.id = e.karyakar_id WHERE e.event_id = ? AND e.mobile = ? AND e.id != ?`)
    .all(ev.id, mobile, toInt(req.query.exclude) || 0) : [];
  // Also return last year's details so the karyakar can auto-fill a returning devotee
  const previous = mobile.length === 10 ? db.prepare(`SELECT devotee_name, address, whatsapp, mandal_id FROM entries
    WHERE mobile = ? ORDER BY id DESC LIMIT 1`).get(mobile) : null;
  res.json({ existing: rows, previous: previous || null });
}));

app.get('/api/entries/:id', h((req, res) => {
  const e = loadEntry(toInt(req.params.id));
  if (!e || !canAccess(req.user, e)) fail(404, 'એન્ટ્રી મળી નથી');
  res.json(e);
}));

app.post('/api/entries', h((req, res) => {
  const ev = activeEvent();
  if (!ev) fail(400, 'કોઈ ચાલુ ઉત્સવ નથી. એડમિન ને જણાવો.');
  const d = validateEntry(req.body);
  const id = transaction(() => {
    // receipt_no: overall running number (internal); code + seq: the person's own number shown as TG-12
    const next = db.prepare('SELECT COALESCE(MAX(receipt_no), 0) + 1 AS n FROM entries WHERE event_id = ?').get(ev.id).n;
    const seq = db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM entries WHERE event_id = ? AND code = ?').get(ev.id, req.user.code).n;
    const r = db.prepare(`INSERT INTO entries (event_id, receipt_no, code, seq, mandal_id, devotee_name, address, mobile, whatsapp,
      amount, payment_mode, payment_ref, paid, notes, karyakar_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(ev.id, next, req.user.code, seq, d.mandal_id, d.devotee_name, d.address, d.mobile, d.whatsapp,
        d.amount, d.payment_mode, d.payment_ref, d.paid, d.notes, req.user.id);
    saveSevas(r.lastInsertRowid, d.seva_ids);
    return Number(r.lastInsertRowid);
  });
  res.json(loadEntry(id));
}));

app.put('/api/entries/:id', h((req, res) => {
  const id = toInt(req.params.id);
  const e = loadEntry(id);
  if (!e || !canAccess(req.user, e)) fail(404, 'એન્ટ્રી મળી નથી');
  const d = validateEntry(req.body);
  transaction(() => {
    db.prepare(`UPDATE entries SET mandal_id=?, devotee_name=?, address=?, mobile=?, whatsapp=?, amount=?, payment_mode=?,
      payment_ref=?, paid=?, notes=?, updated_at=datetime('now','localtime') WHERE id=?`)
      .run(d.mandal_id, d.devotee_name, d.address, d.mobile, d.whatsapp, d.amount, d.payment_mode,
        d.payment_ref, d.paid, d.notes, id);
    saveSevas(id, d.seva_ids);
  });
  res.json(loadEntry(id));
}));

app.delete('/api/entries/:id', adminOnly, h((req, res) => {
  db.prepare('DELETE FROM entries WHERE id = ?').run(toInt(req.params.id));
  res.json({ ok: true });
}));

// ---------- admin: reports ----------
app.get('/api/stats', adminOnly, h((req, res) => {
  const evId = toInt(req.query.event_id) || activeEvent()?.id || 0;
  const one = (sql) => db.prepare(sql).get(evId);
  const all = (sql) => db.prepare(sql).all(evId);
  res.json({
    summary: one(`SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total,
      COALESCE(SUM(CASE WHEN paid=0 THEN amount END),0) AS pending FROM entries WHERE event_id = ?`),
    byMandal: all(`SELECT m.name, COUNT(e.id) AS count, COALESCE(SUM(e.amount),0) AS total FROM mandals m
      LEFT JOIN entries e ON e.mandal_id = m.id AND e.event_id = ? GROUP BY m.id ORDER BY total DESC`),
    bySeva: all(`SELECT st.name, st.amount, (SELECT COUNT(*) FROM entry_sevas es JOIN entries e ON e.id = es.entry_id
      WHERE es.seva_type_id = st.id AND e.event_id = ?) AS count FROM seva_types st ORDER BY st.sort`),
    // Each karyakar's whole team: their own entries + their annakut sevaks' entries
    byKaryakar: all(`SELECT t.name, t.mobile, COUNT(e.id) AS count, COALESCE(SUM(e.amount),0) AS total FROM users t
      JOIN users u ON u.id = t.id OR u.parent_id = t.id
      LEFT JOIN entries e ON e.karyakar_id = u.id AND e.event_id = ?
      WHERE t.role IN ('admin', 'karyakar') GROUP BY t.id HAVING count > 0 OR t.role = 'karyakar' ORDER BY total DESC`),
    byPayment: all(`SELECT payment_mode, COUNT(*) AS count, SUM(amount) AS total FROM entries WHERE event_id = ? GROUP BY payment_mode`),
  });
}));

// Team summary: one row per karyakar / annakut sevak with entry count, amount and count per seva type,
// plus a total row for each karyakar's team. Filters: event_id, seva_type_id, mandal_id, payment_mode.
function buildSummary(req) {
  const user = req.user;
  const sevaTypes = db.prepare('SELECT id, name, amount FROM seva_types ORDER BY sort, id').all();
  const people = db.prepare(`SELECT u.id, u.name, u.code, u.mobile, u.role, u.parent_id, m.name AS mandal_name,
      COALESCE(p.name, u.name) AS team_name, COALESCE(u.parent_id, u.id) AS team_id
    FROM users u LEFT JOIN mandals m ON m.id = u.mandal_id LEFT JOIN users p ON p.id = u.parent_id
    WHERE u.approved = 1 AND ${user.role === 'admin' ? '1 = 1' : '(u.id = ? OR u.parent_id = ?)'}
    ORDER BY team_name, team_id, CASE u.role WHEN 'sevak' THEN 1 ELSE 0 END, u.name`)
    .all(...(user.role === 'admin' ? [] : [user.id, user.id]));
  const f = entryFilters(req);
  const totals = new Map(db.prepare(`SELECT e.karyakar_id AS uid, COUNT(*) AS count, SUM(e.amount) AS total,
      SUM(CASE WHEN e.paid = 0 THEN e.amount ELSE 0 END) AS pending FROM entries e WHERE ${f.sql} GROUP BY e.karyakar_id`)
    .all(...f.params).map((r) => [r.uid, r]));
  const perSeva = db.prepare(`SELECT e.karyakar_id AS uid, es.seva_type_id AS sid, COUNT(*) AS c
      FROM entries e JOIN entry_sevas es ON es.entry_id = e.id WHERE ${f.sql} GROUP BY 1, 2`).all(...f.params);

  const blank = () => ({ count: 0, total: 0, pending: 0, sevas: Object.fromEntries(sevaTypes.map((s) => [s.id, 0])) });
  const rows = [];
  let team = null;
  for (const p of people) {
    const r = { type: 'person', ...p, ...blank(), ...(totals.get(p.id) || {}) };
    r.sevas = blank().sevas;
    perSeva.filter((x) => x.uid === p.id).forEach((x) => { r.sevas[x.sid] = x.c; });
    // Admins only show up when they entered something themselves
    if (p.role === 'admin' && !r.count) continue;
    if (!team || team.team_id !== p.team_id) {
      team = { type: 'team', team_id: p.team_id, team_name: p.team_name, name: p.team_name, members: 0, ...blank() };
      rows.push(team);
    }
    rows.splice(rows.indexOf(team), 0, r); // people first, team total after them
    team.members++;
    team.count += r.count; team.total += r.total; team.pending += r.pending;
    sevaTypes.forEach((s) => { team.sevas[s.id] += r.sevas[s.id]; });
  }
  return { sevaTypes, rows };
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const toCsv = (header, lines) => [header, ...lines].map((l) => l.map(csvCell).join(',')).join('\r\n');
const ROLE_NAME = { admin: 'એડમિન', karyakar: 'કાર્યકર', sevak: 'અન્નકૂટ સેવક' };

function summaryCsv(req) {
  const { sevaTypes, rows } = buildSummary(req);
  return toCsv(
    ['કાર્યકર (ટીમ)', 'નામ', 'કોડ', 'ભૂમિકા', 'મોબાઇલ', 'મંડળ', 'એન્ટ્રી', 'કુલ રકમ', 'બાકી રકમ', ...sevaTypes.map((s) => s.name)],
    rows.map((r) => r.type === 'team'
      ? [r.team_name, `કુલ - ${r.team_name} ટીમ`, '', '', '', '', r.count, r.total, r.pending, ...sevaTypes.map((s) => r.sevas[s.id])]
      : [r.team_name, r.name, r.code, ROLE_NAME[r.role], r.mobile, r.mandal_name || '', r.count, r.total, r.pending, ...sevaTypes.map((s) => r.sevas[s.id])]));
}

function entriesCsv(req) {
  const f = entryFilters(req);
  const rows = db.prepare(`${LIST_SQL} WHERE ${f.sql} ORDER BY e.receipt_no`).all(...f.params);
  const cols = [['receipt', 'રસીદ નં'], ['created_at', 'તારીખ'], ['mandal_name', 'મંડળ'], ['devotee_name', 'નામ'],
    ['address', 'સરનામું'], ['mobile', 'મોબાઇલ'], ['whatsapp', 'WhatsApp'], ['seva_names', 'સેવા'], ['amount', 'રકમ'],
    ['payment_mode', 'ચુકવણી'], ['payment_ref', 'Ref'], ['karyakar_name', 'અન્નકૂટ સેવક'], ['team_name', 'કાર્યકર (ટીમ)'], ['notes', 'નોંધ']];
  return toCsv(cols.map((c) => c[1]), rows.map((r) => cols.map((c) => r[c[0]])));
}

function sendCsv(res, csv, filename) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  if (filename) res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(filename ? '﻿' + csv : csv); // BOM for downloaded files so Gujarati always opens correctly
}

app.get('/api/summary', leadOnly, h((req, res) => res.json(buildSummary(req))));
app.get('/api/summary.csv', leadOnly, h((req, res) => sendCsv(res, summaryCsv(req), 'annakut-summary.csv')));
app.get('/api/export.csv', leadOnly, h((req, res) => sendCsv(res, entriesCsv(req), 'annakut-entries.csv')));

// ---------- live Google Sheets links ----------
// A secret link per admin/karyakar. In Google Sheets: =IMPORTDATA("https://<site>/sheets/<token>/summary.csv")
// Google refreshes it automatically (about every hour). Only works once the app is online.
app.get('/api/me/sheet-link', leadOnly, (req, res) => {
  res.json({ token: db.prepare('SELECT sheet_token FROM users WHERE id = ?').get(req.user.id).sheet_token });
});
app.post('/api/me/sheet-link', leadOnly, (req, res) => {
  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('UPDATE users SET sheet_token = ? WHERE id = ?').run(token, req.user.id);
  res.json({ token });
});

function sheetUser(req, res, next) {
  const user = /^[0-9a-f]{48}$/.test(req.params.token) && db.prepare(`SELECT id, name, role, mandal_id, parent_id FROM users
    WHERE sheet_token = ? AND active = 1 AND approved = 1 AND role IN ('admin', 'karyakar')`).get(req.params.token);
  if (!user) return res.status(404).send('Link not valid');
  req.user = user;
  next();
}
app.get('/sheets/:token/summary.csv', sheetUser, h((req, res) => sendCsv(res, summaryCsv(req))));
app.get('/sheets/:token/entries.csv', sheetUser, h((req, res) => sendCsv(res, entriesCsv(req))));

// ---------- users: admin manages everyone, a karyakar manages their own annakut sevaks ----------
app.get('/api/users', leadOnly, (req, res) => {
  const mine = req.user.role === 'karyakar';
  res.json(db.prepare(`SELECT u.id, u.name, u.code, u.mobile, u.role, u.mandal_id, u.parent_id, u.active, u.approved,
    m.name AS mandal_name, p.name AS parent_name, u.created_at,
    (SELECT COUNT(*) FROM entries e WHERE e.karyakar_id = u.id) AS entry_count,
    (SELECT COALESCE(SUM(amount), 0) FROM entries e WHERE e.karyakar_id = u.id AND e.event_id = ?) AS event_total,
    (SELECT COUNT(*) FROM entries e WHERE e.karyakar_id = u.id AND e.event_id = ?) AS event_count
    FROM users u LEFT JOIN mandals m ON m.id = u.mandal_id LEFT JOIN users p ON p.id = u.parent_id
    ${mine ? 'WHERE u.parent_id = ?' : ''}
    ORDER BY u.approved, CASE u.role WHEN 'admin' THEN 0 WHEN 'karyakar' THEN 1 ELSE 2 END, u.name`)
    .all(...[activeEvent()?.id || 0, activeEvent()?.id || 0], ...(mine ? [req.user.id] : [])));
});

// Clean up a user form. Karyakars can only ever create/edit annakut sevaks under themselves.
function userData(body, actor, id) {
  const d = {
    name: str(body.name), mobile: cleanMobile(body.mobile),
    role: actor.role === 'admin' && ['admin', 'karyakar', 'sevak'].includes(body.role) ? body.role : (actor.role === 'admin' ? 'karyakar' : 'sevak'),
    mandal_id: toInt(body.mandal_id) || null, parent_id: null,
    active: body.active === false || body.active === 0 ? 0 : 1,
    approved: body.approved === false || body.approved === 0 ? 0 : 1,
  };
  if (!d.name) fail(400, 'નામ લખો');
  if (d.mobile.length !== 10) fail(400, 'સાચો 10 આંકડાનો મોબાઇલ નંબર લખો');
  if (d.role === 'sevak') {
    const lead = db.prepare("SELECT id, mandal_id FROM users WHERE id = ? AND role = 'karyakar'")
      .get(actor.role === 'admin' ? toInt(body.parent_id) : actor.id);
    if (!lead) fail(400, 'તમારા કાર્યકર પસંદ કરો');
    d.parent_id = lead.id;
    d.mandal_id = lead.mandal_id; // a sevak works in their karyakar's area
  }
  if (body.password && String(body.password).length < 6) fail(400, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  // Code: typed one (2-4 English letters, unique) or made from the name; an existing code stays unless changed
  d.code = String(body.code || '').trim().toUpperCase();
  if (d.code) {
    if (!CODE_RE.test(d.code)) fail(400, 'કોડ 2 થી 4 અંગ્રેજી અક્ષરનો રાખો (દા.ત. TG)');
    if (codeTaken(d.code, id)) fail(400, 'આ કોડ બીજા કોઈનો છે');
  } else {
    d.code = (id && db.prepare('SELECT code FROM users WHERE id = ?').get(id)?.code) || makeCode(d.name, id);
  }
  return d;
}

// Karyakars may only touch their own annakut sevaks
function editableUser(req) {
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(toInt(req.params.id));
  if (!target || (req.user.role !== 'admin' && target.parent_id !== req.user.id)) fail(404, 'મળ્યું નથી');
  return target;
}

app.post('/api/users', leadOnly, h((req, res) => {
  const d = userData(req.body, req.user);
  if (!req.body.password) fail(400, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  db.prepare('INSERT INTO users (name, mobile, password_hash, role, mandal_id, parent_id, active, approved, code) VALUES (?,?,?,?,?,?,?,1,?)')
    .run(d.name, d.mobile, hashPassword(String(req.body.password)), d.role, d.mandal_id, d.parent_id, d.active, d.code);
  res.json({ ok: true });
}));

app.put('/api/users/:id', leadOnly, h((req, res) => {
  const target = editableUser(req);
  const id = target.id;
  const d = userData(req.body, req.user, id);
  if (id === req.user.id && (d.role !== 'admin' || !d.active)) fail(400, 'તમે પોતાને એડમિન માંથી દૂર ન કરી શકો');
  if (d.role !== 'karyakar' && db.prepare('SELECT 1 FROM users WHERE parent_id = ?').get(id)) {
    fail(400, 'આ કાર્યકર નીચે અન્નકૂટ સેવક છે. પહેલા તેમને બીજા કાર્યકર નીચે મૂકો.');
  }
  transaction(() => {
    db.prepare('UPDATE users SET name=?, mobile=?, role=?, mandal_id=?, parent_id=?, active=?, approved=?, code=? WHERE id=?')
      .run(d.name, d.mobile, d.role, d.mandal_id, d.parent_id, d.active, d.approved, d.code, id);
    // Moving a karyakar to a new area moves their sevaks too
    if (d.role === 'karyakar') db.prepare('UPDATE users SET mandal_id = ? WHERE parent_id = ?').run(d.mandal_id, id);
    if (req.body.password) db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hashPassword(String(req.body.password)), id);
  });
  if (!d.active || !d.approved || (req.body.password && id !== req.user.id)) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  res.json({ ok: true });
}));

// Approve a self-registered annakut sevak (or remove the request)
app.post('/api/users/:id/approve', leadOnly, h((req, res) => {
  const target = editableUser(req);
  db.prepare('UPDATE users SET approved = 1, active = 1 WHERE id = ?').run(target.id);
  res.json({ ok: true });
}));
app.delete('/api/users/:id', leadOnly, h((req, res) => {
  const target = editableUser(req);
  if (target.approved) fail(400, 'ફક્ત બાકી નોંધણી જ કાઢી શકાય. બીજાને "બંધ" કરો.');
  db.prepare('DELETE FROM users WHERE id = ?').run(target.id);
  res.json({ ok: true });
}));

// ---------- admin: mandals, seva types, events ----------
app.get('/api/mandals', adminOnly, (req, res) => res.json(db.prepare('SELECT * FROM mandals ORDER BY name').all()));
app.post('/api/mandals', adminOnly, h((req, res) => {
  const name = str(req.body.name); if (!name) fail(400, 'મંડળનું નામ લખો');
  db.prepare('INSERT INTO mandals (name) VALUES (?)').run(name); res.json({ ok: true });
}));
app.put('/api/mandals/:id', adminOnly, h((req, res) => {
  const name = str(req.body.name); if (!name) fail(400, 'મંડળનું નામ લખો');
  db.prepare('UPDATE mandals SET name=?, active=? WHERE id=?').run(name, req.body.active ? 1 : 0, toInt(req.params.id));
  res.json({ ok: true });
}));

app.get('/api/seva-types', adminOnly, (req, res) => res.json(db.prepare('SELECT * FROM seva_types ORDER BY sort, id').all()));
function sevaData(b) {
  const d = { name: str(b.name), amount: toInt(b.amount), sort: toInt(b.sort) || 0, active: b.active === false ? 0 : 1 };
  if (!d.name || !(d.amount > 0)) fail(400, 'સેવાનું નામ અને રકમ લખો');
  return d;
}
app.post('/api/seva-types', adminOnly, h((req, res) => {
  const d = sevaData(req.body);
  db.prepare('INSERT INTO seva_types (name, amount, sort, active) VALUES (?,?,?,?)').run(d.name, d.amount, d.sort, d.active);
  res.json({ ok: true });
}));
app.put('/api/seva-types/:id', adminOnly, h((req, res) => {
  const d = sevaData(req.body);
  db.prepare('UPDATE seva_types SET name=?, amount=?, sort=?, active=? WHERE id=?').run(d.name, d.amount, d.sort, d.active, toInt(req.params.id));
  res.json({ ok: true });
}));

app.get('/api/events', adminOnly, (req, res) => res.json(db.prepare(`SELECT ev.*, (SELECT COUNT(*) FROM entries e WHERE e.event_id = ev.id) AS entry_count,
  (SELECT COALESCE(SUM(amount),0) FROM entries e WHERE e.event_id = ev.id) AS total FROM events ev ORDER BY ev.id DESC`).all()));
function eventData(b) {
  const d = { name: str(b.name), event_date: str(b.event_date), place: str(b.place), time_text: str(b.time_text) };
  if (!d.name) fail(400, 'ઉત્સવનું નામ લખો');
  return d;
}
app.post('/api/events', adminOnly, h((req, res) => {
  const d = eventData(req.body);
  transaction(() => {
    if (req.body.is_active) db.exec('UPDATE events SET is_active = 0');
    db.prepare('INSERT INTO events (name, event_date, place, time_text, is_active) VALUES (?,?,?,?,?)')
      .run(d.name, d.event_date, d.place, d.time_text, req.body.is_active ? 1 : 0);
  });
  res.json({ ok: true });
}));
app.put('/api/events/:id', adminOnly, h((req, res) => {
  const d = eventData(req.body);
  const id = toInt(req.params.id);
  transaction(() => {
    if (req.body.is_active) db.exec('UPDATE events SET is_active = 0');
    db.prepare('UPDATE events SET name=?, event_date=?, place=?, time_text=?, is_active=? WHERE id=?')
      .run(d.name, d.event_date, d.place, d.time_text, req.body.is_active ? 1 : 0, id);
  });
  res.json({ ok: true });
}));

// ---------- admin: backup download (keep a copy off this computer) ----------
app.get('/api/backup.db', adminOnly, h((req, res) => {
  const file = path.join(os.tmpdir(), `annakut-backup-${crypto.randomBytes(6).toString('hex')}.db`);
  backupTo(file);
  const day = new Date().toISOString().slice(0, 10);
  res.download(file, `annakut-backup-${day}.db`, () => fs.rmSync(file, { force: true }));
}));

app.get('/', (req, res) => res.redirect('/login.html'));

// Bad requests (e.g. broken JSON) get a short message, never internal details
app.use((err, req, res, next) => {
  if (err.status && err.status < 500) return res.status(err.status).json({ error: 'Bad request' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Backup on start and every 6 hours; also forget old failed-login records
dailyBackup();
const timer = setInterval(() => {
  dailyBackup();
  for (const key of failedLogins.keys()) failCount(key);
}, 6 * 3600000);

const server = app.listen(PORT, () => console.log(`Annakut Seva app running -> http://localhost:${PORT}`));

// Close the database cleanly when stopped (Ctrl+C, service stop, host restart)
function shutdown() {
  clearInterval(timer);
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
