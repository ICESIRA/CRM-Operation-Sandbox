// ══════════════════════════════════════════════════════════════
// CRM Operations — projects.js
// Client list, status modal, project detail view
// ══════════════════════════════════════════════════════════════
// เก็บข้อมูลตัวอย่างไว้สำหรับ seed ครั้งแรกเท่านั้น (ต้องอยู่หลัง PROJECTS)

function renderClients() {
  const totalAccess = p => p.accesses.length;
  const totalBudget = p => p.accesses.reduce((s,a)=>s+a.budget,0);
  const fmtBaht = n => n.toLocaleString() + ' บาท';
  const fmtNum  = n => (n||0).toLocaleString();
  const activeFilter = window._projFilter || 'all';
  const ownerFilter = window._projOwnerFilter || 'all';
  const isSpecialist = _currentRole === 'Specialist';
  const myName = getCurrentMemberName();

  // Base pool: Specialist sees only their own projects
  const myProjects = isSpecialist && myName
    ? PROJECTS.filter(p => p.member === myName)
    : PROJECTS;

  let filtered = activeFilter === 'all' ? myProjects : myProjects.filter(p=>p.status===activeFilter);
  if (ownerFilter !== 'all') filtered = filtered.filter(p => p.member === ownerFilter);

  // Owner options: show all team members so filter is always visible
  const ownerOptions = TEAM;
  const isFiltered = activeFilter !== 'all' || ownerFilter !== 'all';
  const tabStyle = (key) => {
    const isOn = activeFilter === key;
    const colors = { all:'var(--accent3)', active:'var(--green)', waiting:'#1eb5a8', pause:'var(--gold)', loss:'var(--red)' };
    const c = colors[key];
    return isOn
      ? `background:${c}22;color:${c};border:1px solid ${c}66;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans)`
      : `background:var(--s2);color:var(--t3);border:1px solid var(--bd);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans)`;
  };
  const ownerTabStyle = (key) => {
    const isOn = ownerFilter === key;
    return isOn
      ? `background:rgba(30,181,168,.15);color:var(--accent);border:1px solid rgba(30,181,168,.5);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans)`
      : `background:var(--s2);color:var(--t3);border:1px solid var(--bd);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans)`;
  };

  return `
    <div class="sh">
      <div class="sh-title">🗂️ Project <span style="font-size:12px;font-weight:400;color:var(--t3);margin-left:6px">${isFiltered ? filtered.length+' / '+myProjects.length : myProjects.length} projects</span></div>
      <button class="btn btn-primary btn-sm" onclick="openAddProject()">＋ เพิ่ม Client</button>
    </div>
    <!-- Filter tabs (owner first leftmost, then status) -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
      ${!isSpecialist ? `
        <button style="${ownerTabStyle('all')}" onclick="setProjOwnerFilter('all')">👥 ทั้งหมด (${myProjects.length})</button>
        ${ownerOptions.map(t => {
          const cnt = myProjects.filter(p=>p.member===t.name).length;
          return `<button style="${ownerTabStyle(t.name)}" onclick="setProjOwnerFilter('${t.name}')">${t.icon||'👤'} ${t.nickname||t.name} (${cnt})</button>`;
        }).join('')}
        <span style="width:1px;height:18px;background:var(--bd);margin:0 4px"></span>
      ` : ''}
      <button style="${tabStyle('all')}"     onclick="setProjFilter('all')">🗂 ทั้งหมด (${myProjects.length})</button>
      <button style="${tabStyle('active')}"  onclick="setProjFilter('active')">✅ Active (${PROJECTS.filter(p=>p.status==='active').length})</button>
      <button style="${tabStyle('waiting')}" onclick="setProjFilter('waiting')">🕐 Waiting (${PROJECTS.filter(p=>p.status==='waiting').length})</button>
      <button style="${tabStyle('pause')}"   onclick="setProjFilter('pause')">⏸ Pause (${PROJECTS.filter(p=>p.status==='pause').length})</button>
      <button style="${tabStyle('loss')}"    onclick="setProjFilter('loss')">❌ Loss (${PROJECTS.filter(p=>p.status==='loss').length})</button>
    </div>
    ${isSpecialist && myName ? `<div class="alert alert-warn" style="margin-bottom:12px">🗂️ แสดงเฉพาะ Project ที่ <strong>${getMemberDisplay(myName)}</strong> รับผิดชอบ</div>` : ''}
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th>Project ID</th><th>Client Name</th><th>Project Owner</th>
        <th>Access</th><th>Budget รวม</th><th>เริ่ม</th><th>จบ</th><th>สถานะ</th>
      </tr></thead>
      <tbody>${filtered.map((p)=>{
        const i = PROJECTS.indexOf(p);
        const ps = PROJ_STATUS[p.status];
        return `<tr onclick="openProject(${i})" style="cursor:pointer">
          <td><span style="font-family:var(--mono);font-size:11px;color:var(--t3)">#${p.id}</span></td>
          <td><strong>${p.name}</strong></td>
          <td onclick="event.stopPropagation()" style="font-size:12px">
            <select onchange="updateProjOwner(${i}, this.value)"
              style="background:var(--s2);border:1px solid var(--bd);border-radius:7px;color:var(--t1);font-family:var(--sans);font-size:12px;font-weight:600;padding:4px 8px;outline:none;cursor:pointer"
              onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--bd)'">
              ${TEAM.map(t=>`<option value="${t.name}" ${p.member===t.name?'selected':''}>${t.icon||'👤'} ${t.nickname||t.name}</option>`).join('')}
            </select>
          </td>
          <td><span style="font-family:var(--mono);font-weight:700;color:var(--accent3)">${totalAccess(p)}</span></td>
          <td style="font-family:var(--mono);font-size:12px;color:var(--gold)">${p.budget > 0 ? fmtNum(p.budget) + ' บาท' : fmtBaht(totalBudget(p))}</td>
          <td style="font-size:12px;color:var(--t3)">${fmtDateFull(p.startDate)}</td>
          <td style="font-size:12px;color:var(--t3)">${fmtDateFull(p.endDate)}</td>
          <td onclick="event.stopPropagation()">
            <button onclick="openStatusModal(${i})"
              style="background:${ps.bg};color:${ps.color};border:1px solid ${ps.border};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:opacity .15s"
              onmouseover="this.style.opacity='.75'" onmouseout="this.style.opacity='1'">
              ${ps.icon} ${ps.label} <span style="font-size:9px;opacity:.7">▼</span>
            </button>
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
}

