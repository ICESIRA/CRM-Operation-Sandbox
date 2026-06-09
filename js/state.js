// ── CRM Operations — state.js ──
// Data stores, navigation, render router
// ── DATA ──────────────────────────────────────────────────────
const TICKETS = [];
let nextId = 1;

// Generate unique ticket ID — sync from Firestore on load, fallback to timestamp
function genTicketId() {
  // Find max existing ID number from loaded tickets
  var maxNum = 0;
  TICKETS.forEach(function(t) {
    var m = (t.id || '').match(/TK-0*(\d+)/);
    if (m) { var n = parseInt(m[1]); if (n > maxNum) maxNum = n; }
  });
  nextId = maxNum + 1;
  return 'TK-' + String(nextId++).padStart(4, '0');
}
let confirmCb = null;
let currentPage = 'head-tickets';
const _notifs = [];
let _currentRole = "Super Admin"; // DEV MODE
let _currentEmail = null; // declared early to avoid ReferenceError
let _currentUser  = null; // declared early to avoid ReferenceError

function canApprove() {
  return _currentRole === 'Super Admin' || _currentRole === 'Admin';
}

// Can approve a specific ticket (Admin always yes; Specialist only their own)
function canApproveTicket(ticket) {
  if (canApprove()) return true;
  if (_currentRole === 'Specialist') {
    var myName = getCurrentMemberName();
    return myName && ticket && ticket.specialist === myName;
  }
  return false;
}


function getVisibleTickets() {
  if (_currentRole === 'Specialist') {
    var myName = getCurrentMemberName();
    return myName ? TICKETS.filter(function(t){
      return t.specialist === myName || t.coSpecialist === myName;
    }) : [];
  }
  return TICKETS;
}

// ── NAVIGATION ────────────────────────────────────────────────
const PAGE_TITLES = {
  'head-dashboard':'📊 Dashboard', 'head-tickets':'🎫 All Tickets',
  'head-team':'👥 Personnel', 'head-clients':'🗂️ Project', 'head-report':'📈 Report',
  'head-settings':'⚙️ Settings',

};

function nav(el, page) {
  currentPage = page;
  document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  render();
}

function render() {
  const fn = { 'head-dashboard':renderDashboard, 'head-tickets':renderAllTickets, 'head-team':renderTeam, 'head-clients':renderClients, 'head-report':renderReport, 'head-settings':renderSettings }[currentPage];
  document.getElementById('content').innerHTML = fn ? fn() : '<div style="padding:40px;color:var(--t3);text-align:center">🚧 กำลังพัฒนา</div>';
  const ov = TICKETS.filter(t=>t.status==='overdue').length;
  const nb = document.getElementById('nb-overdue');
  if (nb) { nb.textContent = ov; nb.style.display = ov ? '' : 'none'; }
}


// ══════════════════════════════════════════════════════════════

const TEAM = [];

const PROJECTS = [];

var _localConfirmAddProject = confirmAddProject;

