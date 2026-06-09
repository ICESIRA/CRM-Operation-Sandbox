// ══════════════════════════════════════════════════════════════
// CRM Operations — tickets.js
// All Tickets page, filters, ticket detail, create ticket
// ══════════════════════════════════════════════════════════════
// ── ALL TICKETS ───────────────────────────────────────────────
function renderAllTickets() {
  const ALL_PLATFORMS = ['Facebook','Instagram','Google','Youtube','TikTok','Shopee','Lazada','Linkedin','Line','CPAS Shopee','CPAS Lazada','CPAS TikTok'];
  const isSpecialist = _currentRole === 'Specialist';
  const myName = getCurrentMemberName();

  // Always use role-aware filter
  const visibleTickets = getVisibleTickets();

  const clients = [...new Set(PROJECTS.map(p=>p.name))];
  const specialists = TEAM.filter(m=>!m.resigned).map(m=>({ name: m.name, nick: m.nickname||m.name }));

  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <select class="fc" style="width:130px" id="tf-s"   onchange="applyFilter()"><option value="">ทุก Status</option>${Object.entries(SL).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
      <select class="fc" style="width:130px" id="tf-c"   onchange="applyFilter()"><option value="">ทุก Client</option>${clients.map(c=>`<option>${c}</option>`).join('')}</select>
      <select class="fc" style="width:150px" id="tf-p"   onchange="applyFilter()"><option value="">ทุก Platform</option>${ALL_PLATFORMS.map(p=>`<option>${p}</option>`).join('')}</select>
      ${!isSpecialist ? `<select class="fc" style="width:120px" id="tf-sp" onchange="applyFilter()"><option value="">ทุก Specialist</option>${specialists.map(s=>`<option value="${s.name}">${s.nick}</option>`).join('')}</select>` : ''}
      <select class="fc" style="width:110px" id="tf-pri" onchange="applyFilter()"><option value="">ทุก Priority</option><option value="h">High</option><option value="m">Medium</option><option value="l">Low</option></select>
      <input  class="fc" style="width:150px" id="tf-q"   oninput="applyFilter()" placeholder="ค้นหา ID / Client..." />
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--t3);font-weight:600">📅 Deadline :</span>
      ${['','day','week','month'].map((v,i)=>{
        const labels = ['ทั้งหมด','วันนี้','สัปดาห์นี้','เดือนนี้'];
        return `<button id="tf-period-${v||'all'}" onclick="setPeriod('${v}')"
          style="font-size:11px;font-weight:700;font-family:var(--sans);padding:5px 12px;border-radius:20px;cursor:pointer;border:1px solid var(--bd);background:${v===''?'var(--grad)':'var(--s2)'};color:${v===''?'white':'var(--t2)'};transition:all .15s">
          ${labels[i]}</button>`;
      }).join('')}
      <span style="margin-left:auto;font-size:12px;color:var(--t3)" id="t-count">${visibleTickets.length} รายการ</span>
      <button class="btn btn-primary btn-sm" onclick="openTicketModal()">＋ Ticket ใหม่</button>
    </div>
    ${isSpecialist && myName ? `<div class="alert alert-warn" style="margin-bottom:12px">⚡ แสดงเฉพาะ Ticket ที่มอบหมายให้ <strong>${getMemberDisplay(myName)}</strong></div>` : ''}
    <div class="tbl-wrap"><table>
      <thead><tr><th></th><th>Ticket</th><th>Client</th><th>Platform</th><th>ประเภท</th><th>Specialist</th><th>สถานะ</th><th>Deadline</th><th>เหลือ</th><th>Action</th></tr></thead>
      <tbody id="tbody">${mkRows(visibleTickets)}</tbody>
    </table></div>`;
}

function mkRows(list) {
  return list.map(t=>{
    const hasNotif = _notifs.some(n=>n.ticketId===t.id && !n.readRow);
    const wasOverdue = t.status !== 'overdue' && t.statusLog && t.statusLog.some(l=>l.status==='overdue');
    const isPendingHold = t._pendingHold && t.status === 'hold';
    return `<tr onclick="openDetail('${t.id}')">
    <td>${mkPri(t.priority)}</td>
    <td>
      <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
        <span style="font-family:var(--mono);color:var(--accent3)">#${t.id}</span>
        ${hasNotif?`<span style="font-size:10px">🔔</span>`:''}
        ${wasOverdue?`<span style="font-size:9px;background:rgba(247,95,95,.2);color:var(--red);border-radius:4px;padding:1px 5px;font-weight:700">⚠OD</span>`:''}
      </div>
    </td>
    <td>${t.client}</td><td><span class="ptag">${t.platform}</span></td>
    <td style="font-size:12px;color:var(--t2)">${t.type}</td>
    <td style="font-size:12px">
      ${getMemberDisplay(t.specialist)||'—'}
      ${t.coSpecialist ? `<span style="font-size:10px;color:var(--gold);display:block">🤝 ${getMemberDisplay(t.coSpecialist)}</span>` : ''}
    </td>
    <td>
      ${mkBadge(t.status)}
      ${isPendingHold?`<div style="font-size:9px;color:var(--gold);margin-top:2px;font-weight:700">รอ Approve</div>`:''}
    </td>
    <td style="font-size:12px;color:var(--t3)">${fmtDate(t.deadline)}</td>
    <td>${mkDays(t.deadline)}</td>
    <td onclick="event.stopPropagation()">
      ${(t.status==='review' && canApproveTicket(t)) ? `<button class="btn btn-gold btn-sm" onclick="quickStatus('${t.id}','done')">✓ Approve</button>` : (t.status==='review' && !canApproveTicket(t) ? `<span style="font-size:10px;color:var(--t3)">รอ Admin</span>` : '')}
      ${(isPendingHold && canApproveTicket(t)) ? `<button class="btn btn-gold btn-sm" onclick="quickStatus('${t.id}','hold-approved')">✓ Approve Hold</button>` : (isPendingHold && !canApproveTicket(t) ? `<span style="font-size:10px;color:var(--t3)">รอ Admin</span>` : '')}
      <button class="btn btn-ghost btn-sm" onclick="openDetail('${t.id}')">ดู</button>
    </td>
  </tr>`;}).join('');
}

let _period = '';

function setPeriod(v) {
  _period = v;
  // Update button styles
  ['all','day','week','month'].forEach(k => {
    const btn = document.getElementById('tf-period-' + k);
    if (!btn) return;
    const active = (v === '' ? k === 'all' : k === v);
    btn.style.background = active ? 'var(--grad)' : 'var(--s2)';
    btn.style.color = active ? 'white' : 'var(--t2)';
  });
  applyFilter();
}

function applyFilter() {
  const isSpecialist = _currentRole === 'Specialist';
  const myName = getCurrentMemberName();

  const s  = document.getElementById('tf-s')?.value || '';
  const c  = document.getElementById('tf-c')?.value || '';
  const p  = document.getElementById('tf-p')?.value || '';
  // Specialist: always force filter to own name; Admin: use dropdown
  // Specialist: filter to own name (specialist OR coSpecialist); Admin: use dropdown
  const sp = isSpecialist && myName ? myName : (document.getElementById('tf-sp')?.value || '');
  const pr = document.getElementById('tf-pri')?.value || '';
  const q  = (document.getElementById('tf-q')?.value || '').toLowerCase();

  const now   = new Date(); now.setHours(0,0,0,0);
  const day1  = new Date(now);
  const week0 = new Date(now); week0.setDate(now.getDate() - now.getDay() + 1);
  const week1 = new Date(week0); week1.setDate(week0.getDate() + 6);
  const mon0  = new Date(now.getFullYear(), now.getMonth(), 1);
  const mon1  = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Always start from role-filtered tickets, never raw TICKETS
  const baseTickets = getVisibleTickets();

  const r = baseTickets.filter(t => {
    if (s  && t.status !== s) return false;
    if (c  && t.client !== c) return false;
    if (p  && t.platform !== p) return false;
    // Admin/Super Admin: allow dropdown filter by specialist name
    if (!isSpecialist && sp && (t.specialist||'') !== sp) return false;
    if (pr && t.priority !== pr) return false;
    if (q  && !t.id.toLowerCase().includes(q) && !t.client.toLowerCase().includes(q) && !t.platform.toLowerCase().includes(q)) return false;
    if (_period && t.deadline) {
      const dl = new Date(t.deadline); dl.setHours(0,0,0,0);
      if (_period === 'day'   && dl.getTime() !== day1.getTime()) return false;
      if (_period === 'week'  && (dl < week0 || dl > week1))      return false;
      if (_period === 'month' && (dl < mon0  || dl > mon1))       return false;
    }
    return true;
  });

  document.getElementById('tbody').innerHTML = mkRows(r);
  document.getElementById('t-count').textContent = r.length + ' รายการ';
}


// ── TICKET DETAIL ─────────────────────────────────────────────
function openDetail(id) {
  const t = TICKETS.find(x=>x.id===id);
  if (!t) return;
  if (!t.statusLog) t.statusLog = [];
  // Mark notifications for this ticket as row-read
  _notifs.forEach(n => { if (n.ticketId === id) n.readRow = true; });
  const tbody = document.getElementById('tbody');
  if (tbody) tbody.innerHTML = mkRows(getVisibleTickets());
  document.getElementById('detail-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">
      <div>
        <div style="font-size:12px;font-family:var(--mono);color:var(--accent3);margin-bottom:6px">#${t.id}</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:6px">${t.type} — ${t.platform}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge ${SC[t.status]}">${SI[t.status]} ${SL[t.status]}</span>
          ${mkPri(t.priority)} <span style="font-size:12px;color:var(--t3)">${PL[t.priority]} Priority</span>
        </div>
      </div>
      <button onclick="closeModal('modal-detail')" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px">✕</button>
    </div>

    <div class="info-grid">
      <div class="info-item"><div class="il">Client</div><div class="iv">${t.client}</div></div>
      <div class="info-item"><div class="il">Platform</div><div class="iv">${t.platform}</div></div>
      <div class="info-item"><div class="il">Specialist</div><div class="iv">${getMemberDisplay(t.specialist)||'ยังไม่มอบหมาย'}
          ${t.coSpecialist ? `<span style="font-size:10px;color:var(--gold);display:block;margin-top:2px">🤝 ${getMemberDisplay(t.coSpecialist)}</span>` : ''}</div></div>
      <div class="info-item"><div class="il">Deadline</div><div class="iv">${fmtDate(t.deadline)} ${mkDays(t.deadline)}</div></div>
      <div class="info-item"><div class="il">สร้างเมื่อ</div><div class="iv">${fmtDate(t.created)}</div></div>
    </div>

    <div style="background:var(--s2);border-radius:8px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">รายละเอียด</div>
      <div style="font-size:13px;line-height:1.6">${t.desc}</div>
    </div>

    <div style="margin-bottom:16px">
      <label class="fl" style="margin-bottom:10px">อัปเดตสถานะ</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px" id="pills">
        ${(()=>{
          // Allowed next statuses per current status
          const FLOW = {
            todo:    ['inprog'],
            inprog:  ['hold','review'],
            hold:    ['inprog'],
            review:  [],           // done only via Approve — no self-select
            done:    [],
            overdue: ['review'],
          };
          const allowed = FLOW[t.status] || [];
          // Build pills: current (active, not clickable) + allowed (clickable) + rest (dimmed)
          return Object.keys(SL).map(s => {
            const isCurrent = s === t.status;
            const isAllowed = allowed.includes(s);
            const isDone    = s === 'done';
            if (isCurrent) {
              return `<span class="status-pill active-pill" data-s="${s}"
                style="background:${SBG[s]};color:${SFG[s]};border-color:${SFG[s]};outline:2px solid ${SFG[s]};outline-offset:1px;cursor:default">
                ${SI[s]} ${SL[s]} ●</span>`;
            }
            if (isDone) {
              // Allow if canApproveTicket (Admin or Specialist approving own ticket in review)
              if (t.status === 'review' && canApproveTicket(t)) {
                return `<span class="status-pill" data-s="${s}" onclick="selectPill(this)"
                  style="background:${SBG[s]};color:${SFG[s]};border-color:${SFG[s]};cursor:pointer">
                  ${SI[s]} ${SL[s]} ✓</span>`;
              }
              return `<span class="status-pill" data-s="${s}" title="ปรับได้โดยหัวหน้า Approve เท่านั้น"
                style="background:rgba(46,204,143,.06);color:rgba(46,204,143,.3);border-color:rgba(46,204,143,.2);cursor:not-allowed;opacity:.5">
                ${SI[s]} ${SL[s]} 🔒</span>`;
            }
            if (isAllowed) {
              return `<span class="status-pill" data-s="${s}" onclick="selectPill(this)"
                style="background:${SBG[s]};color:${SFG[s]};border-color:${SFG[s]};cursor:pointer">
                ${SI[s]} ${SL[s]}</span>`;
            }
            return `<span class="status-pill" data-s="${s}" title="ไม่สามารถข้ามขั้นตอนได้"
              style="background:rgba(100,100,120,.1);color:rgba(150,150,170,.4);border-color:rgba(150,150,170,.2);cursor:not-allowed;opacity:.45">
              ${SI[s]} ${SL[s]}</span>`;
          }).join('');
        })()}
      </div>
      ${t.status === 'review' ? (canApproveTicket(t) ? `<div style="margin-top:8px;font-size:11px;color:var(--green);background:rgba(46,204,143,.1);border:1px solid rgba(46,204,143,.3);border-radius:6px;padding:6px 10px">✓ คุณสามารถ Approve งานนี้ได้ — เลือก Done แล้วกดบันทึก</div>` : `<div style="margin-top:8px;font-size:11px;color:var(--gold);background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.3);border-radius:6px;padding:6px 10px">⏳ รอหัวหน้า Approve — กด Approve ในตารางเพื่อเปลี่ยนเป็น Done อัตโนมัติ</div>`) : ''}
      ${t.status === 'done' ? `<div style="margin-top:8px;font-size:11px;color:var(--green);background:rgba(46,204,143,.1);border:1px solid rgba(46,204,143,.3);border-radius:6px;padding:6px 10px">✓ งานเสร็จสิ้นแล้ว — ไม่สามารถเปลี่ยนสถานะได้อีก</div>` : ''}
    </div>

    <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:180px">
        <label class="fl" style="margin-bottom:6px">มอบหมาย Specialist</label>
        <select class="fc" id="d-spec">
          <option value="">-- ยังไม่มอบหมาย --</option>
          ${TEAM.filter(m=>!m.resigned||m.name===t.specialist).map(m=>`<option value="${m.name}"${t.specialist===m.name?' selected':''}>${m.icon||'👤'} ${m.nickname||m.name}${m.resigned?' (ออกแล้ว)':''}</option>`).join('')}
        </select>
      </div>
      <div style="flex:1;min-width:180px">
        <label class="fl" style="margin-bottom:6px">🤝 ฝากงานร่วม <span style="color:var(--t3);font-weight:400">(ไม่บังคับ)</span></label>
        <select class="fc" id="d-cospec">
          <option value="">-- ไม่มี --</option>
          ${TEAM.filter(m=>!m.resigned||m.name===t.coSpecialist).map(m=>`<option value="${m.name}"${t.coSpecialist===m.name?' selected':''}>${m.icon||'👤'} ${m.nickname||m.name}${m.resigned?' (ออกแล้ว)':''}</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="margin-bottom:16px">
      <label class="fl">Comment</label>
      <textarea class="fc" rows="2" id="d-comment" placeholder="เพิ่ม comment..."></textarea>
    </div>


    ${t.statusLog.length > 0 ? `
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin-bottom:10px">📋 ประวัติการเปลี่ยนแปลง</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[...t.statusLog].reverse().map(log=>`
          <div style="background:var(--s2);border-radius:8px;padding:8px 12px;display:flex;align-items:flex-start;gap:10px">
            <span style="font-size:14px;flex-shrink:0">${SI[log.status]||'📝'}</span>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700;color:${SFG[log.status]||'var(--t1)'}">${SL[log.status]||log.status}</div>
              ${log.note ? `<div style="font-size:11px;color:var(--t3);margin-top:2px">${log.note}</div>` : ''}
              ${log.editor ? `<div style="font-size:10px;color:var(--t3);margin-top:2px;opacity:.7">👤 โดย ${log.editor}</div>` : ''}
            </div>
            <span style="font-size:10px;color:var(--t3);white-space:nowrap">${fmtDate(log.date)}</span>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid var(--bd)">
      ${canApprove() ? '<button class="btn btn-danger btn-sm" onclick="deleteTicket(\''+t.id+'\')">🗑 ลบ</button>' : ''}
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" onclick="closeModal('modal-detail')">ปิด</button>
        <button class="btn btn-primary" onclick="saveDetail('${t.id}')">💾 บันทึก</button>
      </div>
    </div>`;
  document.getElementById('modal-detail').classList.add('show');
}

function selectPill(el) {
  document.querySelectorAll('#pills .status-pill').forEach(p => { p.classList.remove('active-pill'); p.style.outline=''; });

  el.classList.add('active-pill');
  el.style.outline = '2px solid ' + el.style.color;
  el.style.outlineOffset = '1px';
  // Show required hint on comment if On Hold selected
  const commentLabel = document.querySelector('label.fl[for="d-comment"], label.fl + #d-comment')?.previousElementSibling;
  const commentEl = document.getElementById('d-comment');
  if (commentEl) {
    const isHold = el.dataset.s === 'hold';
    commentEl.placeholder = isHold ? 'ระบุสาเหตุที่ Hold (บังคับกรอก) ...' : 'เพิ่ม comment...';
    commentEl.style.borderColor = isHold ? 'var(--gold)' : '';
  }
}

function saveDetail(id) {
  const t = TICKETS.find(x=>x.id===id);
  if (!t) return;
  if (!t.statusLog) t.statusLog = [];
  const p    = document.querySelector('#pills .active-pill');
  const newStatus = p ? p.dataset.s : t.status;
  const comment   = (document.getElementById('d-comment')?.value || '').trim();

  // Validate flow
  const FLOW = { todo:['inprog'], inprog:['hold','review'], hold:['inprog'], review:[], done:[], overdue:['review'] };
  if (newStatus !== t.status) {
    if (newStatus === 'done' && !canApproveTicket(t)) { showToast('⚠ ไม่สามารถ Approve งานของคนอื่นได้'); return; }
    const allowed = FLOW[t.status] || [];
    if (!allowed.includes(newStatus)) { showToast(`⚠ ไม่สามารถข้ามจาก "${SL[t.status]}" ไป "${SL[newStatus]}" ได้`); return; }
  }
  if (newStatus === 'hold' && !comment) {
    showToast('⚠ กรุณาระบุ Comment เมื่อปรับสถานะเป็น On Hold');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const oldStatus = t.status;

  // hold requires approve — store as pending, show in table as inprog with hold-pending flag
  if (newStatus === 'hold') {
    t.statusLog.push({ date: today, status: 'hold', note: comment, pendingApprove: true, editor: getAuditUser() });
    t._pendingHold = true;
    t.status = 'hold';
    pushNotif(t.id, t.client, t.platform, oldStatus, 'hold');
  } else {
    if (newStatus !== oldStatus || comment) {
      t.statusLog.push({ date: today, status: newStatus, note: comment || null, editor: getAuditUser() });
    }
    if (newStatus !== oldStatus) pushNotif(t.id, t.client, t.platform, oldStatus, newStatus);
    t.status = newStatus;
    t._pendingHold = false;
  }

  const sp  = document.getElementById('d-spec');
  if (sp) {
    const prevSpec = t.specialist || null;
    const newSpec  = sp.value || null;
    if (newSpec !== prevSpec) {
      t.specialist = newSpec;
      t.statusLog.push({ date: today, status: t.status,
        note: '👤 เปลี่ยน Specialist: ' + (getMemberDisplay(prevSpec)||'ไม่มี') + ' → ' + (getMemberDisplay(newSpec)||'ไม่มี'), editor: getAuditUser()
      });
    } else {
      t.specialist = newSpec;
    }
  }
  const cosp = document.getElementById('d-cospec');
  if (cosp) {
    const prevCoSpec = t.coSpecialist || null;
    const newCoSpec  = cosp.value || null;
    if (newCoSpec !== prevCoSpec) {
      t.coSpecialist = newCoSpec;
      // บันทึก statusLog ทุกครั้งที่มีการเปลี่ยน coSpecialist
      if (newCoSpec) {
        t.statusLog.push({ date: today, status: t.status, note: '🤝 ฝากงานให้ ' + getMemberDisplay(newCoSpec) });
        pushCoSpecNotif(t.id, t.client, t.platform, newCoSpec, prevCoSpec);
      } else if (prevCoSpec) {
        t.statusLog.push({ date: today, status: t.status, note: '🤝 ยกเลิกการฝากงาน (เดิม: ' + getMemberDisplay(prevCoSpec) + ')' });
      }
    } else {
      t.coSpecialist = newCoSpec;
    }
  }

  closeModal('modal-detail');
  showToast(newStatus === 'hold' ? `⏸ #${id} → On Hold (รอ Approve)` : `✓ อัปเดต #${id} แล้ว`);
  render();
}

function deleteTicket(id) {
  showConfirm(`ลบ Ticket #${id}?`, `Ticket #${id} จะถูกลบถาวร`, () => {
    const i = TICKETS.findIndex(t=>t.id===id);
    if (i>-1) TICKETS.splice(i,1);
    closeModal('modal-detail');
    showToast(`🗑 ลบ #${id} แล้ว`);
    render();
  });
}

// ── CREATE TICKET ─────────────────────────────────────────────
function openTicketModal() {
  const d = new Date(); d.setDate(d.getDate()+7);
  document.getElementById('tm-deadline').value = d.toISOString().split('T')[0];

  // Populate clients — only Active projects; Specialist sees only their own
  const clientSel = document.getElementById('tm-client');
  const myNameForClient = getCurrentMemberName();
  const activeProjects = PROJECTS.filter(p => {
    if (p.status !== 'active') return false;
    if (_currentRole === 'Specialist' && myNameForClient) {
      return p.member === myNameForClient;
    }
    return true;
  });
  clientSel.innerHTML = '<option value="">-- เลือก Client (Active เท่านั้น) --</option>' +
    activeProjects.map(p => `<option value="${p.name}">${p.name} (${p.company})</option>`).join('');
  document.getElementById('tm-platform').innerHTML = '<option value="">-- เลือก Client ก่อน --</option>';

  // Populate specialist from TEAM (exclude resigned)
  const specOpts = '<option value="">-- ยังไม่มอบหมาย --</option>' +
    TEAM.filter(t => !t.resigned).map(t => `<option value="${t.name}">${t.icon||'👤'} ${t.nickname||t.name}</option>`).join('');
  document.getElementById('tm-specialist').innerHTML = specOpts;
  document.getElementById('tm-cospec').innerHTML = '<option value="">-- ไม่มี --</option>' +
    TEAM.filter(t => !t.resigned).map(t => `<option value="${t.name}">${t.icon||'👤'} ${t.nickname||t.name}</option>`).join('');

  document.getElementById('modal-create').classList.add('show');
}

function onTicketClientChange(clientName) {
  const platSel = document.getElementById('tm-platform');
  const specSel = document.getElementById('tm-specialist');
  if (!clientName) {
    platSel.innerHTML = '<option value="">-- เลือก Client ก่อน --</option>';
    specSel.value = '';
    return;
  }
  const proj = PROJECTS.find(p => p.name === clientName);
  if (!proj || !proj.accesses || proj.accesses.length === 0) {
    platSel.innerHTML = '<option value="">-- ไม่มี Platform --</option>';
  } else {
    platSel.innerHTML = '<option value="">-- เลือก Platform --</option>' +
      proj.accesses.map(a => `<option value="${a.platform}">${a.platform}</option>`).join('');
  }
  // Auto-select Project Owner as specialist
  if (proj && proj.member) specSel.value = proj.member;
}

function createTicket() {
  const client   = document.getElementById('tm-client').value;
  const platform = document.getElementById('tm-platform').value;
  const type     = document.getElementById('tm-type').value;
  if (!client||!platform||!type) { showToast('⚠ กรุณากรอกข้อมูลที่จำเป็น'); return; }
  // Guard: project must be Active
  const proj = PROJECTS.find(p => p.name === client);
  if (proj && proj.status !== 'active') {
    showToast(`⚠ ${client} ไม่ได้อยู่ในสถานะ Active — ไม่สามารถเพิ่ม Ticket ได้`);
    return;
  }
  const cospec = document.getElementById('tm-cospec')?.value || null;
  TICKETS.unshift({
    id:genTicketId(), client, platform, type,
    desc:         document.getElementById('tm-desc').value || type,
    priority:     document.getElementById('tm-priority').value,
    status:       'todo',
    specialist:   document.getElementById('tm-specialist').value || null,
    coSpecialist: cospec || null,
    deadline:     document.getElementById('tm-deadline').value,
    created:      new Date().toISOString().split('T')[0],
    statusLog:    [{ date: new Date().toISOString().split('T')[0], status: 'todo', note: 'สร้าง Ticket ใหม่' }]
  });
  closeModal('modal-create');
  ['tm-client','tm-platform','tm-type','tm-desc','tm-specialist','tm-cospec'].forEach(id => document.getElementById(id).value='');
  document.getElementById('tm-priority').value = 'm';
  showToast('✓ สร้าง Ticket ใหม่แล้ว');
  // แจ้งเตือนฝากงานถ้ามี coSpecialist ตั้งแต่แรก
  const _newT = TICKETS[0];
  if (_newT && _newT.coSpecialist) {
    pushCoSpecNotif(_newT.id, _newT.client, _newT.platform, _newT.coSpecialist, null);
    _newT.statusLog.push({ date: _newT.created, status: 'todo', note: '🤝 ฝากงานให้ ' + getMemberDisplay(_newT.coSpecialist) });
  }
  render();
}