function setProjFilter(val) {
  window._projFilter = val;
  render();
}

function setProjOwnerFilter(val) {
  window._projOwnerFilter = val;
  render();
}

function updateProjOwner(i, val) {
  const p = PROJECTS[i];
  const prev = p.member;
  p.member = val;
  const today = new Date().toISOString().split('T')[0];
  p.statusLog.push({ date: today, status: p.status, reason: `เปลี่ยน Project Owner: ${prev} → ${val}` });
  showToast(`✓ เปลี่ยน Project Owner เป็น ${val} แล้ว`);
  render();
}

let _pendingStatusIdx = null;
let _pendingStatusVal = null;
let _currentProjIdx   = null;

function openStatusModal(i) {
  _pendingStatusIdx = i;
  _pendingStatusVal = null;
  const p  = PROJECTS[i];
  const ps = PROJ_STATUS[p.status];

  document.getElementById('smodal-project-name').textContent = p.name;
  document.getElementById('smodal-current').innerHTML =
    `<span style="background:${ps.bg};color:${ps.color};border:1px solid ${ps.border};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">${ps.icon} ${ps.label}</span>`;

  // highlight current
  document.querySelectorAll('.smodal-opt').forEach(btn => {
    const isActive = btn.dataset.val === p.status;
    btn.style.opacity = isActive ? '1' : '.55';
    btn.style.outline = isActive ? `2px solid ${PROJ_STATUS[btn.dataset.val].color}` : 'none';
  });

  const needReason = (v) => v === 'pause' || v === 'loss';
  document.getElementById('smodal-reason-wrap').style.display = 'none';
  document.getElementById('smodal-reason').value = '';
  document.getElementById('smodal-quote-wrap').style.display = 'none';
  _pendingQuoteStatus = null;
  clearQuoteStatus();
  document.getElementById('smodal-save').disabled = false;

  document.getElementById('overlay-status-modal').classList.add('show');
}

