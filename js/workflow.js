// ══════════════════════════════════════════════════════════════
// CRM Operations — workflow.js
// Workflow page: overview, ticket flow, project flow, roles
// ══════════════════════════════════════════════════════════════
// ── WORKFLOW PAGE ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

function renderWorkflow() {
  var out = '';
  out += '<div class="sh" style="margin-bottom:4px">';
  out += '<div class="sh-title">🔄 Workflow Guide</div>';
  out += '<div style="font-size:12px;color:var(--t3)">อ่านหน้านี้ก่อนเริ่มใช้งานระบบ — ครอบคลุมทุกสิ่งที่ต้องรู้</div>';
  out += '</div>';

  // Tab bar
  out += '<div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">';
  var tabs = [
    ['overview','🧭 ภาพรวมระบบ'],
    ['ticket','🎫 Ticket Flow'],
    ['project','🗂️ Project Flow'],
    ['roles','🔐 สิทธิ์ตาม Role'],
  ];
  tabs.forEach(function(t,i) {
    var active = i === 0;
    out += '<button id="wf-tab-'+t[0]+'" onclick="switchWfTab(\''+t[0]+'\')" style="font-family:var(--sans);font-size:12px;font-weight:700;padding:7px 18px;border-radius:20px;cursor:pointer;transition:all .2s;'
         + (active ? 'border:1px solid var(--accent);background:var(--grad);color:white' : 'border:1px solid var(--bd);background:var(--s2);color:var(--t2)')
         + '">'+t[1]+'</button>';
  });
  out += '</div>';

  out += '<div id="wf-content-overview">'  + renderWfOverview()  + '</div>';
  out += '<div id="wf-content-ticket"  style="display:none">' + renderTicketWorkflow() + '</div>';
  out += '<div id="wf-content-project" style="display:none">' + renderProjectWorkflow() + '</div>';
  out += '<div id="wf-content-roles"   style="display:none">' + renderWfRoles() + '</div>';
  return out;
}

function switchWfTab(tab) {
  var tabs = ['overview','ticket','project','roles'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('wf-tab-'+t);
    var sec = document.getElementById('wf-content-'+t);
    if (!btn||!sec) return;
    var active = t === tab;
    btn.style.background    = active ? 'var(--grad)' : 'var(--s2)';
    btn.style.color         = active ? 'white'       : 'var(--t2)';
    btn.style.borderColor   = active ? 'var(--accent)': 'var(--bd)';
    sec.style.display       = active ? '' : 'none';
  });
}

/* ─── shared helpers ─────────────────────────────────────── */
function wfStatusCard(icon, status, clr, bg, desc, who, extra) {
  var s = '<div style="flex:1;min-width:155px;background:'+bg+';border:1px solid '+clr+'40;border-radius:12px;padding:14px 16px">';
  s += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">'+icon+'</span>';
  s += '<span style="font-size:13px;font-weight:800;color:'+clr+'">'+status+'</span></div>';
  s += '<div style="font-size:12px;color:var(--t2);margin-bottom:6px;line-height:1.5">'+desc+'</div>';
  s += '<div style="font-size:10px;color:var(--t3);font-weight:700">'+who+'</div>';
  if (extra) s += '<div style="font-size:10px;color:'+clr+';font-weight:700;padding:4px 8px;background:'+clr+'20;border-radius:6px;margin-top:6px">'+extra+'</div>';
  s += '</div>';
  return s;
}

function wfArrow(from, to, label, clr) {
  var s = '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--s2);border:1px solid var(--bd);border-radius:10px">';
  s += '<div style="font-size:12px;font-weight:700;color:var(--t1);min-width:100px">'+from+'</div>';
  s += '<div style="flex:1;height:2px;background:'+clr+'50;border-radius:1px"></div>';
  s += '<div style="font-size:10px;color:var(--t3);text-align:center;min-width:130px">'+label+'</div>';
  s += '<span style="font-size:18px;color:'+clr+'">›</span>';
  s += '<div style="font-size:12px;font-weight:700;color:'+clr+';min-width:100px;text-align:right">'+to+'</div>';
  s += '</div>';
  return s;
}

function wfStep(num, clr, title, desc) {
  var s = '<div style="display:flex;gap:14px;padding:14px 16px;background:var(--s2);border:1px solid var(--bd);border-radius:12px">';
  s += '<div style="width:32px;height:32px;border-radius:50%;background:'+clr+'22;border:2px solid '+clr+'60;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:'+clr+';flex-shrink:0">'+num+'</div>';
  s += '<div><div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:4px">'+title+'</div>';
  s += '<div style="font-size:12px;color:var(--t2);line-height:1.6">'+desc+'</div></div>';
  s += '</div>';
  return s;
}

