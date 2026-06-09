// ── CRM Operations — firestore.js (ES Module) ──
// Firebase auth, Firestore sync, overrides
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp, getDoc, getDocs }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as fbSignOut }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAlqJTgkGq4WT5_XrGsIrLdg3-5CgQbgQQ",
  authDomain: "crm-operation-sandbox.firebaseapp.com",
  projectId: "crm-operation-sandbox",
  storageBucket: "crm-operation-sandbox.firebasestorage.app",
  messagingSenderId: "108727951578",
  appId: "1:108727951578:web:77260488688cc29ad145e3",
  measurementId: "G-TXMZGN1HTR"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ── AUTH STATE ────────────────────────────────────────────────
// _currentUser, _currentRole, _currentEmail declared at top of script
_currentUser  = null;
_currentRole  = null;
_currentEmail = null;

const ROLE_ICONS = { 'Super Admin':'👑', 'Admin':'💼', 'Specialist':'⚡' };
const SPECIALIST_PAGES = new Set(['head-dashboard','head-tickets','head-clients','head-settings']);

function applyRoleUI() {
  const icon = ROLE_ICONS[_currentRole] || '👤';
  const name = _currentUser?.displayName || _currentEmail || 'User';
  const initial = name.charAt(0).toUpperCase();

  // Sidebar user
  document.getElementById('sb-av').textContent = initial;
  document.getElementById('sb-username').textContent = name;
  document.getElementById('sb-userrole').textContent = `${icon} ${_currentRole}`;

  // Topbar chip
  document.getElementById('topbar-role').textContent = `${icon} ${_currentRole}`;

  // Hide Personnel menu for Specialist
  const navPersonnel = document.getElementById('nav-personnel');
  if (navPersonnel) navPersonnel.style.display = _currentRole === 'Specialist' ? 'none' : '';
  // Hide KPI Dashboard for Specialist
  const navKpi = document.getElementById('nav-kpi');
  if (navKpi) navKpi.style.display = _currentRole === 'Specialist' ? 'none' : '';
}

async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const el = document.getElementById('login-error');
    el.style.display = 'block';
    el.textContent = 'เกิดข้อผิดพลาด: ' + e.message;
  }
}
window.signInWithGoogle = signInWithGoogle;

window.signOut = async function() {
  await fbSignOut(auth);
  _currentUser = null; _currentRole = null; _currentEmail = null;
  window._currentRole = null;
  document.getElementById('login-overlay').style.display = 'flex';
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    document.getElementById('login-overlay').style.display = 'flex';
    return;
  }
  // Check domain restriction first — only @m-creation.co allowed
  const email = user.email.toLowerCase();
  if (!email.endsWith('@m-creation.co')) {
    await fbSignOut(auth);
    const el = document.getElementById('login-error');
    el.style.display = 'block';
    el.textContent = `❌ อนุญาตเฉพาะอีเมล @m-creation.co เท่านั้น (${user.email})`;
    document.getElementById('login-overlay').style.display = 'flex';
    return;
  }
  // Check if email is in allowed users collection
  const userDoc = await getDoc(doc(db, 'users', email));
  if (!userDoc.exists()) {
    await fbSignOut(auth);
    const el = document.getElementById('login-error');
    el.style.display = 'block';
    el.textContent = `❌ บัญชี ${user.email} ไม่ได้รับอนุญาต — กรุณาติดต่อ Admin เพื่อเพิ่มสิทธิ์`;
    document.getElementById('login-overlay').style.display = 'flex';
    return;
  }
  _currentUser  = user;
  _currentEmail = email;
  _currentRole  = userDoc.data().role || 'Specialist';
  window._currentRole = _currentRole; // expose to global scope
  document.getElementById('login-overlay').style.display = 'none';
  applyRoleUI();
  // Re-render now that role is confirmed (Firestore data may already be loaded)
  if (_fbReady.tickets && _fbReady.projects && _fbReady.team) {
    document.getElementById('content').style.opacity = '1';
    render();
  }
});

// ── SYNC: โหลดข้อมูลจาก Firestore realtime ──────────────────
let _fbReady = { tickets: false, projects: false, team: false };