function selectStatusOpt(val) {
  _pendingStatusVal = val;
  document.querySelectorAll('.smodal-opt').forEach(btn => {
    const isThis = btn.dataset.val === val;
    btn.style.opacity = isThis ? '1' : '.45';
    btn.style.outline = isThis ? `2px solid ${PROJ_STATUS[val].color}` : 'none';
    btn.style.outlineOffset = '2px';
  });
  const needReason = val === 'pause' || val === 'loss';
  document.getElementById('smodal-reason-wrap').style.display = needReason ? 'block' : 'none';
  if (!needReason) document.getElementById('smodal-reason').value = '';
  const needQuote = val === 'waiting';
  document.getElementById('smodal-quote-wrap').style.display = needQuote ? 'block' : 'none';
  if (!needQuote) { _pendingQuoteStatus = null; clearQuoteStatus(); }
}

function confirmStatusChange() {
  const i   = _pendingStatusIdx;
  const val = _pendingStatusVal;
  if (i === null || !val) { showToast('⚠ กรุณาเลือกสถานะ'); return; }
  const p   = PROJECTS[i];
  if (val === p.status) { closeModal('overlay-status-modal'); return; }

  const needReason = val === 'pause' || val === 'loss';
  const reason = document.getElementById('smodal-reason').value.trim();
  if (needReason && !reason) { showToast('⚠ กรุณาระบุสาเหตุ'); return; }

  if (val === 'waiting' && !_pendingQuoteStatus) {
    showToast('⚠ กรุณาแนบใบเสนอราคา'); return;
  }

  p.status = val;
  const logEntry = {
    date:   new Date().toISOString().split('T')[0],
    status: val,
    reason: reason || (val === 'active' ? 'กลับมา Active' : val === 'waiting' ? 'รอการอนุมัติ' : '—')
  };
  if (val === 'waiting' && _pendingQuoteStatus) {
    logEntry.quoteFile = _pendingQuoteStatus;
  }
  p.statusLog.push(logEntry);

  closeModal('overlay-status-modal');
  _pendingQuoteStatus = null;
  showToast(`${PROJ_STATUS[val].icon} ${p.name} → ${PROJ_STATUS[val].label} บันทึกแล้ว`);
  render();
}