function wfTip(icon, text, clr) {
  clr = clr || '#1eb5a8';
  return '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:'+clr+'12;border:1px solid '+clr+'30;border-radius:10px;font-size:12px;color:var(--t2);line-height:1.6">'
       + '<span style="font-size:16px;flex-shrink:0">'+icon+'</span><div>'+text+'</div></div>';
}

/* ─── Tab 1: ภาพรวมระบบ ─────────────────────────────────── */
function renderWfOverview() {
  var out = '';

  // Intro
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div style="font-size:15px;font-weight:800;color:var(--t1);margin-bottom:6px">👋 ยินดีต้อนรับสู่ CRM Operations</div>';
  out += '<div style="font-size:13px;color:var(--t2);line-height:1.8">ระบบนี้ใช้จัดการงาน (Ticket) และโปรเจค (Project) ของ M-Creation ทุก Role มีหน้าที่และสิทธิ์ที่ชัดเจน อ่านหน้านี้แล้วจะใช้งานได้ทันที</div>';
  out += '</div>';

  // Role overview
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:14px">👥 3 Role ในระบบ</div>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:10px">';

  var roles = [
    ['👑','Super Admin','var(--gold)',
      'ควบคุมทุกอย่างในระบบ',
      ['เห็นและแก้ไขข้อมูลทั้งหมด','เพิ่ม/ลบ Client และ Ticket','เพิ่ม/ลบ/แก้ไขพนักงาน','Approve งานทุกชิ้น','ลบ Client ออกจากระบบได้']
    ],
    ['💼','Admin','var(--accent3)',
      'บริหารงานและ Client',
      ['เห็นและแก้ไขข้อมูลทั้งหมด','เพิ่ม/แก้ไข Client และ Ticket','เพิ่ม/แก้ไขพนักงาน','Approve งานทุกชิ้น','ลบ Ticket ได้ (ลบ Client ไม่ได้)']
    ],
    ['⚡','Specialist','var(--green)',
      'ทำงานตาม Ticket ที่ได้รับ',
      ['เห็นเฉพาะ Ticket ของตัวเอง','เห็น Ticket ที่ฝากงาน/โดนฝากงาน','สร้าง Ticket ใน Client ของตัวเอง','Approve งานตัวเองได้','ลบ Ticket หรือ Client ไม่ได้']
    ],
  ];

  roles.forEach(function(r) {
    var s = '<div style="flex:1;min-width:220px;background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:16px">';
    s += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
    s += '<span style="font-size:22px">'+r[0]+'</span>';
    s += '<div><div style="font-size:14px;font-weight:800;color:'+r[2]+'">'+r[1]+'</div>';
    s += '<div style="font-size:11px;color:var(--t3)">'+r[3]+'</div></div></div>';
    r[4].forEach(function(p) {
      s += '<div style="font-size:11px;color:var(--t2);padding:4px 0;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:6px">';
      s += '<span style="color:var(--green);font-size:10px">✓</span>'+p+'</div>';
    });
    s += '</div>';
    out += s;
  });
  out += '</div></div>';

  // 2 main flows
  out += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';

  // Ticket flow summary
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:12px">🎫 Ticket คืออะไร?</div>';
  out += '<div style="font-size:12px;color:var(--t2);line-height:1.8;margin-bottom:12px">Ticket = งานชิ้นหนึ่งที่ต้องทำให้ Client เช่น Setup Ads, Optimize, Report — ทุก Ticket ผูกกับ Client และ Platform</div>';
  var tsteps = [['📋','To Do','#8b92b8'],['⚡','In Progress','#1eb5a8'],['👁','Review','#f59e0b'],['✓','Done','#10b981']];
  out += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">';
  tsteps.forEach(function(s,i) {
    out += '<span style="font-size:11px;font-weight:700;color:'+s[2]+';background:'+s[2]+'15;padding:3px 8px;border-radius:6px">'+s[0]+' '+s[1]+'</span>';
    if (i < tsteps.length-1) out += '<span style="color:var(--t3);font-size:12px">→</span>';
  });
  out += '</div>';
  out += '<div style="margin-top:10px;font-size:11px;color:var(--t3)">กด <strong style="color:var(--t2)">Ticket Flow</strong> เพื่อดูรายละเอียดทั้งหมด</div>';
  out += '</div>';

  // Project flow summary
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:12px">🗂️ Project คืออะไร?</div>';
  out += '<div style="font-size:12px;color:var(--t2);line-height:1.8;margin-bottom:12px">Project = Client ที่ทำสัญญากับทีม แต่ละ Project มี Budget, Platform Access และ Project Owner ที่รับผิดชอบ</div>';
  var psteps = [['🕐','Waiting','#1eb5a8'],['✅','Active','#10b981'],['⏸','Pause','#f59e0b'],['❌','Loss','#ef4444']];
  out += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">';
  psteps.forEach(function(s,i) {
    out += '<span style="font-size:11px;font-weight:700;color:'+s[2]+';background:'+s[2]+'15;padding:3px 8px;border-radius:6px">'+s[0]+' '+s[1]+'</span>';
    if (i < psteps.length-1) out += '<span style="color:var(--t3);font-size:12px">→</span>';
  });
  out += '</div>';
  out += '<div style="margin-top:10px;font-size:11px;color:var(--t3)">กด <strong style="color:var(--t2)">Project Flow</strong> เพื่อดูรายละเอียดทั้งหมด</div>';
  out += '</div>';

  out += '</div>'; // end grid

  // Quick start tips
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:12px">🚀 เริ่มใช้งานใน 3 ขั้นตอน</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfStep('1','var(--accent3)','Admin: เพิ่ม Client (Project)','ไปที่เมนู Project → กด "+ เพิ่ม Client" → กรอกข้อมูล Client, Platform, Budget → แนบใบเสนอราคา → ยืนยัน');
  out += wfStep('2','var(--accent3)','Admin: เพิ่มพนักงาน (ถ้ายังไม่มี)','ไปที่เมนู Personnel → กด "+ เพิ่มพนักงาน" → กรอกชื่อ, ชื่อเล่น, Email (@m-creation.co), Role → บันทึก');
  out += wfStep('3','#1eb5a8)','สร้าง Ticket แล้วเริ่มทำงาน','ไปที่ All Tickets → กด "+ Ticket ใหม่" → เลือก Client, Platform, ประเภทงาน → มอบหมาย Specialist → บันทึก');
  out += '</div>';
  out += '<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">';
  out += wfTip('💡','<strong>Specialist เห็นเฉพาะ Ticket ของตัวเอง</strong> และ Ticket ที่มีการฝากงาน (coSpecialist) เท่านั้น','#1eb5a8');
  out += wfTip('⚠️','<strong>เพิ่ม Ticket ได้เฉพาะ Project ที่สถานะ Active</strong> เท่านั้น — ถ้า Project เป็น Pause หรือ Loss จะเพิ่มไม่ได้','#f59e0b');
  out += wfTip('🔒','<strong>Login ได้เฉพาะ Email @m-creation.co</strong> ที่ถูกเพิ่มใน Personnel แล้วเท่านั้น','#ef4444');
  out += '</div>';
  out += '</div>';

  return out;
}

