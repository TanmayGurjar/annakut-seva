// ----- Language: Gujarati is the source text, English is an optional translation -----
const LANG = (() => { try { return localStorage.getItem('lang') === 'en' ? 'en' : 'gu'; } catch { return 'gu'; } })();
const EN = {
  // page titles / branding
  'લૉગિન - જમોને જમાડું રે': 'Login - Jamo Ne Jamadu Re',
  'સેવા એન્ટ્રી - જમોને જમાડું રે': 'Seva Entry - Jamo Ne Jamadu Re',
  'એડમિન - જમોને જમાડું રે': 'Admin - Jamo Ne Jamadu Re',
  'રસીદ - અન્નકૂટોત્સવ': 'Receipt - Annakutotsav',
  'અન્નકૂટોત્સવ': 'Annakutotsav',
  'જમોને જમાડું રે...': 'Jamo Ne Jamadu Re...',
  'બી.એ.પી.એસ. શ્રી સ્વામિનારાયણ મંદિર, પોરબંદર': 'BAPS Shri Swaminarayan Mandir, Porbandar',
  '- બી.એ.પી.એસ. શ્રી સ્વામિનારાયણ મંદિર, પોરબંદર': '- BAPS Shri Swaminarayan Mandir, Porbandar',
  // login
  'લૉગિન (Login)': 'Login',
  'મોબાઇલ નંબર': 'Mobile Number',
  'પાસવર્ડ': 'Password',
  'લૉગિન કરો': 'Log in',
  'મને યાદ રાખો (આ ફોનમાં લૉગિન રહેવા દો)': 'Remember me (stay logged in on this phone)',
  'નવો પાસવર્ડ સેટ કરો': 'Set a new password',
  'સુરક્ષા માટે, આગળ વધતા પહેલા તમારો પોતાનો પાસવર્ડ રાખો.': 'For safety, set your own password before continuing.',
  'નવો પાસવર્ડ (ઓછામાં ઓછા 6 અક્ષર)': 'New password (at least 6 characters)',
  'નવો પાસવર્ડ ફરી લખો': 'Type the new password again',
  'બંને પાસવર્ડ સરખા નથી': 'The two passwords do not match',
  'પાસવર્ડ સેટ કરો ✔': 'Set password ✔',
  '⬇ બેકઅપ': '⬇ Backup',
  // top bar / common
  'એડમિન': 'Admin',
  'કાર્યકર': 'Karyakar',
  'બહાર': 'Logout',
  'કંઈક ભૂલ થઈ': 'Something went wrong',
  'જૂનો પાસવર્ડ (Current password)': 'Current password',
  'નવો પાસવર્ડ (New password, min 6)': 'New password (min 6)',
  'પાસવર્ડ બદલાઈ ગયો ✔': 'Password changed ✔',
  'કોઈ ચાલુ ઉત્સવ નથી': 'No active festival',
  'રોકડ': 'Cash',
  'ચેક': 'Cheque',
  'બાકી': 'Pending',
  // entry form (app.html)
  '➕ નવી એન્ટ્રી': '➕ New Entry',
  '📋 મારી એન્ટ્રી': '📋 My Entries',
  'સેવા નોંધણી': 'Seva Registration',
  'મોબાઇલ નં. *': 'Mobile No. *',
  '10 આંકડા': '10 digits',
  'WhatsApp નંબર આ જ છે': 'WhatsApp number is the same',
  'WhatsApp નં.': 'WhatsApp No.',
  '(વૈકલ્પિક)': '(optional)',
  'નામ *': 'Name *',
  'મંડળ *': 'Mandal *',
  'સરનામું': 'Address',
  'સેવા પસંદ કરો': 'Select Seva',
  'સેવાની રકમ *': 'Seva Amount *',
  'ચુકવણી': 'Payment',
  'રોકડ (Cash)': 'Cash',
  'ચેક (Cheque)': 'Cheque',
  'બાકી (Pending)': 'Pending',
  'UPI/ચેક નં.': 'UPI/Cheque No.',
  'નોંધ': 'Notes',
  'સેવ કરો ✔': 'Save ✔',
  'રદ કરો': 'Cancel',
  'જય સ્વામિનારાયણ! સેવા નોંધાઈ ગઈ': 'Jai Swaminarayan! Seva recorded',
  'રસીદ નં.': 'Receipt No.',
  'WhatsApp પર મોકલો': 'Send on WhatsApp',
  '🖨 રસીદ': '🖨 Receipt',
  'એન્ટ્રી': 'Entries',
  'કુલ સેવા': 'Total Seva',
  '🔍 નામ / મોબાઇલ / રસીદ નં. શોધો': '🔍 Search name / mobile / receipt no.',
  '-- મંડળ પસંદ કરો --': '-- Select Mandal --',
  '⚠ આ નંબરથી આ વર્ષે પહેલેથી {0} એન્ટ્રી છે: ': '⚠ This number already has {0} entries this year: ',
  'રસીદ {0}': 'Receipt {0}',
  'ગયા વખતની માહિતી મળી:': 'Found details from last time:',
  'ભરો': 'Fill',
  '(સુધારો સેવ થયો)': '(changes saved)',
  'એન્ટ્રી સુધારો - રસીદ {0}': 'Edit Entry - Receipt {0}',
  '✏ સુધારો': '✏ Edit',
  'હજુ કોઈ એન્ટ્રી નથી': 'No entries yet',
  // admin.html
  'એડમિન પેનલ': 'Admin Panel',
  '➕ એન્ટ્રી': '➕ Entry',
  '📊 ડેશબોર્ડ': '📊 Dashboard',
  '📋 બધી એન્ટ્રી': '📋 All Entries',
  '👥 કાર્યકર': '👥 Karyakars',
  '🏘 મંડળ': '🏘 Mandals',
  '🍱 સેવા/થાળ': '🍱 Seva/Thal',
  '📅 ઉત્સવ': '📅 Festivals',
  'કુલ સેવા રકમ': 'Total Seva Amount',
  'કુલ એન્ટ્રી': 'Total Entries',
  'બાકી રકમ': 'Pending Amount',
  'મંડળ પ્રમાણે': 'By Mandal',
  'થાળ / સેવા પ્રમાણે': 'By Thal / Seva',
  'કાર્યકર પ્રમાણે': 'By Karyakar',
  'ચુકવણી પ્રમાણે': 'By Payment',
  '🔍 નામ / મોબાઇલ / રસીદ': '🔍 Name / mobile / receipt',
  'બધી ચુકવણી': 'All payments',
  'એન્ટ્રી · કુલ': 'entries · Total',
  'રસીદ': 'Receipt',
  'નામ': 'Name',
  'મોબાઇલ': 'Mobile',
  'મંડળ': 'Mandal',
  'સેવા': 'Seva',
  'રકમ': 'Amount',
  'તારીખ': 'Date',
  'ભૂમિકા': 'Role',
  'સ્થિતિ': 'Status',
  'ક્રમ': 'Order',
  'ઉત્સવ': 'Festival',
  'સ્થળ': 'Venue',
  'સમય': 'Time',
  'કુલ': 'Total',
  'સંખ્યા': 'Count',
  'કાર્યકરોને અહીં ઉમેરો. તેઓ મોબાઇલ નંબર + પાસવર્ડથી લૉગિન કરશે.': 'Add karyakars here. They will log in with mobile number + password.',
  '➕ નવો કાર્યકર': '➕ New Karyakar',
  'પોરબંદરના વિસ્તાર / મંડળ': 'Porbandar areas / mandals',
  '➕ નવું મંડળ': '➕ New Mandal',
  'થાળ / સેવાના પ્રકાર અને રકમ': 'Thal / seva types and amounts',
  '➕ નવી સેવા': '➕ New Seva',
  'દર વર્ષે નવો ઉત્સવ બનાવો અને તેને "ચાલુ" કરો. જૂના વર્ષનો ડેટા સચવાયેલો રહેશે.': 'Create a new festival every year and mark it "Active". Previous years\' data stays saved.',
  '➕ નવો ઉત્સવ': '➕ New Festival',
  'હજુ ડેટા નથી': 'No data yet',
  '✅ ચાલુ': '✅ Active',
  '⛔ બંધ': '⛔ Inactive',
  'સેવ કરો': 'Save',
  'રદ': 'Cancel',
  'સેવ થયું ✔': 'Saved ✔',
  'બધા મંડળ': 'All mandals',
  'બધા કાર્યકર': 'All karyakars',
  'બધી સેવા': 'All sevas',
  'કોઈ એન્ટ્રી નથી': 'No entries',
  'રસીદ {0} કાઢી નાખવી છે? આ પાછું નહીં આવે.': 'Delete receipt {0}? This cannot be undone.',
  'કાઢી નાખ્યું': 'Deleted',
  'કાર્યકર સુધારો': 'Edit Karyakar',
  'નવો કાર્યકર': 'New Karyakar',
  'મોબાઇલ નં. * (લૉગિન માટે)': 'Mobile No. * (for login)',
  'નવો પાસવર્ડ (ખાલી રાખો તો બદલાશે નહીં)': 'New password (leave blank to keep unchanged)',
  'પાસવર્ડ * (min 6)': 'Password * (min 6)',
  '-- કોઈ નહીં --': '-- None --',
  'ચાલુ (લૉગિન કરી શકે)': 'Active (can log in)',
  'મંડળ સુધારો': 'Edit Mandal',
  'નવું મંડળ': 'New Mandal',
  'મંડળનું નામ *': 'Mandal Name *',
  'ચાલુ': 'Active',
  'સેવા સુધારો': 'Edit Seva',
  'નવી સેવા': 'New Seva',
  'સેવાનું નામ *': 'Seva Name *',
  'રકમ ₹ *': 'Amount ₹ *',
  'ચાલુ (ફોર્મમાં દેખાય)': 'Active (shown in form)',
  'ઉત્સવ સુધારો': 'Edit Festival',
  'નવો ઉત્સવ': 'New Festival',
  'ઉત્સવનું નામ *': 'Festival Name *',
  'આ ઉત્સવ ચાલુ કરો (નવી એન્ટ્રી આમાં જશે)': 'Make this festival active (new entries will go here)',
  // receipt.html
  'લોડ થાય છે...': 'Loading...',
  '🖨 પ્રિન્ટ': '🖨 Print',
  'પાછા': 'Back',
  'તા.': 'Date:',
  'મો.નં.': 'Mobile',
  'સેવાની રકમ': 'Seva Amount',
  'અન્નકૂટ સેવક': 'Annakut Sevak',
  'અન્નકૂટ સેવક દ્વારા આપને પ્રસાદ પહોંચાડવામાં આવશે.': 'Prasad will be delivered to you by the Annakut Sevak.',
  // WhatsApp message
  'જય સ્વામિનારાયણ 🙏': 'Jai Swaminarayan 🙏',
  '{0}, આપની અન્નકૂટ સેવા નોંધાઈ ગઈ છે.': '{0}, your Annakut seva has been recorded.',
  'રસીદ નં: {0}': 'Receipt No: {0}',
  'સેવા: {0}': 'Seva: {0}',
  'રકમ: ₹{0}/-': 'Amount: ₹{0}/-',
  'અન્નકૂટ સેવક: {0}': 'Annakut Sevak: {0}',
  // server error messages (server.js)
  'આ માહિતી પહેલેથી છે (duplicate)': 'This already exists (duplicate)',
  'કૃપા કરી લૉગિન કરો': 'Please log in',
  'ફક્ત એડમિન માટે': 'Admins only',
  'મોબાઇલ નંબર અથવા પાસવર્ડ ખોટો છે': 'Mobile number or password is wrong',
  'જૂનો પાસવર્ડ ખોટો છે': 'Current password is wrong',
  'નવો પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો': 'New password must be at least 6 characters',
  'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો રાખો': 'Password must be at least 6 characters',
  'નામ લખો': 'Enter name',
  'સાચો 10 આંકડાનો મોબાઇલ નંબર લખો': 'Enter a valid 10-digit mobile number',
  'સાચો WhatsApp નંબર લખો': 'Enter a valid WhatsApp number',
  'મંડળ પસંદ કરો': 'Select mandal',
  'સેવાની રકમ લખો': 'Enter seva amount',
  'એન્ટ્રી મળી નથી': 'Entry not found',
  'કોઈ ચાલુ ઉત્સવ નથી. એડમિન ને જણાવો.': 'No active festival. Please inform the admin.',
  'તમે પોતાને એડમિન માંથી દૂર ન કરી શકો': 'You cannot remove yourself from admin',
  'મંડળનું નામ લખો': 'Enter mandal name',
  'સેવાનું નામ અને રકમ લખો': 'Enter seva name and amount',
  'ઉત્સવનું નામ લખો': 'Enter festival name',
  'ઘણા ખોટા પ્રયત્નો થયા. 15 મિનિટ પછી ફરી પ્રયત્ન કરો.': 'Too many wrong attempts. Please try again after 15 minutes.',
  'પહેલા નવો પાસવર્ડ સેટ કરો': 'Please set a new password first',
  'બીજો નવો પાસવર્ડ રાખો': 'Please choose a different new password',
};

