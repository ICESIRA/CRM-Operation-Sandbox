// ── CRM Operations — config.js ──
// Constants, status maps
// ── CONSTANTS ─────────────────────────────────────────────────
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

// เก็บข้อมูลตัวอย่างไว้สำหรับ seed ครั้งแรกเท่านั้น (ต้องอยู่หลัง PROJECTS)

const ALLOWED_QUOTE_TYPES = ['application/pdf','image/png','image/jpeg','image/webp'];
const ALLOWED_QUOTE_EXTS  = ['pdf','png','jpg','jpeg','webp'];