/* ─── Tab 2: Ticket Flow ─────────────────────────────────── */
function renderTicketWorkflow() {
  var out = '';

  // Status cards
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:6px">🎫 สถานะ Ticket</div>';
  out += '<div style="font-size:12px;color:var(--t2);margin-bottom:14px;line-height:1.6">แต่ละ Ticket ผ่านสถานะเหล่านี้ตามลำดับ — บางสถานะต้องมี Role ที่เหมาะสมถึงจะเปลี่ยนได้</div>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:10px">';
  out += wfStatusCard('📋','To Do','#8b92b8','rgba(139,146,184,.15)','งานสร้างแล้ว รอรับงาน','Admin / Specialist สร้าง','');
  out += wfStatusCard('⚡','In Progress','#1eb5a8','rgba(30,181,168,.12)','กำลังดำเนินการ','Specialist กด In Progress','');
  out += wfStatusCard('⏸','On Hold','#7c3aed','rgba(30,181,168,.18)','หยุดชั่วคราว รอข้อมูลหรือติดปัญหา','Specialist ขอ Hold + Comment','⚠️ Admin ต้อง Approve ก่อนกลับ In Progress');
  out += wfStatusCard('👁','Review','#f59e0b','rgba(245,158,11,.15)','งานเสร็จ รอ Approve','Specialist กด Review','');
  out += wfStatusCard('✓','Done','#10b981','rgba(16,185,129,.12)','งานเสร็จสมบูรณ์','Admin หรือ Specialist เจ้าของงาน Approve','✅ Specialist Approve งานตัวเองได้');
  out += wfStatusCard('⚠','Overdue','#ef4444','rgba(239,68,68,.15)','เลย Deadline แล้ว','ระบบเปลี่ยนอัตโนมัติ','⚡ เปลี่ยนไป Review ได้เลย');
  out += '</div></div>';

  // Flow
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:12px">➡️ เส้นทางการเปลี่ยนสถานะ</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfArrow('To Do','In Progress','Specialist รับงาน / กดเริ่ม','#1eb5a8');
  out += wfArrow('In Progress','Review','งานเสร็จ → ส่ง Review','#f59e0b');
  out += wfArrow('In Progress','On Hold','ติดปัญหา + ระบุ Comment','#7c3aed');
  out += wfArrow('On Hold','In Progress','แก้ปัญหาแล้ว / Admin Approve','#1eb5a8');
  out += wfArrow('Review','Done','Specialist เจ้าของงาน หรือ Admin Approve','#10b981');
  out += wfArrow('Overdue','Review','แก้ไขเสร็จ → ส่ง Review ได้เลย','#f59e0b');
  out += '</div></div>';

  // coSpecialist
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:10px">🤝 ฝากงานร่วม (coSpecialist)</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfTip('🤝','ตอน<strong>สร้าง Ticket</strong> หรือเปิด Ticket เดิม สามารถเลือก "ฝากงานร่วม" ให้ Specialist คนอื่นช่วยได้ ทั้งคู่จะเห็น Ticket เดียวกัน','#1eb5a8');
  out += wfTip('⚡','<strong>คนรับฝาก (coSpecialist)</strong> เห็น Ticket และแก้ไขได้เหมือนกัน แต่ถ้างาน Overdue จะ<strong>ไม่กระทบ KPI ของคนรับฝาก</strong> — กระทบเฉพาะเจ้าของ Ticket','#f59e0b');
  out += wfTip('📋','การเพิ่ม coSpecialist: เปิด Ticket → ช่อง "ฝากงานร่วม" → เลือกชื่อ → กดบันทึก','var(--green)');
  out += '</div></div>';

  // Tips
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:10px">💡 สิ่งที่ต้องรู้</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfTip('🔢','รหัส Ticket (TK-XXXX) ไม่ซ้ำกัน ระบบนับต่อจาก Ticket ล่าสุดในฐานข้อมูลอัตโนมัติ','#8b92b8');
  out += wfTip('🔔','ทุกครั้งที่เปลี่ยนสถานะ ระบบจะแจ้งเตือน (เสียง + ไอคอนกระดิ่ง) ทันที','#1eb5a8');
  out += wfTip('🔒','Specialist ลบ Ticket ไม่ได้ — เฉพาะ Admin และ Super Admin เท่านั้น','#ef4444');
  out += wfTip('🏢','Ticket สามารถสร้างได้เฉพาะ Project ที่สถานะเป็น Active เท่านั้น','#f59e0b');
  out += '</div></div>';

  return out;
}

