// ══════════════════════════════════════════════════════════════
// CRM Operations — settings.js
// Settings page, theme/font application
// ══════════════════════════════════════════════════════════════
// ── SETTINGS ──────────────────────────────────────────────────
function renderSettings() {
  const themes = [
    {
      id:'dompet',     name:'Dompet',        desc:'ขาวสะอาด ฟ้า-เขียว',
      bg:'#f0f2f5', s1:'#ffffff', s2:'#f8f9fc', s3:'#eef0f5', bd:'#e2e5ef', bd2:'#d0d4e8',
      t1:'#1a1d2e', t2:'#5a607a', t3:'#9098b5',
      accent:'#1eb5a8', accent2:'#20c9bb', accent3:'#5dd8cc',
      grad:'linear-gradient(135deg,#1eb5a8,#20c9bb)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)'
    },
    {
      id:'midnight',    name:'Midnight',      desc:'เข้มลึก คลาสสิก',
      bg:'#0e0e12', s1:'#16161c', s2:'#1e1e26', s3:'#262630', bd:'#2e2e3e', bd2:'#3a3a50',
      t1:'#f0f0f8', t2:'#9090b0', t3:'#55556a',
      accent:'#1eb5a8', accent2:'#1eb5a8', accent3:'#5dd8cc',
      grad:'linear-gradient(135deg,#1eb5a8,#1eb5a8)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)'
    },
    {
      id:'slate',       name:'Slate',         desc:'เทาเย็น เรียบหรู',
      bg:'#0f1117', s1:'#171921', s2:'#1f2230', s3:'#262940', bd:'#2e3248', bd2:'#3c4060',
      t1:'#e8eaf2', t2:'#8890b0', t3:'#505570',
      accent:'#5b8def', accent2:'#93b4f5', accent3:'#bdd0fa',
      grad:'linear-gradient(135deg,#5b8def,#93b4f5)', grad2:'linear-gradient(90deg,#5b8def,#bdd0fa)'
    },
    {
      id:'obsidian',    name:'Obsidian',      desc:'ดำอมเขียว มินิมอล',
      bg:'#0c0f0e', s1:'#141918', s2:'#1a2120', s3:'#202928', bd:'#283030', bd2:'#344040',
      t1:'#e0eeea', t2:'#7aa090', t3:'#446055',
      accent:'#2dd4a0', accent2:'#5ee8be', accent3:'#99f0d8',
      grad:'linear-gradient(135deg,#2dd4a0,#5ee8be)', grad2:'linear-gradient(90deg,#2dd4a0,#99f0d8)'
    },
    {
      id:'paper',       name:'Paper',         desc:'ขาวนวล สะอาดตา',
      bg:'#f9f9f7', s1:'#ffffff', s2:'#f2f2ee', s3:'#ebebе5', bd:'#ddddd5', bd2:'#cacabe',
      t1:'#1a1a18', t2:'#555550', t3:'#999990',
      accent:'#2563eb', accent2:'#3b82f6', accent3:'#60a5fa',
      grad:'linear-gradient(135deg,#1a1a18,#2563eb)', grad2:'linear-gradient(90deg,#2563eb,#60a5fa)'
    },
    {
      id:'linen',       name:'Linen',         desc:'ครีม อบอุ่น นุ่มนวล',
      bg:'#faf8f4', s1:'#ffffff', s2:'#f4f0e8', s3:'#ede8dc', bd:'#ddd8cc', bd2:'#ccc4b4',
      t1:'#2a2218', t2:'#6a5e4e', t3:'#9a9080',
      accent:'#b45309', accent2:'#d97706', accent3:'#f59e0b',
      grad:'linear-gradient(135deg,#b45309,#d97706)', grad2:'linear-gradient(90deg,#b45309,#f59e0b)'
    },
    {
      id:'ash',         name:'Ash',           desc:'เทาอุ่น โทนนิ่ง',
      bg:'#f5f4f2', s1:'#ffffff', s2:'#eeecea', s3:'#e5e3e0', bd:'#d5d3d0', bd2:'#c5c3be',
      t1:'#1e1c1a', t2:'#5a5856', t3:'#908e8a',
      accent:'#374151', accent2:'#6b7280', accent3:'#9ca3af',
      grad:'linear-gradient(135deg,#374151,#6b7280)', grad2:'linear-gradient(90deg,#374151,#9ca3af)'
    },
  ];
  const current = localStorage.getItem('crm-theme') || 'midnight';
  return `
    <div class="sh"><div class="sh-title">⚙️ Settings</div></div>
    <div class="card" style="max-width:720px">
      <div class="card-title">🎨 เลือกธีม</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:12px">
        ${themes.map(t=>`
          <div onclick="applyTheme('${t.id}')" style="cursor:pointer;border-radius:14px;overflow:hidden;border:2px solid ${current===t.id?t.accent:'transparent'};outline:1px solid ${t.bd};transition:all .2s;${current===t.id?`box-shadow:0 0 0 3px ${t.accent}33`:''}" >
            <div style="background:${t.bg};padding:12px;height:88px;position:relative;display:flex;gap:8px">
              <div style="background:${t.s1};border-radius:8px;width:38%;display:flex;flex-direction:column;gap:5px;padding:8px">
                <div style="background:${t.accent};border-radius:3px;height:6px;width:70%;opacity:.9"></div>
                <div style="background:${t.bd};border-radius:3px;height:4px;width:90%"></div>
                <div style="background:${t.bd};border-radius:3px;height:4px;width:80%"></div>
                <div style="background:${t.bd};border-radius:3px;height:4px;width:85%"></div>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;gap:5px">
                <div style="background:${t.s2};border-radius:6px;height:24px;display:flex;align-items:center;padding:0 8px;gap:4px">
                  <div style="background:${t.accent};border-radius:2px;height:4px;width:40%"></div>
                </div>
                <div style="background:${t.s2};border-radius:6px;flex:1;padding:6px 8px;display:flex;flex-direction:column;gap:3px">
                  <div style="background:${t.bd};border-radius:2px;height:3px;width:100%"></div>
                  <div style="background:${t.bd};border-radius:2px;height:3px;width:85%"></div>
                  <div style="background:${t.bd};border-radius:2px;height:3px;width:90%"></div>
                </div>
              </div>
            </div>
            <div style="padding:9px 12px;background:${t.s1};border-top:1px solid ${t.bd};display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:12px;font-weight:700;color:${t.t1}">${t.name}</div>
                <div style="font-size:10px;color:${t.t3};margin-top:1px">${t.desc}</div>
              </div>
              <div style="width:20px;height:20px;border-radius:50%;background:${t.grad};display:flex;align-items:center;justify-content:center;font-size:10px;color:white">
                ${current===t.id?'✓':''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card" style="max-width:720px;margin-top:20px">
      <div class="card-title">🔤 เลือกฟอนต์</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">
        ${(function(){
          var fonts = [
            {id:'sarabun', name:'Sarabun',       sample:'สวัสดี Hello 123', desc:'ค่าเริ่มต้น กลมกล่อม'},
            {id:'noto',    name:'Noto Sans Thai', sample:'สวัสดี Hello 123', desc:'อ่านง่าย เป็นทางการ'},
            {id:'ibm',     name:'IBM Plex Sans',  sample:'Hello สวัสดี 123', desc:'เทคนิค โมเดิร์น'},
            {id:'prompt',  name:'Prompt',         sample:'สวัสดี Hello 123', desc:'ทันสมัย มีเอกลักษณ์'},
            {id:'kanit',   name:'Kanit',          sample:'สวัสดี Hello 123', desc:'ได้สัดส่วน ตัวหนา'},
            {id:'inter',   name:'Inter',          sample:'Hello สวัสดี 123', desc:'UI คลาสสิก'},
          ];
          var curFont = localStorage.getItem('crm-font') || 'sarabun';
          return fonts.map(function(f) {
            var active = curFont === f.id;
            var border = active ? 'var(--accent)' : 'var(--bd)';
            var bg     = active ? 'rgba(30,181,168,.08)' : 'var(--s2)';
            var shadow = active ? 'box-shadow:0 0 0 3px rgba(30,181,168,.15)' : '';
            var color  = active ? 'var(--accent2)' : 'var(--t1)';
            var check  = active ? ' ✓' : '';
            return '<div onclick="applyFont(\'' + f.id + '\')" style="cursor:pointer;padding:14px 16px;border-radius:12px;border:2px solid ' + border + ';background:' + bg + ';transition:all .2s;' + shadow + '">'
              + '<div style="font-size:13px;font-weight:700;color:' + color + ';margin-bottom:4px">' + f.name + check + '</div>'
              + '<div style="font-size:14px;color:var(--t2);margin-bottom:4px">' + f.sample + '</div>'
              + '<div style="font-size:10px;color:var(--t3)">' + f.desc + '</div>'
              + '</div>';
          }).join('');
        })()}
      </div>
    </div>`;
}

function applyFont(id) {
  const fonts = {
    'sarabun': "'Sarabun', sans-serif",
    'noto':    "'Noto Sans Thai', sans-serif",
    'ibm':     "'IBM Plex Sans', sans-serif",
    'prompt':  "'Prompt', sans-serif",
    'kanit':   "'Kanit', sans-serif",
    'inter':   "'Inter', sans-serif",
  };
  const fontLinks = {
    'sarabun': 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap',
    'noto':    'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;800&display=swap',
    'ibm':     'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap',
    'prompt':  'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;800&display=swap',
    'kanit':   'https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800&display=swap',
    'inter':   'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
  };
  const f = fonts[id]; if (!f) return;
  // Load font if not already loaded
  const linkId = 'font-link-' + id;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = fontLinks[id];
    document.head.appendChild(link);
  }
  document.documentElement.style.setProperty('--sans', f);
  localStorage.setItem('crm-font', id);
  render();
  showToast('🔤 ฟอนต์ ' + id);
}

// โหลดฟอนต์ที่บันทึกไว้
(function() {
  const savedFont = localStorage.getItem('crm-font');
  if (savedFont && savedFont !== 'sarabun') applyFont(savedFont);
})();

function applyTheme(id) {
  const themes = {
    'dompet':   { bg:'#f0f2f5', s1:'#ffffff', s2:'#f8f9fc', s3:'#eef0f5', bd:'#e2e5ef', bd2:'#d0d4e8', t1:'#1a1d2e', t2:'#5a607a', t3:'#9098b5', accent:'#1eb5a8', accent2:'#20c9bb', accent3:'#5dd8cc', grad:'linear-gradient(135deg,#1eb5a8,#20c9bb)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)' },
    'midnight': { bg:'#0e0e12', s1:'#16161c', s2:'#1e1e26', s3:'#262630', bd:'#2e2e3e', bd2:'#3a3a50', t1:'#f0f0f8', t2:'#9090b0', t3:'#55556a', accent:'#1eb5a8', accent2:'#1eb5a8', accent3:'#5dd8cc', grad:'linear-gradient(135deg,#1eb5a8,#1eb5a8)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)' },
    'slate':    { bg:'#0f1117', s1:'#171921', s2:'#1f2230', s3:'#262940', bd:'#2e3248', bd2:'#3c4060', t1:'#e8eaf2', t2:'#8890b0', t3:'#505570', accent:'#5b8def', accent2:'#93b4f5', accent3:'#bdd0fa', grad:'linear-gradient(135deg,#5b8def,#93b4f5)', grad2:'linear-gradient(90deg,#5b8def,#bdd0fa)' },
    'obsidian': { bg:'#0c0f0e', s1:'#141918', s2:'#1a2120', s3:'#202928', bd:'#283030', bd2:'#344040', t1:'#e0eeea', t2:'#7aa090', t3:'#446055', accent:'#2dd4a0', accent2:'#5ee8be', accent3:'#99f0d8', grad:'linear-gradient(135deg,#2dd4a0,#5ee8be)', grad2:'linear-gradient(90deg,#2dd4a0,#99f0d8)' },
    'paper':    { bg:'#f9f9f7', s1:'#ffffff', s2:'#f2f2ee', s3:'#ebebе5', bd:'#ddddd5', bd2:'#cacabe', t1:'#1a1a18', t2:'#555550', t3:'#999990', accent:'#2563eb', accent2:'#3b82f6', accent3:'#60a5fa', grad:'linear-gradient(135deg,#1a1a18,#2563eb)', grad2:'linear-gradient(90deg,#2563eb,#60a5fa)' },
    'linen':    { bg:'#faf8f4', s1:'#ffffff', s2:'#f4f0e8', s3:'#ede8dc', bd:'#ddd8cc', bd2:'#ccc4b4', t1:'#2a2218', t2:'#6a5e4e', t3:'#9a9080', accent:'#b45309', accent2:'#d97706', accent3:'#f59e0b', grad:'linear-gradient(135deg,#b45309,#d97706)', grad2:'linear-gradient(90deg,#b45309,#f59e0b)' },
    'ash':      { bg:'#f5f4f2', s1:'#ffffff', s2:'#eeecea', s3:'#e5e3e0', bd:'#d5d3d0', bd2:'#c5c3be', t1:'#1e1c1a', t2:'#5a5856', t3:'#908e8a', accent:'#374151', accent2:'#6b7280', accent3:'#9ca3af', grad:'linear-gradient(135deg,#374151,#6b7280)', grad2:'linear-gradient(90deg,#374151,#9ca3af)' },
  };
  const t = themes[id]; if (!t) return;
  const root = document.documentElement;
  Object.entries(t).forEach(([k,v]) => root.style.setProperty('--'+k, v));
  localStorage.setItem('crm-theme', id);
  render();
  showToast(`🎨 ธีม ${id}`);
}

// โหลดธีมที่บันทึกไว้
(function() {
  const saved = localStorage.getItem('crm-theme') || 'dompet';
  if (saved) applyTheme(saved);
})();

