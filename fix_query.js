const fs = require('fs');
const file = 'rydex/src/app/api/notifications/get/route.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('let query = { user: userId };', 'let query: any = { user: userId };');
fs.writeFileSync(file, content);