function openProject(i) {
  _currentProjIdx = i;
  const p = PROJECTS[i];
  const ps = PROJ_STATUS[p.status];
  const totalBudget = p.accesses.reduce((s,a)=>s+a.budget,0);
  const fmtBaht = n => n.toLocaleString() + ' บาท';
  const platIcon = {Facebook:'📘',Instagram:'📸',Google:'🔍',Youtube:'▶️',TikTok:'🎵',Shopee:'🛍',Lazada:'🏪',Linkedin:'💼',Line:'💬','CPAS Shopee':'🛍','CPAS Lazada':'🏪','CPAS TikTok':'🎵'};
  const statusLogColors = { active:'var(--green)', pause:'var(--gold)', loss:'var(--red)', waiting:'#1eb5a8' };
  const statusLogIcons  = { active:'✅', pause:'⏸', loss:'❌', waiting:'🕐' };

  // tenure: from startDate to today
  function calcTenureFrom(startDate) {
    const s = new Date(startDate), now = new Date();
    let y = now.getFullYear()-s.getFullYear(), m = now.getMonth()-s.getMonth(), d = now.getDate()-s.getDate();
    if(d<0){m--;d+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}
    if(m<0){y--;m+=12;}
    const parts=[];
    if(y>0)parts.push(`${y} ปี`);
    if(m>0)parts.push(`${m} เดือน`);
    if(d>0)parts.push(`${d} วัน`);
    return parts.join(' ') || 'วันนี้';
  }

  const isLoss = p.status === 'loss';

  document.getElementById('modal-project').innerHTML = `
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;font-family:var(--mono);color:var(--t3);margin-bottom:5px">#${p.id}</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:4px">${p.name}</div>
        ${p.company ? `<div style="font-size:13px;color:var(--t3);margin-bottom:8px">🏢 ${p.company}</div>` : ''}
          ${p.note ? `<div style="font-size:12px;color:var(--t2);background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:8px 12px;margin-bottom:8px;line-height:1.6">📝 ${p.note}</div>` : ''}
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span style="background:${ps.bg};color:${ps.color};border:1px solid ${ps.border};border-radius:20px;padding:3px 11px;font-size:11px;font-weight:700">${ps.icon} ${ps.label}</span>
          <span style="font-size:12px;color:var(--t3)">👤 ${getMemberDisplay(p.member)}</span>
          <span title="ระยะเวลาตั้งแต่วันแรกที่เพิ่ม Client เข้าระบบ" style="font-size:11px;background:rgba(30,181,168,.1);color:#1eb5a8;border:1px solid rgba(30,181,168,.3);border-radius:20px;padding:2px 10px;cursor:default">🕐 ${calcTenureFrom(p.createdAt || p.startDate)}</span>
          ${p.budget > 0 ? `<span style="font-size:11px;background:rgba(245,166,35,.1);color:var(--gold);border:1px solid rgba(245,166,35,.3);border-radius:20px;padding:2px 10px">💼 Budget: ${fmtBaht(p.budget)}</span>` : ''}
        </div>
      </div>
      <button onclick="closeModal('overlay-project')" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px;padding:4px;flex-shrink:0">✕</button>
    </div>

    <!-- Dates (editable) -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="info-item" style="cursor:default">
        <div class="il">📅 วันเริ่ม Project</div>
        <input type="date" value="${p.startDate}" onchange="updateProjDate(${i},'startDate',this.value)"
          style="background:none;border:none;color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;cursor:pointer;outline:none;padding:0;margin-top:2px"
          title="คลิกเพื่อแก้ไข" />
      </div>
      <div class="info-item" style="cursor:default">
        <div class="il">🏁 วันสิ้นสุด Project</div>
        <input type="date" value="${p.endDate}" onchange="updateProjDate(${i},'endDate',this.value)"
          style="background:none;border:none;color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;cursor:pointer;outline:none;padding:0;margin-top:2px"
          title="คลิกเพื่อแก้ไข" />
      </div>
    </div>

    <!-- Contact Info — fully editable -->
    <div style="margin-bottom:10px;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:11px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.08em">📞 ข้อมูลติดต่อ & รายละเอียด</div>
        <button onclick="saveProjContact(${i})"
          style="background:var(--grad);border:none;color:white;border-radius:7px;padding:5px 13px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans)">
          💾 บันทึก
        </button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {id:`pci-key-${i}`,     label:'👤 Key Contact',     val: p.keyContact||'', type:'text'},
          {id:`pci-phone-${i}`,   label:'📞 Tel.',             val: p.phone||'',      type:'tel'},
          {id:`pci-pay-${i}`,     label:'💳 Payment Contact', val: p.payContact||'', type:'text'},
          {id:`pci-email-${i}`,   label:'✉️ Email',           val: p.email||'',      type:'email'},
          {id:`pci-company-${i}`, label:'🏢 Company',         val: p.company||'',    type:'text'},
          {id:`pci-page-${i}`,    label:'🔗 Page Link',       val: p.page||'',       type:'text'},
        ].map(f=>`
          <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${f.label}</div>
          <input id="${f.id}" type="${f.type}" value="${String(f.val).replace(/"/g,'&quot;')}"
              style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;outline:none;padding:2px 0"
              onfocus="this.style.borderBottomColor='var(--accent)'" onblur="this.style.borderBottomColor='var(--bd)'" />
          </div>`).join('')}
      </div>
      <!-- Note / รายละเอียดอื่นๆ editable -->
      <div style="margin-top:10px">
        <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">📝 รายละเอียดอื่นๆ</div>
        <textarea id="pci-note-${i}" rows="2"
          style="width:100%;background:var(--s3);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;color:var(--t1);font-family:var(--sans);font-size:13px;outline:none;resize:vertical;box-sizing:border-box;min-height:64px"
          placeholder="หมายเหตุ / ข้อมูลเพิ่มเติม..."
          onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--bd)'">${p.note||''}</textarea>
      </div>
    </div>

    <!-- Budget & Limit Budget — separate section -->
    <div style="margin-bottom:10px;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:14px">
      <div style="font-size:11px;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">💼 งบประมาณ</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {id:`pci-budget-${i}`, label:'💼 Budget (บาท)',        val: (p.budget||0) > 0 ? (p.budget).toLocaleString() : '',      type:'text'},
          {id:`pci-limit-${i}`,  label:'🔒 Limit Budget (บาท)',  val: (p.limitBudget||0) > 0 ? (p.limitBudget).toLocaleString() : '', type:'text'},
        ].map(f=>`
          <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
            <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${f.label}</div>
            <input id="${f.id}" type="${f.type}" value="${String(f.val).replace(/"/g,'&quot;')}"
              style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--gold);font-family:var(--mono);font-size:14px;font-weight:800;width:100%;outline:none;padding:2px 0"
              inputmode="numeric" oninput="maskComma(this)"
              onfocus="this.style.borderBottomColor='var(--gold)'" onblur="this.style.borderBottomColor='var(--bd)'" />
          </div>`).join('')}
      </div>
    </div>

    <!-- Business Info section -->
    <div style="margin-bottom:14px;background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:14px">
      <div style="font-size:11px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🏭 ข้อมูลธุรกิจ</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">🏭 Business Type</div>
          <select id="pci-biztype-${i}" style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;outline:none;padding:2px 0;-webkit-appearance:none"
            onfocus="this.style.borderBottomColor='var(--accent)'" onblur="this.style.borderBottomColor='var(--bd)'">
            <option value="">— ไม่ระบุ —</option>
            <option value="Manufacturing Business" ${p.bizType==='Manufacturing Business'?'selected':''}>🏭 Manufacturing Business (การผลิต)</option>
            <option value="Trading Business" ${p.bizType==='Trading Business'?'selected':''}>🛒 Trading Business (ซื้อ-ขาย)</option>
            <option value="Service Business" ${p.bizType==='Service Business'?'selected':''}>🤝 Service Business (บริการ)</option>
          </select>
        </div>
        <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">📊 Business Model</div>
          <select id="pci-bizmodel-${i}" style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;outline:none;padding:2px 0;-webkit-appearance:none"
            onfocus="this.style.borderBottomColor='var(--accent)'" onblur="this.style.borderBottomColor='var(--bd)'">
            <option value="">— ไม่ระบุ —</option>
            <option value="B2C" ${p.bizModel==='B2C'?'selected':''}>👤 B2C</option>
            <option value="B2B" ${p.bizModel==='B2B'?'selected':''}>🏢 B2B</option>
            <option value="B2B & B2C" ${p.bizModel==='B2B & B2C'?'selected':''}>👥 B2B & B2C</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">🗂 Business Category</div>
          <select id="pci-bizcat-${i}" style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;outline:none;padding:2px 0;-webkit-appearance:none"
            onfocus="this.style.borderBottomColor='var(--accent)'" onblur="this.style.borderBottomColor='var(--bd)'">
            <option value="">— ไม่ระบุ —</option>
            ${[
              ['อาหารและเครื่องดื่ม','🍽 อาหารและเครื่องดื่ม (Food & Beverage)'],
              ['ค้าปลีก / ค้าส่ง','🛍 ค้าปลีก / ค้าส่ง (Retail & Wholesale)'],
              ['การผลิต','🏭 การผลิต (Manufacturing)'],
              ['เทคโนโลยีและไอที','💻 เทคโนโลยีและไอที (Technology & IT)'],
              ['การเงินและธนาคาร','💳 การเงินและธนาคาร (Finance & Banking)'],
              ['การท่องเที่ยวและโรงแรม','✈️ การท่องเที่ยวและโรงแรม (Tourism & Hospitality)'],
              ['สุขภาพและการแพทย์','🏥 สุขภาพและการแพทย์ (Healthcare)'],
              ['การศึกษา','📚 การศึกษา (Education)'],
              ['การขนส่งและโลจิสติกส์','🚚 การขนส่งและโลจิสติกส์ (Transportation & Logistics)'],
              ['อสังหาริมทรัพย์','🏠 อสังหาริมทรัพย์ (Real Estate)'],
              ['บันเทิงและสื่อ','🎬 บันเทิงและสื่อ (Entertainment & Media)'],
              ['ความงามและไลฟ์สไตล์','💄 ความงามและไลฟ์สไตล์ (Beauty & Lifestyle)'],
            ].map(([v,l])=>`<option value="${v}" ${p.bizCategory===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div style="background:var(--s3);border-radius:8px;padding:9px 12px">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">📍 Business Location</div>
          <select id="pci-loc-${i}" style="background:none;border:none;border-bottom:1px solid var(--bd);color:var(--t1);font-family:var(--sans);font-size:13px;font-weight:700;width:100%;outline:none;padding:2px 0;-webkit-appearance:none"
            onfocus="this.style.borderBottomColor='var(--accent)'" onblur="this.style.borderBottomColor='var(--bd)'">
            <option value="">— ไม่ระบุ —</option>
            ${['กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี'].map(j=>`<option value="${j}" ${p.location===j?'selected':''}>${j}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Delete button (Super Admin only) -->
    ${_currentRole === 'Super Admin' ? `
    <div style="margin-bottom:12px">
      <button onclick="deleteProject(${i})"
        style="width:100%;padding:9px;border-radius:10px;border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.08);color:var(--red);font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s"
        onmouseover="this.style.background='rgba(239,68,68,.18)'" onmouseout="this.style.background='rgba(239,68,68,.08)'">
        🗑 ลบ Client นี้ออกจากระบบ
      </button>
    </div>` : ''}

    <!-- Renew button -->
    <div style="margin-bottom:16px">
      <button onclick="renewProject(${i})"
        style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(46,204,143,.4);background:${isLoss?'rgba(46,204,143,.15)':'rgba(46,204,143,.08)'};color:var(--green);font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s"
        onmouseover="this.style.background='rgba(46,204,143,.25)'" onmouseout="this.style.background='${isLoss?'rgba(46,204,143,.15)':'rgba(46,204,143,.08)'}'">
        🔄 ต่อบริการ
        ${isLoss ? '<span style="font-size:10px;background:rgba(46,204,143,.2);border-radius:10px;padding:2px 8px">แนะนำ</span>' : ''}
      </button>
    </div>

    <!-- Access & Budget -->
    <div style="margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:12px;font-weight:800;color:var(--t2);text-transform:uppercase;letter-spacing:.08em">
          🔑 Access (<span id="access-count-${i}">${p.accesses.length}</span> แพลตฟอร์ม)
        </div>
        ${p.budget > 0 ? `<span style="font-size:11px;color:var(--t3)">Budget: <strong style="color:var(--gold);font-family:var(--mono)">${fmtBaht(p.budget)}</strong></span>` : ''}
      </div>
      <div id="access-list-${i}" style="display:flex;flex-direction:column;gap:8px">
        ${p.accesses.map((a,ai)=>{
          const pct = totalBudget ? Math.round(a.budget/totalBudget*100) : 0;
          return `<div style="background:var(--s2);border-radius:8px;padding:10px 14px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:14px">${platIcon[a.platform]||'🌐'}</span>
              <span style="font-size:13px;font-weight:700;flex:1">${a.platform}</span>
              <input type="number" value="${a.budget}" min="0" step="1000"
                onchange="updateAccessBudget(${i},${ai},this.value)"
                style="background:var(--s3);border:1px solid var(--bd);border-radius:6px;color:var(--gold);font-family:var(--mono);font-size:13px;font-weight:700;padding:3px 8px;width:120px;text-align:right;outline:none"
                onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--bd)'" />
              <button onclick="removeAccess(${i},${ai})" title="ลบ Access"
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
        }).join('')}
        <!-- Inline add row -->
        <div id="add-access-row-${i}" style="background:rgba(79,142,247,.06);border:1px dashed rgba(79,142,247,.3);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px">
          <select id="new-access-plat-${i}" class="fc" style="flex:1;padding:6px 10px;font-size:12px">
            <option value="">＋ เลือก Platform</option>
            <option>Facebook</option><option>Instagram</option><option>Google</option>
            <option>Youtube</option><option>TikTok</option><option>Shopee</option>
            <option>Lazada</option><option>Linkedin</option><option>Line</option>
            <option>CPAS Shopee</option><option>CPAS Lazada</option><option>CPAS TikTok</option>
          </select>
          <input type="number" id="new-access-budget-${i}" min="0" step="1000" placeholder="งบ (บาท)"
            style="background:var(--s3);border:1px solid var(--bd);border-radius:6px;color:var(--gold);font-family:var(--mono);font-size:12px;padding:6px 8px;width:110px;text-align:right;outline:none"
            onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--bd)'" />
          <button onclick="confirmAddAccess(${i})"
            style="background:rgba(79,142,247,.2);color:var(--accent3);border:1px solid rgba(79,142,247,.4);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sans);white-space:nowrap">
            ✓ เพิ่ม
          </button>
        </div>
      </div>
      <div style="margin-top:10px;background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.3);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;font-weight:700;color:var(--gold)">💰 งบรวมทุก Access</span>
        <span id="total-budget-${i}" style="font-family:var(--mono);font-size:16px;font-weight:800;color:var(--gold)">${fmtBaht(totalBudget)}</span>
      </div>
      ${p.limitBudget > 0 ? `
      <div id="limit-wrap-${i}" style="margin-top:6px;background:${totalBudget > p.limitBudget ? 'rgba(239,68,68,.1)' : 'rgba(30,181,168,.07)'};border:1px solid ${totalBudget > p.limitBudget ? 'rgba(239,68,68,.35)' : 'rgba(30,181,168,.3)'};border-radius:8px;padding:8px 14px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;font-weight:700;color:${totalBudget > p.limitBudget ? 'var(--red)' : 'var(--t3)'}">🔒 Limit Budget</span>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-family:var(--mono);font-size:13px;font-weight:700;color:${totalBudget > p.limitBudget ? 'var(--red)' : 'var(--t2)'}">${fmtBaht(p.limitBudget)}</span>
          ${totalBudget > p.limitBudget ? `<span style="font-size:10px;background:rgba(239,68,68,.2);color:var(--red);border-radius:10px;padding:2px 8px;font-weight:700">⚠ เกิน ${fmtBaht(totalBudget-p.limitBudget)}</span>` : `<span style="font-size:10px;background:rgba(46,204,143,.15);color:var(--green);border-radius:10px;padding:2px 8px;font-weight:700">✓ ไม่เกิน Limit</span>`}
        </div>
      </div>` : ''}
    </div>

    <!-- Status History -->
    <div>
      <div style="font-size:12px;font-weight:800;color:var(--t2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">
        📋 ประวัติสถานะ
      </div>
      <div style="position:relative;padding-left:20px">
        <div style="position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:var(--bd);border-radius:1px"></div>
        ${[...p.statusLog].reverse().map((log,idx)=>{
          const c  = statusLogColors[log.status];
          const ic = statusLogIcons[log.status];
          const isFirst = idx === 0;
          return `<div style="position:relative;margin-bottom:${idx===p.statusLog.length-1?'0':'14px'}">
            <div style="position:absolute;left:-17px;top:3px;width:10px;height:10px;border-radius:50%;background:${c};border:2px solid var(--s1);box-shadow:0 0 0 2px ${c}40"></div>
            <div style="background:${isFirst?'rgba(79,142,247,.07)':'var(--s2)'};border:1px solid ${isFirst?'var(--bd2)':'var(--bd)'};border-radius:8px;padding:9px 12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${log.reason||log.quoteFile?'5px':'0'}">
                <span style="font-size:12px;font-weight:700;color:${c}">${ic} ${PROJ_STATUS[log.status].label}</span>
                <span style="font-size:11px;font-family:var(--mono);color:var(--t3)">${fmtDateFull(log.date)}</span>
              </div>
              ${log.reason ? `<div style="font-size:11px;color:var(--t2);line-height:1.5;margin-bottom:${log.quoteFile?'6px':'0'}">${log.reason}</div>` : ''}
              ${log.editor ? `<div style="font-size:10px;color:var(--t3);margin-top:2px;opacity:.7">👤 โดย ${log.editor}</div>` : ''}
              ${log.editor ? `<div style="font-size:10px;color:var(--t3);margin-top:2px;opacity:.7">👤 โดย ${log.editor}</div>` : ''}
              ${log.quoteFile ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px">
                <button onclick="openQuotePreviewModal('${log.quoteFile.dataKey}','${log.quoteFile.name.replace(/'/g,'').replace(/"/g,'')}')"
                  style="display:inline-flex;align-items:center;gap:5px;background:rgba(30,181,168,.15);border:1px solid rgba(30,181,168,.4);color:#1eb5a8;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans)">
                  👁 ดูตัวอย่าง
                </button>
                <button onclick="downloadQuoteFile('${log.quoteFile.dataKey}','${log.quoteFile.name.replace(/'/g,'').replace(/"/g,'')}')"
                  style="display:inline-flex;align-items:center;gap:5px;background:var(--grad);border:none;color:white;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans)">
                  ⬇ ${log.quoteFile.name} <span style="font-size:9px;opacity:.8">(${log.quoteFile.size})</span>
                </button>
              </div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  document.getElementById('overlay-project').classList.add('show');
}

function deleteProject(i) {
  const p = PROJECTS[i];
  if (!p) return;
  if (_currentRole !== 'Super Admin') {
    showToast('⚠ เฉพาะ Super Admin เท่านั้นที่ลบ Client ได้');
    return;
  }
  showConfirm(
    `ลบ ${p.name} ออกจากระบบ?`,
    `ข้อมูลทั้งหมดของ ${p.name} (${p.company}) จะถูกลบถาวร ไม่สามารถกู้คืนได้`,
    () => {
      const fbId = p._fbId;
      PROJECTS.splice(i, 1);
      closeModal('overlay-project');
      showToast(`🗑 ลบ ${p.name} แล้ว`);
      render();
      // Firebase delete handled by override
      if (fbId) window._deletedProjectId = fbId;
    }
  );
}

function updateProjDate(i, field, val) {
