const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { db, hashPassword, verifyPassword } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_DAYS = 30;

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
function auth(req, res, next) {
  const token = getCookie(req, 'sid');
  const user = token && db.prepare(`
    SELECT u.id, u.name, u.mobile, u.role, u.mandal_id FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ? AND u.active = 1`).get(token, Date.now());
  if (!user) return res.status(401).json({ error: 'કૃપા કરી લૉગિન કરો' });
  req.user = user;
  next();
}
const adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'ફક્ત એડમિન માટે' }));

app.post('/api/login', h((req, res) => {
  const mobile = cleanMobile(req.body.mobile);
  const user = db.prepare('SELECT * FROM users WHERE mobile = ? AND active = 1').get(mobile);
  if (!user || !verifyPassword(String(req.body.password || ''), user.password_hash)) fail(401, 'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે');
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, user.id, Date.now() + SESSION_DAYS * 86400000);
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);
  res.json({ role: user.role, name: user.name });
}));

app.post('/api/logout', (req, res) => {
  const token = getCookie(req, 'sid');
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.use('/api', auth);

app.get('/api/me', (req, res) => res.json(req.user));

app.post('/api/me/password', h((req, res) => {
  const { current, next } = req.body;
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(String(current || ''), row.password_hash)) fail(400, 'જૂનો પાસવર્ડ ખોટો છે');
  if (!next || String(next).length < 6) fail(400, 'નવો પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(next)), req.user.id);
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
    SELECT e.*, m.name AS mandal_name, u.name AS karyakar_name, u.mobile AS karyakar_mobile,
      ev.name AS event_name, ev.event_date, ev.place AS event_place, ev.time_text AS event_time
    FROM entries e JOIN mandals m ON m.id = e.mandal_id JOIN users u ON u.id = e.karyakar_id
    JOIN events ev ON ev.id = e.event_id WHERE e.id = ?`).get(id);
  if (e) e.sevas = db.prepare(`SELECT es.seva_type_id, es.amount, st.name FROM entry_sevas es
    JOIN seva_types st ON st.id = es.seva_type_id WHERE es.entry_id = ? ORDER BY st.sort`).all(id);
  return e;
}

function canAccess(user, entry) {
  return user.role === 'admin' || entry.karyakar_id === user.id;
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

// Build a WHERE clause from list filters; karyakars always only see their own entries
function entryFilters(req) {
  const where = ['e.event_id = ?'];
  const params = [toInt(req.query.event_id) || activeEvent()?.id || 0];
  if (req.user.role !== 'admin') { where.push('e.karyakar_id = ?'); params.push(req.user.id); }
  else if (req.query.karyakar_id) { where.push('e.karyakar_id = ?'); params.push(toInt(req.query.karyakar_id)); }
  if (req.query.mandal_id) { where.push('e.mandal_id = ?'); params.push(toInt(req.query.mandal_id)); }
  if (req.query.seva_type_id) { where.push('EXISTS (SELECT 1 FROM entry_sevas x WHERE x.entry_id = e.id AND x.seva_type_id = ?)'); params.push(toInt(req.query.seva_type_id)); }
  if (req.query.payment_mode) { where.push('e.payment_mode = ?'); params.push(String(req.query.payment_mode)); }
  if (req.query.q) {
    const q = `%${String(req.query.q).trim()}%`;
    where.push('(e.devotee_name LIKE ? OR e.mobile LIKE ? OR e.whatsapp LIKE ? OR CAST(e.receipt_no AS TEXT) = ?)');
    params.push(q, q, q, String(req.query.q).trim());
  }
  return { sql: where.join(' AND '), params };
}

const LIST_SQL = `
  SELECT e.*, m.name AS mandal_name, u.name AS karyakar_name,
    (SELECT group_concat(st.name, ', ') FROM entry_sevas es JOIN seva_types st ON st.id = es.seva_type_id WHERE es.entry_id = e.id) AS seva_names
  FROM entries e JOIN mandals m ON m.id = e.mandal_id JOIN users u ON u.id = e.karyakar_id`;

app.get('/api/entries', h((req, res) => {
  const f = entryFilters(req);
  const rows = db.prepare(`${LIST_SQL} WHERE ${f.sql} ORDER BY e.id DESC`).all(...f.params);
  res.json({ rows, total: rows.reduce((s, r) => s + r.amount, 0) });
}));

// Warn karyakar if this devotee was already entered this year (by anyone)
app.get('/api/entries/check-mobile', h((req, res) => {
  const ev = activeEvent();
  const mobile = cleanMobile(req.query.mobile);
  const rows = ev && mobile.length === 10 ? db.prepare(`SELECT e.id, e.receipt_no, e.devotee_name, e.amount, u.name AS karyakar_name
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
    const next = db.prepare('SELECT COALESCE(MAX(receipt_no), 0) + 1 AS n FROM entries WHERE event_id = ?').get(ev.id).n;
    const r = db.prepare(`INSERT INTO entries (event_id, receipt_no, mandal_id, devotee_name, address, mobile, whatsapp,
      amount, payment_mode, payment_ref, paid, notes, karyakar_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(ev.id, next, d.mandal_id, d.devotee_name, d.address, d.mobile, d.whatsapp,
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
    byKaryakar: all(`SELECT u.name, u.mobile, COUNT(e.id) AS count, COALESCE(SUM(e.amount),0) AS total FROM users u
      LEFT JOIN entries e ON e.karyakar_id = u.id AND e.event_id = ? GROUP BY u.id HAVING count > 0 OR u.role = 'karyakar'
      ORDER BY total DESC`),
    byPayment: all(`SELECT payment_mode, COUNT(*) AS count, SUM(amount) AS total FROM entries WHERE event_id = ? GROUP BY payment_mode`),
  });
}));

app.get('/api/export.csv', adminOnly, h((req, res) => {
  const f = entryFilters(req);
  const rows = db.prepare(`${LIST_SQL} WHERE ${f.sql} ORDER BY e.receipt_no`).all(...f.params);
  const cols = [['receipt_no', 'રસીદ નં'], ['created_at', 'તારીખ'], ['mandal_name', 'મંડળ'], ['devotee_name', 'નામ'],
    ['address', 'સરનામું'], ['mobile', 'મોબાઇલ'], ['whatsapp', 'WhatsApp'], ['seva_names', 'સેવા'], ['amount', 'રકમ'],
    ['payment_mode', 'ચુકવણી'], ['payment_ref', 'Ref'], ['karyakar_name', 'અન્નકૂટ સેવક'], ['notes', 'નોંધ']];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.map((c) => esc(c[1])).join(','), ...rows.map((r) => cols.map((c) => esc(r[c[0]])).join(','))].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="annakut-entries.csv"');
  res.send('﻿' + csv); // BOM so Excel shows Gujarati correctly
}));

// ---------- admin: users (karyakars) ----------
app.get('/api/users', adminOnly, (req, res) => {
  res.json(db.prepare(`SELECT u.id, u.name, u.mobile, u.role, u.mandal_id, u.active, m.name AS mandal_name,
    (SELECT COUNT(*) FROM entries e WHERE e.karyakar_id = u.id) AS entry_count
    FROM users u LEFT JOIN mandals m ON m.id = u.mandal_id ORDER BY u.role, u.name`).all());
});

function userData(body) {
  const d = {
    name: str(body.name), mobile: cleanMobile(body.mobile),
    role: body.role === 'admin' ? 'admin' : 'karyakar',
    mandal_id: toInt(body.mandal_id) || null, active: body.active === false || body.active === 0 ? 0 : 1,
  };
  if (!d.name) fail(400, 'નામ લખો');
  if (d.mobile.length !== 10) fail(400, 'સાચો 10 આંકડાનો મોબાઇલ નંબર લખો');
  return d;
}

app.post('/api/users', adminOnly, h((req, res) => {
  const d = userData(req.body);
  if (!req.body.password || String(req.body.password).length < 6) fail(400, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
  db.prepare('INSERT INTO users (name, mobile, password_hash, role, mandal_id, active) VALUES (?,?,?,?,?,?)')
    .run(d.name, d.mobile, hashPassword(String(req.body.password)), d.role, d.mandal_id, d.active);
  res.json({ ok: true });
}));

app.put('/api/users/:id', adminOnly, h((req, res) => {
  const id = toInt(req.params.id);
  const d = userData(req.body);
  if (id === req.user.id && (d.role !== 'admin' || !d.active)) fail(400, 'તમે પોતાને એડમિન માંથી દૂર ન કરી શકો');
  db.prepare('UPDATE users SET name=?, mobile=?, role=?, mandal_id=?, active=? WHERE id=?')
    .run(d.name, d.mobile, d.role, d.mandal_id, d.active, id);
  if (req.body.password) {
    if (String(req.body.password).length < 6) fail(400, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો');
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hashPassword(String(req.body.password)), id);
  }
  if (!d.active) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
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

app.get('/', (req, res) => res.redirect('/login.html'));

app.listen(PORT, () => console.log(`Annakut Seva app running -> http://localhost:${PORT}`));
