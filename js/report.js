// ══════════════════════════════════════════════════════════════
// CRM Operations — report.js
// Report page rendering
// ══════════════════════════════════════════════════════════════
// ── REPORT ────────────────────────────────────────────────────
function renderReport() {
  const n = TICKETS.length;
  const done = TICKETS.filter(t=>t.status==='done').length;
  const ov   = TICKETS.filter(t=>t.status==='overdue').length;
  const plat = TICKETS.reduce((a,t)=>{a[t.platform]=(a[t.platform]||0)+1;return a},{});
  const type = TICKETS.reduce((a,t)=>{a[t.type]=(a[t.type]||0)+1;return a},{});
  const bar  = (v,clr) => `<div class="pbar" style="width:100px"><div class="pfill" style="width:${Math.round(v/n*100)}%;background:${clr}"></div></div>`;

  return `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card c-green"><div class="stat-lbl">Completion Rate</div><div class="stat-val" style="color:var(--green)">${Math.round(done/n*100)}%</div><div class="stat-sub">${done}/${n} tickets</div></div>
      <div class="stat-card c-gold"><div class="stat-lbl">Budget รวม</div><div class="stat-val" style="color:var(--gold)">1.24M บาท</div><div class="stat-sub">ทุก Client</div></div>
      <div class="stat-card c-red"><div class="stat-lbl">Overdue Rate</div><div class="stat-val" style="color:var(--red)">${Math.round(ov/n*100)}%</div><div class="stat-sub">ต้องปรับปรุง</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-title">📊 Platform Distribution</div>
        ${Object.entries(plat).sort((a,b)=>b[1]-a[1]).map(([p,v])=>`
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="flex:1;font-size:13px">${p}</span>${bar(v,'var(--accent3)')}
            <span style="font-family:var(--mono);font-size:12px;min-width:16px;text-align:right">${v}</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">🎯 Task Type</div>
        ${Object.entries(type).sort((a,b)=>b[1]-a[1]).map(([tp,v])=>`
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="flex:1;font-size:13px">${tp}</span>${bar(v,'var(--accent)')}
            <span style="font-family:var(--mono);font-size:12px;min-width:16px;text-align:right">${v}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