// t('રસીદ {0}', no) -> text in the current language, with {0}, {1}... filled in
function t(gu, ...args) {
  const s = (LANG === 'en' && EN[gu]) || gu;
  return s.replace(/\{(\d)\}/g, (_, i) => args[i] ?? '');
}

// Translates the static Gujarati text already in the HTML (text nodes, placeholders, title)
function translatePage() {
  if (LANG !== 'en') return;
  document.documentElement.lang = 'en';
  if (EN[document.title]) document.title = EN[document.title];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const key = n.nodeValue.trim();
    if (EN[key]) n.nodeValue = n.nodeValue.replace(key, () => EN[key]);
  }
  document.querySelectorAll('[placeholder]').forEach((el) => { if (EN[el.placeholder]) el.placeholder = EN[el.placeholder]; });
}

function setLang(lang) {
  try { localStorage.setItem('lang', lang); } catch {}
  location.reload();
}

// Adds the English / ગુજરાતી switch button (top bar, receipt actions, or a corner on login)
function addLangButton() {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'small lang-btn';
  b.textContent = LANG === 'en' ? 'ગુજરાતી' : 'English';
  b.title = LANG === 'en' ? 'ગુજરાતીમાં જુઓ' : 'View in English';
  b.onclick = () => setLang(LANG === 'en' ? 'gu' : 'en');
  const bar = document.querySelector('.topbar');
  const actions = document.querySelector('.actions.noprint');
  if (bar) bar.querySelector('h1').after(b);
  else if (actions) actions.appendChild(b);
  else { b.classList.add('secondary', 'floating'); document.body.appendChild(b); }
}

