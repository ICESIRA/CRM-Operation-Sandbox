// ── CRM Operations — quotes.js ──
// Quotation file handling
// ── QUOTATION FILE HELPERS ────────────────────────────────────
var _pendingQuoteNew    = null;
var _pendingQuoteStatus = null;
var _pendingQuoteRenew  = null;
var _quoteStore = {};


function isAllowedQuoteFile(file) {
  const ext = (file.name.split('.').pop()||'').toLowerCase();
  return ALLOWED_QUOTE_TYPES.includes(file.type) || ALLOWED_QUOTE_EXTS.includes(ext);
}

function fileIcon(name) {
  const ext = (name.split('.').pop()||'').toLowerCase();
  if (ext === 'pdf') return '📕';
  if (['png','jpg','jpeg','webp'].includes(ext)) return '🖼';
  return '📄';
}
function fmtFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}
function storeFile(file, cb) {
  const key = 'quote_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const reader = new FileReader();
  reader.onload = e => {
    _quoteStore[key] = e.target.result; // keep in memory
    cb(key);
  };
  reader.readAsDataURL(file);
}

// Returns base64 data for a stored file key (for Firestore persistence)
function getQuoteBase64(key) {
  return _quoteStore[key] || null;
}

// Restores a quoteFile's base64 data back into _quoteStore (called when loading from Firestore)
function restoreQuoteFromLog(log) {
  if (log && log.quoteFile && log.quoteFile.dataKey && log.quoteFile.base64) {
    _quoteStore[log.quoteFile.dataKey] = log.quoteFile.base64;
  }
}

// --- Add-client modal ---
function handleQuoteSelectNew(input) {
  const file = input.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); input.value=''; return; }
  storeFile(file, key => {
    _pendingQuoteNew = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreview('ap-quote', _pendingQuoteNew);
  });
}
function handleQuoteDropNew(e) {
  e.preventDefault();
  document.getElementById('ap-quote-dropzone').style.borderColor = 'rgba(30,181,168,.4)';
  const file = e.dataTransfer.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); return; }
  storeFile(file, key => {
    _pendingQuoteNew = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreview('ap-quote', _pendingQuoteNew);
  });
}
function clearQuoteNew() {
  _pendingQuoteNew = null;
  const prev = document.getElementById('ap-quote-preview');
  const zone = document.getElementById('ap-quote-dropzone');
  if (prev) prev.style.display = 'none';
  if (zone) zone.style.display = 'block';
  const inp = document.getElementById('ap-quote-file');
  if (inp) inp.value = '';
}
function previewQuoteNew() {
  if (_pendingQuoteNew) openQuotePreviewModal(_pendingQuoteNew.dataKey, _pendingQuoteNew.name);
}

// --- Status modal ---
function handleQuoteSelectStatus(input) {
  const file = input.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); input.value=''; return; }
  storeFile(file, key => {
    _pendingQuoteStatus = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreview('smodal-quote', _pendingQuoteStatus);
  });
}
function handleQuoteDropStatus(e) {
  e.preventDefault();
  document.getElementById('smodal-quote-dropzone').style.borderColor = 'rgba(30,181,168,.4)';
  const file = e.dataTransfer.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); return; }
  storeFile(file, key => {
    _pendingQuoteStatus = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreview('smodal-quote', _pendingQuoteStatus);
  });
}
function clearQuoteStatus() {
  _pendingQuoteStatus = null;
  const prev = document.getElementById('smodal-quote-preview');
  const zone = document.getElementById('smodal-quote-dropzone');
  if (prev) prev.style.display = 'none';
  if (zone) zone.style.display = 'block';
  const inp = document.getElementById('smodal-quote-file');
  if (inp) inp.value = '';
}
function previewQuoteStatus() {
  if (_pendingQuoteStatus) openQuotePreviewModal(_pendingQuoteStatus.dataKey, _pendingQuoteStatus.name);
}

// --- Shared preview strip ---
function showQuotePreview(prefix, info) {
  const zone = document.getElementById(prefix + '-dropzone');
  const prev = document.getElementById(prefix + '-preview');
  if (zone) zone.style.display = 'none';
  if (prev) {
    prev.style.display = 'flex';
    document.getElementById(prefix + '-icon').textContent = fileIcon(info.name);
    document.getElementById(prefix + '-name').textContent = info.name;
    document.getElementById(prefix + '-size').textContent = info.size;
  }
}

