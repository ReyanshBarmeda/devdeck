const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/  \| 'os-provisioning'\n/, '');
fs.writeFileSync('src/types.ts', code);
console.log("Types patched successfully");
