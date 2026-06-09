// ══════════════════════════════════════════════════════════════
// CRM Operations — ui.js
// Modal management, toast, confirm, global search
// ══════════════════════════════════════════════════════════════
// ── CONFIRM ───────────────────────────────────────────────────
function showConfirm(title, msg, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-ok').onclick = () => { cb(); closeModal('modal-confirm'); };
  document.getElementById('modal-confirm').classList.add('show');
}

// ── UTILITIES ─────────────────────────────────────────────────
function closeModal(id) {
  if (id === 'overlay-project' && typeof _currentProjIdx === 'number') {
    const p = PROJECTS[_currentProjIdx];
    if (p && p.budget > 0) {
      const accessTotal = p.accesses.reduce((s,a)=>s+a.budget,0);
      if (accessTotal !== p.budget) {
        showToast(`⚠ งบ Access (${accessTotal.toLocaleString()} บาท) ยังไม่ครบ Budget (${p.budget.toLocaleString()} บาท) — ปรับให้ครบก่อนปิด`);
        return;
      }
    }
    _currentProjIdx = null;
  }
  document.getElementById(id).classList.remove('show');
}

function globalSearch(q) {
  if (!q.trim()) return;
  const found = TICKETS.filter(t => t.id.toLowerCase().includes(q.toLowerCase()) || t.client.toLowerCase().includes(q.toLowerCase()));
  if (found.length === 1) openDetail(found[0].id);
}

function showToast(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--s1);border:1px solid var(--bd2);border-radius:10px;padding:12px 18px;font-size:13px;font-family:var(--sans);color:var(--t1);box-shadow:0 8px 30px rgba(0,0,0,.1);animation:fadeUp .2s ease;max-width:360px;line-height:1.5';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}
