const fs = require('fs');
const content = fs.readFileSync('001.html', 'utf8');

// Find simulateEmailSync
const simIdx = content.indexOf('simulateEmailSync');
if (simIdx !== -1) {
  console.log('=== simulateEmailSync ===');
  console.log(content.substring(simIdx - 100, simIdx + 2000));
}

// Find importEmailApp
const impIdx = content.indexOf('function importEmailApp');
if (impIdx !== -1) {
  console.log('=== importEmailApp ===');
  console.log(content.substring(impIdx, impIdx + 1500));
}

// Find all functions mentioning sync, modal, refresh, pop
const funcRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^\)]*\)\s*\{/g;
let m;
const funcs = [];
while ((m = funcRegex.exec(content)) !== null) {
  funcs.push(m[1]);
}
console.log('\n--- Functions matching sync/modal/refresh/pop/alert/admin ---');
funcs.filter(f => /sync|refresh|modal|popup|pop|admin|email/i.test(f)).forEach(f => console.log(f));