/* ─── Tab 3: Project Flow ────────────────────────────────── */
function renderProjectWorkflow() {
  var out = '';

  // Status cards
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:6px">🗂️ สถานะ Project</div>';
  out += '<div style="font-size:12px;color:var(--t2);margin-bottom:14px;line-height:1.6">Project = Client ที่มีสัญญา — Admin/Super Admin เท่านั้นที่เปลี่ยนสถานะ Project ได้</div>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:10px">';
  out += wfStatusCard('🕐','Waiting','#1eb5a8','rgba(30,181,168,.12)','เพิ่งสร้าง รอเริ่มงาน','สร้างโดย Admin','');
  out += wfStatusCard('✅','Active','#10b981','rgba(16,185,129,.12)','กำลังดำเนินการ สร้าง Ticket ได้','Admin เปลี่ยนจาก Waiting / Renew','🎫 เพิ่ม Ticket ได้เฉพาะสถานะนี้');
  out += wfStatusCard('⏸','Pause','#f59e0b','rgba(245,158,11,.15)','หยุดชั่วคราว เช่น รอลูกค้า Budget','Admin กด Pause + ระบุเหตุผล','');
  out += wfStatusCard('❌','Loss','#ef4444','rgba(239,68,68,.15)','สิ้นสุด / ลูกค้ายกเลิก','Admin กด Loss + ระบุเหตุผล','🔄 ต่อบริการได้ → กลับ Active');
  out += '</div></div>';

  // Flow
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:12px">➡️ เส้นทางการเปลี่ยนสถานะ</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfArrow('Waiting','Active','Admin ยืนยันเริ่มงาน','#10b981');
  out += wfArrow('Active','Pause','หยุดชั่วคราว + ระบุเหตุผล','#f59e0b');
  out += wfArrow('Active','Loss','ลูกค้ายกเลิก / สิ้นสุดสัญญา','#ef4444');
  out += wfArrow('Pause','Active','กลับมาทำงาน / ต่อบริการ','#10b981');
  out += wfArrow('Pause','Loss','ยกเลิกขณะ Pause','#ef4444');
  out += wfArrow('Loss','Active','ต่อบริการ (Renew) — แนบใบเสนอราคาได้','#10b981');
  out += '</div></div>';

  // Features
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:12px">⭐ ฟีเจอร์สำคัญ Project</div>';
  out += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">';
  var features = [
    ['💰','Budget & Platform Access','แต่ละ Project มีงบรวมและแยกตาม Platform (Facebook, Google, TikTok ฯลฯ) ระบบเตือนเมื่องบเกิน Limit'],
    ['📞','ข้อมูลติดต่อ Client','บันทึก Key Contact, Payment Contact, Email, เบอร์โทร, Facebook Page, Location'],
    ['🔄','ต่อบริการ (Renew)','เมื่อสัญญาสิ้นสุด → กด Renew, กรอกวันใหม่, หมายเหตุ และแนบใบเสนอราคาได้'],
    ['📋','ประวัติสถานะ (Log)','ทุกการเปลี่ยนแปลงบันทึก วันที่ + เหตุผล + ใบเสนอราคา เพื่อ Audit Trail'],
    ['🗑️','ลบ Client','เฉพาะ Super Admin เท่านั้นที่ลบ Project ออกจากระบบได้ — ลบถาวร'],
    ['👤','Project Owner','แต่ละ Project มี Specialist ที่รับผิดชอบ — Specialist นั้นจะเห็น Client ใน dropdown ของตัวเอง'],
  ];
  features.forEach(function(f) {
    out += '<div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:12px 14px">';
    out += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px"><span style="font-size:16px">'+f[0]+'</span>';
    out += '<span style="font-size:12px;font-weight:800;color:var(--t1)">'+f[1]+'</span></div>';
    out += '<div style="font-size:11px;color:var(--t2);line-height:1.6">'+f[2]+'</div></div>';
  });
  out += '</div></div>';

  // Tips
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:10px">💡 สิ่งที่ต้องรู้</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfTip('🎫','<strong>Project ที่ไม่ใช่ Active จะสร้าง Ticket ไม่ได้</strong> — ต้อง Renew หรือ Activate ก่อน','#f59e0b');
  out += wfTip('👤','<strong>Specialist เห็น Client ของตัวเองเท่านั้น</strong> ในหน้าสร้าง Ticket (ตาม Project Owner)','#1eb5a8');
  out += wfTip('📎','ใบเสนอราคา (PDF/รูปภาพ) แนบได้ทั้งตอนสร้าง Client ใหม่, เปลี่ยนสถานะ และ Renew','var(--green)');
  out += '</div></div>';

  return out;
}

