const fs = require('fs');
let code = fs.readFileSync('.github/workflows/desktop.yml', 'utf8');
code = code.replace("run: npm run build", "env:\n          BUILD_TARGET: desktop\n        run: npm run build");
fs.writeFileSync('.github/workflows/desktop.yml', code);