function checkReady() {
  if (_fbReady.tickets && _fbReady.projects && _fbReady.team) {
    // Only render if auth is already resolved (role is set)
    // If not yet, onAuthStateChanged will call render() after setting role
    if (_currentRole) {
      document.getElementById('content').style.opacity = '1';
      render();
    }
  }
}

// TICKETS
onSnapshot(collection(db, 'tickets'), snap => {
  TICKETS.length = 0;
  snap.forEach(d => TICKETS.push({ ...d.data(), _fbId: d.id }));
  TICKETS.sort((a,b) => (b.created||'').localeCompare(a.created||''));
  _fbReady.tickets = true;
  checkReady();
});

// PROJECTS
onSnapshot(collection(db, 'projects'), snap => {
  PROJECTS.length = 0;
  snap.forEach(d => {
    const proj = { ...d.data(), _fbId: d.id };
    // Restore any embedded base64 quote files back into _quoteStore
    if (proj.statusLog) {
      proj.statusLog.forEach(function(log) { restoreQuoteFromLog(log); });
    }
    PROJECTS.push(proj);
  });
  _fbReady.projects = true;
  checkReady();
});

// TEAM
onSnapshot(collection(db, 'team'), snap => {
  if (snap.size > 0) {
    TEAM.length = 0;
    snap.forEach(d => TEAM.push({ ...d.data(), _fbId: d.id }));
  }
  _fbReady.team = true;
  checkReady();
});