// --- Renew modal quote ---
function handleQuoteSelectRenew(input) {
  const file = input.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); input.value=''; return; }
  storeFile(file, key => {
    _pendingQuoteRenew = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreviewRenew(_pendingQuoteRenew);
  });
}
function handleQuoteDropRenew(e) {
  e.preventDefault();
  document.getElementById('renew-quote-dropzone').style.borderColor = 'rgba(30,181,168,.35)';
  const file = e.dataTransfer.files[0]; if (!file) return;
  if (!isAllowedQuoteFile(file)) { showToast('⚠ รองรับเฉพาะ PDF, PNG, JPG, JPEG, WEBP เท่านั้น'); return; }
  storeFile(file, key => {
    _pendingQuoteRenew = { name: file.name, size: fmtFileSize(file.size), dataKey: key, base64: _quoteStore[key] };
    showQuotePreviewRenew(_pendingQuoteRenew);
  });
}
function showQuotePreviewRenew(q) {
  document.getElementById('renew-quote-dropzone').style.display = 'none';
  const prev = document.getElementById('renew-quote-preview');
  prev.style.display = '';
  document.getElementById('renew-quote-icon').textContent = fileIcon(q.name);
  document.getElementById('renew-quote-name').textContent = q.name;
  document.getElementById('renew-quote-size').textContent = q.size;
}
function clearQuoteRenew() {
  _pendingQuoteRenew = null;
  document.getElementById('renew-quote-preview').style.display = 'none';
  document.getElementById('renew-quote-dropzone').style.display = '';
  const inp = document.getElementById('renew-quote-file');
  if (inp) inp.value = '';
}
function previewQuoteRenew() {
  if (_pendingQuoteRenew) openQuotePreviewModal(_pendingQuoteRenew.dataKey, _pendingQuoteRenew.name);
}

// --- In-page preview modal ---
function openQuotePreviewModal(key, filename) {
  const data = _quoteStore[key];
  if (!data) { showToast('⚠ ไม่พบไฟล์'); return; }
  const ext = (filename.split('.').pop()||'').toLowerCase();
  let inner = '';
  if (ext === 'pdf') {
    const blob = dataURLtoBlob(data);
    const blobUrl = URL.createObjectURL(blob);
    inner = `<iframe src="${blobUrl}" style="width:100%;height:72vh;border:none;border-radius:8px"></iframe>`;
  } else {
    inner = `<img src="${data}" style="max-width:100%;max-height:70vh;border-radius:8px;display:block;margin:0 auto" />`;
  }

  let ov = document.getElementById('quote-preview-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'quote-preview-overlay';
    ov.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:900;align-items:center;justify-content:center';
    ov.innerHTML = `<div style="background:var(--s1);border:1px solid var(--bd2);border-radius:14px;width:92vw;max-width:860px;padding:20px;position:relative;max-height:92vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div id="qpov-title" style="font-size:13px;font-weight:700;color:var(--t2)"></div>
        <div style="display:flex;gap:8px">
          <button id="qpov-dl" style="background:var(--grad);color:white;border:none;border-radius:7px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sans);display:flex;align-items:center;gap:6px">⬇ ดาวน์โหลด</button>
          <button onclick="document.getElementById('quote-preview-overlay').style.display='none'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:20px;padding:2px">✕</button>
        </div>
      </div>
      <div id="qpov-body"></div>
    </div>`;
    document.body.appendChild(ov);
  }
  const icon = ext === 'pdf' ? '📕' : '🖼';
  document.getElementById('qpov-title').textContent = icon + ' ' + filename;
  document.getElementById('qpov-body').innerHTML = inner;
  document.getElementById('qpov-dl').onclick = () => downloadQuoteFile(key, filename);
  ov.style.display = 'flex';
}

function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

// --- Download any stored file directly to device ---
function downloadQuoteFile(key, filename) {
  const data = _quoteStore[key];
  if (!data) { showToast('⚠ ไม่พบไฟล์ในเซสชันนี้'); return; }
  const blob = dataURLtoBlob(data);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  showToast(`⬇ กำลังดาวน์โหลด ${filename}`);
}

// Keep viewQuoteFile as alias for backward compatibility (status log buttons)
function viewQuoteFile(key, filename) { downloadQuoteFile(key, filename); }

