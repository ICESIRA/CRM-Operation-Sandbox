// ══════════════════════════════════════════════════════════════
// CRM Operations — helpers.js
// Date formatting, badge builders, input masks, member display
// ══════════════════════════════════════════════════════════════
// ── HELPERS ───────────────────────────────────────────────────
function _parseDate(d) {
  if (!d) return null;
  // Already dd/mm/yyyy → convert to yyyy-mm-dd first
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [dd,mm,yyyy] = d.split('/');
    d = `${yyyy}-${mm}-${dd}`;
  }
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}
const fmtDate     = d => {
  const dt = _parseDate(d);
  if (!dt) return '—';
  return String(dt.getDate()).padStart(2,'0') + '/' +
         String(dt.getMonth()+1).padStart(2,'0') + '/' +
         dt.getFullYear();
};
const fmtDateFull = d => {
  const dt = _parseDate(d);
  if (!dt) return '—';
  return String(dt.getDate()).padStart(2,'0') + '/' +
         String(dt.getMonth()+1).padStart(2,'0') + '/' +
         dt.getFullYear();
};
const daysLeft = d => d ? Math.round((new Date(d)-new Date())/86400000) : null;
const mkBadge = s => `<span class="badge ${SC[s]}">${SI[s]} ${SL[s]}</span>`;
const mkPri   = p => `<span class="pri pri-${p}" title="${PL[p]}"></span>`;
const mkDays  = d => {
  const n = daysLeft(d);
  if (n===null) return '—';
  const style = n<0 ? 'color:var(--red)' : n===0 ? 'color:var(--red)' : n<=2 ? 'color:var(--gold)' : 'color:var(--t2)';
  const label = n<0 ? `${n}d ⚠` : n===0 ? 'Today ⏰' : `+${n}d`;
  return `<span style="${style};font-family:var(--mono);font-size:12px">${label}</span>`;
};

function getMemberDisplay(nameOrNickname) {
  if (!nameOrNickname) return '—';
  const m = TEAM.find(t => t.name === nameOrNickname || t.nickname === nameOrNickname);
  return m ? (m.nickname || m.name) : nameOrNickname;
}

// Get the TEAM member name for the currently logged-in user
// Get current user display name for audit log
function getAuditUser() {
  var name = getCurrentMemberName();
  if (name) return getMemberDisplay(name);
  // fallback to email or sidebar name
  if (_currentEmail) return _currentEmail.split('@')[0];
  var el = document.getElementById('sb-username');
  return el ? el.textContent : 'Unknown';
}

function getCurrentMemberName() {
  if (!_currentEmail) return null;
  var m = TEAM.find(function(t){ return t.email && t.email.toLowerCase().trim() === _currentEmail.toLowerCase().trim(); });
  return m ? m.name : null;
}

// Returns the tickets visible to the current user
function getVisibleTickets() {
  if (_currentRole === 'Specialist') {
    var myName = getCurrentMemberName();
    return myName ? TICKETS.filter(function(t){
      return t.specialist === myName || t.coSpecialist === myName;
    }) : [];
  }
  return TICKETS;

function calcTenure(startDate) {
  const start = new Date(startDate);
  const now   = new Date();
  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth()    - start.getMonth();
  let days   = now.getDate()     - start.getDate();
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }
  const parts = [];
  if (years  > 0) parts.push(`${years}ปี`);
  if (months > 0) parts.push(`${months}เดือน`);
  if (days   > 0) parts.push(`${days}วัน`);
  return parts.length ? parts.join(' ') : 'วันนี้';
}

function parseDMY(s) {
  // converts dd/mm/yyyy → yyyy-mm-dd, returns '' if invalid
  if (!s) return '';
  const parts = s.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (d.length!==2 || m.length!==2 || y.length!==4) return '';
  return `${y}-${m}-${d}`;
}

// ── DATE MASK (dd/mm/yyyy) ────────────────────────────────────
function maskDate(el) {
  let v = el.value.replace(/\D/g,'');
  if (v.length > 8) v = v.slice(0,8);
  let out = '';
  if (v.length > 4)      out = v.slice(0,2) + '/' + v.slice(2,4) + '/' + v.slice(4);
  else if (v.length > 2) out = v.slice(0,2) + '/' + v.slice(2);
  else                   out = v;
  el.value = out;
}

// ── NUMBER COMMA MASK ─────────────────────────────────────────
function maskComma(el) {
  const pos = el.selectionStart;
  const raw = el.value.replace(/[^0-9]/g,'');
  const formatted = raw ? parseInt(raw).toLocaleString('en-US') : '';
  el.value = formatted;
  // restore cursor roughly
  try { el.setSelectionRange(formatted.length, formatted.length); } catch(e){}
}

// ── PHONE MASK (0XX-XXX-XXXX) ─────────────────────────────────
function maskPhone(el) {
  let v = el.value.replace(/[^0-9]/g,'');
  if (v.length > 10) v = v.slice(0,10);
  let out = v;
  if (v.length > 6)      out = v.slice(0,3) + '-' + v.slice(3,6) + '-' + v.slice(6);
  else if (v.length > 3) out = v.slice(0,3) + '-' + v.slice(3);
  el.value = out;
}

// ── EMAIL VALIDATION ─────────────────────────────────────────
function validateApEmail(input) {
  const val = input.value.trim();
  const err = document.getElementById('ap-email-err');
  if (!err) return;
  if (!val) { err.style.display='none'; input.style.borderColor=''; return; }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  err.style.display = ok ? 'none' : 'block';
  input.style.borderColor = ok ? '' : 'var(--red)';
}

// ── PHONE VALIDATION ─────────────────────────────────────────
function validateApPhone(input) {
  const val = input.value.trim();
  const err = document.getElementById('ap-phone-err');
  if (!err) return;
  if (!val) { err.style.display='none'; input.style.borderColor=''; return; }
  const ok = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(val) || /^[0-9]{9,10}$/.test(val.replace(/-/g,''));
  err.style.display = ok ? 'none' : 'block';
  input.style.borderColor = ok ? '' : 'var(--red)';
}


function isAllowedQuoteFile(file) {
  const ext = (file.name.split('.').pop()||'').toLowerCase();
  return ALLOWED_QUOTE_TYPES.includes(file.type) || ALLOWED_QUOTE_EXTS.includes(ext);
}

function fileIcon(name) {
  const ext = (name.split('.').pop()||'').toLowerCase();
  if (ext === 'pdf') return '📕';
  if (['png','jpg','jpeg','webp'].includes(ext)) return '🖼';
  return '📄';
}
function fmtFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

function pct(a,b) { return b > 0 ? Math.round(a/b*100) : 0; }
