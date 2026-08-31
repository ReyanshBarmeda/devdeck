const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
code = code.replace(/import \{ OSProvisioningView \} from '\.\/components\/OSProvisioningView';\n?/, '');

// Remove the view rendering
const anchorStart = `            {/* VIEW: CROSS-OS PROVISIONING (ISO / LINUX / WINDOWS / FREEBSD) */}`;
const startIndex = code.indexOf(anchorStart);
if (startIndex !== -1) {
    const endIndex = code.indexOf('</motion.div>\n            )}', startIndex);
    if (endIndex !== -1) {
        code = code.substring(0, startIndex) + code.substring(endIndex + 29); // 29 is the length of '</motion.div>\n            )}\n'
        fs.writeFileSync('src/App.tsx', code);
        console.log("App.tsx patched successfully");
    } else {
        console.log("End index not found");
    }
} else {
    console.log("Anchor not found in App.tsx");
}
