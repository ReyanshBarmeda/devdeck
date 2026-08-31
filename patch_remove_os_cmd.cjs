const fs = require('fs');
let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

const navItemRegex = /    \{ id: 'nav-os', title: 'OS Provisioning', subtitle: 'Generate Bootable ISOs', icon: HardDrive, section: 'Navigation', onSelect: \(\) => onNavigate\('os-provisioning'\) \},\n/;

code = code.replace(navItemRegex, '');
fs.writeFileSync('src/components/CommandPalette.tsx', code);
console.log("CommandPalette patched successfully");
