const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

delete pkg.main;

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("package.json cleaned further");
