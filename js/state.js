// ── CRM Operations — state.js ──
// Data stores, navigation, render router
// ใช้ var เพื่อให้ ES Module (firestore.js) เข้าถึงได้ผ่าน window

// ── DATA ──────────────────────────────────────────────────────
var TICKETS = [];
var nextId = 1;
var TEAM = [];
var PROJECTS = [];
var confirmCb = null;
var currentPage = 'head-tickets';
var _notifs = [];
var _currentRole = "Super Admin";
var _currentEmail = null;
var _currentUser  = null;

// Generate unique ticket ID
function genTicketId() {
  var maxNum = 0;
  TICKETS.forEach(function(t) {
    var m = (t.id || '').match(/TK-0*(\d+)/);
    if (m) { var n = parseInt(m[1]); if (n > maxNum) maxNum = n; }
  });
  nextId = maxNum + 1;
  return 'TK-' + String(nextId++).padStart(4, '0');
}

function canApprove() {
  return _currentRole === 'Super Admin' || _currentRole === 'Admin';
}

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
var PAGE_TITLES = {
  'head-dashboard':'📊 Dashboard', 'head-tickets':'🎫 All Tickets',
  'head-team':'👥 Personnel', 'head-clients':'🗂️ Project', 'head-report':'📈 Report',
  'head-settings':'⚙️ Settings'
};

function nav(el, page) {
  currentPage = page;
  document.querySelectorAll('.nav').forEach(function(n){ n.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  render();
}

var _routineChecked = false;

function render() {
  var fn = { 'head-dashboard':renderDashboard, 'head-tickets':renderAllTickets, 'head-team':renderTeam, 'head-clients':renderClients, 'head-report':renderReport, 'head-settings':renderSettings }[currentPage];
  document.getElementById('content').innerHTML = fn ? fn() : '<div style="padding:40px;color:var(--t3);text-align:center">🚧 กำลังพัฒนา</div>';
  var ov = TICKETS.filter(function(t){ return t.status==='overdue'; }).length;
  var nb = document.getElementById('nb-overdue');
  if (nb) { nb.textContent = ov; nb.style.display = ov ? '' : 'none'; }
  // Auto-create tickets from routines (once per page load, after data loads)
  if (!_routineChecked && PROJECTS.length > 0 && typeof checkRoutinesAndCreateTickets === 'function') {
    _routineChecked = true;
    checkRoutinesAndCreateTickets();
  }
}

var _localConfirmAddProject = null;
