// ══════════════════════════════════════════════════════════════
// CRM Operations — dashboard.js
// Dashboard rendering with all sections
// ══════════════════════════════════════════════════════════════
// ── DASHBOARD ─────────────────────────────────────────────────
function renderDashboard() {
  var isSpec = _currentRole === 'Specialist';
  var myName = getCurrentMemberName();
  var today  = new Date().toISOString().split('T')[0];

  /* ── Helpers ── */
  function pct(a, b) { return b === 0 ? 0 : Math.round(a / b * 100); }
  function statCard(label, val, color, sub) {
    return '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">'
      + '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + color + '"></div>'
      + '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">' + label + '</div>'
      + '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + color + '">' + val + '</div>'
      + (sub ? '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + sub + '</div>' : '')
      + '</div>';
  }
  function miniBar(w, color) {
    return '<div style="flex:1;height:5px;background:var(--s3);border-radius:3px;overflow:hidden">'
      + '<div style="height:100%;width:' + Math.max(2, w) + '%;background:' + color + ';border-radius:3px"></div></div>';
  }

  /* ── Tickets per person ── */
  function ticketsOf(name) {
    return TICKETS.filter(function(t){ return t.specialist === name || t.coSpecialist === name; });
  }
  function workloadColor(active) {
    if (active >= 8) return '#ef4444';
    if (active >= 5) return '#f59e0b';
    return '#10b981';
  }

  var out = '';

  /* ═══════════════════════ SPECIALIST VIEW ═══════════════════════ */
  if (isSpec) {
    var myTickets = ticketsOf(myName);
    var total    = myTickets.length;
    var done     = myTickets.filter(function(t){ return t.status === 'done'; }).length;
    var inprog   = myTickets.filter(function(t){ return t.status === 'inprog'; }).length;
    var overdue  = myTickets.filter(function(t){ return t.status === 'overdue'; }).length;
    var review   = myTickets.filter(function(t){ return t.status === 'review'; }).length;
    var hold     = myTickets.filter(function(t){ return t.status === 'hold'; }).length;
    var todo     = myTickets.filter(function(t){ return t.status === 'todo'; }).length;
    var dueToday = myTickets.filter(function(t){ return t.deadline === today && t.status !== 'done'; }).length;
    var completionRate = pct(done, total);
    var onTimeCount = myTickets.filter(function(t){
      if (t.status !== 'done') return false;
      var dl = (t.statusLog||[]).slice().reverse().find(function(l){ return l.status === 'done'; });
      return dl && t.deadline && dl.date <= t.deadline;
    }).length;
    var onTimeRate   = pct(onTimeCount, done);
    var overdueRate  = pct(overdue, total);

    out += '<div class="sh" style="margin-bottom:8px"><div class="sh-title">📊 Dashboard</div>';
    out += '<div style="font-size:12px;color:var(--t3)">⚡ ' + getMemberDisplay(myName) + '</div></div>';

    out += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">';
    out += statCard('Ticket ของฉัน', total, 'var(--accent3)', 'ทุกสถานะ');
    out += statCard('In Progress', inprog, '#1eb5a8', 'กำลังทำอยู่');
    out += statCard('Completion', completionRate + '%', completionRate >= 85 ? '#10b981' : completionRate >= 70 ? '#f59e0b' : '#ef4444', done + ' done จาก ' + total);
    out += statCard('On-Time', onTimeRate + '%', onTimeRate >= 90 ? '#10b981' : '#f59e0b', 'ส่งงานทันเวลา');
    out += '</div>';

    out += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
    // Status bars
    out += '<div class="card"><div class="card-title" style="margin-bottom:12px">📊 สถานะงานของฉัน</div>';
    [[  '📋','To Do',todo,'#8b92b8'],['⚡','In Progress',inprog,'#1eb5a8'],['⏸','On Hold',hold,'#7c3aed'],
      ['👁','Review',review,'#f59e0b'],['✓','Done',done,'#10b981'],['⚠','Overdue',overdue,'#ef4444']
    ].forEach(function(s) {
      out += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
      out += '<div style="font-size:11px;color:var(--t2);width:80px">' + s[0] + ' ' + s[1] + '</div>';
      out += miniBar(total > 0 ? s[2]/total*100 : 0, s[3]);
      out += '<div style="font-size:12px;font-weight:700;font-family:var(--mono);color:' + s[3] + ';width:24px;text-align:right">' + s[2] + '</div>';
      out += '</div>';
    });
    out += '</div>';
    // Personal KPI
    out += '<div class="card"><div class="card-title" style="margin-bottom:12px">🏆 KPI ของฉัน</div>';
    [[completionRate+'%','Completion Rate','(≥85% ดี)',completionRate>=85?'#10b981':completionRate>=70?'#f59e0b':'#ef4444'],
     [onTimeRate+'%','On-Time Rate','(≥90% ดี)',onTimeRate>=90?'#10b981':'#f59e0b'],
     [overdueRate+'%','Overdue Rate','(<5% ดี)',overdueRate<5?'#10b981':overdueRate<15?'#f59e0b':'#ef4444']
    ].forEach(function(k) {
      out += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd)">';
      out += '<div><div style="font-size:12px;font-weight:700;color:var(--t1)">' + k[1] + '</div>';
      out += '<div style="font-size:10px;color:var(--t3)">' + k[2] + '</div></div>';
      out += '<span style="font-size:18px;font-weight:800;font-family:var(--mono);color:' + k[3] + '">' + k[0] + '</span></div>';
    });
    if (dueToday > 0) {
      out += '<div style="margin-top:10px;padding:8px 10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:11px;color:var(--red);font-weight:700">⚠️ ครบกำหนดวันนี้ ' + dueToday + ' งาน</div>';
    }
    out += '</div></div>';

    // Recent tickets
    var recent = myTickets.slice(0, 5);
    if (recent.length > 0) {
      out += '<div class="card"><div class="card-title" style="margin-bottom:10px">🎫 Ticket ล่าสุด</div>';
      out += '<table style="width:100%;border-collapse:collapse;font-size:12px"><tbody>';
      recent.forEach(function(t) {
        out += '<tr onclick="openDetail(\'' + t.id + '\')" style="cursor:pointer;border-bottom:1px solid var(--bd)">';
        out += '<td style="padding:8px 10px;font-family:var(--mono);color:var(--accent3)">#' + t.id + '</td>';
        out += '<td style="padding:8px 10px;font-weight:600">' + t.client + '</td>';
        out += '<td style="padding:8px 10px;color:var(--t3)">' + t.platform + '</td>';
        out += '<td style="padding:8px 10px"><span class="badge ' + SC[t.status] + '">' + SI[t.status] + ' ' + SL[t.status] + '</span></td>';
        out += '<td style="padding:8px 10px;color:var(--t3)">' + fmtDate(t.deadline) + '</td>';
        out += '</tr>';
      });
      out += '</tbody></table></div>';
    }
    return out;
  }

  /* ═══════════════════════ ADMIN / SUPER ADMIN VIEW ══════════════════════ */

  var viewMode = window._dashView || 'team';
  var memberList = TEAM.filter(function(m){ return !m.resigned && m.role !== 'Super Admin' && (m.role === 'Specialist' || m.role === 'Admin'); });
  var showMembers = viewMode === 'team' ? memberList : memberList.filter(function(m){ return m.name === viewMode; });

  // ── SAMPLE DATA ถูกลบออกแล้ว — ใช้ข้อมูลจริงจาก Firestore เท่านั้น ──
  var D_PROJ = PROJECTS;
  var D_TICK = TICKETS;
  var D_TEAM = memberList;
  var usingDemo = false;

  function dTicketsOf(name) {
    return D_TICK.filter(function(t){ return t.specialist === name || t.coSpecialist === name; });
  }

  // ── Period filter ─────────────────────────────────────────
  var dashPeriod = window._dashPeriod || 'all';
  var _now2 = new Date(); _now2.setHours(0,0,0,0);
  var _week0 = new Date(_now2); _week0.setDate(_now2.getDate() - _now2.getDay() + 1);
  var _week1 = new Date(_week0); _week1.setDate(_week0.getDate() + 6);
  var _mon0  = new Date(_now2.getFullYear(), _now2.getMonth(), 1);
  var _mon1  = new Date(_now2.getFullYear(), _now2.getMonth() + 1, 0);
  function inPeriod(t) {
    if (dashPeriod === 'all') return true;
    var d = t.created || t.deadline; if (!d) return false;
    var dt = new Date(d); dt.setHours(0,0,0,0);
    if (dashPeriod === 'today') return dt.getTime() === _now2.getTime();
    if (dashPeriod === 'week')  return dt >= _week0 && dt <= _week1;
    if (dashPeriod === 'month') return dt >= _mon0  && dt <= _mon1;
    return true;
  }

  // ── Computed data ─────────────────────────────────────────
  var dShowMembers = viewMode === 'team' ? D_TEAM : D_TEAM.filter(function(m){ return m.name === viewMode; });
  var rawTickets   = viewMode === 'team' ? D_TICK : dTicketsOf(viewMode);
  var viewTickets  = rawTickets.filter(inPeriod);
  var viewProjects = viewMode === 'team' ? D_PROJ : D_PROJ.filter(function(p){ return p.member === viewMode; });

  // GRP1 - Clients
  var totalClients   = viewProjects.length;
  var activeClients  = viewProjects.filter(function(p){ return p.status === 'active'; }).length;
  var waitingClients = viewProjects.filter(function(p){ return p.status === 'waiting'; }).length;
  var pauseClients   = viewProjects.filter(function(p){ return p.status === 'pause'; }).length;
  var lossClients    = viewProjects.filter(function(p){ return p.status === 'loss'; }).length;
  var totalBudgetAll = viewProjects.filter(function(p){ return p.status !== 'loss'; }).reduce(function(s,p){
    return s + ((p.accesses||[]).reduce(function(a,x){ return a+(x.budget||0); },0) || p.budget || 0);
  }, 0);
  var lossBudget = viewProjects.filter(function(p){ return p.status === 'loss'; }).reduce(function(s,p){
    return s + ((p.accesses||[]).reduce(function(a,x){ return a+(x.budget||0); },0) || p.budget || 0);
  }, 0);

  // GRP3 - Tickets
  var vtotal   = viewTickets.length;
  var vtodo    = viewTickets.filter(function(t){ return t.status === 'todo'; }).length;
  var vinprog  = viewTickets.filter(function(t){ return t.status === 'inprog'; }).length;
  var vhold    = viewTickets.filter(function(t){ return t.status === 'hold'; }).length;
  var vreview  = viewTickets.filter(function(t){ return t.status === 'review'; }).length;
  var vdone    = viewTickets.filter(function(t){ return t.status === 'done'; }).length;
  var voverdue = viewTickets.filter(function(t){ return t.status === 'overdue'; }).length;

  // GRP2 - Biz breakdown (non-loss projects)
  var activeRows = viewProjects.filter(function(p){ return p.status !== 'loss'; });
  var totalActiveBudget = totalBudgetAll;
  var btMap = {}; var bmMap = {}; var bcMap = {}; var locMap = {};
  activeRows.forEach(function(p) {
    var b = (p.accesses||[]).reduce(function(s,a){ return s+(a.budget||0); },0) || p.budget || 0;
    var bt = p.bizType || 'ไม่ระบุ'; btMap[bt] = (btMap[bt]||0) + 1;
    var bm = p.bizModel || 'ไม่ระบุ'; bmMap[bm] = (bmMap[bm]||0) + 1;
    var bc = p.bizCategory || 'ไม่ระบุ'; bcMap[bc] = (bcMap[bc]||0) + 1;
    var lo = p.location || 'ไม่ระบุ'; locMap[lo] = (locMap[lo]||0) + 1;
  });

  // GRP4 - Top clients by ticket count
  var clientTickMap = {};
  D_TICK.forEach(function(t){ clientTickMap[t.client] = (clientTickMap[t.client]||0) + 1; });
  var top10Clients = Object.entries(clientTickMap).sort(function(a,b){ return b[1]-a[1]; }).slice(0,10);

  // GRP4 - Media per personnel
  var specPlatMap = {};
  D_PROJ.filter(function(p){ return p.status !== 'loss'; }).forEach(function(p) {
    var sp = p.member || '—';
    if (!specPlatMap[sp]) specPlatMap[sp] = {};
    (p.accesses||[]).forEach(function(a) {
      specPlatMap[sp][a.platform] = (specPlatMap[sp][a.platform]||0) + 1;
    });
  });

  // Performance
  var PIE_COLORS = ['#1eb5a8','#10b981','#f59e0b','#5b8def','#7c3aed','#ef4444','#2dd4a0','#fb923c','#818cf8','#34d399'];
  var PLAT_COLORS = { Facebook:'#1877f2', Instagram:'#e1306c', Google:'#4285f4', Youtube:'#ff0000', TikTok:'#000000', Shopee:'#ee4d2d', Lazada:'#0f146b', Linkedin:'#0a66c2', Line:'#00c300', 'CPAS Shopee':'#ee4d2d', 'CPAS Lazada':'#0f146b', 'CPAS TikTok':'#69c9d0' };

  function sectionHeader(icon, title, sub) {
    return '<div style="display:flex;align-items:baseline;gap:10px;margin:24px 0 12px">'
      + '<div style="font-size:15px;font-weight:800;color:var(--t1)">' + icon + ' ' + title + '</div>'
      + (sub ? '<div style="font-size:11px;color:var(--t3)">' + sub + '</div>' : '')
      + '<div style="flex:1;height:1px;background:var(--bd);margin-left:8px"></div></div>';
  }

  function statCard2(label, val, color, sub, icon) {
    return '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">'
      + '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + color + '"></div>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      + '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em">' + label + '</div>'
      + (icon ? '<div style="font-size:16px">' + icon + '</div>' : '')
      + '</div>'
      + '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + color + '">' + val + '</div>'
      + (sub ? '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + sub + '</div>' : '')
      + '</div>';
  }

  function barRow(label, val, total, color, extra) {
    var w = total > 0 ? Math.max(2, val/total*100) : 0;
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      + '<div style="font-size:12px;color:var(--t2);width:90px;flex-shrink:0">' + label + '</div>'
      + '<div style="flex:1;height:8px;background:var(--s3);border-radius:4px;overflow:hidden">'
      + '<div style="height:100%;width:' + w + '%;background:' + color + ';border-radius:4px;transition:width .5s"></div></div>'
      + '<div style="font-size:12px;font-weight:800;font-family:var(--mono);color:' + color + ';width:28px;text-align:right">' + val + '</div>'
      + (extra ? '<div style="font-size:10px;color:var(--t3);width:30px">' + extra + '</div>' : '')
      + '</div>';
  }

  function catBar(label, count, total, color) {
    var w = total > 0 ? Math.max(2, count/total*100) : 0;
    return '<div style="margin-bottom:8px">'
      + '<div style="display:flex;justify-content:space-between;margin-bottom:3px">'
      + '<span style="font-size:12px;color:var(--t1);font-weight:600">' + label + '</span>'
      + '<span style="font-size:11px;font-family:var(--mono);color:' + color + ';font-weight:800">' + count + '</span>'
      + '</div>'
      + '<div style="height:6px;background:var(--s3);border-radius:3px;overflow:hidden">'
      + '<div style="height:100%;width:' + w + '%;background:' + color + ';border-radius:3px"></div>'
      + '</div></div>';
  }

  // ══ HEADER ══════════════════════════════════════════════════
  out += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  out += '<div><div style="font-size:17px;font-weight:800;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">📊 Dashboard</div>';
  if (usingDemo) out += '<div style="font-size:11px;color:var(--gold);margin-top:2px">⚠ ข้อมูลตัวอย่าง — เพิ่ม Project และ Ticket จริงเพื่อดูข้อมูลจริง</div>';
  out += '</div>';
  out += '<div style="display:flex;gap:6px">';
  [{k:'all',l:'ทั้งหมด'},{k:'month',l:'เดือนนี้'},{k:'week',l:'สัปดาห์นี้'},{k:'today',l:'วันนี้'}].forEach(function(o){
    var a = dashPeriod===o.k;
    out += '<button data-p="' + o.k + '" onclick="setDashPeriod(this.dataset.p)" style="font-family:var(--sans);font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;border:1.5px solid '+(a?'var(--accent)':'var(--bd)')+';background:'+(a?'var(--grad)':'var(--s2)')+';color:'+(a?'white':'var(--t2)')+';transition:all .15s">' + o.l + '</button>';
  });
  out += '</div></div>';

  // ── View selector ─────────────────────────────────────────
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:10px 14px;margin-bottom:22px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
  out += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t3);margin-right:4px">ดูของ:</div>';
  var tA = viewMode === 'team';
  out += '<button onclick="setDashView(\'team\')" style="font-family:var(--sans);font-size:12px;font-weight:700;padding:6px 14px;border-radius:8px;cursor:pointer;border:2px solid '+(tA?'var(--accent)':'var(--bd)')+';background:'+(tA?'var(--grad)':'var(--s2)')+';color:'+(tA?'white':'var(--t2)')+';transition:all .15s">👥 ทีมรวม</button>';
  D_TEAM.forEach(function(m) {
    var a2 = viewMode===m.name;
    var mOv = D_TICK.filter(function(t){ return (t.specialist===m.name||t.coSpecialist===m.name) && t.status==='overdue'; }).length;
    out += '<button onclick="setDashView(\'' + m.name + '\')" style="font-family:var(--sans);font-size:12px;font-weight:700;padding:6px 14px;border-radius:8px;cursor:pointer;border:2px solid '+(a2?'var(--accent)':'var(--bd)')+';background:'+(a2?'var(--grad)':'var(--s2)')+';color:'+(a2?'white':'var(--t2)')+';transition:all .15s">'
      + (m.nickname||m.name) + (mOv>0?' <span style="color:#ef4444;font-size:10px">⚠'+mOv+'</span>':'')
      + '</button>';
  });
  out += '</div>';

  // ══════════════════════════════════════════════════════════
  // GROUP 1 — CLIENT OVERVIEW
  // ══════════════════════════════════════════════════════════
  out += sectionHeader('👥', 'Client Overview', totalClients + ' clients ทั้งหมด');

  out += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:20px">';
  out += statCard2('ทั้งหมด',   totalClients,  'var(--accent3)', '', '📋');
  out += statCard2('Active',    activeClients,  '#10b981', Math.round(activeClients/Math.max(1,totalClients)*100)+'% ของทั้งหมด', '✅');
  out += statCard2('Waiting',   waitingClients, '#1eb5a8', 'รอเปิดงาน', '🕐');
  out += statCard2('Pause',     pauseClients,   '#f59e0b', 'หยุดชั่วคราว', '⏸');
  out += statCard2('Loss',      lossClients,    '#ef4444', 'สูญเสียลูกค้า', '❌');
  out += statCard2('Budget รวม', (totalBudgetAll/1000).toFixed(0)+'K', '#f59e0b', totalBudgetAll.toLocaleString()+' ฿', '💰');
  out += statCard2('Loss Budget', (lossBudget/1000).toFixed(0)+'K', '#ef4444', lossBudget.toLocaleString()+' ฿', '📉');
  out += '</div>';

  // ══════════════════════════════════════════════════════════
  // GROUP 2 — BUSINESS BREAKDOWN
  // ══════════════════════════════════════════════════════════
  out += sectionHeader('🏷️', 'Business Breakdown', 'เฉพาะ Non-Loss clients');

  var totalActive = activeRows.length;
  out += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">';

  // Biz Type
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px">';
  out += '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">📦 Business Type</div>';
  Object.entries(btMap).sort(function(a,b){return b[1]-a[1];}).forEach(function(e,i){ out += catBar(e[0], e[1], totalActive, PIE_COLORS[i%PIE_COLORS.length]); });
  if (!Object.keys(btMap).length) out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:12px">ไม่มีข้อมูล</div>';
  out += '</div>';

  // Biz Model
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px">';
  out += '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🔄 Business Model</div>';
  Object.entries(bmMap).sort(function(a,b){return b[1]-a[1];}).forEach(function(e,i){ out += catBar(e[0], e[1], totalActive, PIE_COLORS[i%PIE_COLORS.length]); });
  if (!Object.keys(bmMap).length) out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:12px">ไม่มีข้อมูล</div>';
  out += '</div>';

  // Biz Category
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px">';
  out += '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">🏷️ Business Category</div>';
  Object.entries(bcMap).sort(function(a,b){return b[1]-a[1];}).forEach(function(e,i){ out += catBar(e[0], e[1], totalActive, PIE_COLORS[i%PIE_COLORS.length]); });
  if (!Object.keys(bcMap).length) out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:12px">ไม่มีข้อมูล</div>';
  out += '</div>';

  // Location
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px">';
  out += '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">📍 Business Location</div>';
  Object.entries(locMap).sort(function(a,b){return b[1]-a[1];}).slice(0,8).forEach(function(e,i){ out += catBar(e[0], e[1], totalActive, PIE_COLORS[i%PIE_COLORS.length]); });
  if (!Object.keys(locMap).length) out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:12px">ไม่มีข้อมูล</div>';
  out += '</div>';
  out += '</div>';

  // ══════════════════════════════════════════════════════════
  // GROUP 3 — TICKETS
  // ══════════════════════════════════════════════════════════
  out += sectionHeader('🎫', 'Tickets', vtotal + ' tickets รวม');

  out += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-bottom:12px">';
  out += statCard2('ทั้งหมด',     vtotal,   'var(--accent3)', '', '🎫');
  out += statCard2('To Do',       vtodo,    '#8b92b8', 'รอเริ่ม', '📋');
  out += statCard2('In Progress', vinprog,  '#1eb5a8', 'กำลังทำ', '⚡');
  out += statCard2('On Hold',     vhold,    '#7c3aed', 'หยุดรอ', '⏸');
  out += statCard2('Review',      vreview,  '#f59e0b', 'รอตรวจ', '👁');
  out += statCard2('Done',        vdone,    '#10b981', pct(vdone,vtotal)+'% completion', '✅');
  out += statCard2('Overdue',     voverdue, voverdue>0?'#ef4444':'#10b981', pct(voverdue,vtotal)+'% ของทั้งหมด', '⚠️');
  out += '</div>';

  // Status bar chart
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;margin-bottom:20px">';
  out += '<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">สัดส่วนสถานะ Ticket</div>';
  out += '<div style="display:flex;gap:4px;height:28px;border-radius:6px;overflow:hidden;margin-bottom:10px">';
  [
    [vtodo,'#8b92b8'],[vinprog,'#1eb5a8'],[vhold,'#7c3aed'],
    [vreview,'#f59e0b'],[vdone,'#10b981'],[voverdue,'#ef4444']
  ].forEach(function(x) {
    var w = vtotal > 0 ? x[0]/vtotal*100 : 0;
    if (w > 0) out += '<div style="flex:' + w + ';background:' + x[1] + ';transition:flex .5s" title="' + x[0] + '"></div>';
  });
  out += '</div>';
  out += '<div style="display:flex;gap:16px;flex-wrap:wrap">';
  [['📋 To Do',vtodo,'#8b92b8'],['⚡ In Progress',vinprog,'#1eb5a8'],['⏸ On Hold',vhold,'#7c3aed'],
   ['👁 Review',vreview,'#f59e0b'],['✅ Done',vdone,'#10b981'],['⚠️ Overdue',voverdue,'#ef4444']
  ].forEach(function(s){
    out += '<div style="display:flex;align-items:center;gap:5px">';
    out += '<div style="width:8px;height:8px;border-radius:50%;background:'+s[2]+';flex-shrink:0"></div>';
    out += '<span style="font-size:11px;color:var(--t2)">' + s[0] + '</span>';
    out += '<span style="font-size:12px;font-weight:800;font-family:var(--mono);color:'+s[2]+'">' + s[1] + '</span>';
    out += '</div>';
  });
  out += '</div></div>';

  // ══════════════════════════════════════════════════════════
  // GROUP 4 — RANKINGS
  // ══════════════════════════════════════════════════════════
  out += sectionHeader('🏆', 'Rankings', 'Top Clients · Media per Personnel');
  out += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';

  // Top 10 Clients by tickets
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px">';
  out += '<div style="font-size:12px;font-weight:800;color:var(--t1);margin-bottom:14px">🥇 Client for Ticket — Top 10</div>';
  var maxTick = top10Clients.length > 0 ? top10Clients[0][1] : 1;
  top10Clients.forEach(function(e, i) {
    var rankColors = ['#f59e0b','#9ca3af','#cd7c2f'];
    var rank = i < 3 ? ['🥇','🥈','🥉'][i] : (i+1)+'.';
    var barW = Math.max(4, e[1]/maxTick*100);
    out += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    out += '<div style="font-size:12px;width:24px;text-align:center;flex-shrink:0">' + rank + '</div>';
    out += '<div style="flex:1;min-width:0">';
    out += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">';
    out += '<span style="font-size:12px;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">' + e[0] + '</span>';
    out += '<span style="font-size:11px;font-weight:800;font-family:var(--mono);color:var(--accent3)">' + e[1] + ' tickets</span>';
    out += '</div>';
    out += '<div style="height:5px;background:var(--s3);border-radius:3px;overflow:hidden">';
    out += '<div style="height:100%;width:' + barW + '%;background:' + (i<3?rankColors[i]:'var(--accent)') + ';border-radius:3px"></div>';
    out += '</div></div></div>';
  });
  if (!top10Clients.length) out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:24px">ไม่มีข้อมูล</div>';
  out += '</div>';

  // Media per Personnel
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px">';
  out += '<div style="font-size:12px;font-weight:800;color:var(--t1);margin-bottom:14px">📡 Media per Personnel</div>';
  var specKeys = Object.keys(specPlatMap);
  if (specKeys.length === 0) {
    out += '<div style="font-size:12px;color:var(--t3);text-align:center;padding:24px">ไม่มีข้อมูล</div>';
  } else {
    specKeys.forEach(function(sp) {
      var plats = Object.entries(specPlatMap[sp]).sort(function(a,b){return b[1]-a[1];});
      var total = plats.reduce(function(s,x){return s+x[1];},0);
      out += '<div style="margin-bottom:14px">';
      out += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
      out += '<div style="width:26px;height:26px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white">' + sp.charAt(0) + '</div>';
      out += '<div style="font-size:13px;font-weight:700;color:var(--t1)">' + sp + '</div>';
      out += '<div style="font-size:11px;color:var(--t3);margin-left:auto">' + total + ' accesses</div>';
      out += '</div>';
      out += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
      plats.forEach(function(e) {
        var pc = PLAT_COLORS[e[0]] || 'var(--accent)';
        out += '<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid var(--bd)">';
        out += '<div style="width:6px;height:6px;border-radius:50%;background:' + pc + ';flex-shrink:0"></div>';
        out += '<span style="font-size:11px;color:var(--t2)">' + e[0] + '</span>';
        out += '<span style="font-size:11px;font-weight:800;font-family:var(--mono);color:' + pc + '">' + e[1] + '</span>';
        out += '</div>';
      });
      out += '</div></div>';
    });
  }
  out += '</div>';
  out += '</div>'; // end 2-col

  // ══════════════════════════════════════════════════════════
  // GROUP 5 — PERFORMANCE SUMMARY
  // ══════════════════════════════════════════════════════════
  out += sectionHeader('📈', 'Performance Summary', 'KPI ภาพรวมทีม');

  // KPI cards แนะนำ
  var totalComp = pct(vdone, vtotal);
  var totalOnTime = (function(){
    var ot = viewTickets.filter(function(t){
      if (t.status!=='done') return false;
      var dl = (t.statusLog||[]).slice().reverse().find(function(l){return l.status==='done';});
      return dl && t.deadline && dl.date <= t.deadline;
    }).length;
    return pct(ot, vdone);
  })();
  var churnRate = pct(lossClients, totalClients);
  var retentionRate = 100 - churnRate;
  var overdueRate = pct(voverdue, vtotal);
  var avgTickPerClient = activeClients > 0 ? (vtotal/activeClients).toFixed(1) : '0';

  out += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">';

  // Completion Rate
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (totalComp>=85?'#10b981':totalComp>=70?'#f59e0b':'#ef4444') + '"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">✅ Completion Rate</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + (totalComp>=85?'#10b981':totalComp>=70?'#f59e0b':'#ef4444') + '">' + totalComp + '%</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">🟢 ≥85% ดี · 🟡 70–84% · 🔴 &lt;70%</div>';
  out += '<div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+totalComp+'%;background:'+(totalComp>=85?'#10b981':totalComp>=70?'#f59e0b':'#ef4444')+';border-radius:2px"></div></div>';
  out += '</div>';

  // On-Time Rate
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (totalOnTime>=90?'#10b981':totalOnTime>=75?'#f59e0b':'#ef4444') + '"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">⏱ On-Time Rate</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + (totalOnTime>=90?'#10b981':totalOnTime>=75?'#f59e0b':'#ef4444') + '">' + totalOnTime + '%</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">🟢 ≥90% ดี · 🟡 75–89% · 🔴 &lt;75%</div>';
  out += '<div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+totalOnTime+'%;background:'+(totalOnTime>=90?'#10b981':totalOnTime>=75?'#f59e0b':'#ef4444')+';border-radius:2px"></div></div>';
  out += '</div>';

  // Overdue Rate
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (overdueRate<5?'#10b981':overdueRate<15?'#f59e0b':'#ef4444') + '"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">⚠️ Overdue Rate</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + (overdueRate<5?'#10b981':overdueRate<15?'#f59e0b':'#ef4444') + '">' + overdueRate + '%</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">🟢 &lt;5% ดี · 🟡 5–14% · 🔴 ≥15%</div>';
  out += '<div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+Math.min(100,overdueRate)+'%;background:'+(overdueRate<5?'#10b981':overdueRate<15?'#f59e0b':'#ef4444')+';border-radius:2px"></div></div>';
  out += '</div>';

  // Client Retention
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (retentionRate>=80?'#10b981':retentionRate>=60?'#f59e0b':'#ef4444') + '"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🔄 Client Retention</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + (retentionRate>=80?'#10b981':retentionRate>=60?'#f59e0b':'#ef4444') + '">' + retentionRate + '%</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">🟢 ≥80% ดี · 🟡 60–79% · 🔴 &lt;60%</div>';
  out += '<div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+retentionRate+'%;background:'+(retentionRate>=80?'#10b981':retentionRate>=60?'#f59e0b':'#ef4444')+';border-radius:2px"></div></div>';
  out += '</div>';

  // Churn Rate
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + (churnRate<10?'#10b981':churnRate<20?'#f59e0b':'#ef4444') + '"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">📉 Churn Rate</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:' + (churnRate<10?'#10b981':churnRate<20?'#f59e0b':'#ef4444') + '">' + churnRate + '%</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">🟢 &lt;10% ดี · 🟡 10–20% · 🔴 &gt;20%</div>';
  out += '<div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+Math.min(100,churnRate)+'%;background:'+(churnRate<10?'#10b981':churnRate<20?'#f59e0b':'#ef4444')+';border-radius:2px"></div></div>';
  out += '</div>';

  // Avg Ticket per Active Client
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden">';
  out += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent3)"></div>';
  out += '<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">🎫 Avg Ticket / Client</div>';
  out += '<div style="font-size:26px;font-weight:800;font-family:var(--mono);color:var(--accent3)">' + avgTickPerClient + '</div>';
  out += '<div style="font-size:11px;color:var(--t3);margin-top:2px">tickets ต่อ active client</div>';
  out += '</div>';
  out += '</div>'; // end 3-col KPI

  // Per-specialist performance table
  out += '<div style="background:var(--s1);border:1px solid var(--bd);border-radius:12px;overflow:hidden;margin-bottom:20px">';
  out += '<div style="padding:14px 16px;border-bottom:1px solid var(--bd);font-size:12px;font-weight:800;color:var(--t1)">👤 Performance ต่อ Specialist</div>';
  out += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>';
  ['Specialist','Clients','Tickets','Completion','On-Time','Overdue Rate','Workload','Budget รับผิดชอบ'].forEach(function(h){
    out += '<th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--bd);background:var(--s2)">' + h + '</th>';
  });
  out += '</tr></thead><tbody>';
  dShowMembers.forEach(function(m, idx) {
    var mt = dTicketsOf(m.name);
    var mp = D_PROJ.filter(function(p){ return p.member===m.name && p.status!=='loss'; });
    var md = mt.filter(function(t){ return t.status==='done'; }).length;
    var mo = mt.filter(function(t){ return t.status==='overdue' || (t.statusLog||[]).some(function(l){return l.status==='overdue';}); }).length;
    var mact = mt.filter(function(t){ return ['todo','inprog','hold','review','overdue'].includes(t.status); }).length;
    var mOnTime = mt.filter(function(t){
      if(t.status!=='done') return false;
      var dl = (t.statusLog||[]).slice().reverse().find(function(l){return l.status==='done';});
      return dl && t.deadline && dl.date <= t.deadline;
    }).length;
    var mCR = pct(md, mt.length);
    var mOT = pct(mOnTime, md);
    var mOR = pct(mo, mt.length);
    var mBudget = mp.reduce(function(s,p){ return s+((p.accesses||[]).reduce(function(a,x){return a+(x.budget||0);},0)||p.budget||0); },0);
    var col = workloadColor(mact);
    var bg = idx%2===0?'transparent':'rgba(255,255,255,.02)';
    out += '<tr style="background:'+bg+'">';
    out += '<td style="padding:10px 12px"><div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white">'+m.name.charAt(0)+'</div><div><div style="font-weight:700;color:var(--t1)">'+(m.nickname||m.name)+'</div><div style="font-size:10px;color:var(--t3)">'+m.role+'</div></div></div></td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);font-weight:700;color:var(--accent3)">'+mp.length+'</td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);color:var(--t2)">'+md+'/'+mt.length+'</td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);font-weight:700;color:'+(mCR>=85?'#10b981':mCR>=70?'#f59e0b':'#ef4444')+'">'+mCR+'%</td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);font-weight:700;color:'+(mOT>=90?'#10b981':'#f59e0b')+'">'+mOT+'%</td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);font-weight:700;color:'+(mOR<5?'#10b981':mOR<15?'#f59e0b':'#ef4444')+'">'+mOR+'%</td>';
    out += '<td style="padding:10px 12px"><div style="display:flex;align-items:center;gap:6px"><div style="width:60px;height:8px;background:var(--s3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+Math.min(100,mact/10*100)+'%;background:'+col+';border-radius:4px"></div></div><span style="font-family:var(--mono);font-size:11px;color:'+col+'">'+mact+'</span></div></td>';
    out += '<td style="padding:10px 12px;font-family:var(--mono);font-size:11px;color:var(--gold)">'+mBudget.toLocaleString()+' ฿</td>';
    out += '</tr>';
  });
  if (!dShowMembers.length) out += '<tr><td colspan="8" style="padding:24px;text-align:center;color:var(--t3)">ไม่มีข้อมูล</td></tr>';
  out += '</tbody></table></div>';

  return out;
}

function setDashView(v) {
  window._dashView = v;
  render();
}

function setDashPeriod(p) {
  window._dashPeriod = p;
  render();
}

