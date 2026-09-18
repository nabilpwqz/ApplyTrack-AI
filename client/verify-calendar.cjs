const fs = require('fs');
const http = require('http');

console.log('=== VERIFYING CALENDAR SECTION UPGRADES & FIXES ===\n');
let errors = 0;

// 1. Verify index.html element IDs
const indexHtml = fs.readFileSync('client/index.html', 'utf8');
const expectedElements = [
  'id="view-calendar"',
  'id="calendarMonthLabel"',
  'onclick="navigateCalendar(-1)"',
  'onclick="jumpToToday()"',
  'onclick="navigateCalendar(1)"',
  'id="calendarViewModeGroup"',
  'id="calendarBtnMonthView"',
  'id="calendarBtnAgendaView"',
  'onclick="setCalendarViewMode(\'month\')"',
  'onclick="setCalendarViewMode(\'agenda\')"',
  'onclick="openAddCalendarEventModal()"',
  'onclick="exportCalendarICS()"',
  'id="btnExportICS"',
  'class="btn-cal-export"',
  'id="calendarFilterBar"',
  'data-calendar-filter="all"',
  'data-calendar-filter="interview"',
  'data-calendar-filter="deadline"',
  'data-calendar-filter="applied"',
  'data-calendar-filter="offer"',
  'id="calCountInterviews"',
  'id="calCountDeadlines"',
  'id="calendarTotalBadge"',
  'id="calendarMonthViewContainer"',
  'id="calendarGrid"',
  'id="calendarAgendaViewContainer"',
  'id="calendarAgendaList"',
  'id="calendarEventsList"',
  'id="calendarUpcomingCountBadge"',
  'id="dayDetailModal"',
  'id="dayDetailModalTitle"',
  'id="dayDetailEventsList"',
  'onclick="closeDayDetailModal()"',
  'id="calendarEventModal"',
  'id="calendarEventModalTitle"',
  'id="calendarEventForm"',
  'onclick="closeAddCalendarEventModal()"'
];

expectedElements.forEach((selector) => {
  if (!indexHtml.includes(selector)) {
    console.error(`❌ FAIL: index.html missing: ${selector}`);
    errors++;
  } else {
    console.log(`✅ PASS: index.html contains: ${selector}`);
  }
});

// 2. Verify calendar.ts exports
const calendarTs = fs.readFileSync('client/src/modules/calendar.ts', 'utf8');
const expectedFunctions = [
  'export function changeCalendarMonth',
  'export function navigateCalendar',
  'export function jumpToToday',
  'export function setCalendarViewMode',
  'export function setCalendarFilter',
  'export function renderCalendar',
  'export function openDayDetailModal',
  'export function closeDayDetailModal',
  'export function openAddCalendarEventModal',
  'export function closeAddCalendarEventModal',
  'export function handleCalendarAppSelect',
  'export function saveCalendarEvent',
  'export function deleteCalendarEvent',
  'export function exportCalendarICS',
  'export function getAllCalendarEvents',
  'export function getCustomCalendarEvents',
  'export function saveCustomCalendarEvents'
];

expectedFunctions.forEach((fn) => {
  if (!calendarTs.includes(fn)) {
    console.error(`❌ FAIL: calendar.ts missing function: ${fn}`);
    errors++;
  } else {
    console.log(`✅ PASS: calendar.ts exports: ${fn}`);
  }
});

// 3. Verify window assignments in main.ts
const mainTs = fs.readFileSync('client/src/main.ts', 'utf8');
const expectedWindowBindings = [
  'navigateCalendar',
  'jumpToToday',
  'setCalendarViewMode',
  'setCalendarFilter',
  'openDayDetailModal',
  'closeDayDetailModal',
  'openAddCalendarEventModal',
  'closeAddCalendarEventModal',
  'handleCalendarAppSelect',
  'saveCalendarEvent',
  'deleteCalendarEvent',
  'exportCalendarICS'
];

expectedWindowBindings.forEach((binding) => {
  if (!mainTs.includes(binding)) {
    console.error(`❌ FAIL: main.ts missing window binding: ${binding}`);
    errors++;
  } else {
    console.log(`✅ PASS: main.ts binds: ${binding}`);
  }
});

// 4. Verify main.css rules
const mainCss = fs.readFileSync('client/src/styles/main.css', 'utf8');
const expectedCssRules = [
  '.calendar-card',
  '.calendar-weekdays',
  '.calendar-day',
  '.is-today',
  '.calendar-event-pill',
  '.calendar-filter-chip',
  '.agenda-date-group',
  '#dayDetailModal .modal-panel',
  'body.dark-mode #dayDetailModal .modal-panel',
  'body.dark-mode #calendarEventModal .modal-panel',
  '.btn-cal-export',
  'body.dark-mode .btn-cal-export',
  'body.dark-mode .btn-outline'
];

expectedCssRules.forEach((rule) => {
  if (!mainCss.includes(rule)) {
    console.error(`❌ FAIL: main.css missing rule: ${rule}`);
    errors++;
  } else {
    console.log(`✅ PASS: main.css includes: ${rule}`);
  }
});

// 5. Test Vite Dev Server availability
const req = http.get('http://localhost:5173/', (res) => {
  if (res.statusCode === 200) {
    console.log(`\n✅ PASS: Vite dev server running and returned HTTP 200`);
  } else {
    console.warn(`\n⚠️ WARN: Vite dev server returned HTTP ${res.statusCode}`);
  }
  finish();
});
req.on('error', (e) => {
  console.error(`\n❌ FAIL: Could not connect to Vite dev server: ${e.message}`);
  errors++;
  finish();
});

function finish() {
  console.log(`\n=== Verification Complete: ${errors} errors ===`);
  process.exit(errors > 0 ? 1 : 0);
}