translatePage();
addLangButton();

// Shared helpers used by every page
async function api(url, options = {}) {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401 && !location.pathname.endsWith('login.html')) { location.href = '/login.html'; throw new Error('login'); }
  const data = await res.json().catch(() => ({}));
  if (data.mustChange && !location.pathname.endsWith('login.html')) { location.href = '/login.html'; throw new Error('login'); }
  if (!res.ok) throw new Error(t(data.error || 'કંઈક ભૂલ થઈ'));
  return data;
}

function toast(msg, isError) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = isError ? 'error' : ''; t.style.display = 'block';
  clearTimeout(t._timer); t._timer = setTimeout(() => (t.style.display = 'none'), 3500);
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = (n) => '₹ ' + Number(n || 0).toLocaleString('en-IN');
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const PAYMENT = { cash: t('રોકડ'), upi: 'UPI', cheque: t('ચેક'), pending: t('બાકી') };

async function logout() { await api('/api/logout', { method: 'POST' }); location.href = '/login.html'; }

// Opens WhatsApp with a ready-made thank-you / receipt message for the devotee
function whatsappLink(e) {
  const number = e.whatsapp || e.mobile;
  const sevas = (e.sevas || []).map((s) => s.name).join(', ') || e.seva_names || '-';
  const text = [
    t('જય સ્વામિનારાયણ 🙏'),
    t('{0}, આપની અન્નકૂટ સેવા નોંધાઈ ગઈ છે.', e.devotee_name),
    '',
    t('રસીદ નં: {0}', e.receipt_no),
    t('સેવા: {0}', sevas),
    t('રકમ: ₹{0}/-', e.amount),
    t('અન્નકૂટ સેવક: {0}', `${e.karyakar_name || ''}${e.karyakar_mobile ? ' (' + e.karyakar_mobile + ')' : ''}`),
    '',
    t('અન્નકૂટ સેવક દ્વારા આપને પ્રસાદ પહોંચાડવામાં આવશે.'),
    t('- બી.એ.પી.એસ. શ્રી સ્વામિનારાયણ મંદિર, પોરબંદર'),
  ].join('\n');
  return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
}

async function changePassword() {
  const current = prompt(t('જૂનો પાસવર્ડ (Current password)'));
  if (!current) return;
  const next = prompt(t('નવો પાસવર્ડ (New password, min 6)'));
  if (!next) return;
  try { await api('/api/me/password', { method: 'POST', body: { current, next } }); toast(t('પાસવર્ડ બદલાઈ ગયો ✔')); }
  catch (e) { toast(e.message, true); }
}
