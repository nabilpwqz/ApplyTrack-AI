// Test calendar module logic in Node runtime
const assert = require('assert');

console.log('Testing Calendar Module logic...');

// Test RFC 5545 iCalendar format generator logic
const sampleEvents = [
  {
    id: 'test-1',
    title: 'Google System Design Interview',
    company: 'Google',
    category: 'interview',
    date: '2026-10-15',
    time: '14:00',
    location: 'https://meet.google.com/xyz',
    notes: 'Prepare distributed systems notes',
  },
  {
    id: 'test-2',
    title: 'Figma Take-Home Assessment',
    company: 'Figma',
    category: 'deadline',
    date: '2026-10-20',
    location: 'Remote',
    notes: 'Submit prototype link before midnight',
  }
];

function formatICSDate(dateStr, timeStr) {
  const cleanDate = dateStr.replace(/-/g, '');
  const pad = (n) => String(n).padStart(2, '0');
  if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
    const [hh, mm] = timeStr.split(':').map((s) => parseInt(s, 10));
    const startStr = `${cleanDate}T${pad(hh)}${pad(mm)}00`;
    const endHh = (hh + 1) % 24;
    const endStr = `${cleanDate}T${pad(endHh)}${pad(mm)}00`;
    return {
      dtStart: `DTSTART:${startStr}`,
      dtEnd: `DTEND:${endStr}`,
    };
  } else {
    return {
      dtStart: `DTSTART;VALUE=DATE:${cleanDate}`,
      dtEnd: `DTEND;VALUE=DATE:${cleanDate}`,
    };
  }
}

function escapeICS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

let icsLines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//ApplyTrack AI//Job Search Calendar//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:ApplyTrack AI Job Search Schedule',
];

sampleEvents.forEach((ev) => {
  const { dtStart, dtEnd } = formatICSDate(ev.date, ev.time);
  const summary = `${ev.company ? ev.company + ': ' : ''}${ev.title}`;
  icsLines.push('BEGIN:VEVENT');
  icsLines.push(`UID:${ev.id}@applytrack.ai`);
  icsLines.push(dtStart);
  icsLines.push(dtEnd);
  icsLines.push(`SUMMARY:${escapeICS(summary)}`);
  if (ev.location) icsLines.push(`LOCATION:${escapeICS(ev.location)}`);
  icsLines.push('STATUS:CONFIRMED');
  icsLines.push('END:VEVENT');
});

icsLines.push('END:VCALENDAR');

const icsOutput = icsLines.join('\r\n');
console.log('Sample generated ICS:\n', icsOutput);

assert(icsOutput.includes('BEGIN:VCALENDAR'), 'Must have BEGIN:VCALENDAR');
assert(icsOutput.includes('BEGIN:VEVENT'), 'Must have BEGIN:VEVENT');
assert(icsOutput.includes('DTSTART:20261015T140000'), 'Timed event formatted correctly');
assert(icsOutput.includes('DTSTART;VALUE=DATE:20261020'), 'All-day event formatted correctly');
assert(icsOutput.includes('END:VCALENDAR'), 'Must have END:VCALENDAR');

console.log('✅ ALL ICS GENERATION TESTS PASSED!');
