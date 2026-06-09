// ── CRM Operations — config.js ──
// Constants, status maps
// ── CONSTANTS ─────────────────────────────────────────────────
var SL = { todo:'To Do', inprog:'In Progress', hold:'On Hold', review:'Review', done:'Done', overdue:'Overdue' };
var SC = { todo:'s-todo', inprog:'s-inprog', hold:'s-hold', review:'s-review', done:'s-done', overdue:'s-overdue' };
var SI = { todo:'📋', inprog:'⚡', hold:'⏸', review:'👁', done:'✓', overdue:'⚠' };
var PL = { h:'High', m:'Medium', l:'Low' };
var SBG = { todo:'rgba(99,110,114,.2)',inprog:'rgba(108,92,231,.2)',hold:'rgba(124,58,237,.2)',review:'rgba(245,166,35,.2)',done:'rgba(0,184,148,.2)',overdue:'rgba(231,76,60,.2)' };
var SFG = { todo:'#636e72',inprog:'var(--accent)',hold:'#7c3aed',review:'var(--gold)',done:'var(--green)',overdue:'var(--red)' };

var PROJ_STATUS = {
  active:  { label:'Active',  bg:'rgba(0,184,148,.15)',    color:'var(--green)', border:'rgba(0,184,148,.4)',   icon:'✅' },
  pause:   { label:'Pause',   bg:'rgba(245,158,11,.15)',   color:'var(--gold)',  border:'rgba(245,158,11,.4)',  icon:'⏸' },
  loss:    { label:'Loss',    bg:'rgba(231,76,60,.15)',    color:'var(--red)',   border:'rgba(231,76,60,.4)',   icon:'❌' },
  waiting: { label:'Waiting', bg:'rgba(108,92,231,.15)',   color:'var(--accent)',border:'rgba(108,92,231,.4)',  icon:'🕐' },
};

// เก็บข้อมูลตัวอย่างไว้สำหรับ seed ครั้งแรกเท่านั้น (ต้องอยู่หลัง PROJECTS)

var ALLOWED_QUOTE_TYPES = ['application/pdf','image/png','image/jpeg','image/webp'];
var ALLOWED_QUOTE_EXTS  = ['pdf','png','jpg','jpeg','webp'];