/* ─── Tab 4: สิทธิ์ตาม Role ─────────────────────────────── */
function renderWfRoles() {
  var out = '';

  // Quick comparison table
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:14px">⚖️ เปรียบเทียบสิทธิ์</div>';
  out += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
  out += '<thead><tr>';
  out += '<th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--bd);background:var(--s2)">สิทธิ์</th>';
  out += '<th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:800;color:var(--gold);border-bottom:1px solid var(--bd);background:var(--s2)">👑 Super Admin</th>';
  out += '<th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:800;color:var(--accent3);border-bottom:1px solid var(--bd);background:var(--s2)">💼 Admin</th>';
  out += '<th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:800;color:var(--green);border-bottom:1px solid var(--bd);background:var(--s2)">⚡ Specialist</th>';
  out += '</tr></thead><tbody>';

  var perms = [
    ['ดู Ticket ทั้งหมด',               true,  true,  false],
    ['ดู Ticket ของตัวเอง/ฝากงาน',       true,  true,  true],
    ['สร้าง Ticket',                    true,  true,  true],
    ['ลบ Ticket',                       true,  true,  false],
    ['Approve งาน (Review → Done)',     true,  true,  'เฉพาะของตัวเอง'],
    ['Approve On Hold',                 true,  true,  false],
    ['เปลี่ยน Specialist ใน Ticket',   true,  true,  false],
    ['เพิ่ม / แก้ไข Client (Project)', true,  true,  false],
    ['ลบ Client',                       true,  false, false],
    ['เพิ่ม / แก้ไข พนักงาน',          true,  true,  false],
    ['ลบ พนักงาน',                      true,  true,  false],
    ['ดู KPI Dashboard',                true,  true,  true],
    ['ดู Workflow',                     true,  true,  true],
    ['Login ต้องเป็น',                  '@m-creation.co', '@m-creation.co', '@m-creation.co'],
  ];

  perms.forEach(function(row, i) {
    var bg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.02)';
    out += '<tr style="background:'+bg+'">';
    out += '<td style="padding:9px 12px;font-weight:600;color:var(--t1)">'+row[0]+'</td>';
    [row[1],row[2],row[3]].forEach(function(v) {
      var cell = '';
      if (v === true)        cell = '<span style="color:var(--green);font-size:16px">✓</span>';
      else if (v === false)  cell = '<span style="color:var(--red);font-size:14px;opacity:.5">✕</span>';
      else                   cell = '<span style="font-size:10px;color:var(--gold);font-weight:700;background:rgba(245,166,35,.15);padding:2px 7px;border-radius:8px">'+v+'</span>';
      out += '<td style="text-align:center;padding:9px 12px">'+cell+'</td>';
    });
    out += '</tr>';
  });
  out += '</tbody></table></div></div>';

  // Domain restriction
  out += '<div class="card" style="margin-bottom:16px">';
  out += '<div class="card-title" style="margin-bottom:10px">🔒 การเข้าสู่ระบบ</div>';
  out += '<div style="display:flex;flex-direction:column;gap:8px">';
  out += wfStep('1','var(--accent3)','Login ด้วย Google Account','กดปุ่ม Sign in with Google บนหน้า Login');
  out += wfStep('2','#ef4444','ต้องเป็น Email @m-creation.co เท่านั้น','Email ที่ไม่ใช่ @m-creation.co จะถูกปฏิเสธทันที แม้จะเป็น Google Account ก็ตาม');
  out += wfStep('3','#1eb5a8','ต้องถูกเพิ่มใน Personnel แล้ว','Admin ต้องเพิ่มชื่อและ Email ใน Personnel ก่อน — ไม่งั้นเข้าไม่ได้แม้ domain ถูกต้อง');
  out += '</div></div>';

  // KPI quick ref
  out += '<div class="card">';
  out += '<div class="card-title" style="margin-bottom:10px">📊 KPI วัดอะไรบ้าง?</div>';
  out += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">';
  var kpis = [
    ['Completion Rate','Tickets Done ÷ ทั้งหมด','เกณฑ์: 🟢 ≥85% 🟡 70-84% 🔴 <70%'],
    ['On-Time Rate','Done ก่อน Deadline','เกณฑ์: 🟢 ≥90% 🟡 75-89% 🔴 <75%'],
    ['Overdue Rate','Tickets ที่เคย Overdue','เกณฑ์: 🟢 <5% 🟡 5-15% 🔴 >15%'],
    ['First-Pass Rate','Done โดยไม่มี Hold','เกณฑ์: 🟢 ≥80% 🟡 60-79% 🔴 <60%'],
    ['Avg Cycle Time','วันสร้าง → วัน Done','เกณฑ์: 🟢 ≤3 วัน 🟡 4-7 วัน 🔴 >7 วัน'],
    ['Specialist Score','CR×0.35 + OT×0.35 + FP×0.30','เกณฑ์: A≥85 B70-84 C55-69 D<55'],
  ];
  kpis.forEach(function(k) {
    out += '<div style="background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:11px 13px">';
    out += '<div style="font-size:12px;font-weight:800;color:var(--t1);margin-bottom:3px">'+k[0]+'</div>';
    out += '<div style="font-size:11px;color:var(--t3);margin-bottom:4px">'+k[1]+'</div>';
    out += '<div style="font-size:10px;color:var(--t2)">'+k[2]+'</div>';
    out += '</div>';
  });
  out += '</div>';
  out += '<div style="margin-top:10px;font-size:11px;color:var(--t3)">⚠️ Overdue ของ coSpecialist (คนรับฝากงาน) <strong style="color:var(--t2)">ไม่นับใน KPI Score</strong> ของคนรับฝาก</div>';
  out += '</div>';

  return out;
}


