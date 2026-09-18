const fs = require('fs');
const content = fs.readFileSync('001.html', 'utf8');

// Find view-email-import in HTML
const idx = content.indexOf('id="view-email-import"');
if (idx !== -1) {
  console.log('=== view-email-import HTML ===');
  console.log(content.substring(idx - 100, idx + 2500));
}

// Find JS functions related to email import
const jsMatch = content.match(/function\s+(renderEmail|importEmail|dismissEmail)[^\{]+\{[\s\S]*?\n\s*\}/g);
if (jsMatch) {
  console.log('=== JS functions for email import ===');
  jsMatch.forEach(fn => console.log(fn));
}

// Search for "refresh" in the JS part
const scriptStart = content.lastIndexOf('<script');
const scriptContent = content.substring(scriptStart);
const refreshMatches = scriptContent.match(/.{0,100}refresh.{0,100}/gi);
console.log('=== Refresh in script ===', refreshMatches?.length);
refreshMatches?.slice(0, 10).forEach(m => console.log(m.trim()));
