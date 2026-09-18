const fs = require('fs');
const content = fs.readFileSync('001.html', 'utf8');

console.log('File size:', content.length);

// Find IDs
const idMatches = content.match(/id="([^"]+)"/g) || [];
const uniqueIds = [...new Set(idMatches.map(m => m.replace('id="', '').replace('"', '')))];

console.log('\n--- EMAIL / INBOX / IMPORT IDs ---');
uniqueIds.filter(id => /email|inbox|import/i.test(id)).forEach(id => console.log('ID:', id));

console.log('\n--- REFRESH IDs ---');
uniqueIds.filter(id => /refresh/i.test(id)).forEach(id => console.log('ID:', id));

console.log('\n--- ADMIN IDs ---');
uniqueIds.filter(id => /admin/i.test(id)).forEach(id => console.log('ID:', id));

console.log('\n--- POPUP / MODAL IDs ---');
uniqueIds.filter(id => /modal|popup/i.test(id)).forEach(id => console.log('ID:', id));
