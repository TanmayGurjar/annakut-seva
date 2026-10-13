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
  'કોડ': 'Code',
  'કોડ (રસીદ માટે, દા.ત. TG → TG-1, TG-2) - ખાલી રાખો તો નામ પરથી બનશે': 'Code (for receipts, e.g. TG → TG-1, TG-2) - leave blank to make it from the name',
  '(રસીદ માટે, દા.ત. TG → TG-1. ખાલી રાખો તો નામ પરથી બનશે)': '(for receipts, e.g. TG → TG-1. Leave blank to make it from the name)',
  'કોડ 2 થી 4 અંગ્રેજી અક્ષરનો રાખો (દા.ત. TG)': 'Code must be 2 to 4 English letters (e.g. TG)',
  'આ કોડ બીજા કોઈનો છે': 'This code already belongs to someone else',
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
  'કાર્યકરોને અહીં ઉમેરો. તેઓ મોબાઇલ નંબર + પાસવર્ડથી લૉગિન કરશે. અન્નકૂટ સેવક પોતે નોંધણી કરે, કાર્યકર કે એડમિન મંજૂરી આપે.':
    'Add karyakars here. They log in with mobile number + password. Annakut sevaks register themselves and a karyakar or admin approves them.',
  // hierarchy: karyakar > annakut sevak, sign-up, approvals
  'નવા અન્નકૂટ સેવક છો?': 'New Annakut Sevak?',
  'નોંધણી કરો': 'Register',
  'અન્નકૂટ સેવક નોંધણી': 'Annakut Sevak Registration',
  'નોંધણી પછી તમારા કાર્યકર મંજૂરી આપશે, પછી તમે લૉગિન કરી શકશો.': 'After you register, your karyakar will approve you. Then you can log in.',
  'તમારું નામ *': 'Your Name *',
  'મોબાઇલ નંબર *': 'Mobile Number *',
  'પાસવર્ડ * (ઓછામાં ઓછા 6 અક્ષર)': 'Password * (at least 6 characters)',
  'મંડળ / વિસ્તાર *': 'Mandal / Area *',
  'તમારા કાર્યકર *': 'Your Karyakar *',
  'નોંધણી કરો ✔': 'Register ✔',
  '← લૉગિન પર પાછા': '← Back to login',
  'જય સ્વામિનારાયણ! નોંધણી થઈ ગઈ': 'Jai Swaminarayan! You are registered',
  'તમારા કાર્યકર મંજૂરી આપે પછી આ જ મોબાઇલ નંબર અને પાસવર્ડથી લૉગિન કરો.': 'Once your karyakar approves you, log in with this mobile number and password.',
  'લૉગિન પર જાઓ': 'Go to login',
  '-- કાર્યકર પસંદ કરો --': '-- Select Karyakar --',
  '👥 મારી ટીમ': '👥 My Team',
  '📋 ટીમ એન્ટ્રી': '📋 Team Entries',
  '🔔 મંજૂરી બાકી': '🔔 Waiting for approval',
  'મંજૂરી બાકી': 'Waiting for approval',
  'મારા અન્નકૂટ સેવક': 'My Annakut Sevaks',
  '➕ નવો સેવક': '➕ New Sevak',
  'અન્નકૂટ સેવક લૉગિન પેજ પર "નોંધણી કરો" થી પોતે પણ નોંધણી કરી શકે, પછી તમે મંજૂરી આપો.':
    'Annakut sevaks can also register themselves with "Register" on the login page; then you approve them.',
  '📊 ટીમ સારાંશ': '📊 Team Summary',
  '📊 ટીમ સારાંશ (કાર્યકર → અન્નકૂટ સેવક)': '📊 Team Summary (Karyakar → Annakut Sevak)',
  'મંજૂર કરો': 'Approve',
  'નામંજૂર': 'Reject',
  'મંજૂર': 'Approved',
  'મંજૂર થયું ✔': 'Approved ✔',
  '{0} ની નોંધણી નામંજૂર કરવી છે?': 'Reject the registration of {0}?',
  'હજુ કોઈ અન્નકૂટ સેવક નથી': 'No annakut sevaks yet',
  'આખી ટીમ': 'Whole team',
  'હું': 'me',
  'અન્નકૂટ સેવક સુધારો': 'Edit Annakut Sevak',
  'નવો અન્નકૂટ સેવક': 'New Annakut Sevak',
  '👥 કાર્યકર / સેવક': '👥 Karyakars / Sevaks',
  'કાર્યકર ટીમ પ્રમાણે': 'By Karyakar Team',
  '{0} ટીમ': '{0} team',
  'કુલ - {0} ટીમ': 'Total - {0} team',
  '{0} વ્યક્તિ': '{0} people',
  'કાર્યકર (ફક્ત અન્નકૂટ સેવક માટે)': 'Karyakar (only for annakut sevaks)',
  // google sheets
  'સારાંશ': 'Summary',
  'બધી એન્ટ્રી': 'All entries',
  'Google Drive ખોલો': 'Open Google Drive',
  'ફાઈલ ડાઉનલોડ કરીને Google Drive માં અપલોડ કરો → ફાઈલ પર ક્લિક → "Google Sheets સાથે ખોલો". ઉપરનું ફિલ્ટર (સેવા) પણ લાગુ થશે.':
    'Download the file, upload it to Google Drive → click the file → "Open with Google Sheets". The seva filter above is applied too.',
  'લાઈવ Google Sheet (આપમેળે અપડેટ)': 'Live Google Sheet (updates automatically)',
  'નવી Google Sheet બનાવો, A1 ખાનામાં આ લખો. દર કલાકે આપમેળે અપડેટ થશે:': 'Create a new Google Sheet and paste this into cell A1. It updates automatically about every hour:',
  'સારાંશ ફોર્મ્યુલા કૉપી': 'Copy summary formula',
  'એન્ટ્રી ફોર્મ્યુલા કૉપી': 'Copy entries formula',
  'નવી લિંક (જૂની બંધ થશે)': 'New link (old one stops)',
  'લાઈવ લિંક બનાવો': 'Create live link',
  '⚠ લાઈવ લિંક ત્યારે જ ચાલશે જ્યારે એપ ઇન્ટરનેટ પર ઓનલાઇન હશે (localhost / Wi-Fi પર નહીં).':
    '⚠ The live link only works once the app is online on the internet (not on localhost / Wi-Fi).',
  'આ લિંક ગુપ્ત રાખો - લિંક ધરાવનાર કોઈપણ તમારી ટીમનો ડેટા જોઈ શકે.': 'Keep this link secret - anyone with it can see your team\'s data.',
  'કૉપી થયું ✔': 'Copied ✔',
  'જૂની લિંક વાળી Google Sheet બંધ થઈ જશે. નવી લિંક બનાવવી છે?': 'Google Sheets using the old link will stop updating. Create a new link?',
  'ફક્ત કાર્યકર / એડમિન માટે': 'Karyakars / admins only',
  'તમારી નોંધણી હજુ મંજૂર થઈ નથી. તમારા કાર્યકરને જણાવો.': 'Your registration is not approved yet. Please tell your karyakar.',
  'ઘણી નોંધણી થઈ. થોડી વાર પછી પ્રયત્ન કરો.': 'Too many registrations. Please try again later.',
  'તમારા કાર્યકર પસંદ કરો': 'Select your karyakar',
  'આ મોબાઇલ નંબરથી પહેલેથી નોંધણી થયેલી છે': 'This mobile number is already registered',
  'મળ્યું નથી': 'Not found',
  'આ કાર્યકર નીચે અન્નકૂટ સેવક છે. પહેલા તેમને બીજા કાર્યકર નીચે મૂકો.': 'This karyakar has annakut sevaks. Move them to another karyakar first.',
  'ફક્ત બાકી નોંધણી જ કાઢી શકાય. બીજાને "બંધ" કરો.': 'Only pending registrations can be removed. Mark others as inactive instead.',
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
    t('રસીદ નં: {0}', e.receipt),
    t('સેવા: {0}', sevas),
    t('રકમ: ₹{0}/-', e.amount),
    t('અન્નકૂટ સેવક: {0}', `${e.karyakar_name || ''}${e.karyakar_mobile ? ' (' + e.karyakar_mobile + ')' : ''}`),
    '',
    t('અન્નકૂટ સેવક દ્વારા આપને પ્રસાદ પહોંચાડવામાં આવશે.'),
    t('- બી.એ.પી.એસ. શ્રી સ્વામિનારાયણ મંદિર, પોરબંદર'),
  ].join('\n');
  return `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
}

const ROLE = { admin: 'એડમિન', karyakar: 'કાર્યકર', sevak: 'અન્નકૂટ સેવક' };
const roleBadge = (r) => `<span class="badge role-${r}">${t(ROLE[r] || r)}</span>`;

// Team summary table: karyakar + their annakut sevaks, then a team total row; one column per seva type
function summaryTable(data) {
  if (!data.rows.length) return '<p style="color:var(--muted)">' + t('હજુ ડેટા નથી') + '</p>';
  const head = `<tr><th>${t('નામ')}</th><th>${t('ભૂમિકા')}</th><th class="num">${t('એન્ટ્રી')}</th><th class="num">${t('રકમ')}</th>
    <th class="num">${t('બાકી')}</th>${data.sevaTypes.map((s) => `<th class="num">${esc(s.name)}</th>`).join('')}</tr>`;
  const body = data.rows.map((r) => r.type === 'team'
    ? `<tr class="team-row"><td>${t('કુલ - {0} ટીમ', esc(r.team_name))}</td><td>${t('{0} વ્યક્તિ', r.members)}</td>
        <td class="num">${r.count}</td><td class="num">${rupees(r.total)}</td><td class="num">${rupees(r.pending)}</td>
        ${data.sevaTypes.map((s) => `<td class="num">${r.sevas[s.id]}</td>`).join('')}</tr>`
    : `<tr><td>${esc(r.name)} <b>${esc(r.code || '')}</b><br><small style="color:var(--muted)">${r.mobile}</small></td><td>${roleBadge(r.role)}</td>
        <td class="num">${r.count}</td><td class="num">${rupees(r.total)}</td><td class="num">${rupees(r.pending)}</td>
        ${data.sevaTypes.map((s) => `<td class="num">${r.sevas[s.id] || ''}</td>`).join('')}</tr>`).join('');
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

// Google Sheets box: download CSVs (open with Google Sheets) + a live IMPORTDATA link once the app is online
async function sheetsBox(el, getQuery) {
  const { token } = await api('/api/me/sheet-link');
  const online = !/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  const formula = (file) => `=IMPORTDATA("${location.origin}/sheets/${token}/${file}")`;
  el.innerHTML = `
    <h3>📗 Google Sheets</h3>
    <div class="toolbar">
      <button class="green small" data-dl="summary">⬇ ${t('સારાંશ')}</button>
      <button class="green small" data-dl="export">⬇ ${t('બધી એન્ટ્રી')}</button>
      <a class="btn small secondary" href="https://drive.google.com/drive/my-drive" target="_blank">${t('Google Drive ખોલો')}</a>
    </div>
    <p class="hint">${t('ફાઈલ ડાઉનલોડ કરીને Google Drive માં અપલોડ કરો → ફાઈલ પર ક્લિક → "Google Sheets સાથે ખોલો". ઉપરનું ફિલ્ટર (સેવા) પણ લાગુ થશે.')}</p>
    <h3>🔗 ${t('લાઈવ Google Sheet (આપમેળે અપડેટ)')}</h3>
    ${token ? `
      <p class="hint">${t('નવી Google Sheet બનાવો, A1 ખાનામાં આ લખો. દર કલાકે આપમેળે અપડેટ થશે:')}</p>
      <div class="formula">${esc(formula('summary.csv'))}</div>
      <div class="toolbar" style="margin-top:6px">
        <button class="small secondary" data-copy="summary.csv">📋 ${t('સારાંશ ફોર્મ્યુલા કૉપી')}</button>
        <button class="small secondary" data-copy="entries.csv">📋 ${t('એન્ટ્રી ફોર્મ્યુલા કૉપી')}</button>
        <button class="small secondary" data-new>${t('નવી લિંક (જૂની બંધ થશે)')}</button>
      </div>` : `<button class="small" data-new>${t('લાઈવ લિંક બનાવો')}</button>`}
    ${online ? '' : `<p class="warn">${t('⚠ લાઈવ લિંક ત્યારે જ ચાલશે જ્યારે એપ ઇન્ટરનેટ પર ઓનલાઇન હશે (localhost / Wi-Fi પર નહીં).')}</p>`}
    <p class="hint">${t('આ લિંક ગુપ્ત રાખો - લિંક ધરાવનાર કોઈપણ તમારી ટીમનો ડેટા જોઈ શકે.')}</p>`;
  el.querySelectorAll('[data-dl]').forEach((b) => (b.onclick = () => {
    location.href = `/api/${b.dataset.dl}.csv?${getQuery()}`;
  }));
  el.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = async () => {
    try { await navigator.clipboard.writeText(formula(b.dataset.copy)); toast(t('કૉપી થયું ✔')); }
    catch { prompt('Copy:', formula(b.dataset.copy)); }
  }));
  const nb = el.querySelector('[data-new]');
  if (nb) nb.onclick = async () => {
    if (token && !confirm(t('જૂની લિંક વાળી Google Sheet બંધ થઈ જશે. નવી લિંક બનાવવી છે?'))) return;
    await api('/api/me/sheet-link', { method: 'POST' });
    sheetsBox(el, getQuery);
  };
}

async function changePassword() {
  const current = prompt(t('જૂનો પાસવર્ડ (Current password)'));
  if (!current) return;
  const next = prompt(t('નવો પાસવર્ડ (New password, min 6)'));
  if (!next) return;
  try { await api('/api/me/password', { method: 'POST', body: { current, next } }); toast(t('પાસવર્ડ બદલાઈ ગયો ✔')); }
  catch (e) { toast(e.message, true); }
}
