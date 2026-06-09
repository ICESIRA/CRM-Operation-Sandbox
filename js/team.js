// ══════════════════════════════════════════════════════════════
// CRM Operations — team.js
// Personnel page, certificates, KPI, employee CRUD
// ══════════════════════════════════════════════════════════════
// ── CERTIFICATE HELPERS ──────────────────────────────────────
// cert file store: key → base64
var _certFileStore = {};

function _certFileKey() {
  return 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function _buildCertRow(name, expiry, fileKey, fileName) {
  var row = document.createElement('div');
  row.style.cssText = 'background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px';
  // store fileKey as data attr
  if (fileKey) row.dataset.fileKey = fileKey;
  if (fileName) row.dataset.fileName = fileName;

  // Row 1: name + expiry
  var r1 = document.createElement('div');
  r1.style.cssText = 'display:flex;gap:8px;align-items:center';
  r1.innerHTML = '<input class="fc" type="text" value="' + (name||'').replace(/"/g,'&quot;') + '" placeholder="ชื่อ Certificate เช่น Meta Blueprint" style="flex:2;font-size:12px" />'
    + '<input class="fc" type="date" value="' + (expiry||'') + '" style="flex:1;font-size:12px" title="วันหมดอายุ" />'
    + '<button type="button" onclick="certRemoveRow(this)" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:16px;padding:2px 6px;flex-shrink:0">✕</button>';
  row.appendChild(r1);

  // Row 2: file attach area
  var r2 = document.createElement('div');
  r2.style.cssText = 'display:flex;align-items:center;gap:8px';

  if (fileKey && _certFileStore[fileKey]) {
    // File already attached — show preview strip
    var ext = (fileName||'').split('.').pop().toLowerCase();
    var ico = ext === 'pdf' ? '📕' : ['png','jpg','jpeg','webp'].includes(ext) ? '🖼' : '📄';
    r2.innerHTML = '<div style="display:flex;align-items:center;gap:6px;flex:1;background:rgba(30,181,168,.06);border:1px solid rgba(30,181,168,.25);border-radius:7px;padding:5px 10px">'
      + '<span style="font-size:15px">' + ico + '</span>'
      + '<span style="font-size:11px;font-weight:700;color:var(--t1);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (fileName||'ไฟล์') + '</span>'
      + '<button type="button" onclick="certPreview(this)" data-key="' + fileKey + '" data-name="' + (fileName||'') + '" style="background:none;border:none;color:var(--accent2);cursor:pointer;font-size:11px;font-weight:700;padding:0">👁 ดู</button>'
      + '</div>'
      + '<button type="button" onclick="certRemoveFile(this)" style="font-family:var(--sans);font-size:10px;font-weight:700;color:var(--t3);background:none;border:1px solid var(--bd);border-radius:6px;padding:4px 8px;cursor:pointer">✕ ลบไฟล์</button>';
  } else {
    // No file — show upload button
    var uid = 'certfile_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    r2.innerHTML = '<label for="' + uid + '" style="display:flex;align-items:center;gap:6px;cursor:pointer;font-family:var(--sans);font-size:11px;font-weight:700;color:var(--accent2);background:rgba(30,181,168,.06);border:1px dashed rgba(30,181,168,.25);border-radius:7px;padding:5px 12px;transition:all .2s">'
      + '📎 แนบไฟล์ Certificate'
      + '<span style="font-size:10px;color:var(--t3);font-weight:400">(PDF, PNG, JPG)</span></label>'
      + '<input type="file" id="' + uid + '" accept=".pdf,.png,.jpg,.jpeg,.webp" style="display:none" onchange="certFileSelected(this)" />';
  }
  row.appendChild(r2);
  return row;
}

function certRemoveRow(btn) {
  var row = btn.parentElement && btn.parentElement.parentElement;
  if (row) row.remove();
}

function addCertRow(mode) {
  var list = document.getElementById(mode + '-cert-list');
  if (!list) return;
  list.appendChild(_buildCertRow('', '', null, null));
}

function certFileSelected(input) {
  var file = input.files[0];
  if (!file) return;
  var row = input.closest('div[style*="flex-direction"]');
  if (!row) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var key = _certFileKey();
    _certFileStore[key] = e.target.result;
    row.dataset.fileKey  = key;
    row.dataset.fileName = file.name;
    // Rebuild file area
    var r2 = row.children[1];
    var ext = file.name.split('.').pop().toLowerCase();
    var ico = ext === 'pdf' ? '📕' : ['png','jpg','jpeg','webp'].includes(ext) ? '🖼' : '📄';
    r2.innerHTML = '<div style="display:flex;align-items:center;gap:6px;flex:1;background:rgba(30,181,168,.06);border:1px solid rgba(30,181,168,.25);border-radius:7px;padding:5px 10px">'
      + '<span style="font-size:15px">' + ico + '</span>'
      + '<span style="font-size:11px;font-weight:700;color:var(--t1);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + file.name + '</span>'
      + '<button type="button" onclick="certPreview(this)" data-key="' + key + '" data-name="' + file.name + '" style="background:none;border:none;color:var(--accent2);cursor:pointer;font-size:11px;font-weight:700;padding:0">👁 ดู</button>'
      + '</div>'
      + '<button type="button" onclick="certRemoveFile(this)" style="font-family:var(--sans);font-size:10px;font-weight:700;color:var(--t3);background:none;border:1px solid var(--bd);border-radius:6px;padding:4px 8px;cursor:pointer">✕ ลบไฟล์</button>';
  };
  reader.readAsDataURL(file);
}

function certRemoveFile(btn) {
  var row = btn.closest('div[style*="flex-direction"]');
  if (!row) return;
  delete _certFileStore[row.dataset.fileKey];
  row.dataset.fileKey  = '';
  row.dataset.fileName = '';
  var r2 = row.children[1];
  var uid = 'certfile_' + Date.now();
  r2.innerHTML = '<label for="' + uid + '" style="display:flex;align-items:center;gap:6px;cursor:pointer;font-family:var(--sans);font-size:11px;font-weight:700;color:var(--accent2);background:rgba(30,181,168,.06);border:1px dashed rgba(30,181,168,.25);border-radius:7px;padding:5px 12px">'
    + '📎 แนบไฟล์ Certificate<span style="font-size:10px;color:var(--t3);font-weight:400">(PDF, PNG, JPG)</span></label>'
    + '<input type="file" id="' + uid + '" accept=".pdf,.png,.jpg,.jpeg,.webp" style="display:none" onchange="certFileSelected(this)" />';
}

function certPreview(btn) {
  var key  = btn.dataset.key;
  var name = btn.dataset.name;
  var data = _certFileStore[key];
  if (!data) { showToast('⚠ ไม่พบไฟล์ในเซสชันนี้'); return; }
  openQuotePreviewModal(key, name);
  // Ensure data is in _quoteStore for reuse
  if (!_quoteStore[key]) _quoteStore[key] = data;
}

function getCerts(mode) {
  var list = document.getElementById(mode + '-cert-list');
  if (!list) return [];
  var result = [];
  Array.from(list.children).forEach(function(row) {
    var inputs = row.querySelectorAll('input[type="text"], input[type="date"]');
    var name = inputs[0] ? inputs[0].value.trim() : '';
    var exp  = inputs[1] ? inputs[1].value : '';
    var fk   = row.dataset.fileKey  || null;
    var fn   = row.dataset.fileName || null;
    var fb   = (fk && _certFileStore[fk]) ? _certFileStore[fk] : null;
    if (name) result.push({ name: name, expiry: exp || null, fileKey: fk, fileName: fn, fileBase64: fb });
  });
  return result;
}

function renderCertRows(mode, certs) {
  var list = document.getElementById(mode + '-cert-list');
  if (!list) return;
  list.innerHTML = '';
  (certs || []).forEach(function(c) {
    // Restore base64 into _certFileStore if available
    if (c.fileKey && c.fileBase64 && !_certFileStore[c.fileKey]) {
      _certFileStore[c.fileKey] = c.fileBase64;
    }
    list.appendChild(_buildCertRow(c.name, c.expiry, c.fileKey, c.fileName));
  });
}

// Preview cert from personnel card — restore base64 then open modal
function certCardPreview(key, name) {
  // Restore from team data if not in _certFileStore
  if (!_certFileStore[key]) {
    TEAM.forEach(function(m) {
      (m.certificates||[]).forEach(function(c) {
        if (c.fileKey === key && c.fileBase64) {
          _certFileStore[key] = c.fileBase64;
          if (!_quoteStore[key]) _quoteStore[key] = c.fileBase64;
        }
      });
    });
  }
  if (_certFileStore[key]) {
    if (!_quoteStore[key]) _quoteStore[key] = _certFileStore[key];
    openQuotePreviewModal(key, name);
  } else {
    showToast('⚠ ไม่พบไฟล์ในเซสชันนี้');
  }
}

function renderTeam() {
  return `
    <div class="sh">
      <div class="sh-title">👥 Personnel <span style="font-size:12px;font-weight:400;color:var(--t3);margin-left:6px">${TEAM.length} คน</span></div>
      <button class="btn btn-primary btn-sm" onclick="openAddEmployee()">＋ เพิ่มพนักงาน</button>
    </div>
    <div class="three-col" id="team-grid">${renderTeamCards()}</div>`;
}

function renderTeamCards() {
  const roleIcon  = {'Super Admin':'👑', Admin:'💼', Specialist:'⚡', Consultant:'💼', 'Head Consultant':'👑'};
  const roleColor = {'Super Admin':'var(--gold)', Admin:'var(--accent3)', Specialist:'var(--green)', Consultant:'var(--accent3)', 'Head Consultant':'var(--gold)'};

  // KPI helpers
  const KPI_COLORS = ['#f75f5f','#f78c3f','#f5c842','#a8d44a','#2ecc8f'];
  const KPI_LABELS = ['ต่ำมาก','ต่ำ','ปานกลาง','ดี','ดีเยี่ยม'];
  const KPI_FACES  = ['😞','😐','😑','😊','😄'];

  function kpiColor(score) {
    // score 0-100 → interpolate through 5 stops
    const idx = Math.min(4, Math.floor(score / 20));
    return KPI_COLORS[idx];
  }
  function kpiLabel(score) {
    const idx = Math.min(4, Math.floor(score / 20));
    return `${KPI_FACES[idx]} ${KPI_LABELS[idx]}`;
  }
  function kpiBar(score) {
    // 5 equal segments with gradient, thumb marker at score position
    const pct = Math.min(100, Math.max(0, score));
    return `
      <div style="position:relative;margin-top:4px">
        <!-- gradient track -->
        <div style="height:10px;border-radius:6px;background:linear-gradient(to right,#f75f5f 0%,#f78c3f 25%,#f5c842 50%,#a8d44a 75%,#2ecc8f 100%);overflow:visible;position:relative">
          <!-- thumb -->
          <div style="position:absolute;top:50%;left:${pct}%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:5px;background:white;box-shadow:0 2px 8px rgba(0,0,0,.1);border:2px solid ${kpiColor(pct)};transition:left .4s ease;z-index:2"></div>
        </div>
        <!-- tick labels -->
        <div style="display:flex;justify-content:space-between;margin-top:5px">
          ${KPI_COLORS.map((_,i)=>`<span style="font-size:9px;color:var(--t3)">${i*25}</span>`).join('')}
          <span style="font-size:9px;color:var(--t3)">100</span>
        </div>
      </div>`;
  }

  return TEAM.map((m,i)=>{
    const kpi   = m.tickets ? Math.round(m.done/m.tickets*100) : 0;
    const color = roleColor[m.role] || 'var(--accent3)';
    const icon  = roleIcon[m.role]  || '💼';
    return `<div class="card" style="position:relative">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--s3);border:2px solid ${color};display:flex;align-items:center;justify-content:center;font-size:20px">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:800">${m.name}</div>
          ${m.nickname ? `<div style="font-size:12px;color:var(--t2);font-weight:600;margin-top:1px">"${m.nickname}"</div>` : ''}
          <div style="font-size:11px;color:${color};margin-top:2px">${m.role}</div>
        </div>
        <div style="display:flex;gap:2px;align-items:center">
          <button onclick="editEmployee(${i})" title="แก้ไขข้อมูล"
            style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:13px;padding:4px 6px;border-radius:5px;transition:color .15s"
            onmouseover="this.style.color='var(--accent3)'" onmouseout="this.style.color='var(--t3)'">✏️</button>
          <button onclick="removeEmployee(${i})" title="ลบพนักงาน"
            style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:4px 6px;border-radius:5px;transition:color .15s"
            onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--t3)'">✕</button>
        </div>
      </div>
      <div class="info-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="info-item"><div class="il">Clients</div><div class="iv">${m.clients}</div></div>
        <div class="info-item"><div class="il">Tickets</div><div class="iv">${m.tickets}</div></div>
        <div class="info-item"><div class="il">Access</div><div class="iv" style="color:var(--accent3)">${m.access}</div></div>
      </div>
      <div style="border-top:1px solid var(--bd);margin:12px 0 10px"></div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:14px">
        <div style="font-size:11px;color:var(--t2);display:flex;gap:8px;align-items:center">
          <span style="color:var(--t3);min-width:14px">✉</span>${m.email||'—'}
        </div>
        <div style="font-size:11px;color:var(--t2);display:flex;gap:8px;align-items:center">
          <span style="color:var(--t3);min-width:14px">📞</span>${m.tel||'—'}
        </div>
        <div style="font-size:11px;color:var(--t2);display:flex;gap:8px;align-items:center">
          <span style="color:var(--t3);min-width:14px">📅</span>
          <span>เริ่มงาน ${m.start ? fmtDateFull(m.start) : '—'}</span>
          ${m.start ? `<span style="color:var(--t3)">·</span><span style="color:var(--gold);font-weight:600">${calcTenure(m.start)}</span>` : ''}
        </div>
      </div>
      <!-- Certificates -->
      ${(m.certificates && m.certificates.length > 0) ? (() => {
        const today = new Date(); today.setHours(0,0,0,0);
        return '<div style="margin-bottom:12px">'
          + '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--t3);margin-bottom:6px">🏅 Certificates</div>'
          + '<div style="display:flex;flex-direction:column;gap:4px">'
          + m.certificates.map(c => {
              const exp = c.expiry ? new Date(c.expiry) : null;
              const daysLeft = exp ? Math.round((exp - today) / 86400000) : null;
              const expired = daysLeft !== null && daysLeft < 0;
              const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
              const color = expired ? 'var(--red)' : expiringSoon ? 'var(--gold)' : 'var(--green)';
              const badge = expired ? '❌ หมดอายุแล้ว' : expiringSoon ? '⚠️ ใกล้หมด '+daysLeft+'วัน' : daysLeft !== null ? '✓ อีก '+daysLeft+'วัน' : '✓ ไม่มีวันหมดอายุ';
              return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--s3);border-radius:6px;font-size:11px">'
                + '<span style="color:var(--t1);font-weight:600">'+c.name+'</span>'
                + '<span style="color:'+color+';font-size:10px;font-weight:700">'+badge+'</span>'
                + '</div>';
            }).join('')
          + '</div></div>';
      })() : ''}

      <!-- Certificates -->
      ${(m.certificates && m.certificates.length > 0) ? (function() {
        var today = new Date(); today.setHours(0,0,0,0);
        var rows = m.certificates.map(function(c) {
          var exp = c.expiry ? new Date(c.expiry) : null;
          var dl = exp ? Math.round((exp - today) / 86400000) : null;
          var expired = dl !== null && dl < 0;
          var soon    = dl !== null && dl >= 0 && dl <= 30;
          var color   = expired ? 'var(--red)' : soon ? 'var(--gold)' : 'var(--green)';
          var badge   = expired ? '❌ หมดอายุแล้ว' : soon ? ('⚠️ ใกล้หมด '+dl+'วัน') : dl !== null ? ('✓ อีก '+dl+'วัน') : '✓ ไม่มีวันหมดอายุ';
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:var(--s3);border-radius:6px;font-size:11px;gap:6px">'
            + '<span style="color:var(--t1);font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + c.name + '</span>'
            + '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">'
            + (c.fileKey && c.fileBase64 ? '<button data-ck="' + c.fileKey + '" data-cn="' + (c.fileName||'').replace(/"/g,'') + '" onclick="certCardPreview(this.dataset.ck, this.dataset.cn)" style="background:none;border:none;color:var(--accent2);cursor:pointer;font-size:10px;font-weight:700;padding:0">📎 ดู</button>' : '')
            + '<span style="color:' + color + ';font-size:10px;font-weight:700">' + badge + '</span>'
            + '</div>'
            + '</div>';
        }).join('');
        return '<div style="margin-bottom:12px">'
          + '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--t3);margin-bottom:6px">🏅 Certificates</div>'
          + '<div style="display:flex;flex-direction:column;gap:4px">' + rows + '</div>'
          + '</div>';
      })() : ''}
      <!-- KPI Score -->
      <div style="background:var(--s2);border-radius:8px;padding:10px 12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.06em">KPI Score</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:11px;color:var(--t3)">${kpiLabel(kpi)}</span>
            <span style="font-size:16px;font-weight:800;font-family:var(--mono);color:${kpiColor(kpi)}">${kpi}</span>
          </div>
        </div>
        ${kpiBar(kpi)}
      </div>
    </div>`;
  }).join('');
}

function editEmployee(i) {
  const m = TEAM[i];
  if (!m) return;
  document.getElementById('edit-emp-idx').value      = i;
  document.getElementById('edit-emp-name').value     = m.name     || '';
  document.getElementById('edit-emp-nickname').value = m.nickname || '';
  document.getElementById('edit-emp-email').value    = m.email    || '';
  document.getElementById('edit-emp-tel').value      = m.tel      || '';
  document.getElementById('edit-emp-start').value    = m.start    || '';
  document.getElementById('edit-emp-role').value     = m.role     || 'Admin';
  document.getElementById('edit-emp-sub').textContent = `แก้ไขข้อมูลของ ${m.name} (${m.nickname || '—'})`;
  // Load certificates
  setTimeout(function() { renderCertRows('edit', m.certificates || []); }, 10);
  document.getElementById('modal-edit-employee').classList.add('show');
}

function saveEmployee() {
  const i        = parseInt(document.getElementById('edit-emp-idx').value);
  const name     = document.getElementById('edit-emp-name').value.trim();
  const nickname = document.getElementById('edit-emp-nickname').value.trim();
  const email    = document.getElementById('edit-emp-email').value.trim();
  const tel      = document.getElementById('edit-emp-tel').value.trim();
  const start    = document.getElementById('edit-emp-start').value;
  const role     = document.getElementById('edit-emp-role').value;
  if (!name || !nickname || !email || !start) { showToast('⚠ กรุณากรอกชื่อ, ชื่อเล่น, Email และวันที่เริ่มงาน'); return; }
  var certificates = getCerts('edit');
  TEAM[i] = { ...TEAM[i], name, nickname, email, tel, start, role, certificates };
  closeModal('modal-edit-employee');
  showToast(`✓ บันทึกข้อมูล ${name} แล้ว`);
  render();
}

function openAddEmployee() {
  document.getElementById('emp-start').value = new Date().toISOString().split('T')[0];
  ['emp-name','emp-nickname','emp-email','emp-tel'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('emp-role').value = 'Consultant';
  // Clear certificates
  var certList = document.getElementById('add-cert-list');
  if (certList) certList.innerHTML = '';
  document.getElementById('modal-add-employee').classList.add('show');
}

function addEmployee() {
  const name     = document.getElementById('emp-name').value.trim();
  const nickname = document.getElementById('emp-nickname').value.trim();
  const email    = document.getElementById('emp-email').value.trim();
  const tel      = document.getElementById('emp-tel').value.trim();
  const start    = document.getElementById('emp-start').value;
  const role     = document.getElementById('emp-role').value;
  if (!name || !nickname || !email || !start) { showToast('⚠ กรุณากรอกชื่อ, ชื่อเล่น, Email และวันที่เริ่มงาน'); return; }
  var certificates = getCerts('add');
  TEAM.push({ name, nickname, email, tel, start, role, certificates, icon:'💼', color:'var(--accent3)', clients:0, tickets:0, done:0, access:0 });
  closeModal('modal-add-employee');
  showToast(`✓ เพิ่ม ${name} เข้าทีมแล้ว`);
  const grid = document.getElementById('team-grid');
  if (grid) grid.innerHTML = renderTeamCards();
  const sh = document.querySelector('.sh-title');
  if (sh) sh.innerHTML = `👥 Personnel <span style="font-size:12px;font-weight:400;color:var(--t3);margin-left:6px">${TEAM.length} คน</span>`;
}

function removeEmployee(i) {
  const name = TEAM[i]?.name;
  showConfirm(`ลบ ${name} ออกจากทีม?`, `ข้อมูลของ ${name} จะถูกลบออกจากระบบถาวร`, () => {
    TEAM.splice(i, 1);
    showToast(`🗑 ลบ ${name} แล้ว`);
    render();
  });
}