// ── OVERRIDE: createTicket → Firestore ──────────────────────
window._origCreateTicket = window.createTicket;
window.createTicket = async function() {
  const client   = document.getElementById('tm-client').value;
  const platform = document.getElementById('tm-platform').value;
  const type     = document.getElementById('tm-type').value;
  if (!client||!platform||!type) { showToast('⚠ กรุณากรอกข้อมูลที่จำเป็น'); return; }
  // Guard: project must be Active
  const proj = PROJECTS.find(p => p.name === client);
  if (proj && proj.status !== 'active') {
    showToast(`⚠ ${client} ไม่ได้อยู่ในสถานะ Active — ไม่สามารถเพิ่ม Ticket ได้`);
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  const newTicket = {
    id: genTicketId(),
    client, platform, type,
    desc:         document.getElementById('tm-desc').value || type,
    priority:     document.getElementById('tm-priority').value,
    status:       'todo',
    specialist:   document.getElementById('tm-specialist').value || null,
    coSpecialist: document.getElementById('tm-cospec')?.value || null,
    deadline:     document.getElementById('tm-deadline').value,
    created:      today,
    statusLog:    [{ date: today, status: 'todo', note: 'สร้าง Ticket ใหม่' }]
  };
  await addDoc(collection(db, 'tickets'), newTicket);
  closeModal('modal-create');
  ['tm-client','tm-platform','tm-type','tm-desc','tm-specialist','tm-cospec'].forEach(id => document.getElementById(id).value='');
  document.getElementById('tm-priority').value = 'm';
  showToast('✓ สร้าง Ticket ใหม่แล้ว');
  // แจ้งเตือนฝากงานถ้ามี coSpecialist ตั้งแต่แรก
  if (newTicket.coSpecialist) {
    pushCoSpecNotif(newTicket.id, newTicket.client, newTicket.platform, newTicket.coSpecialist, null);
  }
};

// ── OVERRIDE: saveDetail → Firestore ────────────────────────
window._origSaveDetail = window.saveDetail;
window.saveDetail = async function(id) {
  const t = TICKETS.find(x=>x.id===id);
  if (!t) return;
  if (!t.statusLog) t.statusLog = [];
  const p = document.querySelector('#pills .active-pill');
  const newStatus = p ? p.dataset.s : t.status;
  const comment   = (document.getElementById('d-comment')?.value || '').trim();
  const FLOW = { todo:['inprog'], inprog:['hold','review'], hold:['inprog'], review:[], done:[], overdue:['review'] };
  if (newStatus !== t.status) {
    if (newStatus === 'done') { showToast('⚠ ไม่สามารถปรับเป็น Done เองได้'); return; }
    const allowed = FLOW[t.status] || [];
    if (!allowed.includes(newStatus)) { showToast(`⚠ ไม่สามารถข้ามสถานะได้`); return; }
  }
  if (newStatus === 'hold' && !comment) { showToast('⚠ กรุณาระบุ Comment เมื่อ On Hold'); return; }
  const today = new Date().toISOString().split('T')[0];
  const today2 = today;
  const oldStatus = t.status;
  if (newStatus !== oldStatus || comment) t.statusLog.push({ date: today, status: newStatus, note: comment || null });
  if (newStatus === 'hold') t._pendingHold = true;
  t.status = newStatus;
  const sp = document.getElementById('d-spec');
  if (sp) t.specialist = sp.value || null;
  const cosp2 = document.getElementById('d-cospec');
  if (cosp2) {
    const prevCS2 = t.coSpecialist || null;
    const newCS2  = cosp2.value || null;
    if (newCS2 !== prevCS2) {
      t.coSpecialist = newCS2;
      if (newCS2) {
        t.statusLog.push({ date: today2, status: t.status, note: '🤝 ฝากงานให้ ' + getMemberDisplay(newCS2) });
        pushCoSpecNotif(t.id, t.client, t.platform, newCS2, prevCS2);
      } else if (prevCS2) {
        t.statusLog.push({ date: today2, status: t.status, note: '🤝 ยกเลิกการฝากงาน (เดิม: ' + getMemberDisplay(prevCS2) + ')' });
      }
    } else {
      t.coSpecialist = newCS2;
    }
  }
  if (newStatus !== oldStatus) pushNotif(t.id, t.client, t.platform, oldStatus, newStatus);
  // Save to Firestore
  if (t._fbId) {
    const { _fbId, ...data } = t;
    await updateDoc(doc(db, 'tickets', _fbId), data);
  }
  closeModal('modal-detail');
  showToast(`✓ อัปเดต #${id} แล้ว`);
  render();
};

// ── OVERRIDE: quickStatus → Firestore ───────────────────────
window._origQuickStatus = window.quickStatus;
window.quickStatus = async function(id, status) {
  const t = TICKETS.find(x=>x.id===id);
  if (!t) return;
  if (!t.statusLog) t.statusLog = [];
  const today = new Date().toISOString().split('T')[0];
  const oldStatus = t.status;
  let finalStatus = status;
  let note = '';
  if (status === 'done' && oldStatus === 'review') note = 'หัวหน้า Approve แล้ว';
  else if (status === 'hold-approved') { note = 'หัวหน้า Approve On Hold'; finalStatus = 'hold'; t._pendingHold = false; }
  t.statusLog.push({ date: today, status: finalStatus, note });
  t.status = finalStatus;
  pushNotif(t.id, t.client, t.platform, oldStatus, finalStatus);
  if (t._fbId) {
    const { _fbId, ...data } = t;
    await updateDoc(doc(db, 'tickets', _fbId), data);
  }
  showToast(`${SI[finalStatus]} #${id} → ${SL[finalStatus]}`);
  render();
};

// ── OVERRIDE: deleteTicket → Firestore ──────────────────────
window._origDeleteTicket = window.deleteTicket;
window.deleteTicket = function(id) {
  showConfirm(`ลบ Ticket #${id}?`, `Ticket #${id} จะถูกลบถาวร`, async () => {
    const t = TICKETS.find(x=>x.id===id);
    if (t?._fbId) await deleteDoc(doc(db, 'tickets', t._fbId));
    closeModal('modal-detail');
    showToast(`🗑 ลบ #${id} แล้ว`);
  });
};

// ── HELPER: save project to Firestore ───────────────────────
function _stripBase64ForFirestore(data) {
  // Firestore limit 1MB — remove base64 blobs, keep only metadata
  if (!data.statusLog) return data;
  return Object.assign({}, data, {
    statusLog: data.statusLog.map(function(log) {
      if (!log.quoteFile) return log;
      var qf = Object.assign({}, log.quoteFile);
      delete qf.base64;       // quote base64
      delete qf.fileBase64;   // cert base64
      return Object.assign({}, log, { quoteFile: qf });
    })
  });
}

async function _saveProject(p) {
  if (!p) return;
  const { _fbId, ...raw } = p;
  const data = _stripBase64ForFirestore(raw);
  if (_fbId) await updateDoc(doc(db, 'projects', _fbId), data);
  else { const ref = await addDoc(collection(db, 'projects'), data); p._fbId = ref.id; }
}

// ── HELPER: save team member to Firestore ───────────────────
async function _saveMember(m) {
  if (!m) return;
  const { _fbId, ...raw } = m;
  // Firestore rejects undefined values — strip them out
  const data = Object.fromEntries(
    Object.entries(raw).filter(([_, v]) => v !== undefined)
  );
  // Ensure nickname is always a string
  if (!data.nickname) data.nickname = '';
  if (_fbId) await updateDoc(doc(db, 'team', _fbId), data);
  else { const ref = await addDoc(collection(db, 'team'), data); m._fbId = ref.id; }
}

// ── OVERRIDE: confirmAddProject → Firestore ─────────────────
window.confirmAddProject = async function() {
  const prevLen = PROJECTS.length;
  // Run all validation + push to PROJECTS via original function
  // Call the local confirmAddProject stored before Firebase loaded
  if (typeof _localConfirmAddProject === 'function') {
    _localConfirmAddProject();
  } else {
    showToast('⚠ ระบบยังโหลดไม่เสร็จ กรุณาลองใหม่');
    return;
  }
  // If project was actually added (length increased), save to Firestore
  if (PROJECTS.length > prevLen) {
    const newProj = PROJECTS[PROJECTS.length - 1];
    try {
      const ref = await addDoc(collection(db, 'projects'), (() => {
        const { _fbId, ...data } = newProj;
        // Strip base64 from quoteFile — Firestore 1MB limit
        if (data.statusLog) {
          data.statusLog = data.statusLog.map(function(log) {
            if (log.quoteFile && log.quoteFile.base64) {
              var qf = Object.assign({}, log.quoteFile);
              delete qf.base64;
              return Object.assign({}, log, { quoteFile: qf });
            }
            return log;
          });
        }
        return data;
      })());
      newProj._fbId = ref.id;
    } catch(e) {
      console.error('Firestore save error:', e);
      showToast('⚠ บันทึกลง Firestore ไม่สำเร็จ — ข้อมูลอยู่ใน local เท่านั้น');
    }
  }
};

// ── OVERRIDE: saveProjContact → Firestore ───────────────────
const _origSaveProjContact = window.saveProjContact;
window.saveProjContact = async function(projIdx) {
  _origSaveProjContact(projIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: saveRoutines → Firestore ──────────────────────
const _origSaveRoutines = window.saveRoutines;
window.saveRoutines = async function(projIdx) {
  _origSaveRoutines(projIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: addRoutine → Firestore ────────────────────────
const _origAddRoutine = window.addRoutine;
window.addRoutine = async function(projIdx) {
  _origAddRoutine(projIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: removeRoutine → Firestore ─────────────────────
const _origRemoveRoutine = window.removeRoutine;
window.removeRoutine = async function(projIdx, routineIdx) {
  _origRemoveRoutine(projIdx, routineIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: toggleRoutine → Firestore ─────────────────────
const _origToggleRoutine = window.toggleRoutine;
window.toggleRoutine = async function(projIdx, routineIdx, checked) {
  _origToggleRoutine(projIdx, routineIdx, checked);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: updateProjDate → Firestore ────────────────────
const _origUpdateProjDate = window.updateProjDate;
window.updateProjDate = async function(i, field, val) {
  _origUpdateProjDate(i, field, val);
  await _saveProject(PROJECTS[i]);
};

// ── OVERRIDE: updateProjOwner → Firestore ───────────────────
const _origUpdateProjOwner = window.updateProjOwner;
window.updateProjOwner = async function(i, val) {
  _origUpdateProjOwner(i, val);
  await _saveProject(PROJECTS[i]);
};

// ── OVERRIDE: confirmStatusChange (Project) → Firestore ─────
const _origConfirmStatusChange = window.confirmStatusChange;
window.confirmStatusChange = async function() {
  _origConfirmStatusChange();
  if (_pendingStatusIdx !== null) await _saveProject(PROJECTS[_pendingStatusIdx]);
};

// ── OVERRIDE: confirmRenew → Firestore ──────────────────────
const _origConfirmRenew = window.confirmRenew;
window.confirmRenew = async function() {
  const i = parseInt(document.getElementById('renew-idx').value);
  _origConfirmRenew();
  // Save the updated project (includes quoteFile in statusLog)
  const proj = PROJECTS[i];
  if (proj) await _saveProject(proj);
};

// ── OVERRIDE: confirmAddAccess → Firestore ──────────────────
const _origConfirmAddAccess = window.confirmAddAccess;
window.confirmAddAccess = async function(projIdx) {
  _origConfirmAddAccess(projIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: removeAccess → Firestore ──────────────────────
const _origRemoveAccess = window.removeAccess;
window.removeAccess = async function(projIdx, accessIdx) {
  _origRemoveAccess(projIdx, accessIdx);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: updateAccessBudget → Firestore ────────────────
const _origUpdateAccessBudget = window.updateAccessBudget;
window.updateAccessBudget = async function(projIdx, accessIdx, val) {
  _origUpdateAccessBudget(projIdx, accessIdx, val);
  await _saveProject(PROJECTS[projIdx]);
};

// ── OVERRIDE: addEmployee → Firestore ───────────────────────
const _origAddEmployee = window.addEmployee;
window.addEmployee = async function() {
  const prevLen = TEAM.length;
  _origAddEmployee();
  if (TEAM.length > prevLen) {
    const newMember = TEAM[TEAM.length-1];
    await _saveMember(newMember);
    // Auto-create users document for login access
    if (newMember.email) {
      const emailKey = newMember.email.toLowerCase().trim();
      const userRole = newMember.role === 'Super Admin' || newMember.role === 'Admin' ? newMember.role : 'Specialist';
      await setDoc(doc(db, 'users', emailKey), { role: userRole, name: newMember.name, nickname: newMember.nickname||'' });
    }
  }
};

// ── OVERRIDE: saveEmployee → Firestore ──────────────────────
const _origSaveEmployee = window.saveEmployee;
window.saveEmployee = async function() {
  _origSaveEmployee();
  // Use edit-emp-name (the edit modal field), not emp-name (add modal field)
  const name = document.getElementById('edit-emp-name')?.value.trim();
  const m = TEAM.find(x=>x.name===name);
  if (m) {
    await _saveMember(m);
    if (m.email) {
      const emailKey = m.email.toLowerCase().trim();
      const userRole = m.role === 'Super Admin' || m.role === 'Admin' ? m.role : 'Specialist';
      await setDoc(doc(db, 'users', emailKey), { role: userRole, name: m.name, nickname: m.nickname||'' });
    }
  }
};

// ── OVERRIDE: deleteProject → Firestore ─────────────────────
const _origDeleteProject = window.deleteProject;
window.deleteProject = async function(i) {
  const p = PROJECTS[i];
  const fbId = p?._fbId;
  _origDeleteProject(i);
  // After confirm callback fires, _deletedProjectId is set
  // Use a small watcher to delete from Firestore once confirmed
  const waitForDelete = setInterval(async () => {
    if (window._deletedProjectId) {
      const id = window._deletedProjectId;
      window._deletedProjectId = null;
      clearInterval(waitForDelete);
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch(e) { console.error('Delete project error:', e); }
    }
  }, 100);
  // Clear watcher after 5s regardless
  setTimeout(() => clearInterval(waitForDelete), 5000);
};

// ── OVERRIDE: removeEmployee/resignEmployee/undoResign → Firestore ──
const _origRemoveEmployee = window.removeEmployee;
window.removeEmployee = async function(i) {
  _origRemoveEmployee(i);
  const m = TEAM[i];
  if (m) await _saveMember(m);
};
const _origResignEmployee = window.resignEmployee;
window.resignEmployee = async function(i) {
  _origResignEmployee(i);
  const m = TEAM[i];
  if (m) await _saveMember(m);
};
const _origUndoResign = window.undoResign;
window.undoResign = async function(i) {
  _origUndoResign(i);
  const m = TEAM[i];
  if (m) await _saveMember(m);
};


// DEV MODE
document.addEventListener('DOMContentLoaded', function() {
  window._currentRole = 'Super Admin'; _currentRole = 'Super Admin';
  document.getElementById('sb-username').textContent = 'Dev Mode';
  document.getElementById('sb-userrole').textContent = '👑 Super Admin';
  document.getElementById('sb-av').textContent = 'D';
  document.getElementById('topbar-role').textContent = '👑 Super Admin';
  // Apply saved theme or default dompet
  if (!localStorage.getItem('crm-theme')) localStorage.setItem('crm-theme','dompet');
  render(); document.getElementById('content').style.opacity = '1';
});

