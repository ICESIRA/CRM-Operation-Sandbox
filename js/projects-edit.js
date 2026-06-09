// ── CRM Operations — projects-edit.js ──
// Add/edit project, renew, access, budget bar
// ── ADD PROJECT ───────────────────────────────────────────────
let _apAccesses = [];

function openAddProject() {
  _apAccesses = [];
  // populate member dropdown from TEAM
  const sel = document.getElementById('ap-member');
  sel.innerHTML = '<option value="">-- เลือกพนักงาน --</option>' +
    TEAM.filter(t => !t.resigned).map(t => `<option value="${t.name}">${t.icon||'👤'} ${t.nickname||t.name} — ${t.role}</option>`).join('');
  // reset all fields
  ['ap-name','ap-company','ap-budget','ap-limit-budget','ap-phone','ap-key-contact','ap-pay-contact','ap-email','ap-page','ap-note'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  // reset ap-location select
  const locEl = document.getElementById('ap-location'); if (locEl) locEl.value = '';
  const bizTypeEl = document.getElementById('ap-biz-type'); if (bizTypeEl) bizTypeEl.value = '';
  const bizCatEl  = document.getElementById('ap-biz-category'); if (bizCatEl) bizCatEl.value = '';
  const bizModEl  = document.getElementById('ap-biz-model'); if (bizModEl) bizModEl.value = '';
  // reset error states
  document.getElementById('ap-company-err').style.display = 'none';
  const emailErr = document.getElementById('ap-email-err'); if (emailErr) emailErr.style.display = 'none';
  const phoneErr = document.getElementById('ap-phone-err'); if (phoneErr) phoneErr.style.display = 'none';
  const emailInp = document.getElementById('ap-email'); if (emailInp) emailInp.style.borderColor = '';
  const phoneInp = document.getElementById('ap-phone'); if (phoneInp) phoneInp.style.borderColor = '';
  const today = new Date();
  const dd = String(today.getDate()).padStart(2,'0');
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const yyyy = today.getFullYear();
  document.getElementById('ap-start').value = `${dd}/${mm}/${yyyy}`;
  document.getElementById('ap-end').value = '';
  document.getElementById('ap-new-plat').value = '';
  document.getElementById('ap-new-budget').value = '';
  document.getElementById('ap-company-err').style.display = 'none';
  document.getElementById('ap-access-list').innerHTML = '';
  _pendingQuoteNew = null;
  const qp = document.getElementById('ap-quote-preview');
  const qz = document.getElementById('ap-quote-dropzone');
  if (qp) qp.style.display = 'none';
  if (qz) qz.style.display = 'block';
  const qf = document.getElementById('ap-quote-file');
  if (qf) qf.value = '';
  const bbw = document.getElementById('ap-budget-bar-wrap');
  if (bbw) bbw.style.display = 'none';
  document.getElementById('overlay-add-project').classList.add('show');
}

function checkCompanyDup() {
  const val = document.getElementById('ap-company').value.trim().toLowerCase();
  const err = document.getElementById('ap-company-err');
  const dup = val && PROJECTS.some(p => (p.company||'').toLowerCase() === val);
  err.style.display = dup ? 'inline' : 'none';
  return dup;
}

function apAddAccess() {
  const plat   = document.getElementById('ap-new-plat').value;
  const budget = parseInt(document.getElementById('ap-new-budget').value) || 0;
  if (!plat) { showToast('⚠ กรุณาเลือก Platform'); return; }
  _apAccesses.push({ platform: plat, budget });
  document.getElementById('ap-new-plat').value = '';
  document.getElementById('ap-new-budget').value = '';
  renderApAccessList();
  updateApBudgetBar();
}

function apRemoveAccess(idx) {
  _apAccesses.splice(idx, 1);
  renderApAccessList();
  updateApBudgetBar();
}

function renderApAccessList() {
  const platIcon = {Facebook:'📘',Instagram:'📸',Google:'🔍',Youtube:'▶️',TikTok:'🎵',Shopee:'🛍',Lazada:'🏪',Linkedin:'💼',Line:'💬','CPAS Shopee':'🛍','CPAS Lazada':'🏪','CPAS TikTok':'🎵'};
  const fmtBaht = n => n.toLocaleString() + ' บาท';
  document.getElementById('ap-access-list').innerHTML = _apAccesses.map((a,i) => `
    <div style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 12px">
      <span>${platIcon[a.platform]||'🌐'} <strong>${a.platform}</strong></span>
      <span style="flex:1"></span>
      <span style="font-family:var(--mono);color:var(--gold);font-size:12px">${fmtBaht(a.budget)}</span>
      <button onclick="apRemoveAccess(${i})" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:13px" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--t3)'">✕</button>
    </div>`).join('');
}


function confirmAddProject() {
  if (checkCompanyDup()) { showToast('⚠ ชื่อบริษัทซ้ำในระบบ ไม่สามารถเพิ่มได้'); return; }
  const name        = document.getElementById('ap-name').value.trim();
  const company     = document.getElementById('ap-company').value.trim();
  const member      = document.getElementById('ap-member').value;
  const budget      = parseInt((document.getElementById('ap-budget').value||'').replace(/,/g,'')) || 0;
  const limitBudget = parseInt((document.getElementById('ap-limit-budget').value||'').replace(/,/g,'')) || 0;
  const phone       = document.getElementById('ap-phone').value.trim();
  const startRaw    = document.getElementById('ap-start').value;
  const endRaw      = document.getElementById('ap-end').value;
  const start       = parseDMY(startRaw);
  const end         = parseDMY(endRaw);
  const emailVal    = document.getElementById('ap-email').value.trim();

  if (!name) { showToast('⚠ กรุณากรอก Client Name'); return; }

  const bizType     = document.getElementById('ap-biz-type').value;
  const bizCategory = document.getElementById('ap-biz-category').value;
  const bizModel    = document.getElementById('ap-biz-model').value;

  const newId = 'PRJ-' + String(PROJECTS.length + 1).padStart(3, '0');
  const today = new Date().toISOString().split('T')[0];

  // if no accesses but budget given, create a placeholder
  const accesses = _apAccesses.length > 0 ? _apAccesses :
    (budget > 0 ? [{ platform:'(ยังไม่ระบุ)', budget }] : []);

  PROJECTS.push({
    id: newId,
    name,
    company,
    member,
    budget,
    limitBudget,
    createdAt: today,
    startDate: start,
    endDate:   end,
    status:   'waiting',
    accesses,
    keyContact:  document.getElementById('ap-key-contact').value.trim(),
    payContact:  document.getElementById('ap-pay-contact').value.trim(),
    phone,
    email:       document.getElementById('ap-email').value.trim(),
    page:        document.getElementById('ap-page').value.trim(),
    note:        document.getElementById('ap-note').value.trim(),
    location:    document.getElementById('ap-location').value.trim(),
    bizType,
    bizCategory,
    bizModel,
    statusLog: [{ date: today, status:'waiting', reason:`เพิ่ม Client ใหม่เข้าระบบ · Project Owner: ${member}`, quoteFile: _pendingQuoteNew || null }],
  });

  closeModal('overlay-add-project');
  _pendingQuoteNew = null;
  showToast(`✓ เพิ่ม ${name} เข้าระบบแล้ว — สถานะ Waiting`);
  render();
}


function _rebuildAccessUI(projIdx) {
  const p = PROJECTS[projIdx];
  const fmtBaht = n => n.toLocaleString() + ' บาท';
  const platIcon = {Facebook:'📘',Instagram:'📸',Google:'🔍',Youtube:'▶️',TikTok:'🎵',Shopee:'🛍',Lazada:'🏪',Linkedin:'💼',Line:'💬','CPAS Shopee':'🛍','CPAS Lazada':'🏪','CPAS TikTok':'🎵'};
  const totalBudget = p.accesses.reduce((s,a)=>s+a.budget,0);
  const budgetOk = p.budget <= 0 || totalBudget === p.budget;

  const list = document.getElementById(`access-list-${projIdx}`);
  if (!list) return;

  const rows = p.accesses.map((a,ai)=>{
    const pct = totalBudget ? Math.round(a.budget/totalBudget*100) : 0;
    return `<div style="background:var(--s2);border-radius:8px;padding:10px 14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:14px">${platIcon[a.platform]||'🌐'}</span>
        <span style="font-size:13px;font-weight:700;flex:1">${a.platform}</span>
        <input type="text" inputmode="numeric" value="${a.budget.toLocaleString()}"
          onchange="updateAccessBudget(${projIdx},${ai},this.value.replace(/,/g,''))"
          oninput="maskComma(this)"
          style="background:var(--s3);border:1px solid var(--bd);border-radius:6px;color:var(--gold);font-family:var(--mono);font-size:13px;font-weight:700;padding:3px 8px;width:130px;text-align:right;outline:none"
          onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--bd)'" />
        <button onclick="removeAccess(${projIdx},${ai})" title="ลบ Access"
          style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;padding:2px 5px;border-radius:5px;flex-shrink:0"
          onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--t3)'">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:5px;background:var(--s3);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--grad);border-radius:3px"></div>
        </div>
        <span style="font-size:10px;color:var(--t3);min-width:32px;text-align:right">${pct}%</span>
      </div>
    </div>`;
  }).join('');

  const addRow = `<div style="background:rgba(79,142,247,.06);border:1px dashed rgba(79,142,247,.3);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px">
    <select id="new-access-plat-${projIdx}" class="fc" style="flex:1;padding:6px 10px;font-size:12px">
      <option value="">＋ เลือก Platform</option>
      <option>Facebook</option><option>Instagram</option><option>Google</option>
      <option>Youtube</option><option>TikTok</option><option>Shopee</option>
      <option>Lazada</option><option>Linkedin</option><option>Line</option>
      <option>CPAS Shopee</option><option>CPAS Lazada</option><option>CPAS TikTok</option>
    </select>
    <input type="text" inputmode="numeric" id="new-access-budget-${projIdx}" placeholder="งบ (บาท)"
      oninput="maskComma(this)"
      style="background:var(--s3);border:1px solid var(--bd);border-radius:6px;color:var(--gold);font-family:var(--mono);font-size:12px;padding:6px 8px;width:120px;text-align:right;outline:none"
      onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--bd)'" />
    <button onclick="confirmAddAccess(${projIdx})"
      style="background:rgba(79,142,247,.2);color:var(--accent3);border:1px solid rgba(79,142,247,.4);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sans);white-space:nowrap">
      ✓ เพิ่ม
    </button>
  </div>`;

  // Budget status bar below total
  const remaining = p.budget > 0 ? p.budget - totalBudget : 0;
  const budgetStatusHtml = p.budget > 0 ? `
    <div style="margin-top:6px;background:${budgetOk?'rgba(46,204,143,.08)':'rgba(245,158,11,.1)'};border:1px solid ${budgetOk?'rgba(46,204,143,.3)':'rgba(245,158,11,.4)'};border-radius:8px;padding:7px 14px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:${budgetOk?'var(--green)':'var(--gold)'}">
        ${budgetOk ? '✓ งบ Access ครบตาม Budget' : `⚠ ยังขาดอยู่ ${remaining.toLocaleString()} บาท`}
      </span>
      ${!budgetOk ? `<span style="font-size:10px;color:var(--red);font-weight:700">ปิดหน้านี้ไม่ได้จนกว่าจะครบ</span>` : ''}
    </div>` : '';

  list.innerHTML = rows + addRow + budgetStatusHtml;

  // Toggle close button disabled state
  const closeBtn = document.querySelector('#overlay-project .modal-close, #overlay-project button[onclick*="closeModal"]');

  const countEl = document.getElementById(`access-count-${projIdx}`);
  if (countEl) countEl.textContent = p.accesses.length;
  const totalEl = document.getElementById(`total-budget-${projIdx}`);
  if (totalEl) totalEl.textContent = fmtBaht(totalBudget);

  // Update limit budget section
  const limitWrap = document.getElementById(`limit-wrap-${projIdx}`);
  if (limitWrap && p.limitBudget > 0) {
    const over = totalBudget > p.limitBudget;
    limitWrap.style.background = over ? 'rgba(239,68,68,.1)' : 'rgba(30,181,168,.07)';
    limitWrap.style.borderColor = over ? 'rgba(239,68,68,.35)' : 'rgba(30,181,168,.3)';
    limitWrap.innerHTML = `
      <span style="font-size:12px;font-weight:700;color:${over?'var(--red)':'var(--t3)'}">🔒 Limit Budget</span>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-family:var(--mono);font-size:13px;font-weight:700;color:${over?'var(--red)':'var(--t2)'}">${fmtBaht(p.limitBudget)}</span>
        ${over ? `<span style="font-size:10px;background:rgba(239,68,68,.2);color:var(--red);border-radius:10px;padding:2px 8px;font-weight:700">⚠ เกิน ${fmtBaht(totalBudget-p.limitBudget)}</span>`
               : `<span style="font-size:10px;background:rgba(46,204,143,.15);color:var(--green);border-radius:10px;padding:2px 8px;font-weight:700">✓ ไม่เกิน Limit</span>`}
      </div>`;
  }
}

function updateAccessBudget(projIdx, accessIdx, val) {
  const n = Math.max(0, parseInt(val)||0);
  const p = PROJECTS[projIdx];
  // Tentatively set, validate
  const prevBudget = p.accesses[accessIdx].budget;
  p.accesses[accessIdx].budget = n;
  const newTotal = p.accesses.reduce((s,a)=>s+a.budget,0);
  if (p.budget > 0 && newTotal > p.budget) {
    p.accesses[accessIdx].budget = prevBudget;
    showToast(`⚠ งบรวม (${newTotal.toLocaleString()} บาท) เกิน Budget (${p.budget.toLocaleString()} บาท) — ไม่สามารถบันทึกได้`);
    _rebuildAccessUI(projIdx); return;
  }
  if (p.limitBudget > 0 && newTotal > p.limitBudget) {
    p.accesses[accessIdx].budget = prevBudget;
    showToast(`⚠ งบรวม (${newTotal.toLocaleString()} บาท) เกิน Limit Budget (${p.limitBudget.toLocaleString()} บาท) — ไม่สามารถบันทึกได้`);
    _rebuildAccessUI(projIdx); return;
  }
  _rebuildAccessUI(projIdx);
  render();
  showToast('✓ อัปเดตงบแล้ว');
}

function removeAccess(projIdx, accessIdx) {
  const p = PROJECTS[projIdx];
  if (p.accesses.length <= 1) { showToast('⚠ ต้องมีอย่างน้อย 1 Access'); return; }
  const name = p.accesses[accessIdx].platform;
  showConfirm(`ลบ ${name} ออกจาก ${p.name}?`, `Access ${name} จะถูกลบถาวร`, () => {
    p.accesses.splice(accessIdx, 1);
    _rebuildAccessUI(projIdx);
    render();
    showToast(`🗑 ลบ ${name} แล้ว`);
  });
}

function confirmAddAccess(projIdx) {
  const platform = document.getElementById(`new-access-plat-${projIdx}`).value;
  const budget   = parseInt((document.getElementById(`new-access-budget-${projIdx}`).value||'').replace(/,/g,'')) || 0;
  if (!platform) { showToast('⚠ กรุณาเลือก Platform'); return; }
  const p = PROJECTS[projIdx];
  const newTotal = p.accesses.reduce((s,a)=>s+a.budget,0) + budget;
  if (p.budget > 0 && newTotal > p.budget) {
    showToast(`⚠ งบรวม (${newTotal.toLocaleString()} บาท) จะเกิน Budget (${p.budget.toLocaleString()} บาท)`); return;
  }
  if (p.limitBudget > 0 && newTotal > p.limitBudget) {
    showToast(`⚠ งบรวม (${newTotal.toLocaleString()} บาท) จะเกิน Limit Budget (${p.limitBudget.toLocaleString()} บาท)`); return;
  }
  p.accesses.push({ platform, budget });
  document.getElementById(`new-access-plat-${projIdx}`).value = '';
  document.getElementById(`new-access-budget-${projIdx}`).value = '';
  _rebuildAccessUI(projIdx);
  render();
  showToast(`✓ เพิ่ม ${platform} แล้ว`);
}

// ── SAVE PROJECT CONTACT ──────────────────────────────────────
function saveProjContact(projIdx) {
  const p = PROJECTS[projIdx];
  const phone = document.getElementById(`pci-phone-${projIdx}`)?.value.trim() || '';
  if (!phone) { showToast('⚠ เบอร์โทรติดต่อห้ามว่าง'); return; }
  const email = document.getElementById(`pci-email-${projIdx}`)?.value.trim() || '';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠ รูปแบบ Email ไม่ถูกต้อง'); return; }

  const newBudget      = parseInt((document.getElementById(`pci-budget-${projIdx}`)?.value||'').replace(/,/g,'')) || 0;
  const newLimitBudget = parseInt((document.getElementById(`pci-limit-${projIdx}`)?.value||'').replace(/,/g,''))  || 0;
  const accessTotal    = p.accesses.reduce((s,a)=>s+a.budget,0);

  if (newBudget > 0 && accessTotal > newBudget) {
    showToast(`⚠ งบ Access (${accessTotal.toLocaleString()} บาท) เกิน Budget ใหม่ (${newBudget.toLocaleString()} บาท)`); return;
  }
  if (newLimitBudget > 0 && newBudget > newLimitBudget) {
    showToast(`⚠ Budget (${newBudget.toLocaleString()} บาท) เกิน Limit Budget (${newLimitBudget.toLocaleString()} บาท)`); return;
  }

  // Detect changes for audit log
  const today = new Date().toISOString().split('T')[0];
  const editor = getAuditUser();
  const changes = [];
  function chk(label, oldVal, newVal) {
    var o = (oldVal||'').toString().trim(); var n = (newVal||'').toString().trim();
    if (o !== n) changes.push(label + ': "' + (o||'—') + '" → "' + (n||'—') + '"');
  }
  const newKeyContact  = document.getElementById(`pci-key-${projIdx}`)?.value.trim()     || '';
  const newPayContact  = document.getElementById(`pci-pay-${projIdx}`)?.value.trim()     || '';
  const newPageVal     = document.getElementById(`pci-page-${projIdx}`)?.value.trim()    || '';
  const newCompany     = document.getElementById(`pci-company-${projIdx}`)?.value.trim() || '';
  const newLocation    = document.getElementById(`pci-loc-${projIdx}`)?.value            || '';
  const noteVal        = document.getElementById(`pci-note-${projIdx}`)?.value;
  const newNote        = noteVal !== undefined ? noteVal.trim() : (p.note||'');
  const newBizType     = document.getElementById(`pci-biztype-${projIdx}`)?.value  || '';
  const newBizModel    = document.getElementById(`pci-bizmodel-${projIdx}`)?.value || '';
  const newBizCat      = document.getElementById(`pci-bizcat-${projIdx}`)?.value   || '';

  chk('เบอร์โทร',         p.phone,       phone);
  chk('Key Contact',      p.keyContact,  newKeyContact);
  chk('Payment Contact',  p.payContact,  newPayContact);
  chk('Email',            p.email,       email);
  chk('Page Link',        p.page,        newPageVal);
  chk('Company',          p.company,     newCompany);
  chk('Location',         p.location,    newLocation);
  chk('หมายเหตุ',          p.note,        newNote);
  chk('Business Type',    p.bizType,     newBizType);
  chk('Business Model',   p.bizModel,    newBizModel);
  chk('Business Category',p.bizCategory, newBizCat);
  if (newBudget !== p.budget)           changes.push('Budget: ' + (p.budget||0).toLocaleString() + ' → ' + newBudget.toLocaleString() + ' บาท');
  if (newLimitBudget !== p.limitBudget) changes.push('Limit Budget: ' + (p.limitBudget||0).toLocaleString() + ' → ' + newLimitBudget.toLocaleString() + ' บาท');

  // Apply changes
  p.phone       = phone;
  p.keyContact  = newKeyContact || p.keyContact;
  p.payContact  = newPayContact || p.payContact;
  p.email       = email;
  p.page        = newPageVal    || p.page;
  p.company     = newCompany    || p.company;
  p.location    = newLocation   || p.location;
  p.note        = newNote;
  p.bizType     = newBizType     || p.bizType;
  p.bizModel    = newBizModel    || p.bizModel;
  p.bizCategory = newBizCat      || p.bizCategory;
  p.budget      = newBudget;
  p.limitBudget = newLimitBudget;

  // Push audit log entry if anything changed
  if (changes.length > 0) {
    if (!p.statusLog) p.statusLog = [];
    p.statusLog.push({
      date: today,
      status: p.status,
      reason: '✏️ แก้ไขข้อมูล [' + editor + ']: ' + changes.join(', ')
    });
  }

  showToast('✓ บันทึกข้อมูลแล้ว' + (changes.length > 0 ? ' (' + changes.length + ' รายการเปลี่ยนแปลง)' : ' (ไม่มีการเปลี่ยนแปลง)'));
  render();
  openProject(projIdx);
}


// ── ADD PROJECT BUDGET BAR ────────────────────────────────────
function updateApBudgetBar() {
  const budget      = parseInt((document.getElementById('ap-budget')?.value||'').replace(/,/g,'')) || 0;
  const limitBudget = parseInt((document.getElementById('ap-limit-budget')?.value||'').replace(/,/g,'')) || 0;
  const accessSum   = _apAccesses.reduce((s,a)=>s+a.budget,0);
  const wrap = document.getElementById('ap-budget-bar-wrap');
  if (!wrap) return;

  if (budget === 0 && _apAccesses.length === 0 && limitBudget === 0) { wrap.style.display='none'; return; }
  wrap.style.display = 'block';

  document.getElementById('ap-sum-display').textContent    = accessSum.toLocaleString();
  document.getElementById('ap-budget-display').textContent = budget.toLocaleString();

  // Limit budget display
  const limitWrap = document.getElementById('ap-limit-display-wrap');
  if (limitBudget > 0) {
    limitWrap.style.display = 'inline';
    document.getElementById('ap-limit-display').textContent = limitBudget.toLocaleString();
    // warn if budget exceeds limit
    document.getElementById('ap-limit-display').style.color = (budget > limitBudget) ? 'var(--red)' : 'var(--t3)';
    // Highlight the budget input field red when over limit
    var bField = document.getElementById('ap-budget');
    var lField = document.getElementById('ap-limit-budget');
    if (bField) bField.style.borderColor = (budget > limitBudget) ? 'var(--red)' : '';
    if (lField) lField.style.borderColor = (budget > limitBudget) ? 'var(--red)' : '';
    // Disable confirm button when over limit
    var confirmBtn = document.getElementById('btn-confirm-add-project');
    if (confirmBtn) {
      if (budget > limitBudget) {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.4';
        confirmBtn.style.cursor = 'not-allowed';
        confirmBtn.title = 'Budget เกิน Limit — แก้ไขก่อนบันทึก';
      } else {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '';
        confirmBtn.style.cursor = '';
        confirmBtn.title = '';
      }
    }
  } else {
    limitWrap.style.display = 'none';
    // Reset field borders and button when no limit set
    var bField2 = document.getElementById('ap-budget');
    if (bField2) bField2.style.borderColor = '';
    var lField2 = document.getElementById('ap-limit-budget');
    if (lField2) lField2.style.borderColor = '';
    var confirmBtn2 = document.getElementById('btn-confirm-add-project');
    if (confirmBtn2) { confirmBtn2.disabled = false; confirmBtn2.style.opacity = ''; confirmBtn2.style.cursor = ''; }
  }

  const pct = budget > 0 ? Math.min(Math.round(accessSum/budget*100), 100) : 0;
  const fill = document.getElementById('ap-budget-bar-fill');
  fill.style.width = pct + '%';

  const msg = document.getElementById('ap-budget-bar-msg');
  // Check limit violation first
  if (limitBudget > 0 && budget > limitBudget) {
    fill.style.background = 'var(--red)';
    msg.style.color = 'var(--red)';
    msg.textContent = `⚠ Budget เกิน Limit ${(budget-limitBudget).toLocaleString()} บาท — บันทึกไม่ได้`;
  } else if (budget === 0) {
    fill.style.background = 'var(--accent3)';
    msg.style.color = 'var(--t3)';
    msg.textContent = 'กรุณากรอก Budget รวม';
  } else if (accessSum === budget) {
    fill.style.background = 'var(--green)';
    msg.style.color = 'var(--green)';
    msg.textContent = '✓ งบแพลตฟอร์มครบถ้วน';
  } else if (accessSum > budget) {
    fill.style.background = 'var(--red)';
    msg.style.color = 'var(--red)';
    msg.textContent = `เกิน ${(accessSum-budget).toLocaleString()} บาท`;
  } else {
    fill.style.background = 'var(--gold)';
    msg.style.color = 'var(--gold)';
    msg.textContent = `ยังขาด ${(budget-accessSum).toLocaleString()} บาท`;
  }
}

// ── COMPANY AUTOCOMPLETE ──────────────────────────────────────
function showCompanySuggest(q) {
  const box = document.getElementById('ap-company-suggest');
  if (!box) return;
  if (!q || q.length < 1) { box.style.display = 'none'; return; }
  const matches = PROJECTS
    .map(p => p.company || '')
    .filter(c => c && c.toLowerCase().includes(q.toLowerCase()));
  const unique = [...new Set(matches)];
  if (!unique.length) { box.style.display = 'none'; return; }
  box.innerHTML = unique.map(c => `
    <div onclick="pickCompany('${c.replace(/'/g,"\\'")}'); hideCompanySuggest()"
      style="padding:9px 13px;cursor:pointer;font-size:13px;color:var(--t1);border-bottom:1px solid var(--bd);transition:background .1s"
      onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background=''">
      🏢 ${c}
    </div>`).join('');
  box.style.display = 'block';
}
function pickCompany(name) {
  const inp = document.getElementById('ap-company');
  if (inp) { inp.value = name; checkCompanyDup(); }
}
function hideCompanySuggest() {
  const box = document.getElementById('ap-company-suggest');
  if (box) box.style.display = 'none';
}

