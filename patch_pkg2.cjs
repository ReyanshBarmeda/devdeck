const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.author = "DevDeck";
pkg.description = "DevDeck OS";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Patched author and description");
