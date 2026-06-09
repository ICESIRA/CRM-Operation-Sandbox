// ── CRM Operations — notifications.js ──
// Notifications, sounds, quick actions
// ── NOTIFICATIONS ─────────────────────────────────────────────

// ── NOTIFICATION SOUND ───────────────────────────────────────
function playNotifSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);

    if (type === 'done') {
      // ✓ Approve — cheerful two-tone ding
      o.type = 'sine';
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.45);
    } else if (type === 'overdue') {
      // ⚠ Overdue — low warning buzz
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.5);
    } else if (type === 'hold') {
      // ⏸ On Hold — soft mid-tone ping
      o.type = 'sine';
      o.frequency.setValueAtTime(440, ctx.currentTime);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.35);
    } else {
      // default — subtle tick
      o.type = 'sine';
      o.frequency.setValueAtTime(520, ctx.currentTime);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.2);
    }
  } catch(e) { /* AudioContext not supported — silent fallback */ }
}

// แจ้งเตือนเมื่อมีการฝากงาน (coSpecialist)
function pushCoSpecNotif(ticketId, client, platform, coSpecName, prevCoSpecName) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'});
  var msg = prevCoSpecName
    ? 'เปลี่ยนผู้รับฝากงาน: ' + getMemberDisplay(prevCoSpecName) + ' → ' + getMemberDisplay(coSpecName)
    : '🤝 ฝากงานให้ ' + getMemberDisplay(coSpecName) + ' แล้ว';
  _notifs.unshift({
    ticketId, client, platform,
    oldStatus: 'cospec', newStatus: 'cospec',
    msg: msg,
    time: timeStr, read: false, readRow: false
  });
  playNotifSound('default');
  renderNotifPanel();
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = '';
  const tbody = document.getElementById('tbody');
  if (tbody) tbody.innerHTML = mkRows(getVisibleTickets());
}

function pushNotif(ticketId, client, platform, oldStatus, newStatus) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'});
  _notifs.unshift({ ticketId, client, platform, oldStatus, newStatus, time: timeStr, read: false, readRow: false });
  // Play sound based on new status
  var sndType = newStatus === 'done' ? 'done'
              : newStatus === 'overdue' ? 'overdue'
              : (newStatus === 'hold' || newStatus === 'hold-approved') ? 'hold'
              : 'default';
  playNotifSound(sndType);
  renderNotifPanel();
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = '';
  // Refresh table bell icons if on tickets page
  const tbody = document.getElementById('tbody');
  if (tbody) tbody.innerHTML = mkRows(getVisibleTickets());
}

function renderNotifPanel() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (_notifs.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3);font-size:12px">ยังไม่มีการแจ้งเตือน</div>';
    return;
  }
  list.innerHTML = _notifs.map((n,idx) => `
    <div onclick="openFromNotif('${n.ticketId}',${idx})" style="padding:10px 16px;border-bottom:1px solid var(--bd);background:${n.read?'transparent':'rgba(79,142,247,.05)'};cursor:pointer;transition:background .15s"
      onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background='${n.read?'transparent':'rgba(79,142,247,.05)'}'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
        <span style="font-size:12px;font-weight:700;font-family:var(--mono);color:var(--accent3)">#${n.ticketId}</span>
        <span style="font-size:10px;color:var(--t3)">${n.time}</span>
      </div>
      <div style="font-size:12px;color:var(--t1)">${n.client} · ${n.platform}</div>
      <div style="font-size:11px;margin-top:3px">
        ${n.oldStatus === 'cospec'
          ? `<span style="color:var(--gold)">${n.msg||'🤝 ฝากงานร่วม'}</span>`
          : `<span style="color:${SFG[n.oldStatus]||'var(--t3)'}">${SI[n.oldStatus]} ${SL[n.oldStatus]}</span>`}
        <span style="color:var(--t3)"> → </span>
        <span style="color:${SFG[n.newStatus]||'var(--t3)'}">${SI[n.newStatus]} ${SL[n.newStatus]}</span>
      </div>
    </div>`).join('');
  _notifs.forEach(n => n.read = true);
}

function openFromNotif(ticketId, idx) {
  if (_notifs[idx]) _notifs[idx].readRow = true;
  document.getElementById('notif-panel').style.display = 'none';
  // Navigate to All Tickets tab if not already there
  if (currentPage !== 'head-tickets') {
    currentPage = 'head-tickets';
    document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
    const ticketNav = document.querySelector('.nav[onclick*="head-tickets"]');
    if (ticketNav) ticketNav.classList.add('active');
    document.getElementById('topbar-title').textContent = PAGE_TITLES['head-tickets'] || 'All Tickets';
    render();
  }
  setTimeout(() => openDetail(ticketId), 50);
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) { renderNotifPanel(); document.getElementById('notif-dot').style.display = 'none'; }
}

function clearNotifs() {
  _notifs.length = 0;
  renderNotifPanel();
  document.getElementById('notif-dot').style.display = 'none';
}

// Close notif panel when clicking outside
document.addEventListener('click', e => {
  const panel = document.getElementById('notif-panel');
  const btn   = document.getElementById('notif-btn');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) panel.style.display = 'none';
});

function quickStatus(id, status) {
  const t = TICKETS.find(x=>x.id===id);
  if (!t) return;
  // Admin can approve all; Specialist can only approve their own ticket
  if (status === 'done' || status === 'hold-approved') {
    if (!canApproveTicket(t)) {
      showToast('⚠ Specialist สามารถ Approve ได้เฉพาะ Ticket ที่มอบหมายให้ตัวเองเท่านั้น');
      return;
    }
  }
  if (!t.statusLog) t.statusLog = [];
  const today = new Date().toISOString().split('T')[0];
  const oldStatus = t.status;
  let finalStatus = status;
  let note = '';
  if (status === 'done' && oldStatus === 'review') {
    note = 'หัวหน้า Approve แล้ว';
    finalStatus = 'done';
  } else if (status === 'hold-approved') {
    note = 'หัวหน้า Approve On Hold';
    finalStatus = 'hold';
    t._pendingHold = false;
  }
  t.statusLog.push({ date: today, status: finalStatus, note });
  t.status = finalStatus;
  pushNotif(t.id, t.client, t.platform, oldStatus, finalStatus);
  showToast(`${SI[finalStatus]} #${id} → ${SL[finalStatus]}`);
  render();
}


