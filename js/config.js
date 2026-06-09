// ══════════════════════════════════════════════════════════════
// CRM Operations — config.js
// Constants, status maps, platform lists, themes, fonts
// ══════════════════════════════════════════════════════════════
const SL = { todo:'To Do', inprog:'In Progress', hold:'On Hold', review:'Review', done:'Done', overdue:'Overdue' };
const SC = { todo:'s-todo', inprog:'s-inprog', hold:'s-hold', review:'s-review', done:'s-done', overdue:'s-overdue' };
const SI = { todo:'📋', inprog:'⚡', hold:'⏸', review:'👁', done:'✓', overdue:'⚠' };
const PL = { h:'High', m:'Medium', l:'Low' };
const SBG = { todo:'rgba(107,125,179,.2)',inprog:'rgba(79,142,247,.2)',hold:'rgba(160,110,232,.2)',review:'rgba(245,166,35,.2)',done:'rgba(46,204,143,.2)',overdue:'rgba(247,95,95,.2)' };
const SFG = { todo:'#8fa0cc',inprog:'var(--accent3)',hold:'#b88cf0',review:'var(--gold)',done:'var(--green)',overdue:'var(--red)' };

const PROJ_STATUS = {
  active:  { label:'Active',  bg:'rgba(16,185,129,.15)',  color:'var(--green)', border:'rgba(16,185,129,.4)',  icon:'✅' },
  pause:   { label:'Pause',   bg:'rgba(245,158,11,.15)',  color:'var(--gold)',  border:'rgba(245,158,11,.4)',  icon:'⏸' },
  loss:    { label:'Loss',    bg:'rgba(239,68,68,.15)',   color:'var(--red)',   border:'rgba(239,68,68,.4)',   icon:'❌' },
  waiting: { label:'Waiting', bg:'rgba(30,181,168,.15)',  color:'#1eb5a8',     border:'rgba(30,181,168,.4)',  icon:'🕐' },
};



const ALL_PLATFORMS = ['Facebook','Instagram','Google','Youtube','TikTok','Shopee','Lazada','Linkedin','Line','CPAS Shopee','CPAS Lazada','CPAS TikTok'];

const PLAT_ICON = {Facebook:'📘',Instagram:'📸',Google:'🔍',Youtube:'▶️',TikTok:'🎵',Shopee:'🛍',Lazada:'🏪',Linkedin:'💼',Line:'💬','CPAS Shopee':'🛍','CPAS Lazada':'🏪','CPAS TikTok':'🎵'};

const PLAT_COLORS = { Facebook:'#1877f2', Instagram:'#e1306c', Google:'#4285f4', Youtube:'#ff0000', TikTok:'#000000', Shopee:'#ee4d2d', Lazada:'#0f146b', Linkedin:'#0a66c2', Line:'#00c300', 'CPAS Shopee':'#ee4d2d', 'CPAS Lazada':'#0f146b', 'CPAS TikTok':'#69c9d0' };

const PIE_COLORS = ['#1eb5a8','#10b981','#f59e0b','#5b8def','#7c3aed','#ef4444','#2dd4a0','#fb923c','#818cf8','#34d399'];

const TICKET_TYPES = [
  'Setup Ads Campaign','Optimize Ads','Create Report','Setup Pixel/CAPI',
  'Creative Review','Landing Page','Content Plan','Other'
];

const ALLOWED_QUOTE_TYPES = ['application/pdf','image/png','image/jpeg','image/webp'];
const ALLOWED_QUOTE_EXTS  = ['pdf','png','jpg','jpeg','webp'];

const THEMES = {
  'dompet':   { bg:'#f0f2f5', s1:'#ffffff', s2:'#f8f9fc', s3:'#eef0f5', bd:'#e2e5ef', bd2:'#d0d4e8', t1:'#1a1d2e', t2:'#5a607a', t3:'#9098b5', accent:'#1eb5a8', accent2:'#20c9bb', accent3:'#5dd8cc', grad:'linear-gradient(135deg,#1eb5a8,#20c9bb)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)' },
  'midnight': { bg:'#0e0e12', s1:'#16161c', s2:'#1e1e26', s3:'#262630', bd:'#2e2e3e', bd2:'#3a3a50', t1:'#f0f0f8', t2:'#9090b0', t3:'#55556a', accent:'#1eb5a8', accent2:'#1eb5a8', accent3:'#5dd8cc', grad:'linear-gradient(135deg,#1eb5a8,#1eb5a8)', grad2:'linear-gradient(90deg,#1eb5a8,#5dd8cc)' },
  'slate':    { bg:'#0f1117', s1:'#171921', s2:'#1f2230', s3:'#262940', bd:'#2e3248', bd2:'#3c4060', t1:'#e8eaf2', t2:'#8890b0', t3:'#505570', accent:'#5b8def', accent2:'#93b4f5', accent3:'#bdd0fa', grad:'linear-gradient(135deg,#5b8def,#93b4f5)', grad2:'linear-gradient(90deg,#5b8def,#bdd0fa)' },
  'obsidian': { bg:'#0c0f0e', s1:'#141918', s2:'#1a2120', s3:'#202928', bd:'#283030', bd2:'#344040', t1:'#e0eeea', t2:'#7aa090', t3:'#446055', accent:'#2dd4a0', accent2:'#5ee8be', accent3:'#99f0d8', grad:'linear-gradient(135deg,#2dd4a0,#5ee8be)', grad2:'linear-gradient(90deg,#2dd4a0,#99f0d8)' },
  'paper':    { bg:'#f9f9f7', s1:'#ffffff', s2:'#f2f2ee', s3:'#ebebe5', bd:'#ddddd5', bd2:'#cacabe', t1:'#1a1a18', t2:'#555550', t3:'#999990', accent:'#2563eb', accent2:'#3b82f6', accent3:'#60a5fa', grad:'linear-gradient(135deg,#1a1a18,#2563eb)', grad2:'linear-gradient(90deg,#2563eb,#60a5fa)' },
  'linen':    { bg:'#faf8f4', s1:'#ffffff', s2:'#f4f0e8', s3:'#ede8dc', bd:'#ddd8cc', bd2:'#ccc4b4', t1:'#2a2218', t2:'#6a5e4e', t3:'#9a9080', accent:'#b45309', accent2:'#d97706', accent3:'#f59e0b', grad:'linear-gradient(135deg,#b45309,#d97706)', grad2:'linear-gradient(90deg,#b45309,#f59e0b)' },
  'ash':      { bg:'#f5f4f2', s1:'#ffffff', s2:'#eeecea', s3:'#e5e3e0', bd:'#d5d3d0', bd2:'#c5c3be', t1:'#1e1c1a', t2:'#5a5856', t3:'#908e8a', accent:'#374151', accent2:'#6b7280', accent3:'#9ca3af', grad:'linear-gradient(135deg,#374151,#6b7280)', grad2:'linear-gradient(90deg,#374151,#9ca3af)' },
};

const FONTS = {
  'sarabun': "'Sarabun', sans-serif",
  'noto':    "'Noto Sans Thai', sans-serif",
  'ibm':     "'IBM Plex Sans', sans-serif",
  'prompt':  "'Prompt', sans-serif",
  'kanit':   "'Kanit', sans-serif",
  'inter':   "'Inter', sans-serif",
};

const FONT_LINKS = {
  'sarabun': 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap',
  'noto':    'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;800&display=swap',
  'ibm':     'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap',
  'prompt':  'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;800&display=swap',
  'kanit':   'https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800&display=swap',
  'inter':   'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
};
