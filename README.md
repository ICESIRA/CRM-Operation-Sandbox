# CRM Operations — Modular Architecture

## โครงสร้างไฟล์

```
crm-operations/
├── index.html              ← HTML shell + modals + script imports
├── css/
│   └── styles.css          ← CSS variables + ทุก component styles
├── js/
│   ├── config.js           ← Constants, status maps, themes, fonts
│   ├── helpers.js          ← Date format, badges, masks, utilities
│   ├── state.js            ← Data stores (TICKETS/PROJECTS/TEAM), nav, render router
│   ├── ui.js               ← Modal, toast, confirm, global search
│   ├── dashboard.js        ← Dashboard page rendering
│   ├── tickets.js          ← Ticket list, filters, detail, create
│   ├── team.js             ← Personnel page, certificates, KPI
│   ├── projects.js         ← Client list, status modal, project detail
│   ├── projects-edit.js    ← Add/edit project, renew, access, budget bar
│   ├── report.js           ← Report page
│   ├── workflow.js         ← Workflow page (4 tabs)
│   ├── settings.js         ← Settings page, theme/font apply
│   ├── quotes.js           ← Quotation file upload/preview/download
│   ├── notifications.js    ← Notification sounds, push, quick actions
│   └── firestore.js        ← Firebase auth + Firestore sync (ES Module)
└── README.md
```

## ลำดับการโหลด (Load Order)

Script tags ใน `index.html` เรียงตาม dependency:

1. **config.js** — ค่าคงที่ ไม่ depend อะไร
2. **helpers.js** — ใช้ค่าจาก config.js
3. **state.js** — ประกาศ TICKETS/PROJECTS/TEAM + render router
4. **ui.js** — modal/toast ใช้ PROJECTS จาก state.js
5. **workflow.js** — render page
6. **dashboard.js** — render page
7. **tickets.js** — render page + ticket CRUD
8. **team.js** — render page + employee CRUD
9. **projects.js** — render page + project detail
10. **projects-edit.js** — project add/edit/renew
11. **report.js** — render page
12. **settings.js** — render page + theme/font (มี IIFE auto-load)
13. **quotes.js** — file handling
14. **notifications.js** — sound + notifs
15. **firestore.js** — ES Module, override functions, Firebase sync

## หลักการ

- **ทุกไฟล์ใช้ Global Scope** — ฟังก์ชันและตัวแปรอยู่ใน global เหมือนเดิม
- **firestore.js เป็น ES Module** — ใช้ `import` จาก Firebase SDK
- **ไม่มี build step** — เปิด index.html ตรงได้เลย (ต้อง serve ผ่าน HTTP สำหรับ ES Module)
- **แต่ละไฟล์ 300-500 บรรทัด** — fit ใน Claude context สำหรับแก้ไขทีละไฟล์

## วิธีใช้

```bash
# Serve locally (ต้องใช้ HTTP server สำหรับ ES Module)
npx serve .
# หรือ
python3 -m http.server 8000
```

## วิธีแก้ไข

ส่งเฉพาะไฟล์ที่ต้องแก้ให้ Claude เช่น:
- แก้ Dashboard → ส่ง `js/dashboard.js` + `js/config.js`
- แก้ Ticket flow → ส่ง `js/tickets.js`
- แก้สี/theme → ส่ง `js/settings.js` + `css/styles.css`
- แก้ Firestore → ส่ง `js/firestore.js`
